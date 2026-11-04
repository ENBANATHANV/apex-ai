import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, Bell, X } from 'lucide-react';

interface RestTimerProps {
  initialSeconds?: number;
  onClose?: () => void;
  autoStart?: boolean;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds = 60,
  onClose,
  autoStart = false,
}) => {
  const [totalSeconds, setTotalSeconds] = useState<number>(initialSeconds);
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [isActive, setIsActive] = useState<boolean>(autoStart);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      // Play audio beep tone via Web Audio API
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 880; // A5 tone
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      } catch (e) {
        // audio context fallback
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggle = () => setIsActive(!isActive);

  const reset = (sec?: number) => {
    const s = sec !== undefined ? sec : totalSeconds;
    setTotalSeconds(s);
    setTimeLeft(s);
    setIsActive(true);
  };

  const addTime = (sec: number) => {
    setTimeLeft((prev) => prev + sec);
    setTotalSeconds((prev) => Math.max(prev, timeLeft + sec));
  };

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-zinc-900/95 border border-emerald-500/30 backdrop-blur-md rounded-2xl p-4 shadow-neon text-white max-w-xs w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400">
            Interval Rest Timer
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Circular Progress & Display */}
      <div className="flex items-center justify-center my-3">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="48"
              stroke="#27272a"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="56"
              cy="56"
              r="48"
              stroke="#22c55e"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={301.6}
              strokeDashoffset={301.6 - (301.6 * progressPercent) / 100}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-bold font-mono text-zinc-100 tracking-tight">
              {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </span>
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5">
              {isActive ? 'RESTING' : timeLeft === 0 ? 'GO SET!' : 'PAUSED'}
            </span>
          </div>
        </div>
      </div>

      {/* Preset Quick Selectors */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {[30, 60, 90, 120].map((s) => (
          <button
            key={s}
            onClick={() => reset(s)}
            className={`py-1 text-xs rounded-lg font-medium transition ${
              totalSeconds === s
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {s}s
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={toggle}
          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold transition ${
            isActive
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-neon'
          }`}
        >
          {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-black" />}
          {isActive ? 'Pause' : 'Start'}
        </button>

        <button
          onClick={() => addTime(15)}
          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition text-xs flex items-center gap-1"
          title="Add 15s"
        >
          <Plus className="w-3.5 h-3.5" /> 15s
        </button>

        <button
          onClick={() => reset(totalSeconds)}
          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
          title="Reset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
