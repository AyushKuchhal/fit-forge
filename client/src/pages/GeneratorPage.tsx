import React, { useState } from 'react';
import type {
  UserStatsInput,
  GeneratedPlanResult,
} from '../utils/fitnessCalculators';
import { generatePersonalizedPlan } from '../utils/fitnessCalculators';
import MacroCharts from '../components/MacroCharts';
import {
  Flame,
  Dumbbell,
  Calendar,
  Clock,
  Target,
  Sparkles,
  BookmarkCheck,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GeneratorPage() {
  const [formData, setFormData] = useState<UserStatsInput>({
    age: 25,
    gender: 'male',
    heightCm: 175,
    weightKg: 78,
    activityLevel: 'moderate',
    goal: 'cut',
    targetWeightKg: 72,
    experienceLevel: 'intermediate',
    workoutDaysPerWeek: 4,
    equipment: 'full_gym',
    dietType: 'non_veg',
  });

  const [planResult, setPlanResult] = useState<GeneratedPlanResult | null>(() => {
    const saved = localStorage.getItem('fitforge_saved_plan');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return generatePersonalizedPlan({
      age: 25,
      gender: 'male',
      heightCm: 175,
      weightKg: 78,
      activityLevel: 'moderate',
      goal: 'cut',
      targetWeightKg: 72,
      experienceLevel: 'intermediate',
      workoutDaysPerWeek: 4,
      equipment: 'full_gym',
      dietType: 'non_veg',
    });
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = generatePersonalizedPlan(formData);
    setPlanResult(result);
    setSavedSuccess(false);
  };

  const handleSavePlan = () => {
    if (!planResult) return;
    localStorage.setItem('fitforge_saved_plan', JSON.stringify(planResult));
    localStorage.setItem('fitforge_user_stats', JSON.stringify(formData));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-full px-4 py-1.5 mb-4 shadow-[0_0_15px_rgba(255,69,0,0.15)]">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-accent text-xs sm:text-sm font-semibold">Evidence-Based Algorithm</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
          Personalized <span className="text-accent drop-shadow-[0_0_15px_rgba(255,69,0,0.3)]">Plan Generator</span>
        </h1>
        <p className="text-gray-300 text-sm sm:text-base">
          Input your body metrics to compute accurate Mifflin-St Jeor BMR, TDEE, macro split, and a customized weekly split.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* Left Form Column (Glass Panel) */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2.5">
            <Target className="w-5 h-5 text-accent" />
            <span>Your Fitness Profile</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Gender & Age */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'male' })}
                    className={`py-2 text-sm rounded-xl font-medium transition-all ${
                      formData.gender === 'male'
                        ? 'glass-button-accent text-white font-bold'
                        : 'bg-white/[0.03] text-gray-400 hover:text-white border border-white/5'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'female' })}
                    className={`py-2 text-sm rounded-xl font-medium transition-all ${
                      formData.gender === 'female'
                        ? 'glass-button-accent text-white font-bold'
                        : 'bg-white/[0.03] text-gray-400 hover:text-white border border-white/5'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Age (years)</label>
                <input
                  type="number"
                  min="14"
                  max="90"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-sm focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Height & Weight */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Height (cm)</label>
                <input
                  type="number"
                  min="110"
                  max="240"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Weight (kg)</label>
                <input
                  type="number"
                  min="35"
                  max="220"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-sm focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Goal */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Primary Goal</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cut', label: 'Fat Loss', icon: <TrendingDown className="w-3.5 h-3.5" /> },
                  { id: 'maintain', label: 'Maintain', icon: <Minus className="w-3.5 h-3.5" /> },
                  { id: 'bulk', label: 'Muscle Bulk', icon: <TrendingUp className="w-3.5 h-3.5" /> },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, goal: g.id as any })}
                    className={`py-2.5 px-2 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                      formData.goal === g.id
                        ? 'glass-button-accent text-white font-bold'
                        : 'bg-white/[0.03] text-gray-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {g.icon}
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Weight */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Target Weight (kg)</label>
              <input
                type="number"
                min="35"
                max="220"
                value={formData.targetWeightKg}
                onChange={(e) => setFormData({ ...formData, targetWeightKg: Number(e.target.value) })}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-sm focus:outline-none"
                required
              />
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Activity Level</label>
              <select
                value={formData.activityLevel}
                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as any })}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-sm focus:outline-none bg-[#0e1422]"
              >
                <option value="sedentary">Sedentary (Desk job, no exercise)</option>
                <option value="light">Lightly Active (1-3 days exercise/week)</option>
                <option value="moderate">Moderately Active (3-5 days lifting/week)</option>
                <option value="very_active">Very Active (6-7 days intense/week)</option>
                <option value="extra_active">Extra Active (Hard labor + daily gym)</option>
              </select>
            </div>

            {/* Days & Experience */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Days / Week</label>
                <select
                  value={formData.workoutDaysPerWeek}
                  onChange={(e) => setFormData({ ...formData, workoutDaysPerWeek: Number(e.target.value) })}
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-sm focus:outline-none bg-[#0e1422]"
                >
                  <option value={3}>3 Days (Full Body)</option>
                  <option value={4}>4 Days (Upper / Lower)</option>
                  <option value={5}>5 Days (PPL+)</option>
                  <option value={6}>6 Days (PPL Split)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Experience</label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as any })}
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-sm focus:outline-none bg-[#0e1422]"
                >
                  <option value="beginner">Beginner (&lt; 1 yr)</option>
                  <option value="intermediate">Intermediate (1-3 yrs)</option>
                  <option value="advanced">Advanced (3+ yrs)</option>
                </select>
              </div>
            </div>

            {/* Equipment & Diet Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Equipment</label>
                <select
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value as any })}
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-sm focus:outline-none bg-[#0e1422]"
                >
                  <option value="full_gym">Full Gym</option>
                  <option value="home_dumbbells">Dumbbells / Home</option>
                  <option value="bodyweight_only">Bodyweight Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Diet Type</label>
                <select
                  value={formData.dietType}
                  onChange={(e) => setFormData({ ...formData, dietType: e.target.value as any })}
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-sm focus:outline-none bg-[#0e1422]"
                >
                  <option value="non_veg">Non-Vegetarian</option>
                  <option value="veg">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full glass-button-accent text-white font-bold py-3.5 rounded-2xl transition-all text-base flex items-center justify-center gap-2 mt-4"
            >
              <Sparkles className="w-5 h-5" />
              <span>Calculate & Generate Plan</span>
            </button>
          </form>
        </div>

        {/* Right Output Column (Glass Cards) */}
        {planResult && (
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="glass-card p-4 rounded-2xl text-center">
                <span className="text-xs text-gray-400 font-medium block mb-1">Body Mass Index</span>
                <span className="text-2xl font-extrabold text-white">{planResult.bmi}</span>
                <span className="text-xs block mt-1 text-accent font-semibold">{planResult.bmiCategory}</span>
              </div>

              <div className="glass-card p-4 rounded-2xl text-center">
                <span className="text-xs text-gray-400 font-medium block mb-1">BMR (Basal)</span>
                <span className="text-2xl font-extrabold text-white">{planResult.bmr}</span>
                <span className="text-xs block mt-1 text-gray-400">kcal burned at rest</span>
              </div>

              <div className="glass-card p-4 rounded-2xl text-center">
                <span className="text-xs text-gray-400 font-medium block mb-1">Maintenance TDEE</span>
                <span className="text-2xl font-extrabold text-white">{planResult.tdee}</span>
                <span className="text-xs block mt-1 text-gray-400">kcal daily burn</span>
              </div>

              <div className="glass-card p-4 rounded-2xl text-center border-accent/40 bg-accent/[0.08] shadow-[0_0_20px_rgba(255,69,0,0.15)]">
                <span className="text-xs text-accent font-bold block mb-1">Target Calories</span>
                <span className="text-2xl font-extrabold text-white">{planResult.dailyCalories}</span>
                <span className="text-xs block mt-1 text-white/80 font-medium">
                  {planResult.calorieAdjustment >= 0 ? `+${planResult.calorieAdjustment}` : planResult.calorieAdjustment} kcal/day
                </span>
              </div>
            </div>

            {/* Timeline Banner */}
            {planResult.estimatedWeeks > 0 && (
              <div className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Target Timeline</span>
                    <span className="text-base font-bold text-white">
                      ~{planResult.estimatedWeeks} Weeks to reach {formData.targetWeightKg} kg
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-300 bg-white/[0.05] border border-white/10 px-3.5 py-1.5 rounded-xl">
                  Safe rate: ~{planResult.ratePerWeekKg} kg / week
                </div>
              </div>
            )}

            {/* Macro Charts */}
            <MacroCharts
              dailyMacros={planResult.dailyMacros}
              trainingMacros={planResult.trainingDayMacros}
              restMacros={planResult.restDayMacros}
            />

            {/* Recommended Workout Plan Section */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider mb-1">
                    <Dumbbell className="w-4 h-4" />
                    <span>Matched Workout Routine</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white">{planResult.recommendedSplit}</h3>
                </div>

                <button
                  onClick={handleSavePlan}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    savedSuccess
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'glass-button-accent text-white shadow-md'
                  }`}
                >
                  {savedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Plan Saved to Profile!</span>
                    </>
                  ) : (
                    <>
                      <BookmarkCheck className="w-4 h-4" />
                      <span>Save Plan to Profile</span>
                    </>
                  )}
                </button>
              </div>

              {/* Day Selector Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
                {planResult.weeklyWorkoutPlan.map((day, idx) => (
                  <button
                    key={day.dayName}
                    onClick={() => setActiveDayIndex(idx)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                      activeDayIndex === idx
                        ? 'glass-button-accent text-white font-bold'
                        : day.isRest
                        ? 'bg-white/[0.02] text-gray-500 hover:text-gray-300 border border-transparent'
                        : 'bg-white/[0.04] text-gray-300 hover:text-white border border-white/5'
                    }`}
                  >
                    {day.dayName.split(' - ')[0]}
                    {day.isRest ? ' (Rest)' : ''}
                  </button>
                ))}
              </div>

              {/* Active Day Detail */}
              {planResult.weeklyWorkoutPlan[activeDayIndex] && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between glass-card p-4 rounded-2xl">
                    <div>
                      <h4 className="text-base font-bold text-white">
                        {planResult.weeklyWorkoutPlan[activeDayIndex].dayName}
                      </h4>
                      <p className="text-xs text-accent font-medium mt-0.5">
                        {planResult.weeklyWorkoutPlan[activeDayIndex].focus}
                      </p>
                    </div>
                    {planResult.weeklyWorkoutPlan[activeDayIndex].isRest ? (
                      <span className="text-xs bg-white/[0.05] text-gray-400 px-3 py-1.5 rounded-full border border-white/10">
                        Recovery Day
                      </span>
                    ) : (
                      <span className="text-xs bg-accent/20 text-accent px-3 py-1.5 rounded-full font-bold border border-accent/30">
                        {planResult.weeklyWorkoutPlan[activeDayIndex].exercises.length} Exercises
                      </span>
                    )}
                  </div>

                  {planResult.weeklyWorkoutPlan[activeDayIndex].isRest ? (
                    <div className="p-8 text-center text-gray-400 glass-card rounded-2xl border-dashed">
                      <p className="text-sm">
                        🛌 Muscle growth occurs during rest. Hydrate, hit your protein target ({planResult.restDayMacros.proteinGrams}g), and aim for 7-9 hours of sleep.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {planResult.weeklyWorkoutPlan[activeDayIndex].exercises.map((ex, exIdx) => (
                        <div
                          key={ex.name}
                          className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-500 w-5">#{exIdx + 1}</span>
                              <span className="text-sm sm:text-base font-bold text-white">{ex.name}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 pl-7">💡 Coach Tip: {ex.tip}</p>
                          </div>

                          <div className="flex items-center gap-3 pl-7 sm:pl-0 text-xs">
                            <div className="bg-white/[0.05] border border-white/10 px-3 py-1.5 rounded-xl text-gray-200">
                              <span className="font-bold text-white">{ex.sets}</span> sets × <span className="font-bold text-white">{ex.reps}</span>
                            </div>
                            <div className="bg-white/[0.05] border border-white/10 px-3 py-1.5 rounded-xl text-gray-400 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-accent" />
                              <span>{ex.rest}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Banner to AI Coach */}
              <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-gray-400 text-center sm:text-left">
                  Have joint issues or want to swap an exercise? Ask the AI Coach!
                </span>
                <Link
                  to="/chat"
                  className="inline-flex items-center gap-2 text-accent hover:text-orange-400 text-xs font-bold transition-colors"
                >
                  <span>Chat with Coach about this plan</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
