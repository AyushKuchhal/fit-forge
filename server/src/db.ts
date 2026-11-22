import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.resolve(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'fitforge.db');
const db = new Database(dbPath);

// Initialize All Tables
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  name TEXT,
  age INTEGER,
  gender TEXT,
  height_cm REAL,
  weight_kg REAL,
  target_weight_kg REAL,
  goal TEXT,
  activity_level TEXT,
  daily_calories INTEGER,
  saved_plan_id TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS weight_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  weight_kg REAL NOT NULL,
  chest_cm REAL,
  waist_cm REAL,
  arms_cm REAL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  default_sets INTEGER DEFAULT 3,
  default_reps TEXT DEFAULT '8-12',
  rest_seconds INTEGER DEFAULT 90,
  form_tip TEXT
);

CREATE TABLE IF NOT EXISTS workout_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  goal TEXT NOT NULL,
  level TEXT NOT NULL,
  split TEXT NOT NULL,
  description TEXT,
  days_count INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS plan_days (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  day_name TEXT NOT NULL,
  focus TEXT NOT NULL,
  is_rest INTEGER DEFAULT 0,
  FOREIGN KEY (plan_id) REFERENCES workout_plans(id)
);

CREATE TABLE IF NOT EXISTS plan_day_exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_id INTEGER NOT NULL,
  exercise_name TEXT NOT NULL,
  muscle_group TEXT,
  sets INTEGER NOT NULL,
  reps TEXT NOT NULL,
  rest TEXT NOT NULL,
  tip TEXT,
  FOREIGN KEY (day_id) REFERENCES plan_days(id)
);

CREATE TABLE IF NOT EXISTS workout_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT DEFAULT 'guest',
  plan_id TEXT,
  day_number INTEGER NOT NULL,
  day_name TEXT,
  completed_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meal_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT DEFAULT 'guest',
  date TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  food_name TEXT NOT NULL,
  quantity REAL NOT NULL,
  serving_unit TEXT,
  calories REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL,
  fiber REAL NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
`);

export default db;
