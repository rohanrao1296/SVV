import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import { Save, ShieldCheck, MapPin, MessageSquare, Clock, School, Download, LogOut } from 'lucide-react';

export const Settings: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { settings, updateSettings, backupDatabase } = useAppData();
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    setForm({ ...settings });
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'lateThresholdMinutes' || name === 'allowedRadiusMetres' || name === 'campusLatitude' || name === 'campusLongitude') {
      setForm(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateSettings(form);
    if (success) {
      showSuccess('School Profile & Settings saved to database!');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } else {
      showError('Failed to save school profile settings.');
    }
  };


  const handleBackup = () => {
    const dataStr = backupDatabase();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `svv_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">School Configuration Panel</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Manage institution settings, GPS coordinates, SMS configurations, and backups.
        </p>
      </div>

      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-sm border border-emerald-200 dark:border-emerald-900/30 font-semibold flex items-center gap-2">
          <ShieldCheck size={18} />
          Settings saved successfully! School parameters updated.
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: School Identity & Timings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-premium space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <School size={18} className="text-primary" />
            School Profile & Hours
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">School Name</label>
              <input 
                type="text" 
                name="schoolName"
                value={form.schoolName}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-primary"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Website URL</label>
              <input 
                type="url" 
                name="schoolWebsite"
                value={form.schoolWebsite}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                <Clock size={12} /> Start Time
              </label>
              <input 
                type="time" 
                name="schoolTimingStart"
                value={form.schoolTimingStart}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                <Clock size={12} /> End Time
              </label>
              <input 
                type="time" 
                name="schoolTimingEnd"
                value={form.schoolTimingEnd}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Attendance Lock Time</label>
              <input 
                type="time" 
                name="attendanceTimingLimit"
                value={form.attendanceTimingLimit}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Late Threshold (Min)</label>
              <input 
                type="number" 
                name="lateThresholdMinutes"
                value={form.lateThresholdMinutes}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Card 2: GPS Campus Coordinates */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-premium space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <MapPin size={18} className="text-secondary" />
            Campus Location (Geofencing)
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Enable GPS Verification</h4>
                <p className="text-[10px] text-slate-400">Lock attendance marking outside school grounds</p>
              </div>
              <input 
                type="checkbox" 
                name="gpsVerificationEnabled"
                checked={form.gpsVerificationEnabled}
                onChange={handleChange}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Campus Latitude</label>
                <input 
                  type="number" 
                  step="0.000001"
                  name="campusLatitude"
                  value={form.campusLatitude}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Campus Longitude</label>
                <input 
                  type="number" 
                  step="0.000001"
                  name="campusLongitude"
                  value={form.campusLongitude}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Allowed Radius (Metres)</label>
                <input 
                  type="number" 
                  name="allowedRadiusMetres"
                  value={form.allowedRadiusMetres}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: SMS/WhatsApp Notifications */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-premium space-y-4 lg:col-span-2">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <MessageSquare size={18} className="text-amber-500" />
            Parent Alert System Templates
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* SMS Gateways */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Enable SMS Alerts</h4>
                  <p className="text-[10px] text-slate-400">Send text alert on student absence</p>
                </div>
                <input 
                  type="checkbox" 
                  name="smsEnabled"
                  checked={form.smsEnabled}
                  onChange={handleChange}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">SMS Gateway Provider</label>
                <select 
                  name="smsProvider"
                  value={form.smsProvider}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-primary"
                >
                  <option value="msg91">MSG91 (India Premium)</option>
                  <option value="twilio">Twilio SMS Gateway</option>
                  <option value="fast2sms">Fast2SMS (Local Gateway)</option>
                  <option value="textlocal">Textlocal API</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">SMS Template Body</label>
                <textarea 
                  name="smsTemplate"
                  value={form.smsTemplate}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 font-mono focus:ring-1 focus:ring-primary"
                />
                <p className="text-[10px] text-slate-400 mt-1">Available tokens: {"{studentName}"}, {"{className}"}, {"{status}"}, {"{date}"}, {"{schoolName}"}</p>
              </div>
            </div>

            {/* WhatsApp Gateways */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Enable WhatsApp Alerts</h4>
                  <p className="text-[10px] text-slate-400">Deliver messages directly to parent WhatsApp</p>
                </div>
                <input 
                  type="checkbox" 
                  name="whatsappEnabled"
                  checked={form.whatsappEnabled}
                  onChange={handleChange}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">WhatsApp Service API</label>
                <select 
                  name="whatsappProvider"
                  value={form.whatsappProvider}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-primary"
                >
                  <option value="meta">Meta Cloud API (Official)</option>
                  <option value="twilio">Twilio WhatsApp sandbox</option>
                  <option value="gupshup">Gupshup Messaging Gateway</option>
                  <option value="wati">WATI Client API</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">WhatsApp Template Body</label>
                <textarea 
                  name="whatsappTemplate"
                  value={form.whatsappTemplate}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 font-mono focus:ring-1 focus:ring-primary"
                />
                <p className="text-[10px] text-slate-400 mt-1">Available tokens: {"{studentName}"}, {"{className}"}, {"{status}"}, {"{date}"}, {"{schoolName}"}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Database backup */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-premium lg:col-span-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
              <Download size={16} className="text-indigo-500" />
              Backup & Database Utility
            </h4>
            <p className="text-xs text-slate-400">Download a full JSON database dump containing attendance audits, settings, and student logs.</p>
          </div>
          
          <button 
            type="button"
            onClick={handleBackup}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-all w-fit btn-tap-effect"
          >
            <Download size={14} />
            Export System JSON
          </button>
        </div>

        {/* Submit Actions */}
        <div className="lg:col-span-2 flex justify-end">
          <button 
            type="submit"
            className="px-6 py-3 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-hover flex items-center gap-2 shadow-lg shadow-primary/10 transition-all btn-tap-effect"
          >
            <Save size={18} />
            Save Institutional Config
          </button>
        </div>

        {/* Account Session & Logout */}
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-2xl p-6 lg:col-span-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h4 className="font-bold text-rose-800 dark:text-rose-300 text-sm flex items-center gap-2">
              <LogOut size={18} className="text-rose-600 dark:text-rose-400" />
              Account Session Management
            </h4>
            <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-0.5">
              Sign out from SVV ERP portal and return to the login screen.
            </p>
          </div>
          
          <button 
            type="button"
            onClick={handleLogout}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-rose-600/20 transition-all w-fit btn-tap-effect"
          >
            <LogOut size={16} />
            Sign Out / Log Out
          </button>
        </div>

      </form>
    </div>
  );
};
export default Settings;
