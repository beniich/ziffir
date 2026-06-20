export interface Course {
  code: string;
  name: string;
  category: 'Operations' | 'Gastronomy' | 'Service' | 'Management';
  credits: number;
  grade: string;
  completedDate: string;
}

export interface CertificationItem {
  id: string;
  title: string;
  badge: string;
  authority: string;
  issuedDate: string;
  validUntil: string;
  credentialId: string;
  verifiedHash: string;
  skills: string[];
}

export interface RoomServiceOrder {
  id: string;
  guest: string;
  room: string;
  details: string;
  status: 'Preparation' | 'Quality Check' | 'Out for Delivery' | 'Delivered';
  imgUrl: string;
}

export interface VaultDocument {
  id: string;
  name: string;
  encrypted: boolean;
  decrypting: boolean;
  progress: number;
  securityLevel: string;
}

export type UserRole = 'operator' | 'manager' | 'admin';
export type ThemeMode = 'dark' | 'light';
export type ColorScheme = 'gold' | 'silver' | 'bronze';
export type StyleMode = 'luxe' | 'cyberpunk' | 'standard';

export interface StaffMember {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  shift: string;
  status: 'active' | 'break' | 'off';
  avatar: string;
}

export interface AuditLog {
  id: string;
  timestamp: number | string;
  user: string;
  role: string;
  action: string;
  details: string;
  status?: string;
  hash?: string;
}
