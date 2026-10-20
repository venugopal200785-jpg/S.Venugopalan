import { BloodGroup } from '../types/blood-donation';

/**
 * Blood group compatibility mapping strictly adhering to DonorSearchServlet.java:
 * 
 * if (bloodGroup.equalsIgnoreCase("A+")) {
 *     compatibleGroups = "'A+','A-','O+','O-'";
 * } else if (bloodGroup.equalsIgnoreCase("A-")) {
 *     compatibleGroups = "'A-','O-'";
 * } else if (bloodGroup.equalsIgnoreCase("B+")) {
 *     compatibleGroups = "'B+','B-','O+','O-'";
 * } else if (bloodGroup.equalsIgnoreCase("B-")) {
 *     compatibleGroups = "'B-','O-'";
 * } else if (bloodGroup.equalsIgnoreCase("AB+")) {
 *     compatibleGroups = "'A+','A-','B+','B-','AB+','AB-','O+','O-'";
 * } else if (bloodGroup.equalsIgnoreCase("AB-")) {
 *     compatibleGroups = "'A-','B-','AB-','O-'";
 * } else if (bloodGroup.equalsIgnoreCase("O+")) {
 *     compatibleGroups = "'O+','O-'";
 * } else if (bloodGroup.equalsIgnoreCase("O-")) {
 *     compatibleGroups = "'O-'";
 * }
 */
export const COMPATIBLE_DONORS_MAP: Record<BloodGroup, BloodGroup[]> = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-']
};

/**
 * Reverse mapping: Which recipient blood groups can this donor group donate to?
 */
export const CAN_DONATE_TO_MAP: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal Donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'] // Universal Recipient
};

export const ALL_BLOOD_GROUPS: BloodGroup[] = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

export function getCompatibleDonorGroups(recipientGroup: BloodGroup): BloodGroup[] {
  return COMPATIBLE_DONORS_MAP[recipientGroup] || [];
}

export function getCanDonateToGroups(donorGroup: BloodGroup): BloodGroup[] {
  return CAN_DONATE_TO_MAP[donorGroup] || [];
}

export function isDonorCompatible(donorGroup: BloodGroup, recipientGroup: BloodGroup): boolean {
  const compatible = COMPATIBLE_DONORS_MAP[recipientGroup];
  return compatible ? compatible.includes(donorGroup) : false;
}

export function getBloodGroupFacts(group: BloodGroup): {
  badgeColor: string;
  isUniversalDonor: boolean;
  isUniversalRecipient: boolean;
  description: string;
} {
  const isUniversalDonor = group === 'O-';
  const isUniversalRecipient = group === 'AB+';

  let description = '';
  if (isUniversalDonor) {
    description = 'Universal Red Blood Cell Donor: can donate to ANY blood group in emergencies!';
  } else if (isUniversalRecipient) {
    description = 'Universal Red Blood Cell Recipient: can safely receive red blood cells from ANY blood group!';
  } else if (group === 'O+') {
    description = 'Most common blood group globally; can donate to all positive blood types (O+, A+, B+, AB+).';
  } else if (group === 'A+') {
    description = 'Second most common blood group; can receive from A+, A-, O+, and O-.';
  } else if (group === 'B+') {
    description = 'Common blood group; can receive from B+, B-, O+, and O-.';
  } else if (group.endsWith('-')) {
    description = 'Rare Rh-negative blood; highly critical for matching Rh-negative patients.';
  } else {
    description = `Can receive from ${COMPATIBLE_DONORS_MAP[group].join(', ')}.`;
  }

  const badgeColor = isUniversalDonor
    ? 'bg-amber-600 text-white'
    : isUniversalRecipient
    ? 'bg-purple-600 text-white'
    : group.endsWith('+')
    ? 'bg-red-700 text-white'
    : 'bg-rose-800 text-white';

  return {
    badgeColor,
    isUniversalDonor,
    isUniversalRecipient,
    description
  };
}
