'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Target } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center p-4 text-center">
      {/* Creative Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-600/20 blur-[120px] rounded-full"></div>

      <div className="relative z-10 space-y-8 max-w-2xl">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-rose-500 p-4 rounded-2xl shadow-2xl shadow-indigo-500/20 animate-bounce">
            <Target className="text-white" size={40} />
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-white">
            HabitFlow <span className="text-indigo-500">2026</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-md">
            Master your discipline with high-performance tracking and analytics.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => router.push('/auth')}
            className="w-full md:w-auto bg-white text-black px-10 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all transform active:scale-95 shadow-xl"
          >
            GET STARTED
          </button>
          <button 
            onClick={() => router.push('/tracker')}
            className="w-full md:w-auto bg-white/5 border border-white/10 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all"
          >
            DASHBOARD
          </button>
        </div>

        <footer className="pt-20 opacity-20 text-[10px] uppercase tracking-[0.5em] text-white">
          Engineered by Shivam Joshi • Port 3000 Stable
        </footer>
      </div>
    </div>
  );
}