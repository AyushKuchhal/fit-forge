import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Search,
  Plus,
  Trash2,
  Sparkles,
  Flame,
  PieChart,
  CheckCircle2,
  ChevronDown,
  Info,
  Clock,
  ArrowRight,
  Send,
} from 'lucide-react';

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

interface LoggedMealItem {
  id: number;
  meal_type: string;
  food_name: string;
  quantity: number;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export default function NutritionPage() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'snacks' | 'dinner'>('breakfast');

  const [targetMacros, setTargetMacros] = useState({
    calories: 2200,
    protein: 160,
    carbs: 230,
    fat: 65,
  });

  const [mealSections, setMealSections] = useState<Record<string, LoggedMealItem[]>>({
    breakfast: [],
    lunch: [],
    snacks: [],
    dinner: [],
  });

  const [dailyTotals, setDailyTotals] = useState<DailyTotals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  });

  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const [aiMealText, setAiMealText] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  const [aiParsedResult, setAiParsedResult] = useState<any>(null);

  useEffect(() => {
    const savedPlan = localStorage.getItem('fitforge_saved_plan');
    if (savedPlan) {
      try {
        const parsed = JSON.parse(savedPlan);
        if (parsed.dailyCalories && parsed.dailyMacros) {
          setTargetMacros({
            calories: parsed.dailyCalories,
            protein: parsed.dailyMacros.proteinGrams,
            carbs: parsed.dailyMacros.carbsGrams,
            fat: parsed.dailyMacros.fatGrams,
          });
        }
      } catch (e) {}
    }
  }, []);

  const fetchTodayMeals = async () => {
    try {
      const res = await fetch('/api/meals/today');
      const data = await res.json();
      if (data.success) {
        setMealSections(data.meals);
        setDailyTotals(data.totals);
      }
    } catch (err) {
      console.error('Failed to load today meals:', err);
    }
  };

  useEffect(() => {
    fetchTodayMeals();
  }, []);

  useEffect(() => {
    const searchFoods = async () => {
      try {
        let url = '/api/foods';
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.append('search', searchQuery.trim());
        if (selectedCategory !== 'all') params.append('category', selectedCategory);
        if (params.toString()) url += `?${params.toString()}`;

        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setFoods(data.foods);
        }
      } catch (e) {
        console.error('Failed to search foods:', e);
      }
    };
    searchFoods();
  }, [searchQuery, selectedCategory]);

  const handleAddFoodToMeal = async () => {
    if (!selectedFood) return;

    let multiplier = quantityInput;
    if (selectedFood.serving_unit.includes('100g') || selectedFood.serving_unit.includes('100ml')) {
      multiplier = quantityInput / 100;
    }

    const payload = {
      mealType: selectedMealType,
      foodName: selectedFood.name,
      quantity: quantityInput,
      servingUnit: selectedFood.serving_unit,
      calories: Math.round(selectedFood.calories * multiplier),
      protein: parseFloat((selectedFood.protein * multiplier).toFixed(1)),
      carbs: parseFloat((selectedFood.carbs * multiplier).toFixed(1)),
      fat: parseFloat((selectedFood.fat * multiplier).toFixed(1)),
      fiber: parseFloat((selectedFood.fiber * multiplier).toFixed(1)),
    };

    try {
      const res = await fetch('/api/meals/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setSelectedFood(null);
        setQuantityInput(1);
        fetchTodayMeals();
      }
    } catch (err) {
      console.error('Add food error:', err);
    }
  };

  const handleDeleteFood = async (id: number) => {
    try {
      const res = await fetch(`/api/meals/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchTodayMeals();
      }
    } catch (err) {
      console.error('Delete food error:', err);
    }
  };

  const handleAiParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMealText.trim()) return;

    setAiParsing(true);
    setAiParsedResult(null);

    try {
      const res = await fetch('/api/ai/parse-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiMealText }),
      });
      const data = await res.json();
      if (data.success) {
        setAiParsedResult(data);
      }
    } catch (err) {
      console.error('AI Parse failed:', err);
    } finally {
      setAiParsing(false);
    }
  };

  const handleLogAiItems = async () => {
    if (!aiParsedResult || !aiParsedResult.items) return;

    for (const item of aiParsedResult.items) {
      await fetch('/api/meals/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealType: selectedMealType,
          foodName: item.name,
          quantity: item.quantity,
          servingUnit: item.unit,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          fiber: item.fiber,
        }),
      });
    }

    setAiParsedResult(null);
    setAiMealText('');
    fetchTodayMeals();
  };

  const calPercent = Math.min(100, Math.round((dailyTotals.calories / targetMacros.calories) * 100));
  const proPercent = Math.min(100, Math.round((dailyTotals.protein / targetMacros.protein) * 100));
  const carbPercent = Math.min(100, Math.round((dailyTotals.carbs / targetMacros.carbs) * 100));
  const fatPercent = Math.min(100, Math.round((dailyTotals.fat / targetMacros.fat) * 100));

  const mealLabels = [
    { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { id: 'lunch', label: 'Lunch', icon: '☀️' },
    { id: 'snacks', label: 'Snacks', icon: '🍎' },
    { id: 'dinner', label: 'Dinner', icon: '🌙' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-full px-4 py-1.5 mb-4 shadow-[0_0_15px_rgba(255,69,0,0.15)]">
          <Utensils className="w-4 h-4 text-accent" />
          <span className="text-accent text-xs sm:text-sm font-semibold">Macro & Calorie Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
          Meal Nutrition <span className="text-accent drop-shadow-[0_0_15px_rgba(255,69,0,0.3)]">Calculator</span>
        </h1>
        <p className="text-gray-300 text-sm sm:text-base">
          Log meals across 150+ foods (including Indian staples), track daily targets with frosted progress bars, or describe your meal in plain English.
        </p>
      </div>

      {/* ────────────────── TOP SUMMARY PROGRESS BARS (GLASS PANEL) ────────────────── */}
      <div className="w-full glass-panel rounded-3xl p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/[0.08]">
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-1">Today's Nutrition Adherence</span>
            <h2 className="text-2xl font-extrabold text-white">Daily Macro Overview</h2>
          </div>
          <div className="text-xs text-gray-300 bg-white/[0.04] border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
            🎯 Target: <span className="text-white font-bold">{targetMacros.calories} kcal</span> |{' '}
            <span className="text-accent font-bold">{targetMacros.protein}g P</span> |{' '}
            <span className="text-blue-400 font-bold">{targetMacros.carbs}g C</span> |{' '}
            <span className="text-yellow-400 font-bold">{targetMacros.fat}g F</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Calories Bar */}
          <div className="glass-card p-4 rounded-2xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 font-medium">Calories</span>
              <span className="text-white font-bold">
                {dailyTotals.calories} / {targetMacros.calories} kcal
              </span>
            </div>
            <div className="w-full bg-white/[0.08] h-3 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-accent shadow-[0_0_12px_rgba(255,69,0,0.5)]"
                style={{ width: `${calPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-gray-400 block text-right">{calPercent}% of target</span>
          </div>

          {/* Protein Bar */}
          <div className="glass-card p-4 rounded-2xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 font-medium">Protein</span>
              <span className="text-accent font-bold">
                {dailyTotals.protein} / {targetMacros.protein}g
              </span>
            </div>
            <div className="w-full bg-white/[0.08] h-3 rounded-full overflow-hidden">
              <div
                className="bg-accent h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(255,69,0,0.5)]"
                style={{ width: `${proPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-gray-400 block text-right">{proPercent}% of target</span>
          </div>

          {/* Carbs Bar */}
          <div className="glass-card p-4 rounded-2xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 font-medium">Carbohydrates</span>
              <span className="text-blue-400 font-bold">
                {dailyTotals.carbs} / {targetMacros.carbs}g
              </span>
            </div>
            <div className="w-full bg-white/[0.08] h-3 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                style={{ width: `${carbPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-gray-400 block text-right">{carbPercent}% of target</span>
          </div>

          {/* Fat Bar */}
          <div className="glass-card p-4 rounded-2xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 font-medium">Fats</span>
              <span className="text-yellow-400 font-bold">
                {dailyTotals.fat} / {targetMacros.fat}g
              </span>
            </div>
            <div className="w-full bg-white/[0.08] h-3 rounded-full overflow-hidden">
              <div
                className="bg-yellow-500 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(234,179,8,0.5)]"
                style={{ width: `${fatPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-gray-400 block text-right">{fatPercent}% of target</span>
          </div>
        </div>
      </div>

      {/* ────────────────── AI FREE-TEXT MEAL LOGGER (GLASS) ────────────────── */}
      <div className="w-full glass-panel rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Natural Language Meal Estimator</span>
        </div>
        <h3 className="text-xl font-extrabold text-white mb-2">Log Your Meal in Plain English</h3>
        <p className="text-xs text-gray-300 mb-4 max-w-xl">
          Example: <span className="text-accent font-semibold italic">"2 rotis, 1 bowl dal tadka, 100g paneer"</span> or{' '}
          <span className="text-accent font-semibold italic">"3 boiled eggs and 2 slices whole wheat bread"</span>.
        </p>

        <form onSubmit={handleAiParse} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Type foods and quantities here..."
            value={aiMealText}
            onChange={(e) => setAiMealText(e.target.value)}
            className="flex-1 glass-input rounded-2xl px-4 py-3 text-sm focus:outline-none placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={aiParsing}
            className="glass-button-accent text-white font-bold px-7 py-3 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shrink-0 disabled:opacity-50"
          >
            {aiParsing ? (
              <span>Analyzing...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Estimate Macros</span>
              </>
            )}
          </button>
        </form>

        {/* AI Parsed Results Preview Card */}
        {aiParsedResult && (
          <div className="mt-5 p-5 glass-card rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.08] text-xs">
              <span className="text-gray-300 font-semibold">Extracted Foods ({aiParsedResult.items.length})</span>
              <div className="text-white font-bold">
                Total: <span className="text-accent">{aiParsedResult.totals.calories} kcal</span> |{' '}
                <span className="text-accent">{aiParsedResult.totals.protein}g Protein</span> |{' '}
                <span className="text-blue-400">{aiParsedResult.totals.carbs}g Carbs</span> |{' '}
                <span className="text-yellow-400">{aiParsedResult.totals.fat}g Fat</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {aiParsedResult.items.map((it: any, i: number) => (
                <div key={i} className="glass-card p-3 rounded-xl text-xs">
                  <div className="font-bold text-white mb-1">
                    {it.quantity} {it.unit} {it.name}
                  </div>
                  <div className="text-gray-400">
                    {it.calories} kcal • {it.protein}g P • {it.carbs}g C • {it.fat}g F
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">Add to meal:</span>
                <select
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value as any)}
                  className="glass-input rounded-xl px-3 py-1.5 text-xs bg-[#0e1422]"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="snacks">Snacks</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>

              <button
                onClick={handleLogAiItems}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Log All Items to {selectedMealType.toUpperCase()}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ────────────────── 4 MEAL LOG SECTIONS ────────────────── */}
      <div className="w-full space-y-6 mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xl font-extrabold text-white">Daily Meal Schedule</h3>
          <button
            onClick={() => {
              setSelectedFood(foods[0] || null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 glass-button-accent text-white font-bold px-5 py-2.5 rounded-2xl text-sm transition-all shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Search & Add Food Item</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mealLabels.map((meal) => {
            const items = mealSections[meal.id] || [];
            const mealCals = items.reduce((sum, item) => sum + item.calories, 0);
            const mealPro = items.reduce((sum, item) => sum + item.protein, 0);
            const mealCarb = items.reduce((sum, item) => sum + item.carbs, 0);
            const mealFat = items.reduce((sum, item) => sum + item.fat, 0);

            return (
              <div key={meal.id} className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{meal.icon}</span>
                      <h4 className="text-base font-bold text-white capitalize">{meal.label}</h4>
                      <span className="text-xs bg-white/[0.05] border border-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                        {items.length} {items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div className="text-xs text-accent font-bold">{mealCals} kcal</div>
                  </div>

                  {items.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 text-xs">
                      No foods logged for {meal.label.toLowerCase()} yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between glass-card p-3 rounded-2xl text-xs"
                        >
                          <div>
                            <div className="font-bold text-white">
                              {item.quantity} {item.serving_unit.includes(String(item.quantity)) ? '' : item.serving_unit} {item.food_name}
                            </div>
                            <div className="text-gray-400 mt-0.5">
                              {item.calories} kcal • {item.protein}g P • {item.carbs}g C • {item.fat}g F
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteFood(item.id)}
                            className="text-gray-500 hover:text-red-400 p-1.5 transition-colors"
                            title="Remove food"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {items.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/[0.08] flex justify-between text-[11px] text-gray-400">
                    <span>Protein: <strong className="text-accent">{mealPro.toFixed(1)}g</strong></span>
                    <span>Carbs: <strong className="text-blue-400">{mealCarb.toFixed(1)}g</strong></span>
                    <span>Fat: <strong className="text-yellow-400">{mealFat.toFixed(1)}g</strong></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ────────────────── FOOD SEARCH MODAL (GLASS) ────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Utensils className="w-5 h-5 text-accent" />
                Add Food to Meal Log
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Meal Section</label>
                <div className="grid grid-cols-4 gap-2">
                  {mealLabels.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMealType(m.id as any)}
                      className={`py-2 text-xs font-bold rounded-xl transition-all ${
                        selectedMealType === m.id
                          ? 'glass-button-accent text-white'
                          : 'bg-white/[0.04] text-gray-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Search 150+ Foods</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search roti, dal, chicken, paneer, oats, eggs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full glass-input rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1.5 border border-white/[0.08] p-2 rounded-2xl bg-black/40">
                {foods.map((food) => {
                  const isSelected = selectedFood?.name === food.name;
                  return (
                    <button
                      key={food.name}
                      type="button"
                      onClick={() => {
                        setSelectedFood(food);
                        setQuantityInput(food.serving_unit.includes('100g') ? 100 : 1);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-accent/20 border border-accent text-white font-bold'
                          : 'hover:bg-white/[0.04] text-gray-300'
                      }`}
                    >
                      <div>
                        <div className="text-white font-semibold">{food.name}</div>
                        <div className="text-gray-400 text-[11px]">{food.serving_unit} • {food.category}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-accent font-bold">{food.calories} kcal</span>
                        <div className="text-[10px] text-gray-400">{food.protein}g P | {food.carbs}g C | {food.fat}g F</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedFood && (
                <div className="glass-card p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-200 font-bold">{selectedFood.name}</span>
                    <span className="text-accent font-bold">
                      {Math.round(
                        selectedFood.calories *
                          (selectedFood.serving_unit.includes('100g') ? quantityInput / 100 : quantityInput)
                      )}{' '}
                      kcal
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">
                      Quantity ({selectedFood.serving_unit.includes('100g') ? 'grams' : 'servings / pieces'})
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={quantityInput}
                      onChange={(e) => setQuantityInput(Math.max(1, Number(e.target.value)))}
                      className="w-full glass-input rounded-xl px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 font-bold py-2.5 rounded-xl text-xs transition-colors border border-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedFood}
                  onClick={handleAddFoodToMeal}
                  className="flex-1 glass-button-accent text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md disabled:opacity-50"
                >
                  Confirm & Log Food
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
