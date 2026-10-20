import React, { useState } from 'react';
import { 
  GitCompare, 
  Check, 
  X, 
  HelpCircle, 
  Info, 
  Sparkles, 
  Droplet, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import { BloodGroup } from '../types/blood-donation';
import { 
  ALL_BLOOD_GROUPS, 
  isDonorCompatible, 
  getCompatibleDonorGroups, 
  getCanDonateToGroups,
  getBloodGroupFacts 
} from '../utils/compatibility';

export const CompatibilityMatrixView: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O-');

  const facts = getBloodGroupFacts(selectedGroup);
  const canGiveTo = getCanDonateToGroups(selectedGroup);
  const canReceiveFrom = getCompatibleDonorGroups(selectedGroup);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-800 to-rose-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-red-100 mb-3">
            <GitCompare className="w-3.5 h-3.5 text-red-200" />
            <span>Red Blood Cell Compatibility Science</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Blood Group Compatibility Matrix & Explorer
          </h1>
          <p className="mt-2 text-sm sm:text-base text-red-100/90 leading-relaxed">
            Understanding blood compatibility is essential for safe transfusions. Our system uses this exact matrix to automatically prevent hemolytic reactions and match patients with safe donors in real time.
          </p>
        </div>
      </div>

      {/* Interactive Explorer Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Select a Blood Group to Test Compatibility:
          </h2>
          <div className="flex flex-wrap gap-2.5 mt-3">
            {ALL_BLOOD_GROUPS.map(bg => (
              <button
                key={bg}
                onClick={() => setSelectedGroup(bg)}
                className={`px-4 py-2 rounded-xl font-black text-sm transition-all transform active:scale-95 ${
                  selectedGroup === bg
                    ? 'bg-red-700 text-white shadow-md shadow-red-200 ring-2 ring-red-700 ring-offset-2'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Selected group interactive spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-gradient-to-br from-red-50/70 to-rose-50/40 border border-red-100">
          {/* Can give to */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-700 text-white flex items-center justify-center font-black text-xs">
                {selectedGroup}
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Can DONATE Red Blood Cells To ({canGiveTo.length} Groups):
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {canGiveTo.map(g => (
                <span
                  key={g}
                  className="px-3 py-1 rounded-xl bg-red-700 text-white font-extrabold text-sm shadow-2xs"
                >
                  {g}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-600">
              Patients with these blood groups can safely receive red blood cells from a <strong className="text-red-700">{selectedGroup}</strong> donor.
            </p>
          </div>

          {/* Can receive from */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center font-black text-xs">
                {selectedGroup}
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Can RECEIVE Red Blood Cells From ({canReceiveFrom.length} Groups):
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {canReceiveFrom.map(g => (
                <span
                  key={g}
                  className="px-3 py-1 rounded-xl bg-slate-800 text-white font-extrabold text-sm shadow-2xs"
                >
                  {g}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-600">
              A recipient with <strong className="text-slate-800">{selectedGroup}</strong> can safely receive transfusions from donors with these blood groups.
            </p>
          </div>
        </div>

        {/* Clinical Note Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <Info className="w-4 h-4 text-red-600 shrink-0" />
            <span>Clinical Rule Implemented in Code:</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            {facts.description}
          </p>
        </div>
      </div>

      {/* Full 8x8 Compatibility Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Complete Donor-to-Recipient Compatibility Grid
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rows represent <span className="font-bold text-slate-800">Donor Blood Groups</span>, columns represent <span className="font-bold text-slate-800">Recipient Blood Groups</span>.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-xs font-bold text-slate-700">
                <th className="py-3 px-3 text-left bg-slate-200 font-extrabold">Donor \ Recipient</th>
                {ALL_BLOOD_GROUPS.map(r => (
                  <th key={r} className="py-3 px-2 font-black text-red-900">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ALL_BLOOD_GROUPS.map(donorGroup => (
                <tr key={donorGroup} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 text-left font-black text-red-900 bg-slate-50 text-xs">
                    {donorGroup}
                    {donorGroup === 'O-' && <span className="ml-1 text-[10px] text-amber-600 font-bold">(Univ Donor)</span>}
                    {donorGroup === 'AB+' && <span className="ml-1 text-[10px] text-purple-600 font-bold">(Univ Recip)</span>}
                  </td>
                  {ALL_BLOOD_GROUPS.map(recipGroup => {
                    const compatible = isDonorCompatible(donorGroup, recipGroup);
                    return (
                      <td key={recipGroup} className="py-2.5 px-2">
                        {compatible ? (
                          <div className="w-6 h-6 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs" title={`${donorGroup} CAN donate to ${recipGroup}`}>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 mx-auto rounded-full bg-slate-100 text-slate-300 flex items-center justify-center text-xs" title={`${donorGroup} CANNOT donate to ${recipGroup}`}>
                            <X className="w-3 h-3 stroke-[2]" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span><strong>Compatible</strong> (Safe Transfusion)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center">
              <X className="w-2.5 h-2.5" />
            </div>
            <span><strong>Incompatible</strong> (Antibody Agglutination Risk)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">O-</span>
            <span>Universal Donor</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">AB+</span>
            <span>Universal Recipient</span>
          </div>
        </div>
      </div>
    </div>
  );
};
