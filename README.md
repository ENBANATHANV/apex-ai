
# FitTrack – AI-Powered Fitness & Wellness Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React%2018-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma%20ORM-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI%20API-412991?style=flat&logo=openai&logoColor=white)](https://openai.com/)

**FitTrack** is a production-ready, full-stack fitness and health performance web application. It integrates sports science methodologies with artificial intelligence to deliver periodized workout programs, real-time interactive workout session tracking with interval rest timers, nutritional macro calculations, hydration monitoring, progress analytics, and an interactive AI fitness coach chatbot.

---

## 🌟 Key Application Features

### 1. Authentication & Onboarding
- **Secure Authentication**: JWT-based session management with bcrypt-hashed passwords (10 salt rounds).
- **1-Click Demo Logins**: Instant evaluation buttons on the login page for **Demo Athlete** and **Admin**.
- **Interactive Multi-Step Onboarding**: Collects user age, height, weight, target weight, fitness level, training frequency, equipment access, and dietary preferences to calibrate BMR, TDEE, and daily caloric/macro targets.

### 2. High-Performance Dashboard
- **Daily Telemetry Cards**: Calories burned, steps progress, active training minutes, and water intake.
- **Weekly Caloric & Training Output**: Recharts bar chart tracking daily energetic output across 7 days.
- **Target Goals & Daily Motivational Quotes**: Dynamic rotating motivational quotes and goal countdowns.
- **Active Workout Resumption Alert**: Sticky notification banner whenever a workout is in progress.

### 3. Workout Management & Live Sessions
- **Structured Program Library**: Pre-built plans (Push-Pull-Legs, 4-Day Upper/Lower Split, Full Body Foundations, HIIT).
- **Custom Plan Creator**: Build custom multi-day plans with targeted exercises, sets, reps, and rest timers.
- **Active Workout Mode**:
  - Live running stopwatch timer.
  - Interactive interval rest timer (30s, 60s, 90s, 120s) with audio chime and countdown animation.
  - Set-by-set input for weight (kg), completed reps, and instant checkoff toggles.
  - On-the-fly exercise and set insertion.
  - Session finish modal with confetti animation, tonnage volume calculation, and calories burned.

### 4. Exercise Library
- 23+ biomechanically curated movements with detailed execution instructions and coach tips.
- Multi-dimensional filtering by muscle group (Chest, Back, Legs, Shoulders, Arms, Core, Full Body) and equipment (Barbell, Dumbbell, Cable, Machine, Bodyweight).

### 5. Nutrition & Hydration Tracking
- **Calorie & Macro Targets**: Real-time breakdown of Protein, Carbohydrates, and Fats against daily calculated goals.
- **Food Database Search**: Searchable database of common bodybuilding & wellness foods + custom food logger.
- **Interactive Hydration Station**: Dynamic visual fill level with 1-click `+250ml`, `+500ml`, `+750ml` logging.
- **Weekly Nutrition Analytics**: Multi-day intake bar chart.

### 6. Progress Analytics & Milestones
- **Weight Progression Chart**: Recharts line graph tracking weight history and BMI trajectory.
- **Body Measurements**: Log chest, waist, and arms measurements.
- **Fitness Milestones & Badges**: Unlockable achievement badges based on total workouts, streak, and tonnage lifted.
- **Visual Transformation Gallery**: Before-and-after photo check-in timeline.

### 7. AI Fitness Coach & Plan Architect
- **AI Program Generation**: Synthesizes periodized 3 to 6-day routines tailored to biometrics and user constraints.
- **One-Click Save**: Add AI-generated plans directly to your personal workout library!
- **Interactive Coach Chatbot**: Answers fitness questions, explains lift mechanics, suggests recovery protocols, and gives nutritional guidance.
- **Prominent Medical Disclaimer**: Clear health notices regarding informational guidance.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Client ["Frontend (React 18 + Vite + Tailwind CSS)"]
        UI[UI Components & shadcn/ui Design]
        Router[Client Router & Auth Guards]
        Context[Auth, Theme, Notification Contexts]
        Recharts[Recharts Analytics & Framer Motion]
    end

    subgraph Server ["Backend (Node.js + Express + TypeScript)"]
        API[REST API Layer /api]
        AuthMid[JWT & Role Authorization Middleware]
        Controllers[Auth, Workout, Nutrition, Progress, AI Controllers]
        AiService[OpenAI GPT-4o-mini & Rule-Based AI Engine]
    end

    subgraph DataStore ["Database & Storage"]
        Prisma[Prisma ORM Client]
        SQLite[Local Dev: SQLite dev.db]
        Postgres[Production: PostgreSQL]
    end

    Client -->|JSON REST Requests with Bearer Token| API
    API --> AuthMid
    AuthMid --> Controllers
    Controllers --> AiService
    Controllers --> Prisma
    Prisma --> SQLite
    Prisma -.-> Postgres
```

---

## 📁 Project Folder Structure

```
apex-ai/
├── client/                     # Frontend Application (React 18 + Vite + TypeScript)
│   ├── public/                 # Static assets & brand logos
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── MedicalDisclaimer.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── NotificationDropdown.tsx
│   │   │   ├── RestTimer.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── context/            # React Context Providers
│   │   │   ├── AuthContext.tsx
│   │   │   ├── NotificationContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── pages/              # 13 Application Pages
│   │   │   ├── ActiveWorkoutPage.tsx
│   │   │   ├── AiCoachPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ExerciseLibraryPage.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── NutritionPage.tsx
│   │   │   ├── OnboardingPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── ProgressPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── WorkoutsPage.tsx
│   │   ├── services/
│   │   │   └── api.ts          # Typed REST API Client
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript interfaces & types
│   │   ├── App.tsx             # Root Layout & Navigation Controller
│   │   ├── index.css           # Tailwind CSS directives & themes
│   │   └── main.tsx            # React DOM Bootstrapper
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vercel.json             # Vercel deployment configuration
│   └── vite.config.ts
│
├── server/                     # Backend API Server (Express.js + TypeScript)
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma Schema (Default: SQLite zero-config)
│   │   └── schema.postgresql.prisma # PostgreSQL production schema
│   ├── src/
│   │   ├── controllers/        # Route Handlers
│   │   │   ├── aiController.ts
│   │   │   ├── authController.ts
│   │   │   ├── notificationController.ts
│   │   │   ├── nutritionController.ts
│   │   │   ├── progressController.ts
│   │   │   ├── userController.ts
│   │   │   └── workoutController.ts
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── validationMiddleware.ts
│   │   ├── routes/             # Express API Routers
│   │   │   ├── aiRoutes.ts
│   │   │   ├── authRoutes.ts
│   │   │   ├── notificationRoutes.ts
│   │   │   ├── nutritionRoutes.ts
│   │   │   ├── progressRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   └── workoutRoutes.ts
│   │   ├── seed/
│   │   │   └── seed.ts         # Database seed script
│   │   ├── services/
│   │   │   └── aiService.ts    # OpenAI integration & fallback AI engine
│   │   ├── app.ts              # Express App setup & middleware
│   │   ├── prisma.ts           # Prisma singleton
│   │   └── server.ts           # Server entrypoint
│   ├── .env                    # Environment variables
│   ├── .env.example
│   ├── Dockerfile              # Production Dockerfile
│   ├── package.json
│   ├── test_suite.js           # Automated integration test runner
│   └── tsconfig.json
│
├── docker-compose.yml          # Multi-container orchestration (PostgreSQL + API)
├── package.json                # Root orchestration package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node v20/v24)
- **npm**: v9.0.0 or higher

### 1. Clone & Install Dependencies
From the repository root:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Database & Environment
The backend is configured with **SQLite by default**, which requires **zero external database setup or installation**—everything runs immediately and seamlessly out of the box!

```bash
cd ../server

# Generate Prisma Client and initialize the database
npx prisma generate
npx prisma db push

# Seed the database with demo users, 23+ exercises, sample workouts, and nutrition logs
npx ts-node src/seed/seed.ts
```

*(Note: To switch to PostgreSQL in production, see the [PostgreSQL & Deployment](#-postgresql--deployment) section below.)*

### 3. Run the Application

#### Start the Backend API Server:
```bash
cd server
npm run dev
# Server will start on http://localhost:5000
```

#### Start the Frontend Client (in a separate terminal):
```bash
cd client
npm run dev
# Frontend will start on http://localhost:5173
```

Open your browser at `http://localhost:5173` to experience FitTrack!

---

## 🔑 Demo Test Credentials

You can instantly log in using the buttons on the Login page, or enter these credentials:

| Role | Email | Password | Access / State |
| :--- | :--- | :--- | :--- |
| **Demo Athlete** | `demo@fittrack.com` | `password123` | Fully onboarded, past workout sessions, active goals, macro history |
| **Admin** | `admin@fittrack.com` | `admin123` | Administrator privileges |

---

## 🧪 Testing Instructions

An automated end-to-end integration test suite is included in `server/test_suite.js`. It validates 10 critical operational workflows:
1. Health check verification (`GET /api/health`)
2. Demo user authentication (`POST /api/auth/login`)
3. Performance dashboard summary telemetry (`GET /api/users/dashboard-summary`)
4. Workout programs retrieval (`GET /api/workouts`)
5. Exercise movement database query (`GET /api/workouts/exercises`)
6. Daily nutrition and macro calculation (`GET /api/nutrition/daily`)
7. Hydration intake logging (`POST /api/nutrition/water`)
8. Progress analytics & tonnage calculations (`GET /api/progress/analytics`)
9. AI workout plan generation (`POST /api/ai/workout-plan`)
10. AI fitness coach chat streaming (`POST /api/ai/chat`)

Run the test suite:
```bash
cd server
node test_suite.js
```

---

## 📚 Complete REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register new user `{ email, password, fullName }`
- `POST /api/auth/login`: Authenticate `{ email, password }` -> returns JWT token & user
- `POST /api/auth/logout`: Invalidate session
- `POST /api/auth/forgot-password`: Send/simulate password reset link `{ email }`
- `GET /api/auth/me`: Fetch authenticated user profile

### User & Dashboard (`/api/users`)
- `GET /api/users/profile`: Retrieve athlete biometrics & preferences
- `PUT /api/users/profile`: Update biometrics, goals, and targets
- `POST /api/users/onboarding`: Complete onboarding assessment
- `GET /api/users/dashboard-summary`: Aggregate steps, calories, water, recent workouts, active session, and weekly activity

### Workouts & Sessions (`/api/workouts`)
- `GET /api/workouts`: List custom & curated workout plans
- `POST /api/workouts`: Create new workout program
- `GET /api/workouts/:id`: Get workout plan details
- `PUT /api/workouts/:id`: Update workout program
- `DELETE /api/workouts/:id`: Remove workout plan
- `GET /api/workouts/exercises`: Query exercise library with filters (`muscleGroup`, `equipment`, `search`)
- `POST /api/workouts/session/start`: Launch active workout session `{ planId, dayNumber, customTitle }`
- `GET /api/workouts/session/active`: Retrieve current in-progress workout session
- `POST /api/workouts/session/set/update/:setId`: Update set weights, reps, or completed status
- `POST /api/workouts/session/:sessionId/add-exercise`: Add exercise to active session
- `POST /api/workouts/session/set/add`: Add extra set to exercise
- `POST /api/workouts/session/:id/complete`: Finish session, calculate volume lifted and calories burned
- `GET /api/workouts/session/history`: Completed workout sessions history

### Nutrition & Hydration (`/api/nutrition`)
- `GET /api/nutrition/daily?date=YYYY-MM-DD`: Daily calories, macros (P/C/F), water, and meals
- `POST /api/nutrition/log`: Log meal and food items `{ date, mealType, foodItems }`
- `DELETE /api/nutrition/log/:id`: Remove logged meal or item
- `POST /api/nutrition/water`: Record water intake `{ amountMl, date }`
- `GET /api/nutrition/database?q=query`: Search food item database
- `GET /api/nutrition/weekly`: 7-day caloric intake analytics

### Progress & Goals (`/api/progress`)
- `GET /api/progress`: Chronological progress records
- `POST /api/progress`: Log weight, body measurements, and photo `{ weightKg, chestCm, waistCm, armsCm }`
- `GET /api/progress/analytics`: Cumulative stats, weight timeline, volume progression, milestones
- `GET /api/progress/goals`: List active fitness targets
- `POST /api/progress/goals`: Create new fitness milestone
- `PUT /api/progress/goals/:id`: Update goal progress

### AI Fitness Coach (`/api/ai`)
- `POST /api/ai/workout-plan`: Generate personalized workout split `{ focus, daysPerWeek, prompt }`
- `POST /api/ai/nutrition-advice`: Calibrate nutrition and meal plans `{ targetCalories }`
- `POST /api/ai/chat`: Interactive fitness chatbot `{ message }`
- `GET /api/ai/chat/history`: Retrieve recent chat dialogue

### Notifications (`/api/notifications`)
- `GET /api/notifications`: List in-app notifications
- `PUT /api/notifications/:id/read`: Mark notification as read
- `POST /api/notifications/read-all`: Mark all as read
- `DELETE /api/notifications`: Clear notification history

---

## 🗄️ PostgreSQL & Deployment

### Switching to PostgreSQL for Production
1. In `server/prisma/`, copy `schema.postgresql.prisma` to `schema.prisma` (or change `provider = "sqlite"` to `provider = "postgresql"`).
2. Set your PostgreSQL URI in `server/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/fittrack_db?schema=public"
   ```
3. Run `npx prisma db push` and `npx ts-node src/seed/seed.ts`.

### Docker & Docker Compose
To run PostgreSQL and the FitTrack backend together via Docker:
```bash
docker compose up --build
```

### Deploying Frontend to Vercel
1. Push your repository to GitHub.
2. In [Vercel](https://vercel.com), click **Import Project** and select the `client` directory as the Root Directory.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configure environment variables (e.g. `VITE_API_URL` pointing to your deployed Render backend).

### Deploying Backend to Render
1. In [Render](https://render.com), create a new **Web Service** connected to your repository.
2. Set Root Directory to `server`.
3. Build Command: `npm install && npx prisma generate && npm run build`
4. Start Command: `npm start`
5. Create a Render **PostgreSQL Database** and attach its internal connection string to `DATABASE_URL`.
6. Add `JWT_SECRET` and optional `OPENAI_API_KEY`.

---

## 📜 Medical & Educational Disclaimer

FitTrack AI workout programs, nutritional calculations, and advice are for informational and educational purposes only and are not a substitute for professional medical advice, clinical diagnosis, or medical treatment. Always consult with a licensed physician or certified sports trainer before embarking on any new training or nutrition regimen.

---

## 📄 License
This project is licensed under the MIT License. Developed for advanced full-stack software engineering and AI application portfolios.
=======
# apex-ai

