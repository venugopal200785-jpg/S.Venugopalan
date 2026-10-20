import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  FileCode, 
  HeartHandshake, 
  Share2, 
  ShieldCheck, 
  Filter,
  Sparkles
} from 'lucide-react';
import { BloodGroup, Donor } from '../types/blood-donation';
import { ALL_BLOOD_GROUPS, getCompatibleDonorGroups, getBloodGroupFacts } from '../utils/compatibility';
import { dbService } from '../services/storage';

interface FindDonorsViewProps {
  onSelectDonorForRequest?: (donor: Donor) => void;
  onRequestBloodForGroup?: (group: BloodGroup) => void;
}

export const FindDonorsView: React.FC<FindDonorsViewProps> = ({
  onRequestBloodForGroup
}) => {
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('B+');
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Execute query via dbService simulating DonorSearchServlet.java
  const searchResult = useMemo(() => {
    return dbService.searchDonors(selectedGroup, cityFilter);
  }, [selectedGroup, cityFilter]);

  const allCities = useMemo(() => {
    const donors = dbService.getDonors();
    const cities = Array.from(new Set(donors.map(d => d.city)));
    return ['ALL', ...cities.sort()];
  }, []);

  // Additional optional client-side name/phone filter
  const filteredDonors = useMemo(() => {
    if (!searchQuery.trim()) return searchResult.donors;
    const q = searchQuery.toLowerCase();
    return searchResult.donors.filter(
      d => d.name.toLowerCase().includes(q) || d.city.toLowerCase().includes(q) || d.phone.includes(q)
    );
  }, [searchResult.donors, searchQuery]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhone(text);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const groupFacts = getBloodGroupFacts(selectedGroup);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Introduction */}
      <div className="bg-gradient-to-r from-red-800 via-rose-700 to-red-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-red-100 mb-3">
            <Search className="w-3.5 h-3.5 text-red-300" />
            <span>DonorSearchServlet Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Find Compatible & Eligible Blood Donors
          </h1>
          <p className="mt-2 text-sm sm:text-base text-red-100/90 leading-relaxed">
            Hospitals and emergency responders can query our verified donor registry. Compatibility rules match medical RBC antigen tolerance, strictly verifying donors with <strong className="text-white">eligible = 'YES'</strong> and <strong className="text-white">recent_illness = 'NO'</strong>.
          </p>
        </div>
      </div>

      {/* Search & Compatibility Criteria Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Required Blood Group (Patient / Recipient):
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_BLOOD_GROUPS.map(bg => {
                const isSelected = bg === selectedGroup;
                return (
                  <button
                    key={bg}
                    onClick={() => setSelectedGroup(bg)}
                    className={`px-3.5 py-2 rounded-xl font-bold text-sm transition-all transform active:scale-95 ${
                      isSelected
                        ? 'bg-red-700 text-white shadow-md shadow-red-200 ring-2 ring-red-700 ring-offset-2'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {bg}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Filter by City:
              </label>
              <select
                value={cityFilter}
                onChange={e => setCityFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                {allCities.map(city => (
                  <option key={city} value={city}>
                    {city === 'ALL' ? 'All Cities (National)' : city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Filter by Name/Keyword:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter by name..."
                  className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-red-500 focus:outline-none w-44"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Compatibility breakdown alert */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-red-50/70 border border-red-100 md:col-span-2 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-red-900 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-red-600" />
              <span>Compatible Donor Types for {selectedGroup}:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {searchResult.compatibleGroups.map(grp => (
                <span
                  key={grp}
                  className="px-2.5 py-1 rounded-lg bg-red-700 text-white font-extrabold text-xs shadow-xs"
                >
                  {grp}
                </span>
              ))}
              <span className="text-xs text-slate-600 ml-1">
                ({searchResult.compatibleGroups.length} compatible blood types)
              </span>
            </div>
            <p className="text-xs text-slate-600 pt-1">
              {groupFacts.description}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-700 block">Query Criteria:</span>
            <div className="text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Eligibility: <code className="text-emerald-700 font-bold">YES</code></span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Recent Illness: <code className="text-emerald-700 font-bold">NO</code></span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Ordering: <code className="text-slate-700 font-mono">ORDER BY city, name</code></span>
              </div>
            </div>
          </div>
        </div>

        {/* Executed SQL query display */}
        <div className="p-3 bg-slate-900 rounded-xl text-slate-300 font-mono text-xs overflow-x-auto flex items-start gap-2">
          <FileCode className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-slate-500 select-none block text-[10px] font-sans font-semibold uppercase">
              SQL Executed by DonorSearchServlet.java:
            </span>
            <code className="text-amber-300 break-all">{searchResult.queryExecuted}</code>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Matching Eligible Donors
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
              {filteredDonors.length} Found
            </span>
          </div>

          {onRequestBloodForGroup && (
            <button
              onClick={() => onRequestBloodForGroup(selectedGroup)}
              className="text-xs px-3 py-1.5 font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-xs transition-colors flex items-center gap-1"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Submit Blood Request for {selectedGroup}</span>
            </button>
          )}
        </div>

        {filteredDonors.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No suitable eligible donor found.
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are currently no active donors registered with blood group in ({searchResult.compatibleGroups.join(', ')}) who are eligible and free of recent illness in the selected city.
            </p>
            {onRequestBloodForGroup && (
              <button
                onClick={() => onRequestBloodForGroup(selectedGroup)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                Create Priority Emergency Blood Request
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Donor Name</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Eligibility Verified</th>
                  <th className="py-3 px-4 text-right">Quick Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDonors.map((donor, idx) => {
                  const isExactMatch = donor.blood_group === selectedGroup;
                  return (
                    <tr 
                      key={donor.donor_id}
                      className={`hover:bg-red-50/40 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-xs">
                            {donor.name.charAt(0)}
                          </div>
                          <div>
                            <div>{donor.name}</div>
                            <span className="text-[11px] text-slate-400 font-normal">
                              Age: {donor.age} • {donor.gender}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                          isExactMatch 
                            ? 'bg-red-700 text-white ring-1 ring-red-800' 
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {donor.blood_group}
                          {isExactMatch && <span className="text-[10px] uppercase font-normal">(Exact)</span>}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{donor.city}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span>{donor.phone}</span>
                          <button
                            onClick={() => copyToClipboard(donor.phone)}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                            title="Copy phone"
                          >
                            {copiedPhone === donor.phone ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <a 
                          href={`mailto:${donor.email}?subject=Urgent Blood Donation Inquiry: Group ${selectedGroup}`}
                          className="hover:text-red-700 hover:underline flex items-center gap-1"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{donor.email}</span>
                        </a>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Eligible (No Illness)</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={`tel:${donor.phone}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-2xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Donor</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
