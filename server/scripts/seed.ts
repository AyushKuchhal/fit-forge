// scripts/seed.ts
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.resolve(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// SQLite DB file
const dbPath = path.join(dataDir, 'fitforge.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_guest INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  muscle_group TEXT,
  equipment TEXT,
  difficulty TEXT,
  sets INTEGER,
  reps INTEGER,
  rest_seconds INTEGER,
  tip TEXT
);

CREATE TABLE IF NOT EXISTS foods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  calories REAL,
  protein REAL,
  carbs REAL,
  fat REAL,
  fiber REAL,
  cuisine TEXT
);

CREATE TABLE IF NOT EXISTS workout_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- bulk|cut|maintain
  level TEXT NOT NULL, -- beginner|intermediate|advanced
  split TEXT NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS plan_days (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL,
  FOREIGN KEY (plan_id) REFERENCES workout_plans(id)
);

CREATE TABLE IF NOT EXISTS plan_exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_id INTEGER NOT NULL,
  exercise_id INTEGER NOT NULL,
  sets INTEGER,
  reps INTEGER,
  rest_seconds INTEGER,
  tip TEXT,
  FOREIGN KEY (day_id) REFERENCES plan_days(id),
  FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);
`);

// Simple seed data (add more as needed)
const exercises = [
  {name: 'Bench Press', muscle_group: 'Chest', equipment: 'Barbell', difficulty: 'Beginner', sets: 3, reps: 10, rest_seconds: 90, tip: 'Keep elbows at 45°'},
  {name: 'Squat', muscle_group: 'Legs', equipment: 'Barbell', difficulty: 'Beginner', sets: 3, reps: 12, rest_seconds: 120, tip: 'Maintain neutral spine'},
  {name: 'Deadlift', muscle_group: 'Back', equipment: 'Barbell', difficulty: 'Intermediate', sets: 4, reps: 6, rest_seconds: 180, tip: 'Engage lats before lift'}
];
const insertExercise = db.prepare(`INSERT INTO exercises (name, muscle_group, equipment, difficulty, sets, reps, rest_seconds, tip) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
for (const ex of exercises) {
  insertExercise.run(ex.name, ex.muscle_group, ex.equipment, ex.difficulty, ex.sets, ex.reps, ex.rest_seconds, ex.tip);
}

const foods = [
  {name: 'Roti', calories: 120, protein: 3, carbs: 22, fat: 0.5, fiber: 1, cuisine: 'Indian'},
  {name: 'Dal', calories: 150, protein: 9, carbs: 20, fat: 2, fiber: 5, cuisine: 'Indian'},
  {name: 'Chicken Curry', calories: 250, protein: 20, carbs: 5, fat: 15, fiber: 0, cuisine: 'Indian'},
  {name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4, cuisine: 'Global'}
];
const insertFood = db.prepare(`INSERT INTO foods (name, calories, protein, carbs, fat, fiber, cuisine) VALUES (?, ?, ?, ?, ?, ?, ?)`);
for (const f of foods) {
  insertFood.run(f.name, f.calories, f.protein, f.carbs, f.fat, f.fiber, f.cuisine);
}

console.log('✅ Seed data inserted into', dbPath);
