'use client';

import { useState, useEffect } from 'react';
import { X, Palette, User, Moon, Sun, Globe, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Theme } from '../lib/types';
import { THEMES } from '../lib/themes';
import { createClient } from '../lib/supabaseClient';

interface Props {
  setIsSettingsOpen: (isOpen: boolean) => void;
  activeTheme: Theme;
  setActiveTheme: (theme: Theme) => void;
  patientProfile: any;
  setPatientProfile: (profile: any) => void;
  user: any;
}

export default function SettingsModal({ setIsSettingsOpen, activeTheme, setActiveTheme, patientProfile, setPatientProfile, user }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'language'>('profile');
  
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', age: '', gender: '',
    weightKg: '', heightCm: '', bloodType: '', bodyShape: '',
    genotype: '', sugarLevel: '', isPregnant: 'false',
    allergies: '', conditions: '', currentMeds: '', language: 'English'
  });

  // --- CHECK DARK MODE ON LOAD ---
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
  }, []);

  // --- TOGGLE DARK MODE FUNCTION ---
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // --- THE FOOLPROOF SYNC ---
  useEffect(() => {
    if (patientProfile) {
      setFormData({
        firstName: patientProfile.firstName || '', 
        lastName: patientProfile.lastName || '',
        age: patientProfile.age?.toString() || '', 
        gender: patientProfile.gender || '',
        weightKg: patientProfile.weightKg?.toString() || '', 
        heightCm: patientProfile.heightCm?.toString() || '',
        bloodType: patientProfile.bloodType || '', 
        bodyShape: patientProfile.bodyShape || '',
        genotype: patientProfile.genotype || '', 
        sugarLevel: patientProfile.sugarLevel || '',
        isPregnant: patientProfile.isPregnant ? 'true' : 'false',
        allergies: patientProfile.allergies || '', 
        conditions: patientProfile.conditions || '', 
        currentMeds: patientProfile.currentMeds || '',
        language: patientProfile.language || 'English'
      });
    }
  }, [patientProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId: user.id, email: user.email })
      });

      if (res.ok) {
        const updatedProfile = await res.json();
        setPatientProfile(updatedProfile); // Instantly updates Amelia's brain!
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Upgraded input class for dark mode compatibility
  const inputClass = "w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-[#2B2D31] text-gray-900 dark:text-gray-100 focus:ring-2 outline-none transition-colors";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1E1F22] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh] transition-colors duration-200 border border-gray-200 dark:border-gray-800">
        
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Settings</h2>
          <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-1/4 bg-gray-50 dark:bg-[#2B2D31] border-r border-gray-100 dark:border-gray-800 p-2 space-y-1 shrink-0 transition-colors duration-200">
            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-white dark:bg-[#1E1F22] text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'}`}><User size={16} /> Profile</button>
            <button onClick={() => setActiveTab('appearance')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'appearance' ? 'bg-white dark:bg-[#1E1F22] text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'}`}><Palette size={16} /> Appearance</button>
            <button onClick={() => setActiveTab('language')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'language' ? 'bg-white dark:bg-[#1E1F22] text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'}`}><Globe size={16} /> Language</button>
            
            <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 px-2">
              <button onClick={handleLogout} className="w-full text-left text-sm text-red-600 dark:text-red-400 font-medium hover:text-red-700 dark:hover:text-red-300">Log Out</button>
            </div>
          </div>

          <div className="w-3/4 p-6 overflow-y-auto bg-white dark:bg-[#1E1F22] transition-colors duration-200">
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-6 pb-6">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-2">Basic Info</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">First Name</label><input required name="firstName" value={formData.firstName} onChange={handleChange} className={inputClass} style={{ '--tw-ring-color': activeTheme.primary } as React.CSSProperties} /></div>
                    <div><label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Last Name</label><input required name="lastName" value={formData.lastName} onChange={handleChange} className={inputClass} style={{ '--tw-ring-color': activeTheme.primary } as React.CSSProperties} /></div>
                    <div><label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Age</label><input required type="number" name="age" value={formData.age} onChange={handleChange} className={inputClass} style={{ '--tw-ring-color': activeTheme.primary } as React.CSSProperties} /></div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Gender</label>
                      <select required name="gender" value={formData.gender} onChange={handleChange} className={inputClass} style={{ '--tw-ring-color': activeTheme.primary } as React.CSSProperties}>
                        <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-2">Biometrics & Clinical Data</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Weight (kg)</label><input type="number" step="0.1" name="weightKg" value={formData.weightKg} onChange={handleChange} className={inputClass} style={{ '--tw-ring-color': activeTheme.primary } as React.CSSProperties} /></div>
                    <div><label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Height (cm)</label><input type="number" step="0.1" name="heightCm" value={formData.heightCm} onChange={handleChange} className={inputClass} style={{ '--tw-ring-color': activeTheme.primary } as React.CSSProperties} /></div>
                    
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Blood Type</label>
                      <select name="bloodType" value={formData.bloodType} onChange={handleChange} className={inputClass} style={{ '--tw-ring-color': activeTheme.primary } as React.CSSProperties}>
                        <option value="">Select Type</option>
                        <option value="A+">A+</option><option value="A-">A-</option>
                        <option value="B+">B+</option><option value="B-">B-</option>
                        <option value="AB+">AB+</option><option value="AB-">AB-</option>
                        <option value="O+">O+</option><option value="O-">O-</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Genotype</label>
                      <select name="genotype" value={formData.genotype} onChange={handleChange} className={inputClass} style={{ '--tw-ring-color': activeTheme.primary } as React.CSSProperties}>
                        <option value="">Select Genotype</option>
                        <option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option><option value="AC">AC</option><option value="SC">SC</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Body Shape</label>
                      <select name="bodyShape" value={formData.bodyShape} onChange={handleChange} className={inputClass} style={{ '--tw-ring-color': activeTheme.primary } as React.CSSProperties}>
                        <option value="">Select Shape</option>
                        <option value="Apple (Waist-heavy)">Apple (Waist-heavy)</option>
                        <option value="Pear (Hip-heavy)">Pear (Hip-heavy)</option>
                        <option value="Hourglass">Hourglass</option>
                        <option value="Rectangle/Athletic">Rectangle / Athletic</option>
                        <option value="Inverted Triangle">Inverted Triangle</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Recent Sugar Level</label>
                      <input type="text" name="sugarLevel" placeholder="e.g. 90 mg/dL or Normal" value={formData.sugarLevel} onChange={handleChange} className={inputClass} style={{ '--tw-ring-color': activeTheme.primary } as React.CSSProperties} />
                    </div>

                    {formData.gender === 'Female' && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Are you currently pregnant?</label>
                        <select name="isPregnant" value={formData.isPregnant} onChange={handleChange} className={inputClass} style={{ '--tw-ring-color': activeTheme.primary } as React.CSSProperties}>
                          <option value="false">No</option>
                          <option value="true">Yes</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-2">Medical History</h3>
                  <div className="space-y-4">
                    <div><label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Allergies</label><textarea name="allergies" value={formData.allergies} onChange={handleChange} className={`${inputClass} h-16`} style={{ '--tw-ring-color': activeTheme.primary } as React.CSSProperties} /></div>
                    <div><label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Chronic Conditions</label><textarea name="conditions" value={formData.conditions} onChange={handleChange} className={`${inputClass} h-16`} style={{ '--tw-ring-color': activeTheme.primary } as React.CSSProperties} /></div>
                    <div><label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Current Medications</label><textarea name="currentMeds" value={formData.currentMeds} onChange={handleChange} className={`${inputClass} h-16`} style={{ '--tw-ring-color': activeTheme.primary } as React.CSSProperties} /></div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={loading} className="text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors hover:opacity-90 shadow-sm" style={{ backgroundColor: activeTheme.primary }}>
                    <Save size={18} /> {loading ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* --- NEW APPEARANCE TAB --- */}
            {activeTab === 'appearance' && (
               <div className="space-y-8 animate-in fade-in duration-300">
                 
                 {/* Dark Mode Toggle */}
                 <div>
                   <h3 className="font-semibold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-2">Display Mode</h3>
                   <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#2B2D31] rounded-xl border border-gray-100 dark:border-gray-800">
                     <div className="flex items-center gap-3">
                       {isDarkMode ? <Moon className="text-indigo-400" size={24} /> : <Sun className="text-amber-500" size={24} />}
                       <div>
                         <p className="font-medium text-gray-900 dark:text-white">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</p>
                         <p className="text-xs text-gray-500 dark:text-gray-400">Adjust the interface for {isDarkMode ? 'daytime' : 'nighttime'} reading.</p>
                       </div>
                     </div>
                     
                     <button onClick={toggleDarkMode} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isDarkMode ? 'bg-indigo-500' : 'bg-gray-300'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                     </button>
                   </div>
                 </div>

                 {/* Theme Colors */}
                 <div>
                   <h3 className="font-semibold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-2">Accent Color</h3>
                   <div className="flex flex-wrap gap-4">
                     {Object.values(THEMES).map((theme) => (
                       <button
                         key={theme.name}
                         onClick={() => setActiveTheme(theme)}
                         className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm ${activeTheme.name === theme.name ? 'ring-4 ring-offset-2 dark:ring-offset-[#1E1F22]' : 'ring-1 ring-gray-200 dark:ring-gray-700'}`}
                         style={{ backgroundColor: theme.primary, borderColor: activeTheme.name === theme.name ? theme.primary : 'transparent' }}
                         title={theme.name}
                       >
                         {activeTheme.name === theme.name && <span className="w-3 h-3 bg-white rounded-full shadow-sm" />}
                       </button>
                     ))}
                   </div>
                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Choose the primary color for Amelia's buttons and accents.</p>
                 </div>

               </div>
            )}

            {/* --- THE LANGUAGE TAB --- */}
            {activeTab === 'language' && (
              <form onSubmit={handleSaveProfile} className="space-y-6 pb-6 animate-in fade-in duration-300">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-3">AI Language Preference</h3>
                  <select name="language" value={formData.language} onChange={handleChange} className={inputClass} style={{ '--tw-ring-color': activeTheme.primary } as React.CSSProperties}>
                    <option value="English">English (Default)</option>
                    <option value="Yoruba">Yoruba</option>
                    <option value="Hausa">Hausa</option>
                    <option value="Igbo">Igbo</option>
                    <option value="Nigerian Pidgin">Nigerian Pidgin</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-2">Amelia will instantly switch her medical advice to your chosen language.</p>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={loading} className="text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors hover:opacity-90 shadow-sm" style={{ backgroundColor: activeTheme.primary }}>
                    <Save size={18} /> {loading ? 'Saving...' : 'Save Language Preference'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}