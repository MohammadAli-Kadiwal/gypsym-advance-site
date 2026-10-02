'use client';

import * as React from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Share2,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Save,
  Sparkles,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { notify } from '@/lib/notifications';
import { settingsService } from '@/services/settings.service';
import { AdminContentContainer, AdminPageHeader } from '@/components/layout/admin-page';

export interface SocialProfileItem {
  id: string;
  platform: string;
  label?: string;
  url: string;
  isActive: boolean;
}

// Preset platform catalog with brand colors, sample URLs, and display names
const PRESET_PLATFORMS = [
  {
    key: 'linkedin',
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/company/gypsym',
    defaultUrl: 'https://linkedin.com/company/gypsym',
    color: '#0A66C2',
  },
  {
    key: 'twitter',
    label: 'X (Twitter)',
    placeholder: 'https://x.com/gypsymtech',
    defaultUrl: 'https://x.com/gypsymtech',
    color: '#1DA1F2',
  },
  {
    key: 'github',
    label: 'GitHub',
    placeholder: 'https://github.com/gypsym',
    defaultUrl: 'https://github.com/gypsym',
    color: '#24292F',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    placeholder: 'https://instagram.com/gypsymtech',
    defaultUrl: 'https://instagram.com/gypsymtech',
    color: '#E4405F',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    placeholder: 'https://youtube.com/@gypsymtech',
    defaultUrl: 'https://youtube.com/@gypsymtech',
    color: '#FF0000',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    placeholder: 'https://facebook.com/gypsymtech',
    defaultUrl: 'https://facebook.com/gypsymtech',
    color: '#1877F2',
  },
  {
    key: 'discord',
    label: 'Discord',
    placeholder: 'https://discord.gg/gypsym',
    defaultUrl: 'https://discord.gg/gypsym',
    color: '#5865F2',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    placeholder: 'https://tiktok.com/@gypsymtech',
    defaultUrl: 'https://tiktok.com/@gypsymtech',
    color: '#000000',
  },
  {
    key: 'threads',
    label: 'Threads',
    placeholder: 'https://threads.net/@gypsymtech',
    defaultUrl: 'https://threads.net/@gypsymtech',
    color: '#000000',
  },
  {
    key: 'website',
    label: 'Official Website / Custom',
    placeholder: 'https://gypsym.com',
    defaultUrl: 'https://gypsym.com',
    color: '#3B82F6',
  },
];

function getPlatformBadge(platform: string) {
  const p = platform.toLowerCase();
  const match = PRESET_PLATFORMS.find((item) => item.key === p);
  return match?.label || platform.charAt(0).toUpperCase() + platform.slice(1);
}

function isValidHttpUrl(string: string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

export default function SocialProfilesPage() {
  const [profiles, setProfiles] = React.useState<SocialProfileItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Load live profiles from backend API
  React.useEffect(() => {
    async function loadSocials() {
      try {
        const res: any = await settingsService.getSocials();
        if (Array.isArray(res)) {
          const formatted: SocialProfileItem[] = res.map((item: any, idx: number) => ({
            id: item.id || `soc-${idx}-${Date.now()}`,
            platform: item.platform || 'website',
            label: item.label || getPlatformBadge(item.platform || 'website'),
            url: item.url || '',
            isActive: item.isActive !== false,
          }));
          setProfiles(formatted);
        } else {
          // Fallback to checking /branding
          const brandRes: any = await settingsService.getBranding();
          if (Array.isArray(brandRes?.socialLinks)) {
            const formatted: SocialProfileItem[] = brandRes.socialLinks.map(
              (item: any, idx: number) => ({
                id: item.id || `soc-${idx}-${Date.now()}`,
                platform: item.platform || 'website',
                label: item.label || getPlatformBadge(item.platform || 'website'),
                url: item.url || '',
                isActive: item.isActive !== false,
              })
            );
            setProfiles(formatted);
          }
        }
      } catch (err) {
        // Fallback default seeds if database fetch encounters error
        setProfiles([
          {
            id: 'soc-1',
            platform: 'linkedin',
            label: 'LinkedIn',
            url: 'https://linkedin.com/company/gypsym',
            isActive: true,
          },
          {
            id: 'soc-2',
            platform: 'twitter',
            label: 'X (Twitter)',
            url: 'https://twitter.com/gypsymtech',
            isActive: true,
          },
          {
            id: 'soc-3',
            platform: 'github',
            label: 'GitHub',
            url: 'https://github.com/gypsym',
            isActive: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadSocials();
  }, []);

  // Keyboard shortcut Ctrl/Cmd + S to save
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [profiles]);

  const handleAddProfile = (presetKey?: string) => {
    const preset = PRESET_PLATFORMS.find((p) => p.key === presetKey);
    const newProfile: SocialProfileItem = {
      id: `soc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      platform: preset ? preset.key : 'linkedin',
      label: preset ? preset.label : 'LinkedIn',
      url: preset ? preset.defaultUrl : 'https://linkedin.com/company/',
      isActive: true,
    };
    setProfiles((prev) => [...prev, newProfile]);
    setHasChanges(true);
    notify.info(`Added ${newProfile.label} profile slot.`);
  };

  const handleUpdate = (id: string, updates: Partial<SocialProfileItem>) => {
    setProfiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    setHasChanges(true);
  };

  const handleDelete = (id: string) => {
    setProfiles((prev) => prev.filter((item) => item.id !== id));
    setHasChanges(true);
    notify.info('Profile removed from active list.');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= profiles.length) return;
    const newItems = [...profiles];
    const [moved] = newItems.splice(index, 1);
    if (moved) {
      newItems.splice(targetIndex, 0, moved);
      setProfiles(newItems);
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    // Validate URLs
    for (const p of profiles) {
      if (!p.url.trim()) {
        notify.error(`Please provide a URL for ${p.label || p.platform}.`);
        return;
      }
      if (!isValidHttpUrl(p.url.trim())) {
        notify.error(`Invalid URL format for ${p.label || p.platform}: must start with http:// or https://`);
        return;
      }
    }

    setSaving(true);
    try {
      // 1. Save directly via dedicated /socials endpoint
      await settingsService.updateSocials(profiles);

      // 2. Also keep /branding synchronized
      try {
        await settingsService.updateBranding({ socialLinks: profiles });
      } catch {
        // Silently continue if /branding PUT had minor validation differences
      }

      // 3. Dispatch live window events for cross-tab sync with public footer
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('gypsym_footer_updated'));
      }

      setHasChanges(false);
      notify.success('Social profiles updated and synchronized with website footer!');
    } catch (err: any) {
      notify.error(err?.message || 'Failed to update social profiles.');
    } finally {
      setSaving(false);
    }
  };

  // Find which major preset platforms are not yet added to suggest quick adds
  const activeKeys = new Set(profiles.map((p) => p.platform.toLowerCase()));
  const missingPresets = PRESET_PLATFORMS.filter((p) => !activeKeys.has(p.key) && p.key !== 'website');
  const activeCount = profiles.filter((p) => p.isActive).length;

  return (
    <AdminContentContainer variant="standard">
      <AdminPageHeader
        title="Social Profiles"
        description="Configure official brand profiles, community handles, and developer channels shown across Gypsym's public website footer and contact sections."
        status={
          <div className="flex items-center gap-1.5 text-xs font-mono tracking-wider text-primary uppercase">
            <Share2 className="w-3.5 h-3.5" />
            <span>Public Channels</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddProfile()}
              className="gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom</span>
            </Button>

            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="gap-1.5 shadow-xs cursor-pointer min-w-[105px]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : hasChanges ? (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* ── QUICK ADD PRESET BAR ── */}
      {missingPresets.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-100/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Quick Add Popular Platforms</span>
            </div>
            <span className="text-[11px] text-slate-500">Click to instantly insert</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {missingPresets.slice(0, 7).map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => handleAddProfile(preset.key)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-blue-50 border border-slate-200/90 hover:border-blue-200 text-slate-700 hover:text-blue-700 shadow-2xs transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus className="w-3 h-3 text-blue-600" />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── LIVE PREVIEW CARD ── */}
      <Card className="rounded-2xl border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-800">Live Website Footer Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono bg-slate-50 text-slate-600 border-slate-200">
              {activeCount} Active {activeCount === 1 ? 'Channel' : 'Channels'}
            </Badge>
          </div>
        </div>

        {/* Public Footer Mockup Container */}
        <div className="p-6 rounded-xl bg-neutral-950 text-white border border-neutral-800 space-y-3">
          <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
            Public Website Footer View
          </div>
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {profiles.filter((p) => p.isActive).length === 0 ? (
              <div className="text-xs text-neutral-500 italic py-2">
                No active social profiles configured. Turn on the toggle switch below to make channels visible.
              </div>
            ) : (
              profiles
                .filter((p) => p.isActive)
                .map((profile) => (
                  <a
                    key={profile.id}
                    href={profile.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={profile.label || profile.platform}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-white/[0.2] text-neutral-300 hover:text-white transition-all transform hover:-translate-y-0.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>{profile.label || getPlatformBadge(profile.platform)}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-40" />
                  </a>
                ))
            )}
          </div>
        </div>
      </Card>

      {/* ── PROFILE LIST CARD ── */}
      <Card className="rounded-2xl border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">
              Configured Social Profiles ({profiles.length})
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Reorder channels using the arrow buttons. Public visitors will see them in this exact order.
            </CardDescription>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => handleAddProfile()}
            className="rounded-xl h-8 px-3 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Channel</span>
          </Button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs">Loading social profiles from database...</span>
          </div>
        ) : profiles.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl space-y-3">
            <Share2 className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-700">No social profiles configured</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Add Gypsym&apos;s corporate LinkedIn, X (Twitter), GitHub, or Instagram links to connect with visitors.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => handleAddProfile('linkedin')}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-8 px-4 text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add LinkedIn Profile
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {profiles.map((profile, index) => {
              const isFirst = index === 0;
              const isLast = index === profiles.length - 1;
              const hasValidUrl = isValidHttpUrl(profile.url);

              return (
                <div
                  key={profile.id}
                  className={`p-4 rounded-xl border transition-all ${
                    profile.isActive
                      ? 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-2xs'
                      : 'border-slate-200/50 bg-slate-50/60 opacity-60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    {/* Reorder Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isFirst}
                        onClick={() => handleMove(index, 'up')}
                        title="Move Up"
                        className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isLast}
                        onClick={() => handleMove(index, 'down')}
                        title="Move Down"
                        className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Platform Selector */}
                    <div className="w-full md:w-44 shrink-0">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Platform
                      </label>
                      <select
                        value={profile.platform}
                        onChange={(e) => {
                          const chosenPlatform = e.target.value;
                          const preset = PRESET_PLATFORMS.find((p) => p.key === chosenPlatform);
                          handleUpdate(profile.id, {
                            platform: chosenPlatform,
                            label: profile.label === getPlatformBadge(profile.platform) && preset ? preset.label : profile.label,
                            url: profile.url ? profile.url : preset?.defaultUrl || '',
                          });
                        }}
                        className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {PRESET_PLATFORMS.map((preset) => (
                          <option key={preset.key} value={preset.key}>
                            {preset.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Display Label */}
                    <div className="w-full md:w-48 shrink-0">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Display Label
                      </label>
                      <Input
                        value={profile.label || ''}
                        onChange={(e) => handleUpdate(profile.id, { label: e.target.value })}
                        placeholder={getPlatformBadge(profile.platform)}
                        className="text-xs rounded-xl h-9"
                      />
                    </div>

                    {/* URL Input */}
                    <div className="w-full md:flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Target URL
                        </label>
                        {!hasValidUrl && profile.url.trim().length > 0 && (
                          <span className="text-[10px] text-red-500 flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3" />
                            Requires http:// or https://
                          </span>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <Input
                          value={profile.url}
                          onChange={(e) => handleUpdate(profile.id, { url: e.target.value })}
                          placeholder="https://..."
                          className={`text-xs rounded-xl h-9 pr-9 font-mono ${
                            !hasValidUrl && profile.url.trim().length > 0 ? 'border-red-300 focus-visible:ring-red-400' : ''
                          }`}
                        />
                        {hasValidUrl && (
                          <a
                            href={profile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Test Link in New Tab"
                            className="absolute right-2.5 text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Visibility Switch */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-4">
                      <Switch
                        checked={profile.isActive}
                        onCheckedChange={(val) => handleUpdate(profile.id, { isActive: val })}
                      />
                      <span className="text-[11px] font-medium text-slate-600">
                        {profile.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>

                    {/* Delete Button */}
                    <div className="shrink-0 pt-2 md:pt-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(profile.id)}
                        title="Delete Profile"
                        className="h-8 w-8 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </AdminContentContainer>
  );
}
