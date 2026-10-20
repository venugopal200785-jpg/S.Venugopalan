export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type EligibilityStatus = 'YES' | 'NO';
export type IllnessStatus = 'YES' | 'NO';
export type RequestStatus = 'PENDING' | 'IN PROGRESS' | 'FULFILLED' | 'CANCELLED';

export interface Donor {
  donor_id: number;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  blood_group: BloodGroup;
  phone: string;
  email: string;
  city: string;
  eligible: EligibilityStatus;
  recent_illness: IllnessStatus;
  registered_at?: string;
}

export interface Hospital {
  hospital_id: number;
  hospital_name: string;
  username: string;
  password?: string;
  city: string;
  phone: string;
  address?: string;
}

export interface Recipient {
  recipientId: number;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: BloodGroup;
  phone: string;
  email: string;
  city: string;
  hospital_id?: number;
}

export interface BloodRequest {
  request_id: number;
  recipient_id: number;
  recipient_name?: string;
  hospital_id?: number;
  hospital_name?: string;
  required_blood_group: BloodGroup;
  units_required: number;
  request_date: string;
  status: RequestStatus;
  urgency?: 'Normal' | 'Urgent' | 'Critical';
  notes?: string;
}

export interface SqlLogEntry {
  id: string;
  timestamp: string;
  servletName: string;
  action: string;
  sqlQuery: string;
  params: Record<string, string | number>;
  status: 'SUCCESS' | 'ERROR';
  rowsAffected?: number;
}
