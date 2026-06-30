import { useCallback } from 'react';

// Simple minimal toast hook until a robust one is installed
export function useToast() {
  const push = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    console.log(`[Toast ${type.toUpperCase()}] ${message}`);
    // You can replace this later with a proper Toast UI like sonner or react-hot-toast
    // alert(message);
  }, []);

  return { push };
}
