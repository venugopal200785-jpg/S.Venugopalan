import { BloodGroup, Donor, Hospital } from '../types/blood-donation';
import { dbService } from './storage';

export type UserRole = 'donor' | 'hospital' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  salt: string;
  passwordHash: string; // PBKDF2-SHA256
  createdAt: string;
  lastLogin: string;
  donorId?: number;
  hospitalId?: number;
  avatarUrl?: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  expiresAt: number;
}

const USERS_STORAGE_KEY = 'bds_secure_users_v1';
const SESSION_STORAGE_KEY = 'bds_auth_session_v1';

// Convert Uint8Array to hex string
function toHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert hex string to Uint8Array
function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Generate random cryptographic salt
function generateSalt(): string {
  const salt = new Uint8Array(16);
  window.crypto.getRandomValues(salt);
  return toHex(salt);
}

// PBKDF2-SHA256 password hashing
export async function hashPassword(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const saltBytes = fromHex(saltHex);
  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const exported = await window.crypto.subtle.exportKey('raw', derivedKey);
  return toHex(new Uint8Array(exported));
}

// Generate cryptographically secure session token
function generateSessionToken(): string {
  const randomBytes = new Uint8Array(32);
  window.crypto.getRandomValues(randomBytes);
  return toHex(randomBytes);
}

export interface SignUpDonorPayload {
  email: string;
  password: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: BloodGroup;
  phone: string;
  city: string;
  eligible: 'YES' | 'NO';
  recentIllness: 'YES' | 'NO';
}

export interface SignUpHospitalPayload {
  email: string;
  password: string;
  hospitalName: string;
  username: string;
  phone: string;
  city: string;
  address: string;
}

class AuthService {
  private users: AuthUser[] = [];
  private currentSession: AuthSession | null = null;
  private initialized = false;

  constructor() {
    this.init();
  }

  private async init() {
    if (this.initialized) return;
    this.initialized = true;

    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        this.users = JSON.parse(stored);
      } else {
        await this.seedDefaultUsers();
      }

      const sessionStored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (sessionStored) {
        const session = JSON.parse(sessionStored) as AuthSession;
        if (session.expiresAt > Date.now()) {
          this.currentSession = session;
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch (e) {
      console.error('Failed to init auth', e);
    }
  }

  private async seedDefaultUsers() {
    // Seed 1 default donor user (Priya Sharma) and 1 hospital user (City Care Hospital)
    const donorSalt = generateSalt();
    const donorHash = await hashPassword('Donor@123', donorSalt);

    const hospitalSalt = generateSalt();
    const hospitalHash = await hashPassword('hospital123', hospitalSalt);

    this.users = [
      {
        id: 'usr_donor_1',
        email: 'priya.sharma@example.com',
        name: 'Priya Sharma',
        role: 'donor',
        salt: donorSalt,
        passwordHash: donorHash,
        createdAt: '2026-09-12T10:00:00.000Z',
        lastLogin: new Date().toISOString(),
        donorId: 1
      },
      {
        id: 'usr_hosp_1',
        email: 'admin@citycare.org',
        name: 'City Care Multispeciality Hospital',
        role: 'hospital',
        salt: hospitalSalt,
        passwordHash: hospitalHash,
        createdAt: '2026-08-01T10:00:00.000Z',
        lastLogin: new Date().toISOString(),
        hospitalId: 1
      }
    ];

    this.saveUsers();
  }

  private saveUsers() {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  }

  public getUsers(): AuthUser[] {
    return this.users;
  }

  public getCurrentUser(): AuthUser | null {
    if (!this.currentSession || this.currentSession.expiresAt <= Date.now()) {
      return null;
    }
    return this.users.find(u => u.id === this.currentSession?.userId) || null;
  }

  public async signUpDonor(payload: SignUpDonorPayload): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
    await this.init();

    const normalizedEmail = payload.email.trim().toLowerCase();
    if (this.users.some(u => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, message: 'An account with this email already exists. Please log in.' };
    }

    if (payload.password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    // 1. Register donor into Database (donors table)
    const regResult = dbService.registerDonor({
      name: payload.name,
      age: payload.age,
      gender: payload.gender,
      blood_group: payload.bloodGroup,
      phone: payload.phone,
      email: payload.email,
      city: payload.city,
      eligible: payload.eligible,
      recent_illness: payload.recentIllness
    });

    if (!regResult.success || !regResult.donor) {
      return { success: false, message: regResult.message || 'Donor registration failed.' };
    }

    // 2. Hash password with unique salt
    const salt = generateSalt();
    const passwordHash = await hashPassword(payload.password, salt);

    const newUser: AuthUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      email: normalizedEmail,
      name: payload.name,
      role: 'donor',
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      donorId: regResult.donor.donor_id
    };

    this.users.push(newUser);
    this.saveUsers();

    // 3. Auto create session
    this.createSession(newUser.id);
    dbService.setActiveDonor(regResult.donor);

    return { success: true, user: newUser };
  }

  public async signUpHospital(payload: SignUpHospitalPayload): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
    await this.init();

    const normalizedEmail = payload.email.trim().toLowerCase();
    if (this.users.some(u => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, message: 'An account with this email already exists. Please log in.' };
    }

    if (payload.password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    // Add hospital to hospitals table
    const hospitals = dbService.getHospitals();
    const newHospId = hospitals.length > 0 ? Math.max(...hospitals.map(h => h.hospital_id)) + 1 : 1;
    const newHospital: Hospital = {
      hospital_id: newHospId,
      hospital_name: payload.hospitalName,
      username: payload.username.trim().toLowerCase(),
      password: payload.password, // backward compatibility with hospitalLogin Servlet
      city: payload.city,
      phone: payload.phone,
      address: payload.address
    };
    hospitals.push(newHospital);
    localStorage.setItem('bds_hospitals_v1', JSON.stringify(hospitals));

    // Hash password with unique salt
    const salt = generateSalt();
    const passwordHash = await hashPassword(payload.password, salt);

    const newUser: AuthUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      email: normalizedEmail,
      name: payload.hospitalName,
      role: 'hospital',
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      hospitalId: newHospId
    };

    this.users.push(newUser);
    this.saveUsers();

    this.createSession(newUser.id);
    dbService.setActiveHospital(newHospital);

    return { success: true, user: newUser };
  }

  public async loginWithPassword(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
    await this.init();

    const normalizedEmail = email.trim().toLowerCase();
    const user = this.users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return { success: false, message: 'No account found with this email. Please check or sign up.' };
    }

    const testHash = await hashPassword(password, user.salt);
    if (testHash !== user.passwordHash) {
      return { success: false, message: 'Incorrect password. Please verify and try again.' };
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    this.saveUsers();

    this.createSession(user.id);

    // Sync active session in dbService
    if (user.role === 'donor' && user.donorId) {
      const donor = dbService.getDonors().find(d => d.donor_id === user.donorId);
      if (donor) dbService.setActiveDonor(donor);
    } else if (user.role === 'hospital' && user.hospitalId) {
      const hospital = dbService.getHospitals().find(h => h.hospital_id === user.hospitalId);
      if (hospital) dbService.setActiveHospital(hospital);
    }

    return { success: true, user };
  }

  public createSession(userId: string): AuthSession {
    const session: AuthSession = {
      token: generateSessionToken(),
      userId,
      // 7 days expiration
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
    };
    this.currentSession = session;
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error(e);
    }
    return session;
  }

  public logout(): void {
    this.currentSession = null;
    localStorage.removeItem(SESSION_STORAGE_KEY);
    dbService.setActiveDonor(null);
    dbService.setActiveHospital(null);
  }

  public async changePassword(userId: string, oldPass: string, newPass: string): Promise<{ success: boolean; message?: string }> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return { success: false, message: 'User not found.' };

    const oldHash = await hashPassword(oldPass, user.salt);
    if (oldHash !== user.passwordHash) {
      return { success: false, message: 'Current password does not match.' };
    }

    if (newPass.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters.' };
    }

    const newSalt = generateSalt();
    const newHash = await hashPassword(newPass, newSalt);
    user.salt = newSalt;
    user.passwordHash = newHash;
    this.saveUsers();

    return { success: true, message: 'Password updated successfully!' };
  }
}

export const authService = new AuthService();
