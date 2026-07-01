export interface Course {
  code: string;
  name: string;
  category: 'Operations' | 'Gastronomy' | 'Service' | 'Management' | 'Accommodation' | 'F&B' | 'Wellness' | 'Conciergerie';
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
