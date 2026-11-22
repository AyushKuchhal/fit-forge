import db, { inTransaction } from './db';

export function seedExercisesAndPlans() {
  const existingExercises = db.prepare('SELECT COUNT(*) as count FROM exercises').get() as { count: number };
  if (existingExercises.count > 0) {
    return; // Already seeded
  }

  console.log('🌱 Seeding Exercises Library and Workout Plans...');

  const exercises = [
    // Chest
    { name: 'Barbell Flat Bench Press', muscle_group: 'Chest', equipment: 'Barbell', difficulty: 'Beginner', default_sets: 4, default_reps: '8-10', rest_seconds: 120, form_tip: 'Retract scapula and drive heels into ground. Do not flare elbows past 75°.' },
    { name: 'Incline Dumbbell Bench Press', muscle_group: 'Chest', equipment: 'Dumbbell', difficulty: 'Intermediate', default_sets: 3, default_reps: '10-12', rest_seconds: 90, form_tip: 'Set bench to 30-45° angle. Squeeze clavicular upper chest at apex.' },
    { name: 'Cable Chest Flyes', muscle_group: 'Chest', equipment: 'Cable', difficulty: 'Intermediate', default_sets: 3, default_reps: '12-15', rest_seconds: 60, form_tip: 'Slight elbow bend, bring pinkies together for peak sternal contraction.' },
    { name: 'Push-Ups', muscle_group: 'Chest', equipment: 'Bodyweight', difficulty: 'Beginner', default_sets: 3, default_reps: '15-20', rest_seconds: 60, form_tip: 'Maintain plank posture. Elbows tracking 45° back.' },
    { name: 'Dips (Chest Focus)', muscle_group: 'Chest', equipment: 'Bodyweight', difficulty: 'Intermediate', default_sets: 3, default_reps: '8-12', rest_seconds: 90, form_tip: 'Lean torso forward 30° to target lower chest.' },

    // Back
    { name: 'Barbell Conventional Deadlift', muscle_group: 'Back', equipment: 'Barbell', difficulty: 'Advanced', default_sets: 3, default_reps: '5', rest_seconds: 180, form_tip: 'Take slack out of bar. Engage lats and push floor away with heels.' },
    { name: 'Barbell Bent Over Row', muscle_group: 'Back', equipment: 'Barbell', difficulty: 'Intermediate', default_sets: 4, default_reps: '8-10', rest_seconds: 90, form_tip: 'Torso angled at 45°. Pull towards lower ribcage.' },
    { name: 'Lat Pulldown', muscle_group: 'Back', equipment: 'Cable', difficulty: 'Beginner', default_sets: 3, default_reps: '10-12', rest_seconds: 75, form_tip: 'Depress shoulders first, drive elbows towards back pockets.' },
    { name: 'Pull-Ups / Chin-Ups', muscle_group: 'Back', equipment: 'Bodyweight', difficulty: 'Intermediate', default_sets: 3, default_reps: '6-10', rest_seconds: 90, form_tip: 'Full hanging stretch at bottom, clear chin above bar.' },
    { name: 'Single-Arm Dumbbell Row', muscle_group: 'Back', equipment: 'Dumbbell', difficulty: 'Beginner', default_sets: 3, default_reps: '10-12', rest_seconds: 60, form_tip: 'Keep torso still. Pull dumbbell in an arc towards hip.' },
    { name: 'Seated Cable Row', muscle_group: 'Back', equipment: 'Cable', difficulty: 'Beginner', default_sets: 3, default_reps: '10-12', rest_seconds: 75, form_tip: 'Avoid leaning excessively back and forward. Squeeze rhomboids.' },

    // Shoulders
    { name: 'Overhead Barbell Military Press', muscle_group: 'Shoulders', equipment: 'Barbell', difficulty: 'Intermediate', default_sets: 4, default_reps: '6-8', rest_seconds: 120, form_tip: 'Squeeze glutes and abs tight. Lock out head through arms at top.' },
    { name: 'Seated Dumbbell Shoulder Press', muscle_group: 'Shoulders', equipment: 'Dumbbell', difficulty: 'Beginner', default_sets: 3, default_reps: '8-10', rest_seconds: 90, form_tip: 'Palms slightly angled in (scapular plane) to protect rotator cuff.' },
    { name: 'Dumbbell Lateral Raises', muscle_group: 'Shoulders', equipment: 'Dumbbell', difficulty: 'Beginner', default_sets: 4, default_reps: '12-15', rest_seconds: 60, form_tip: 'Lead slightly with elbows. Do not shrug upper traps.' },
    { name: 'Cable Lateral Raise', muscle_group: 'Shoulders', equipment: 'Cable', difficulty: 'Intermediate', default_sets: 3, default_reps: '15', rest_seconds: 60, form_tip: 'Cross cable behind back for constant lateral delt resistance.' },
    { name: 'Face Pulls', muscle_group: 'Shoulders', equipment: 'Cable', difficulty: 'Beginner', default_sets: 4, default_reps: '15-20', rest_seconds: 60, form_tip: 'Pull rope towards eyes, rotate thumbs back at end of rep.' },

    // Legs & Glutes
    { name: 'Barbell Back Squat', muscle_group: 'Legs', equipment: 'Barbell', difficulty: 'Intermediate', default_sets: 4, default_reps: '6-8', rest_seconds: 150, form_tip: 'Brace abdominal wall with valsalva. Descend below parallel.' },
    { name: 'Romanian Deadlift (RDL)', muscle_group: 'Legs', equipment: 'Barbell', difficulty: 'Intermediate', default_sets: 4, default_reps: '8-10', rest_seconds: 120, form_tip: 'Hinge hips backward with soft knee bend. Stop when hamstrings are stretched.' },
    { name: 'Leg Press', muscle_group: 'Legs', equipment: 'Machine', difficulty: 'Beginner', default_sets: 3, default_reps: '10-12', rest_seconds: 90, form_tip: 'Feet shoulder-width apart. Do not lock knees abruptly at top.' },
    { name: 'Bulgarian Split Squats', muscle_group: 'Legs', equipment: 'Dumbbell', difficulty: 'Intermediate', default_sets: 3, default_reps: '10-12', rest_seconds: 90, form_tip: 'Rear foot laces down on bench. 70% weight on lead leg.' },
    { name: 'Lying Leg Curls', muscle_group: 'Legs', equipment: 'Machine', difficulty: 'Beginner', default_sets: 3, default_reps: '12-15', rest_seconds: 60, form_tip: 'Keep pelvis pressed against pad to isolate hamstrings.' },
    { name: 'Leg Extensions', muscle_group: 'Legs', equipment: 'Machine', difficulty: 'Beginner', default_sets: 3, default_reps: '12-15', rest_seconds: 60, form_tip: 'Pause 1 second at top contraction. Control the eccentric.' },
    { name: 'Goblet Squats', muscle_group: 'Legs', equipment: 'Dumbbell', difficulty: 'Beginner', default_sets: 3, default_reps: '12', rest_seconds: 75, form_tip: 'Hold dumbbell vertically at chest. Great for squat mobility.' },

    // Calves
    { name: 'Standing Calf Raises', muscle_group: 'Calves', equipment: 'Machine', difficulty: 'Beginner', default_sets: 4, default_reps: '15-20', rest_seconds: 60, form_tip: 'Pause for 2 seconds in the stretched bottom position.' },
    { name: 'Seated Calf Raise', muscle_group: 'Calves', equipment: 'Machine', difficulty: 'Beginner', default_sets: 3, default_reps: '15', rest_seconds: 60, form_tip: 'Targets the deep soleus muscle. Smooth controlled cadence.' },

    // Biceps & Forearms
    { name: 'Barbell Bicep Curl', muscle_group: 'Biceps', equipment: 'Barbell', difficulty: 'Beginner', default_sets: 3, default_reps: '10-12', rest_seconds: 60, form_tip: 'Keep elbows fixed at sides. Avoid momentum swinging.' },
    { name: 'Incline Dumbbell Curl', muscle_group: 'Biceps', equipment: 'Dumbbell', difficulty: 'Intermediate', default_sets: 3, default_reps: '10-12', rest_seconds: 60, form_tip: 'Full stretch of long head behind torso. Supinate at peak.' },
    { name: 'Hammer Curls', muscle_group: 'Biceps', equipment: 'Dumbbell', difficulty: 'Beginner', default_sets: 3, default_reps: '12-15', rest_seconds: 60, form_tip: 'Neutral grip (palms inward) builds brachialis & forearm thickness.' },
    { name: 'Preacher Curl', muscle_group: 'Biceps', equipment: 'Machine', difficulty: 'Beginner', default_sets: 3, default_reps: '10-12', rest_seconds: 60, form_tip: 'Arms flat against pad. Eliminates shoulder assistance.' },

    // Triceps
    { name: 'Tricep Rope Pushdown', muscle_group: 'Triceps', equipment: 'Cable', difficulty: 'Beginner', default_sets: 3, default_reps: '12-15', rest_seconds: 60, form_tip: 'Spread rope apart at bottom for lateral head contraction.' },
    { name: 'Skull Crushers (EZ Bar)', muscle_group: 'Triceps', equipment: 'Barbell', difficulty: 'Intermediate', default_sets: 3, default_reps: '10-12', rest_seconds: 75, form_tip: 'Lower bar towards forehead or crown of head. Keep elbows tucked.' },
    { name: 'Overhead Cable Tricep Extension', muscle_group: 'Triceps', equipment: 'Cable', difficulty: 'Intermediate', default_sets: 3, default_reps: '12-15', rest_seconds: 60, form_tip: 'Stretches long head under load. Do not flare elbows outwards.' },
    { name: 'Close-Grip Bench Press', muscle_group: 'Triceps', equipment: 'Barbell', difficulty: 'Intermediate', default_sets: 3, default_reps: '8-10', rest_seconds: 90, form_tip: 'Hands shoulder-width apart. Focus on tricep lockout.' },

    // Core & Abs
    { name: 'Hanging Leg / Knee Raises', muscle_group: 'Core', equipment: 'Bodyweight', difficulty: 'Intermediate', default_sets: 3, default_reps: '12-15', rest_seconds: 60, form_tip: 'Curl hips upward towards ribs. Avoid swinging momentum.' },
    { name: 'Cable Rope Crunch', muscle_group: 'Core', equipment: 'Cable', difficulty: 'Beginner', default_sets: 3, default_reps: '15-20', rest_seconds: 60, form_tip: 'Kneel down, flex spine to bring elbows towards thighs.' },
    { name: 'Ab Wheel Rollout', muscle_group: 'Core', equipment: 'Bodyweight', difficulty: 'Advanced', default_sets: 3, default_reps: '10-12', rest_seconds: 60, form_tip: 'Tuck pelvis, do not allow lower back to arch at extension.' },
    { name: 'Standard Plank Hold', muscle_group: 'Core', equipment: 'Bodyweight', difficulty: 'Beginner', default_sets: 3, default_reps: '45-60s', rest_seconds: 45, form_tip: 'Squeeze glutes, push floor away through forearms.' }
  ];

  const insertEx = db.prepare(`
    INSERT INTO exercises (name, muscle_group, equipment, difficulty, default_sets, default_reps, rest_seconds, form_tip)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  inTransaction(() => {
    for (const item of exercises) {
      insertEx.run(item.name, item.muscle_group, item.equipment, item.difficulty, item.default_sets, item.default_reps, item.rest_seconds, item.form_tip);
    }
  });

  // Now Seed Pre-built Workout Plans
  const plans = [
    // 1. Bulk Plans
    {
      id: 'bulk_inter_ppl',
      name: 'Hypertrophy Surge PPL',
      goal: 'bulk',
      level: 'intermediate',
      split: 'ppl',
      description: 'Classic 6-day Push/Pull/Legs program engineered for maximum muscular size and strength gains in a caloric surplus.',
      days_count: 6,
      days: [
        {
          day_number: 1,
          day_name: 'Day 1 - Push A (Strength Focus)',
          focus: 'Chest, Front Delts, Triceps',
          exercises: [
            { exercise_name: 'Barbell Flat Bench Press', sets: 4, reps: '6-8', rest: '120s', tip: 'Control the descent, touch lower chest, press explosively.' },
            { exercise_name: 'Overhead Barbell Military Press', sets: 3, reps: '6-8', rest: '90s', tip: 'Squeeze glutes to protect lower spine.' },
            { exercise_name: 'Incline Dumbbell Bench Press', sets: 3, reps: '10-12', rest: '75s', tip: '30° incline for upper chest stretch.' },
            { exercise_name: 'Dumbbell Lateral Raises', sets: 4, reps: '12-15', rest: '60s', tip: 'Control the negative on every rep.' },
            { exercise_name: 'Skull Crushers (EZ Bar)', sets: 3, reps: '10-12', rest: '60s', tip: 'Keep elbows tucked inwards.' }
          ]
        },
        {
          day_number: 2,
          day_name: 'Day 2 - Pull A (Strength Focus)',
          focus: 'Back, Rear Delts, Biceps',
          exercises: [
            { exercise_name: 'Barbell Conventional Deadlift', sets: 3, reps: '5', rest: '180s', tip: 'Maintain flat spine, pull chest up.' },
            { exercise_name: 'Lat Pulldown', sets: 3, reps: '8-10', rest: '90s', tip: 'Drive elbows down into pockets.' },
            { exercise_name: 'Single-Arm Dumbbell Row', sets: 3, reps: '10-12', rest: '75s', tip: 'Pull toward hip crease.' },
            { exercise_name: 'Face Pulls', sets: 4, reps: '15', rest: '60s', tip: 'Hold contraction for 1 second.' },
            { exercise_name: 'Barbell Bicep Curl', sets: 3, reps: '10-12', rest: '60s', tip: 'Strict form, no swinging.' }
          ]
        },
        {
          day_number: 3,
          day_name: 'Day 3 - Legs A (Quad Focus)',
          focus: 'Quads, Hamstrings, Calves',
          exercises: [
            { exercise_name: 'Barbell Back Squat', sets: 4, reps: '6-8', rest: '150s', tip: 'Breathe into abdomen, hit parallel.' },
            { exercise_name: 'Romanian Deadlift (RDL)', sets: 3, reps: '8-10', rest: '90s', tip: 'Push hips backward.' },
            { exercise_name: 'Leg Press', sets: 3, reps: '10-12', rest: '90s', tip: 'Full depth without tailbone tuck.' },
            { exercise_name: 'Lying Leg Curls', sets: 3, reps: '12-15', rest: '60s', tip: 'Slow 2-second eccentric.' },
            { exercise_name: 'Standing Calf Raises', sets: 4, reps: '15', rest: '60s', tip: '2s pause at bottom stretch.' }
          ]
        },
        {
          day_number: 4,
          day_name: 'Day 4 - Push B (Hypertrophy)',
          focus: 'Upper Chest, Delts, Triceps',
          exercises: [
            { exercise_name: 'Incline Dumbbell Bench Press', sets: 4, reps: '8-10', rest: '90s', tip: 'Full clavicular contraction.' },
            { exercise_name: 'Cable Chest Flyes', sets: 3, reps: '12-15', rest: '60s', tip: 'Deep chest stretch.' },
            { exercise_name: 'Seated Dumbbell Shoulder Press', sets: 3, reps: '10-12', rest: '75s', tip: 'Smooth rhythm.' },
            { exercise_name: 'Cable Lateral Raise', sets: 4, reps: '12-15', rest: '60s', tip: 'Constant tension throughout.' },
            { exercise_name: 'Tricep Rope Pushdown', sets: 3, reps: '12-15', rest: '60s', tip: 'Lockout and flare.' }
          ]
        },
        {
          day_number: 5,
          day_name: 'Day 5 - Pull B (Hypertrophy)',
          focus: 'Lats, Rhomboids, Biceps',
          exercises: [
            { exercise_name: 'Barbell Bent Over Row', sets: 4, reps: '8-10', rest: '90s', tip: 'Pull to sternum.' },
            { exercise_name: 'Pull-Ups / Chin-Ups', sets: 3, reps: '8-10', rest: '90s', tip: 'Full range of motion.' },
            { exercise_name: 'Seated Cable Row', sets: 3, reps: '10-12', rest: '75s', tip: 'Squeeze shoulder blades.' },
            { exercise_name: 'Incline Dumbbell Curl', sets: 3, reps: '10-12', rest: '60s', tip: 'Deep long head stretch.' },
            { exercise_name: 'Hammer Curls', sets: 3, reps: '12-15', rest: '60s', tip: 'Build forearm thickness.' }
          ]
        },
        {
          day_number: 6,
          day_name: 'Day 6 - Legs B (Posterior Chain)',
          focus: 'Hamstrings, Glutes, Calves',
          exercises: [
            { exercise_name: 'Bulgarian Split Squats', sets: 3, reps: '10-12 per leg', rest: '90s', tip: 'Load front heel.' },
            { exercise_name: 'Leg Extensions', sets: 3, reps: '12-15', rest: '60s', tip: 'Quad pump finisher.' },
            { exercise_name: 'Lying Leg Curls', sets: 4, reps: '10-12', rest: '75s', tip: 'Full hamstring squeeze.' },
            { exercise_name: 'Seated Calf Raise', sets: 4, reps: '15-20', rest: '60s', tip: 'Full range of motion.' },
            { exercise_name: 'Hanging Leg / Knee Raises', sets: 3, reps: '15', rest: '60s', tip: 'Control the eccentric.' }
          ]
        }
      ]
    },

    // 2. Cut Plans
    {
      id: 'cut_inter_upper_lower',
      name: 'Shred & Preserve Upper/Lower',
      goal: 'cut',
      level: 'intermediate',
      split: 'upper_lower',
      description: '4-day intense Upper/Lower split designed to maintain maximum lean muscle tissue while in a caloric deficit.',
      days_count: 4,
      days: [
        {
          day_number: 1,
          day_name: 'Day 1 - Upper Power',
          focus: 'Chest, Back, Shoulders',
          exercises: [
            { exercise_name: 'Barbell Flat Bench Press', sets: 4, reps: '6-8', rest: '120s', tip: 'Heavy strength signal to preserve muscle mass.' },
            { exercise_name: 'Barbell Bent Over Row', sets: 4, reps: '6-8', rest: '120s', tip: 'Solid back tension.' },
            { exercise_name: 'Overhead Barbell Military Press', sets: 3, reps: '8-10', rest: '90s', tip: 'Tight core bracing.' },
            { exercise_name: 'Lat Pulldown', sets: 3, reps: '8-10', rest: '90s', tip: 'Full lat recruitment.' },
            { exercise_name: 'Tricep Rope Pushdown', sets: 3, reps: '10-12', rest: '60s', tip: 'Lockout cleanly.' }
          ]
        },
        {
          day_number: 2,
          day_name: 'Day 2 - Lower Power',
          focus: 'Quads, Hamstrings, Calves',
          exercises: [
            { exercise_name: 'Barbell Back Squat', sets: 4, reps: '6-8', rest: '150s', tip: 'Preserve leg density during calorie cut.' },
            { exercise_name: 'Romanian Deadlift (RDL)', sets: 3, reps: '8-10', rest: '120s', tip: 'Hamstring stretch focus.' },
            { exercise_name: 'Leg Press', sets: 3, reps: '10-12', rest: '90s', tip: 'Continuous quad tension.' },
            { exercise_name: 'Standing Calf Raises', sets: 4, reps: '12-15', rest: '60s', tip: 'Full range.' },
            { exercise_name: 'Standard Plank Hold', sets: 3, reps: '45-60s', rest: '45s', tip: 'Tight abdominal hollow body.' }
          ]
        },
        {
          day_number: 3,
          day_name: 'Day 3 - Upper Hypertrophy',
          focus: 'Upper Body Pump & Conditioning',
          exercises: [
            { exercise_name: 'Incline Dumbbell Bench Press', sets: 3, reps: '10-12', rest: '90s', tip: 'Upper chest focus.' },
            { exercise_name: 'Seated Cable Row', sets: 3, reps: '10-12', rest: '75s', tip: 'Mid-back thickness.' },
            { exercise_name: 'Dumbbell Lateral Raises', sets: 4, reps: '12-15', rest: '60s', tip: 'Side delt shoulder caps.' },
            { exercise_name: 'Incline Dumbbell Curl', sets: 3, reps: '10-12', rest: '60s', tip: 'Full bicep stretch.' },
            { exercise_name: 'Face Pulls', sets: 3, reps: '15', rest: '60s', tip: 'Postural health.' }
          ]
        },
        {
          day_number: 4,
          day_name: 'Day 4 - Lower Hypertrophy & Core',
          focus: 'Leg Definition & Core',
          exercises: [
            { exercise_name: 'Bulgarian Split Squats', sets: 3, reps: '10-12 per leg', rest: '90s', tip: 'High caloric output unilateral work.' },
            { exercise_name: 'Lying Leg Curls', sets: 3, reps: '12-15', rest: '60s', tip: 'Control down.' },
            { exercise_name: 'Leg Extensions', sets: 3, reps: '12-15', rest: '60s', tip: 'Squeeze quads at top.' },
            { exercise_name: 'Hanging Leg / Knee Raises', sets: 3, reps: '12-15', rest: '60s', tip: 'Flex spine into ribs.' },
            { exercise_name: 'Cable Rope Crunch', sets: 3, reps: '15-20', rest: '60s', tip: 'Core flexion.' }
          ]
        }
      ]
    },

    // 3. Maintenance Full Body Plan
    {
      id: 'maintain_begin_full_body',
      name: 'Foundation Full Body (3-Day)',
      goal: 'maintain',
      level: 'beginner',
      split: 'full_body',
      description: 'Time-efficient 3-day routine targeting the whole body every session for baseline strength, joint health, and body composition maintenance.',
      days_count: 3,
      days: [
        {
          day_number: 1,
          day_name: 'Day 1 - Full Body A',
          focus: 'Compound Strength',
          exercises: [
            { exercise_name: 'Barbell Flat Bench Press', sets: 3, reps: '8-10', rest: '90s', tip: 'Controlled reps.' },
            { exercise_name: 'Barbell Back Squat', sets: 3, reps: '8-10', rest: '120s', tip: 'Good depth.' },
            { exercise_name: 'Lat Pulldown', sets: 3, reps: '10-12', rest: '75s', tip: 'Squeeze lats.' },
            { exercise_name: 'Seated Dumbbell Shoulder Press', sets: 3, reps: '10-12', rest: '75s', tip: 'Smooth pressing.' },
            { exercise_name: 'Standard Plank Hold', sets: 3, reps: '45s', rest: '60s', tip: 'Brace core.' }
          ]
        },
        {
          day_number: 2,
          day_name: 'Day 2 - Full Body B',
          focus: 'Posterior & Pulling',
          exercises: [
            { exercise_name: 'Romanian Deadlift (RDL)', sets: 3, reps: '8-10', rest: '90s', tip: 'Feel the hamstrings.' },
            { exercise_name: 'Incline Dumbbell Bench Press', sets: 3, reps: '10-12', rest: '75s', tip: 'Incline squeeze.' },
            { exercise_name: 'Barbell Bent Over Row', sets: 3, reps: '8-10', rest: '90s', tip: 'Flat spine.' },
            { exercise_name: 'Dumbbell Lateral Raises', sets: 3, reps: '12-15', rest: '60s', tip: 'Side delts.' },
            { exercise_name: 'Barbell Bicep Curl', sets: 3, reps: '10-12', rest: '60s', tip: 'Strict form.' }
          ]
        },
        {
          day_number: 3,
          day_name: 'Day 3 - Full Body C',
          focus: 'Endurance & Core',
          exercises: [
            { exercise_name: 'Goblet Squats', sets: 3, reps: '12-15', rest: '75s', tip: 'Knees tracking over toes.' },
            { exercise_name: 'Push-Ups', sets: 3, reps: '12-15', rest: '60s', tip: 'Chest to floor.' },
            { exercise_name: 'Seated Cable Row', sets: 3, reps: '10-12', rest: '75s', tip: 'Rhomboid squeeze.' },
            { exercise_name: 'Tricep Rope Pushdown', sets: 3, reps: '12-15', rest: '60s', tip: 'Full extension.' },
            { exercise_name: 'Hanging Leg / Knee Raises', sets: 3, reps: '12', rest: '60s', tip: 'Controlled legs.' }
          ]
        }
      ]
    },

    // 4. Bro Split Plan (5-Day Bodypart Split)
    {
      id: 'bulk_inter_bro_split',
      name: 'Old-School Bodypart Bro Split',
      goal: 'bulk',
      level: 'intermediate',
      split: 'bro_split',
      description: 'Dedicated single muscle group specialization each day (Chest, Back, Shoulders, Legs, Arms) for intense targeted volume and pump.',
      days_count: 5,
      days: [
        {
          day_number: 1,
          day_name: 'Day 1 - Chest Annihilation',
          focus: 'Chest & Abs',
          exercises: [
            { exercise_name: 'Barbell Flat Bench Press', sets: 4, reps: '8-10', rest: '120s', tip: 'Heavy sets.' },
            { exercise_name: 'Incline Dumbbell Bench Press', sets: 4, reps: '10-12', rest: '90s', tip: 'Incline volume.' },
            { exercise_name: 'Cable Chest Flyes', sets: 3, reps: '12-15', rest: '60s', tip: 'Chest pump.' },
            { exercise_name: 'Dips (Chest Focus)', sets: 3, reps: '10-12', rest: '75s', tip: 'Lean forward.' },
            { exercise_name: 'Cable Rope Crunch', sets: 3, reps: '15-20', rest: '60s', tip: 'Ab burn.' }
          ]
        },
        {
          day_number: 2,
          day_name: 'Day 2 - Back & Lats',
          focus: 'Back Thickness & Width',
          exercises: [
            { exercise_name: 'Barbell Conventional Deadlift', sets: 3, reps: '5', rest: '180s', tip: 'Heavy pull.' },
            { exercise_name: 'Pull-Ups / Chin-Ups', sets: 4, reps: '8-10', rest: '90s', tip: 'Full stretch.' },
            { exercise_name: 'Barbell Bent Over Row', sets: 4, reps: '8-10', rest: '90s', tip: 'Torso locked.' },
            { exercise_name: 'Seated Cable Row', sets: 3, reps: '12', rest: '60s', tip: 'Middle back.' }
          ]
        },
        {
          day_number: 3,
          day_name: 'Day 3 - Shoulder Boulder',
          focus: 'Delts & Traps',
          exercises: [
            { exercise_name: 'Overhead Barbell Military Press', sets: 4, reps: '6-8', rest: '120s', tip: 'Strict press.' },
            { exercise_name: 'Dumbbell Lateral Raises', sets: 4, reps: '12-15', rest: '60s', tip: 'Side delt burn.' },
            { exercise_name: 'Seated Dumbbell Shoulder Press', sets: 3, reps: '10-12', rest: '75s', tip: 'Full overhead lock.' },
            { exercise_name: 'Face Pulls', sets: 4, reps: '15', rest: '60s', tip: 'Rear delts.' }
          ]
        },
        {
          day_number: 4,
          day_name: 'Day 4 - Quad & Hamstring Mastery',
          focus: 'Legs & Calves',
          exercises: [
            { exercise_name: 'Barbell Back Squat', sets: 4, reps: '6-8', rest: '150s', tip: 'Deep squats.' },
            { exercise_name: 'Romanian Deadlift (RDL)', sets: 3, reps: '8-10', rest: '120s', tip: 'Hamstrings.' },
            { exercise_name: 'Leg Press', sets: 3, reps: '12', rest: '90s', tip: 'Heavy leg drive.' },
            { exercise_name: 'Standing Calf Raises', sets: 4, reps: '15-20', rest: '60s', tip: 'Full stretch.' }
          ]
        },
        {
          day_number: 5,
          day_name: 'Day 5 - Arm Day (Guns)',
          focus: 'Biceps & Triceps Super-Volume',
          exercises: [
            { exercise_name: 'Barbell Bicep Curl', sets: 4, reps: '8-10', rest: '75s', tip: 'Bicep peak.' },
            { exercise_name: 'Skull Crushers (EZ Bar)', sets: 4, reps: '8-10', rest: '75s', tip: 'Tricep extension.' },
            { exercise_name: 'Incline Dumbbell Curl', sets: 3, reps: '10-12', rest: '60s', tip: 'Bicep stretch.' },
            { exercise_name: 'Tricep Rope Pushdown', sets: 3, reps: '12-15', rest: '60s', tip: 'Lockout flare.' },
            { exercise_name: 'Hammer Curls', sets: 3, reps: '12-15', rest: '60s', tip: 'Brachialis.' }
          ]
        }
      ]
    }
  ];

  const insertPlan = db.prepare(`
    INSERT INTO workout_plans (id, name, goal, level, split, description, days_count)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPlanDay = db.prepare(`
    INSERT INTO plan_days (plan_id, day_number, day_name, focus)
    VALUES (?, ?, ?, ?)
  `);

  const insertPlanEx = db.prepare(`
    INSERT INTO plan_day_exercises (day_id, exercise_name, sets, reps, rest, tip)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  inTransaction(() => {
    for (const plan of plans) {
      insertPlan.run(plan.id, plan.name, plan.goal, plan.level, plan.split, plan.description, plan.days_count);
      for (const day of plan.days) {
        const info = insertPlanDay.run(plan.id, day.day_number, day.day_name, day.focus);
        const dayId = Number(info.lastInsertRowid);
        for (const ex of day.exercises) {
          insertPlanEx.run(dayId, ex.exercise_name, ex.sets, ex.reps, ex.rest, ex.tip);
        }
      }
    }
  });

  console.log(`✅ Seeded ${exercises.length} exercises and ${plans.length} detailed workout plans.`);
}
