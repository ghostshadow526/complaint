import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthPage } from './components/AuthPage';
import { ClaimantDashboard } from './components/ClaimantDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { HomePage } from './components/HomePage';
import { User } from './types';
import { getCurrentUser, setCurrentUser, initializeStorage } from './lib/storage';
import { Landmark } from 'lucide-react';

export default function App() {
  const [currentUser, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<'home' | 'claimant' | 'admin' | 'auth-claimant' | 'auth-admin'>('home');

  useEffect(() => {
    // Seed and prepare local storage asynchronously
    initializeStorage();
    
    // Check if there is an existing session immediately
    const savedUser = getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
      setActiveView(savedUser.role);
    }
  }, []);

  const handleAuthSuccess = (user: User) => {
    setUser(user);
    setCurrentUser(user);
    setActiveView(user.role);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentUser(null);
    setActiveView('home');
  };

  const handleToggleRole = () => {
    if (activeView === 'auth-claimant') {
      setActiveView('auth-admin');
    } else {
      setActiveView('auth-claimant');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Dynamic Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchToAdminLogin={() => setActiveView('auth-admin')}
        onSwitchToClaimantLogin={() => setActiveView('auth-claimant')}
        onGoHome={() => setActiveView('home')}
        onGoDashboard={() => currentUser && setActiveView(currentUser.role)}
        activeView={activeView}
      />

      {/* Main Structural Render */}
      <main className="flex-1">
        {activeView === 'home' ? (
          <HomePage
            onGetStarted={(role) => setActiveView(role === 'admin' ? 'auth-admin' : 'auth-claimant')}
            onExploreClaims={() => setActiveView('auth-claimant')}
          />
        ) : currentUser ? (
          activeView === 'admin' ? (
            <AdminDashboard currentUser={currentUser} />
          ) : (
            <ClaimantDashboard currentUser={currentUser} />
          )
        ) : (
          <AuthPage
            isAdmin={activeView === 'auth-admin'}
            onAuthSuccess={handleAuthSuccess}
            onToggleRole={handleToggleRole}
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-slate-200/60 bg-white py-6 select-none mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-indigo-600/80">
            <Landmark className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              MUFTASEER COMPLAINT HUB // Municipal Systems
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-2">
            SECURE SHA256 // OFFICIAL COMMISSIONER DEPLOYMENT // ALL INCIDENTS LOGGED & DISPATCHED
          </p>
        </div>
      </footer>
    </div>
  );
}
