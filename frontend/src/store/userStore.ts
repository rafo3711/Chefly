import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../services/api';

interface User {
  id: string;
  device_id: string;
  preferred_language: string;
  preferred_currency: string;
  budget_limit: number;
  subscription_status: string;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  isOnboarded: boolean;
  setUser: (user: User | null) => void;
  setOnboarded: (value: boolean) => void;
  initUser: () => Promise<void>;
  updatePreferences: (prefs: Partial<User>) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: true,
  isOnboarded: false,

  setUser: (user) => set({ user }),
  setOnboarded: (value) => set({ isOnboarded: value }),

  initUser: async () => {
    try {
      set({ isLoading: true });
      
      // Check if user is onboarded
      const onboarded = await AsyncStorage.getItem('isOnboarded');
      const userId = await AsyncStorage.getItem('userId');
      
      if (onboarded === 'true' && userId) {
        // Try to fetch existing user
        try {
          const user = await api.getUser(userId);
          set({ user, isOnboarded: true });
        } catch (e) {
          // User not found, create new
          const deviceId = userId || `device_${Date.now()}`;
          const newUser = await api.createUser(deviceId);
          await AsyncStorage.setItem('userId', newUser.id);
          set({ user: newUser, isOnboarded: true });
        }
      }
      
      set({ isOnboarded: onboarded === 'true', isLoading: false });
    } catch (error) {
      console.error('Error initializing user:', error);
      set({ isLoading: false });
    }
  },

  updatePreferences: async (prefs) => {
    const { user } = get();
    if (!user) return;
    
    try {
      const updatedUser = await api.updateUser(user.id, prefs);
      set({ user: updatedUser });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  },
}));

export default useUserStore;
