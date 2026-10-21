import React, { useState } from 'react';
import { Mail, Lock, Shield, Sparkles } from 'lucide-react';
import { ClayButton } from '../components/ClayButton';
import { authService } from '../services/authService';
import { ReadingBuddy } from '../types';

interface LoginScreenProps {
  buddy: ReadingBuddy;
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  buddy,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('parent@example.com');
  const [password, setPassword] = useState('ReadWise123!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid guardian email.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const result = await authService.login(email, password);
    setIsLoading(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setErrorMessage(result.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleRegister = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid guardian email.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const result = await authService.register(email, password);
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage('Account created successfully! Welcome to ReadWise AI.');
      setTimeout(() => {
        onLoginSuccess();
      }, 700);
    } else {
      setErrorMessage(result.message || 'Registration could not be completed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border-2 border-slate-200/80 p-6 sm:p-8 shadow-xl">
        {/* Top Icon Badge */}
        <div className="flex justify-center mb-4">
          <div
            style={{
              backgroundColor: buddy.themeSurface,
              borderColor: buddy.themePrimary,
            }}
            className="w-18 h-18 rounded-full border-2 flex items-center justify-center shadow-md text-3xl"
          >
            🌟
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-center text-[#1E1B4B]">
          Parent Sign In
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-center text-slate-600 font-medium">
          Log in or register your guardian account to securely manage child profiles and screening assessments.
        </p>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1E1B4B] mb-1.5">
              Guardian Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-[#1E1B4B] placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1B4B] mb-1.5">
              Secret Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-[#1E1B4B] placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <ClayButton
              text={isLoading ? 'Signing In...' : 'Login'}
              disabled={isLoading}
              color={buddy.themePrimary}
              shadowColor={buddy.themeShadow}
              isExpanded={true}
              onClick={() => handleLogin({ preventDefault: () => {} } as any)}
            />

            <ClayButton
              text="Create Account"
              disabled={isLoading}
              color="#FFFFFF"
              shadowColor="#CBD5E1"
              textColor="#1E1B4B"
              depth={3}
              isExpanded={true}
              onClick={handleRegister}
            />
          </div>
        </form>

        {/* Demo Fast Login Hint */}
        <div className="mt-4 p-2.5 rounded-2xl bg-sky-50 border border-sky-100 text-[11px] text-sky-800 font-semibold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Demo ready: parent@example.com
          </span>
          <button
            type="button"
            onClick={() => {
              setEmail('parent@example.com');
              setPassword('ReadWise123!');
            }}
            className="text-[10px] uppercase font-black tracking-wider text-sky-700 underline"
          >
            Auto-fill
          </button>
        </div>

        {/* Privacy disclaimer banner */}
        <div className="mt-5 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-amber-700 shrink-0" />
          <p className="text-[11px] font-bold text-amber-900 leading-tight">
            Child data privacy protected. Screenings are non-diagnostic educational estimates.
          </p>
        </div>
      </div>
    </div>
  );
};
