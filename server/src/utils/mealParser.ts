import fs from 'fs';
import path from 'path';

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  serving_unit: string;
  category: string;
}

const foodsFilePath = path.resolve(__dirname, '..', '..', 'data', 'foods.json');
let foodsDatabase: FoodItem[] = [];

try {
  if (fs.existsSync(foodsFilePath)) {
    foodsDatabase = JSON.parse(fs.readFileSync(foodsFilePath, 'utf-8'));
  }
} catch (e) {
  console.error('Failed to load foods database:', e);
}

export function getAllFoods(): FoodItem[] {
  return foodsDatabase;
}

export interface ParsedMealItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

/**
 * Intelligent parser that extracts quantity and matches foods against database
 */
export async function parseMealText(text: string): Promise<ParsedMealItem[]> {
  // Robust heuristic parser: split text by commas, 'and', '+', or newlines
  const segments = text
    .split(/,|\band\b|\+|\n/gi)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const results: ParsedMealItem[] = [];

  for (const seg of segments) {
    // Extract number / multiplier (e.g. "2 rotis", "100g paneer", "1.5 scoop whey", "1 cup chai")
    const matchQty = seg.match(/^([\d.]+)\s*(g|grams|gm|kg|katori|bowl|cups?|scoops?|slices?|pieces?|rotis?|eggs?)?\s*(.*)$/i);

    let qty = 1;
    let unit = 'serving';
    let foodQuery = seg;

    if (matchQty) {
      qty = parseFloat(matchQty[1]) || 1;
      if (matchQty[2]) {
        unit = matchQty[2].toLowerCase();
      }
      foodQuery = matchQty[3] || seg;
    }

    foodQuery = foodQuery
      .replace(/^(of|bowl of|katori of|cup of|plate of|scoop of)\s+/i, '')
      .trim()
      .toLowerCase();

    // Find best match in foods database
    let bestFood: FoodItem | null = null;
    let highestScore = 0;

    for (const food of foodsDatabase) {
      const target = food.name.toLowerCase();
      // exact match
      if (target.includes(foodQuery) || foodQuery.includes(target.split(' ')[0])) {
        const score = foodQuery.split(' ').filter((w) => target.includes(w)).length;
        if (score > highestScore) {
          highestScore = score;
          bestFood = food;
        }
      }
    }

    if (bestFood) {
      // Calculate multiplier based on unit and serving
      let multiplier = qty;
      if (unit.startsWith('g') || unit === 'gm') {
        // If food serving is per 100g
        if (bestFood.serving_unit.includes('100g')) {
          multiplier = qty / 100;
        } else {
          multiplier = qty / 50;
        }
      }

      results.push({
        name: bestFood.name,
        quantity: qty,
        unit: unit !== 'serving' ? unit : bestFood.serving_unit,
        calories: Math.round(bestFood.calories * multiplier),
        protein: parseFloat((bestFood.protein * multiplier).toFixed(1)),
        carbs: parseFloat((bestFood.carbs * multiplier).toFixed(1)),
        fat: parseFloat((bestFood.fat * multiplier).toFixed(1)),
        fiber: parseFloat((bestFood.fiber * multiplier).toFixed(1)),
      });
    } else {
      // Fallback estimate for unknown foods
      results.push({
        name: seg,
        quantity: qty,
        unit: unit,
        calories: Math.round(150 * qty),
        protein: Math.round(6 * qty),
        carbs: Math.round(20 * qty),
        fat: Math.round(5 * qty),
        fiber: Math.round(2 * qty),
      });
    }
  }

  return results;
}
