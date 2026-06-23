import {
  canAccessTab,
  canWriteTab,
  isReadOnlyForRole,
  getAccessibleTabs,
  TabKey
} from '../lib/clearance';

describe('🔐 TAB_CLEARANCE Matrix', () => {
  describe('Client access', () => {
    it('CAN access Room Service', () => {
      expect(canAccessTab('room-service', 'CLIENT')).toBe(true);
    });

    it('CANNOT access Channel Sync', () => {
      expect(canAccessTab('channel-sync', 'CLIENT')).toBe(false);
    });

    it('CANNOT access Management', () => {
      expect(canAccessTab('management', 'CLIENT')).toBe(false);
    });

    it('CANNOT write to Ledger (read-only)', () => {
      expect(canWriteTab('ledger', 'CLIENT')).toBe(false);
    });
  });

  describe('Hotel access', () => {
    it('CAN access Channel Sync', () => {
      expect(canAccessTab('channel-sync', 'HOTEL')).toBe(true);
    });

    it('CANNOT access Management (SUPER_ADMIN only)', () => {
      expect(canAccessTab('management', 'HOTEL')).toBe(false);
    });

    it('CAN write to Room Service', () => {
      expect(canWriteTab('room-service', 'HOTEL')).toBe(true);
    });
  });

  describe('Super Admin access', () => {
    it('CAN access everything', () => {
      const allTabs: TabKey[] = [
        'arrivals', 'room-service', 'controls', 'channel-sync', 'vault',
        'memberships', 'maintenance', 'omni-stream', 'ledger', 'management',
        'hospitality', 'pos', 'analytics',
      ];
      allTabs.forEach((tab) => {
        expect(canAccessTab(tab, 'SUPER_ADMIN')).toBe(true);
      });
    });

    it('CAN write everything', () => {
      expect(canWriteTab('management', 'SUPER_ADMIN')).toBe(true);
      expect(canWriteTab('analytics', 'SUPER_ADMIN')).toBe(true);
    });
  });

  describe('Accessible tabs by role', () => {
    it('Client has limited access', () => {
      const tabs = getAccessibleTabs('CLIENT');
      expect(tabs).toContain('room-service');
      expect(tabs).not.toContain('management');
    });
  });
});
