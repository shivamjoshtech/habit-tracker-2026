'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, CheckCircle2, Circle, LogOut, 
  Download, BarChart3, LayoutGrid, 
  Flame, Trash2, RotateCcw
} from 'lucide-react';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isBefore, isAfter, parseISO, subDays, isSameDay
} from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, Cell 
} from 'recharts';
import * as XLSX from 'xlsx';
import Image from 'next/image';

export default function HabitTracker() {
  const [habits, setHabits] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [streak, setStreak] = useState(0);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchData(user.id);
      } else {
        window.location.href = '/auth';
      }
    };
    getUser();
  }, []);

  const fetchData = async (userId: string) => {
    setLoading(true);
    const { data: habitsData } = await supabase.from('habits').select('*').eq('user_id', userId);
    const { data: logsData } = await supabase.from('habit_logs').select('*').eq('user_id', userId);
    if (habitsData) setHabits(habitsData);
    if (logsData) {
      setLogs(logsData);
      calculatePerfectStreak(habitsData || [], logsData || []);
    }
    setLoading(false);
  };

  const calculatePerfectStreak = (allHabits: any[], allLogs: any[]) => {
    if (allHabits.length === 0) { setStreak(0); return; }
    let currentStreak = 0;
    let checkDate = today;
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const activeHabitsOnThatDay = allHabits.filter(h => !isAfter(parseISO(h.start_date), checkDate));
      if (activeHabitsOnThatDay.length === 0) break;
      const completedOnThatDay = allLogs.filter(l => l.log_date === dateStr && l.completed);
      const isPerfectDay = activeHabitsOnThatDay.length > 0 && completedOnThatDay.length === activeHabitsOnThatDay.length;
      if (isPerfectDay) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        if (isSameDay(checkDate, today)) { checkDate = subDays(checkDate, 1); continue; }
        break;
      }
    }
    setStreak(currentStreak);
  };

  const resetTodayData = async () => {
    if (!confirm('Reset today\'s progress?')) return;
    const { error } = await supabase.from('habit_logs').delete().eq('user_id', user.id).eq('log_date', todayStr);
    if (!error) {
      const updatedLogs = logs.filter(l => l.log_date !== todayStr);
      setLogs(updatedLogs);
      calculatePerfectStreak(habits, updatedLogs);
    }
  };

  const addHabit = async () => {
    if (!newHabit || !user) return;
    const { data, error } = await supabase.from('habits').insert([{ name: newHabit, user_id: user.id, start_date: todayStr }]).select();
    if (!error && data) {
      const updatedHabits = [...habits, data[0]];
      setHabits(updatedHabits);
      setNewHabit('');
      calculatePerfectStreak(updatedHabits, logs);
    }
  };

  const toggleHabit = async (habitId: string) => {
    const existingLog = logs.find(l => l.habit_id === habitId && l.log_date === todayStr);
    let updatedLogs;
    if (existingLog) {
      await supabase.from('habit_logs').delete().eq('id', existingLog.id);
      updatedLogs = logs.filter(l => l.id !== existingLog.id);
    } else {
      const { data } = await supabase.from('habit_logs').insert([{ habit_id: habitId, user_id: user.id, log_date: todayStr, completed: true }]).select();
      updatedLogs = data ? [...logs, data[0]] : logs;
    }
    setLogs(updatedLogs);
    calculatePerfectStreak(habits, updatedLogs);
  };

  const downloadMonthlyReport = () => {
    const reportData = habits.map(habit => {
      const habitRow: any = { "Habit Name": habit.name };
      daysInMonth.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const isBeforeStart = isBefore(day, parseISO(habit.start_date));
        const log = logs.find(l => l.habit_id === habit.id && l.log_date === dateStr);
        const isFuture = isAfter(day, today) && !isSameDay(day, today);
        if (isBeforeStart) habitRow[format(day, 'MMM d')] = "Nil";
        else if (isFuture) habitRow[format(day, 'MMM d')] = "";
        else habitRow[format(day, 'MMM d')] = log ? "Done" : "Pending";
      });
      return habitRow;
    });
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tracker");
    XLSX.writeFile(workbook, `HabitFlow_2026_${format(today, 'MMM')}.xlsx`);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0a0a0c] text-indigo-400 font-black italic tracking-tighter animate-pulse">LOADING FLOW...</div>;

  return (
    <div className="bg-[#0a0a0c] text-white min-h-screen transition-all duration-500 pb-20">
      <nav className="sticky top-0 z-50 backdrop-blur-2xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Logo Section */}
            <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-lg shadow-indigo-500/20">
              <Image 
                src="/habitflow-logo.svg" 
                alt="HabitFlow 2026" 
                fill
                className="object-contain p-1"
              />
            </div>
            <span className="text-xl font-black uppercase italic tracking-tighter text-white">HabitFlow <span className="text-indigo-500">2026</span></span>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="text-rose-400 font-bold text-xs hover:bg-rose-500/10 px-4 py-2 rounded-xl transition-all tracking-widest uppercase">Logout</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-10">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-8 rounded-[2rem] bg-white/5 border border-white/5 shadow-sm">
            <h2 className="text-4xl font-bold mb-2 text-white">Welcome, {user?.user_metadata?.full_name?.split(' ')[0]}!</h2>
            <p className="text-slate-400 mb-6 font-medium">Master your discipline with precision.</p>
            <button onClick={downloadMonthlyReport} className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 transition-all">
              <Download size={18} /> EXPORT DATA
            </button>
          </div>
          
          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col items-center justify-center shadow-sm relative group">
            <button onClick={resetTodayData} className="absolute top-4 right-4 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-all text-slate-400 hover:text-rose-500 flex items-center gap-1 text-[8px] font-bold">RESET TODAY <RotateCcw size={14} /></button>
            <Flame size={54} className={streak > 0 ? "text-orange-500 animate-pulse drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" : "text-slate-800"} />
            <p className="text-6xl font-black text-white mt-2">{streak}</p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black mt-1 text-center">Perfect Streak</p>
          </div>
        </section>

        {/* Habits & Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl border border-white/5 bg-white/5 shadow-sm">
              <div className="flex gap-2">
                <input 
                  type="text" placeholder="Add new objective..." value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-white text-sm font-medium"
                />
                <button onClick={addHabit} className="bg-indigo-600 text-white p-4 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"><Plus size={20} /></button>
              </div>
            </div>

            <div className="space-y-3">
              {habits.map(habit => {
                const isDone = logs.some(l => l.habit_id === habit.id && l.log_date === todayStr);
                return (
                  <div 
                    key={habit.id} onClick={() => toggleHabit(habit.id)}
                    className={`group cursor-pointer p-5 rounded-[1.5rem] border transition-all flex items-center justify-between ${
                      isDone ? 'bg-indigo-600 border-indigo-400 shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isDone ? <CheckCircle2 className="text-white" size={24} /> : <Circle className="text-slate-700" size={24} />}
                      <span className={`font-bold text-white/80 ${isDone ? '!text-white' : ''}`}>{habit.name}</span>
                    </div>
                    <button onClick={(e) => {e.stopPropagation(); if(confirm('Delete permanently?')) supabase.from('habits').delete().eq('id', habit.id).then(() => fetchData(user.id))}} className="opacity-0 group-hover:opacity-100 p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 size={18} /></button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8">
            {/* Weekly Analytics */}
            <div className="p-8 rounded-[2rem] border border-white/5 bg-white/5 shadow-sm">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-8 italic text-white uppercase tracking-tighter">
                <BarChart3 className="text-indigo-500" /> Consistency Lab
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Array.from({length: 7}).map((_, i) => { const d = subDays(today, 6-i); const dStr = format(d, 'yyyy-MM-dd'); const done = logs.filter(l => l.log_date === dStr).length; const active = habits.filter(h => !isAfter(parseISO(h.start_date), d)).length; return { day: format(d, 'EEE'), pct: active > 0 ? Math.round((done / active) * 100) : 0 }; })}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                    <Tooltip cursor={{fill: 'transparent'}} content={({active, payload}) => active && payload && (
                      <div className="bg-slate-900 border border-white/10 p-3 rounded-xl shadow-xl">
                        <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase">{payload[0].value}% Done</p>
                      </div>
                    )} />
                    <Bar dataKey="pct" radius={[10, 10, 10, 10]} barSize={40}>
                      {(Array.from({length: 7}).map((_, i) => { const d = subDays(today, 6-i); const dStr = format(d, 'yyyy-MM-dd'); const done = logs.filter(l => l.log_date === dStr).length; const active = habits.filter(h => !isAfter(parseISO(h.start_date), d)).length; return { pct: active > 0 ? Math.round((done / active) * 100) : 0 }; })).map((entry, index) => <Cell key={index} fill={entry.pct === 100 ? '#10b981' : '#6366f1'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Progress Table */}
            <div className="rounded-[2rem] border border-white/5 bg-white/5 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-white/5 bg-white/5"><h3 className="text-sm font-black uppercase tracking-widest text-slate-400 text-center">Monthly Progress View</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-[10px] text-slate-400 uppercase font-black">
                      <th className="p-4 text-left sticky left-0 bg-[#0a0a0c] z-10 border-r border-white/5">Habit</th>
                      {daysInMonth.map(day => <th key={day.toString()} className="p-2 min-w-[35px]">{format(day, 'd')}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {habits.map(habit => (
                      <tr key={habit.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                        <td className="p-4 font-bold text-xs sticky left-0 bg-[#0a0a0c] border-r border-white/5 z-10 text-white/80 whitespace-nowrap">{habit.name}</td>
                        {daysInMonth.map(day => {
                          const dStr = format(day, 'yyyy-MM-dd');
                          const isBeforeStart = isBefore(day, parseISO(habit.start_date));
                          const hasLog = logs.some(l => l.habit_id === habit.id && l.log_date === dStr);
                          const isFuture = isAfter(day, today) && !isSameDay(day, today);
                          return (
                            <td key={dStr} className="p-1">
                              <div className={`w-3 h-3 rounded-full mx-auto transition-all ${
                                isBeforeStart ? 'bg-white/5' : isFuture ? 'opacity-0' : hasLog ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]' : 'border border-white/10'
                              }`} />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="py-10 text-center text-slate-400 text-[10px] tracking-[0.5em] font-black uppercase italic">© 2026 HABIT-FLOW BY SHIVAM JOSHI</footer>
    </div>
  );
}