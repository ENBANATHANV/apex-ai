import app from './app';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 FitTrack API Server running on port ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`💓 Health: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use by another running process.`);
    console.error(`💡 This usually happens if 'start_all.bat' already launched the server in another window.`);
    console.error(`👉 To terminate the process occupying port ${PORT}, run in PowerShell:`);
    console.error(`   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});
