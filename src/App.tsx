import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { FindDonorsView } from './components/FindDonorsView';
import { BloodRequestsView } from './components/BloodRequestsView';
import { CompatibilityMatrixView } from './components/CompatibilityMatrixView';
import { DonorDashboardView } from './components/DonorDashboardView';
import { HospitalDashboardView } from './components/HospitalDashboardView';
import { CodeInspectorView } from './components/CodeInspectorView';
import { ClassicJspView } from './components/ClassicJspView';
import { AuthModal } from './components/AuthModal';
import { authService, AuthUser } from './services/auth';
import { dbService } from './services/storage';
import { BloodGroup } from './types/blood-donation';
import { Droplet, Heart, Code2, ShieldCheck, Github } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'find-donors' | 'requests' | 'compatibility' | 'donor-dashboard' | 'hospital-dashboard' | 'code-inspector'>('home');
  const [uiMode, setUiMode] = useState<'modern' | 'classic_jsp'>(() => dbService.getUiMode());

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    // Check existing auth session
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleUiModeChange = (mode: 'modern' | 'classic_jsp') => {
    setUiMode(mode);
    dbService.setUiMode(mode);
  };

  const handleOpenLogin = () => {
    setAuthModalInitialTab('login');
    setAuthModalOpen(true);
  };

  const handleOpenSignUp = () => {
    setAuthModalInitialTab('signup');
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setActiveTab('home');
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    if (user.role === 'donor') {
      setActiveTab('donor-dashboard');
    } else {
      setActiveTab('hospital-dashboard');
    }
  };

  const handleQuickFindDonors = (group: BloodGroup) => {
    setActiveTab('find-donors');
  };

  // Render Classic JSP mode if chosen by user
  if (uiMode === 'classic_jsp') {
    return <ClassicJspView onSwitchToModern={() => handleUiModeChange('modern')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans selection:bg-red-100 selection:text-red-900">
      {/* Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={handleOpenLogin}
        onOpenSignUp={handleOpenSignUp}
        onLogout={handleLogout}
        uiMode={uiMode}
        setUiMode={handleUiModeChange}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            onOpenLogin={handleOpenLogin}
            onOpenSignUp={handleOpenSignUp}
            onNavigateTab={setActiveTab}
            onQuickFindDonors={handleQuickFindDonors}
          />
        )}

        {activeTab === 'find-donors' && (
          <FindDonorsView
            onRequestBloodForGroup={() => {
              if (currentUser?.role === 'hospital') {
                setActiveTab('hospital-dashboard');
              } else {
                setActiveTab('requests');
              }
            }}
          />
        )}

        {activeTab === 'requests' && (
          <BloodRequestsView
            onOpenCreateRequest={() => {
              if (currentUser?.role === 'hospital') {
                setActiveTab('hospital-dashboard');
              } else {
                handleOpenLogin();
              }
            }}
          />
        )}

        {activeTab === 'compatibility' && <CompatibilityMatrixView />}

        {activeTab === 'donor-dashboard' && (
          <DonorDashboardView
            currentUser={currentUser}
            onLogout={handleLogout}
            onSwitchTab={setActiveTab}
          />
        )}

        {activeTab === 'hospital-dashboard' && (
          <HospitalDashboardView
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        )}

        {activeTab === 'code-inspector' && <CodeInspectorView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-12 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-700 text-white flex items-center justify-center">
                <Droplet className="w-5 h-5 fill-white text-white" />
              </div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight">RaktaSetu</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Blood Donation & Compatibility System uniting donors, patients, and hospitals with verified compatibility matching.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">System Views</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('find-donors')} className="hover:text-red-700 transition-colors">
                  Find Compatible Donors
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('compatibility')} className="hover:text-red-700 transition-colors">
                  Blood Compatibility Matrix
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('requests')} className="hover:text-red-700 transition-colors">
                  Active Patient Requests
                </button>
              </li>
              <li>
                <button onClick={() => handleUiModeChange('classic_jsp')} className="hover:text-red-700 transition-colors text-amber-700 font-semibold">
                  Classic JSP & CSS Retro View
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Java Servlets & DB</h4>
            <ul className="space-y-2 font-mono text-[11px] text-slate-500">
              <li>DonorRegistrationServlet.java</li>
              <li>DonorLoginServlet.java</li>
              <li>HospitalLoginServlet.java</li>
              <li>DonorSearchServlet.java</li>
              <li>BloodRequestServlet.java</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Security & Architecture</h4>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>PBKDF2-SHA256 Auth</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Cryptographically salted passwords, parameterized queries, and strict eligibility validation.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
          <div>
            &copy; 2026 Blood Donation & Compatibility System. All medical compatibility rules validated.
          </div>
          <button
            onClick={() => setActiveTab('code-inspector')}
            className="flex items-center gap-1 text-slate-600 hover:text-red-700 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Inspect Java & SQL Database Console</span>
          </button>
        </div>
      </footer>

      {/* Authentication Modal (Sign Up, Login, Password Hashing) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalInitialTab}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
