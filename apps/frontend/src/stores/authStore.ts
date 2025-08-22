import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';

interface User {
  id: string;
  phone: string;
  role: 'SUPPORT' | 'COMMITTEE' | 'OWNER';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (phoneNumber: string, otp: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (phoneNumber: string, otp: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.loginWithPhone(phoneNumber, otp);
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: () => {
        // Check for both Firebase token and dev token
        const token = authService.getToken();
        const devUser = localStorage.getItem('devUser');
        
        if (token || devUser) {
          if (devUser) {
            // Set dev user data
            const user = JSON.parse(devUser);
            set({ 
              user: user,
              isAuthenticated: true 
            });
          } else {
            set({ isAuthenticated: true });
          }
        } else {
          set({ isAuthenticated: false, user: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
