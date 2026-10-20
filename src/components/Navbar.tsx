import React from 'react';
import { 
  Droplet, 
  User, 
  Building2, 
  Code2, 
  GitCompare, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  Database,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { AuthUser } from '../services/auth';

interface NavbarProps {
  currentUser: AuthUser | null;
  activeTab: 'home' | 'find-donors' | 'requests' | 'compatibility' | 'donor-dashboard' | 'hospital-dashboard' | 'code-inspector';
  setActiveTab: (tab: any) => void;
  onOpenLogin: () => void;
  onOpenSignUp: () => void;
  onLogout: () => void;
  uiMode: 'modern' | 'classic_jsp';
  setUiMode: (mode: 'modern' | 'classic_jsp') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenLogin,
  onOpenSignUp,
  onLogout,
  uiMode,
  setUiMode
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-red-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-700 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-200 group-hover:scale-105 transition-transform">
              <Droplet className="w-6 h-6 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">RaktaSetu</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                  Live System
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Blood Donation & Compatibility System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'home'
                  ? 'bg-red-50 text-red-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => setActiveTab('find-donors')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'find-donors'
                  ? 'bg-red-50 text-red-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Find Donors
            </button>

            <button
              onClick={() => setActiveTab('compatibility')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'compatibility'
                  ? 'bg-red-50 text-red-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <GitCompare className="w-3.5 h-3.5" />
                Compatibility Matrix
              </span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'requests'
                  ? 'bg-red-50 text-red-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Blood Requests
            </button>

            <button
              onClick={() => setActiveTab('code-inspector')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'code-inspector'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Inspect Java Servlets & MySQL DB"
            >
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-red-400" />
                Servlets & SQL
              </span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* UI Mode switcher (Modern vs Original JSP style from code) */}
            <button
              onClick={() => setUiMode(uiMode === 'modern' ? 'classic_jsp' : 'modern')}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hidden sm:flex items-center gap-1.5 transition-colors"
              title="Toggle between Modern UI and Classic JSP/CSS view from provided code"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>{uiMode === 'modern' ? 'Classic JSP Mode' : 'Modern UI Mode'}</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                {currentUser.role === 'donor' ? (
                  <button
                    onClick={() => setActiveTab('donor-dashboard')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                      activeTab === 'donor-dashboard'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="max-w-[120px] truncate">{currentUser.name}</span>
                    <span className="text-[10px] bg-red-700 text-white px-1.5 py-0.2 rounded font-bold">Donor</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('hospital-dashboard')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                      activeTab === 'hospital-dashboard'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="max-w-[120px] truncate">{currentUser.name}</span>
                    <span className="text-[10px] bg-blue-700 text-white px-1.5 py-0.2 rounded font-bold">Hospital</span>
                  </button>
                )}

                <button
                  onClick={onLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-red-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                </button>

                <button
                  onClick={onOpenSignUp}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-xs shadow-red-200 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
