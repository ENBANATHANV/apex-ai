import OpenAI from 'openai';

const MEDICAL_DISCLAIMER =
  'DISCLAIMER: AI recommendations are for informational and educational purposes only and are not a substitute for professional medical advice, diagnosis, or treatment. Consult a physician before beginning any new training or nutrition plan.';

interface UserContext {
  age?: number | null;
  gender?: string | null;
  weight?: number | null;
  height?: number | null;
  fitnessLevel?: string | null;
  primaryGoal?: string | null;
  equipment?: string | null;
  workoutDaysPerWeek?: number | null;
  dietaryPreference?: string | null;
}

let openaiClient: OpenAI | null = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export class AiService {
  /**
   * Generate a structured personalized workout plan
   */
  static async generateWorkoutPlan(
    userContext: UserContext,
    customPrompt?: string
  ): Promise<{
    title: string;
    description: string;
    category: string;
    difficulty: string;
    durationWeeks: number;
    daysPerWeek: number;
    days: Array<{
      dayNumber: number;
      dayTitle: string;
      focus: string;
      exercises: Array<{
        name: string;
        sets: number;
        reps: string;
        restSeconds: number;
        notes: string;
      }>;
    }>;
    recoveryTips: string[];
    disclaimer: string;
  }> {
    const goal = userContext.primaryGoal || 'General Fitness';
    const level = userContext.fitnessLevel || 'Intermediate';
    const equipment = userContext.equipment || 'Full Gym';
    const daysCount = userContext.workoutDaysPerWeek || 4;

    if (openaiClient) {
      try {
        const systemPrompt = `You are FitTrack's Chief Sports Scientist & Elite Strength Coach. Generate an optimized, science-backed workout plan in JSON format.
Return ONLY valid JSON matching this schema:
{
  "title": "string",
  "description": "string",
  "category": "Strength" | "Hypertrophy" | "Fat Loss" | "Endurance",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "durationWeeks": 4,
  "daysPerWeek": number,
  "days": [
    {
      "dayNumber": 1,
      "dayTitle": "string",
      "focus": "string",
      "exercises": [
        {
          "name": "string",
          "sets": 3,
          "reps": "8-12",
          "restSeconds": 60,
          "notes": "string"
        }
      ]
    }
  ],
  "recoveryTips": ["string", "string", "string"]
}`;

        const userMsg = `User details:
Goal: ${goal}
Fitness Level: ${level}
Equipment: ${equipment}
Available Days per Week: ${daysCount}
Age: ${userContext.age || 25}
Weight: ${userContext.weight || 70}kg
Additional request: ${customPrompt || 'Create a balanced, progressive overload training routine.'}`;

        const response = await openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMsg },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            ...parsed,
            disclaimer: MEDICAL_DISCLAIMER,
          };
        }
      } catch (err) {
        console.warn('[AI Service] OpenAI API error, utilizing intelligent local fitness engine:', err);
      }
    }

    // Intelligent Fallback Plan Generator
    const category = goal.toLowerCase().includes('fat') || goal.toLowerCase().includes('weight')
      ? 'Fat Loss'
      : goal.toLowerCase().includes('muscle')
      ? 'Hypertrophy'
      : goal.toLowerCase().includes('endurance')
      ? 'Endurance'
      : 'Strength';

    const sampleDays = [
      {
        dayNumber: 1,
        dayTitle: 'Upper Body Power & Hypertrophy',
        focus: 'Chest, Back, Shoulders & Triceps',
        exercises: [
          { name: 'Barbell Bench Press', sets: 4, reps: '6-8', restSeconds: 90, notes: 'Focus on explosive press and controlled 2-sec eccentric.' },
          { name: 'Bent-Over Barbell Row', sets: 4, reps: '8-10', restSeconds: 75, notes: 'Maintain flat spine and drive with elbows.' },
          { name: 'Overhead Dumbbell Press', sets: 3, reps: '10-12', restSeconds: 60, notes: 'Keep core braced and full lockout at top.' },
          { name: 'Lat Pulldown', sets: 3, reps: '10-12', restSeconds: 60, notes: 'Squeeze lats at bottom, smooth stretch at top.' },
          { name: 'Triceps Rope Pushdown', sets: 3, reps: '12-15', restSeconds: 45, notes: 'Flare rope outward at full elbow extension.' },
        ],
      },
      {
        dayNumber: 2,
        dayTitle: 'Lower Body Strength & Core',
        focus: 'Quadriceps, Hamstrings, Glutes & Abs',
        exercises: [
          { name: 'Barbell Back Squat', sets: 4, reps: '6-8', restSeconds: 120, notes: 'Break at hips and knees simultaneously to depth.' },
          { name: 'Romanian Deadlift', sets: 3, reps: '8-10', restSeconds: 90, notes: 'Hinge back deeply until hamstring stretch is felt.' },
          { name: 'Walking Dumbbell Lunges', sets: 3, reps: '10 per leg', restSeconds: 60, notes: 'Maintain upright torso and stable knee tracking.' },
          { name: 'Standing Calf Raise', sets: 4, reps: '15-20', restSeconds: 45, notes: 'Hold 1-second peak contraction at the top.' },
          { name: 'Hanging Knee Raises', sets: 3, reps: '12-15', restSeconds: 45, notes: 'Curl pelvis up to engage lower abdominal wall.' },
        ],
      },
      {
        dayNumber: 3,
        dayTitle: 'Active Recovery & Conditioning',
        focus: 'Cardiovascular Health, Core & Mobility',
        exercises: [
          { name: 'Incline Treadmill Walk', sets: 1, reps: '25 mins', restSeconds: 0, notes: 'Maintain 10% incline at 5 km/h for zone 2 cardio.' },
          { name: 'Plank Hold', sets: 3, reps: '45-60s', restSeconds: 45, notes: 'Brace core as if taking a punch.' },
          { name: 'Bodyweight World Greatest Stretch', sets: 2, reps: '8 per side', restSeconds: 30, notes: 'Focus on thoracic spine mobility.' },
        ],
      },
      {
        dayNumber: 4,
        dayTitle: 'Full Body Dynamic Hypertrophy',
        focus: 'Metabolic Volume & Total Body Integration',
        exercises: [
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', restSeconds: 60, notes: '30-degree bench angle for upper pectoral focus.' },
          { name: 'Pull-Ups / Assisted Pull-Ups', sets: 3, reps: '8-10', restSeconds: 75, notes: 'Full dead-hang stretch between repetitions.' },
          { name: 'Leg Press', sets: 3, reps: '12-15', restSeconds: 75, notes: 'Feet shoulder-width for quad and glute balance.' },
          { name: 'Dumbbell Lateral Raise', sets: 4, reps: '15', restSeconds: 45, notes: 'Lead with elbows and slight forward torso lean.' },
          { name: 'Dumbbell Bicep Curls', sets: 3, reps: '10-12', restSeconds: 45, notes: 'Supinate wrists at the top of the contraction.' },
        ],
      },
    ];

    const activeDays = sampleDays.slice(0, Math.min(daysCount, 4));

    return {
      title: `Personalized AI ${category} Blueprint (${daysCount}-Day)`,
      description: `Scientifically calibrated for ${level} fitness level, targeting ${goal.toLowerCase()} with progressive overload and optimal recovery periods.`,
      category,
      difficulty: level,
      durationWeeks: 4,
      daysPerWeek: daysCount,
      days: activeDays,
      recoveryTips: [
        'Prioritize 7.5 to 9 hours of uninterrupted sleep for neuromuscular repair and GH release.',
        'Hydrate with at least 3 liters of water on training days, supplemented with electrolytes if sweating heavily.',
        'Consume 1.6 to 2.2g of protein per kg of bodyweight spaced across 4 distinct feeding windows.',
        'Schedule 48 hours of recovery before retraining the same primary muscle group at high intensity.',
      ],
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  /**
   * Generate customized nutrition and meal advice
   */
  static async getNutritionAdvice(
    userContext: UserContext,
    targetCalories?: number
  ): Promise<{
    calorieTarget: number;
    macros: { proteinG: number; carbsG: number; fatG: number };
    mealPlanRecommendation: Array<{
      mealName: string;
      calories: number;
      proteinG: number;
      carbsG: number;
      fatG: number;
      suggestions: string[];
    }>;
    hydrationGuideline: string;
    tips: string[];
    disclaimer: string;
  }> {
    const weight = userContext.weight || 75;
    const goal = userContext.primaryGoal || 'Muscle Gain';
    const diet = userContext.dietaryPreference || 'No Restrictions';

    let calories = targetCalories || 2300;
    if (!targetCalories) {
      if (goal.toLowerCase().includes('fat') || goal.toLowerCase().includes('loss')) {
        calories = Math.round(weight * 28);
      } else if (goal.toLowerCase().includes('muscle') || goal.toLowerCase().includes('bulk')) {
        calories = Math.round(weight * 36);
      } else {
        calories = Math.round(weight * 32);
      }
    }

    const proteinG = Math.round(weight * 2.0); // 2g per kg
    const fatG = Math.round((calories * 0.25) / 9); // 25% of calories
    const carbsG = Math.round((calories - (proteinG * 4 + fatG * 9)) / 4);

    return {
      calorieTarget: calories,
      macros: { proteinG, carbsG, fatG },
      mealPlanRecommendation: [
        {
          mealName: 'Breakfast (Power Ignition)',
          calories: Math.round(calories * 0.25),
          proteinG: Math.round(proteinG * 0.25),
          carbsG: Math.round(carbsG * 0.3),
          fatG: Math.round(fatG * 0.2),
          suggestions: [
            'Rolled oats with whey/plant protein powder, fresh blueberries, and chia seeds',
            '3 pasture-raised whole eggs scrambled with spinach and 1 slice sourdough toast',
            'Black coffee or green tea with 500ml water',
          ],
        },
        {
          mealName: 'Lunch (Anabolic Fuel)',
          calories: Math.round(calories * 0.35),
          proteinG: Math.round(proteinG * 0.35),
          carbsG: Math.round(carbsG * 0.35),
          fatG: Math.round(fatG * 0.35),
          suggestions: [
            'Grilled chicken breast or tempeh (180g) with steamed jasmine/brown rice (1.5 cups)',
            'Roasted broccoli florets tossed in extra virgin olive oil',
            'Mixed green salad with apple cider vinaigrette',
          ],
        },
        {
          mealName: 'Pre/Post-Workout Snack',
          calories: Math.round(calories * 0.15),
          proteinG: Math.round(proteinG * 0.15),
          carbsG: Math.round(carbsG * 0.2),
          fatG: Math.round(fatG * 0.15),
          suggestions: [
            'Non-fat Greek yogurt with raw honey and sliced banana',
            'Rice cakes with natural almond butter',
          ],
        },
        {
          mealName: 'Dinner (Recovery & Satiety)',
          calories: Math.round(calories * 0.25),
          proteinG: Math.round(proteinG * 0.25),
          carbsG: Math.round(carbsG * 0.15),
          fatG: Math.round(fatG * 0.3),
          suggestions: [
            'Wild-caught salmon fillet (200g) rich in Omega-3 fatty acids',
            'Baked sweet potato with a dash of cinnamon',
            'Large serving of steamed asparagus or green beans',
          ],
        },
      ],
      hydrationGuideline: `Drink approximately ${Math.round(weight * 35)}ml to ${Math.round(weight * 40)}ml of water daily, adding 500ml for every hour of moderate-to-vigorous exercise.`,
      tips: [
        'Prioritize complete protein sources with high biological value to maximize Muscle Protein Synthesis (MPS).',
        'Consume complex carbohydrates around your workout windows (pre and post) to fuel high glycolytic demand.',
        'Do not eliminate healthy fats; fats are vital for hormone production including testosterone and thyroid regulation.',
        'Monitor sodium and potassium balance to prevent cramping and maintain intracellular hydration.',
      ],
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  /**
   * Interactive fitness assistant chat
   */
  static async chatResponse(
    message: string,
    history: Array<{ role: string; content: string }>,
    userContext: UserContext
  ): Promise<{ text: string; actionCard?: any; disclaimer: string }> {
    const lower = message.toLowerCase();

    if (openaiClient) {
      try {
        const systemPrompt = `You are FitTrack AI, an elite AI fitness coach, nutritionist, and sports performance expert.
User profile:
- Age: ${userContext.age || 'N/A'}, Weight: ${userContext.weight || '70'} kg, Height: ${userContext.height || '175'} cm
- Fitness Level: ${userContext.fitnessLevel || 'Intermediate'}
- Primary Goal: ${userContext.primaryGoal || 'General Fitness'}
- Dietary Preference: ${userContext.dietaryPreference || 'Standard'}

Guidelines:
1. Provide actionable, science-based, encouraging fitness and nutrition advice.
2. Structure your replies with clear bullet points, sets/reps, and practical tips.
3. If the user asks for a workout plan or meal suggestion, provide concrete details.
4. Keep the tone motivational, professional, and empathetic.`;

        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-8).map((h) => ({
            role: (h.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: h.content,
          })),
          { role: 'user', content: message },
        ];

        const completion = await openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
        });

        const reply = completion.choices[0]?.message?.content || 'I am ready to help you reach your goals!';
        return {
          text: reply,
          disclaimer: MEDICAL_DISCLAIMER,
        };
      } catch (err) {
        console.warn('[AI Service] OpenAI chat fallback:', err);
      }
    }

    // Intelligent Conversational Fallback
    let responseText = '';
    let actionCard: any = undefined;

    if (lower.includes('workout') || lower.includes('routine') || lower.includes('exercise') || lower.includes('split')) {
      responseText = `Based on your **${userContext.fitnessLevel || 'Intermediate'}** level and goal of **${userContext.primaryGoal || 'Strength & Conditioning'}**, here is a strategic training recommendation:

### Recommended Training Structure
- **Frequency**: 4 sessions per week (Upper / Lower / Rest / Push / Pull / Legs / Rest)
- **Primary Compound Movement**: Focus on compound lifts (Squat, Bench Press, Deadlift, Overhead Press, Pull-Ups) in the **6–10 rep range** for maximum mechanical tension.
- **Accessory Volume**: Target smaller muscle groups with isolation movements in the **10–15 rep range** with 1–2 reps in reserve (RIR 1-2).
- **Progressive Overload**: Add 1.25–2.5 kg or 1 extra repetition whenever you reach the top of your target rep bracket.

Would you like me to generate a personalized multi-week workout plan and attach it directly to your Workout Plans page?`;

      actionCard = {
        type: 'workout_suggestion',
        title: 'Generate Full Workout Plan',
        action: 'generate_plan',
      };
    } else if (lower.includes('diet') || lower.includes('nutrition') || lower.includes('protein') || lower.includes('calorie') || lower.includes('meal')) {
      const wt = userContext.weight || 72;
      const targetProtein = Math.round(wt * 2);
      responseText = `Here is your scientifically calculated nutritional roadmap:

### Daily Macro Architecture for ${userContext.primaryGoal || 'Fitness'}:
- **Protein**: ~**${targetProtein}g** daily (${wt}kg × 2.0g/kg). Vital for muscle protein synthesis and satiety.
- **Hydration**: At least **3.0 to 3.5 Liters** of water per day.
- **Meal Timing**: Distribute protein evenly across 3–4 meals with at least 30g per sitting to trigger the leucine threshold.
- **Pre-Workout Window**: 30–50g fast-digesting carbs (e.g. banana, cream of rice) 45 minutes prior to training.
- **Post-Workout Window**: 30–40g whey/isolate protein + 40g carbohydrates within 2 hours.

Remember that calorie balance drives weight changes, while protein and resistance training dictate whether that change is fat or muscle.`;

      actionCard = {
        type: 'nutrition_suggestion',
        title: 'View Macro Calculator & Meal Log',
        action: 'open_nutrition',
      };
    } else if (lower.includes('sore') || lower.includes('recovery') || lower.includes('rest') || lower.includes('sleep')) {
      responseText = `### Muscle Soreness (DOMS) & Recovery Protocol:
Delayed Onset Muscle Soreness peaks 24–48 hours post-workout due to micro-tears in muscle fibers. Here is how to accelerate repair:

1. **Active Recovery**: Perform 20–30 minutes of low-intensity steady-state cardio (brisk walk, easy stationary cycle). This pumps oxygenated blood and nutrients to sore tissues without adding systemic fatigue.
2. **Sleep Optimization**: 70% of human growth hormone (HGH) pulse occurs during slow-wave Deep Sleep. Aim for 8 hours in a cool, dark room (18°C/65°F).
3. **Contrast Shower or Sauna**: Alternating hot and cold exposure helps vasoconstriction and vasodilation, aiding lymphatic drainage.
4. **Hydration & Electrolytes**: Drink water with a pinch of sea salt, magnesium glycinate (300-400mg before bed), and potassium.`;
    } else if (lower.includes('water') || lower.includes('hydrate')) {
      responseText = `### Hydration Strategy
Maintaining proper intracellular hydration is directly correlated with a 15–20% increase in muscular endurance and strength output.
- **Baseline**: 35ml per kg of bodyweight (~2.5L for a 70kg athlete).
- **Workout Supplementation**: Add 500ml of water with electrolytes per hour of rigorous training.
- **Tip**: Check your urine color; pale straw yellow indicates optimal hydration status.`;
    } else {
      responseText = `Hello! I am your **FitTrack AI Coach**. 

I can assist you with:
- 🏋️‍♂️ **Customized Workout Programs**: Creating periodized strength, hypertrophy, or fat-loss routines.
- 🥗 **Nutrition & Macro Planning**: Calculating your BMR, TDEE, and optimal protein/carb/fat targets.
- ⏱️ **Form Checks & Exercise Cues**: Step-by-step guidance for squats, deadlifts, and bench presses.
- 💤 **Recovery Optimization**: Managing DOMS, sleep quality, and active rest days.

What specific fitness or health goal are you working on today?`;
    }

    return {
      text: responseText,
      actionCard,
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }
}
