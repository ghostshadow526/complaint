import React, { useState } from 'react';
import { Shield, User, Lock, Mail, ChevronRight, CheckCircle2, Info, ArrowLeft, HeartHandshake } from 'lucide-react';
import { registerUser, loginUser } from '../lib/storage';
import { User as UserType } from '../types';

interface AuthPageProps {
  isAdmin: boolean;
  onAuthSuccess: (user: UserType) => void;
  onToggleRole: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  isAdmin,
  onAuthSuccess,
  onToggleRole,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    if (isSignUp && !name) {
      setError('Please provide your full name.');
      return;
    }

    try {
      if (isAdmin) {
        // Admin Login with password verification for muftee@gmail.com
        if (email.toLowerCase() === 'muftee@gmail.com' && password !== 'Okayadmin421!$') {
          setError('Invalid password for administrative account muftee@gmail.com.');
          return;
        }
        const user = await loginUser(email, 'admin');
        onAuthSuccess(user);
      } else {
        if (isSignUp) {
          // Claimant Registration
          const user = await registerUser(name, email, 'claimant');
          setSuccessMsg('Account created successfully! You can now log in.');
          setIsSignUp(false);
          // Auto-fill login
          setEmail(email);
          setPassword('');
        } else {
          // Claimant Login
          const user = await loginUser(email, 'claimant');
          onAuthSuccess(user);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleShortcutLogin = async (role: 'claimant' | 'admin') => {
    setError('');
    setSuccessMsg('');
    try {
      if (role === 'admin') {
        const user = await loginUser('admin@city.gov', 'admin');
        onAuthSuccess(user);
      } else {
        const user = await loginUser('citizen@example.com', 'claimant');
        onAuthSuccess(user);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row bg-[#fcfbf9]">
      
      {/* Visual Context Panel */}
      <div className="flex flex-col justify-between bg-[#0c231f] p-8 text-white lg:w-[42%] lg:p-12 xl:p-16 relative overflow-hidden select-none border-r border-emerald-950">
        {/* Subtle decorative grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
        <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-emerald-600/10 blur-3xl" />
        
        {/* Header Branding */}
        <div className="relative flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 shadow-md">
            <HeartHandshake className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-white">CivicPulse Infrastructure</span>
        </div>

        {/* Dynamic Context Description */}
        <div className="relative my-12 max-w-md lg:my-0">
          <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-sm border border-emerald-400/20">
            {isAdmin ? 'District Administration Terminal' : 'Citizen Engagement Panel'}
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            {isAdmin 
              ? 'Oversee municipal resolutions.' 
              : 'Report issues. Track structural resolution.'}
          </h2>
          <p className="mt-4 text-sm text-stone-300 leading-relaxed">
            {isAdmin 
              ? 'Access the secure command dashboard to inspect citizen-reported infrastructure failures, coordinate dispatch teams, and mark verified resolutions in real-time.' 
              : 'Directly report structural failures such as highway potholes, hospital facility damages, and compromised utilities directly to the municipal commissioner office.'}
          </p>

          {/* Dynamic Checklist features */}
          <div className="mt-8 space-y-3.5">
            {[
              isAdmin ? 'Centralized infrastructure claim log' : 'Instant tracking ticket creation',
              isAdmin ? 'Interactive statistics & severity charts' : 'Real-time timeline resolution tracking',
              isAdmin ? 'Verify & publish resolution logs' : 'Direct feedback connection to city hall'
            ].map((text, idx) => (
              <div key={idx} className="flex items-start space-x-3 text-stone-200">
                <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 text-emerald-400 flex-shrink-0" />
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="relative text-xs text-emerald-300 font-mono">
          SYSTEM TIMESTAMP // 2026-07-16
        </div>
      </div>

      {/* Main Action Form Panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          
          {/* Form Header */}
          <div className="text-center">
            <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform hover:rotate-3 bg-emerald-50 text-emerald-700 border border-emerald-100`}>
              {isAdmin ? <Shield className="h-7 w-7" /> : <User className="h-7 w-7" />}
            </div>
            
            <h3 className="mt-6 text-2xl font-bold tracking-tight text-stone-900">
              {isAdmin 
                ? 'Admin Security Login' 
                : isSignUp ? 'Citizen Portal Signup' : 'Citizen Portal Login'}
            </h3>
            <p className="mt-2 text-sm text-stone-500">
              {isAdmin 
                ? 'Authorized municipal personnel credentials only' 
                : isSignUp ? 'Create an account to report public infrastructure issues' : 'Log in to view or file reported civic complaints'}
            </p>
          </div>

          {/* Notifications */}
          {error && (
            <div className="flex items-start space-x-3 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-medium text-rose-700">
              <Info className="h-4.5 w-4.5 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start space-x-3 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Main Credentials Form */}
          <form className="mt-8 space-y-5" onSubmit={handleAuth}>
            
            {isSignUp && !isAdmin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-4 w-4 text-stone-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Chidi Okafor"
                    className="block w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                {isAdmin ? 'District Officer Email' : 'Email Address'}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-stone-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAdmin ? 'admin@city.gov' : 'citizen@example.com'}
                  className={`block w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-1 transition-colors ${
                    isAdmin ? 'focus:border-rose-500 focus:ring-rose-500' : 'focus:border-emerald-500 focus:ring-emerald-500'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Password / Secure Code
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-stone-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`block w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-1 transition-colors ${
                    isAdmin ? 'focus:border-rose-500 focus:ring-rose-500' : 'focus:border-emerald-500 focus:ring-emerald-500'
                  }`}
                />
              </div>
            </div>

            {/* Login / Action Button */}
            <button
              type="submit"
              className={`group flex w-full items-center justify-center rounded-xl py-3 px-4 text-sm font-semibold shadow-md transition-all backdrop-blur-md border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isAdmin 
                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 border-rose-500/30 focus:ring-rose-500' 
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 border-emerald-500/30 focus:ring-emerald-500'
              }`}
            >
              <span>
                {isAdmin 
                  ? 'Access Admin Command' 
                  : isSignUp ? 'Complete Registration' : 'Secure Citizen Login'}
              </span>
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Toggle Citizen Login/Signup & Toggle Admin / Citizen Panel */}
          <div className="mt-6 flex flex-col space-y-4 text-center text-xs">
            {!isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="font-bold text-emerald-750 hover:text-emerald-800 transition-colors cursor-pointer"
              >
                {isSignUp ? 'Already have a citizen account? Log in' : "Don't have a citizen account? Sign up now"}
              </button>
            )}

            <div className="flex items-center justify-center space-x-1 text-slate-400">
              <span className="h-px w-8 bg-slate-200" />
              <span>Or</span>
              <span className="h-px w-8 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={onToggleRole}
              className="inline-flex items-center justify-center self-center rounded-xl border px-4 py-2 font-bold transition-all backdrop-blur-sm border-emerald-500/20 bg-emerald-500/5 text-emerald-700 hover:bg-emerald-500/15 cursor-pointer shadow-xs"
            >
              {isAdmin ? (
                <>
                  <User className="mr-1.5 h-3.5 w-3.5" />
                  Switch to Citizen Sign In
                </>
              ) : (
                <>
                  <Shield className="mr-1.5 h-3.5 w-3.5" />
                  Access Admin Terminal
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
