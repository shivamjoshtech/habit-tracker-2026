'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Lock, Mail, User, Target } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else window.location.href = '/tracker';
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName } }
      });
      if (error) alert(error.message);
      else alert('Check your email for confirmation!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0c] p-4 transition-colors duration-500">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-block bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-500/20 mb-2">
            <Target className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
            HabitFlow <span className="text-indigo-600">2026</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {isLogin ? 'Welcome back to your discipline hub' : 'Start your journey to mastery today'}
          </p>
        </div>

        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-8 rounded-[2.5rem] shadow-xl dark:shadow-none">
          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="text" placeholder="Full Name" required
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-12 py-3.5 focus:outline-none focus:ring-2 ring-indigo-500 text-slate-900 dark:text-white transition-all"
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input 
                type="email" placeholder="Email Address" required
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-12 py-3.5 focus:outline-none focus:ring-2 ring-indigo-500 text-slate-900 dark:text-white transition-all"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" required
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-12 py-3.5 focus:outline-none focus:ring-2 ring-indigo-500 text-slate-900 dark:text-white transition-all"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-indigo-500 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? 'PROCESSING...' : isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-widest"
            >
              {isLogin ? "Need an account? Sign Up" : "Have an account? Login"}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 tracking-[0.4em] uppercase font-mono">
          © 2026 Habit-Flow Engineering
        </p>
      </div>
    </div>
  );
}