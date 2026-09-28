'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchApi, getAuthToken } from './api-client';

export type RoleType = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'VIEWER';

export const ROLE_PERMISSIONS: Record<RoleType, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: [
    'content:read',
    'content:write',
    'content:delete',
    'content:publish',
    'media:read',
    'media:write',
    'media:delete',
    'site:read',
    'site:write',
    'users:read',
    'users:write',
    'audit:read',
  ],
  EDITOR: [
    'content:read',
    'content:write',
    'content:publish',
    'media:read',
    'media:write',
    'site:read',
    'audit:read',
  ],
  AUTHOR: [
    'content:read',
    'content:write',
    'media:read',
    'media:write',
  ],
  VIEWER: [
    'content:read',
    'media:read',
    'site:read',
    'audit:read',
  ],
};

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  permissions: string[];
}

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = React.useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [theme, setTheme] = React.useState<'dark' | 'light'>('light');

  // Load saved theme preference
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('gypsym_admin_theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('gypsym_admin_theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  }, []);

  // Validate active session token with backend on initial load
  React.useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      const token = getAuthToken();

      if (!token) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      // Fast optimistic load from local storage to prevent flicker
      const cachedUserStr = localStorage.getItem('gypsym_admin_user');
      if (cachedUserStr) {
        try {
          const parsed = JSON.parse(cachedUserStr);
          if (isMounted && parsed?.email) {
            setUser(parsed);
          }
        } catch {
          // ignore cache parse error
        }
      }

      try {
        const response = await fetchApi<{ success?: boolean; data?: AdminUser }>('/auth/me');
        const activeUser = (response as any).data || response;

        if (isMounted && activeUser && (activeUser as AdminUser).email) {
          setUser(activeUser as AdminUser);
          localStorage.setItem('gypsym_admin_user', JSON.stringify(activeUser));
        }
      } catch (err: any) {
        // ONLY clear cookie and redirect if the server explicitly responded with 401 Unauthorized (token invalid/expired)
        // Never clear credentials on network glitches, offline mode, or temporary server restarts (status 0, 502, 503)
        if (isMounted && err?.status === 401) {
          document.cookie = 'gypsym_admin_token=; path=/; max-age=0';
          localStorage.removeItem('gypsym_admin_token');
          localStorage.removeItem('gypsym_admin_user');
          setUser(null);

          if (pathname !== '/login') {
            router.push('/login');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  // Authenticate against NestJS /auth/login endpoint
  const login = React.useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetchApi<any>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        const token = res.token;
        const loggedUser: AdminUser = res.user;

        if (!token || !loggedUser) {
          return { success: false, error: 'Authentication failed. No access token returned.' };
        }

        // Set persistent 7-day cookie
        document.cookie = `gypsym_admin_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        localStorage.setItem('gypsym_admin_token', token);
        localStorage.setItem('gypsym_admin_user', JSON.stringify(loggedUser));

        setUser(loggedUser);
        return { success: true };
      } catch (err: any) {
        return {
          success: false,
          error: err?.message || 'Invalid enterprise credentials or network error.',
        };
      }
    },
    []
  );

  // Sign out and revoke session
  const logout = React.useCallback(async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' }).catch(() => null);
    } finally {
      document.cookie = 'gypsym_admin_token=; path=/; max-age=0';
      localStorage.removeItem('gypsym_admin_token');
      localStorage.removeItem('gypsym_admin_user');
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  // Dynamic role & permissions authorization check
  const hasPermission = React.useCallback(
    (requiredPermission: string): boolean => {
      if (!user) return false;
      if (user.role === 'SUPER_ADMIN') return true;
      if (user.permissions?.includes('*')) return true;
      if (user.permissions?.includes(requiredPermission)) return true;

      // Wildcard check like "content:*"
      const [domain] = requiredPermission.split(':');
      if (domain && user.permissions?.includes(`${domain}:*`)) return true;

      return false;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        theme,
        toggleTheme,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
