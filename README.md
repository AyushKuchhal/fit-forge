# FitForge

FitForge combines a weekly training plan generator, filterable exercise and workout libraries, meal logging, body-measurement tracking, and a gym coach. It is an SCSE4041 Prompt Engineering mini project by **FIT FORGE** (PE-B13-56), led by Ayush Kuchhal with Eklavya Sharma and Dev Tewatia.

## Prerequisites and local run

Use **Node.js 24 LTS or newer** and npm. Install and build both parts from the repository root:

```sh
npm ci --prefix client
npm ci --prefix server
npm run build --prefix client
npm run build --prefix server
npm start --prefix server
```

Open [http://localhost:4000](http://localhost:4000). Continue as a guest to try the app. Use synthetic records for the demo. For separate development processes, run `npm run dev --prefix server` and `npm run dev --prefix client`, then open port 5173.

### Model-backed coach

1. Download the CPU build of [llama.cpp b12631](https://github.com/ggml-org/llama.cpp/releases/tag/b12631) for your system and the `qwen2.5-1.5b-instruct-q4_k_m.gguf` file from [Qwen](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF).
2. Start `llama-server -m qwen2.5-1.5b-instruct-q4_k_m.gguf --alias fitforge-coach -c 2048 -t 4 --host 127.0.0.1 --port 8080` (use `llama-server.exe` on Windows).
3. Copy `server/.env.example` to `server/.env`, replace the example JWT value with your own random secret, and restart FitForge. Start it from the `server` working directory if invoking `node dist/index.js` directly.

The coach uses its built-in rules if the model is unavailable. The nutrition parser uses portion rules and a bundled food catalogue. A single local demo instance shares guest records. The plan generator saves its profile on the current browser.

## Milestone 2 evidence

- [Evaluator prototype notebook](https://colab.research.google.com/github/AyushKuchhal/fit-forge/blob/milestone-2/code/FitForge_Prototype.ipynb)
- [Prompt versions](prompts/), [test evidence](test-data/), [diagrams and report](docs/), and [dated changes](CHANGELOG.md)
- `npm test --prefix server` runs the existing calculation checks. With FitForge and the local model running, `python test-data/run.py` repeats the milestone evaluation. Use `--mode api` for the checks that do not need the model.
