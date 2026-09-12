'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { INITIAL_BRANDING } from '@/lib/store';
import {
  Save,
  Sparkles,
  Moon,
  Sun,
  Palette,
  Loader2,
  Globe,
  Image as ImageIcon,
  RotateCcw,
  Lock,
  X,
} from 'lucide-react';
import { notify } from '@/lib/notifications';
import { fetchApi } from '@/lib/api-client';
import { ImageUploadField } from '@/components/ui/image-upload-field';

function isValidHexOrHsl(val: string): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  if (/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(trimmed)) return true;
  if (/^hsl\(.+\)$/i.test(trimmed) || /^rgb\(.+\)$/i.test(trimmed)) return true;
  return false;
}

export default function BrandingStudioPage() {
  const [branding, setBranding] = React.useState(INITIAL_BRANDING);
  const [previewTheme, setPreviewTheme] = React.useState<'dark' | 'light'>('light');
  const [saving, setSaving] = React.useState(false);

  // Sync with API & localStorage on mount
  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetchApi<any>('/branding');
        if (res) {
          setBranding((prev) => ({
            ...prev,
            companyName: res.companyName || prev.companyName,
            logoLightUrl: res.logoLight || prev.logoLightUrl,
            logoDarkUrl: res.logoDark || prev.logoDarkUrl,
            faviconUrl: res.favicon || prev.faviconUrl,
            primaryColor: res.colors?.primaryColorHsl || prev.primaryColor,
            secondaryColor: res.colors?.secondaryColorHsl || prev.secondaryColor,
            accentColor: res.colors?.accentColorHsl || prev.accentColor,
            lightBgColor: res.colors?.lightBgColor || prev.lightBgColor,
            darkBgColor: res.colors?.darkBgColor || prev.darkBgColor,
          }));
        }
      } catch {
        try {
          const savedSettings = localStorage.getItem('gypsym_branding_settings');
          if (savedSettings) {
            setBranding((prev) => ({ ...prev, ...JSON.parse(savedSettings) }));
          }
        } catch {
          // Ignore storage errors
        }
      }
    }
    load();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (branding.lightBgColor && !isValidHexOrHsl(branding.lightBgColor)) {
      notify.error('Please enter a valid hex color for Light Mode Background (e.g. #f4f3ef).');
      return;
    }
    if (branding.darkBgColor && !isValidHexOrHsl(branding.darkBgColor)) {
      notify.error('Please enter a valid hex color for Dark Mode Background (e.g. #030712).');
      return;
    }
    if (branding.primaryColor && !isValidHexOrHsl(branding.primaryColor)) {
      notify.error('Please enter a valid hex color for Primary Brand Color.');
      return;
    }
    if (branding.accentColor && !isValidHexOrHsl(branding.accentColor)) {
      notify.error('Please enter a valid hex color for Accent Highlight Color.');
      return;
    }

    setSaving(true);
    try {
      localStorage.setItem('gypsym_branding_settings', JSON.stringify(branding));
      window.dispatchEvent(new Event('storage'));

      await fetchApi('/branding', {
        method: 'PUT',
        body: JSON.stringify({
          companyName: branding.companyName,
          logoLightUrl: branding.logoLightUrl,
          logoDarkUrl: branding.logoDarkUrl,
          faviconUrl: branding.faviconUrl,
          colors: {
            primaryColorHsl: branding.primaryColor,
            secondaryColorHsl: branding.secondaryColor,
            accentColorHsl: branding.accentColor,
            lightBgColor: branding.lightBgColor,
            darkBgColor: branding.darkBgColor,
            lightBgHsl: branding.lightBgColor,
            darkBgHsl: branding.darkBgColor,
          },
        }),
      });

      notify.success('Branding and visual identity synchronized with backend database.');
    } catch {
      notify.error('Unable to save branding settings to backend.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset branding settings to enterprise defaults?')) {
      setBranding(INITIAL_BRANDING);
      localStorage.setItem('gypsym_branding_settings', JSON.stringify(INITIAL_BRANDING));
      window.dispatchEvent(new Event('storage'));
      notify.info('Branding reset to default configuration.');
    }
  };

  const lightBgPresets = [
    { label: 'Warm Alabaster (#f4f3ef)', hex: '#f4f3ef', recommended: true },
    { label: 'Pure White (#ffffff)', hex: '#ffffff' },
    { label: 'Slate Daylight (#f8fafc)', hex: '#f8fafc' },
    { label: 'Warm Stone (#fafaf9)', hex: '#fafaf9' },
    { label: 'Cool Alabaster (#f1f5f9)', hex: '#f1f5f9' },
  ];

  const darkBgPresets = [
    { label: 'Cosmic Obsidian (#030712)', hex: '#030712', recommended: true },
    { label: 'Deep Slate Navy (#0f172a)', hex: '#0f172a' },
    { label: 'Charcoal Smoke (#111827)', hex: '#111827' },
    { label: 'Zinc Dark (#09090b)', hex: '#09090b' },
  ];

  const primaryPresets = [
    { label: 'Gypsym Blue', hex: '#3b82f6' },
    { label: 'Tech Indigo', hex: '#6366f1' },
    { label: 'Cyber Violet', hex: '#8b5cf6' },
    { label: 'Emerald Sovereign', hex: '#10b981' },
    { label: 'Electric Amber', hex: '#f59e0b' },
  ];

  const accentPresets = [
    { label: 'Sky Cyan', hex: '#38bdf8' },
    { label: 'Soft Indigo', hex: '#818cf8' },
    { label: 'Neon Mint', hex: '#34d399' },
    { label: 'Coral Gold', hex: '#fbbf24' },
    { label: 'Rose Blush', hex: '#f43f5e' },
  ];

  const activeBg = previewTheme === 'dark' ? (branding.darkBgColor || '#030712') : (branding.lightBgColor || '#f4f3ef');
  const activeTextColor = previewTheme === 'dark' ? '#f8fafc' : '#0f172a';
  const activeMutedColor = previewTheme === 'dark' ? '#94a3b8' : '#64748b';
  const activeBorderColor = previewTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eaedf3]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Palette className="h-5 w-5" />
            </div>
            <span>Branding & Visual Identity</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Manage website logo (light & dark), browser favicon, brand color palette, and canvas background tokens.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="rounded-xl h-10 px-3.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            <span>Reset</span>
          </Button>

          <Button
            onClick={() => handleSave()}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-5 text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 1. Website Logo Section (Light & Dark) */}
      <Card className="p-6 rounded-2xl border-slate-200/90 bg-white shadow-xs space-y-6">
        <CardHeader className="p-0 border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <ImageIcon className="h-4 w-4 text-blue-600" />
                <span>Website Logos</span>
                <Badge variant="outline" className="text-[10px] font-mono uppercase bg-blue-50/50 text-blue-700 border-blue-200">
                  Dual Mode Assets
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Upload or specify high-resolution vector SVGs or PNGs for website header navigation.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Light Mode Logo */}
          <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 space-y-3">
            <ImageUploadField
              label="Light Mode Logo (for White/Light Header)"
              description="Upload vector SVG or transparent PNG directly, or enter a URL"
              value={branding.logoLightUrl || ''}
              onChange={(url) => setBranding({ ...branding, logoLightUrl: url })}
              placeholder="https://assets.gypsym.com/logos/logo-light.svg"
              previewDark={false}
            />
          </div>

          {/* Dark Mode Logo */}
          <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 space-y-3">
            <ImageUploadField
              label="Dark Mode Logo (for Obsidian/Dark Navbar)"
              description="Upload light/white emblem or vector SVG directly, or enter a URL"
              value={branding.logoDarkUrl || ''}
              onChange={(url) => setBranding({ ...branding, logoDarkUrl: url })}
              placeholder="https://assets.gypsym.com/logos/logo-dark.svg"
              previewDark={true}
            />
          </div>
        </div>
      </Card>

      {/* 2. Website Favicon Section with Browser Tab Mockup */}
      <Card className="p-6 rounded-2xl border-slate-200/90 bg-white shadow-xs space-y-6">
        <CardHeader className="p-0 border-b border-slate-100 pb-4">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Globe className="h-4 w-4 text-blue-600" />
            <span>Website Favicon & Browser Tab Identity</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            The small icon displayed in visitor browser tabs, bookmarks, and shortcut icons.
          </CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* URL & Upload Setting */}
          <div className="lg:col-span-6 space-y-3">
            <ImageUploadField
              label="Browser Favicon (.ico, .svg, .png)"
              description="Upload standard 32x32 or 64x64 favicon directly, or enter a URL"
              value={branding.faviconUrl || ''}
              onChange={(url) => setBranding({ ...branding, faviconUrl: url })}
              placeholder="/favicon.ico"
            />
            <p className="text-[11px] text-slate-400">
              Standard 32x32 or 64x64 favicon. Auto-detected across mobile and desktop browser platforms.
            </p>

            <div className="flex items-center space-x-2 pt-2">
              <span className="text-[11px] text-slate-500 font-medium">Quick Presets:</span>
              <button
                type="button"
                onClick={() => setBranding({ ...branding, faviconUrl: '/favicon.ico' })}
                className="text-[10px] px-2.5 py-1 rounded-lg border border-slate-200 hover:border-blue-500 bg-slate-50 text-slate-700 transition-colors"
              >
                Default /favicon.ico
              </button>
              <button
                type="button"
                onClick={() => setBranding({ ...branding, faviconUrl: 'https://assets.gypsym.com/favicons/favicon.svg' })}
                className="text-[10px] px-2.5 py-1 rounded-lg border border-slate-200 hover:border-blue-500 bg-slate-50 text-slate-700 transition-colors"
              >
                Vector SVG Favicon
              </button>
            </div>
          </div>

          {/* Browser Tab Mockup */}
          <div className="lg:col-span-6">
            <div className="rounded-xl border border-slate-200/90 bg-slate-100/70 p-3 shadow-2xs space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">
                Live Browser Tab Mockup
              </span>

              {/* Tab bar */}
              <div className="flex items-end space-x-1 border-b border-slate-200 px-2 pt-1">
                {/* Active Tab */}
                <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-t-lg border-t border-x border-slate-200 text-xs shadow-2xs max-w-[220px]">
                  <div className="h-4 w-4 rounded-sm bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                    G
                  </div>
                  <span className="text-slate-800 font-medium text-[11px] truncate">
                    Gypsym Technology | Enterprise
                  </span>
                  <X className="h-3 w-3 text-slate-400 hover:text-slate-600 cursor-pointer shrink-0" />
                </div>

                {/* Inactive Tab */}
                <div className="flex items-center space-x-1.5 px-3 py-1.5 text-slate-400 text-xs max-w-[140px] truncate">
                  <span className="truncate text-[11px]">New Tab</span>
                </div>
              </div>

              {/* Address bar */}
              <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                <Lock className="h-3 w-3 text-emerald-600 shrink-0" />
                <span className="text-slate-700 font-mono text-[11px] truncate">
                  https://gypsym.com
                </span>
                <span className="ml-auto text-[10px] text-slate-400">100% SSL</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Brand Colors (Primary, Accent, Secondary) */}
      <Card className="p-6 rounded-2xl border-slate-200/90 bg-white shadow-xs space-y-6">
        <CardHeader className="p-0 border-b border-slate-100 pb-4">
          <CardTitle className="text-sm font-bold text-slate-900">
            Brand Semantic Colors
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Colors used for primary buttons, highlighted accents, and active UI interactive states.
          </CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Primary Color */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-200/90 bg-slate-50/50">
            <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
              <span>Primary Brand Color</span>
              <span className="text-[10px] font-mono text-slate-400">--primary</span>
            </label>

            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={branding.primaryColor || '#3b82f6'}
                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                className="h-10 w-10 rounded-xl border border-slate-300 bg-transparent cursor-pointer shrink-0"
              />
              <Input
                value={branding.primaryColor || '#3b82f6'}
                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                className="text-xs font-mono rounded-xl bg-white border-slate-200"
              />
            </div>

            {/* Swatches */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {primaryPresets.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setBranding({ ...branding, primaryColor: preset.hex })}
                  className="text-[10px] px-2 py-0.5 rounded-md border border-slate-200 hover:border-blue-500 bg-white flex items-center space-x-1.5 transition-colors"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: preset.hex }} />
                  <span className="text-slate-700">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-200/90 bg-slate-50/50">
            <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
              <span>Accent Highlight Color</span>
              <span className="text-[10px] font-mono text-slate-400">--accent</span>
            </label>

            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={branding.accentColor || '#60a5fa'}
                onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                className="h-10 w-10 rounded-xl border border-slate-300 bg-transparent cursor-pointer shrink-0"
              />
              <Input
                value={branding.accentColor || '#60a5fa'}
                onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                className="text-xs font-mono rounded-xl bg-white border-slate-200"
              />
            </div>

            {/* Swatches */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {accentPresets.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setBranding({ ...branding, accentColor: preset.hex })}
                  className="text-[10px] px-2 py-0.5 rounded-md border border-slate-200 hover:border-blue-500 bg-white flex items-center space-x-1.5 transition-colors"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: preset.hex }} />
                  <span className="text-slate-700">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Color */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-200/90 bg-slate-50/50">
            <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
              <span>Secondary Tone / Border</span>
              <span className="text-[10px] font-mono text-slate-400">--secondary</span>
            </label>

            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={branding.secondaryColor || '#1e293b'}
                onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                className="h-10 w-10 rounded-xl border border-slate-300 bg-transparent cursor-pointer shrink-0"
              />
              <Input
                value={branding.secondaryColor || '#1e293b'}
                onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                className="text-xs font-mono rounded-xl bg-white border-slate-200"
              />
            </div>

            <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
              Provides structure for subheadings, card borders, and secondary buttons.
            </p>
          </div>
        </div>
      </Card>

      {/* 4. Canvas Background Colors (Light #F4F3EF & Dark #030712) */}
      <Card className="p-6 rounded-2xl border-slate-200/90 bg-white shadow-xs space-y-6">
        <CardHeader className="p-0 border-b border-slate-100 pb-4">
          <CardTitle className="text-sm font-bold text-slate-900">
            Website Canvas Background Colors
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Root page canvas background color tokens for daylight and obsidian dark modes.
          </CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Light Mode Website Background */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-200/90 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center space-x-1.5">
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                <span>Light Mode Website Background</span>
              </label>
              <span className="text-[10px] font-mono text-slate-400">--background</span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={branding.lightBgColor || '#f4f3ef'}
                onChange={(e) => setBranding({ ...branding, lightBgColor: e.target.value })}
                className="h-10 w-10 rounded-xl border border-slate-300 bg-transparent cursor-pointer shrink-0"
              />
              <Input
                value={branding.lightBgColor || '#f4f3ef'}
                onChange={(e) => setBranding({ ...branding, lightBgColor: e.target.value })}
                className="text-xs font-mono rounded-xl bg-white border-slate-200"
                placeholder="#f4f3ef"
              />
            </div>

            {/* Presets with #F4F3EF highlighted */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-medium">Available Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {lightBgPresets.map((preset) => {
                  const isSelected = (branding.lightBgColor || '#f4f3ef').toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setBranding({ ...branding, lightBgColor: preset.hex })}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-800 font-semibold shadow-2xs'
                          : 'border-slate-200 hover:border-slate-400 bg-white text-slate-700'
                      }`}
                    >
                      <span className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ backgroundColor: preset.hex }} />
                      <span>{preset.label}</span>
                      {preset.recommended && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dark Mode Website Background */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-200/90 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center space-x-1.5">
                <Moon className="h-3.5 w-3.5 text-blue-600" />
                <span>Dark Mode Website Background</span>
              </label>
              <span className="text-[10px] font-mono text-slate-400">--background</span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={branding.darkBgColor || '#030712'}
                onChange={(e) => setBranding({ ...branding, darkBgColor: e.target.value })}
                className="h-10 w-10 rounded-xl border border-slate-300 bg-transparent cursor-pointer shrink-0"
              />
              <Input
                value={branding.darkBgColor || '#030712'}
                onChange={(e) => setBranding({ ...branding, darkBgColor: e.target.value })}
                className="text-xs font-mono rounded-xl bg-white border-slate-200"
                placeholder="#030712"
              />
            </div>

            {/* Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-medium">Available Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {darkBgPresets.map((preset) => {
                  const isSelected = (branding.darkBgColor || '#030712').toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setBranding({ ...branding, darkBgColor: preset.hex })}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-800 font-semibold shadow-2xs'
                          : 'border-slate-200 hover:border-slate-400 bg-white text-slate-700'
                      }`}
                    >
                      <span className="h-2.5 w-2.5 rounded-full border border-white/20" style={{ backgroundColor: preset.hex }} />
                      <span>{preset.label}</span>
                      {preset.recommended && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-blue-100 text-blue-800 font-bold">
                          Recommended
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 5. Live Interactive Website Header & Component Preview */}
      <Card className="p-6 rounded-2xl border-slate-200/90 bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Live Website Token Simulation</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulates how the chosen logos, brand colors, and canvas backgrounds look on the public website.
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setPreviewTheme('light')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                previewTheme === 'light'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sun className="h-3.5 w-3.5 text-amber-500" />
              <span>Light Mode</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewTheme('dark')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                previewTheme === 'dark'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Moon className="h-3.5 w-3.5 text-blue-400" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Realistic Mock Website Window */}
        <div
          className="rounded-2xl border transition-all overflow-hidden shadow-sm"
          style={{
            backgroundColor: activeBg,
            borderColor: activeBorderColor,
          }}
        >
          {/* Mock Top Navigation Bar */}
          <div
            className="flex items-center justify-between px-6 py-3.5 border-b transition-colors"
            style={{
              borderColor: activeBorderColor,
              backgroundColor: previewTheme === 'dark' ? 'rgba(3,7,18,0.85)' : 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Logo */}
            <div className="flex items-center space-x-2.5">
              <div
                className="h-7 w-7 rounded-lg text-white font-bold flex items-center justify-center text-xs shadow-xs"
                style={{ backgroundColor: branding.primaryColor }}
              >
                GT
              </div>
              <span
                className="font-extrabold text-sm tracking-tight"
                style={{ color: activeTextColor }}
              >
                Gypsym
              </span>
            </div>

            {/* Links */}
            <div className="hidden md:flex items-center space-x-6 text-xs font-semibold">
              <span style={{ color: activeTextColor }} className="cursor-pointer hover:opacity-80">
                Solutions
              </span>
              <span style={{ color: activeMutedColor }} className="cursor-pointer hover:opacity-80">
                Services
              </span>
              <span style={{ color: activeMutedColor }} className="cursor-pointer hover:opacity-80">
                Industries
              </span>
              <span style={{ color: activeMutedColor }} className="cursor-pointer hover:opacity-80">
                Case Studies
              </span>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-90"
              style={{ backgroundColor: branding.primaryColor }}
            >
              Schedule Consultation
            </button>
          </div>

          {/* Mock Hero Content */}
          <div className="p-8 sm:p-12 space-y-4 max-w-2xl">
            <div
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: previewTheme === 'dark' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)',
                color: branding.accentColor,
              }}
            >
              <Sparkles className="h-3 w-3" />
              <span>Verified Enterprise Results</span>
            </div>

            <h3
              className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight"
              style={{ color: activeTextColor }}
            >
              Engineering the Global Enterprise Architecture
            </h3>

            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: activeMutedColor }}>
              This live preview shows the combination of your chosen canvas background color (
              <span className="font-mono font-semibold">{activeBg}</span>), primary action color, and accent tokens.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-transform active:scale-95"
                style={{ backgroundColor: branding.primaryColor }}
              >
                Primary Brand Action
              </button>

              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-semibold border transition-colors"
                style={{
                  borderColor: branding.secondaryColor,
                  color: activeTextColor,
                  backgroundColor: previewTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                }}
              >
                Secondary Action
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
