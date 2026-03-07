'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Activity, Droplet, AlertTriangle, Pill, ClipboardList } from 'lucide-react';
import { createClient } from '../../lib/supabaseClient';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>(''); 
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', age: '', gender: '',
    weightKg: '', heightCm: '', bloodType: '', bodyShape: '',
    genotype: '', sugarLevel: '', isPregnant: 'false',
    allergies: '', conditions: '', currentMeds: ''
  });

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUserId(session.user.id);
      setUserEmail(session.user.email || '');

      const res = await fetch(`/api/profile?userId=${session.user.id}`, { cache: 'no-store' });
      const profile = await res.json();
      
      if (profile && profile.id) { 
        setFormData({
          firstName: profile.firstName || '', lastName: profile.lastName || '',
          age: profile.age?.toString() || '', gender: profile.gender || '',
          weightKg: profile.weightKg?.toString() || '', heightCm: profile.heightCm?.toString() || '',
          bloodType: profile.bloodType || '', bodyShape: profile.bodyShape || '',
          genotype: profile.genotype || '', sugarLevel: profile.sugarLevel || '',
          isPregnant: profile.isPregnant ? 'true' : 'false',
          allergies: profile.allergies || '', conditions: profile.conditions || '', 
          currentMeds: profile.currentMeds || ''
        });
        setIsEditing(true);
      }
    };
    checkStatus();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId, email: userEmail }) 
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Failed to save: ${errorData.error || 'Unknown database error'}`);
        setLoading(false);
        return;
      }

      router.refresh();
      router.push('/'); 
    } catch (err) {
      alert("A network error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!userId) return null; 

  const inputClass = "w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-[#FC94AF] focus:border-[#FC94AF] outline-none shadow-sm";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        <div className="bg-[#FC94AF] px-8 py-6 text-white text-center">
          <ClipboardList size={40} className="mx-auto mb-3 opacity-90" />
          <h2 className="text-2xl font-bold tracking-wide">
            {isEditing ? 'Update Medical Profile' : 'Patient Medical Profile'}
          </h2>
          <p className="text-white/80 text-sm mt-1">Please provide your vitals and history to personalize Amelia's AI.</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4 border-b pb-2">
              <User size={18} className="text-[#FC94AF]" /> Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required name="firstName" value={formData.firstName} placeholder="First Name" onChange={handleChange} className={inputClass} />
              <input required name="lastName" value={formData.lastName} placeholder="Last Name" onChange={handleChange} className={inputClass} />
              <input required type="number" name="age" value={formData.age} placeholder="Age" onChange={handleChange} className={inputClass} />
              <select required name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4 border-b pb-2">
              <Activity size={18} className="text-[#FC94AF]" /> Biometrics & Clinical Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="number" step="0.1" name="weightKg" value={formData.weightKg} placeholder="Weight (kg)" onChange={handleChange} className={inputClass} />
              <input required type="number" step="0.1" name="heightCm" value={formData.heightCm} placeholder="Height (cm)" onChange={handleChange} className={inputClass} />
              
              <div className="relative">
                <Droplet size={16} className="absolute top-3.5 left-3 text-red-400" />
                <select name="bloodType" value={formData.bloodType} onChange={handleChange} className={`${inputClass} pl-9`}>
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                </select>
              </div>

              <select name="genotype" value={formData.genotype} onChange={handleChange} className={inputClass}>
                <option value="">Select Genotype</option>
                <option value="AA">AA</option><option value="AS">AS</option>
                <option value="SS">SS</option><option value="AC">AC</option><option value="SC">SC</option>
              </select>

              <select name="bodyShape" value={formData.bodyShape} onChange={handleChange} className={inputClass}>
                <option value="">Select Body Shape</option>
                <option value="Apple (Waist-heavy)">Apple (Waist-heavy)</option>
                <option value="Pear (Hip-heavy)">Pear (Hip-heavy)</option>
                <option value="Hourglass">Hourglass</option>
                <option value="Rectangle/Athletic">Rectangle / Athletic</option>
                <option value="Inverted Triangle">Inverted Triangle</option>
              </select>

              <input type="text" name="sugarLevel" placeholder="Recent Sugar Level (e.g. 90 mg/dL)" value={formData.sugarLevel} onChange={handleChange} className={inputClass} />

              {formData.gender === 'Female' && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 block mb-1">Are you currently pregnant?</label>
                  <select name="isPregnant" value={formData.isPregnant} onChange={handleChange} className={inputClass}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4 border-b pb-2">
              <AlertTriangle size={18} className="text-[#FC94AF]" /> Medical History
            </h3>
            <div className="space-y-4">
              <textarea name="allergies" value={formData.allergies} placeholder="Known Allergies (e.g., Penicillin) - Leave blank if none" onChange={handleChange} className={`${inputClass} h-20`} />
              <textarea name="conditions" value={formData.conditions} placeholder="Chronic Conditions (e.g., Diabetes) - Leave blank if none" onChange={handleChange} className={`${inputClass} h-20`} />
              <div className="relative">
                <Pill size={18} className="absolute top-3.5 left-3 text-gray-400" />
                <textarea name="currentMeds" value={formData.currentMeds} placeholder="Current Medications - Leave blank if none" onChange={handleChange} className={`${inputClass} h-20 pl-10`} />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#FC94AF] text-white font-bold py-4 rounded-xl shadow-md hover:bg-[#e8839d] transition-colors disabled:opacity-50 text-lg"
          >
            {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Complete Setup & Meet Amelia')}
          </button>

        </form>
      </div>
    </div>
  );
}