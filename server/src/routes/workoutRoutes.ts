import { Router } from 'express';
import {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  startWorkoutSession,
  getActiveSession,
  completeWorkoutSession,
  updateSet,
  addExerciseToSession,
  addSetToExercise,
  getExercises,
  getSessionHistory,
} from '../controllers/workoutController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

// Exercises Catalog
router.get('/exercises', getExercises);

// Workout Plans
router.get('/', getWorkouts);
router.post('/', createWorkout);
router.get('/:id', getWorkoutById);
router.put('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);

// Live Sessions
router.get('/session/active', getActiveSession);
router.get('/session/history', getSessionHistory);
router.post('/session/start', startWorkoutSession);
router.post('/session/set/update/:setId', updateSet);
router.post('/session/:sessionId/add-exercise', addExerciseToSession);
router.post('/session/set/add', addSetToExercise);
router.post('/session/:id/complete', completeWorkoutSession);

export default router;
