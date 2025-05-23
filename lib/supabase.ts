import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Τα στοιχεία του Supabase project
const supabaseUrl = 'https://kxntpfaxiqyqsksasupk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bnRwZmF4aXF5cXNrc2FzdXBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3Mzc1NzYsImV4cCI6MjA2MDMxMzU3Nn0.Fz9S9M95BORkdmfv6e2AEhF3Ille9f0Nso0tG4dOxnk';

// Έλεγχος αν βρισκόμαστε σε περιβάλλον browser ή server
const isBrowser = typeof window !== 'undefined';

// Δημιουργία μιας συμβατής με web custom storage λύσης
const customStorage = {
  getItem: async (key: string) => {
    if (!isBrowser) return null;
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from AsyncStorage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    if (!isBrowser) return;
    try {
      return await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in AsyncStorage:', error);
    }
  },
  removeItem: async (key: string) => {
    if (!isBrowser) return;
    try {
      return await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from AsyncStorage:', error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 