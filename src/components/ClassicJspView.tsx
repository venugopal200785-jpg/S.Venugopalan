import React, { useState } from 'react';
import { BloodGroup } from '../types/blood-donation';
import { ALL_BLOOD_GROUPS } from '../utils/compatibility';
import { dbService } from '../services/storage';

interface ClassicJspViewProps {
  onSwitchToModern: () => void;
}

export const ClassicJspView: React.FC<ClassicJspViewProps> = ({ onSwitchToModern }) => {
  const [currentPage, setCurrentPage] = useState<'index' | 'donor-register' | 'donor-login' | 'donor-dashboard' | 'hospital-login' | 'hospital-dashboard' | 'search-results' | 'request-success'>('index');

  // Sessions
  const [donorSession, setDonorSession] = useState<string | null>(null);
  const [hospitalSession, setHospitalSession] = useState<string | null>(null);

  // Donor register state
  const [regName, setRegName] = useState('');
  const [regAge, setRegAge] = useState('25');
  const [regGender, setRegGender] = useState('Male');
  const [regBloodGroup, setRegBloodGroup] = useState<BloodGroup>('A+');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regEligible, setRegEligible] = useState<'YES' | 'NO'>('YES');
  const [regIllness, setRegIllness] = useState<'YES' | 'NO'>('NO');

  // Donor login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPhone, setLoginPhone] = useState('');

  // Hospital login state
  const [hospUsername, setHospUsername] = useState('');
  const [hospPassword, setHospPassword] = useState('');

  // Hospital dashboard state
  const [searchBloodGroup, setSearchBloodGroup] = useState<BloodGroup>('A+');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Blood request state
  const [reqRecipientId, setReqRecipientId] = useState('101');
  const [reqBloodGroup, setReqBloodGroup] = useState<BloodGroup>('A+');
  const [reqUnits, setReqUnits] = useState('2');

  const [message, setMessage] = useState<string | null>(null);

  // 1. registerDonor Servlet handler
  const handleRegisterDonor = (e: React.FormEvent) => {
    e.preventDefault();
    const res = dbService.registerDonor({
      name: regName,
      age: parseInt(regAge),
      gender: regGender as any,
      blood_group: regBloodGroup,
      phone: regPhone,
      email: regEmail,
      city: regCity,
      eligible: regEligible,
      recent_illness: regIllness
    });

    if (res.success) {
      setCurrentPage('donor-login');
      setMessage('Registration successful! Please login.');
    } else {
      setMessage(res.message || 'Registration failed.');
    }
  };

  // 2. donorLogin Servlet handler
  const handleDonorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const res = dbService.donorLogin(loginEmail, loginPhone);
    if (res.success && res.donor) {
      setDonorSession(res.donor.name);
      setCurrentPage('donor-dashboard');
      setMessage(null);
    } else {
      setMessage('Invalid donor login.');
    }
  };

  // 3. hospitalLogin Servlet handler
  const handleHospitalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const res = dbService.hospitalLogin(hospUsername, hospPassword);
    if (res.success && res.hospital) {
      setHospitalSession(res.hospital.hospital_name);
      setCurrentPage('hospital-dashboard');
      setMessage(null);
    } else {
      setMessage('Invalid hospital username or password.');
    }
  };

  // 4. searchDonors Servlet handler
  const handleSearchDonors = (e: React.FormEvent) => {
    e.preventDefault();
    const res = dbService.searchDonors(searchBloodGroup);
    setSearchResults(res.donors);
    setCurrentPage('search-results');
  };

  // 5. bloodRequest Servlet handler
  const handleBloodRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const res = dbService.submitBloodRequest({
      recipientId: parseInt(reqRecipientId),
      bloodGroup: reqBloodGroup,
      units: parseInt(reqUnits)
    });

    if (res.success) {
      setCurrentPage('request-success');
    } else {
      setMessage('Failed to submit blood request.');
    }
  };

  return (
    <div className="min-h-screen py-10 px-4" style={{
      background: 'linear-gradient(135deg, #fff5f5, #ffe5e5)',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Top Banner with switcher back to modern */}
      <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center text-xs bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-red-200">
        <span className="text-red-900 font-bold">
          📜 Classic JSP & Servlet Mode (Simulating exact HTML/CSS from style.css & JSP files)
        </span>
        <button
          onClick={onSwitchToModern}
          className="px-3 py-1 bg-red-700 text-white rounded-lg font-bold hover:bg-red-800 transition-colors"
        >
          Switch to Modern Healthcare UI
        </button>
      </div>

      <div style={{
        width: '90%',
        maxWidth: '900px',
        margin: '20px auto',
        padding: '40px',
        textAlign: 'center',
        background: 'white',
        borderRadius: '15px',
        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.15)'
      }}>
        {message && (
          <div style={{
            padding: '10px',
            marginBottom: '20px',
            background: '#ffebee',
            color: '#c62828',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}

        {/* ===================== FILE 8: index.jsp ===================== */}
        {currentPage === 'index' && (
          <div>
            <h1 style={{ color: '#b30000', fontSize: '32px', marginBottom: '15px' }}>
              Blood Donation & Compatibility System
            </h1>
            <p style={{ fontSize: '17px', color: '#444', marginBottom: '30px' }}>
              Connecting blood donors with hospitals and patients when blood is required.
            </p>

            <div style={{ margin: '20px 0' }}>
              <button
                onClick={() => { setCurrentPage('donor-login'); setMessage(null); }}
                style={{
                  display: 'inline-block',
                  margin: '10px',
                  padding: '14px 25px',
                  background: '#c62828',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                Donor Login
              </button>

              <button
                onClick={() => { setCurrentPage('donor-register'); setMessage(null); }}
                style={{
                  display: 'inline-block',
                  margin: '10px',
                  padding: '14px 25px',
                  background: '#c62828',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                Donor Registration
              </button>

              <button
                onClick={() => { setCurrentPage('hospital-login'); setMessage(null); }}
                style={{
                  display: 'inline-block',
                  margin: '10px',
                  padding: '14px 25px',
                  background: '#c62828',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                Hospital Login
              </button>
            </div>
          </div>
        )}

        {/* ===================== FILE 9: donor-register.jsp ===================== */}
        {currentPage === 'donor-register' && (
          <div>
            <h2 style={{ color: '#c62828', fontSize: '26px' }}>Donor Registration</h2>

            <form onSubmit={handleRegisterDonor} style={{ maxWidth: '500px', margin: '20px auto' }}>
              <input
                type="text"
                placeholder="Full Name"
                required
                value={regName}
                onChange={e => setRegName(e.target.value)}
                style={{
                  width: '90%',
                  padding: '12px',
                  margin: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              />

              <input
                type="number"
                placeholder="Age"
                required
                value={regAge}
                onChange={e => setRegAge(e.target.value)}
                style={{
                  width: '90%',
                  padding: '12px',
                  margin: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              />

              <select
                required
                value={regGender}
                onChange={e => setRegGender(e.target.value)}
                style={{
                  width: '90%',
                  padding: '12px',
                  margin: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <select
                required
                value={regBloodGroup}
                onChange={e => setRegBloodGroup(e.target.value as BloodGroup)}
                style={{
                  width: '90%',
                  padding: '12px',
                  margin: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select Blood Group</option>
                {ALL_BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Phone Number"
                required
                value={regPhone}
                onChange={e => setRegPhone(e.target.value)}
                style={{
                  width: '90%',
                  padding: '12px',
                  margin: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              />

              <input
                type="email"
                placeholder="Email"
                required
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                style={{
                  width: '90%',
                  padding: '12px',
                  margin: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              />

              <input
                type="text"
                placeholder="City"
                required
                value={regCity}
                onChange={e => setRegCity(e.target.value)}
                style={{
                  width: '90%',
                  padding: '12px',
                  margin: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              />

              <select
                value={regEligible}
                onChange={e => setRegEligible(e.target.value as any)}
                style={{
                  width: '90%',
                  padding: '12px',
                  margin: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="YES">Eligible to Donate - YES</option>
                <option value="NO">Eligible to Donate - NO</option>
              </select>

              <select
                value={regIllness}
                onChange={e => setRegIllness(e.target.value as any)}
                style={{
                  width: '90%',
                  padding: '12px',
                  margin: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="NO">Recent Illness - NO</option>
                <option value="YES">Recent Illness - YES</option>
              </select>

              <button
                type="submit"
                style={{
                  padding: '12px 25px',
                  marginTop: '10px',
                  background: '#c62828',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: 'bold'
                }}
              >
                Register as Donor
              </button>
            </form>

            <br />
            <a
              href="#login"
              onClick={e => { e.preventDefault(); setCurrentPage('donor-login'); }}
              style={{ color: '#c62828', textDecoration: 'none', fontWeight: 'bold' }}
            >
              Already registered? Login
            </a>
            <br /><br />
            <a
              href="#home"
              onClick={e => { e.preventDefault(); setCurrentPage('index'); }}
              style={{ color: '#666', textDecoration: 'none' }}
            >
              Back to Home
            </a>
          </div>
        )}

        {/* ===================== FILE 10: donor-login.jsp ===================== */}
        {currentPage === 'donor-login' && (
          <div>
            <h2 style={{ color: '#c62828', fontSize: '26px' }}>Donor Login</h2>

            <form onSubmit={handleDonorLogin} style={{ maxWidth: '500px', margin: '20px auto' }}>
              <input
                type="email"
                placeholder="Email"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                style={{
                  width: '90%',
                  padding: '12px',
                  margin: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              />

              <input
                type="text"
                placeholder="Phone"
                required
                value={loginPhone}
                onChange={e => setLoginPhone(e.target.value)}
                style={{
                  width: '90%',
                  padding: '12px',
                  margin: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              />

              <button
                type="submit"
                style={{
                  padding: '12px 25px',
                  marginTop: '10px',
                  background: '#c62828',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: 'bold'
                }}
              >
                Login
              </button>
            </form>

            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              💡 Quick test: <code>priya.sharma@example.com</code> / Phone: <code>9876543210</code>
            </div>

            <br />
            <a
              href="#register"
              onClick={e => { e.preventDefault(); setCurrentPage('donor-register'); }}
              style={{ color: '#c62828', textDecoration: 'none', fontWeight: 'bold' }}
            >
              New Donor? Register Here
            </a>
            <br /><br />
            <a
              href="#home"
              onClick={e => { e.preventDefault(); setCurrentPage('index'); }}
              style={{ color: '#666', textDecoration: 'none' }}
            >
              Back to Home
            </a>
          </div>
        )}

        {/* ===================== FILE 11: donor-dashboard.jsp ===================== */}
        {currentPage === 'donor-dashboard' && (
          <div>
            <h2 style={{ color: '#c62828', fontSize: '26px' }}>Donor Dashboard</h2>
            <h3 style={{ color: '#8e0000', fontSize: '22px' }}>Welcome, {donorSession}</h3>

            <p style={{ fontSize: '17px', color: '#444' }}>
              Thank you for being a blood donor.
            </p>
            <p style={{ fontSize: '17px', color: '#444' }}>
              Your information can be used to find compatible blood donations when required.
            </p>

            <button
              onClick={() => { setDonorSession(null); setCurrentPage('index'); }}
              style={{
                display: 'inline-block',
                margin: '20px 10px',
                padding: '14px 25px',
                background: '#c62828',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        )}

        {/* ===================== FILE 12: hospital-login.jsp ===================== */}
        {currentPage === 'hospital-login' && (
          <div>
            <h2 style={{ color: '#c62828', fontSize: '26px' }}>Hospital Login</h2>

            <form onSubmit={handleHospitalLogin} style={{ maxWidth: '500px', margin: '20px auto' }}>
              <input
                type="text"
                placeholder="Hospital Username"
                required
                value={hospUsername}
                onChange={e => setHospUsername(e.target.value)}
                style={{
                  width: '90%',
                  padding: '12px',
                  margin: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              />

              <input
                type="password"
                placeholder="Password"
                required
                value={hospPassword}
                onChange={e => setHospPassword(e.target.value)}
                style={{
                  width: '90%',
                  padding: '12px',
                  margin: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              />

              <button
                type="submit"
                style={{
                  padding: '12px 25px',
                  marginTop: '10px',
                  background: '#c62828',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: 'bold'
                }}
              >
                Login
              </button>
            </form>

            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              💡 Quick test: Username: <code>citycare</code> / Password: <code>hospital123</code>
            </div>

            <br /><br />
            <a
              href="#home"
              onClick={e => { e.preventDefault(); setCurrentPage('index'); }}
              style={{ color: '#666', textDecoration: 'none' }}
            >
              Back to Home
            </a>
          </div>
        )}

        {/* ===================== FILE 13: hospital-dashboard.jsp ===================== */}
        {currentPage === 'hospital-dashboard' && (
          <div>
            <h2 style={{ color: '#c62828', fontSize: '26px' }}>Hospital Dashboard</h2>
            <h3 style={{ color: '#8e0000', fontSize: '22px' }}>Welcome, {hospitalSession}</h3>

            <hr style={{ margin: '35px 0', border: 'none', borderTop: '1px solid #ddd' }} />

            <h3 style={{ color: '#8e0000', fontSize: '20px' }}>Find Suitable Blood Donors</h3>

            <form onSubmit={handleSearchDonors} style={{ maxWidth: '500px', margin: '20px auto' }}>
              <select
                required
                value={searchBloodGroup}
                onChange={e => setSearchBloodGroup(e.target.value as BloodGroup)}
                style={{
                  width: '90%',
                  padding: '12px',
                  margin: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Required Blood Group</option>
                {ALL_BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>

              <button
                type="submit"
                style={{
                  padding: '12px 25px',
                  marginTop: '10px',
                  background: '#c62828',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: 'bold'
                }}
              >
                Find Donors
              </button>
            </form>

            <hr style={{ margin: '35px 0', border: 'none', borderTop: '1px solid #ddd' }} />

            <h3 style={{ color: '#8e0000', fontSize: '20px' }}>Submit Blood Request</h3>

            <form onSubmit={handleBloodRequest} style={{ maxWidth: '500px', margin: '20px auto' }}>
              <input
                type="number"
                placeholder="Recipient ID"
                required
                value={reqRecipientId}
                onChange={e => setReqRecipientId(e.target.value)}
                style={{
                  width: '90%',
                  padding: '12px',
                  margin: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              />

              <select
                required
                value={reqBloodGroup}
                onChange={e => setReqBloodGroup(e.target.value as BloodGroup)}
                style={{
                  width: '90%',
                  padding: '12px',
                  margin: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Required Blood Group</option>
                {ALL_BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Units Required"
                min="1"
                required
                value={reqUnits}
                onChange={e => setReqUnits(e.target.value)}
                style={{
                  width: '90%',
                  padding: '12px',
                  margin: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              />

              <button
                type="submit"
                style={{
                  padding: '12px 25px',
                  marginTop: '10px',
                  background: '#c62828',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: 'bold'
                }}
              >
                Submit Blood Request
              </button>
            </form>

            <br /><br />
            <button
              onClick={() => { setHospitalSession(null); setCurrentPage('index'); }}
              style={{
                display: 'inline-block',
                margin: '10px',
                padding: '14px 25px',
                background: '#c62828',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        )}

        {/* ===================== FILE 6: searchDonors output ===================== */}
        {currentPage === 'search-results' && (
          <div>
            <h2 style={{ color: '#c62828', fontSize: '26px' }}>Matching Eligible Donors</h2>

            {searchResults.length === 0 ? (
              <p style={{ fontSize: '17px', margin: '20px 0' }}>No suitable eligible donor found.</p>
            ) : (
              <table style={{
                width: '100%',
                margin: '25px auto',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px', border: '1px solid #ccc', background: '#c62828', color: 'white' }}>Name</th>
                    <th style={{ padding: '12px', border: '1px solid #ccc', background: '#c62828', color: 'white' }}>Blood Group</th>
                    <th style={{ padding: '12px', border: '1px solid #ccc', background: '#c62828', color: 'white' }}>City</th>
                    <th style={{ padding: '12px', border: '1px solid #ccc', background: '#c62828', color: 'white' }}>Phone</th>
                    <th style={{ padding: '12px', border: '1px solid #ccc', background: '#c62828', color: 'white' }}>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((d, i) => (
                    <tr key={d.donor_id} style={{ background: i % 2 === 1 ? '#f9f9f9' : 'white' }}>
                      <td style={{ padding: '12px', border: '1px solid #ccc' }}>{d.name}</td>
                      <td style={{ padding: '12px', border: '1px solid #ccc', fontWeight: 'bold' }}>{d.blood_group}</td>
                      <td style={{ padding: '12px', border: '1px solid #ccc' }}>{d.city}</td>
                      <td style={{ padding: '12px', border: '1px solid #ccc' }}>{d.phone}</td>
                      <td style={{ padding: '12px', border: '1px solid #ccc' }}>{d.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <br />
            <a
              href="#dashboard"
              onClick={e => { e.preventDefault(); setCurrentPage('hospital-dashboard'); }}
              style={{ color: '#c62828', textDecoration: 'none', fontWeight: 'bold', fontSize: '16px' }}
            >
              Back to Hospital Dashboard
            </a>
          </div>
        )}

        {/* ===================== FILE 7: bloodRequest confirmation ===================== */}
        {currentPage === 'request-success' && (
          <div>
            <h2 style={{ color: '#c62828', fontSize: '26px' }}>Blood request submitted successfully!</h2>
            <p style={{ fontSize: '17px', color: '#333' }}>Status: PENDING</p>
            <br />
            <a
              href="#dashboard"
              onClick={e => { e.preventDefault(); setCurrentPage('hospital-dashboard'); }}
              style={{ color: '#c62828', textDecoration: 'none', fontWeight: 'bold', fontSize: '16px' }}
            >
              Return to Hospital Dashboard
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
