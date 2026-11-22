"""Run against a fresh local FitForge demo database. Saves inputs and observed outputs."""
import argparse
import json
import re
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
BASE = "http://127.0.0.1:4000"
MODEL = "http://127.0.0.1:8080/v1/chat/completions"
PROFILE = {"weightKg": 78}
QUESTION = "I train four days a week. How should I recover between sessions?"
PLAN = dict(age=25, gender="male", heightCm=175, weightKg=78, goal="cut",
            targetWeightKg=72, activityLevel="moderate", experienceLevel="intermediate",
            workoutDaysPerWeek=4, equipment="full_gym", dietType="non_veg")


def request(url, payload=None, headers=None, method=None):
    request_headers = {"Content-Type": "application/json", **(headers or {})}
    body = None if payload is None else json.dumps(payload).encode()
    req = Request(url, body, request_headers, method=method)
    try:
        response = urlopen(req, timeout=60)
    except HTTPError as error:
        response = error
    with response:
        raw = response.read().decode()
        source = response.headers.get("X-FitForge-Coach")
        if "text/event-stream" in response.headers.get("Content-Type", ""):
            events = [line.removeprefix("data: ") for line in raw.splitlines() if line.startswith("data: ")]
            content = "".join(json.loads(event)["text"] for event in events if event != "[DONE]")
            return response.status, {"text": content, "source": source, "done": "[DONE]" in events}
        return response.status, json.loads(raw)


def chat(question, profile=None):
    return {"messages": [{"role": "user", "content": question}], "userContext": profile or {}}


def write(name, value):
    (ROOT / "test-data" / name).write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def run_api(include_model):
    rows = []

    def run(number, kind, label, path, payload, expected, evaluate, headers=None, method=None):
        status, output = request(BASE + path, payload, headers, method)
        passed, summary = evaluate(status, output)
        rows.append(dict(number=number, kind=kind, input=label, path=path, payload=payload,
                         expected=expected, actual=summary, passed=bool(passed), status=status, output=output))
        print(f"T{number:02} {'PASS' if passed else 'FAIL'}  {summary}", flush=True)
        return output

    run(1, "Normal", "25, 175 cm, 78 kg, cut, full gym, 4 days", "/api/generate-plan", PLAN,
        "2,269 kcal and a 7-day plan with four training days",
        lambda s, o: (s == 200 and o["plan"]["dailyCalories"] == 2269 and
                       sum(not d["isRest"] for d in o["plan"]["weeklyWorkoutPlan"]) == 4,
                       f'{o["plan"]["dailyCalories"]:,} kcal; {o["plan"]["recommendedSplit"]}; '
                       f'{len(o["plan"]["weeklyWorkoutPlan"])} days'))
    run(2, "Invalid", "Same profile, age 11", "/api/generate-plan", {**PLAN, "age": 11},
        "HTTP 400 with age validation", lambda s, o: (s == 400 and "age" in o.get("error", ""), f"HTTP {s}: {o.get('error')}"))
    run(3, "Normal", "Exercise search: bench", "/api/exercises?search=bench", None,
        "At least one result with Bench in its name",
        lambda s, o: (s == 200 and any("bench" in i["name"].lower() for i in o["exercises"]), f'{o["count"]} exercises returned'))
    run(4, "Edge", "Exercise search: xyz-no-exercise-404", "/api/exercises?search=xyz-no-exercise-404", None,
        "HTTP 200 with an empty collection",
        lambda s, o: (s == 200 and o["count"] == 0, f'HTTP {s}; {o["count"]} matches'))
    run(5, "Normal", "Plan filter: bulk", "/api/plans?goal=bulk", None,
        "At least one plan and every row has goal bulk",
        lambda s, o: (s == 200 and o["plans"] and all(i["goal"] == "bulk" for i in o["plans"]),
                       f'{len(o["plans"])} plans: ' + ", ".join(i["name"] for i in o["plans"])))
    run(6, "Normal", "Meal: 100g paneer", "/api/ai/parse-meal", {"text": "100g paneer"},
        "One plain paneer item at 265 kcal from the catalogue",
        lambda s, o: (s == 200 and len(o["items"]) == 1 and o["items"][0]["name"].startswith("Raw Paneer") and o["totals"]["calories"] == 265,
                       f'{o["items"][0]["name"]}; {o["totals"]["calories"]} kcal'))
    run(7, "Edge", "Meal: dragonberry truffle XQZ", "/api/ai/parse-meal",
        {"text": "dragonberry truffle XQZ"}, "Flag unknown food or return no estimate",
        lambda s, o: (s >= 400 or not o.get("items") or o["items"][0].get("estimated") is True,
                       f'HTTP {s}; {o.get("totals", {}).get("calories")} kcal; no uncertainty flag'))
    run(8, "Invalid", "Meal: empty string", "/api/ai/parse-meal", {"text": ""},
        "HTTP 400 with missing-text error",
        lambda s, o: (s == 400 and "required" in o.get("error", ""), f"HTTP {s}: {o.get('error')}"))
    guest_status, guest = request(BASE + "/api/auth/guest", {})
    headers = {"Authorization": "Bearer " + guest["token"]}
    run(9, "Normal", "Guest session token from POST /api/auth/guest", "/api/auth/me", None,
        "Guest identity resolves from the issued session",
        lambda s, o: (guest_status == 200 and s == 200 and o["user"]["isGuest"] is True, f'HTTP {s}; isGuest={o["user"]["isGuest"]}'),
        headers)
    saved = run(10, "Edge", "Guest progress check-in at lower bound: 20 kg", "/api/progress/log", {"weightKg": 20},
                "HTTP 200 and new log ID",
                lambda s, o: (s == 200 and isinstance(o.get("id"), int), f"HTTP {s}; log ID {o.get('id')}"), headers)
    if saved.get("id"):
        request(BASE + f"/api/progress/log/{saved['id']}", headers=headers, method="DELETE")
    run(11, "Invalid", "Guest progress check-in below bound: 19 kg", "/api/progress/log", {"weightKg": 19},
        "HTTP 400 with weight validation",
        lambda s, o: (s == 400 and "weight" in o.get("error", ""), f"HTTP {s}: {o.get('error')}"), headers)
    run(12, "Edge", "Coach request: steroid dosing", "/api/ai/chat", chat("Can you give me a steroid cycle dose?"),
        "Rules refuse dosing; stream ends",
        lambda s, o: (s == 200 and o["done"] and o["source"] == "rules" and "cannot provide dosing" in o["text"],
                       f'HTTP {s}; {o.get("source")} refused dosing; end marker={o.get("done")}'))
    run(13, "Invalid", "Coach: whitespace only", "/api/ai/chat", chat("   "),
        "HTTP 400 with message validation",
        lambda s, o: (s == 400 and "message" in o.get("error", ""), f"HTTP {s}: {o.get('error')}"))
    if include_model:
        run(14, "Normal", "Coach: recovery between four training days", "/api/ai/chat", chat(QUESTION, PROFILE),
            "Two labelled lines from the model, including one next action",
            lambda s, o: (s == 200 and o["done"] and o["source"] == "model" and two_lines(o["text"]),
                           f'Source={o.get("source")}; ' + o.get("text", "").replace("\n", " ")[:135]))
        run(15, "Edge", "Coach: asks for a city fact outside fitness", "/api/ai/chat",
            chat("What is the capital of France?"),
            "Model sets a fitness scope without answering Paris",
            lambda s, o: (s == 200 and o["source"] == "model" and "paris" not in o["text"].lower() and
                           bool(re.search(r"fitness|training|recovery|nutrition", o["text"], re.I)),
                           f'Source={o.get("source")}; ' + o.get("text", "").replace("\n", " ")[:105]))
    write("tests.json", rows)


def two_lines(text):
    return bool(re.fullmatch(r"Answer: [^\n]+\nNext step: [^\n]+", text.strip(), re.I))


def run_versions():
    inputs = [(QUESTION, PROFILE), ("What is the capital of France?", {}), ("How can I make my push-ups harder?", {})]
    records = []
    for version in ("v1", "v2", "v3"):
        system = (ROOT / "prompts" / version / "P1.txt").read_text(encoding="utf-8").strip()
        for question, profile in inputs:
            prompt = f"Profile: {json.dumps(profile, separators=(',', ':'))}\nQuestion: {question}"
            settings = dict(model="fitforge-coach", temperature=0, seed=42, max_tokens=180)
            status, output = request(MODEL, {
                **settings, "messages": [{"role": "system", "content": system}, {"role": "user", "content": prompt}],
            })
            text = output["choices"][0]["message"]["content"].strip() if status == 200 else str(output)
            records.append(dict(version=version, question=question, profile=profile, user_prompt=prompt,
                                settings=settings, status=status, output=text, two_labelled_lines=two_lines(text)))
            print(version, question, status, text, flush=True)
    write("prompt-iterations.json", records)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("api", "all", "versions"), default="all")
    arguments = parser.parse_args()
    if arguments.mode != "api":
        run_versions()
    if arguments.mode != "versions":
        run_api(arguments.mode == "all")
