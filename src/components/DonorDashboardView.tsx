import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Droplet, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  AlertCircle, 
  CheckCircle2, 
  QrCode, 
  Award, 
  Send,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  LogOut
} from 'lucide-react';
import { Donor, BloodRequest } from '../types/blood-donation';
import { dbService } from '../services/storage';
import { AuthUser } from '../services/auth';
import { getCanDonateToGroups, getCompatibleDonorGroups, getBloodGroupFacts } from '../utils/compatibility';
import confetti from 'canvas-confetti';

interface DonorDashboardViewProps {
  currentUser: AuthUser | null;
  onLogout: () => void;
  onSwitchTab?: (tab: any) => void;
}

export const DonorDashboardView: React.FC<DonorDashboardViewProps> = ({
  currentUser,
  onLogout,
  onSwitchTab
}) => {
  const [donor, setDonor] = useState<Donor | null>(null);
  const [eligible, setEligible] = useState<'YES' | 'NO'>('YES');
  const [recentIllness, setRecentIllness] = useState<'YES' | 'NO'>('NO');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [pledgedRequests, setPledgedRequests] = useState<number[]>([]);

  useEffect(() => {
    const donors = dbService.getDonors();
    let currentDonor = dbService.getActiveDonor();

    if (!currentDonor && currentUser) {
      if (currentUser.donorId) {
        currentDonor = donors.find(d => d.donor_id === currentUser.donorId) || null;
      } else {
        currentDonor = donors.find(d => d.email.toLowerCase() === currentUser.email.toLowerCase()) || null;
      }
    }

    if (!currentDonor && donors.length > 0) {
      currentDonor = donors[0]; // fallback demo
    }

    if (currentDonor) {
      setDonor(currentDonor);
      setEligible(currentDonor.eligible);
      setRecentIllness(currentDonor.recent_illness);
    }
  }, [currentUser]);

  const handleUpdateStatus = (newEligible: 'YES' | 'NO', newIllness: 'YES' | 'NO') => {
    if (!donor) return;
    setEligible(newEligible);
    setRecentIllness(newIllness);

    dbService.updateDonorStatus(donor.donor_id, newEligible, newIllness);
    setDonor({
      ...donor,
      eligible: newEligible,
      recent_illness: newIllness
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handlePledge = (requestId: number) => {
    setPledgedRequests(prev => [...prev, requestId]);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
  };

  if (!donor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-8 bg-white rounded-2xl border border-slate-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800">Donor session not found</h2>
          <p className="text-sm text-slate-500 mt-1 mb-4">Please log in to view your donor dashboard.</p>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-700 text-white rounded-xl text-sm font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const bloodFacts = getBloodGroupFacts(donor.blood_group);
  const canGiveTo = getCanDonateToGroups(donor.blood_group);
  const canReceiveFrom = getCompatibleDonorGroups(donor.blood_group);

  // Matching urgent requests
  const requests = dbService.getBloodRequests().filter(
    r => r.status === 'PENDING' && canGiveTo.includes(r.required_blood_group)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Welcome Banner matching donor-dashboard.jsp */}
      <div className="bg-gradient-to-r from-red-700 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs mb-3">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Verified Blood Donor • ID #{donor.donor_id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {donor.name}!
          </h1>
          <p className="mt-1 text-sm sm:text-base text-red-100 max-w-xl">
            Thank you for being a blood donor. Your generosity directly saves lives. When hospitals search for compatible donors, your profile enables rapid matching.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold backdrop-blur-xs border border-white/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Donor status successfully updated in database! Hospital searches will now reflect this change.</span>
        </div>
      )}

      {/* Grid: Digital Donor Card & Eligibility Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Digital Blood Donor Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white p-6 shadow-xl border border-red-900/50 flex flex-col justify-between min-h-[300px]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-red-300">
                Official Blood Donor ID
              </span>
              <h3 className="text-xl font-extrabold mt-0.5">{donor.name}</h3>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>{donor.city}</span>
                <span className="mx-1">•</span>
                <span>Age: {donor.age}</span>
              </p>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex flex-col items-center justify-center text-white shadow-lg shadow-red-900/50">
              <span className="text-[10px] uppercase font-bold tracking-tighter">Group</span>
              <span className="text-xl font-black">{donor.blood_group}</span>
            </div>
          </div>

          {/* Middle Badge / Facts */}
          <div className="my-4 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Status in Database:</span>
              <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                donor.eligible === 'YES' && donor.recent_illness === 'NO'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {donor.eligible === 'YES' && donor.recent_illness === 'NO' ? 'ACTIVE & ELIGIBLE' : 'TEMPORARILY INACTIVE'}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Phone:</span>
              <span className="font-mono text-slate-200">{donor.phone}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Registered:</span>
              <span className="text-slate-200">{donor.registered_at || 'Verified'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-red-400 fill-red-400" />
              <span>National Blood Donor Registry</span>
            </div>
            <div className="font-mono">DONOR-{donor.donor_id.toString().padStart(5, '0')}</div>
          </div>
        </div>

        {/* Health & Medical Eligibility Switcher (Directly controls MySQL fields) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Donation Eligibility Status
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hospital queries filter donors with <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-red-600">eligible = 'YES'</code> and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-red-600">recent_illness = 'NO'</code>. Update your status anytime.
            </p>
          </div>

          <div className="space-y-4">
            {/* Eligibility toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Eligible to Donate (General)
                </span>
                <span className="text-[11px] text-slate-500">
                  Healthy weight, age, not on restricted medications
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('YES', recentIllness)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    eligible === 'YES'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  YES
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('NO', recentIllness)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    eligible === 'NO'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  NO
                </button>
              </div>
            </div>

            {/* Recent Illness toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Recent Illness in Past 14 Days?
                </span>
                <span className="text-[11px] text-slate-500">
                  Fever, infection, surgery, or cold
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(eligible, 'NO')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    recentIllness === 'NO'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  NO (Clean)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(eligible, 'YES')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    recentIllness === 'YES'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  YES (Ill)
                </button>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Changes execute live MySQL UPDATE statement.</span>
          </div>
        </div>

        {/* Compatibility breakdown for this donor */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Your Blood Compatibility
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              {bloodFacts.description}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                You can donate red cells to:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {canGiveTo.map(g => (
                  <span
                    key={g}
                    className="px-2 py-0.5 rounded-lg bg-red-100 text-red-800 font-extrabold text-xs"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                You can receive red cells from:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {canReceiveFrom.map(g => (
                  <span
                    key={g}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
            {donor.blood_group === 'O-' ? (
              <strong className="block">🌟 You are a Universal Red Blood Cell Donor!</strong>
            ) : donor.blood_group === 'AB+' ? (
              <strong className="block">👑 You are a Universal Red Blood Cell Recipient!</strong>
            ) : (
              <span>Your donations support {canGiveTo.length} patient blood types.</span>
            )}
          </div>
        </div>
      </div>

      {/* Urgent Hospital Requests Matching Donor's Blood */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600 fill-red-100" />
              <span>Urgent Blood Requests Compatible With You</span>
            </h3>
            <p className="text-xs text-slate-500">
              Patients admitted in hospitals that need your blood group ({donor.blood_group}) or compatible types:
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
            {requests.length} Active Requests
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No active urgent requests matching your blood type right now. Thank you for staying on standby!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map(req => {
              const isPledged = pledgedRequests.includes(req.request_id);
              return (
                <div
                  key={req.request_id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-red-200 bg-slate-50/50 space-y-3 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                        {req.urgency || 'Urgent'} Priority
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{req.recipient_name}</h4>
                      <p className="text-xs text-slate-500">{req.hospital_name}</p>
                    </div>

                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-lg bg-red-700 text-white font-black text-xs">
                        {req.required_blood_group}
                      </span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">
                        {req.units_required} Unit{req.units_required > 1 ? 's' : ''} Needed
                      </span>
                    </div>
                  </div>

                  {req.notes && (
                    <p className="text-xs text-slate-600 italic bg-white p-2 rounded-lg border border-slate-100">
                      "{req.notes}"
                    </p>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
                    <span className="text-slate-400 text-[11px]">Date: {req.request_date}</span>

                    {isPledged ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Pledged to Donate!
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePledge(req.request_id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold text-xs transition-colors shadow-2xs"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>I Can Donate</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
