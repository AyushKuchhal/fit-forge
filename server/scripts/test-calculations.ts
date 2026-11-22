import {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateMacros,
  generatePersonalizedPlan,
} from '../src/utils/fitnessCalculators';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('--- RUNNING FITNESS CALCULATIONS UNIT TESTS ---\n');

// 1. Test BMI Calculation
{
  const test1 = calculateBMI(70, 175);
  assert(test1.bmi === 22.9, `BMI calculation: expected 22.9, got ${test1.bmi}`);
  assert(test1.category === 'Normal weight', `BMI category: expected Normal weight, got ${test1.category}`);

  const test2 = calculateBMI(95, 175);
  assert(test2.bmi === 31.0, `BMI obese check: expected 31.0, got ${test2.bmi}`);
  assert(test2.category === 'Obese', `BMI category: expected Obese, got ${test2.category}`);
}

// 2. Test BMR (Mifflin-St Jeor)
{
  const maleBMR = calculateBMR(80, 180, 25, 'male');
  assert(maleBMR === 1805, `Male BMR Mifflin-St Jeor: expected 1805, got ${maleBMR}`);

  const femaleBMR = calculateBMR(60, 165, 28, 'female');
  assert(femaleBMR === 1330, `Female BMR Mifflin-St Jeor: expected 1330, got ${femaleBMR}`);
}

// 3. Test TDEE Multipliers
{
  const bmr = 1800;
  assert(calculateTDEE(bmr, 'sedentary') === 2160, 'TDEE Sedentary (1.2x)');
  assert(calculateTDEE(bmr, 'light') === 2475, 'TDEE Lightly active (1.375x)');
  assert(calculateTDEE(bmr, 'moderate') === 2790, 'TDEE Moderately active (1.55x)');
  assert(calculateTDEE(bmr, 'very_active') === 3105, 'TDEE Very active (1.725x)');
  assert(calculateTDEE(bmr, 'extra_active') === 3420, 'TDEE Extra active (1.9x)');
}

// 4. Test Macro Splits
{
  const cutMacros = calculateMacros(2000, 75, 'cut');
  assert(cutMacros.proteinGrams > 150, `Cut Protein >= 150g, got ${cutMacros.proteinGrams}g`);
  assert(cutMacros.fatGrams > 45 && cutMacros.fatGrams < 65, `Cut Fat in range, got ${cutMacros.fatGrams}g`);
  assert(cutMacros.carbsGrams > 150, `Cut Carbs in range, got ${cutMacros.carbsGrams}g`);
  assert(cutMacros.proteinPercent + cutMacros.fatPercent + cutMacros.carbsPercent === 100, 'Percentages sum to 100%');
}

// 5. Test Full Plan Generation
{
  const plan = generatePersonalizedPlan({
    age: 26,
    gender: 'male',
    heightCm: 178,
    weightKg: 82,
    activityLevel: 'moderate',
    goal: 'cut',
    targetWeightKg: 75,
    experienceLevel: 'intermediate',
    workoutDaysPerWeek: 4,
    equipment: 'full_gym',
    dietType: 'non_veg',
  });

  assert(plan.dailyCalories > 1500, `Safe calories floor respected: ${plan.dailyCalories} kcal`);
  assert(plan.recommendedSplit === 'Upper / Lower (4-Day)', `Matched 4-day split: ${plan.recommendedSplit}`);
  assert(plan.estimatedWeeks > 0, `Estimated timeline calculated: ${plan.estimatedWeeks} weeks`);
  assert(plan.weeklyWorkoutPlan.length === 7, `Full 7-day schedule returned, count: ${plan.weeklyWorkoutPlan.length}`);
}

console.log('\n🎉 ALL UNIT TESTS PASSED SUCCESSFULLY!\n');
