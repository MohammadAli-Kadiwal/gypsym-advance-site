'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, RoleType } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = React.useState('chief.architect@gypsym.com');
  const [password, setPassword] = React.useState('••••••••••••');
  const [selectedRole, setSelectedRole] = React.useState<RoleType>('SUPER_ADMIN');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(email, selectedRole);
      router.push('/');
    }, 400);
  };

  const handleQuickLogin = (role: RoleType, userEmail: string) => {
    setEmail(userEmail);
    setSelectedRole(role);
    login(userEmail, role);
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground font-mono font-bold text-lg shadow-lg shadow-primary/20">
            G
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gypsym Workstation
          </h1>
          <p className="text-xs text-muted-foreground">
            Operational governance, publishing pipelines, and enterprise IAM
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-6 space-y-5 border-border shadow-xl bg-card/80 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Enterprise Email</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gypsym.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Password</label>
                <span className="text-[11px] text-primary hover:underline cursor-pointer">
                  Forgot token?
                </span>
              </div>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={loading} className="w-full h-9">
                {loading ? 'Authenticating...' : 'Sign In to Cluster'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Quick Role Simulation Picker */}
          <div className="pt-4 border-t border-border/60 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Instant Test Roles:</span>
              <Badge variant="outline" className="text-[10px]">Permission Sandboxing</Badge>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('SUPER_ADMIN', 'chief.architect@gypsym.com')}
                className="rounded border border-primary/40 bg-primary/5 p-2 text-center hover:bg-primary/10 transition-colors"
              >
                <div className="font-mono text-[10px] font-bold text-primary">SUPER ADMIN</div>
                <div className="text-[9px] text-muted-foreground">Full Wildcard *</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('EDITOR', 'marcus.vance@gypsym.com')}
                className="rounded border border-border bg-muted/20 p-2 text-center hover:bg-muted/40 transition-colors"
              >
                <div className="font-mono text-[10px] font-bold text-foreground">EDITOR</div>
                <div className="text-[9px] text-muted-foreground">Publish & Edit</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('VIEWER', 'victoria.chen@gypsym.com')}
                className="rounded border border-border bg-muted/20 p-2 text-center hover:bg-muted/40 transition-colors"
              >
                <div className="font-mono text-[10px] font-bold text-foreground">VIEWER</div>
                <div className="text-[9px] text-muted-foreground">Read-Only Shield</div>
              </button>
            </div>
          </div>
        </Card>

        {/* Security Disclosures */}
        <div className="flex items-center justify-center space-x-4 text-[11px] text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Lock className="h-3 w-3 text-emerald-400" />
            <span>FIPS 140-3 Encryption</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <Shield className="h-3 w-3 text-primary" />
            <span>Hardware MFA Enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
}
