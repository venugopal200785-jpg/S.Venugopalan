import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  Building2, 
  CheckCircle, 
  AlertCircle, 
  Heart, 
  MapPin, 
  Calendar, 
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { BloodGroup } from '../types/blood-donation';
import { ALL_BLOOD_GROUPS } from '../utils/compatibility';
import { authService, AuthUser } from '../services/auth';
import { dbService } from '../services/storage';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'signup';
  onAuthSuccess: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
  onAuthSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  const [loginMethod, setLoginMethod] = useState<'email-pass' | 'donor-servlet' | 'hospital-servlet'>('email-pass');
  const [signUpRole, setSignUpRole] = useState<'donor' | 'hospital'>('donor');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [hospitalUsername, setHospitalUsername] = useState('');

  // Sign up donor form state (from DonorRegistrationServlet.java)
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [eligible, setEligible] = useState<'YES' | 'NO'>('YES');
  const [recentIllness, setRecentIllness] = useState<'YES' | 'NO'>('NO');
  const [signUpPassword, setSignUpPassword] = useState('');

  // Sign up hospital form state
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalUsernameInput, setHospitalUsernameInput] = useState('');
  const [hospitalCity, setHospitalCity] = useState('Mumbai');
  const [hospitalPhone, setHospitalPhone] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');

  if (!isOpen) return null;

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await authService.loginWithPassword(loginEmail, loginPassword);
      if (res.success && res.user) {
        setSuccessMessage('Logged in successfully!');
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
        setTimeout(() => {
          onAuthSuccess(res.user!);
          onClose();
        }, 500);
      } else {
        setErrorMessage(res.message || 'Login failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleDonorServletLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      // Simulates DonorLoginServlet.java: SELECT * FROM donors WHERE email = ? AND phone = ?
      const res = dbService.donorLogin(loginEmail, donorPhone);
      if (res.success && res.donor) {
        // Find or create synthetic AuthUser session
        const users = authService.getUsers();
        let user = users.find(u => u.email.toLowerCase() === res.donor!.email.toLowerCase());
        if (!user) {
          user = {
            id: 'usr_donor_' + res.donor.donor_id,
            email: res.donor.email,
            name: res.donor.name,
            role: 'donor',
            salt: 'servlet_session',
            passwordHash: 'servlet_session',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            donorId: res.donor.donor_id
          };
          authService.createSession(user.id);
        } else {
          authService.createSession(user.id);
        }
        setSuccessMessage(`Welcome back, ${res.donor.name}!`);
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
        setTimeout(() => {
          onAuthSuccess(user!);
          onClose();
        }, 500);
      } else {
        setErrorMessage(res.message || 'Invalid donor email or phone number.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login error.');
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalServletLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      // Simulates HospitalLoginServlet.java: SELECT * FROM hospitals WHERE username = ? AND password = ?
      const res = dbService.hospitalLogin(hospitalUsername, loginPassword);
      if (res.success && res.hospital) {
        const users = authService.getUsers();
        let user = users.find(u => u.hospitalId === res.hospital!.hospital_id);
        if (!user) {
          user = {
            id: 'usr_hosp_' + res.hospital.hospital_id,
            email: `${hospitalUsername}@hospital.org`,
            name: res.hospital.hospital_name,
            role: 'hospital',
            salt: 'servlet_session',
            passwordHash: 'servlet_session',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            hospitalId: res.hospital.hospital_id
          };
          authService.createSession(user.id);
        } else {
          authService.createSession(user.id);
        }
        setSuccessMessage(`Welcome, ${res.hospital.hospital_name}!`);
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
        setTimeout(() => {
          onAuthSuccess(user!);
          onClose();
        }, 500);
      } else {
        setErrorMessage(res.message || 'Invalid hospital credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Hospital login error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDonorSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (age < 18 || age > 65) {
      setErrorMessage('Donors must typically be between 18 and 65 years of age.');
      return;
    }

    if (!phone || phone.length < 8) {
      setErrorMessage('Please enter a valid phone number.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.signUpDonor({
        email,
        password: signUpPassword,
        name,
        age: Number(age),
        gender,
        bloodGroup,
        phone,
        city,
        eligible,
        recentIllness
      });

      if (res.success && res.user) {
        setSuccessMessage('Donor account created successfully! You are now logged in.');
        confetti({ particleCount: 80, spread: 100, origin: { y: 0.6 } });
        setTimeout(() => {
          onAuthSuccess(res.user!);
          onClose();
        }, 800);
      } else {
        setErrorMessage(res.message || 'Registration failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error during donor registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await authService.signUpHospital({
        email,
        password: signUpPassword,
        hospitalName,
        username: hospitalUsernameInput,
        phone: hospitalPhone,
        city: hospitalCity,
        address: hospitalAddress
      });

      if (res.success && res.user) {
        setSuccessMessage('Hospital account registered! You can now search for compatible donors.');
        confetti({ particleCount: 80, spread: 100, origin: { y: 0.6 } });
        setTimeout(() => {
          onAuthSuccess(res.user!);
          onClose();
        }, 800);
      } else {
        setErrorMessage(res.message || 'Registration failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Hospital registration error.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoDonor = (emailVal: string, passVal: string, phoneVal: string) => {
    setLoginEmail(emailVal);
    setLoginPassword(passVal);
    setDonorPhone(phoneVal);
  };

  const fillDemoHospital = (userVal: string, passVal: string) => {
    setHospitalUsername(userVal);
    setLoginPassword(passVal);
    setLoginEmail('admin@citycare.org');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-700 to-rose-600 px-6 py-5 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {activeTab === 'login' ? 'Account Authentication' : 'Create an Account'}
              </h2>
              <p className="text-xs text-red-100">
                Blood Donation & Compatibility System
              </p>
            </div>
          </div>

          {/* Tab Selector: Login vs Sign Up */}
          <div className="flex bg-black/20 p-1 rounded-xl mt-4">
            <button
              onClick={() => { setActiveTab('login'); setErrorMessage(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-red-100 hover:text-white'
              }`}
            >
              Sign In / Log In
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setErrorMessage(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'signup'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-red-100 hover:text-white'
              }`}
            >
              New Registration (Sign Up)
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ======================= LOGIN VIEW ======================= */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              {/* Login Method Sub-tabs */}
              <div className="flex gap-1 border-b border-slate-200 pb-2 text-xs">
                <button
                  type="button"
                  onClick={() => setLoginMethod('email-pass')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    loginMethod === 'email-pass'
                      ? 'bg-red-50 text-red-700 font-semibold border border-red-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Email & Password (Secure)
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('donor-servlet')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    loginMethod === 'donor-servlet'
                      ? 'bg-red-50 text-red-700 font-semibold border border-red-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="DonorLoginServlet.java mode"
                >
                  Donor Phone & Email
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('hospital-servlet')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    loginMethod === 'hospital-servlet'
                      ? 'bg-red-50 text-red-700 font-semibold border border-red-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="HospitalLoginServlet.java mode"
                >
                  Hospital Login
                </button>
              </div>

              {/* 1. Secure Email & Password Form */}
              {loginMethod === 'email-pass' && (
                <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Password
                      </label>
                      <span className="text-[11px] text-slate-400">Encrypted via PBKDF2</span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full pl-9 pr-10 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors shadow-xs shadow-red-200"
                  >
                    {loading ? 'Authenticating...' : 'Sign In Securely'}
                  </button>
                </form>
              )}

              {/* 2. DonorLoginServlet.java mode (email + phone) */}
              {loginMethod === 'donor-servlet' && (
                <form onSubmit={handleDonorServletLogin} className="space-y-4">
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
                    <span className="font-semibold">DonorLoginServlet:</span> Authenticates using donor email and registered phone number from MySQL <code className="bg-amber-100 px-1 py-0.5 rounded">donors</code> table.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Registered Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        placeholder="priya.sharma@example.com"
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={donorPhone}
                        onChange={e => setDonorPhone(e.target.value)}
                        placeholder="9876543210"
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors"
                  >
                    {loading ? 'Verifying...' : 'Login as Donor'}
                  </button>
                </form>
              )}

              {/* 3. HospitalLoginServlet.java mode */}
              {loginMethod === 'hospital-servlet' && (
                <form onSubmit={handleHospitalServletLogin} className="space-y-4">
                  <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-[11px] text-blue-800">
                    <span className="font-semibold">HospitalLoginServlet:</span> Authenticates using hospital username and password against <code className="bg-blue-100 px-1 py-0.5 rounded">hospitals</code> table.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hospital Username
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={hospitalUsername}
                        onChange={e => setHospitalUsername(e.target.value)}
                        placeholder="citycare"
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hospital Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="hospital123"
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors"
                  >
                    {loading ? 'Logging in...' : 'Login to Hospital Portal'}
                  </button>
                </form>
              )}

              {/* Quick Demo Credentials */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Quick Demo Accounts (1-Click Fill):
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      fillDemoDonor('priya.sharma@example.com', 'Donor@123', '9876543210');
                    }}
                    className="p-2 text-left bg-slate-50 hover:bg-red-50 hover:border-red-200 border border-slate-200 rounded-lg transition-colors"
                  >
                    <div className="font-semibold text-slate-900 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      Priya (Donor O-)
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">priya.sharma@example.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      fillDemoHospital('citycare', 'hospital123');
                    }}
                    className="p-2 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-lg transition-colors"
                  >
                    <div className="font-semibold text-slate-900 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      City Care Hospital
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">User: citycare / hosp123</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================= SIGN UP VIEW ======================= */}
          {activeTab === 'signup' && (
            <div className="space-y-4">
              {/* Account Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Register As:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignUpRole('donor')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                      signUpRole === 'donor'
                        ? 'border-red-600 bg-red-50 text-red-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Heart className="w-4 h-4 text-red-600" />
                    <span>Blood Donor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignUpRole('hospital')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                      signUpRole === 'hospital'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Hospital / Blood Bank</span>
                  </button>
                </div>
              </div>

              {/* Donor Sign Up Form (Implements DonorRegistrationServlet.java + Password) */}
              {signUpRole === 'donor' && (
                <form onSubmit={handleDonorSignUp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      required
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Age *
                      </label>
                      <input
                        type="number"
                        min="18"
                        max="65"
                        value={age}
                        onChange={e => setAge(Number(e.target.value))}
                        required
                        className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Gender *
                      </label>
                      <select
                        value={gender}
                        onChange={e => setGender(e.target.value as any)}
                        className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Blood Group *
                      </label>
                      <select
                        value={bloodGroup}
                        onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                        className="w-full px-2 py-1.5 text-sm font-bold text-red-700 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                      >
                        {ALL_BLOOD_GROUPS.map(bg => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        required
                        className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="e.g. Mumbai"
                        required
                        className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="ramesh@example.com"
                      required
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Set Secure Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signUpPassword}
                        onChange={e => setSignUpPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        minLength={6}
                        required
                        className="w-full pl-9 pr-10 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Health Eligibility Checklist from Servlet */}
                  <div className="p-3 bg-red-50/60 rounded-xl border border-red-100 space-y-2">
                    <span className="text-[11px] font-bold text-red-900 block">
                      Medical Donor Screening:
                    </span>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">
                          Eligible to Donate?
                        </label>
                        <select
                          value={eligible}
                          onChange={e => setEligible(e.target.value as 'YES' | 'NO')}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                        >
                          <option value="YES">Eligible - YES</option>
                          <option value="NO">Not Eligible - NO</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-slate-700 mb-1">
                          Recent Illness (14 days)?
                        </label>
                        <select
                          value={recentIllness}
                          onChange={e => setRecentIllness(e.target.value as 'YES' | 'NO')}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                        >
                          <option value="NO">Recent Illness - NO</option>
                          <option value="YES">Recent Illness - YES</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors shadow-xs shadow-red-200"
                  >
                    {loading ? 'Creating Donor Profile...' : 'Complete Donor Registration'}
                  </button>
                </form>
              )}

              {/* Hospital Sign Up Form */}
              {signUpRole === 'hospital' && (
                <form onSubmit={handleHospitalSignUp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hospital / Blood Bank Name *
                    </label>
                    <input
                      type="text"
                      value={hospitalName}
                      onChange={e => setHospitalName(e.target.value)}
                      placeholder="e.g. LifeLine Trauma Center"
                      required
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Portal Username *
                      </label>
                      <input
                        type="text"
                        value={hospitalUsernameInput}
                        onChange={e => setHospitalUsernameInput(e.target.value)}
                        placeholder="lifelinecare"
                        required
                        className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={hospitalCity}
                        onChange={e => setHospitalCity(e.target.value)}
                        placeholder="Mumbai"
                        required
                        className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Official Email *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="bloodbank@lifeline.org"
                        required
                        className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        value={hospitalPhone}
                        onChange={e => setHospitalPhone(e.target.value)}
                        placeholder="+91 22 2345 6789"
                        required
                        className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Physical Address
                    </label>
                    <input
                      type="text"
                      value={hospitalAddress}
                      onChange={e => setHospitalAddress(e.target.value)}
                      placeholder="Hospital complex, Road 4"
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Set Password *
                    </label>
                    <input
                      type="password"
                      value={signUpPassword}
                      onChange={e => setSignUpPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      minLength={6}
                      required
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors shadow-xs shadow-blue-200"
                  >
                    {loading ? 'Registering Hospital...' : 'Register Hospital'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Security guarantee footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>PBKDF2-SHA256 (100k rounds) Salted Hashing</span>
            </div>
            <span>TLS / Session Guard</span>
          </div>
        </div>
      </div>
    </div>
  );
};
