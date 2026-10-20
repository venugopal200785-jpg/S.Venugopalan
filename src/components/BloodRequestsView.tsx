import React, { useState } from 'react';
import { 
  Heart, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Building2, 
  User, 
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react';
import { BloodRequest, BloodGroup } from '../types/blood-donation';
import { dbService } from '../services/storage';
import { ALL_BLOOD_GROUPS, getCompatibleDonorGroups } from '../utils/compatibility';
import confetti from 'canvas-confetti';

interface BloodRequestsViewProps {
  onOpenCreateRequest: () => void;
}

export const BloodRequestsView: React.FC<BloodRequestsViewProps> = ({
  onOpenCreateRequest
}) => {
  const [filterGroup, setFilterGroup] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [pledged, setPledged] = useState<number[]>([]);

  const allRequests = dbService.getBloodRequests();

  const filteredRequests = allRequests.filter(r => {
    const matchesGroup = filterGroup === 'ALL' || r.required_blood_group === filterGroup;
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    return matchesGroup && matchesStatus;
  });

  const handlePledge = (id: number) => {
    setPledged(prev => [...prev, id]);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-800 to-rose-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-red-100 mb-3">
            <Heart className="w-3.5 h-3.5 text-red-300" />
            <span>BloodRequestServlet Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Urgent Patient Blood Requests
          </h1>
          <p className="mt-1 text-sm sm:text-base text-red-100/90 max-w-xl">
            Live blood requisition requests broadcast by authorized hospitals. Compatible donors can directly pledge support.
          </p>
        </div>

        <button
          onClick={onOpenCreateRequest}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-red-700 text-sm font-bold shadow-md hover:bg-red-50 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit New Blood Request</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter by Blood Group:</span>
          </div>
          <select
            value={filterGroup}
            onChange={e => setFilterGroup(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50"
          >
            <option value="ALL">All Groups</option>
            {ALL_BLOOD_GROUPS.map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 ml-2">
            <span>Status:</span>
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="IN PROGRESS">IN PROGRESS</option>
            <option value="FULFILLED">FULFILLED</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredRequests.length} of {allRequests.length} requests
        </span>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequests.map(req => {
          const compatibleDonors = getCompatibleDonorGroups(req.required_blood_group);
          const isPledged = pledged.includes(req.request_id);

          return (
            <div
              key={req.request_id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-red-200 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                      req.urgency === 'Critical'
                        ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                        : req.urgency === 'Urgent'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {req.urgency || 'Urgent'} Priority
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">#{req.request_id}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    req.status === 'FULFILLED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : req.status === 'IN PROGRESS'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{req.recipient_name}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.hospital_name}</span>
                  </div>
                </div>

                <div className="p-3 bg-red-50/70 border border-red-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider block">
                      Required Blood Type
                    </span>
                    <span className="text-2xl font-black text-red-700">
                      {req.required_blood_group}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Quantity
                    </span>
                    <span className="text-xl font-extrabold text-slate-800">
                      {req.units_required} <span className="text-xs font-normal text-slate-500">Unit{req.units_required > 1 ? 's' : ''}</span>
                    </span>
                  </div>
                </div>

                {req.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                    "{req.notes}"
                  </p>
                )}

                <div className="text-[11px] text-slate-500 space-y-1">
                  <span className="font-bold text-slate-700 block">Compatible donor groups:</span>
                  <div className="flex flex-wrap gap-1">
                    {compatibleDonors.map(g => (
                      <span key={g} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{req.request_date}</span>
                </span>

                {isPledged ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Pledged!</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handlePledge(req.request_id)}
                    className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold text-xs transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <Heart className="w-3 h-3" />
                    <span>I Can Donate</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
