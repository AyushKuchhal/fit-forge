import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Flame,
  Award,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ExerciseItem {
  id: number;
  name: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
  default_sets: number;
  default_reps: string;
  rest_seconds: number;
  form_tip: string;
}

interface PlanDayExercise {
  id: number;
  exercise_name: string;
  sets: number;
  reps: string;
  rest: string;
  tip: string;
}

interface PlanDay {
  id: number;
  day_number: number;
  day_name: string;
  focus: string;
  exercises: PlanDayExercise[];
}

interface WorkoutPlan {
  id: string;
  name: string;
  goal: string;
  level: string;
  split: string;
  description: string;
  days_count: number;
  days?: PlanDay[];
}

export default function PlansPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'library'>('plans');

  // Plan Filters
  const [selectedGoal, setSelectedGoal] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedSplit, setSelectedSplit] = useState<string>('all');
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [activePlanDayIndex, setActivePlanDayIndex] = useState(0);

  // Completed days state
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('fitforge_completed_workouts');
    return saved ? JSON.parse(saved) : {};
  });

  // Exercise Library Filters
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        let url = 'http://localhost:4000/api/plans';
        const params = new URLSearchParams();
        if (selectedGoal !== 'all') params.append('goal', selectedGoal);
        if (selectedLevel !== 'all') params.append('level', selectedLevel);
        if (selectedSplit !== 'all') params.append('split', selectedSplit);
        if (params.toString()) url += `?${params.toString()}`;

        const res = await fetch(url);
        const data = await res.json();
        if (data.success && data.plans) {
          setPlans(data.plans);
          if (data.plans.length > 0 && (!selectedPlan || !data.plans.some((p: any) => p.id === selectedPlan.id))) {
            fetchPlanDetail(data.plans[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load plans:', err);
      }
    };
    fetchPlans();
  }, [selectedGoal, selectedLevel, selectedSplit]);

  const fetchPlanDetail = async (planId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/plans/${planId}`);
      const data = await res.json();
      if (data.success && data.plan) {
        setSelectedPlan(data.plan);
        setActivePlanDayIndex(0);
      }
    } catch (err) {
      console.error('Failed to fetch plan detail:', err);
    }
  };

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:4000/api/exercises';
        const params = new URLSearchParams();
        if (selectedMuscle !== 'all') params.append('muscle', selectedMuscle);
        if (selectedEquipment !== 'all') params.append('equipment', selectedEquipment);
        if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty);
        if (searchQuery.trim()) params.append('search', searchQuery.trim());
        if (params.toString()) url += `?${params.toString()}`;

        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setExercises(data.exercises);
        }
      } catch (err) {
        console.error('Failed to load exercises:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, [selectedMuscle, selectedEquipment, selectedDifficulty, searchQuery]);

  const handleToggleComplete = async (planId: string, dayNumber: number, dayName: string) => {
    const key = `${planId}_day_${dayNumber}`;
    const nextState = !completedDays[key];

    const updated = { ...completedDays, [key]: nextState };
    setCompletedDays(updated);
    localStorage.setItem('fitforge_completed_workouts', JSON.stringify(updated));

    try {
      await fetch('http://localhost:4000/api/workouts/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'guest',
          planId,
          dayNumber,
          dayName,
        }),
      });
    } catch (e) {}
  };

  const currentPlanCompletedCount = selectedPlan?.days
    ? selectedPlan.days.filter((d) => completedDays[`${selectedPlan.id}_day_${d.day_number}`]).length
    : 0;

  const currentPlanTotalDays = selectedPlan?.days ? selectedPlan.days.length : 1;
  const progressPercent = Math.round((currentPlanCompletedCount / currentPlanTotalDays) * 100);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-full px-4 py-1.5 mb-4 shadow-[0_0_15px_rgba(255,69,0,0.15)]">
          <Dumbbell className="w-4 h-4 text-accent" />
          <span className="text-accent text-xs sm:text-sm font-semibold">Structured Training System</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
          Workout Plans & <span className="text-accent drop-shadow-[0_0_15px_rgba(255,69,0,0.3)]">Exercise Library</span>
        </h1>
        <p className="text-gray-300 text-sm sm:text-base">
          Browse specialized splits for cutting, bulking, and maintenance, track completed sessions, or filter 35+ form-guided exercises.
        </p>

        {/* Top Tab Switcher */}
        <div className="inline-flex glass-card p-1.5 rounded-2xl mt-8">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'plans'
                ? 'glass-button-accent text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Workout Plans
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'library'
                ? 'glass-button-accent text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Exercise Library
          </button>
        </div>
      </div>

      {/* ────────────────── TAB 1: WORKOUT PLANS ────────────────── */}
      {activeTab === 'plans' && (
        <div className="w-full space-y-8">
          {/* Filter Bar */}
          <div className="glass-panel p-6 rounded-3xl grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Goal</label>
              <select
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-sm focus:outline-none bg-[#0e1422]"
              >
                <option value="all">All Goals (Bulk, Cut, Maintain)</option>
                <option value="bulk">Muscle Growth (Bulk)</option>
                <option value="cut">Fat Loss (Cut)</option>
                <option value="maintain">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Difficulty Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-sm focus:outline-none bg-[#0e1422]"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Split Type</label>
              <select
                value={selectedSplit}
                onChange={(e) => setSelectedSplit(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-sm focus:outline-none bg-[#0e1422]"
              >
                <option value="all">All Splits</option>
                <option value="ppl">Push / Pull / Legs (PPL)</option>
                <option value="upper_lower">Upper / Lower</option>
                <option value="full_body">Full Body</option>
                <option value="bro_split">Bro Split (Bodypart)</option>
              </select>
            </div>
          </div>

          {/* Plan Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((p) => {
              const isSelected = selectedPlan?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => fetchPlanDetail(p.id)}
                  className={`text-left p-5 rounded-2xl transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'glass-card border-accent/60 bg-accent/[0.08] shadow-[0_0_25px_rgba(255,69,0,0.2)]'
                      : 'glass-card'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase font-bold tracking-wider text-accent">
                        {p.goal.toUpperCase()}
                      </span>
                      <span className="text-xs bg-white/[0.05] border border-white/10 text-gray-300 px-2.5 py-0.5 rounded-full capitalize">
                        {p.level}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-white mb-1.5">{p.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{p.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-gray-400">
                    <span>{p.days_count} Workouts / wk</span>
                    <span className="text-accent font-semibold">{isSelected ? 'Active Plan' : 'Select →'}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Plan Details & Progress Tracker */}
          {selectedPlan && (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-8">
              {/* Plan Header & Weekly Progress Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase mb-1">
                    <Zap className="w-4 h-4" />
                    <span>{selectedPlan.split.replace('_', ' ')} routine</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{selectedPlan.name}</h2>
                  <p className="text-sm text-gray-300 max-w-xl mt-1 leading-relaxed">{selectedPlan.description}</p>
                </div>

                {/* Progress Box */}
                <div className="glass-card p-4 rounded-2xl min-w-[240px]">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-400 font-semibold uppercase">Weekly Progress</span>
                    <span className="text-accent font-bold">
                      {currentPlanCompletedCount} / {currentPlanTotalDays} Done ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-white/[0.08] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-accent h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(255,69,0,0.5)]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 block mt-2">
                    Mark workouts below to track your weekly adherence
                  </span>
                </div>
              </div>

              {/* Day Tabs */}
              {selectedPlan.days && selectedPlan.days.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
                    {selectedPlan.days.map((day, idx) => {
                      const isCompleted = completedDays[`${selectedPlan.id}_day_${day.day_number}`];
                      return (
                        <button
                          key={day.id}
                          onClick={() => setActivePlanDayIndex(idx)}
                          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                            activePlanDayIndex === idx
                              ? 'glass-button-accent text-white shadow-md'
                              : 'bg-white/[0.04] text-gray-300 hover:text-white border border-white/5'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-500" />
                          )}
                          <span>Day {day.day_number}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Day Content */}
                  {selectedPlan.days[activePlanDayIndex] && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5 rounded-2xl">
                        <div>
                          <h4 className="text-lg font-bold text-white">
                            {selectedPlan.days[activePlanDayIndex].day_name}
                          </h4>
                          <span className="text-xs text-accent font-semibold block mt-0.5">
                            Focus: {selectedPlan.days[activePlanDayIndex].focus}
                          </span>
                        </div>

                        {/* Complete Button */}
                        <button
                          onClick={() =>
                            handleToggleComplete(
                              selectedPlan.id,
                              selectedPlan.days![activePlanDayIndex].day_number,
                              selectedPlan.days![activePlanDayIndex].day_name
                            )
                          }
                          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                            completedDays[`${selectedPlan.id}_day_${selectedPlan.days[activePlanDayIndex].day_number}`]
                              ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                              : 'bg-white/[0.05] hover:bg-white/[0.1] text-gray-200 border border-white/10'
                          }`}
                        >
                          {completedDays[
                            `${selectedPlan.id}_day_${selectedPlan.days[activePlanDayIndex].day_number}`
                          ] ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Workout Completed!</span>
                            </>
                          ) : (
                            <>
                              <Circle className="w-4 h-4 text-accent" />
                              <span>Mark as Completed</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Exercises List */}
                      <div className="space-y-3">
                        {selectedPlan.days[activePlanDayIndex].exercises.map((ex, exIdx) => (
                          <div
                            key={ex.id || ex.exercise_name}
                            className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2.5">
                                <span className="text-xs font-bold text-gray-500 w-5">#{exIdx + 1}</span>
                                <h5 className="text-base font-bold text-white">{ex.exercise_name}</h5>
                              </div>
                              <p className="text-xs text-gray-400 pl-7 leading-relaxed">
                                💡 <span className="text-gray-300 font-medium">Coach Form Tip:</span> {ex.tip}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 pl-7 sm:pl-0 text-xs shrink-0">
                              <div className="bg-white/[0.05] border border-white/10 px-3.5 py-1.5 rounded-xl text-gray-200">
                                <span className="font-bold text-white">{ex.sets}</span> sets ×{' '}
                                <span className="font-bold text-white">{ex.reps}</span>
                              </div>
                              <div className="bg-white/[0.05] border border-white/10 px-3.5 py-1.5 rounded-xl text-gray-400 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-accent" />
                                <span>{ex.rest}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ────────────────── TAB 2: EXERCISE LIBRARY ────────────────── */}
      {activeTab === 'library' && (
        <div className="w-full space-y-6">
          {/* Search & Filter Bar */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="relative w-full">
              <Search className="w-5 h-5 absolute left-4 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search exercises by name or cue (e.g., bench, squat, lats)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-input rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none placeholder-gray-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Muscle Group</label>
                <select
                  value={selectedMuscle}
                  onChange={(e) => setSelectedMuscle(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none bg-[#0e1422]"
                >
                  <option value="all">All Muscles</option>
                  <option value="chest">Chest</option>
                  <option value="back">Back</option>
                  <option value="legs">Legs</option>
                  <option value="shoulders">Shoulders</option>
                  <option value="biceps">Biceps</option>
                  <option value="triceps">Triceps</option>
                  <option value="calves">Calves</option>
                  <option value="core">Core</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Equipment</label>
                <select
                  value={selectedEquipment}
                  onChange={(e) => setSelectedEquipment(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none bg-[#0e1422]"
                >
                  <option value="all">All Equipment</option>
                  <option value="barbell">Barbell</option>
                  <option value="dumbbell">Dumbbell</option>
                  <option value="cable">Cable</option>
                  <option value="machine">Machine</option>
                  <option value="bodyweight">Bodyweight</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none bg-[#0e1422]"
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between text-xs text-gray-400 px-2">
            <span>Showing {exercises.length} verified exercises</span>
            <span className="text-gray-400">Click any card to ask AI coach for technique advice</span>
          </div>

          {/* Exercise Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.map((ex) => (
              <div
                key={ex.id}
                className="glass-card p-5 rounded-2xl flex flex-col justify-between group"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                    <span className="text-[11px] font-bold bg-accent/20 text-accent border border-accent/30 px-2.5 py-0.5 rounded-full">
                      {ex.muscle_group}
                    </span>
                    <span className="text-[11px] bg-white/[0.05] border border-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                      {ex.equipment}
                    </span>
                    <span className="text-[11px] bg-white/[0.05] border border-white/10 text-gray-400 px-2 py-0.5 rounded-full capitalize">
                      {ex.difficulty}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-2 group-hover:text-accent transition-colors">
                    {ex.name}
                  </h4>

                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    <span className="text-gray-300 font-semibold">Form Cue:</span> {ex.form_tip}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    {ex.default_sets} sets × {ex.default_reps} ({ex.rest_seconds}s rest)
                  </span>
                  <Link
                    to="/chat"
                    className="text-accent hover:text-orange-400 font-semibold text-xs flex items-center gap-1"
                  >
                    <span>Coach Tips</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {exercises.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-400 glass-panel rounded-3xl">
              <Info className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-sm">No exercises matched your search and filter criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
