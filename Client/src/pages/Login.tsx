import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, Lock, AlertCircle, Code, ShieldCheck, Info } from 'lucide-react';
import type { UserRole } from '../types';

import { useToast } from '../context/ToastContext';

export const Login: React.FC = () => {
  const { login, register, error, isLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const [showDevModal, setShowDevModal] = useState<boolean>(false);

  // Login form state
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Developer Register form state
  const [devKey, setDevKey] = useState<string>('');
  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regEmail] = useState<string>('');
  const [regRole] = useState<UserRole>('admin');

  const [validationError, setValidationError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!phone || !password) {
      const msg = 'Please enter both mobile number and password.';
      setValidationError(msg);
      showError(msg);
      return;
    }
    if (phone.length < 10) {
      const msg = 'Mobile number must be at least 10 digits.';
      setValidationError(msg);
      showError(msg);
      return;
    }

    const success = await login(phone, password);
    if (success) {
      showSuccess('Logged in successfully', 'Welcome!');
      navigate('/dashboard');
    } else {
      showError(error || 'Invalid mobile number or password.');
    }
  };


  const handleDevRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!devKey) {
      setValidationError('Developer Security Key is required.');
      return;
    }
    if (devKey !== 'DEV2026') {
      setValidationError('Invalid Developer Security Key.');
      return;
    }
    if (!regName || !regPhone || !regPassword) {
      setValidationError('Name, Phone, and Password are required.');
      return;
    }

    const success = await register({
      name: regName,
      phone: regPhone,
      password: regPassword,
      role: regRole,
      email: regEmail,
      developerKey: devKey
    } as any);

    if (success) {
      setShowDevModal(false);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 md:p-6 transition-colors duration-200">
      {/* Background decoration elements */}
      <div className="absolute top-10 left-10 w-44 h-44 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-premium z-10 relative">
        
        {/* School Logo & Branding */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center p-1.5 shadow-md mb-2 border border-slate-100 dark:border-slate-700">
            <img src="/logo.png" alt="Savitri Vidya Vihar logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Savitri Vidya Vihar
          </h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-widest font-bold">
            School Management System
          </p>
        </div>

        {/* Info Banner for Students & Teachers */}
        <div className="p-3 mb-5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs border border-blue-100 dark:border-blue-900/40 flex items-start gap-2.5">
          <Info size={18} className="shrink-0 mt-0.5 text-blue-500" />
          <span>
            <strong>Need login details?</strong> Student & Teacher accounts are registered manually by the Administrator. Please contact school administration for your Mobile Number & Password.
          </span>
        </div>

        {/* Form Errors */}
        {(error || validationError) && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs border border-rose-100 dark:border-rose-900/30 flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{validationError || error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5 tracking-wider">
              Mobile Number (Username)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                <Phone size={18} />
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 10-digit mobile number"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-semibold"
                maxLength={10}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <a href="#" onClick={(e) => { e.preventDefault(); alert("Password recovery is managed by school administrators. Default passwords: 'student123' for students, 'teacher123' for teachers."); }} className="text-xs text-primary dark:text-blue-400 hover:underline">
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                <Lock size={18} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-semibold"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all shadow-md shadow-primary/20 flex items-center justify-center btn-tap-effect disabled:opacity-75"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Developer / Admin Option */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={() => { setShowDevModal(true); setValidationError(null); }}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <Code size={14} />
            <span>Developer / Master Admin Registration</span>
          </button>
        </div>

      </div>

      {/* Developer Registration Modal */}
      {showDevModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-premium animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-primary" size={20} />
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  Developer / Admin Registration
                </h3>
              </div>
              <button
                onClick={() => setShowDevModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDevRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Developer Key * (DEV2026)
                </label>
                <input
                  type="password"
                  value={devKey}
                  onChange={(e) => setDevKey(e.target.value)}
                  placeholder="Enter security key (DEV2026)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Developer / Admin Name"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Mobile Number (Login ID) *
                </label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Secret password"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDevModal(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-primary-hover"
                >
                  Create Admin Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
