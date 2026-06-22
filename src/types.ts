// ════════════════════════════════════════════════════════════
// ROLES & PERMISSIONS
// ════════════════════════════════════════════════════════════

export type UserRole = 'VISITOR' | 'CLIENT' | 'HOTEL' | 'SUPER_ADMIN';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  VISITOR: 0,
  CLIENT: 1,
  HOTEL: 2,
  SUPER_ADMIN: 3,
};

// Mapping pour affichage
export const ROLE_LABELS: Record<UserRole, string> = {
  VISITOR: 'Visiteur',
  CLIENT: 'Client',
  HOTEL: 'Hôtel',
  SUPER_ADMIN: 'Super Administrateur',
};

// ════════════════════════════════════════════════════════════
// ENUMS MÉTIER (alignés avec backend)
// ════════════════════════════════════════════════════════════

export type OrderStatus =
  | 'PREPARATION'
  | 'QUALITY_CHECK'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED';

export type RoomStatus =
  | 'VACANT'
  | 'OCCUPIED'
  | 'CLEANING'
  | 'MAINTENANCE';

export type AuditStatus = 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT';

// ════════════════════════════════════════════════════════════
// ENTITIES
// ════════════════════════════════════════════════════════════

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  hotelId?: string | null;
  currentRoomId?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  city?: string;
  address?: string;
  phone?: string;
  isActive: boolean;
}

export interface Room {
  id: string;
  hotelId: string;
  number: string;
  floor: number;
  type: string;
  status: RoomStatus;
}

export interface RoomOrder {
  id: string;
  orderRef: string;
  hotelId: string;
  guestId?: string;
  guestName: string;
  roomNumber: string;
  status: OrderStatus;
  priority: 'low' | 'normal' | 'high';
  notes?: string;
  subtotal: number;
  vat: number;
  serviceCharge: number;
  total: number;
  items?: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  courseCode: string;
  name: string;
  quantity: number;
  price: number;
}

export interface StaffMember {
  id: string;
  hotelId: string;
  name: string;
  email?: string;
  username?: string;
  role: string;
  department: string;
  clearanceLevel: number;
  active: boolean;
  lastAccess?: string;
}

export interface VaultDocument {
  id: string;
  hotelId: string;
  docRef: string;
  name: string;
  category: string;
  owner: string;
  room: string;
  fingerprint: boolean;
  depositDate: string;
  withdrawnAt?: string;
}

export interface PricingRule {
  id: string;
  hotelId: string;
  ruleRef: string;
  suite: string;
  basePrice: number;
  channelMultipliers: Record<string, number>;
  lastSync: string;
  status: 'synced' | 'pending' | 'error';
}

export interface SuiteControl {
  id: string;
  hotelId: string;
  roomId: string;
  lights: boolean;
  climate: number;
  curtains: 'open' | 'half' | 'closed';
  music: boolean;
  musicVolume: number;
  doNotDisturb: boolean;
  room?: Room;
}

export interface AuditLog {
  id: string;
  logId: string;
  hotelId?: string;
  userId?: string;
  userName: string;
  timestamp: string;
  action: string;
  reason: string;
  previousHash: string;
  hash: string;
  status: AuditStatus;
}
