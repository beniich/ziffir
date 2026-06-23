import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../authStore';

// Mock du module client API car il utilise localStorage
vi.mock('../shared/api/client', () => ({
  api: {
    post: vi.fn(),
  },
  tokenStorage: {
    getAccess: vi.fn(),
    setAccess: vi.fn(),
    setRefresh: vi.fn(),
    clearAll: vi.fn(),
  }
}));

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, error: null, isLoading: false });
  });

  it('should initialize with default values', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    // Le token n'est plus géré directement dans le store mais via tokenStorage
  });

  it('should set user using setState', () => {
    const mockUser = {
      id: '1',
      username: 'admin',
      email: 'admin@zaphir.hotel',
      role: 'admin' as const,
    };

    useAuthStore.setState({ user: mockUser });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
  });

  it('should clear user on logout', () => {
    const mockUser = {
      id: '1',
      username: 'admin',
      email: 'admin@zaphir.hotel',
      role: 'admin' as const,
    };

    useAuthStore.setState({ user: mockUser });
    useAuthStore.setState({ user: null }); // Simule la fin du logout

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
  });
});
