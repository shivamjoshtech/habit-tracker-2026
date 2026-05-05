'use client';
import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isBefore, parseISO } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function MonthlyAnalytics() {
  const [habits, setHabits] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: habitsData } = await supabase.from('habits').select('*');
    const { data: logsData } = await supabase.from('habit_logs').select('*');
    
    if (habitsData) setHabits(habitsData);
    if (logsData) setLogs(logsData);
    
    calculateAnalytics(habitsData || [], logsData || []);
  };

  const calculateAnalytics = (habitsList: any[], logsList: any[]) => {
    // Last 7 days productivity chart data
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      
      const completed = logsList.filter(l => l.log_date === dateStr && l.completed).length;
      const total = habitsList.filter(h => !isBefore(d, parseISO(h.start_date))).length;
      
      return {
        name: format(d, 'EEE'),
        score: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    }).reverse();
    
    setAnalyticsData(last7Days);
  };

  return (
    <div className="mt-12 space-y-8 pb-20">
      {/* 1. Productivity Chart */}
      <div className="glass-card p-6 border border-white/10">
        <h3 className="text-xl font-semibold mb-6">Weekly Productivity (%)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#818cf8' }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {analyticsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.score > 70 ? '#10b981' : '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Excel-Style Monthly Grid */}
      <div className="glass-card p-6 border border-white/10 overflow-x-auto">
        <h3 className="text-xl font-semibold mb-4">Monthly Overview - {format(today, 'MMMM yyyy')}</h3>
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="p-2 border-b border-white/10 sticky left-0 bg-slate-900 z-10">Habits</th>
              {daysInMonth.map(day => (
                <th key={day.toString()} className="p-2 border-b border-white/10 text-xs font-light min-w-[35px] text-center">
                  {format(day, 'd')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map(habit => (
              <tr key={habit.id} className="hover:bg-white/5 transition-colors">
                <td className="p-2 border-b border-white/10 font-medium sticky left-0 bg-slate-900 z-10">
                  {habit.name}
                </td>
                {daysInMonth.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isBeforeStart = isBefore(day, parseISO(habit.start_date));
                  const log = logs.find(l => l.habit_id === habit.id && l.log_date === dateStr);
                  
                  return (
                    <td key={dateStr} className="p-2 border-b border-white/10 text-center">
                      {isBeforeStart ? (
                        <span className="text-xs opacity-20 italic">Nil</span>
                      ) : (
                        <div className={`w-4 h-4 rounded-sm mx-auto ${log?.completed ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/10 border border-white/10'}`} />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}