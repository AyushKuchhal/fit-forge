export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
export type Goal = 'bulk' | 'cut' | 'maintain';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type DietType = 'non_veg' | 'veg' | 'vegan';
export type EquipmentAvailable = 'full_gym' | 'home_dumbbells' | 'bodyweight_only';

export interface UserStatsInput {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  targetWeightKg: number;
  experienceLevel: ExperienceLevel;
  workoutDaysPerWeek: number;
  equipment: EquipmentAvailable;
  dietType: DietType;
}

export interface MacroBreakdown {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
}

export interface WorkoutDayPlan {
  dayName: string;
  focus: string;
  isRest: boolean;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    rest: string;
    tip: string;
  }[];
}

export interface GeneratedPlanResult {
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee: number;
  dailyCalories: number;
  calorieAdjustment: number;
  ratePerWeekKg: number;
  estimatedWeeks: number;
  dailyMacros: MacroBreakdown;
  trainingDayMacros: MacroBreakdown;
  restDayMacros: MacroBreakdown;
  recommendedSplit: string;
  weeklyWorkoutPlan: WorkoutDayPlan[];
}

export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; category: string } {
  if (heightCm <= 0 || weightKg <= 0) {
    return { bmi: 0, category: 'Invalid' };
  }
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  let category = 'Normal weight';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal weight';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';

  return { bmi, category };
}

export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) return 0;
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  return Math.round(bmr);
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.2));
}

export function calculateMacros(
  calories: number,
  weightKg: number,
  goal: Goal,
  dietType: DietType = 'non_veg'
): MacroBreakdown {
  let proteinMultiplier = 1.8;
  if (goal === 'cut') {
    proteinMultiplier = 2.1;
  } else if (goal === 'bulk') {
    proteinMultiplier = 1.9;
  } else {
    proteinMultiplier = 1.7;
  }

  if (dietType === 'vegan') {
    proteinMultiplier = Math.min(2.2, proteinMultiplier + 0.1);
  }

  let proteinGrams = Math.round(weightKg * proteinMultiplier);
  let proteinCalories = proteinGrams * 4;

  if (proteinCalories > calories * 0.45) {
    proteinGrams = Math.round((calories * 0.4) / 4);
    proteinCalories = proteinGrams * 4;
  }

  const fatCalories = calories * 0.25;
  const fatGrams = Math.round(fatCalories / 9);

  const carbsCalories = Math.max(0, calories - proteinCalories - fatCalories);
  const carbsGrams = Math.round(carbsCalories / 4);

  const trueTotalCalories = proteinGrams * 4 + carbsGrams * 4 + fatGrams * 9;
  const proteinPercent = Math.round(((proteinGrams * 4) / trueTotalCalories) * 100);
  const fatPercent = Math.round(((fatGrams * 9) / trueTotalCalories) * 100);
  const carbsPercent = 100 - proteinPercent - fatPercent;

  return {
    calories: Math.round(trueTotalCalories),
    proteinGrams,
    carbsGrams,
    fatGrams,
    proteinPercent,
    carbsPercent,
    fatPercent,
  };
}

export function getRecommendedWorkoutSplit(
  days: number,
  experience: ExperienceLevel,
  equipment: EquipmentAvailable
): { splitName: string; plan: WorkoutDayPlan[] } {
  if (days <= 3) {
    return {
      splitName: 'Full Body (3-Day)',
      plan: [
        {
          dayName: 'Day 1 - Monday',
          focus: 'Full Body A (Strength Focus)',
          isRest: false,
          exercises: [
            { name: equipment === 'bodyweight_only' ? 'Push-ups' : 'Barbell Bench Press', sets: 3, reps: '8-10', rest: '90s', tip: 'Keep core tight, elbows tucked 45 degrees' },
            { name: equipment === 'bodyweight_only' ? 'Bodyweight Squats' : 'Barbell Back Squat', sets: 3, reps: '8-10', rest: '120s', tip: 'Hit parallel or deeper with chest upright' },
            { name: equipment === 'bodyweight_only' ? 'Inverted Rows / Pull-ups' : 'Bent Over Barbell Row', sets: 3, reps: '8-10', rest: '90s', tip: 'Pull toward belly button, engage lats' },
            { name: equipment === 'bodyweight_only' ? 'Pike Push-ups' : 'Dumbbell Overhead Press', sets: 3, reps: '10-12', rest: '90s', tip: 'Press overhead without excessive arch' },
            { name: 'Plank Hold', sets: 3, reps: '45-60s', rest: '60s', tip: 'Brace abdomen like you are taking a punch' },
          ],
        },
        { dayName: 'Day 2 - Tuesday', focus: 'Active Recovery / Rest', isRest: true, exercises: [] },
        {
          dayName: 'Day 3 - Wednesday',
          focus: 'Full Body B (Hypertrophy Focus)',
          isRest: false,
          exercises: [
            { name: equipment === 'bodyweight_only' ? 'Bulgarian Split Squats' : 'Romanian Deadlift', sets: 3, reps: '10-12', rest: '90s', tip: 'Hinge at the hips, feeling the hamstrings stretch' },
            { name: equipment === 'bodyweight_only' ? 'Decline Push-ups' : 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '90s', tip: 'Focus on upper chest squeeze at top' },
            { name: equipment === 'bodyweight_only' ? 'Doorway Rows' : 'Lat Pulldown / Pull-ups', sets: 3, reps: '10-12', rest: '90s', tip: 'Drive elbows down towards hips' },
            { name: equipment === 'bodyweight_only' ? 'Glute Bridges' : 'Walking Lunges', sets: 3, reps: '12 per leg', rest: '60s', tip: 'Keep front knee tracking over toes' },
            { name: 'Hanging Leg Raises / Lying Leg Raises', sets: 3, reps: '12-15', rest: '60s', tip: 'Control the descent without swinging' },
          ],
        },
        { dayName: 'Day 4 - Thursday', focus: 'Rest Day', isRest: true, exercises: [] },
        {
          dayName: 'Day 5 - Friday',
          focus: 'Full Body C (Metabolic & Core)',
          isRest: false,
          exercises: [
            { name: equipment === 'bodyweight_only' ? 'Dips (or Bench Dips)' : 'Dumbbell Goblet Squat', sets: 3, reps: '12-15', rest: '75s', tip: 'Stay upright and breathe continuously' },
            { name: equipment === 'bodyweight_only' ? 'Diamond Push-ups' : 'Dumbbell Lateral Raises', sets: 3, reps: '12-15', rest: '60s', tip: 'Lead with elbows for shoulder cap isolation' },
            { name: equipment === 'bodyweight_only' ? 'Pull-ups / Chin-ups' : 'Seated Cable / Chest-Supported Row', sets: 3, reps: '10-12', rest: '75s', tip: 'Hold contraction for 1 second' },
            { name: 'Bicep Curls / Hammer Curls', sets: 3, reps: '12-15', rest: '60s', tip: 'Keep elbows stationary at sides' },
            { name: 'Tricep Pushdowns / Dips', sets: 3, reps: '12-15', rest: '60s', tip: 'Lock out triceps with a squeeze' },
          ],
        },
        { dayName: 'Day 6 - Saturday', focus: 'Rest / Light Cardio', isRest: true, exercises: [] },
        { dayName: 'Day 7 - Sunday', focus: 'Rest & Meal Prep', isRest: true, exercises: [] },
      ],
    };
  } else if (days === 4) {
    return {
      splitName: 'Upper / Lower (4-Day)',
      plan: [
        {
          dayName: 'Day 1 - Monday',
          focus: 'Upper Body Power',
          isRest: false,
          exercises: [
            { name: 'Flat Barbell Bench Press', sets: 4, reps: '6-8', rest: '120s', tip: 'Drive feet into ground, pause slightly on chest' },
            { name: 'Barbell Bent Over Row', sets: 4, reps: '6-8', rest: '120s', tip: 'Maintain flat back, pull to mid-torso' },
            { name: 'Standing Overhead Press', sets: 3, reps: '8-10', rest: '90s', tip: 'Lock out overhead with glutes squeezed' },
            { name: 'Weighted Pull-ups / Lat Pulldown', sets: 3, reps: '8-10', rest: '90s', tip: 'Full extension at the top' },
            { name: 'Skull Crushers / Tricep Extension', sets: 3, reps: '10-12', rest: '60s', tip: 'Keep upper arms perpendicular to floor' },
          ],
        },
        {
          dayName: 'Day 2 - Tuesday',
          focus: 'Lower Body Power',
          isRest: false,
          exercises: [
            { name: 'Barbell Back Squat', sets: 4, reps: '6-8', rest: '150s', tip: 'Deep breath into belly before descent' },
            { name: 'Romanian Deadlift', sets: 3, reps: '8-10', rest: '120s', tip: 'Push hips back until hamstrings stretch' },
            { name: 'Leg Press', sets: 3, reps: '10-12', rest: '90s', tip: 'Avoid letting lower back round off the pad' },
            { name: 'Standing Calf Raises', sets: 4, reps: '12-15', rest: '60s', tip: 'Hold peak contraction for 2 seconds' },
            { name: 'Ab Wheel Rollouts / Planks', sets: 3, reps: '10-12', rest: '60s', tip: 'Prevent lower back from sagging' },
          ],
        },
        { dayName: 'Day 3 - Wednesday', focus: 'Active Recovery', isRest: true, exercises: [] },
        {
          dayName: 'Day 4 - Thursday',
          focus: 'Upper Body Hypertrophy',
          isRest: false,
          exercises: [
            { name: 'Incline Dumbbell Press', sets: 4, reps: '10-12', rest: '90s', tip: '30-45 degree bench angle' },
            { name: 'Seated Cable Row', sets: 4, reps: '10-12', rest: '90s', tip: 'Squeeze shoulder blades together' },
            { name: 'Dumbbell Lateral Raises', sets: 4, reps: '12-15', rest: '60s', tip: 'Pour the pitcher slightly at peak' },
            { name: 'Incline Dumbbell Bicep Curl', sets: 3, reps: '12-15', rest: '60s', tip: 'Full bicep stretch at bottom' },
            { name: 'Overhead Cable Tricep Extension', sets: 3, reps: '12-15', rest: '60s', tip: 'Keep elbows tucked near head' },
          ],
        },
        {
          dayName: 'Day 5 - Friday',
          focus: 'Lower Body Hypertrophy',
          isRest: false,
          exercises: [
            { name: 'Front Squat or Hack Squat', sets: 3, reps: '8-10', rest: '120s', tip: 'Keep elbows high and upright' },
            { name: 'Lying Leg Curls', sets: 4, reps: '10-12', rest: '75s', tip: 'Control the eccentric descent' },
            { name: 'Bulgarian Split Squats', sets: 3, reps: '10-12 per leg', rest: '90s', tip: 'Maintain weight mostly in front heel' },
            { name: 'Seated Calf Raises', sets: 4, reps: '15-20', rest: '60s', tip: 'Full stretch at bottom' },
            { name: 'Hanging Knee Raises', sets: 3, reps: '15', rest: '60s', tip: 'Curl pelvis up towards sternum' },
          ],
        },
        { dayName: 'Day 6 - Saturday', focus: 'Rest Day', isRest: true, exercises: [] },
        { dayName: 'Day 7 - Sunday', focus: 'Rest Day', isRest: true, exercises: [] },
      ],
    };
  } else {
    return {
      splitName: days >= 6 ? 'Push / Pull / Legs (6-Day PPL)' : 'Push / Pull / Legs + Upper / Lower (5-Day)',
      plan: [
        {
          dayName: 'Day 1 - Monday',
          focus: 'Push (Chest, Shoulders, Triceps)',
          isRest: false,
          exercises: [
            { name: 'Barbell Flat Bench Press', sets: 4, reps: '6-8', rest: '120s', tip: 'Firm grip, tuck shoulder blades' },
            { name: 'Overhead Barbell / Dumbbell Press', sets: 3, reps: '8-10', rest: '90s', tip: 'Brace core tight, do not hyperextend' },
            { name: 'Incline Dumbbell Flyes / Press', sets: 3, reps: '10-12', rest: '75s', tip: 'Feel chest stretch on the descent' },
            { name: 'Dumbbell Lateral Raises', sets: 4, reps: '12-15', rest: '60s', tip: 'Slow and controlled tempo' },
            { name: 'Tricep Rope Pushdowns', sets: 3, reps: '12-15', rest: '60s', tip: 'Flare rope outward at bottom' },
          ],
        },
        {
          dayName: 'Day 2 - Tuesday',
          focus: 'Pull (Back, Biceps, Rear Delts)',
          isRest: false,
          exercises: [
            { name: 'Conventional Deadlift / Rack Pull', sets: 3, reps: '5-6', rest: '150s', tip: 'Push floor away through heels' },
            { name: 'Wide Grip Lat Pulldown / Pull-ups', sets: 3, reps: '8-10', rest: '90s', tip: 'Drive elbows down into back pockets' },
            { name: 'One-Arm Dumbbell Row', sets: 3, reps: '10-12', rest: '75s', tip: 'Keep hips square, pull toward hip' },
            { name: 'Face Pulls with Rope', sets: 4, reps: '15', rest: '60s', tip: 'Pull toward eyes, rotate wrists outwards' },
            { name: 'Barbell Bicep Curl', sets: 3, reps: '10-12', rest: '60s', tip: 'Squeeze biceps hard without rocking torso' },
          ],
        },
        {
          dayName: 'Day 3 - Wednesday',
          focus: 'Legs & Core',
          isRest: false,
          exercises: [
            { name: 'Barbell Back Squats', sets: 4, reps: '6-8', rest: '150s', tip: 'Keep knees out, depth parallel' },
            { name: 'Romanian Deadlift', sets: 3, reps: '8-10', rest: '90s', tip: 'Maintain neutral spine throughout' },
            { name: 'Leg Extensions', sets: 3, reps: '12-15', rest: '60s', tip: 'Hold at top for 1 full second' },
            { name: 'Lying Hamstring Curls', sets: 3, reps: '12-15', rest: '60s', tip: 'Avoid lifting hips from bench' },
            { name: 'Standing Calf Raises', sets: 4, reps: '15-20', rest: '60s', tip: 'Slow 3-second negative descent' },
          ],
        },
        {
          dayName: 'Day 4 - Thursday',
          focus: days >= 6 ? 'Push B (Hypertrophy)' : 'Active Rest / Cardio',
          isRest: days < 6,
          exercises: days >= 6 ? [
            { name: 'Incline Barbell Bench Press', sets: 4, reps: '8-10', rest: '90s', tip: 'Controlled eccentric descent' },
            { name: 'Dumbbell Flat Press', sets: 3, reps: '10-12', rest: '75s', tip: 'Full range of motion' },
            { name: 'Cable Lateral Raises', sets: 4, reps: '12-15', rest: '60s', tip: 'Constant tension across the curve' },
            { name: 'Overhead Dumbbell Tricep Extension', sets: 3, reps: '10-12', rest: '60s', tip: 'Deep stretch on long head' },
          ] : [],
        },
        {
          dayName: 'Day 5 - Friday',
          focus: days >= 6 ? 'Pull B (Hypertrophy)' : 'Upper Body Power',
          isRest: false,
          exercises: [
            { name: 'Seated Cable Row', sets: 4, reps: '10-12', rest: '90s', tip: 'Focus on middle traps and rhomboids' },
            { name: 'Close Grip Lat Pulldown', sets: 3, reps: '10-12', rest: '75s', tip: 'Drive elbows into side body' },
            { name: 'Dumbbell Hammer Curls', sets: 3, reps: '12-15', rest: '60s', tip: 'Targets brachialis and forearms' },
            { name: 'Incline Dumbbell Curl', sets: 3, reps: '10-12', rest: '60s', tip: 'Full bicep stretch' },
          ],
        },
        {
          dayName: 'Day 6 - Saturday',
          focus: days >= 6 ? 'Legs B (Hypertrophy)' : 'Lower Body Power',
          isRest: false,
          exercises: [
            { name: 'Hack Squat / Front Squat', sets: 3, reps: '8-10', rest: '120s', tip: 'Smooth transition at the bottom' },
            { name: 'Dumbbell Walking Lunges', sets: 3, reps: '12 steps/leg', rest: '75s', tip: 'Maintain upright posture' },
            { name: 'Seated Leg Curls', sets: 3, reps: '12-15', rest: '60s', tip: 'Control the weight back' },
            { name: 'Calf Raises & Cable Crunch', sets: 3, reps: '15-20', rest: '60s', tip: 'Crunch spine, do not pull with arms' },
          ],
        },
        { dayName: 'Day 7 - Sunday', focus: 'Rest & Full Recovery', isRest: true, exercises: [] },
      ],
    };
  }
}

export function generatePersonalizedPlan(input: UserStatsInput): GeneratedPlanResult {
  const { bmi, category: bmiCategory } = calculateBMI(input.weightKg, input.heightCm);
  const bmr = calculateBMR(input.weightKg, input.heightCm, input.age, input.gender);
  const tdee = calculateTDEE(bmr, input.activityLevel);

  let calorieAdjustment = 0;
  let ratePerWeekKg = 0;

  if (input.goal === 'cut') {
    calorieAdjustment = -450;
    ratePerWeekKg = 0.45;
  } else if (input.goal === 'bulk') {
    calorieAdjustment = 380;
    ratePerWeekKg = 0.32;
  } else {
    calorieAdjustment = 0;
    ratePerWeekKg = 0;
  }

  const minFloor = input.gender === 'female' ? 1200 : 1500;
  const rawTarget = tdee + calorieAdjustment;
  const dailyCalories = Math.max(minFloor, rawTarget);

  const weightDifference = Math.abs(input.weightKg - input.targetWeightKg);
  let estimatedWeeks = 0;
  if (ratePerWeekKg > 0 && weightDifference > 0) {
    estimatedWeeks = Math.max(1, Math.round(weightDifference / ratePerWeekKg));
  }

  const dailyMacros = calculateMacros(dailyCalories, input.weightKg, input.goal, input.dietType);
  const trainingCalories = dailyCalories + 100;
  const trainingMacros = calculateMacros(trainingCalories, input.weightKg, input.goal, input.dietType);
  const restCalories = Math.max(minFloor, dailyCalories - 100);
  const restMacros = calculateMacros(restCalories, input.weightKg, input.goal, input.dietType);

  const { splitName: recommendedSplit, plan: weeklyWorkoutPlan } = getRecommendedWorkoutSplit(
    input.workoutDaysPerWeek,
    input.experienceLevel,
    input.equipment
  );

  return {
    bmi,
    bmiCategory,
    bmr,
    tdee,
    dailyCalories,
    calorieAdjustment,
    ratePerWeekKg,
    estimatedWeeks,
    dailyMacros,
    trainingDayMacros: trainingMacros,
    restDayMacros: restMacros,
    recommendedSplit,
    weeklyWorkoutPlan,
  };
}
