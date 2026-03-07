'use client';

import { useState, useEffect } from 'react';
import { X, Droplets, Pill, Activity, CalendarDays, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { Theme } from '../lib/types';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: any;
  activeTheme: Theme;
  triggerAlert: (message: string, type: 'success' | 'warning' | 'info' | 'reminder') => void;
}

export default function HealthDashboard({ isOpen, setIsOpen, user, activeTheme, triggerAlert }: Props) {
  const [loading, setLoading] = useState(true);
  const [vitals, setVitals] = useState({ waterLiters: 0, steps: 0, medsTaken: false });
  const [dateString, setDateString] = useState('');

  // Get Today's Date in YYYY-MM-DD
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDateString(today);
  }, []);

  // Fetch Vitals when Dashboard Opens
  useEffect(() => {
    if (isOpen && user && dateString) {
      fetch(`/api/vitals?userId=${user.id}&date=${dateString}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setVitals({ waterLiters: data.waterLiters || 0, steps: data.steps || 0, medsTaken: data.medsTaken || false });
          }
          setLoading(false);
        });
    }
  }, [isOpen, user, dateString]);

  // Save Vitals to Database
  const updateVitals = async (newVitals: any) => {
    setVitals(newVitals);
    await fetch('/api/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, dateString, ...newVitals })
    });
  };

  const handleWater = (amount: number) => {
    const newAmount = Math.max(0, Number((vitals.waterLiters + amount).toFixed(2)));
    updateVitals({ ...vitals, waterLiters: newAmount });
    if (newAmount > vitals.waterLiters) triggerAlert("Hydration logged! Keep it up.", 'success');
  };

  const toggleMeds = () => {
    const newState = !vitals.medsTaken;
    updateVitals({ ...vitals, medsTaken: newState });
    if (newState) triggerAlert("Great job taking your medication today!", 'success');
  };

  if (!isOpen) return null;

  const waterGoal = 2.5;
  const waterPercent = Math.min(100, (vitals.waterLiters / waterGoal) * 100);

  return (
    <>
      {/* Mobile Background Overlay */}
      <div className="fixed inset-0 bg-black/40 z-60 xl:hidden backdrop-blur-sm animate-in fade-in" onClick={() => setIsOpen(false)} />

      {/* Slide-out Panel: Bottom Sheet on Mobile, Right Sidebar on Desktop */}
      <div className="fixed inset-x-0 bottom-0 xl:inset-y-0 xl:right-0 xl:left-auto xl:w-100 z-70 bg-[#f4f4f5] dark:bg-[#17181A] xl:border-l border-t xl:border-t-0 border-gray-200 dark:border-gray-800 rounded-t-3xl xl:rounded-none shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] animate-in slide-in-from-bottom xl:slide-in-from-right flex flex-col h-[85vh] xl:h-full">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-white dark:bg-[#1E1F22] rounded-t-3xl xl:rounded-none border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity style={{ color: activeTheme.primary }} size={22} /> Daily Vitals
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
              <CalendarDays size={14} /> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center"><div className="w-6 h-6 border-4 border-gray-300 border-t-[#FC94AF] rounded-full animate-spin"></div></div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            
            {/* --- BENTO BOX GRID --- */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* HYDRATION WIDGET (Spans full width) */}
              <div className="col-span-2 bg-white dark:bg-[#1E1F22] rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 font-semibold">
                    <Droplets size={20} /> Hydration
                  </div>
                  <span className="text-2xl font-bold text-gray-800 dark:text-white">{vitals.waterLiters}<span className="text-sm text-gray-400 font-medium"> / {waterGoal}L</span></span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="h-4 w-full bg-blue-50 dark:bg-gray-800 rounded-full overflow-hidden mb-6 relative border border-blue-100 dark:border-gray-700">
                  <div 
                    className="absolute top-0 left-0 h-full bg-linear-to-r from-blue-400 to-blue-500 transition-all duration-1000 ease-out"
                    style={{ width: `${waterPercent}%` }}
                  />
                </div>

                {/* Quick Add Buttons */}
                <div className="flex gap-2">
                  <button onClick={() => handleWater(-0.25)} disabled={vitals.waterLiters <= 0} className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors">
                    <Minus size={20} />
                  </button>
                  <button onClick={() => handleWater(0.25)} className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold rounded-xl transition-colors">
                    <Plus size={18} /> Add 250ml
                  </button>
                </div>
              </div>

              {/* MEDICATION WIDGET (Half width) */}
              <div 
                onClick={toggleMeds}
                className={`col-span-1 rounded-3xl p-5 border shadow-sm cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between min-h-35 ${
                  vitals.medsTaken 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' 
                    : 'bg-white dark:bg-[#1E1F22] border-gray-100 dark:border-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-full ${vitals.medsTaken ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                    <Pill size={20} />
                  </div>
                  {vitals.medsTaken && <CheckCircle2 size={20} className="text-emerald-500" />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white mb-1">Medication</h3>
                  <p className={`text-xs font-medium ${vitals.medsTaken ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                    {vitals.medsTaken ? 'Taken today' : 'Tap to log'}
                  </p>
                </div>
              </div>

              {/* STEPS WIDGET (Half width) */}
              <div className="col-span-1 bg-white dark:bg-[#1E1F22] rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between min-h-35">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500">
                    <Activity size={20} />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <input 
                      type="number" 
                      value={vitals.steps || ''} 
                      onChange={(e) => updateVitals({...vitals, steps: parseInt(e.target.value) || 0})}
                      placeholder="0"
                      className="w-full bg-transparent font-bold text-2xl text-gray-800 dark:text-white outline-none placeholder-gray-300 dark:placeholder-gray-700"
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-400">Daily Steps</p>
                </div>
              </div>

            </div>

            <div className="mt-8 text-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
               <p className="text-sm text-gray-500 dark:text-gray-400">Amelia monitors these vitals to personalize your AI medical advice in real-time.</p>
            </div>

          </div>
        )}
      </div>
    </>
  );
}