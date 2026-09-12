'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useCmsCollection } from '@/lib/store';
import { ROLE_PERMISSIONS, RoleType } from '@/lib/auth-context';
import { Search } from 'lucide-react';

export default function PermissionsMatrixPage() {
  const { data: permissions } = useCmsCollection<any>('permissions');
  const [search, setSearch] = React.useState('');

  const roles: RoleType[] = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR', 'VIEWER'];

  const filteredPermissions = permissions.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.group.toLowerCase().includes(search.toLowerCase())
  );

  const hasRolePermission = (role: RoleType, permCode: string): boolean => {
    if (role === 'SUPER_ADMIN') return true;
    const perms = ROLE_PERMISSIONS[role] || [];
    if (perms.includes('*') || perms.includes(permCode)) return true;
    const [domain] = permCode.split(':');
    return perms.includes(`${domain}:*`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Granular RBAC Permission Matrix
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Atomic capability mapping enforcing zero-trust privilege boundaries across all user roles.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search permissions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead className="border-b border-border bg-muted/20 font-mono text-muted-foreground">
            <tr>
              <th className="p-3 text-left w-72">Atomic Permission</th>
              <th className="p-3 text-left w-28">Domain</th>
              {roles.map((r) => (
                <th key={r} className="p-3 text-center w-28 uppercase text-[10px]">
                  {r.replace('_', ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredPermissions.map((perm: any) => (
              <tr key={perm.id} className="hover:bg-muted/20 transition-colors">
                <td className="p-3">
                  <div className="font-semibold text-foreground">{perm.name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{perm.code}</div>
                </td>
                <td className="p-3">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {perm.group}
                  </Badge>
                </td>
                {roles.map((r) => {
                  const granted = hasRolePermission(r, perm.code);
                  return (
                    <td key={r} className="p-3 text-center">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={granted}
                          disabled={r === 'SUPER_ADMIN'}
                          aria-label={`${r} - ${perm.code}`}
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
