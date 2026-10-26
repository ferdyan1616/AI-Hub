import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { formatTime } from '../utils/calc.ts';

interface PomodoroTimerProps {
  completedSessions: number;
  onSessionComplete: () => void;
}

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const MODE_CONFIG: Record<TimerMode, { label: string; duration: number; color: string }> = {
  focus: { label: 'Sesi Fokus', duration: 25 * 60, color: 'text-indigo-600' },
  shortBreak: { label: 'Istirahat Singkat', duration: 5 * 60, color: 'text-emerald-600' },
  longBreak: { label: 'Istirahat Panjang', duration: 15 * 60, color: 'text-sky-600' },
};

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  completedSessions,
  onSessionComplete,
}) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_CONFIG.focus.duration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Play gentle sound with Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch {
      // AudioContext may be restricted until user gesture, safely ignore
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Handle timer completion outside of render / state updater
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playChime();
      if (mode === 'focus') {
        onSessionComplete();
      }
    }
  }, [timeLeft, isRunning, mode, onSessionComplete]);

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_CONFIG[newMode].duration);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(MODE_CONFIG[mode].duration);
  };

  const totalDuration = MODE_CONFIG[mode].duration;
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;
  const strokeDashoffset = 100 - progressPercent;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Timer Fokus Pomodoro
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Tingkatkan konsentrasi kerja dengan interval fokus teratur.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-sm mx-auto">
        <button
          onClick={() => switchMode('focus')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            mode === 'focus'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Fokus (25m)
        </button>
        <button
          onClick={() => switchMode('shortBreak')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            mode === 'shortBreak'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Istirahat (5m)
        </button>
        <button
          onClick={() => switchMode('longBreak')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            mode === 'longBreak'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Panjang (15m)
        </button>
      </div>

      {/* Circular Display */}
      <div className="relative p-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-slate-100"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className={mode === 'focus' ? 'text-indigo-600' : mode === 'shortBreak' ? 'text-emerald-500' : 'text-sky-500'}
              strokeWidth="6"
              strokeDasharray="276.46"
              strokeDashoffset={(strokeDashoffset / 100) * 276.46}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>

          {/* Time In Center */}
          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">
              {MODE_CONFIG[mode].label}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={handleReset}
            title="Atur Ulang"
            className="p-3 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-8 py-3.5 rounded-full font-semibold text-white shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Jeda</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Mulai Fokus</span>
              </>
            )}
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Suara Aktif' : 'Suara Mati'}
            className="p-3 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Session Stats */}
        <div className="flex items-center gap-2 mt-6 text-xs text-slate-500">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Sesi fokus selesai hari ini:</span>
          <span className="font-bold text-slate-800 tabular-nums">{completedSessions}</span>
        </div>
      </div>

      {/* Productivity Advice */}
      <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/60 text-xs text-indigo-950 leading-relaxed">
        <p className="font-semibold mb-1">💡 Tips Teknik Pomodoro:</p>
        <p className="text-slate-600">
          Fokuskan perhatian penuh pada 1 tugas tunggal selama 25 menit tanpa distraksi ponsel atau media sosial. Setelah 4 sesi berturut-turut, ambil istirahat panjang selama 15–30 menit untuk menyegarkan pikiran.
        </p>
      </div>
    </div>
  );
};
