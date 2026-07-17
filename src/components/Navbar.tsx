import React from 'react';
import { User } from '../types';
import { Shield, User as UserIcon, LogOut, Landmark, Activity } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onSwitchToAdminLogin?: () => void;
  onSwitchToClaimantLogin?: () => void;
  onGoHome?: () => void;
  onGoDashboard?: () => void;
  activeView: 'home' | 'claimant' | 'admin' | 'auth-claimant' | 'auth-admin';
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onSwitchToAdminLogin,
  onSwitchToClaimantLogin,
  onGoHome,
  onGoDashboard,
  activeView,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <button 
          onClick={onGoHome}
          className="flex items-center space-x-3 select-none text-left cursor-pointer focus:outline-none group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm transition-transform group-hover:scale-105">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 leading-none uppercase">
              MUFTASEER
            </h1>
            <p className="text-[9px] font-bold tracking-wider uppercase text-emerald-600 leading-none mt-1">
              NAIJA COMPLAINT HUB
            </p>
          </div>
        </button>

        {/* Action Controls / Profile */}
        <div className="flex items-center space-x-4">
          {/* Home Link if not currently showing Home */}
          {activeView !== 'home' && onGoHome && (
            <button
              onClick={onGoHome}
              className="text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer px-2 py-1"
            >
              Home Page
            </button>
          )}

          {/* Dashboard Link if logged in but currently viewing Home */}
          {currentUser && activeView === 'home' && onGoDashboard && (
            <button
              onClick={onGoDashboard}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer px-2 py-1"
            >
              Go to Portal
            </button>
          )}
          {currentUser ? (
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="hidden flex-col items-end text-right sm:flex">
                <span className="text-xs font-semibold text-slate-900">
                  {currentUser.name}
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-100">
                  {currentUser.role === 'admin' ? (
                    <>
                      <Shield className="mr-1 h-2.5 w-2.5 text-emerald-600" />
                      Chief Officer
                    </>
                  ) : (
                    <>
                      <UserIcon className="mr-1 h-2.5 w-2.5 text-emerald-600" />
                      Verified Citizen
                    </>
                  )}
                </span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-sm shadow-sm">
                {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'US'}
              </div>
              
              <button
                onClick={onLogout}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-rose-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer"
                title="Sign out of portal"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {(activeView === 'home' || activeView === 'auth-admin') && onSwitchToClaimantLogin && (
                <button
                  onClick={onSwitchToClaimantLogin}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer"
                >
                  <UserIcon className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                  Citizen Portal
                </button>
              )}
              {(activeView === 'home' || activeView === 'auth-claimant') && onSwitchToAdminLogin && (
                <button
                  onClick={onSwitchToAdminLogin}
                  className="inline-flex items-center justify-center rounded-xl border border-emerald-200/60 bg-emerald-50/50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100/70 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer"
                >
                  <Shield className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                  Admin Terminal
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
