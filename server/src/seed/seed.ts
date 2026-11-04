import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FitTrack Database Seeding...');

  // 1. Seed Exercises Catalog
  const exerciseData = [
    // Chest
    {
      name: 'Barbell Bench Press',
      slug: 'barbell-bench-press',
      category: 'Strength',
      muscleGroup: 'Chest',
      secondaryMuscles: 'Triceps, Front Delts',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      instructions: 'Lie flat on the bench with eyes under the bar. Grip bar slightly wider than shoulder width. Retract scapula, lower bar to mid-chest with elbows at ~45 degrees, then press explosively to lockout.',
      tips: 'Keep feet flat on floor and drive through heels. Avoid flaring elbows out to 90 degrees.',
    },
    {
      name: 'Incline Dumbbell Press',
      slug: 'incline-dumbbell-press',
      category: 'Strength',
      muscleGroup: 'Chest',
      secondaryMuscles: 'Front Delts, Triceps',
      equipment: 'Dumbbell',
      difficulty: 'Intermediate',
      instructions: 'Set bench to 30-45 degrees. Press dumbbells up from shoulder level until arms are extended, squeezing upper pecs at peak.',
      tips: 'Do not angle bench too high (>45°) or anterior deltoids will dominate.',
    },
    {
      name: 'Cable Chest Fly',
      slug: 'cable-chest-fly',
      category: 'Strength',
      muscleGroup: 'Chest',
      secondaryMuscles: 'Front Delts',
      equipment: 'Cable',
      difficulty: 'Beginner',
      instructions: 'Stand between pulleys with slight forward torso lean. Bring handles together in a hugging motion with slight elbow bend.',
      tips: 'Maintain steady elbow curvature throughout movement to isolate chest.',
    },
    {
      name: 'Parallel Bar Dips',
      slug: 'parallel-bar-dips',
      category: 'Strength',
      muscleGroup: 'Chest',
      secondaryMuscles: 'Triceps, Shoulders',
      equipment: 'Bodyweight',
      difficulty: 'Intermediate',
      instructions: 'Lean torso slightly forward (~30 degrees) to emphasize chest. Lower until elbows reach 90 degrees, then push back up.',
      tips: 'Avoid sinking too deep if you have anterior shoulder discomfort.',
    },

    // Back
    {
      name: 'Conventional Barbell Deadlift',
      slug: 'barbell-deadlift',
      category: 'Strength',
      muscleGroup: 'Back',
      secondaryMuscles: 'Hamstrings, Glutes, Forearms, Core',
      equipment: 'Barbell',
      difficulty: 'Advanced',
      instructions: 'Stand with feet hip-width, barbell over mid-foot. Hinge down and grip bar. Pull slack out, brace core, drive the floor away through midfoot until fully standing upright.',
      tips: 'Never round lower back under load. Lock out with glute contraction, not hyperextending lower spine.',
    },
    {
      name: 'Pull-Ups',
      slug: 'pull-ups',
      category: 'Strength',
      muscleGroup: 'Back',
      secondaryMuscles: 'Biceps, Forearms, Rear Delts',
      equipment: 'Bodyweight',
      difficulty: 'Intermediate',
      instructions: 'Hang from pull-up bar with overhand grip wider than shoulders. Drive elbows down and back until chin clears the bar.',
      tips: 'Initiate by depressing scapula before bending arms.',
    },
    {
      name: 'Bent-Over Barbell Row',
      slug: 'bent-over-barbell-row',
      category: 'Strength',
      muscleGroup: 'Back',
      secondaryMuscles: 'Biceps, Rear Delts, Erector Spinae',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      instructions: 'Hinge hips to 45 degrees with flat spine. Pull barbell towards lower ribcage/navel, squeezing latissimus dorsi and rhomboids.',
      tips: 'Avoid using violent torso momentum to yank the weight.',
    },
    {
      name: 'Lat Pulldown',
      slug: 'lat-pulldown',
      category: 'Strength',
      muscleGroup: 'Back',
      secondaryMuscles: 'Biceps, Rear Delts',
      equipment: 'Cable',
      difficulty: 'Beginner',
      instructions: 'Sit comfortably under thigh pads. Grasp wide bar and pull down smoothly to upper collarbone with slight lean.',
      tips: 'Focus on pulling through the elbows rather than yanking with hands.',
    },

    // Legs
    {
      name: 'Barbell Back Squat',
      slug: 'barbell-back-squat',
      category: 'Strength',
      muscleGroup: 'Legs',
      secondaryMuscles: 'Glutes, Hamstrings, Core, Lower Back',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      instructions: 'Rest bar across traps. Feet shoulder-width apart. Inhale, brace core, break at hips and knees, descend to parallel depth, and drive upward forcefully.',
      tips: 'Ensure knees track in the direction of toes throughout descent and ascent.',
    },
    {
      name: 'Romanian Deadlift (RDL)',
      slug: 'romanian-deadlift',
      category: 'Strength',
      muscleGroup: 'Legs',
      secondaryMuscles: 'Hamstrings, Glutes, Lower Back',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      instructions: 'Hold bar in front of thighs with slight knee bend. Push hips back as far as possible while lowering bar down shins until deep hamstring stretch.',
      tips: 'Think of hips reaching for the wall behind you rather than bending over.',
    },
    {
      name: 'Leg Press',
      slug: 'leg-press',
      category: 'Strength',
      muscleGroup: 'Legs',
      secondaryMuscles: 'Glutes, Hamstrings',
      equipment: 'Machine',
      difficulty: 'Beginner',
      instructions: 'Sit firmly in sled machine. Place feet shoulder-width on platform. Lower sled under control until knees reach 90 degrees, press back up.',
      tips: 'Never lock out knees forcefully at top of extension.',
    },
    {
      name: 'Walking Dumbbell Lunges',
      slug: 'walking-dumbbell-lunges',
      category: 'Strength',
      muscleGroup: 'Legs',
      secondaryMuscles: 'Glutes, Calves, Core',
      equipment: 'Dumbbell',
      difficulty: 'Intermediate',
      instructions: 'Hold dumbbells at sides. Step forward into lunge, lowering back knee towards floor. Drive off front foot directly into next stride.',
      tips: 'Maintain tall upright posture; do not collapse chest onto front knee.',
    },
    {
      name: 'Standing Calf Raise',
      slug: 'standing-calf-raise',
      category: 'Strength',
      muscleGroup: 'Legs',
      secondaryMuscles: 'Achilles',
      equipment: 'Machine',
      difficulty: 'Beginner',
      instructions: 'Position balls of feet on step edge. Lower heels for a full 2-second calf stretch, then rise onto toes and squeeze for 1 second.',
      tips: 'Do not bounce at the bottom; pause to eliminate Achilles tendon spring reflex.',
    },

    // Shoulders
    {
      name: 'Standing Overhead Barbell Press (OHP)',
      slug: 'standing-overhead-press',
      category: 'Strength',
      muscleGroup: 'Shoulders',
      secondaryMuscles: 'Triceps, Upper Chest, Core',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      instructions: 'Stand tall with bar racked across front delts. Brace glutes and abs. Press bar straight up, pulling head back slightly then through as bar clears forehead.',
      tips: 'Squeeze glutes hard to protect lumbar spine from hyperextension.',
    },
    {
      name: 'Dumbbell Lateral Raise',
      slug: 'dumbbell-lateral-raise',
      category: 'Strength',
      muscleGroup: 'Shoulders',
      secondaryMuscles: 'Traps',
      equipment: 'Dumbbell',
      difficulty: 'Beginner',
      instructions: 'Hold dumbbells at sides with slight forward torso pitch. Raise arms outward with slight elbow bend until parallel with floor.',
      tips: 'Lead with elbows and avoid swinging torso or shrugging traps.',
    },
    {
      name: 'Face Pulls',
      slug: 'face-pulls',
      category: 'Strength',
      muscleGroup: 'Shoulders',
      secondaryMuscles: 'Rear Delts, Rotator Cuff, Upper Back',
      equipment: 'Cable',
      difficulty: 'Beginner',
      instructions: 'Set rope attachment at eye level. Pull rope towards bridge of nose, separating ends and externally rotating shoulders.',
      tips: 'Crucial exercise for shoulder health and counteracting rounded desk posture.',
    },

    // Arms
    {
      name: 'Barbell Bicep Curl',
      slug: 'barbell-bicep-curl',
      category: 'Strength',
      muscleGroup: 'Arms',
      secondaryMuscles: 'Forearms',
      equipment: 'Barbell',
      difficulty: 'Beginner',
      instructions: 'Hold barbell with underhand shoulder-width grip. Keep elbows pinned to ribs. Curl bar upward and squeeze biceps at peak contraction.',
      tips: 'Lower weight slowly over 2-3 seconds for maximum hypertrophy stimulation.',
    },
    {
      name: 'Triceps Rope Pushdown',
      slug: 'triceps-rope-pushdown',
      category: 'Strength',
      muscleGroup: 'Arms',
      secondaryMuscles: 'Forearms',
      equipment: 'Cable',
      difficulty: 'Beginner',
      instructions: 'Grasp rope attachment with neutral grip. Extend arms downward, spreading rope ends apart at lockout to fully contract triceps lateral head.',
      tips: 'Keep upper arms fixed and stationary throughout.',
    },
    {
      name: 'Incline Dumbbell Curl',
      slug: 'incline-dumbbell-curl',
      category: 'Strength',
      muscleGroup: 'Arms',
      secondaryMuscles: 'Forearms',
      equipment: 'Dumbbell',
      difficulty: 'Intermediate',
      instructions: 'Sit on bench inclined to 60 degrees. Let arms hang back for deep bicep stretch, then curl dumbbells upward while supinating wrists.',
      tips: 'Maximizes long head bicep recruitment due to stretched starting position.',
    },

    // Core
    {
      name: 'Hanging Leg Raise',
      slug: 'hanging-leg-raise',
      category: 'Strength',
      muscleGroup: 'Core',
      secondaryMuscles: 'Hip Flexors, Grip',
      equipment: 'Bodyweight',
      difficulty: 'Intermediate',
      instructions: 'Hang from pull-up bar. Without swinging, curl pelvis upward and raise legs until parallel or higher.',
      tips: 'Curl pelvis forward at top of movement rather than just raising legs.',
    },
    {
      name: 'Standard Plank',
      slug: 'standard-plank',
      category: 'Strength',
      muscleGroup: 'Core',
      secondaryMuscles: 'Shoulders, Glutes',
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      instructions: 'Rest on forearms and toes in a rigid straight line. Squeeze glutes, quads, and pull navel toward spine. Hold for target duration.',
      tips: 'Do not let hips sag towards floor or pike upward in a V-shape.',
    },

    // Cardio & Functional
    {
      name: 'Kettlebell Swings',
      slug: 'kettlebell-swings',
      category: 'HIIT',
      muscleGroup: 'Full Body',
      secondaryMuscles: 'Hamstrings, Glutes, Core, Shoulders',
      equipment: 'Dumbbell',
      difficulty: 'Intermediate',
      instructions: 'Hike kettlebell between legs with hip hinge. Snap hips forward explosively, projecting bell forward to chest level.',
      tips: 'Power comes entirely from hip drive and glutes, not pulling with arms.',
    },
    {
      name: 'Incline Treadmill Sprints',
      slug: 'incline-treadmill-sprints',
      category: 'Cardio',
      muscleGroup: 'Legs',
      secondaryMuscles: 'Cardiovascular System',
      equipment: 'Machine',
      difficulty: 'Intermediate',
      instructions: 'Set treadmill to 8-12% incline. Sprint for 30 seconds followed by 60 seconds of walking recovery.',
      tips: 'Incline running reduces knee impact forces while dramatically elevating heart rate.',
    },
  ];

  console.log(`Seeding ${exerciseData.length} exercises...`);
  const createdExercises: Record<string, string> = {};

  for (const ex of exerciseData) {
    const record = await prisma.exercise.upsert({
      where: { slug: ex.slug },
      update: ex,
      create: ex,
    });
    createdExercises[ex.slug] = record.id;
  }

  // 2. Seed Users
  const passwordSalt = await bcrypt.genSalt(10);
  const demoPasswordHash = await bcrypt.hash('password123', passwordSalt);
  const adminPasswordHash = await bcrypt.hash('admin123', passwordSalt);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@fittrack.com' },
    update: {},
    create: {
      email: 'demo@fittrack.com',
      passwordHash: demoPasswordHash,
      role: 'user',
      profile: {
        create: {
          fullName: 'Alex Mercer',
          bio: 'Fitness enthusiast focused on lean hypertrophy, functional power, and nutritional optimization.',
          age: 27,
          gender: 'male',
          height: 180,
          weight: 76.5,
          targetWeight: 80.0,
          fitnessLevel: 'Intermediate',
          primaryGoal: 'Muscle Gain',
          preferredWorkouts: 'Gym,Bodyweight,HIIT',
          workoutDaysPerWeek: 4,
          equipment: 'Full Gym',
          dietaryPreference: 'High Protein',
          dailyCalorieTarget: 2600,
          dailyWaterTargetMl: 3000,
          unitPreference: 'metric',
          onboardingCompleted: true,
        },
      },
    },
    include: { profile: true },
  });

  await prisma.user.upsert({
    where: { email: 'admin@fittrack.com' },
    update: {},
    create: {
      email: 'admin@fittrack.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      profile: {
        create: {
          fullName: 'FitTrack Admin',
          bio: 'System Administrator and Lead Fitness Performance Director.',
          onboardingCompleted: true,
        },
      },
    },
  });

  console.log('Users seeded: demo@fittrack.com and admin@fittrack.com');

  // 3. Seed Preset Workout Plans
  const pplPlan = await prisma.workoutPlan.upsert({
    where: { id: 'preset-ppl-split' },
    update: {},
    create: {
      id: 'preset-ppl-split',
      userId: null, // Global preset
      title: 'Hypertrophy Push-Pull-Legs (PPL)',
      description: 'The golden standard 6-day split designed for maximum muscular development and strength progression.',
      category: 'Hypertrophy',
      difficulty: 'Intermediate',
      durationWeeks: 8,
      daysPerWeek: 6,
      isAiGenerated: false,
      isCustom: false,
    },
  });

  const upperLowerPlan = await prisma.workoutPlan.upsert({
    where: { id: 'preset-upper-lower' },
    update: {},
    create: {
      id: 'preset-upper-lower',
      userId: null,
      title: '4-Day Upper / Lower Power Split',
      description: 'Perfect balance of volume and recovery with heavy compound lifts and hypertrophy accessories.',
      category: 'Strength',
      difficulty: 'Intermediate',
      durationWeeks: 6,
      daysPerWeek: 4,
      isAiGenerated: false,
      isCustom: false,
    },
  });

  // Attach exercises to Upper/Lower Plan
  const planExercises = [
    { planId: upperLowerPlan.id, slug: 'barbell-bench-press', day: 1, order: 1, sets: 4, reps: '6-8', rest: 90 },
    { planId: upperLowerPlan.id, slug: 'bent-over-barbell-row', day: 1, order: 2, sets: 4, reps: '8-10', rest: 75 },
    { planId: upperLowerPlan.id, slug: 'standing-overhead-press', day: 1, order: 3, sets: 3, reps: '8-10', rest: 75 },
    { planId: upperLowerPlan.id, slug: 'pull-ups', day: 1, order: 4, sets: 3, reps: '8-12', rest: 60 },
    { planId: upperLowerPlan.id, slug: 'barbell-back-squat', day: 2, order: 1, sets: 4, reps: '6-8', rest: 120 },
    { planId: upperLowerPlan.id, slug: 'romanian-deadlift', day: 2, order: 2, sets: 3, reps: '8-10', rest: 90 },
    { planId: upperLowerPlan.id, slug: 'walking-dumbbell-lunges', day: 2, order: 3, sets: 3, reps: '10/leg', rest: 60 },
    { planId: upperLowerPlan.id, slug: 'hanging-leg-raise', day: 2, order: 4, sets: 3, reps: '12-15', rest: 45 },
  ];

  for (const pe of planExercises) {
    if (createdExercises[pe.slug]) {
      await prisma.workoutPlanExercise.create({
        data: {
          workoutPlanId: pe.planId,
          exerciseId: createdExercises[pe.slug],
          dayOfWeek: pe.day,
          order: pe.order,
          targetSets: pe.sets,
          targetReps: pe.reps,
          restSeconds: pe.rest,
        },
      });
    }
  }

  // 4. Seed Demo User Fitness Goals
  await prisma.fitnessGoal.createMany({
    data: [
      {
        userId: demoUser.id,
        title: 'Reach 80.0 kg Lean Body Mass',
        category: 'Weight',
        targetValue: 80.0,
        currentValue: 76.5,
        unit: 'kg',
        status: 'active',
      },
      {
        userId: demoUser.id,
        title: 'Bench Press 100 kg 1RM',
        category: 'Strength',
        targetValue: 100,
        currentValue: 85,
        unit: 'kg',
        status: 'active',
      },
      {
        userId: demoUser.id,
        title: 'Complete 20 Workouts This Month',
        category: 'Consistency',
        targetValue: 20,
        currentValue: 14,
        unit: 'sessions',
        status: 'active',
      },
    ],
  });

  // 5. Seed Historical Progress Records for Demo User
  const now = new Date();
  const progressDates = [
    { daysAgo: 21, weight: 75.0, bmi: 23.1, waistCm: 82, chestCm: 101 },
    { daysAgo: 14, weight: 75.6, bmi: 23.3, waistCm: 81.5, chestCm: 102 },
    { daysAgo: 7, weight: 76.0, bmi: 23.5, waistCm: 81.0, chestCm: 102.5 },
    { daysAgo: 0, weight: 76.5, bmi: 23.6, waistCm: 80.5, chestCm: 103.5 },
  ];

  for (const p of progressDates) {
    const d = new Date(now);
    d.setDate(d.getDate() - p.daysAgo);
    await prisma.progressRecord.create({
      data: {
        userId: demoUser.id,
        date: d,
        weightKg: p.weight,
        bmi: p.bmi,
        waistCm: p.waistCm,
        chestCm: p.chestCm,
        notes: p.daysAgo === 0 ? 'Weekly check-in: Feeling stronger on bench press.' : 'Standard morning measurement.',
      },
    });
  }

  // 6. Seed Completed Workout Sessions for Demo User
  const session1 = await prisma.workoutSession.create({
    data: {
      userId: demoUser.id,
      planId: upperLowerPlan.id,
      title: 'Upper Body Power & Hypertrophy',
      notes: 'Hit high intensity sets. Chest pump felt phenomenal.',
      startedAt: new Date(Date.now() - 86400000 * 2),
      completedAt: new Date(Date.now() - 86400000 * 2 + 3600000),
      durationSeconds: 3120, // 52 mins
      totalVolumeKg: 7850,
      caloriesBurned: 440,
      status: 'completed',
    },
  });

  if (createdExercises['barbell-bench-press']) {
    const se1 = await prisma.workoutExercise.create({
      data: {
        workoutSessionId: session1.id,
        exerciseId: createdExercises['barbell-bench-press'],
        order: 1,
      },
    });

    await prisma.exerciseSet.createMany({
      data: [
        { workoutExerciseId: se1.id, setNumber: 1, targetReps: 8, actualReps: 8, weightKg: 80, completed: true, rpe: 8 },
        { workoutExerciseId: se1.id, setNumber: 2, targetReps: 8, actualReps: 8, weightKg: 80, completed: true, rpe: 8.5 },
        { workoutExerciseId: se1.id, setNumber: 3, targetReps: 8, actualReps: 7, weightKg: 82.5, completed: true, rpe: 9.5 },
      ],
    });
  }

  // 7. Seed Today's Meals & Water
  const todayStr = new Date().toISOString().split('T')[0];

  const breakfast = await prisma.meal.create({
    data: {
      userId: demoUser.id,
      date: todayStr,
      mealType: 'BREAKFAST',
      name: 'Power Breakfast',
    },
  });

  await prisma.foodItem.createMany({
    data: [
      { mealId: breakfast.id, name: 'Rolled Oats with Berries', servingSize: '80g', calories: 300, proteinG: 11, carbsG: 54, fatG: 5 },
      { mealId: breakfast.id, name: 'Whey Protein Isolate', servingSize: '1 scoop', calories: 120, proteinG: 25, carbsG: 1.5, fatG: 1 },
      { mealId: breakfast.id, name: 'Whole Eggs Scrambled', servingSize: '2 eggs', calories: 143, proteinG: 12.6, carbsG: 0.7, fatG: 9.5 },
    ],
  });

  const lunch = await prisma.meal.create({
    data: {
      userId: demoUser.id,
      date: todayStr,
      mealType: 'LUNCH',
      name: 'Anabolic Fuel Lunch',
    },
  });

  await prisma.foodItem.createMany({
    data: [
      { mealId: lunch.id, name: 'Grilled Chicken Breast', servingSize: '200g', calories: 330, proteinG: 62, carbsG: 0, fatG: 7.2 },
      { mealId: lunch.id, name: 'Brown Rice', servingSize: '1.5 cups', calories: 327, proteinG: 6.8, carbsG: 69, fatG: 2.4 },
      { mealId: lunch.id, name: 'Steamed Broccoli with Olive Oil', servingSize: '1 cup', calories: 95, proteinG: 4, carbsG: 11, fatG: 4.5 },
    ],
  });

  await prisma.waterIntake.createMany({
    data: [
      { userId: demoUser.id, date: todayStr, amountMl: 500 },
      { userId: demoUser.id, date: todayStr, amountMl: 500 },
      { userId: demoUser.id, date: todayStr, amountMl: 500 },
      { userId: demoUser.id, date: todayStr, amountMl: 250 },
    ],
  });

  // 8. Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        title: 'Weekly Progress Milestone 🌟',
        message: 'You have logged 4 consecutive days of training this week. Keep the momentum going!',
        type: 'ACHIEVEMENT',
      },
      {
        userId: demoUser.id,
        title: 'Hydration Target Reminder 💧',
        message: 'You are 750ml away from reaching your 3,000ml hydration goal today.',
        type: 'REMINDER',
      },
      {
        userId: demoUser.id,
        title: 'AI Workout Recommendation Ready 🤖',
        message: 'Your AI Coach analyzed your latest squat performance and has updated your recovery suggestions.',
        type: 'SYSTEM',
      },
    ],
  });

  console.log('✅ FitTrack Database successfully seeded with rich demo data!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
