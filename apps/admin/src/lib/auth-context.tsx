'use client';

import * as React from 'react';

export type RoleType = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'VIEWER';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  avatarUrl?: string;
  permissions: string[];
}

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

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  login: (email: string, role?: RoleType) => void;
  logout: () => void;
  switchRole: (role: RoleType) => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const DEFAULT_USER: AdminUser = {
  id: 'usr_super_01',
  name: 'MohammadAli Kadiwal',
  email: 'chief.architect@gypsym.com',
  role: 'SUPER_ADMIN',
  permissions: ['*'],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AdminUser | null>(DEFAULT_USER);
  const [theme, setTheme] = React.useState<'dark' | 'light'>('light');

  React.useEffect(() => {
    // Check saved theme
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

  const login = React.useCallback((email: string, role: RoleType = 'SUPER_ADMIN') => {
    const localPart = email.split('@')[0] || 'admin';
    const newUser: AdminUser = {
      id: `usr_${Date.now()}`,
      name: localPart.replace('.', ' ').toUpperCase(),
      email,
      role,
      permissions: ROLE_PERMISSIONS[role],
    };
    setUser(newUser);
  }, []);

  const logout = React.useCallback(() => {
    setUser(null);
  }, []);

  const switchRole = React.useCallback((role: RoleType) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        role,
        permissions: ROLE_PERMISSIONS[role],
      };
    });
  }, []);

  const hasPermission = React.useCallback(
    (requiredPermission: string): boolean => {
      if (!user) return false;
      if (user.role === 'SUPER_ADMIN') return true;
      if (user.permissions.includes('*')) return true;
      if (user.permissions.includes(requiredPermission)) return true;

      // Check wildcards like "content:*"
      const [domain] = requiredPermission.split(':');
      if (user.permissions.includes(`${domain}:*`)) return true;

      return false;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        theme,
        toggleTheme,
        login,
        logout,
        switchRole,
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
