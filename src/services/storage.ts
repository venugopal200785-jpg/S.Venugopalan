import {
  Donor,
  Hospital,
  Recipient,
  BloodRequest,
  SqlLogEntry,
  BloodGroup
} from '../types/blood-donation';
import { getCompatibleDonorGroups } from '../utils/compatibility';

const STORAGE_KEYS = {
  DONORS: 'bds_donors_v1',
  HOSPITALS: 'bds_hospitals_v1',
  RECIPIENTS: 'bds_recipients_v1',
  REQUESTS: 'bds_blood_requests_v1',
  LOGS: 'bds_sql_logs_v1',
  ACTIVE_DONOR: 'bds_active_donor_v1',
  ACTIVE_HOSPITAL: 'bds_active_hospital_v1',
  UI_MODE: 'bds_ui_mode_v1'
};

const INITIAL_DONORS: Donor[] = [
  {
    donor_id: 1,
    name: 'Priya Sharma',
    age: 27,
    gender: 'Female',
    blood_group: 'O-',
    phone: '9876543210',
    email: 'priya.sharma@example.com',
    city: 'Mumbai',
    eligible: 'YES',
    recent_illness: 'NO',
    registered_at: '2026-09-12'
  },
  {
    donor_id: 2,
    name: 'Arjun Patel',
    age: 32,
    gender: 'Male',
    blood_group: 'A+',
    phone: '9845123456',
    email: 'arjun.patel@example.com',
    city: 'Mumbai',
    eligible: 'YES',
    recent_illness: 'NO',
    registered_at: '2026-09-18'
  },
  {
    donor_id: 3,
    name: 'Kavita Nair',
    age: 24,
    gender: 'Female',
    blood_group: 'B+',
    phone: '9812345678',
    email: 'kavita.nair@example.com',
    city: 'Delhi',
    eligible: 'YES',
    recent_illness: 'NO',
    registered_at: '2026-09-25'
  },
  {
    donor_id: 4,
    name: 'Rohan Deshmukh',
    age: 29,
    gender: 'Male',
    blood_group: 'O+',
    phone: '9765432109',
    email: 'rohan.deshmukh@example.com',
    city: 'Pune',
    eligible: 'YES',
    recent_illness: 'NO',
    registered_at: '2026-10-01'
  },
  {
    donor_id: 5,
    name: 'Dr. Sneha Verma',
    age: 35,
    gender: 'Female',
    blood_group: 'AB+',
    phone: '9923456789',
    email: 'sneha.verma@example.com',
    city: 'Bangalore',
    eligible: 'YES',
    recent_illness: 'NO',
    registered_at: '2026-10-04'
  },
  {
    donor_id: 6,
    name: 'Vikram Singh',
    age: 40,
    gender: 'Male',
    blood_group: 'A-',
    phone: '9834567890',
    email: 'vikram.singh@example.com',
    city: 'Mumbai',
    eligible: 'YES',
    recent_illness: 'NO',
    registered_at: '2026-10-08'
  },
  {
    donor_id: 7,
    name: 'Ananya Roy',
    age: 22,
    gender: 'Female',
    blood_group: 'B-',
    phone: '9890123456',
    email: 'ananya.roy@example.com',
    city: 'Kolkata',
    eligible: 'YES',
    recent_illness: 'NO',
    registered_at: '2026-10-10'
  },
  {
    donor_id: 8,
    name: 'Rahul Khanna',
    age: 28,
    gender: 'Male',
    blood_group: 'O+',
    phone: '9789012345',
    email: 'rahul.khanna@example.com',
    city: 'Delhi',
    eligible: 'NO', // Ineligible test case
    recent_illness: 'NO',
    registered_at: '2026-10-11'
  },
  {
    donor_id: 9,
    name: 'Meera Iyer',
    age: 31,
    gender: 'Female',
    blood_group: 'AB-',
    phone: '9712345678',
    email: 'meera.iyer@example.com',
    city: 'Chennai',
    eligible: 'YES',
    recent_illness: 'YES', // Recent illness test case (should be filtered out by search)
    registered_at: '2026-10-14'
  },
  {
    donor_id: 10,
    name: 'Deepak Joshi',
    age: 26,
    gender: 'Male',
    blood_group: 'O-',
    phone: '9654321098',
    email: 'deepak.joshi@example.com',
    city: 'Delhi',
    eligible: 'YES',
    recent_illness: 'NO',
    registered_at: '2026-10-15'
  }
];

const INITIAL_HOSPITALS: Hospital[] = [
  {
    hospital_id: 1,
    hospital_name: 'City Care Multispeciality Hospital',
    username: 'citycare',
    password: 'hospital123',
    city: 'Mumbai',
    phone: '+91 22 2456 7890',
    address: '42 Medical Enclave, Dadar, Mumbai'
  },
  {
    hospital_id: 2,
    hospital_name: 'Metro Apex Healthcare & Trauma Center',
    username: 'metrohealth',
    password: 'metro123',
    city: 'Delhi',
    phone: '+91 11 2678 9012',
    address: '15 Ring Road, Connaught Place, New Delhi'
  },
  {
    hospital_id: 3,
    hospital_name: 'St. Jude Community Blood Bank',
    username: 'stjude',
    password: 'bloodbank123',
    city: 'Bangalore',
    phone: '+91 80 2345 6789',
    address: '88 Indira Nagar, Bangalore'
  }
];

const INITIAL_RECIPIENTS: Recipient[] = [
  {
    recipientId: 101,
    name: 'Rajesh Mukherjee',
    age: 46,
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '9820011223',
    email: 'rajesh.m@example.com',
    city: 'Mumbai',
    hospital_id: 1
  },
  {
    recipientId: 102,
    name: 'Baby Sunita',
    age: 6,
    gender: 'Female',
    bloodGroup: 'O-',
    phone: '9833344556',
    email: 'guardian.sunita@example.com',
    city: 'Delhi',
    hospital_id: 2
  },
  {
    recipientId: 103,
    name: 'Amitabh Sengupta',
    age: 58,
    gender: 'Male',
    bloodGroup: 'A+',
    phone: '9877788990',
    email: 'amitabh.s@example.com',
    city: 'Mumbai',
    hospital_id: 1
  },
  {
    recipientId: 104,
    name: 'Fatima Sheikh',
    age: 33,
    gender: 'Female',
    bloodGroup: 'AB-',
    phone: '9811122334',
    email: 'fatima.sheikh@example.com',
    city: 'Bangalore',
    hospital_id: 3
  }
];

const INITIAL_REQUESTS: BloodRequest[] = [
  {
    request_id: 201,
    recipient_id: 101,
    recipient_name: 'Rajesh Mukherjee',
    hospital_id: 1,
    hospital_name: 'City Care Multispeciality Hospital',
    required_blood_group: 'B+',
    units_required: 2,
    request_date: '2026-10-18',
    status: 'PENDING',
    urgency: 'Urgent',
    notes: 'Urgent cardiac bypass surgery scheduled'
  },
  {
    request_id: 202,
    recipient_id: 102,
    recipient_name: 'Baby Sunita',
    hospital_id: 2,
    hospital_name: 'Metro Apex Healthcare & Trauma Center',
    required_blood_group: 'O-',
    units_required: 1,
    request_date: '2026-10-19',
    status: 'PENDING',
    urgency: 'Critical',
    notes: 'Emergency pediatric thalassemia transfusion'
  },
  {
    request_id: 203,
    recipient_id: 103,
    recipient_name: 'Amitabh Sengupta',
    hospital_id: 1,
    hospital_name: 'City Care Multispeciality Hospital',
    required_blood_group: 'A+',
    units_required: 3,
    request_date: '2026-10-15',
    status: 'FULFILLED',
    urgency: 'Normal',
    notes: 'Orthopedic hip replacement donor received'
  }
];

class DatabaseService {
  private getStorage<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return fallback;
      return JSON.parse(data) as T;
    } catch {
      return fallback;
    }
  }

  private setStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Storage error', e);
    }
  }

  constructor() {
    this.initIfEmpty();
  }

  public initIfEmpty(forceReset = false): void {
    if (forceReset || !localStorage.getItem(STORAGE_KEYS.DONORS)) {
      this.setStorage(STORAGE_KEYS.DONORS, INITIAL_DONORS);
    }
    if (forceReset || !localStorage.getItem(STORAGE_KEYS.HOSPITALS)) {
      this.setStorage(STORAGE_KEYS.HOSPITALS, INITIAL_HOSPITALS);
    }
    if (forceReset || !localStorage.getItem(STORAGE_KEYS.RECIPIENTS)) {
      this.setStorage(STORAGE_KEYS.RECIPIENTS, INITIAL_RECIPIENTS);
    }
    if (forceReset || !localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
      this.setStorage(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    }
    if (forceReset || !localStorage.getItem(STORAGE_KEYS.LOGS)) {
      const sampleLog: SqlLogEntry = {
        id: 'log-init',
        timestamp: new Date().toLocaleTimeString(),
        servletName: 'DatabaseConnection.java',
        action: 'DB_INITIALIZE',
        sqlQuery: 'jdbc:mysql://localhost:3306/blood_donation initialized',
        params: { tables: 'donors, hospitals, recipients, blood_requests' },
        status: 'SUCCESS',
        rowsAffected: 0
      };
      this.setStorage(STORAGE_KEYS.LOGS, [sampleLog]);
    }
  }

  // --- SQL LOGGING (Simulating Java PreparedStatement executions) ---
  public logSql(entry: Omit<SqlLogEntry, 'id' | 'timestamp'>): void {
    const logs = this.getStorage<SqlLogEntry[]>(STORAGE_KEYS.LOGS, []);
    const newEntry: SqlLogEntry = {
      ...entry,
      id: 'sql_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString()
    };
    logs.unshift(newEntry);
    // Keep max 50 logs
    this.setStorage(STORAGE_KEYS.LOGS, logs.slice(0, 50));
  }

  public getSqlLogs(): SqlLogEntry[] {
    return this.getStorage<SqlLogEntry[]>(STORAGE_KEYS.LOGS, []);
  }

  public clearSqlLogs(): void {
    this.setStorage(STORAGE_KEYS.LOGS, []);
  }

  // --- DONORS (DonorRegistrationServlet.java & DonorLoginServlet.java) ---
  public getDonors(): Donor[] {
    return this.getStorage<Donor[]>(STORAGE_KEYS.DONORS, INITIAL_DONORS);
  }

  public registerDonor(donorData: Omit<Donor, 'donor_id'>): { success: boolean; donor?: Donor; message?: string } {
    const donors = this.getDonors();
    
    // Check if email already registered
    const exists = donors.find(d => d.email.toLowerCase() === donorData.email.toLowerCase());
    if (exists) {
      this.logSql({
        servletName: 'DonorRegistrationServlet.java',
        action: 'INSERT_DONOR_FAILED',
        sqlQuery: 'INSERT INTO donors (name, age, gender, blood_group, phone, email, city, eligible, recent_illness) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        params: { email: donorData.email, error: 'Email already exists' },
        status: 'ERROR'
      });
      return { success: false, message: 'Donor with this email is already registered.' };
    }

    const newId = donors.length > 0 ? Math.max(...donors.map(d => d.donor_id)) + 1 : 1;
    const newDonor: Donor = {
      ...donorData,
      donor_id: newId,
      registered_at: new Date().toISOString().split('T')[0]
    };

    donors.push(newDonor);
    this.setStorage(STORAGE_KEYS.DONORS, donors);

    this.logSql({
      servletName: 'DonorRegistrationServlet.java',
      action: 'INSERT_DONOR',
      sqlQuery: 'INSERT INTO donors (name, age, gender, blood_group, phone, email, city, eligible, recent_illness) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      params: {
        1: newDonor.name,
        2: newDonor.age,
        3: newDonor.gender,
        4: newDonor.blood_group,
        5: newDonor.phone,
        6: newDonor.email,
        7: newDonor.city,
        8: newDonor.eligible,
        9: newDonor.recent_illness
      },
      status: 'SUCCESS',
      rowsAffected: 1
    });

    return { success: true, donor: newDonor };
  }

  public donorLogin(email: string, phone: string): { success: boolean; donor?: Donor; message?: string } {
    const donors = this.getDonors();
    const donor = donors.find(
      d => d.email.trim().toLowerCase() === email.trim().toLowerCase() && d.phone.trim() === phone.trim()
    );

    if (donor) {
      this.logSql({
        servletName: 'DonorLoginServlet.java',
        action: 'SELECT_DONOR_LOGIN',
        sqlQuery: 'SELECT * FROM donors WHERE email = ? AND phone = ?',
        params: { 1: email, 2: phone },
        status: 'SUCCESS',
        rowsAffected: 1
      });
      this.setActiveDonor(donor);
      return { success: true, donor };
    } else {
      this.logSql({
        servletName: 'DonorLoginServlet.java',
        action: 'SELECT_DONOR_LOGIN',
        sqlQuery: 'SELECT * FROM donors WHERE email = ? AND phone = ?',
        params: { 1: email, 2: phone },
        status: 'ERROR',
        rowsAffected: 0
      });
      return { success: false, message: 'Invalid donor email or phone number. Please verify and try again.' };
    }
  }

  public updateDonorStatus(donorId: number, eligible: 'YES' | 'NO', recentIllness: 'YES' | 'NO'): boolean {
    const donors = this.getDonors();
    const idx = donors.findIndex(d => d.donor_id === donorId);
    if (idx !== -1) {
      donors[idx].eligible = eligible;
      donors[idx].recent_illness = recentIllness;
      this.setStorage(STORAGE_KEYS.DONORS, donors);

      this.logSql({
        servletName: 'DonorProfileServlet',
        action: 'UPDATE_DONOR_STATUS',
        sqlQuery: 'UPDATE donors SET eligible = ?, recent_illness = ? WHERE donor_id = ?',
        params: { 1: eligible, 2: recentIllness, 3: donorId },
        status: 'SUCCESS',
        rowsAffected: 1
      });

      const active = this.getActiveDonor();
      if (active && active.donor_id === donorId) {
        this.setActiveDonor(donors[idx]);
      }
      return true;
    }
    return false;
  }

  public getActiveDonor(): Donor | null {
    return this.getStorage<Donor | null>(STORAGE_KEYS.ACTIVE_DONOR, null);
  }

  public setActiveDonor(donor: Donor | null): void {
    if (donor) {
      this.setStorage(STORAGE_KEYS.ACTIVE_DONOR, donor);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_DONOR);
    }
  }

  // --- HOSPITALS (HospitalLoginServlet.java) ---
  public getHospitals(): Hospital[] {
    return this.getStorage<Hospital[]>(STORAGE_KEYS.HOSPITALS, INITIAL_HOSPITALS);
  }

  public hospitalLogin(username: string, password: string): { success: boolean; hospital?: Hospital; message?: string } {
    const hospitals = this.getHospitals();
    const hospital = hospitals.find(
      h => h.username.trim().toLowerCase() === username.trim().toLowerCase() && h.password === password.trim()
    );

    if (hospital) {
      this.logSql({
        servletName: 'HospitalLoginServlet.java',
        action: 'SELECT_HOSPITAL_LOGIN',
        sqlQuery: 'SELECT * FROM hospitals WHERE username = ? AND password = ?',
        params: { 1: username, 2: '********' },
        status: 'SUCCESS',
        rowsAffected: 1
      });
      this.setActiveHospital(hospital);
      return { success: true, hospital };
    } else {
      this.logSql({
        servletName: 'HospitalLoginServlet.java',
        action: 'SELECT_HOSPITAL_LOGIN',
        sqlQuery: 'SELECT * FROM hospitals WHERE username = ? AND password = ?',
        params: { 1: username, 2: '********' },
        status: 'ERROR',
        rowsAffected: 0
      });
      return { success: false, message: 'Invalid hospital username or password.' };
    }
  }

  public getActiveHospital(): Hospital | null {
    return this.getStorage<Hospital | null>(STORAGE_KEYS.ACTIVE_HOSPITAL, null);
  }

  public setActiveHospital(hospital: Hospital | null): void {
    if (hospital) {
      this.setStorage(STORAGE_KEYS.ACTIVE_HOSPITAL, hospital);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_HOSPITAL);
    }
  }

  // --- COMPATIBLE DONOR SEARCH (DonorSearchServlet.java) ---
  public searchDonors(requiredBloodGroup: BloodGroup, cityFilter?: string): {
    compatibleGroups: BloodGroup[];
    donors: Donor[];
    queryExecuted: string;
  } {
    const compatibleGroups = getCompatibleDonorGroups(requiredBloodGroup);
    const donors = this.getDonors();

    const formattedGroupsSql = compatibleGroups.map(g => `'${g}'`).join(',');
    const queryExecuted = `SELECT * FROM donors WHERE blood_group IN (${formattedGroupsSql}) AND eligible = 'YES' AND recent_illness = 'NO' ${
      cityFilter && cityFilter !== 'ALL' ? `AND city = '${cityFilter}' ` : ''
    }ORDER BY city, name`;

    const matchingDonors = donors.filter(d => {
      const isGroupCompatible = compatibleGroups.includes(d.blood_group);
      const isEligible = d.eligible === 'YES';
      const noIllness = d.recent_illness === 'NO';
      const matchesCity = !cityFilter || cityFilter === 'ALL' || d.city.toLowerCase() === cityFilter.toLowerCase();
      return isGroupCompatible && isEligible && noIllness && matchesCity;
    });

    // Sort by city, name matching Java code: "ORDER BY city, name"
    matchingDonors.sort((a, b) => {
      const cityCmp = a.city.localeCompare(b.city);
      if (cityCmp !== 0) return cityCmp;
      return a.name.localeCompare(b.name);
    });

    this.logSql({
      servletName: 'DonorSearchServlet.java',
      action: 'SEARCH_DONORS',
      sqlQuery: queryExecuted,
      params: {
        bloodGroup: requiredBloodGroup,
        compatibleGroups: compatibleGroups.join(', '),
        eligible: 'YES',
        recent_illness: 'NO'
      },
      status: 'SUCCESS',
      rowsAffected: matchingDonors.length
    });

    return {
      compatibleGroups,
      donors: matchingDonors,
      queryExecuted
    };
  }

  // --- RECIPIENTS (Recipient.java model) ---
  public getRecipients(): Recipient[] {
    return this.getStorage<Recipient[]>(STORAGE_KEYS.RECIPIENTS, INITIAL_RECIPIENTS);
  }

  public addRecipient(data: Omit<Recipient, 'recipientId'>): Recipient {
    const recipients = this.getRecipients();
    const newId = recipients.length > 0 ? Math.max(...recipients.map(r => r.recipientId)) + 1 : 101;
    const newRecipient: Recipient = {
      ...data,
      recipientId: newId
    };
    recipients.push(newRecipient);
    this.setStorage(STORAGE_KEYS.RECIPIENTS, recipients);

    this.logSql({
      servletName: 'RecipientManager',
      action: 'INSERT_RECIPIENT',
      sqlQuery: 'INSERT INTO recipients (name, age, gender, blood_group, phone, email, city) VALUES (?, ?, ?, ?, ?, ?, ?)',
      params: {
        1: newRecipient.name,
        2: newRecipient.age,
        3: newRecipient.gender,
        4: newRecipient.bloodGroup,
        5: newRecipient.phone,
        6: newRecipient.email,
        7: newRecipient.city
      },
      status: 'SUCCESS',
      rowsAffected: 1
    });

    return newRecipient;
  }

  // --- BLOOD REQUESTS (BloodRequestServlet.java) ---
  public getBloodRequests(): BloodRequest[] {
    return this.getStorage<BloodRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
  }

  public submitBloodRequest(data: {
    recipientId: number;
    bloodGroup: BloodGroup;
    units: number;
    hospitalId?: number;
    hospitalName?: string;
    urgency?: 'Normal' | 'Urgent' | 'Critical';
    notes?: string;
  }): { success: boolean; request?: BloodRequest; message?: string } {
    const requests = this.getBloodRequests();
    const recipients = this.getRecipients();
    const recipient = recipients.find(r => r.recipientId === data.recipientId);

    const newId = requests.length > 0 ? Math.max(...requests.map(r => r.request_id)) + 1 : 201;
    const today = new Date().toISOString().split('T')[0];

    const newRequest: BloodRequest = {
      request_id: newId,
      recipient_id: data.recipientId,
      recipient_name: recipient ? recipient.name : `Recipient #${data.recipientId}`,
      hospital_id: data.hospitalId || 1,
      hospital_name: data.hospitalName || 'City Care Multispeciality Hospital',
      required_blood_group: data.bloodGroup,
      units_required: data.units,
      request_date: today,
      status: 'PENDING',
      urgency: data.urgency || 'Normal',
      notes: data.notes || ''
    };

    requests.unshift(newRequest);
    this.setStorage(STORAGE_KEYS.REQUESTS, requests);

    // SQL statement from BloodRequestServlet.java:
    // "INSERT INTO blood_requests (recipient_id, required_blood_group, units_required, request_date, status) VALUES (?, ?, ?, CURDATE(), 'PENDING')"
    this.logSql({
      servletName: 'BloodRequestServlet.java',
      action: 'INSERT_BLOOD_REQUEST',
      sqlQuery: 'INSERT INTO blood_requests (recipient_id, required_blood_group, units_required, request_date, status) VALUES (?, ?, ?, CURDATE(), \'PENDING\')',
      params: {
        1: newRequest.recipient_id,
        2: newRequest.required_blood_group,
        3: newRequest.units_required
      },
      status: 'SUCCESS',
      rowsAffected: 1
    });

    return { success: true, request: newRequest };
  }

  public updateRequestStatus(requestId: number, newStatus: 'PENDING' | 'IN PROGRESS' | 'FULFILLED' | 'CANCELLED'): boolean {
    const requests = this.getBloodRequests();
    const idx = requests.findIndex(r => r.request_id === requestId);
    if (idx !== -1) {
      requests[idx].status = newStatus;
      this.setStorage(STORAGE_KEYS.REQUESTS, requests);

      this.logSql({
        servletName: 'BloodRequestServlet.java',
        action: 'UPDATE_REQUEST_STATUS',
        sqlQuery: 'UPDATE blood_requests SET status = ? WHERE request_id = ?',
        params: { 1: newStatus, 2: requestId },
        status: 'SUCCESS',
        rowsAffected: 1
      });
      return true;
    }
    return false;
  }

  // --- UI MODE (Modern vs Classic JSP & CSS) ---
  public getUiMode(): 'modern' | 'classic_jsp' {
    return this.getStorage<'modern' | 'classic_jsp'>(STORAGE_KEYS.UI_MODE, 'modern');
  }

  public setUiMode(mode: 'modern' | 'classic_jsp'): void {
    this.setStorage(STORAGE_KEYS.UI_MODE, mode);
  }
}

export const dbService = new DatabaseService();
