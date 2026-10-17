import { User, UserRole } from '@/types';
import { currentUser as defaultUser } from './mockData';
import { delay, api, USE_MOCKS } from '@/lib/http';
import { supabase } from '@/lib/supabase';

const AUTH_STORAGE_KEY = 'nexbridge_auth_user';

export interface AuthResponseData {
  user: User;
  accessToken: string;
  tokenType: string;
}

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    if (!USE_MOCKS) {
      const token = localStorage.getItem('nexbridge_token');
      if (!token) {
        return null;
      }
      try {
        const u = await api<User>('/auth/me');
        if (u) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
          localStorage.setItem('nexbridge_user', JSON.stringify(u));
          return u;
        }
      } catch (err: any) {
        console.warn('Backend /auth/me verification notice:', err);
        // Clear invalid token if unauthorized
        if (err?.message?.includes('401') || err?.message?.includes('Authentication required') || err?.message?.includes('Invalid')) {
          localStorage.removeItem('nexbridge_token');
          localStorage.removeItem(AUTH_STORAGE_KEY);
          return null;
        }
      }
    }
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return USE_MOCKS ? defaultUser : null;
  },

  async login(email: string, password: string, role?: UserRole): Promise<User> {
    if (!USE_MOCKS) {
      // Call FastAPI backend /auth/login with real credentials
      const res = await api<AuthResponseData>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      });

      if (!res?.accessToken || !res?.user) {
        throw new Error('Invalid response from authentication server.');
      }

      // Store real token and verified profile
      localStorage.setItem('nexbridge_token', res.accessToken);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.user));
      localStorage.setItem('nexbridge_user', JSON.stringify(res.user));

      // Synchronize Supabase JS auth client
      try {
        await supabase.auth.setSession({
          access_token: res.accessToken,
          refresh_token: res.accessToken,
        });
      } catch (sbErr) {
        // Non-blocking
      }

      return res.user;
    }

    // Mock mode only
    await delay(300, 600);
    const mockUser: User = {
      ...defaultUser,
      email,
      role: role || 'founder',
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Demo User',
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    localStorage.setItem('nexbridge_token', 'mock_token_' + Date.now());
    return mockUser;
  },

  async signUp(email: string, password: string, role: UserRole = 'founder', name?: string): Promise<User> {
    if (!USE_MOCKS) {
      // Call FastAPI backend /auth/signup with real credentials
      const res = await api<AuthResponseData>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, role, name }),
      });

      if (!res?.accessToken || !res?.user) {
        throw new Error('Registration failed. Please try again.');
      }

      // Store real token and verified profile
      localStorage.setItem('nexbridge_token', res.accessToken);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.user));
      localStorage.setItem('nexbridge_user', JSON.stringify(res.user));

      // Synchronize Supabase JS auth client
      try {
        await supabase.auth.setSession({
          access_token: res.accessToken,
          refresh_token: res.accessToken,
        });
      } catch (sbErr) {
        // Non-blocking
      }

      return res.user;
    }

    // Mock mode only
    await delay(400, 700);
    const mockUser: User = {
      ...defaultUser,
      email,
      role,
      name: name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Demo User',
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    localStorage.setItem('nexbridge_token', 'mock_token_' + Date.now());
    return mockUser;
  },

  async switchRole(newRole: UserRole): Promise<User> {
    const current = await this.getCurrentUser();
    if (!USE_MOCKS) {
      try {
        const updated = await api<User>('/auth/switch-role', {
          method: 'POST',
          body: JSON.stringify({ role: newRole }),
        });
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      } catch (err) {
        console.warn('Backend switchRole notice:', err);
      }
    }

    const updated: User = {
      ...(current || defaultUser),
      role: newRole,
      headline:
        newRole === 'founder'
          ? 'Seed Founder • Building NutriFit AI'
          : newRole === 'talent'
          ? 'Staff Distributed Systems Architect • Open to Roles'
          : 'Angel Investor & Product Advisor • Vance Advisory',
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('nexbridge_user');
    localStorage.removeItem('nexbridge_token');
  },
};
