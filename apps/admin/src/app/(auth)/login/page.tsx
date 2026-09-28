'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AlertCircle, CheckCircle2, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { settingsService } from '@/services/settings.service';
import { isValidImageUrl } from '@/lib/branding-context';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [companyName, setCompanyName] = React.useState('Gypsym');
  const [logoError, setLogoError] = React.useState(false);

  React.useEffect(() => {
    settingsService.getBranding()
      .then((res: any) => {
        const resolvedLogo =
          (isValidImageUrl(res?.logoLight) && res.logoLight) ||
          (isValidImageUrl(res?.favicon) && res.favicon) ||
          (isValidImageUrl(res?.logoDark) && res.logoDark) ||
          null;
        if (resolvedLogo) setLogoUrl(resolvedLogo);
        if (res?.companyName) setCompanyName(res.companyName);
      })
      .catch(() => {});
  }, []);

  const redirectPath = searchParams?.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const res = await login(email, password);

    if (!res.success) {
      setErrorMessage(res.error || 'Invalid credentials. Please verify your email and password.');
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push(redirectPath);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      <style>{`
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-28px) scale(1.06); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-0 { animation: fadeUp 0.45s 0.0s ease both; }
        .anim-1 { animation: fadeUp 0.45s 0.1s ease both; }
        .anim-2 { animation: fadeUp 0.45s 0.2s ease both; }
        .anim-3 { animation: fadeUp 0.45s 0.3s ease both; }
        .orb-1  { animation: floatOrb 9s ease-in-out infinite; }
        .orb-2  { animation: floatOrb 12s ease-in-out infinite reverse; }
        .input-field {
          width: 100%;
          height: 44px;
          padding: 0 16px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          font-size: 14px;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
        }
        .input-field::placeholder { color: #94a3b8; }
        .input-field:focus { border-color: #0f172a; background: #fff; }
        .input-field-pr { padding-right: 44px; }
      `}</style>

      {/* ──────────────────── LEFT PANEL ──────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col justify-between p-10 overflow-hidden"
        style={{
          backgroundImage: 'url(/login-panel-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/65 via-slate-900/45 to-transparent" />

        {/* Floating ambient orbs */}
        <div className="orb-1 absolute top-[30%] left-[20%] w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
        <div className="orb-2 absolute bottom-[20%] right-[15%] w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)' }} />

        {/* Top: Brand mark */}
        <div className="relative z-10">
          {logoUrl && !logoError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={companyName}
              className="h-9 max-w-[150px] object-contain brightness-0 invert"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-base">
                G
              </div>
              <span className="text-white font-bold text-base tracking-tight">{companyName}</span>
            </div>
          )}
        </div>

        {/* Center: Hero copy */}
        <div className="relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse block" />
            <span className="text-[11px] font-medium text-white/80 uppercase tracking-wider">Admin Portal</span>
          </div>
          <h2 className="text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tight">
            Welcome<br />back.
          </h2>
          <p className="text-sm text-white/55 max-w-xs leading-relaxed">
            Sign in to manage content, SEO, users and settings across your Shopify platform.
          </p>
        </div>

        {/* Bottom: Feature pills */}
        <div className="relative z-10 flex flex-wrap gap-2">
          {['Content Management', 'SEO Studio', 'User Roles', 'E-Commerce Tools'].map((label) => (
            <span
              key={label}
              className="px-3 py-1.5 rounded-full border border-white/12 text-[11px] font-medium text-white/65"
              style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ──────────────────── RIGHT PANEL ──────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-14">

        {/* Mobile-only logo */}
        <div className="lg:hidden mb-8 flex flex-col items-center">
          {logoUrl && !logoError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={companyName}
              className="h-10 max-w-[150px] object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold text-xl">
              G
            </div>
          )}
        </div>

        <div className="w-full max-w-[370px] space-y-7">

          {/* Heading */}
          <div className="space-y-1 anim-0">
            <h1 className="text-[28px] font-black text-slate-900 tracking-tight leading-tight">Sign in</h1>
            <p className="text-sm text-slate-400">Enter your credentials to continue.</p>
          </div>

          {/* Error / Success */}
          {errorMessage && (
            <div className="anim-0 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}
          {success && (
            <div className="anim-0 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>Authenticated. Redirecting...</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 anim-1">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-slate-700 block">Email address</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gypsym.com"
                className="input-field"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  className="text-[12px] text-slate-400 hover:text-slate-900 transition-colors font-medium"
                  tabIndex={-1}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  placeholder="••••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field input-field-pr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || success}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '12px',
                background: loading || success ? '#94a3b8' : '#0f172a',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: loading || success ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s, transform 0.1s',
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-[11px] text-slate-300 anim-3">
            Restricted to authorised personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <LoginForm />
    </React.Suspense>
  );
}

