# 🏋️ FitForge — Full-Stack AI Gym & Fitness Web Application

> **FitForge** is a responsive, mobile-first, dark-themed fitness platform with an energetic accent theme, designed to empower users with evidence-based workout routines, accurate metabolic & macronutrient calculations, Indian & global food logging, body composition progress tracking, and a context-aware AI Gym Coach.

---

## ⚡ Tech Stack

- **Frontend**: React 19 + Vite 8 + Tailwind CSS v4 + React Router v7 + Chart.js & React-Chartjs-2 + Lucide Icons.
- **Backend**: Node.js + Express + TypeScript + `better-sqlite3` + JWT Authentication (`jsonwebtoken`) + Password Hashing (`bcryptjs`).
- **Database**: SQLite (`fitforge.db`) storing users, workout plans, plan days, exercises, meal logs, completions, and progress metrics.
- **AI Coach**: Backend proxy endpoint with Server-Sent Events (SSE) streaming, sliding-window rate limiting (20 req/min), system prompt guardrails (refusing crash diets & steroids, medical disclaimer), and user profile context awareness.
- **Security**: Environment variables isolated via `.env` (keys are never exposed to the frontend). Includes `.env.example`.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+) & npm

### 2. Backend Setup
```bash
cd server
npm install
npm run dev
```
*The server will start on `http://localhost:4000` and automatically seed 37 exercises, 4 pre-built workout plans, and database tables.*

To run unit tests:
```bash
npm test
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
*The Vite client will launch on `http://localhost:5173`.*

---

## 📱 Pages and Features

### 1. Home / Landing Page (`/`)
- Responsive hero section with gradient backdrops and energetic CTA buttons (*"Get My Plan"* and *"Ask the AI Coach"*).
- Key platform stats (150+ Exercises, 9 Workout Splits, 150+ Foods, 24/7 AI Coach).
- Centered 5-feature showcase cards linking to core tools.

### 2. Personalized Plan Generator (`/generator`)
- Input form: age, gender, height (cm), weight (kg), activity level, goal (bulk / cut / maintain), target weight, experience level, workout days per week (3–6), equipment available, and diet type.
- **Algorithms**:
  - BMI with health category classification.
  - Basal Metabolic Rate (BMR) via Mifflin-St Jeor formula.
  - Total Daily Energy Expenditure (TDEE) across 5 activity multipliers.
  - Calorie adjustment (+380 kcal lean bulk, -450 kcal cut) with safety floor ($>1200\text{ kcal}$ female, $>1500\text{ kcal}$ male).
  - Target timeline in weeks to reach goal weight.
- **Interactive Visualizations**:
  - **Doughnut Chart**: Caloric percentage breakdown for Protein, Carbs, and Fats.
  - **Bar Chart**: Training Day vs Rest Day carb/calorie cycling.
- Matched 7-day workout schedule with sets, reps, rest time, and form cues.
- "Save Plan to Profile" button with local & cloud persistence.

### 3. Workout Plans & Exercise Library (`/plans`)
- Pre-built plans for Bulk, Cut, and Maintain across beginner, intermediate, and advanced levels.
- Split types: Push/Pull/Legs (PPL), Upper/Lower, Full Body, and Bro Split.
- Interactive day tabs with complete exercise lists, sets, reps, and form tips.
- **Adherence Tracking**: "Mark as Completed" button on each day with a real-time **Weekly Progress Bar** view.
- **Filterable Exercise Library**: Search by keyword, filter by 8 muscle groups, 5 equipment types, and 3 difficulty levels.

### 4. Meal Nutrition Calculator (`/nutrition`)
- **150+ Foods Database**: Complete Indian food staples (Roti, Dal Tadka, Dal Makhani, Paneer, Chicken Curry, Biryani, Idli, Dosa, Poha, Sambar, etc.) alongside global fitness staples (Chicken breast, whey, oats, eggs, salmon).
- **Daily Progress Bars**: Consumed vs target calories, protein, carbs, and fats for the day.
- **4 Meal Sections**: Breakfast, Lunch, Snacks, and Dinner with per-item and section macro totals.
- **AI Free-Text Meal Parser**: Type plain descriptions (e.g. *"2 rotis, 1 bowl dal, 100g paneer"*) and click *"Estimate Macros"* to parse and log instantly.

### 5. AI Gym Coach Chatbot (`/chat` + Floating Widget)
- **Floating Widget**: Present on every page in the bottom-right corner with quick prompt chips.
- **Full Chat Page**: Dedicated coaching room showing active user profile stats (Goal, Target Calories, Weight, Routine) so advice is tailored to the user.
- **Streaming Responses**: Progressive word-by-word streaming using Server-Sent Events (SSE).
- **Guardrails**:
  - Refuses crash diets ($<1200\text{ kcal}$) and steroids/SARMs cycle requests.
  - Recommends consulting a doctor for sharp pains or injuries.
  - Exercise swapping (e.g., knee-friendly squat swaps, shoulder-friendly bench swaps).

### 6. Progress Tracker (`/progress`)
- Visual weight trend line chart plotting check-ins over time against the target goal line using Chart.js.
- Body circumference tracking (Chest, Waist, Arms in cm).
- Check-in history table with notes and delete support.

### 7. Authentication & Guest Mode (`/login`)
- Email & password registration and login with bcrypt hashing and JWT.
- **Zero-Friction Guest Mode**: Instant access with persistent localStorage caching.
