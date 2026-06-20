// src/types/index.ts

export type AuditStatus = 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT';

export type OrderStatus =
  | 'Preparation'
  | 'Quality Check'
  | 'Out for Delivery'
  | 'Delivered';

export type UserRole = 'operator' | 'manager' | 'admin';

export type CourseCategory = 'breakfast' | 'appetizer' | 'main' | 'dessert' | 'beverage';

export type LedgerCategory = 'Operations' | 'Gastronomy' | 'Service' | 'Management';

export type VaultCategory = 'passport' | 'contract' | 'insurance' | 'valuable' | 'other';

export type CurtainPosition = 'open' | 'half' | 'closed';

export type SyncStatus = 'synced' | 'pending' | 'error';

// ════════════════════════════════════════════════════════════
// API Response Types
// ════════════════════════════════════════════════════════════

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
