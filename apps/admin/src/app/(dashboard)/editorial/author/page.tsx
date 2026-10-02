'use client';

import * as React from 'react';
import {
  User,
  Save,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Linkedin,
  Twitter,
  Github,
  Award,
  CheckCircle2,
  Plus,
  X,
  FileText,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { fetchApi } from '@/lib/api-client';
import { notify } from '@/lib/notifications';
import { AdminContentContainer, AdminPageHeader } from '@/components/layout/admin-page';
import { getSiteUrl } from '@/lib/site-url';

interface AuthorProfileData {
  name: string;
  role: string;
  avatar: string;
  bio: string;
  extendedBio: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  socials: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  expertise: string[];
  credentials: string[];
}

const DEFAULT_PROFILE: AuthorProfileData = {
  name: 'MohammadAli Kadiwal',
  role: 'Chief Technology Officer & Lead Architect',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  bio: 'Leading high-concurrency cloud architectures, Next.js commerce ecosystems, and distributed microservices with over a decade of hands-on production engineering.',
  extendedBio: 'MohammadAli Kadiwal is the Chief Technology Officer and Lead Solutions Architect at Gypsym Technology. Specializing in cloud infrastructure, headless e-commerce, and high-performance engineering, he oversees technical strategy and system architectures across enterprise client deployments globally.',
  email: 'author@gypsym.com',
  phone: '+1 (555) 019-2834',
  location: 'Dubai, UAE & San Francisco, CA',
  website: 'https://gypsym.com',
  socials: {
    linkedin: 'https://linkedin.com/company/gypsym',
    twitter: 'https://twitter.com/gypsym',
    github: 'https://github.com/gypsym',
    website: 'https://gypsym.com',
  },
  expertise: [
    'Cloud Architecture',
    'Next.js & React',
    'Distributed Systems',
    'Headless Commerce',
    'Cybersecurity',
    'AI & GEO Integration',
  ],
  credentials: [
    'AWS Certified Solutions Architect - Professional',
    'Google Cloud Certified Professional Cloud Architect',
    'Kubernetes CKA',
    'Shopify Plus Partner',
  ],
};

export default function EditorialAuthorSettingsPage() {
  const [profile, setProfile] = React.useState<AuthorProfileData>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [newExpertise, setNewExpertise] = React.useState('');
  const [newCredential, setNewCredential] = React.useState('');

  // Load author settings from backend
  const loadProfile = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi<any>('/cms/author-settings');
      const data = res?.data ?? res;
      if (data && typeof data === 'object') {
        setProfile({
          ...DEFAULT_PROFILE,
          ...data,
          socials: { ...DEFAULT_PROFILE.socials, ...(data.socials || {}) },
          expertise: Array.isArray(data.expertise) ? data.expertise : DEFAULT_PROFILE.expertise,
          credentials: Array.isArray(data.credentials) ? data.credentials : DEFAULT_PROFILE.credentials,
        });
      }
    } catch {
      notify.error('Could not load author settings. Using defaults.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      notify.error('Author Name is required.');
      return;
    }

    setIsSaving(true);
    try {
      await fetchApi('/cms/author-settings', {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
      notify.success('Author profile saved and published across all publications.');
    } catch (err: any) {
      notify.error(err.message || 'Failed to save author profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // Add Expertise tag
  const handleAddExpertise = () => {
    const trimmed = newExpertise.trim();
    if (!trimmed) return;
    if (profile.expertise.includes(trimmed)) {
      notify.error('Topic already added.');
      return;
    }
    setProfile((prev) => ({
      ...prev,
      expertise: [...prev.expertise, trimmed],
    }));
    setNewExpertise('');
  };

  // Remove Expertise tag
  const handleRemoveExpertise = (tag: string) => {
    setProfile((prev) => ({
      ...prev,
      expertise: prev.expertise.filter((t) => t !== tag),
    }));
  };

  // Add Credential tag
  const handleAddCredential = () => {
    const trimmed = newCredential.trim();
    if (!trimmed) return;
    if (profile.credentials.includes(trimmed)) {
      notify.error('Credential already added.');
      return;
    }
    setProfile((prev) => ({
      ...prev,
      credentials: [...prev.credentials, trimmed],
    }));
    setNewCredential('');
  };

  // Remove Credential tag
  const handleRemoveCredential = (cred: string) => {
    setProfile((prev) => ({
      ...prev,
      credentials: prev.credentials.filter((c) => c !== cred),
    }));
  };

  return (
    <AdminContentContainer variant="wide">
      <AdminPageHeader
        title="Author Profile & Byline Settings"
        description="Configure the primary author identity, credentials, professional bios, and social channels displayed across all engineering publications."
        status={
          <div className="flex items-center gap-1.5 text-xs font-mono tracking-wider text-primary uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Editorial Authority</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={loadProfile}
              disabled={isLoading}
              className="gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </Button>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-2 cursor-pointer"
            >
              <a
                href={`${getSiteUrl()}/blog`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Live Blog Hub</span>
              </a>
            </Button>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="gap-2 shadow-xs cursor-pointer"
            >
              {isSaving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Save Author Profile</span>
            </Button>
          </div>
        }
      />

      {/* ─── Two-Column Layout (Form on Left, Live Preview on Right) ────────── */}
      <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Fields */}
        <div className="xl:col-span-7 space-y-6">
          {/* Identity & Basic Info Card */}
          <Card className="p-6 bg-white border-slate-200/80 shadow-xs rounded-2xl space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Author Identity & Role</h3>
                <p className="text-xs text-slate-500">Core personal and organizational identifiers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Author Full Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  required
                  placeholder="e.g. MohammadAli Kadiwal"
                  className="bg-slate-50/50 border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Professional Title / Designation <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={profile.role}
                  onChange={(e) => setProfile((p) => ({ ...p, role: e.target.value }))}
                  required
                  placeholder="e.g. Chief Technology Officer & Lead Architect"
                  className="bg-slate-50/50 border-slate-200 text-sm"
                />
              </div>
            </div>

            {/* Avatar URL with inline image */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Author Avatar Image URL
              </label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as any).src = DEFAULT_PROFILE.avatar;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <Input
                  value={profile.avatar}
                  onChange={(e) => setProfile((p) => ({ ...p, avatar: e.target.value }))}
                  placeholder="https://... image URL (or data URI)"
                  className="bg-slate-50/50 border-slate-200 text-sm flex-1 font-mono text-xs"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Square headshot image URL (Unsplash or direct asset). Renders in article bylines and author cards.
              </p>
            </div>

            {/* Email, Phone, Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  placeholder="author@gypsym.com"
                  className="bg-slate-50/50 border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Location
                </label>
                <Input
                  value={profile.location || ''}
                  onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                  placeholder="Dubai, UAE"
                  className="bg-slate-50/50 border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Personal / Web Link
                </label>
                <Input
                  value={profile.website || ''}
                  onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                  placeholder="https://gypsym.com"
                  className="bg-slate-50/50 border-slate-200 text-sm"
                />
              </div>
            </div>
          </Card>

          {/* Biography Card */}
          <Card className="p-6 bg-white border-slate-200/80 shadow-xs rounded-2xl space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Biographical Summaries</h3>
                <p className="text-xs text-slate-500">Short summaries for cards and detailed overview for footer</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Short Byline Bio (Post Cards & List View) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                required
                placeholder="A 1-2 sentence executive summary of the author's primary technical domain..."
                className="w-full text-xs text-foreground bg-muted/30 border border-input rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Displays beneath author name on article pages and search engine snippets.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Extended Author Biography (Bottom Article Box)
              </label>
              <textarea
                rows={4}
                value={profile.extendedBio}
                onChange={(e) => setProfile((p) => ({ ...p, extendedBio: e.target.value }))}
                placeholder="Comprehensive technical background, leadership history, and publications overview..."
                className="w-full text-xs text-foreground bg-muted/30 border border-input rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-[11px] text-slate-400 mt-0.5">
                Full-width author bio block rendered at the conclusion of every individual technical article.
              </p>
            </div>
          </Card>

          {/* Social Profiles Card */}
          <Card className="p-6 bg-white border-slate-200/80 shadow-xs rounded-2xl space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Social & Professional Channels</h3>
                <p className="text-xs text-slate-500">Public links rendered in the author endorsement card</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                  LinkedIn Profile URL
                </label>
                <Input
                  value={profile.socials.linkedin || ''}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      socials: { ...p.socials, linkedin: e.target.value },
                    }))
                  }
                  placeholder="https://linkedin.com/in/username"
                  className="bg-slate-50/50 border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Twitter className="w-3.5 h-3.5 text-sky-500" />
                  Twitter / X Profile URL
                </label>
                <Input
                  value={profile.socials.twitter || ''}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      socials: { ...p.socials, twitter: e.target.value },
                    }))
                  }
                  placeholder="https://x.com/username"
                  className="bg-slate-50/50 border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-slate-800" />
                  GitHub Organization / Profile
                </label>
                <Input
                  value={profile.socials.github || ''}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      socials: { ...p.socials, github: e.target.value },
                    }))
                  }
                  placeholder="https://github.com/username"
                  className="bg-slate-50/50 border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  Personal Website / Portfolio
                </label>
                <Input
                  value={profile.socials.website || ''}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      socials: { ...p.socials, website: e.target.value },
                    }))
                  }
                  placeholder="https://gypsym.com"
                  className="bg-slate-50/50 border-slate-200 text-xs"
                />
              </div>
            </div>
          </Card>

          {/* Expertise Topics & Credentials */}
          <Card className="p-6 bg-white border-slate-200/80 shadow-xs rounded-2xl space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Expertise Topics & Credentials</h3>
                <p className="text-xs text-slate-500">Domain specializations and enterprise architectural credentials</p>
              </div>
            </div>

            {/* Expertise Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Technical Expertise Topics
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {profile.expertise.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 gap-1.5 px-2.5 py-1 text-xs"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExpertise(tag)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddExpertise();
                    }
                  }}
                  placeholder="Add technical domain (e.g. Distributed Consensus)..."
                  className="bg-slate-50/50 border-slate-200 text-xs flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddExpertise}
                  className="text-xs border-slate-300"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* Credentials */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Verified Credentials & Certifications
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {profile.credentials.map((cred) => (
                  <Badge
                    key={cred}
                    variant="outline"
                    className="bg-emerald-50/60 text-emerald-800 border-emerald-200 gap-1.5 px-2.5 py-1 text-xs"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{cred}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCredential(cred)}
                      className="text-emerald-400 hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={newCredential}
                  onChange={(e) => setNewCredential(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCredential();
                    }
                  }}
                  placeholder="Add certification (e.g. AWS Certified Solutions Architect)..."
                  className="bg-slate-50/50 border-slate-200 text-xs flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCredential}
                  className="text-xs border-slate-300"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Real-Time Previews */}
        <div className="xl:col-span-5 space-y-6 sticky top-24">
          <div className="bg-card text-card-foreground rounded-2xl p-6 shadow-sm border border-border space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-primary uppercase">
                <BookOpen className="w-4 h-4" />
                Live Publication Preview
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">Dynamic Rendering</span>
            </div>

            {/* Byline Preview */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                1. Post Header Byline Preview
              </span>
              <div className="bg-muted/40 rounded-xl p-4 border border-border flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary shrink-0 bg-muted">
                  <img
                    src={profile.avatar || DEFAULT_PROFILE.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).src = DEFAULT_PROFILE.avatar;
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <span>{profile.name || 'Author Name'}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="text-xs text-primary font-medium truncate">
                    {profile.role || 'Designation'}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                    {profile.bio || 'Short executive bio...'}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Author Box Preview */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                2. Post Footer Author Card Preview
              </span>
              <div className="bg-card text-card-foreground rounded-xl p-5 border border-border shadow-xs space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-border shrink-0 bg-muted shadow-xs">
                    <img
                      src={profile.avatar || DEFAULT_PROFILE.avatar}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as any).src = DEFAULT_PROFILE.avatar;
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      About the Author
                    </div>
                    <div className="text-base font-bold text-foreground mt-0.5">
                      {profile.name || 'Author Name'}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {profile.role || 'Designation'}
                    </div>

                    {profile.location && (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {profile.extendedBio || profile.bio || 'Author biography overview...'}
                </p>

                {/* Social icons */}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  {profile.socials.linkedin && (
                    <a
                      href={profile.socials.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-muted text-primary hover:bg-muted/80 transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {profile.socials.twitter && (
                    <a
                      href={profile.socials.twitter}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-muted text-sky-500 hover:bg-muted/80 transition-colors"
                      title="Twitter / X"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {profile.socials.github && (
                    <a
                      href={profile.socials.github}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
                      title="GitHub"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {profile.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="p-1.5 rounded-lg bg-muted text-rose-500 hover:bg-muted/80 transition-colors"
                      title="Email Author"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors ml-auto text-xs flex items-center gap-1 font-medium"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Saves to PostgreSQL database
              </span>
              <Button
                type="submit"
                disabled={isSaving}
                className="font-bold gap-2 text-xs shadow-xs cursor-pointer"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </form>
    </AdminContentContainer>
  );
}
