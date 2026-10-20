import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  PlusCircle, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  UserPlus, 
  Phone, 
  Mail, 
  MapPin, 
  FileCode, 
  LogOut,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { BloodGroup, Donor, Recipient, BloodRequest } from '../types/blood-donation';
import { ALL_BLOOD_GROUPS, getCompatibleDonorGroups } from '../utils/compatibility';
import { dbService } from '../services/storage';
import { AuthUser } from '../services/auth';
import confetti from 'canvas-confetti';

interface HospitalDashboardViewProps {
  currentUser: AuthUser | null;
  onLogout: () => void;
}

export const HospitalDashboardView: React.FC<HospitalDashboardViewProps> = ({
  currentUser,
  onLogout
}) => {
  const [activeHospitalTab, setActiveHospitalTab] = useState<'search' | 'submit-request' | 'view-requests' | 'recipients'>('search');

  // Search tab state
  const [searchBloodGroup, setSearchBloodGroup] = useState<BloodGroup>('A+');
  const [searchCity, setSearchCity] = useState<string>('ALL');

  // Blood request form state (BloodRequestServlet.java)
  const [recipientId, setRecipientId] = useState<number>(101);
  const [reqBloodGroup, setReqBloodGroup] = useState<BloodGroup>('A+');
  const [units, setUnits] = useState<number>(2);
  const [urgency, setUrgency] = useState<'Normal' | 'Urgent' | 'Critical'>('Urgent');
  const [notes, setNotes] = useState<string>('');
  const [requestSuccessMsg, setRequestSuccessMsg] = useState<string | null>(null);

  // New recipient modal state
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [recipName, setRecipName] = useState('');
  const [recipAge, setRecipAge] = useState(35);
  const [recipGender, setRecipGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [recipBloodGroup, setRecipBloodGroup] = useState<BloodGroup>('A+');
  const [recipPhone, setRecipPhone] = useState('');
  const [recipEmail, setRecipEmail] = useState('');
  const [recipCity, setRecipCity] = useState('Mumbai');

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);

  const hospital = useMemo(() => {
    const list = dbService.getHospitals();
    if (currentUser?.hospitalId) {
      return list.find(h => h.hospital_id === currentUser.hospitalId) || list[0];
    }
    const active = dbService.getActiveHospital();
    return active || list[0];
  }, [currentUser]);

  const loadData = () => {
    setRecipients(dbService.getRecipients());
    setRequests(dbService.getBloodRequests());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Simulating DonorSearchServlet.java
  const searchResults = useMemo(() => {
    return dbService.searchDonors(searchBloodGroup, searchCity);
  }, [searchBloodGroup, searchCity]);

  // Submit Blood Request (simulating BloodRequestServlet.java)
  const handleSubmitBloodRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (units < 1) return;

    const res = dbService.submitBloodRequest({
      recipientId: Number(recipientId),
      bloodGroup: reqBloodGroup,
      units: Number(units),
      hospitalId: hospital.hospital_id,
      hospitalName: hospital.hospital_name,
      urgency,
      notes
    });

    if (res.success && res.request) {
      setRequestSuccessMsg(`Blood request #${res.request.request_id} submitted successfully! Status: PENDING`);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      loadData();
      setNotes('');
      setTimeout(() => {
        setActiveHospitalTab('view-requests');
      }, 1200);
    }
  };

  // Add Recipient (Recipient.java)
  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    const newR = dbService.addRecipient({
      name: recipName,
      age: recipAge,
      gender: recipGender,
      bloodGroup: recipBloodGroup,
      phone: recipPhone,
      email: recipEmail,
      city: recipCity,
      hospital_id: hospital.hospital_id
    });

    setRecipients(dbService.getRecipients());
    setRecipientId(newR.recipientId);
    setReqBloodGroup(newR.bloodGroup);
    setShowAddRecipient(false);
    setRecipName('');
  };

  const handleStatusChange = (requestId: number, newStatus: any) => {
    dbService.updateRequestStatus(requestId, newStatus);
    loadData();
    if (newStatus === 'FULFILLED') {
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.7 } });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Welcome Banner matching hospital-dashboard.jsp */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold backdrop-blur-xs mb-3">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Authorized Medical Portal • ID #{hospital.hospital_id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {hospital.hospital_name}
          </h1>
          <p className="mt-1 text-sm text-blue-100/90 max-w-xl">
            Welcome, {hospital.hospital_name}! Direct interface for finding compatible blood donors and submitting immediate patient blood requests.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold backdrop-blur-xs border border-white/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Hospital Sub-Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveHospitalTab('search')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeHospitalTab === 'search'
              ? 'bg-red-700 text-white shadow-xs shadow-red-200'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Find Suitable Donors (DonorSearchServlet)</span>
        </button>

        <button
          onClick={() => setActiveHospitalTab('submit-request')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeHospitalTab === 'submit-request'
              ? 'bg-red-700 text-white shadow-xs shadow-red-200'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit Blood Request (BloodRequestServlet)</span>
        </button>

        <button
          onClick={() => setActiveHospitalTab('view-requests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeHospitalTab === 'view-requests'
              ? 'bg-red-700 text-white shadow-xs shadow-red-200'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Hospital Requests ({requests.length})</span>
        </button>

        <button
          onClick={() => setActiveHospitalTab('recipients')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeHospitalTab === 'recipients'
              ? 'bg-red-700 text-white shadow-xs shadow-red-200'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Patient Registry ({recipients.length})</span>
        </button>
      </div>

      {/* ===================== TAB 1: FIND SUITABLE DONORS ===================== */}
      {activeHospitalTab === 'search' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Find Suitable Blood Donors
              </h3>
              <p className="text-xs text-slate-500">
                Select patient's blood group to run medical compatibility query with eligibility and illness checks.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Required Blood Group:
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_BLOOD_GROUPS.map(bg => (
                    <button
                      key={bg}
                      onClick={() => setSearchBloodGroup(bg)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                        searchBloodGroup === bg
                          ? 'bg-red-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Filter by City:
                </label>
                <select
                  value={searchCity}
                  onChange={e => setSearchCity(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                >
                  <option value="ALL">All Cities</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Pune">Pune</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Chennai">Chennai</option>
                </select>
              </div>
            </div>

            {/* Compatible group badge & SQL query */}
            <div className="p-3 bg-red-50/70 border border-red-100 rounded-xl text-xs space-y-1">
              <span className="font-bold text-red-900">
                Compatible donor groups for {searchBloodGroup}:
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {searchResults.compatibleGroups.map(grp => (
                  <span key={grp} className="px-2 py-0.5 rounded bg-red-700 text-white font-extrabold text-xs">
                    {grp}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl text-slate-300 font-mono text-xs flex items-center gap-2 overflow-x-auto">
              <FileCode className="w-4 h-4 text-amber-400 shrink-0" />
              <code className="text-amber-300 text-[11px]">{searchResults.queryExecuted}</code>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">
                Matching Eligible Donors ({searchResults.donors.length})
              </h4>
              <button
                onClick={() => {
                  setReqBloodGroup(searchBloodGroup);
                  setActiveHospitalTab('submit-request');
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors"
              >
                + Request Blood for {searchBloodGroup}
              </button>
            </div>

            {searchResults.donors.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm space-y-1">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="font-bold text-slate-800">No suitable eligible donor found.</p>
                <p className="text-xs text-slate-500">No donors match the required blood group and eligibility filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Blood Group</th>
                      <th className="py-3 px-4">City</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {searchResults.donors.map((d, i) => (
                      <tr key={d.donor_id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {d.name}
                          <span className="block text-[11px] text-slate-400 font-normal">Age: {d.age}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-xs">
                            {d.blood_group}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{d.city}</td>
                        <td className="py-3 px-4 font-mono text-xs">{d.phone}</td>
                        <td className="py-3 px-4 text-xs text-slate-600">{d.email}</td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={`tel:${d.phone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Contact</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 2: SUBMIT BLOOD REQUEST ===================== */}
      {activeHospitalTab === 'submit-request' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-900">
              Submit Blood Request (BloodRequestServlet.java)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Creates a verified blood request in the system with status 'PENDING' and today's date.
            </p>
          </div>

          {requestSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{requestSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitBloodRequest} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Select Patient / Recipient *
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddRecipient(true)}
                  className="text-xs font-semibold text-red-700 hover:underline flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ New Patient</span>
                </button>
              </div>

              <select
                value={recipientId}
                onChange={e => {
                  const id = Number(e.target.value);
                  setRecipientId(id);
                  const found = recipients.find(r => r.recipientId === id);
                  if (found) setReqBloodGroup(found.bloodGroup);
                }}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                {recipients.map(r => (
                  <option key={r.recipientId} value={r.recipientId}>
                    #{r.recipientId} - {r.name} ({r.bloodGroup}) • {r.city}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Blood Group *
                </label>
                <select
                  value={reqBloodGroup}
                  onChange={e => setReqBloodGroup(e.target.value as BloodGroup)}
                  className="w-full px-3 py-2 text-sm font-bold text-red-700 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500"
                >
                  {ALL_BLOOD_GROUPS.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Units Required *
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={units}
                  onChange={e => setUnits(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Urgency Level
                </label>
                <select
                  value={urgency}
                  onChange={e => setUrgency(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                >
                  <option value="Normal">Normal Scheduled</option>
                  <option value="Urgent">Urgent (Within 24h)</option>
                  <option value="Critical">Critical Emergency (Immediate)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Request Date (CURDATE())
                </label>
                <input
                  type="text"
                  disabled
                  value={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Notes / Medical Reason
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Scheduled coronary artery bypass graft, ICU Bed 4"
                rows={2}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
              <span className="font-bold">SQL Statement Execution:</span>
              <pre className="font-mono text-red-700 mt-1">
                INSERT INTO blood_requests (recipient_id, required_blood_group, units_required, request_date, status) VALUES ({recipientId}, '{reqBloodGroup}', {units}, CURDATE(), 'PENDING')
              </pre>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl text-sm transition-colors shadow-xs shadow-red-200"
            >
              Submit Blood Request
            </button>
          </form>
        </div>
      )}

      {/* ===================== TAB 3: VIEW REQUESTS ===================== */}
      {activeHospitalTab === 'view-requests' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Hospital Blood Requests Table
              </h3>
              <p className="text-xs text-slate-500">Live view of records from MySQL `blood_requests` table.</p>
            </div>
            <button
              onClick={() => setActiveHospitalTab('submit-request')}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-700 text-white font-semibold hover:bg-red-800"
            >
              + Create Request
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                  <th className="py-3 px-4">Req #</th>
                  <th className="py-3 px-4">Recipient Name</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Request Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r, i) => (
                  <tr key={r.request_id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-3 px-4 font-mono font-bold text-xs text-slate-700">#{r.request_id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {r.recipient_name || `Recipient #${r.recipient_id}`}
                      {r.notes && <span className="block text-[11px] text-slate-400 font-normal">{r.notes}</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-extrabold text-xs">
                        {r.required_blood_group}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">{r.units_required}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">{r.request_date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        r.status === 'FULFILLED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'IN PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {r.status !== 'FULFILLED' ? (
                        <button
                          onClick={() => handleStatusChange(r.request_id, 'FULFILLED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                        >
                          Mark Fulfilled
                        </button>
                      ) : (
                        <span className="text-emerald-700 text-xs font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Complete
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== TAB 4: PATIENT / RECIPIENTS ===================== */}
      {activeHospitalTab === 'recipients' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Patient / Recipient Registry (Recipient.java model)
              </h3>
              <p className="text-xs text-slate-500">Patients registered for clinical transfusion matching.</p>
            </div>
            <button
              onClick={() => setShowAddRecipient(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-700 text-white font-semibold hover:bg-red-800"
            >
              + Add New Patient
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Age/Gender</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recipients.map(r => (
                  <tr key={r.recipientId}>
                    <td className="py-3 px-4 font-mono font-bold text-xs text-slate-500">#{r.recipientId}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{r.name}</td>
                    <td className="py-3 px-4 text-slate-600">{r.age} yrs • {r.gender}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-extrabold text-xs">
                        {r.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{r.city}</td>
                    <td className="py-3 px-4 font-mono text-xs">{r.phone}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setRecipientId(r.recipientId);
                          setReqBloodGroup(r.bloodGroup);
                          setActiveHospitalTab('submit-request');
                        }}
                        className="text-xs font-bold text-red-700 hover:underline"
                      >
                        Request Blood
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Recipient Modal */}
      {showAddRecipient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900">Add New Recipient (Patient)</h4>
              <button
                onClick={() => setShowAddRecipient(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRecipient} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  value={recipName}
                  onChange={e => setRecipName(e.target.value)}
                  placeholder="e.g. Anand Murthy"
                  className="w-full px-3 py-1.5 text-sm border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={recipAge}
                    onChange={e => setRecipAge(Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-sm border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={recipGender}
                    onChange={e => setRecipGender(e.target.value as any)}
                    className="w-full px-2 py-1.5 text-sm border rounded-xl"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={recipBloodGroup}
                    onChange={e => setRecipBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-2 py-1.5 text-sm font-bold text-red-700 border rounded-xl"
                  >
                    {ALL_BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={recipPhone}
                    onChange={e => setRecipPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-1.5 text-sm border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={recipCity}
                    onChange={e => setRecipCity(e.target.value)}
                    placeholder="Mumbai"
                    className="w-full px-3 py-1.5 text-sm border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={recipEmail}
                  onChange={e => setRecipEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full px-3 py-1.5 text-sm border rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRecipient(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-xl shadow-xs"
                >
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
