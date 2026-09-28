'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  KeyRound,
  Lock,
  Edit2,
  Trash2,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { usersService } from '@/services/users.service';
import { notify } from '@/lib/notifications';
import { useAuth } from '@/lib/auth-context';
import { formatDateTime } from '@/lib/utils';

interface UserRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  roles: string[];
  isActive: boolean;
  isTwoFactorEnabled: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  activeSessionsCount: number;
}

const ROLE_LABELS: Record<string, { label: string; color: string; variant: 'default' | 'secondary' | 'warning' | 'muted' }> = {
  SUPER_ADMIN: { label: 'Super Administrator', color: 'bg-rose-50 text-rose-700 border-rose-200', variant: 'default' },
  SYSTEM_ADMIN: { label: 'System Administrator', color: 'bg-blue-50 text-blue-700 border-blue-200', variant: 'secondary' },
  CONTENT_EDITOR: { label: 'Content Editor', color: 'bg-purple-50 text-purple-700 border-purple-200', variant: 'warning' },
  RECRUITER: { label: 'Recruiter', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', variant: 'muted' },
  AUDITOR: { label: 'Auditor (Viewer)', color: 'bg-amber-50 text-amber-700 border-amber-200', variant: 'muted' },
};

export default function UsersAdminPage() {
  const router = useRouter();
  const { user: currentUser, logout } = useAuth();

  const [users, setUsers] = React.useState<UserRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Selected User for Edit / Delete
  const [selectedUser, setSelectedUser] = React.useState<UserRecord | null>(null);

  // Create Form State
  const [createForm, setCreateForm] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'CONTENT_EDITOR',
    password: '',
    confirmPassword: '',
    isActive: true,
  });

  // Edit Form State
  const [editForm, setEditForm] = React.useState({
    firstName: '',
    lastName: '',
    role: 'CONTENT_EDITOR',
    isActive: true,
    newPassword: '',
    confirmNewPassword: '',
  });

  // Fetch Users
  const loadUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await usersService.getAll();
      const data = res?.data || res;
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err: any) {
      notify.error(err?.message || 'Failed to load user records.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Derived: existing super admin count (excluding the user being edited)
  const existingSuperAdmin = React.useMemo(() => {
    return users.find((u) => u.role === 'SUPER_ADMIN');
  }, [users]);

  // Filtered Users
  const filteredUsers = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  // Open Edit Modal
  const handleOpenEdit = (user: UserRecord) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role || 'CONTENT_EDITOR',
      isActive: user.isActive,
      newPassword: '',
      confirmNewPassword: '',
    });
    setEditModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (user: UserRecord) => {
    if (user.id === currentUser?.id) {
      notify.error('You cannot delete your own active administrator account.');
      return;
    }
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  // Submit Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.email || !createForm.email.includes('@')) {
      notify.error('Valid enterprise email is required.');
      return;
    }
    if (!createForm.password || createForm.password.length < 8) {
      notify.error('Password must be at least 8 characters long.');
      return;
    }
    if (createForm.password !== createForm.confirmPassword) {
      notify.error('Passwords do not match.');
      return;
    }
    // Super Admin limit: only one allowed
    if (createForm.role === 'SUPER_ADMIN' && existingSuperAdmin) {
      notify.error('A Super Administrator account already exists. Only one Super Admin is permitted per system.');
      return;
    }

    setSubmitting(true);
    try {
      await usersService.create({
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        email: createForm.email.trim().toLowerCase(),
        role: createForm.role,
        password: createForm.password,
        isActive: createForm.isActive,
      });

      notify.success(`User account for ${createForm.email} created successfully.`);
      setCreateModalOpen(false);
      setCreateForm({
        firstName: '',
        lastName: '',
        email: '',
        role: 'CONTENT_EDITOR',
        password: '',
        confirmPassword: '',
        isActive: true,
      });
      loadUsers();
    } catch (err: any) {
      notify.error(err?.message || 'Failed to create user.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit User
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    // Super Admin limit: cannot assign SUPER_ADMIN if another already holds it
    if (
      editForm.role === 'SUPER_ADMIN' &&
      existingSuperAdmin &&
      existingSuperAdmin.id !== selectedUser.id
    ) {
      notify.error('A Super Administrator account already exists. Only one Super Admin is permitted.');
      return;
    }

    if (editForm.newPassword) {
      if (editForm.newPassword.length < 8) {
        notify.error('New password must be at least 8 characters long.');
        return;
      }
      if (editForm.newPassword !== editForm.confirmNewPassword) {
        notify.error('New passwords do not match.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload: any = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        role: editForm.role,
        isActive: editForm.isActive,
      };

      if (editForm.newPassword.trim()) {
        payload.password = editForm.newPassword.trim();
      }

      await usersService.update(selectedUser.id, payload);

      setEditModalOpen(false);

      // AUTO-LOGOUT LOGIC:
      // If the password was changed AND this was the logged-in user's account:
      const isSelf = selectedUser.id === currentUser?.id || selectedUser.email.toLowerCase() === currentUser?.email.toLowerCase();
      if (editForm.newPassword.trim() && isSelf) {
        notify.warning('Your password has been changed. For security, your session has expired.');
        setTimeout(async () => {
          await logout();
          router.push('/login');
        }, 1200);
        return;
      }

      if (editForm.newPassword.trim()) {
        notify.success(`Password reset for ${selectedUser.email}. All their active sessions have been revoked.`);
      } else {
        notify.success('User updated successfully.');
      }

      loadUsers();
    } catch (err: any) {
      notify.error(err?.message || 'Failed to update user.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Delete User
  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await usersService.delete(selectedUser.id);
      notify.success(`User ${selectedUser.email} has been deactivated and removed.`);
      setDeleteModalOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err: any) {
      notify.error(err?.message || 'Failed to delete user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full pb-24">
      {/* ── Top Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Identity & Access Management (IAM)
            </h1>
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-semibold gap-1.5 py-0.5">
              <Shield className="w-3.5 h-3.5" />
              {users.length} Provisioned Accounts
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise user governance, role assignments, secure credentials management, and active session termination.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadUsers}
            disabled={loading}
            className="rounded-xl h-9 px-3 text-xs font-semibold border-slate-200 hover:bg-slate-50 gap-1.5"
            title="Refresh user records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            Refresh
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-4 text-xs font-semibold shadow-xs gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Create User
          </Button>
        </div>
      </div>

      {/* ── Search & Filter Bar ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-xs rounded-xl border-slate-200 bg-white shadow-2xs"
          />
        </div>
      </div>

      {/* ── Users Table Card ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center p-16">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="text-xs font-medium">Loading IAM User Directory...</span>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No users found</p>
            <p className="text-xs text-slate-400 mt-1">Try refining your search filter or invite a new user.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-6">User Account</th>
                  <th className="py-3.5 px-6">Assigned Role</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Active Sessions</th>
                  <th className="py-3.5 px-6">Last Login</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((item) => {
                  const roleConfig = ROLE_LABELS[item.role] || {
                    label: item.role,
                    color: 'bg-slate-50 text-slate-700 border-slate-200',
                  };
                  const isSelf = item.id === currentUser?.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Name & Email */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100">
                            {item.name ? item.name.charAt(0).toUpperCase() : item.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{item.name || 'Unnamed User'}</span>
                              {isSelf && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Role */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${roleConfig.color}`}>
                          {roleConfig.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {item.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-xs">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium text-xs">
                            <span className="h-2 w-2 rounded-full bg-slate-300" />
                            Deactivated
                          </span>
                        )}
                      </td>

                      {/* Active Sessions */}
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                          {item.activeSessionsCount} active
                        </span>
                      </td>

                      {/* Last Login */}
                      <td className="py-4 px-6 font-mono text-[11px] text-slate-500">
                        {item.lastLoginAt ? formatDateTime(item.lastLoginAt) : 'Never'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(item)}
                            className="h-8 px-2.5 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg gap-1.5 cursor-pointer"
                            title="Edit User & Manage Password"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </Button>

                          {!isSelf && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDelete(item)}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Deactivate / Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create User Modal ────────────────────────────────────────────────── */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden bg-white border border-slate-200">
          <div className="flex items-center space-x-3 p-6 border-b border-slate-100">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">Create IAM User Account</DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Provision a new administrator or editor account.
              </DialogDescription>
            </div>
          </div>

          <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">First Name</label>
                <Input
                  placeholder="e.g. David"
                  value={createForm.firstName}
                  onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Last Name</label>
                <Input
                  placeholder="e.g. Sterling"
                  value={createForm.lastName}
                  onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Enterprise Email</label>
              <Input
                type="email"
                placeholder="david@gypsym.com"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="h-9 text-xs rounded-xl font-mono"
                required
              />
              <p className="text-[10px] text-slate-400">Email will be permanently linked to this IAM account.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Role & Permissions Level</label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option
                  value="SUPER_ADMIN"
                  disabled={!!existingSuperAdmin}
                >
                  Super Administrator (Full System Control){existingSuperAdmin ? ' — Limit Reached' : ''}
                </option>
                <option value="SYSTEM_ADMIN">System Administrator (Settings & Content)</option>
                <option value="CONTENT_EDITOR">Content Editor (Editorial & Media)</option>
                <option value="RECRUITER">Recruiter (Talent & Careers)</option>
                <option value="AUDITOR">Auditor (Read-Only Compliance)</option>
              </select>
              {existingSuperAdmin && createForm.role === 'SUPER_ADMIN' && (
                <p className="text-[10px] text-rose-600 font-medium">
                  A Super Admin already exists. Only one is allowed per system.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Initial Password</label>
                <Input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Repeat password"
                  value={createForm.confirmPassword}
                  onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-900">Activate Account</span>
                <p className="text-[11px] text-slate-400">User will be able to log in immediately.</p>
              </div>
              <Switch
                checked={createForm.isActive}
                onCheckedChange={(checked) => setCreateForm({ ...createForm, isActive: checked })}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl h-9 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="rounded-xl h-9 px-5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs gap-1.5"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                Create Account
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit User Modal ──────────────────────────────────────────────────── */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden bg-white border border-slate-200 max-h-[90vh] flex flex-col">
          {selectedUser && (
            <>
              <div className="flex items-center space-x-3 p-6 border-b border-slate-100 shrink-0">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Edit2 className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-slate-900">Edit IAM Account</DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 mt-0.5">
                    Update account profile, role, and credentials.
                  </DialogDescription>
                </div>
              </div>

              <form onSubmit={handleEditSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 space-y-5 overflow-y-auto flex-1 max-h-[calc(85vh-140px)]">
                {/* Profile Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">First Name</label>
                    <Input
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      className="h-9 text-xs rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Last Name</label>
                    <Input
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      className="h-9 text-xs rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* Email (IMMUTABLE / READ-ONLY) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Lock className="h-3 w-3 text-slate-400" />
                      Enterprise Email (Locked)
                    </label>
                    <span className="text-[10px] text-amber-600 font-medium">Immutable</span>
                  </div>
                  <Input
                    value={selectedUser.email}
                    disabled
                    readOnly
                    className="h-9 text-xs rounded-xl font-mono bg-slate-100/80 text-slate-500 cursor-not-allowed border-slate-200"
                  />
                  <p className="text-[10px] text-slate-400">
                    Email addresses cannot be changed after account provisioning for audit compliance and session security.
                  </p>
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Assigned Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option
                      value="SUPER_ADMIN"
                      disabled={!!(existingSuperAdmin && existingSuperAdmin.id !== selectedUser?.id)}
                    >
                      Super Administrator (Full System Control){(existingSuperAdmin && existingSuperAdmin.id !== selectedUser?.id) ? ' — Limit Reached' : ''}
                    </option>
                    <option value="SYSTEM_ADMIN">System Administrator (Settings & Content)</option>
                    <option value="CONTENT_EDITOR">Content Editor (Editorial & Media)</option>
                    <option value="RECRUITER">Recruiter (Talent & Careers)</option>
                    <option value="AUDITOR">Auditor (Read-Only Compliance)</option>
                  </select>
                  {existingSuperAdmin && existingSuperAdmin.id !== selectedUser?.id && editForm.role === 'SUPER_ADMIN' && (
                    <p className="text-[10px] text-rose-600 font-medium">
                      A Super Admin already exists. Only one is allowed per system.
                    </p>
                  )}
                </div>

                {/* Active Status */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs font-semibold text-slate-900">Account Active</span>
                    <p className="text-[11px] text-slate-400">Enable or temporarily suspend user authentication.</p>
                  </div>
                  <Switch
                    checked={editForm.isActive}
                    disabled={selectedUser.id === currentUser?.id}
                    onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
                  />
                </div>

                {/* ── Password Reset Section (Super Admin) ───────────────────── */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-3">
                  <div className="flex items-center space-x-2 text-amber-800">
                    <KeyRound className="h-4 w-4 shrink-0 text-amber-600" />
                    <h4 className="text-xs font-bold">Change Password (Super Admin)</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Leave blank to retain current password. Setting a new password will <strong>immediately revoke all active sessions</strong> for this user in PostgreSQL.
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">New Password</label>
                      <Input
                        type="password"
                        placeholder="Min. 8 chars"
                        value={editForm.newPassword}
                        onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                        className="h-8 text-xs rounded-lg bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Confirm New Password</label>
                      <Input
                        type="password"
                        placeholder="Repeat new password"
                        value={editForm.confirmNewPassword}
                        onChange={(e) => setEditForm({ ...editForm, confirmNewPassword: e.target.value })}
                        className="h-8 text-xs rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  {editForm.newPassword && (selectedUser.id === currentUser?.id || selectedUser.email.toLowerCase() === currentUser?.email.toLowerCase()) && (
                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>Warning: Changing your own password will terminate this session and log you out immediately.</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-xl h-9 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="rounded-xl h-9 px-5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs gap-1.5 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit2 className="w-3.5 h-3.5" />}
                  Save Changes
                </Button>
              </div>
            </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Modal ────────────────────────────────────────── */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md p-6 bg-white border border-slate-200 space-y-4">
          {selectedUser && (
            <>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-sm font-bold text-slate-900">Deactivate & Remove User</DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 mt-0.5">
                    Confirm account removal for {selectedUser.email}.
                  </DialogDescription>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                Are you sure you want to deactivate <strong className="text-slate-900">{selectedUser.name}</strong> ({selectedUser.email})? All active sessions will be terminated and user access revoked.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteModalOpen(false)}
                  className="rounded-xl h-9 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleDeleteSubmit}
                  disabled={submitting}
                  className="rounded-xl h-9 px-5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Confirm Deactivation
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
