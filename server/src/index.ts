import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import db from './db';
import { seedExercisesAndPlans } from './seedData';
import { generatePersonalizedPlan, UserStatsInput } from './utils/fitnessCalculators';
import { getAllFoods, parseMealText } from './utils/mealParser';
import { streamChatResponse } from './utils/aiCoach';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  authMiddleware,
  AuthenticatedRequest,
} from './utils/auth';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Seed Database automatically
try {
  seedExercisesAndPlans();
} catch (e) {
  console.error('Seed error:', e);
}

// Health Check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ----------------- AUTHENTICATION ENDPOINTS -----------------
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: 'Valid email and password (min 6 characters) required' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Account with this email already exists' });
    }

    const userId = 'usr_' + Date.now() + Math.random().toString(36).substring(2, 7);
    const passwordHash = hashPassword(password);

    db.prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)').run(userId, email.toLowerCase(), passwordHash);

    const token = generateToken({ userId, email: email.toLowerCase(), isGuest: false });
    return res.json({
      success: true,
      token,
      user: { id: userId, email: email.toLowerCase(), isGuest: false },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email) as any;
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({ userId: user.id, email: user.email, isGuest: false });
    return res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, isGuest: false },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/guest', (_req, res) => {
  const token = generateToken({ userId: 'guest', email: 'guest@fitforge.local', isGuest: true });
  return res.json({
    success: true,
    token,
    user: { id: 'guest', email: 'Guest User', isGuest: true },
  });
});

app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res) => {
  return res.json({ success: true, user: req.user });
});

// ----------------- PROGRESS TRACKER ENDPOINTS -----------------
app.get('/api/progress/logs', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId || 'guest';
    const logs = db
      .prepare('SELECT * FROM weight_logs WHERE user_id = ? ORDER BY date ASC')
      .all(userId);
    res.json({ success: true, logs });
  } catch (error: any) {
    console.error('Fetch weight logs error:', error);
    res.status(500).json({ error: 'Failed to fetch progress logs' });
  }
});

app.post('/api/progress/log', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId || 'guest';
    const {
      date = new Date().toISOString().split('T')[0],
      weightKg,
      chestCm = null,
      waistCm = null,
      armsCm = null,
      notes = '',
    } = req.body;

    if (!weightKg || weightKg < 20 || weightKg > 350) {
      return res.status(400).json({ error: 'Valid weight in kg is required' });
    }

    const info = db
      .prepare(
        `INSERT INTO weight_logs (user_id, date, weight_kg, chest_cm, waist_cm, arms_cm, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(userId, date, weightKg, chestCm, waistCm, armsCm, notes);

    res.json({ success: true, id: info.lastInsertRowid, message: 'Weight logged successfully' });
  } catch (error: any) {
    console.error('Log weight error:', error);
    res.status(500).json({ error: 'Failed to record progress log' });
  }
});

app.delete('/api/progress/log/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || 'guest';
    if (typeof id !== 'string') return res.status(400).json({ error: 'Log ID is required' });
    db.prepare('DELETE FROM weight_logs WHERE id = ? AND user_id = ?').run(id, userId);
    res.json({ success: true, message: 'Log deleted' });
  } catch (error: any) {
    console.error('Delete progress log error:', error);
    res.status(500).json({ error: 'Failed to delete log' });
  }
});

// ----------------- PLAN GENERATOR ENDPOINT -----------------
app.post('/api/generate-plan', (req, res) => {
  try {
    const input: UserStatsInput = req.body;

    if (!input.age || input.age < 12 || input.age > 100) {
      return res.status(400).json({ error: 'Valid age between 12 and 100 is required' });
    }
    if (!input.heightCm || input.heightCm < 100 || input.heightCm > 250) {
      return res.status(400).json({ error: 'Valid height between 100cm and 250cm is required' });
    }
    if (!input.weightKg || input.weightKg < 30 || input.weightKg > 300) {
      return res.status(400).json({ error: 'Valid weight between 30kg and 300kg is required' });
    }

    const plan = generatePersonalizedPlan(input);
    return res.json({ success: true, plan });
  } catch (error: any) {
    console.error('Plan generation error:', error);
    return res.status(500).json({ error: 'Failed to generate fitness plan' });
  }
});

// ----------------- EXERCISE LIBRARY ENDPOINT -----------------
app.get('/api/exercises', (req, res) => {
  try {
    const { muscle, equipment, difficulty, search } = req.query;

    let query = 'SELECT * FROM exercises WHERE 1=1';
    const params: any[] = [];

    if (muscle && muscle !== 'all') {
      query += ' AND LOWER(muscle_group) = LOWER(?)';
      params.push(muscle);
    }
    if (equipment && equipment !== 'all') {
      query += ' AND LOWER(equipment) = LOWER(?)';
      params.push(equipment);
    }
    if (difficulty && difficulty !== 'all') {
      query += ' AND LOWER(difficulty) = LOWER(?)';
      params.push(difficulty);
    }
    if (search && typeof search === 'string' && search.trim().length > 0) {
      query += ' AND (LOWER(name) LIKE ? OR LOWER(form_tip) LIKE ?)';
      const term = `%${search.toLowerCase().trim()}%`;
      params.push(term, term);
    }

    query += ' ORDER BY name ASC';
    const exercises = db.prepare(query).all(...params);
    res.json({ success: true, count: exercises.length, exercises });
  } catch (error: any) {
    console.error('Fetch exercises error:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// ----------------- WORKOUT PLANS ENDPOINTS -----------------
app.get('/api/plans', (req, res) => {
  try {
    const { goal, level, split } = req.query;

    let query = 'SELECT * FROM workout_plans WHERE 1=1';
    const params: any[] = [];

    if (goal && goal !== 'all') {
      query += ' AND goal = ?';
      params.push(goal);
    }
    if (level && level !== 'all') {
      query += ' AND level = ?';
      params.push(level);
    }
    if (split && split !== 'all') {
      query += ' AND split = ?';
      params.push(split);
    }

    const plans = db.prepare(query).all(...params);
    res.json({ success: true, plans });
  } catch (error: any) {
    console.error('Fetch plans error:', error);
    res.status(500).json({ error: 'Failed to fetch workout plans' });
  }
});

app.get('/api/plans/:id', (req, res) => {
  try {
    const { id } = req.params;
    const plan = db.prepare('SELECT * FROM workout_plans WHERE id = ?').get(id) as any;
    if (!plan) {
      return res.status(404).json({ error: 'Workout plan not found' });
    }

    const days = db.prepare('SELECT * FROM plan_days WHERE plan_id = ? ORDER BY day_number ASC').all(id) as any[];

    for (const day of days) {
      day.exercises = db.prepare('SELECT * FROM plan_day_exercises WHERE day_id = ? ORDER BY id ASC').all(day.id);
    }

    plan.days = days;
    res.json({ success: true, plan });
  } catch (error: any) {
    console.error('Fetch plan detail error:', error);
    res.status(500).json({ error: 'Failed to fetch plan detail' });
  }
});

// ----------------- WORKOUT COMPLETION TRACKING -----------------
app.get('/api/workouts/completed', (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'guest';
    const completions = db
      .prepare('SELECT * FROM workout_completions WHERE user_id = ? ORDER BY completed_date DESC')
      .all(userId);
    res.json({ success: true, completions });
  } catch (error: any) {
    console.error('Fetch completions error:', error);
    res.status(500).json({ error: 'Failed to fetch completed workouts' });
  }
});

app.post('/api/workouts/complete', (req, res) => {
  try {
    const { userId = 'guest', planId, dayNumber, dayName, completedDate } = req.body;
    const date = completedDate || new Date().toISOString().split('T')[0];

    const existing = db
      .prepare(
        'SELECT id FROM workout_completions WHERE user_id = ? AND plan_id = ? AND day_number = ? AND completed_date = ?'
      )
      .get(userId, planId, dayNumber, date);

    if (existing) {
      db.prepare('DELETE FROM workout_completions WHERE id = ?').run((existing as any).id);
      return res.json({ success: true, completed: false, message: 'Marked uncompleted' });
    } else {
      db.prepare(
        'INSERT INTO workout_completions (user_id, plan_id, day_number, day_name, completed_date) VALUES (?, ?, ?, ?, ?)'
      ).run(userId, planId, dayNumber, dayName, date);
      return res.json({ success: true, completed: true, message: 'Workout marked completed!' });
    }
  } catch (error: any) {
    console.error('Toggle completion error:', error);
    res.status(500).json({ error: 'Failed to record workout completion' });
  }
});

// ----------------- FOODS & NUTRITION ENDPOINTS -----------------
app.get('/api/foods', (req, res) => {
  try {
    const { search, category } = req.query;
    let foods = getAllFoods();

    if (category && category !== 'all') {
      foods = foods.filter((f) => f.category.toLowerCase() === (category as string).toLowerCase());
    }
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase().trim();
      foods = foods.filter((f) => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
    }

    res.json({ success: true, count: foods.length, foods });
  } catch (error: any) {
    console.error('Fetch foods error:', error);
    res.status(500).json({ error: 'Failed to fetch foods' });
  }
});

app.get('/api/meals/today', (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'guest';
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const logs = db
      .prepare('SELECT * FROM meal_logs WHERE user_id = ? AND date = ? ORDER BY id ASC')
      .all(userId, date) as any[];

    const grouped: Record<string, any[]> = {
      breakfast: [],
      lunch: [],
      snacks: [],
      dinner: [],
    };

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;

    for (const log of logs) {
      if (!grouped[log.meal_type]) grouped[log.meal_type] = [];
      grouped[log.meal_type].push(log);

      totalCalories += log.calories;
      totalProtein += log.protein;
      totalCarbs += log.carbs;
      totalFat += log.fat;
      totalFiber += log.fiber;
    }

    res.json({
      success: true,
      date,
      meals: grouped,
      totals: {
        calories: Math.round(totalCalories),
        protein: parseFloat(totalProtein.toFixed(1)),
        carbs: parseFloat(totalCarbs.toFixed(1)),
        fat: parseFloat(totalFat.toFixed(1)),
        fiber: parseFloat(totalFiber.toFixed(1)),
      },
    });
  } catch (error: any) {
    console.error('Fetch meals error:', error);
    res.status(500).json({ error: 'Failed to fetch meal logs' });
  }
});

app.post('/api/meals/add', (req, res) => {
  try {
    const {
      userId = 'guest',
      date = new Date().toISOString().split('T')[0],
      mealType,
      foodName,
      quantity = 1,
      servingUnit = 'serving',
      calories,
      protein,
      carbs,
      fat,
      fiber = 0,
    } = req.body;

    if (!mealType || !foodName) {
      return res.status(400).json({ error: 'mealType and foodName are required' });
    }

    const info = db
      .prepare(
        `INSERT INTO meal_logs (user_id, date, meal_type, food_name, quantity, serving_unit, calories, protein, carbs, fat, fiber)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(userId, date, mealType, foodName, quantity, servingUnit, calories, protein, carbs, fat, fiber);

    res.json({ success: true, id: info.lastInsertRowid, message: 'Food added to meal log' });
  } catch (error: any) {
    console.error('Add meal error:', error);
    res.status(500).json({ error: 'Failed to log food' });
  }
});

app.delete('/api/meals/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM meal_logs WHERE id = ?').run(id);
    res.json({ success: true, message: 'Meal item deleted' });
  } catch (error: any) {
    console.error('Delete meal error:', error);
    res.status(500).json({ error: 'Failed to delete meal item' });
  }
});

app.post('/api/ai/parse-meal', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Meal text is required' });
    }

    const items = await parseMealText(text);

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;

    for (const it of items) {
      totalCalories += it.calories;
      totalProtein += it.protein;
      totalCarbs += it.carbs;
      totalFat += it.fat;
      totalFiber += it.fiber;
    }

    res.json({
      success: true,
      items,
      totals: {
        calories: Math.round(totalCalories),
        protein: parseFloat(totalProtein.toFixed(1)),
        carbs: parseFloat(totalCarbs.toFixed(1)),
        fat: parseFloat(totalFat.toFixed(1)),
        fiber: parseFloat(totalFiber.toFixed(1)),
      },
    });
  } catch (error: any) {
    console.error('Parse meal error:', error);
    res.status(500).json({ error: 'Failed to parse meal' });
  }
});

// ----------------- AI CHAT COACH ENDPOINT -----------------
app.post('/api/ai/chat', streamChatResponse);

const clientBuild = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientBuild));
app.get(['/', '/generator', '/plans', '/nutrition', '/progress', '/chat', '/login'], (_req, res) => {
  res.sendFile(path.join(clientBuild, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 FitForge Server running on http://localhost:${PORT}`);
});
