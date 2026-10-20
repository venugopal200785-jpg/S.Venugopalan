import React, { useState } from 'react';
import { 
  Heart, 
  Droplet, 
  Search, 
  UserPlus, 
  Building2, 
  ShieldCheck, 
  GitCompare, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  Sparkles,
  Users,
  Code2
} from 'lucide-react';
import { BloodGroup } from '../types/blood-donation';
import { ALL_BLOOD_GROUPS, getCompatibleDonorGroups, getBloodGroupFacts } from '../utils/compatibility';
import { dbService } from '../services/storage';

interface HomeViewProps {
  onOpenLogin: () => void;
  onOpenSignUp: () => void;
  onNavigateTab: (tab: any) => void;
  onQuickFindDonors: (group: BloodGroup) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenLogin,
  onOpenSignUp,
  onNavigateTab,
  onQuickFindDonors
}) => {
  const [heroBloodGroup, setHeroBloodGroup] = useState<BloodGroup>('O+');

  const donors = dbService.getDonors();
  const eligibleCount = donors.filter(d => d.eligible === 'YES' && d.recent_illness === 'NO').length;
  const requests = dbService.getBloodRequests();
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  const compatibleList = getCompatibleDonorGroups(heroBloodGroup);
  const facts = getBloodGroupFacts(heroBloodGroup);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-red-50/80 via-white to-white pt-12 pb-16 border-b border-red-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content matching index.jsp */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100/80 border border-red-200 text-red-800 text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <span>Connecting Donors & Hospitals in Real Time</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Blood Donation &amp; <br />
                <span className="bg-gradient-to-r from-red-700 via-rose-600 to-red-800 bg-clip-text text-transparent">
                  Compatibility System
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Connecting voluntary blood donors with hospitals and critical patients when blood is required. Built on exact medical compatibility criteria and strict donor eligibility screening.
              </p>

              {/* Action Buttons matching index.jsp */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onOpenSignUp}
                  className="px-6 py-3.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-sm shadow-md shadow-red-200 transition-all flex items-center gap-2 transform active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Donor Registration</span>
                </button>

                <button
                  onClick={onOpenLogin}
                  className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-xs transition-all flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 text-red-600" />
                  <span>Donor Login</span>
                </button>

                <button
                  onClick={onOpenLogin}
                  className="px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition-all flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>Hospital Portal</span>
                </button>
              </div>

              {/* Security & Authentication Guarantee */}
              <div className="flex items-center gap-4 pt-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>PBKDF2 Salted Auth</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-red-600" />
                  <span>Java Servlets + MySQL Architecture</span>
                </div>
              </div>
            </div>

            {/* Right Card: Quick Compatibility Matcher */}
            <div className="lg:col-span-5">
              <div className="relative bg-white rounded-3xl p-6 sm:p-8 border border-red-100 shadow-xl shadow-red-500/5 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                      Interactive Compatibility Matcher
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      Who can donate to whom?
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center">
                    <Droplet className="w-5 h-5 fill-red-600 text-red-600" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Select Patient / Recipient Blood Group:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {ALL_BLOOD_GROUPS.map(bg => (
                      <button
                        key={bg}
                        onClick={() => setHeroBloodGroup(bg)}
                        className={`py-2 rounded-xl font-black text-xs transition-all ${
                          heroBloodGroup === bg
                            ? 'bg-red-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-red-50/70 border border-red-100 space-y-2">
                  <span className="text-xs font-bold text-red-900 block">
                    Compatible donors for <span className="text-base text-red-700 font-black">{heroBloodGroup}</span>:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {compatibleList.map(grp => (
                      <span
                        key={grp}
                        className="px-2.5 py-1 rounded-lg bg-red-700 text-white font-extrabold text-xs shadow-2xs"
                      >
                        {grp}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1">
                    {facts.description}
                  </p>
                </div>

                <button
                  onClick={() => onQuickFindDonors(heroBloodGroup)}
                  className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs shadow-red-200 flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Matching Donors for {heroBloodGroup}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live System Metrics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">{donors.length}</div>
              <div className="text-xs text-slate-500 font-semibold">Registered Donors</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700">{eligibleCount}</div>
              <div className="text-xs text-slate-500 font-semibold">Verified Eligible Ready</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-blue-700">3</div>
              <div className="text-xs text-slate-500 font-semibold">Connected Hospitals</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-amber-600">{pendingCount}</div>
              <div className="text-xs text-slate-500 font-semibold">Active Blood Needs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-red-700">
            Automated Lifecycle
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            How the System Saves Lives
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Seamless flow between donor registration, hospital requests, and automated compatibility matching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 relative">
            <span className="w-8 h-8 rounded-xl bg-red-100 text-red-700 font-black text-sm flex items-center justify-center">
              1
            </span>
            <h3 className="font-bold text-slate-900 text-base">Donor Registration</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Donors register with blood group, city, and health screening (<code className="text-red-700">eligible=YES</code>, <code className="text-red-700">recent_illness=NO</code>).
            </p>
            <span className="text-[10px] font-mono text-slate-400 block pt-2">
              DonorRegistrationServlet.java
            </span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 relative">
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center">
              2
            </span>
            <h3 className="font-bold text-slate-900 text-base">Hospital Blood Request</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              When a recipient needs blood, the medical center logs recipient ID, units, and blood type with status PENDING.
            </p>
            <span className="text-[10px] font-mono text-slate-400 block pt-2">
              BloodRequestServlet.java
            </span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 relative">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 font-black text-sm flex items-center justify-center">
              3
            </span>
            <h3 className="font-bold text-slate-900 text-base">Compatibility Match</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              System calculates compatible blood groups and queries all eligible donors sorted by city and name.
            </p>
            <span className="text-[10px] font-mono text-slate-400 block pt-2">
              DonorSearchServlet.java
            </span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 relative">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-black text-sm flex items-center justify-center">
              4
            </span>
            <h3 className="font-bold text-slate-900 text-base">Direct Transfusion</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hospital instantly contacts matching donors via phone or email, and request status changes to FULFILLED.
            </p>
            <span className="text-[10px] font-mono text-slate-400 block pt-2">
              PreparedStatement Update
            </span>
          </div>
        </div>
      </section>

      {/* Urgent Requests Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-900 via-rose-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-red-600/30 text-red-200 text-xs font-bold uppercase tracking-wider">
              Urgent Patient Needs
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Every Drop Counts. Are You Ready to Save a Life?
            </h2>
            <p className="text-sm text-red-100/80 leading-relaxed">
              Registering as a voluntary blood donor takes less than 2 minutes and keeps you on standby for emergency hospital requests in your area.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={onOpenSignUp}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg transition-colors"
            >
              Register as Donor
            </button>
            <button
              onClick={() => onNavigateTab('requests')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/20 transition-colors"
            >
              View Active Requests
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
