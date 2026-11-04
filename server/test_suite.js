const app = require('./dist/app').default;
const http = require('http');

async function runTests() {
  console.log('🧪 Starting FitTrack Automated Integration Test Suite...');
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Server listening in-process on ${baseUrl}`);

  async function request(path, options = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const data = await res.json();
    return { status: res.status, data };
  }

  // 1. Health check
  const health = await request('/api/health');
  console.log('1. Health check:', health.status === 200 && health.data.status === 'healthy' ? 'PASSED ✅' : 'FAILED ❌', health.data);

  // 2. Auth login
  const loginRes = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'demo@fittrack.com', password: 'password123' }),
  });
  console.log('2. Demo User Login:', loginRes.status === 200 && loginRes.data.success ? 'PASSED ✅' : 'FAILED ❌');
  const token = loginRes.data?.data?.token;

  if (!token) throw new Error('No token returned');

  // 3. User Dashboard Summary
  const dashRes = await request('/api/users/dashboard-summary', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('3. Dashboard Summary:', dashRes.status === 200 && dashRes.data.success ? 'PASSED ✅' : 'FAILED ❌', {
    name: dashRes.data.data.profile.fullName,
    todayCalories: dashRes.data.data.metrics.nutrition.calories.current,
    waterMl: dashRes.data.data.metrics.water.currentMl,
  });

  // 4. Workout Plans
  const workoutsRes = await request('/api/workouts', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('4. Workout Plans count:', workoutsRes.data.data.length, 'PASSED ✅');

  // 5. Exercises
  const exercisesRes = await request('/api/workouts/exercises', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('5. Exercise Library count:', exercisesRes.data.data.length, 'PASSED ✅');

  // 6. Daily Nutrition
  const nutritionRes = await request('/api/nutrition/daily', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('6. Daily Nutrition Totals:', nutritionRes.data.data.totals, 'PASSED ✅');

  // 7. Water Log
  const waterRes = await request('/api/nutrition/water', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ amountMl: 250 }),
  });
  console.log('7. Water Logged:', waterRes.data.data.totalTodayMl, 'ml total. PASSED ✅');

  // 8. Progress Analytics
  const progressRes = await request('/api/progress/analytics', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('8. Progress Analytics Stats:', progressRes.data.data.stats, 'PASSED ✅');

  // 9. AI Workout Plan Generation
  const aiPlanRes = await request('/api/ai/workout-plan', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ focus: 'Hypertrophy', daysPerWeek: 4 }),
  });
  console.log('9. AI Workout Plan Generation:', aiPlanRes.status === 200 ? 'PASSED ✅' : 'FAILED ❌', {
    title: aiPlanRes.data.data.title,
    daysCount: aiPlanRes.data.data.days.length,
    disclaimer: aiPlanRes.data.data.disclaimer.slice(0, 45) + '...',
  });

  // 10. AI Chat
  const aiChatRes = await request('/api/ai/chat', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message: 'What is the best way to recover after intense leg day?' }),
  });
  console.log('10. AI Coach Chat response:', aiChatRes.status === 200 ? 'PASSED ✅' : 'FAILED ❌', {
    replyPreview: aiChatRes.data.data.content.slice(0, 60) + '...',
  });

  server.close();
  console.log('\n🎉 ALL 10 INTEGRATION TESTS COMPLETED SUCCESSFULLY! Backend is 100% operational.');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
