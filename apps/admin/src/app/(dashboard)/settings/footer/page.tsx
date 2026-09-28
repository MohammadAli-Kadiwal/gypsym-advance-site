'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { fetchApi, normalizeErrorMessage } from '@/lib/api-client';
import { notify } from '@/lib/notifications';
import {
  Save,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  ChevronDown,
  ChevronRight,
  PanelBottom,
  Globe,
  FileText,
  ExternalLink,
  Eye,
  Loader2,
  CheckCircle2,
  Sparkles,
  Tag,
} from 'lucide-react';

interface CmsPageOption {
  id: string;
  title: string;
  slug: string;
  url: string;
}

interface NavItemChild {
  id?: string;
  label: string;
  url: string;
  isExternal?: boolean;
  displayOrder?: number;
  isActive?: boolean;
}

interface NavGroupItem {
  id?: string;
  label: string;
  url?: string;
  displayOrder?: number;
  isActive?: boolean;
  children: NavItemChild[];
}

interface RegionLink {
  id: string;
  label: string;
  url: string;
  isExternal?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

interface RegionItem {
  id: string;
  name: string;
  code: string;
  label: string;
  displayOrder: number;
  isActive: boolean;
  links: RegionLink[];
}

interface LegalLinkItem {
  id: string;
  label: string;
  url: string;
  isExternal?: boolean;
  displayOrder: number;
  isActive: boolean;
}

interface BadgeItem {
  id: string;
  title: string;
  imageUrl?: string;
  url?: string;
  displayOrder: number;
  isActive: boolean;
}

interface KeywordItem {
  id: string;
  label: string;
  url?: string;
  displayOrder: number;
  isActive: boolean;
}

interface KeywordsConfig {
  enabled: boolean;
  title: string;
  searchable: boolean;
  items: KeywordItem[];
}

interface FooterConfigState {
  enabled: boolean;
  layout: {
    containerWidth: 'standard' | 'wide' | 'full';
    borderRadius: 'medium' | 'large' | 'extra-large';
    sectionSpacing: 'compact' | 'standard' | 'spacious';
  };
  appearance: {
    themeMode: 'inherit' | 'dark' | 'light';
    surfaceColor: string;
    borderColor: string;
    glowEffect: boolean;
  };
  brand: {
    description: string;
    logoVariant: 'default' | 'light' | 'dark' | 'custom';
    customLogoUrl: string;
  };
  contact: {
    enabled: boolean;
    showEmail: boolean;
    showPhone: boolean;
    showAddress: boolean;
    emailOverride: string;
    phoneOverride: string;
    addressOverride: string;
    badgeText: string;
  };
  regions: RegionItem[];
  largeBrandMark: {
    enabled: boolean;
    type: 'wordmark_text' | 'logo_svg';
    textOverride: string;
    size: 'compact' | 'medium' | 'large';
    opacity: number;
    alignment: 'left' | 'center' | 'right';
  };
  badges: BadgeItem[];
  legalLinks: LegalLinkItem[];
  copyright: {
    template: string;
  };
  cta: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    description: string;
    buttonLabel: string;
    buttonUrl: string;
  };
  keywords: KeywordsConfig;
}

const DEFAULT_CONFIG: FooterConfigState = {
  enabled: true,
  layout: {
    containerWidth: 'wide',
    borderRadius: 'extra-large',
    sectionSpacing: 'spacious',
  },
  appearance: {
    themeMode: 'inherit',
    surfaceColor: '#07090e',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    glowEffect: true,
  },
  brand: {
    description: 'Engineering the next era of high-frequency commerce, resilient cloud systems, and sovereign AI for visionary global brands.',
    logoVariant: 'default',
    customLogoUrl: '',
  },
  contact: {
    enabled: true,
    showEmail: true,
    showPhone: true,
    showAddress: true,
    emailOverride: '',
    phoneOverride: '',
    addressOverride: '',
    badgeText: 'Global Engineering Office',
  },
  regions: [],
  largeBrandMark: {
    enabled: true,
    type: 'wordmark_text',
    textOverride: '',
    size: 'large',
    opacity: 0.12,
    alignment: 'center',
  },
  badges: [],
  legalLinks: [
    { id: 'leg-1', label: 'Privacy Policy', url: '/privacy', isExternal: false, displayOrder: 1, isActive: true },
    { id: 'leg-2', label: 'Terms of Service', url: '/terms', isExternal: false, displayOrder: 2, isActive: true },
    { id: 'leg-3', label: 'Security & Certifications', url: '/trust/certifications', isExternal: false, displayOrder: 3, isActive: true },
    { id: 'leg-4', label: 'Cookie Declaration', url: '/cookies', isExternal: false, displayOrder: 4, isActive: true },
    { id: 'leg-5', label: 'Sitemap', url: '/sitemap.xml', isExternal: false, displayOrder: 5, isActive: true },
  ],
  copyright: {
    template: '© {year} {brand}. All rights reserved.',
  },
  cta: {
    enabled: false,
    eyebrow: 'PARTNER WITH US',
    title: 'Ready to build the next-generation enterprise?',
    description: 'Schedule a dedicated architecture session with our principal engineers.',
    buttonLabel: "Let's Talk",
    buttonUrl: '/book',
  },
  keywords: {
    enabled: true,
    title: 'Trending Capabilities & Directory',
    searchable: false,
    items: [],
  },
};

export default function FooterSettingsPage() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('general');

  // Server state
  const [config, setConfig] = React.useState<FooterConfigState>(DEFAULT_CONFIG);
  const [navGroups, setNavGroups] = React.useState<NavGroupItem[]>([]);
  const [cmsPages, setCmsPages] = React.useState<CmsPageOption[]>([]);
  const [branding, setBranding] = React.useState<any>(null);
  const [contactDefaults, setContactDefaults] = React.useState<any>(null);
  const [entityDefaults, setEntityDefaults] = React.useState<any>(null);

  // UI accordion toggles
  const [expandedGroupIdx, setExpandedGroupIdx] = React.useState<number | null>(0);
  const [expandedRegionIdx, setExpandedRegionIdx] = React.useState<number | null>(0);

  // Load footer data from API
  const loadFooterData = React.useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await fetchApi('/admin/footer');
      if (res?.data) {
        const d = res.data;
        if (d.config) {
          setConfig({
            ...DEFAULT_CONFIG,
            ...d.config,
            layout: { ...DEFAULT_CONFIG.layout, ...(d.config.layout || {}) },
            appearance: { ...DEFAULT_CONFIG.appearance, ...(d.config.appearance || {}) },
            brand: { ...DEFAULT_CONFIG.brand, ...(d.config.brand || {}) },
            contact: { ...DEFAULT_CONFIG.contact, ...(d.config.contact || {}) },
            largeBrandMark: { ...DEFAULT_CONFIG.largeBrandMark, ...(d.config.largeBrandMark || {}) },
            copyright: { ...DEFAULT_CONFIG.copyright, ...(d.config.copyright || {}) },
            cta: { ...DEFAULT_CONFIG.cta, ...(d.config.cta || {}) },
            keywords: d.config.keywords || DEFAULT_CONFIG.keywords,
            regions: d.config.regions || [],
            legalLinks: d.config.legalLinks?.length ? d.config.legalLinks : DEFAULT_CONFIG.legalLinks,
            badges: d.config.badges || [],
          });
        }
        if (d.navigation?.items) {
          setNavGroups(
            d.navigation.items.map((item: any, idx: number) => ({
              id: item.id || `group-${idx}`,
              label: item.label || 'Untitled Group',
              url: item.url || '/services',
              displayOrder: item.displayOrder ?? idx + 1,
              isActive: item.isActive ?? true,
              children: (item.children || []).map((c: any, cIdx: number) => ({
                id: c.id || `item-${idx}-${cIdx}`,
                label: c.label || 'Link Label',
                url: c.url || '/',
                isExternal: c.isExternal ?? false,
                displayOrder: c.displayOrder ?? cIdx + 1,
                isActive: c.isActive ?? true,
              })),
            }))
          );
        }
        if (d.pages) {
          setCmsPages(d.pages);
        }
        setBranding(d.branding || null);
        setContactDefaults(d.contact || null);
        setEntityDefaults(d.entity || null);
      }
    } catch (err) {
      notify.error(normalizeErrorMessage(err, 'Unable to load footer settings.'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadFooterData();
  }, [loadFooterData]);

  // Save changes
  const handleSave = async () => {
    try {
      setSaving(true);

      // Normalize display orders safely
      const normalizedNav = (navGroups || []).map((group, gIdx) => ({
        ...group,
        displayOrder: gIdx + 1,
        children: (group.children || []).map((child, cIdx) => ({
          ...child,
          displayOrder: cIdx + 1,
        })),
      }));

      const normalizedRegions = (config.regions || []).map((region, rIdx) => ({
        ...region,
        displayOrder: rIdx + 1,
        links: (region.links || []).map((link, lIdx) => ({
          ...link,
          displayOrder: lIdx + 1,
        })),
      }));

      const normalizedLegal = (config.legalLinks || []).map((link, lIdx) => ({
        ...link,
        displayOrder: lIdx + 1,
      }));

      const normalizedKeywords = (config.keywords?.items || []).map((item, kIdx) => ({
        ...item,
        displayOrder: kIdx + 1,
      }));

      const payload = {
        config: {
          ...config,
          regions: normalizedRegions,
          legalLinks: normalizedLegal,
          keywords: {
            ...config.keywords,
            items: normalizedKeywords,
          },
        },
        navigation: {
          items: normalizedNav,
        },
      };

      try {
        await fetchApi('/admin/footer', {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } catch (adminErr: any) {
        // Fallback attempt via /footer endpoint
        await fetchApi('/footer', {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      }

      notify.success('✓ Footer settings updated successfully.');
      try {
        localStorage.setItem('gypsym_footer_updated', Date.now().toString());
        window.dispatchEvent(new Event('gypsym_footer_updated'));
      } catch {}
      loadFooterData();
    } catch (err) {
      console.error('Save footer failed:', err);
      notify.error(normalizeErrorMessage(err, 'Unable to save footer settings.'));
    } finally {
      setSaving(false);
    }
  };

  // ── Navigation Group CRUD Handlers ──
  const handleAddGroup = () => {
    const newGroup: NavGroupItem = {
      id: `group-new-${Date.now()}`,
      label: 'New Column',
      url: '/services',
      displayOrder: navGroups.length + 1,
      isActive: true,
      children: [],
    };
    setNavGroups([...navGroups, newGroup]);
    setExpandedGroupIdx(navGroups.length);
    notify.success('✓ Menu group created successfully.');
  };

  const handleRemoveGroup = (idx: number) => {
    const next = navGroups.filter((_, i) => i !== idx);
    setNavGroups(next);
    if (expandedGroupIdx === idx) setExpandedGroupIdx(null);
    notify.success('✓ Menu group deleted successfully.');
  };

  const handleMoveGroup = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= navGroups.length) return;
    const next = [...navGroups];
    const temp = next[idx]!;
    next[idx] = next[targetIdx]!;
    next[targetIdx] = temp;
    setNavGroups(next);
    setExpandedGroupIdx(targetIdx);
  };

  const handleAddChildItem = (groupIdx: number) => {
    const group = navGroups[groupIdx];
    if (!group) return;
    const newItem: NavItemChild = {
      id: `child-new-${Date.now()}`,
      label: 'New Link',
      url: '/',
      isExternal: false,
      displayOrder: group.children.length + 1,
      isActive: true,
    };
    const nextGroups = [...navGroups];
    nextGroups[groupIdx] = {
      ...group,
      children: [...group.children, newItem],
    };
    setNavGroups(nextGroups);
    notify.success('✓ Menu item created successfully.');
  };

  const handleRemoveChildItem = (groupIdx: number, childIdx: number) => {
    const group = navGroups[groupIdx];
    if (!group) return;
    const nextGroups = [...navGroups];
    nextGroups[groupIdx] = {
      ...group,
      children: group.children.filter((_, i) => i !== childIdx),
    };
    setNavGroups(nextGroups);
    notify.success('✓ Menu item deleted successfully.');
  };

  const handleMoveChildItem = (groupIdx: number, childIdx: number, direction: 'up' | 'down') => {
    const group = navGroups[groupIdx];
    if (!group) return;
    const targetIdx = direction === 'up' ? childIdx - 1 : childIdx + 1;
    if (targetIdx < 0 || targetIdx >= group.children.length) return;
    const nextChildren = [...group.children];
    const temp = nextChildren[childIdx]!;
    nextChildren[childIdx] = nextChildren[targetIdx]!;
    nextChildren[targetIdx] = temp;

    const nextGroups = [...navGroups];
    nextGroups[groupIdx] = {
      ...group,
      children: nextChildren,
    };
    setNavGroups(nextGroups);
  };

  // ── Region CRUD Handlers ──
  const handleAddRegion = () => {
    const newRegion: RegionItem = {
      id: `reg-${Date.now()}`,
      name: 'New Country',
      code: 'GL',
      label: 'Regional Hub',
      displayOrder: config.regions.length + 1,
      isActive: true,
      links: [],
    };
    setConfig({
      ...config,
      regions: [...config.regions, newRegion],
    });
    setExpandedRegionIdx(config.regions.length);
    notify.success('✓ Region created successfully.');
  };

  const handleRemoveRegion = (idx: number) => {
    const next = config.regions.filter((_, i) => i !== idx);
    setConfig({ ...config, regions: next });
    if (expandedRegionIdx === idx) setExpandedRegionIdx(null);
    notify.success('✓ Region deleted successfully.');
  };

  const handleMoveRegion = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= config.regions.length) return;
    const next = [...config.regions];
    const temp = next[idx]!;
    next[idx] = next[targetIdx]!;
    next[targetIdx] = temp;
    setConfig({ ...config, regions: next });
    setExpandedRegionIdx(targetIdx);
  };

  const handleAddRegionLink = (regionIdx: number) => {
    const region = config.regions[regionIdx];
    if (!region) return;
    const newLink: RegionLink = {
      id: `rlink-${Date.now()}`,
      label: 'Regional Specialization',
      url: '/services',
      isExternal: false,
      displayOrder: region.links.length + 1,
      isActive: true,
    };
    const nextRegions = [...config.regions];
    nextRegions[regionIdx] = {
      ...region,
      links: [...region.links, newLink],
    };
    setConfig({ ...config, regions: nextRegions });
  };

  const handleRemoveRegionLink = (regionIdx: number, linkIdx: number) => {
    const region = config.regions[regionIdx];
    if (!region) return;
    const nextRegions = [...config.regions];
    nextRegions[regionIdx] = {
      ...region,
      links: region.links.filter((_, i) => i !== linkIdx),
    };
    setConfig({ ...config, regions: nextRegions });
  };

  // ── Legal Link CRUD Handlers ──
  const handleAddLegalLink = () => {
    const newLink: LegalLinkItem = {
      id: `leg-${Date.now()}`,
      label: 'New Policy',
      url: '/privacy',
      isExternal: false,
      displayOrder: config.legalLinks.length + 1,
      isActive: true,
    };
    setConfig({
      ...config,
      legalLinks: [...config.legalLinks, newLink],
    });
  };

  const handleRemoveLegalLink = (idx: number) => {
    setConfig({
      ...config,
      legalLinks: config.legalLinks.filter((_, i) => i !== idx),
    });
  };

  const handleMoveLegalLink = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= config.legalLinks.length) return;
    const next = [...config.legalLinks];
    const temp = next[idx]!;
    next[idx] = next[targetIdx]!;
    next[targetIdx] = temp;
    setConfig({ ...config, legalLinks: next });
  };

  // ── Badge CRUD Handlers ──
  const handleAddBadge = () => {
    const newBadge: BadgeItem = {
      id: `badge-${Date.now()}`,
      title: 'Partner Certification',
      imageUrl: '',
      url: '',
      displayOrder: config.badges.length + 1,
      isActive: true,
    };
    setConfig({
      ...config,
      badges: [...config.badges, newBadge],
    });
  };

  const handleRemoveBadge = (idx: number) => {
    setConfig({
      ...config,
      badges: config.badges.filter((_, i) => i !== idx),
    });
  };

  // ── Keywords CRUD Handlers ──
  const [batchKeywordText, setBatchKeywordText] = React.useState('');

  const handleAddKeyword = () => {
    const newItem: KeywordItem = {
      id: `kw-${Date.now()}`,
      label: 'New Capability',
      url: '/services',
      displayOrder: (config.keywords?.items?.length || 0) + 1,
      isActive: true,
    };
    setConfig({
      ...config,
      keywords: {
        ...config.keywords,
        items: [...(config.keywords?.items || []), newItem],
      },
    });
    notify.success('✓ Keyword added.');
  };

  const handleRemoveKeyword = (idx: number) => {
    const next = (config.keywords?.items || []).filter((_, i) => i !== idx);
    setConfig({
      ...config,
      keywords: {
        ...config.keywords,
        items: next,
      },
    });
    notify.success('✓ Keyword removed.');
  };

  const handleMoveKeyword = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const items = config.keywords?.items || [];
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const next = [...items];
    const temp = next[idx]!;
    next[idx] = next[targetIdx]!;
    next[targetIdx] = temp;
    setConfig({
      ...config,
      keywords: {
        ...config.keywords,
        items: next,
      },
    });
  };

  const handleBatchAddKeywords = () => {
    const trimmed = batchKeywordText.trim();
    if (!trimmed) return;
    const lines = trimmed
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (lines.length === 0) return;

    const currentItems = config.keywords?.items || [];
    const newItems: KeywordItem[] = lines.map((label, i) => ({
      id: `kw-${Date.now()}-${i}`,
      label,
      url: '/services',
      displayOrder: currentItems.length + i + 1,
      isActive: true,
    }));

    setConfig({
      ...config,
      keywords: {
        ...config.keywords,
        items: [...currentItems, ...newItems],
      },
    });
    setBatchKeywordText('');
    notify.success(`✓ Added ${newItems.length} keywords.`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Loading global footer configurations...
        </p>
      </div>
    );
  }

  const brandName = branding?.companyName || entityDefaults?.companyName || 'Gypsym Technology';

  return (
    <div className="space-y-6 w-full pb-24 max-w-6xl mx-auto">
      {/* Top Header Bar — Consistent with Admin Workstation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Footer Settings
            </h1>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-semibold gap-1.5 py-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Global Component
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Configure multi-column navigation, regional market directories, brand mark, legal disclosures, and dynamic styling.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-4 text-xs font-semibold shadow-xs gap-1.5 min-w-[130px]"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100/80 p-1.5 rounded-2xl flex flex-wrap gap-1 border border-slate-200/80 h-auto shadow-2xs">
          <TabsTrigger value="general" className="text-xs font-medium rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs px-3.5 py-1.5 transition-all">General</TabsTrigger>
          <TabsTrigger value="brand" className="text-xs font-medium rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs px-3.5 py-1.5 transition-all">Brand</TabsTrigger>
          <TabsTrigger value="navigation" className="text-xs font-medium rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs px-3.5 py-1.5 transition-all">
            Navigation ({navGroups.length})
          </TabsTrigger>
          <TabsTrigger value="keywords" className="text-xs font-medium rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs px-3.5 py-1.5 transition-all">
            Keywords ({config.keywords?.items?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="contact" className="text-xs font-medium rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs px-3.5 py-1.5 transition-all">Contact</TabsTrigger>
          <TabsTrigger value="regions" className="text-xs font-medium rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs px-3.5 py-1.5 transition-all">
            Regions ({config.regions.length})
          </TabsTrigger>
          <TabsTrigger value="large-brand" className="text-xs font-medium rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs px-3.5 py-1.5 transition-all">Large Mark</TabsTrigger>
          <TabsTrigger value="legal" className="text-xs font-medium rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs px-3.5 py-1.5 transition-all">
            Legal ({config.legalLinks.length})
          </TabsTrigger>
          <TabsTrigger value="badges" className="text-xs font-medium rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs px-3.5 py-1.5 transition-all">Badges</TabsTrigger>
          <TabsTrigger value="cta" className="text-xs font-medium rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs px-3.5 py-1.5 transition-all">CTA Banner</TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs font-medium rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs px-3.5 py-1.5 transition-all">Appearance</TabsTrigger>
          <TabsTrigger value="preview" className="text-xs font-medium rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs px-3.5 py-1.5 transition-all flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </TabsTrigger>
        </TabsList>

        {/* ── TAB: GENERAL ── */}
        <TabsContent value="general" className="space-y-6">
          <Card className="p-6 rounded-2xl border-slate-200/90 bg-white shadow-xs space-y-6">
            <CardHeader className="p-0 border-b border-slate-100 pb-4">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <PanelBottom className="w-4 h-4 text-blue-600" />
                <span>Footer Visibility & Sizing</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Global rendering toggle and responsive outer container proportions.
              </CardDescription>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/60">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-foreground">Enable Global Footer</div>
                  <div className="text-[11px] text-muted-foreground">
                    Master toggle to render the footer on all public pages.
                  </div>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(val) => setConfig({ ...config, enabled: val })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Container Width</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['standard', 'wide', 'full'] as const).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          layout: { ...config.layout, containerWidth: w },
                        })
                      }
                      className={`py-2 px-3 rounded-lg border text-xs font-medium capitalize transition-all ${
                        config.layout.containerWidth === w
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Standard (1152px), or Wide / Full (Full width matching hero section margins).
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Border Radius Preset</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['medium', 'large', 'extra-large'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          layout: { ...config.layout, borderRadius: r },
                        })
                      }
                      className={`py-2 px-3 rounded-lg border text-xs font-medium capitalize transition-all ${
                        config.layout.borderRadius === r
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {r.replace('-', ' ')}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Controls the curvature of the outer floating container card.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Section Vertical Padding</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['compact', 'standard', 'spacious'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          layout: { ...config.layout, sectionSpacing: s },
                        })
                      }
                      className={`py-2 px-3 rounded-lg border text-xs font-medium capitalize transition-all ${
                        config.layout.sectionSpacing === s
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ── TAB: BRAND ── */}
        <TabsContent value="brand" className="space-y-6">
          <Card className="p-6 rounded-2xl border-slate-200/90 bg-white shadow-xs space-y-6">
            <CardHeader className="p-0 border-b border-slate-100 pb-4">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Dynamic Branding & Description</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Footer automatically consumes active brand logo and name from Dynamic Branding. You can customize the footer mission statement here.
              </CardDescription>
            </CardHeader>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-foreground">
                    Current Active Brand: <span className="text-primary">{brandName}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Logo and brand styling are shared across the entire site via Dynamic Branding.
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs shrink-0 self-start sm:self-auto"
                >
                  <a
                    href="/site/branding"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span>Manage Global Branding</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </Button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Footer Company Statement / Mission
                </label>
                <Textarea
                  rows={3}
                  value={config.brand.description}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      brand: { ...config.brand, description: e.target.value },
                    })
                  }
                  placeholder="Engineering digital products and experiences for ambitious businesses worldwide..."
                  className="text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Displayed beneath the logo on the left brand column.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card/60 space-y-3">
                <ImageUploadField
                  label="Footer Logo (Upload or URL Override)"
                  description="Upload a custom logo file (SVG, PNG, WebP) directly or enter an image URL. Leave blank to automatically use your dynamic global brand logo."
                  value={config.brand.customLogoUrl || ''}
                  onChange={(url) =>
                    setConfig({
                      ...config,
                      brand: { ...config.brand, customLogoUrl: url },
                    })
                  }
                  placeholder="Leave blank to use dynamic brand logo automatically"
                  previewDark={true}
                  maxSizeMb={5}
                />
                <p className="text-[11px] text-muted-foreground">
                  Rendered on an obsidian dark preview surface matching the footer aesthetic. If empty, Gypsym Dynamic Branding automatically serves your brand logo.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ── TAB: NAVIGATION (MENU GROUPS & ITEMS) ── */}
        <TabsContent value="navigation" className="space-y-6">
          <Card className="p-6 rounded-2xl border-slate-200/90 bg-white shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <PanelBottom className="w-4 h-4 text-blue-600" />
                  <span>Footer Menu Columns & Links</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Organize footer navigation into dynamic columns. Reorder with up/down arrows or drag-and-drop. On mobile viewports, columns automatically collapse into accessible accordions.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={handleAddGroup}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-4 text-xs font-semibold shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Column</span>
              </Button>
            </div>

            {navGroups.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-xl space-y-3">
                <PanelBottom className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground">
                  No footer menu groups configured.
                </p>
                <Button size="sm" variant="outline" onClick={handleAddGroup}>
                  + Add Menu Group
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {navGroups.map((group, groupIdx) => {
                  const isExpanded = expandedGroupIdx === groupIdx;

                  return (
                    <div
                      key={group.id || groupIdx}
                      className="border border-border rounded-xl overflow-hidden bg-card/40 transition-all"
                    >
                      {/* Group Header */}
                      <div className="flex items-center justify-between p-3.5 bg-muted/40 border-b border-border/40">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center space-x-0.5 text-muted-foreground">
                            <button
                              type="button"
                              onClick={() => handleMoveGroup(groupIdx, 'up')}
                              disabled={groupIdx === 0}
                              className="p-1 hover:text-foreground disabled:opacity-30"
                              title="Move Column Left / Up"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveGroup(groupIdx, 'down')}
                              disabled={groupIdx === navGroups.length - 1}
                              className="p-1 hover:text-foreground disabled:opacity-30"
                              title="Move Column Right / Down"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedGroupIdx(isExpanded ? null : groupIdx)
                            }
                            className="flex items-center gap-2 text-left group/btn"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="font-semibold text-xs text-foreground group-hover/btn:text-primary transition-colors">
                              {group.label || 'Untitled Column'}
                            </span>
                            <Badge variant="secondary" className="text-[10px] font-mono">
                              {group.children.length} links
                            </Badge>
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-muted-foreground font-mono">
                              Active
                            </span>
                            <Switch
                              checked={group.isActive !== false}
                              onCheckedChange={(val) => {
                                const next = [...navGroups];
                                next[groupIdx] = { ...group, isActive: val };
                                setNavGroups(next);
                              }}
                            />
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveGroup(groupIdx)}
                            className="text-destructive hover:bg-destructive/10 h-7 w-7"
                            title="Delete Column"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Group Body & Nested Items */}
                      {isExpanded && (
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-foreground">
                                Column Heading
                              </label>
                              <Input
                                value={group.label}
                                onChange={(e) => {
                                  const next = [...navGroups];
                                  next[groupIdx] = { ...group, label: e.target.value };
                                  setNavGroups(next);
                                }}
                                className="text-xs h-8"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-foreground">
                                Fallback Category URL
                              </label>
                              <Input
                                value={group.url || ''}
                                onChange={(e) => {
                                  const next = [...navGroups];
                                  next[groupIdx] = { ...group, url: e.target.value };
                                  setNavGroups(next);
                                }}
                                className="text-xs h-8 font-mono"
                                placeholder="/services"
                              />
                            </div>
                          </div>

                          {/* Nested Menu Items */}
                          <div className="space-y-2 pt-2 border-t border-border/40">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-mono font-semibold text-muted-foreground uppercase">
                                Links Inside Column
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddChildItem(groupIdx)}
                                className="h-7 text-xs flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Link</span>
                              </Button>
                            </div>

                            {group.children.length === 0 ? (
                              <p className="text-[11px] text-muted-foreground py-2 italic">
                                No links inside this column. Click &quot;Add Link&quot; above.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {group.children.map((child, childIdx) => (
                                  <div
                                    key={child.id || childIdx}
                                    className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2.5 rounded-lg border border-border/60 bg-muted/20"
                                  >
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleMoveChildItem(groupIdx, childIdx, 'up')
                                        }
                                        disabled={childIdx === 0}
                                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                      >
                                        <MoveUp className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleMoveChildItem(groupIdx, childIdx, 'down')
                                        }
                                        disabled={childIdx === group.children.length - 1}
                                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                      >
                                        <MoveDown className="w-3 h-3" />
                                      </button>
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2 w-full">
                                      <div className="sm:col-span-4">
                                        <Input
                                          value={child.label}
                                          onChange={(e) => {
                                            const nextChildren = [...group.children];
                                            nextChildren[childIdx] = {
                                              ...child,
                                              label: e.target.value,
                                            };
                                            const nextGroups = [...navGroups];
                                            nextGroups[groupIdx] = {
                                              ...group,
                                              children: nextChildren,
                                            };
                                            setNavGroups(nextGroups);
                                          }}
                                          placeholder="Link Label"
                                          className="text-xs h-8"
                                        />
                                      </div>

                                      <div className="sm:col-span-5 flex gap-1">
                                        <Input
                                          value={child.url}
                                          onChange={(e) => {
                                            const nextChildren = [...group.children];
                                            nextChildren[childIdx] = {
                                              ...child,
                                              url: e.target.value,
                                            };
                                            const nextGroups = [...navGroups];
                                            nextGroups[groupIdx] = {
                                              ...group,
                                              children: nextChildren,
                                            };
                                            setNavGroups(nextGroups);
                                          }}
                                          placeholder="/services or https://..."
                                          className="text-xs h-8 font-mono flex-1"
                                        />

                                        {cmsPages.length > 0 && (
                                          <select
                                            onChange={(e) => {
                                              if (!e.target.value) return;
                                              const nextChildren = [...group.children];
                                              nextChildren[childIdx] = {
                                                ...child,
                                                url: e.target.value,
                                                isExternal: false,
                                              };
                                              const nextGroups = [...navGroups];
                                              nextGroups[groupIdx] = {
                                                ...group,
                                                children: nextChildren,
                                              };
                                              setNavGroups(nextGroups);
                                            }}
                                            className="text-xs h-8 px-1.5 rounded border border-border bg-card text-foreground"
                                            title="Pick existing CMS Page"
                                            defaultValue=""
                                          >
                                            <option value="" disabled>
                                              Page...
                                            </option>
                                            {cmsPages.map((p) => (
                                              <option key={p.id} value={p.url}>
                                                {p.title} ({p.url})
                                              </option>
                                            ))}
                                          </select>
                                        )}
                                      </div>

                                      <div className="sm:col-span-3 flex items-center justify-end gap-2">
                                        <label className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                                          <input
                                            type="checkbox"
                                            checked={child.isExternal}
                                            onChange={(e) => {
                                              const nextChildren = [...group.children];
                                              nextChildren[childIdx] = {
                                                ...child,
                                                isExternal: e.target.checked,
                                              };
                                              const nextGroups = [...navGroups];
                                              nextGroups[groupIdx] = {
                                                ...group,
                                                children: nextChildren,
                                              };
                                              setNavGroups(nextGroups);
                                            }}
                                          />
                                          <span>New Tab</span>
                                        </label>

                                        <Switch
                                          checked={child.isActive !== false}
                                          onCheckedChange={(val) => {
                                            const nextChildren = [...group.children];
                                            nextChildren[childIdx] = {
                                              ...child,
                                              isActive: val,
                                            };
                                            const nextGroups = [...navGroups];
                                            nextGroups[groupIdx] = {
                                              ...group,
                                              children: nextChildren,
                                            };
                                            setNavGroups(nextGroups);
                                          }}
                                        />

                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleRemoveChildItem(groupIdx, childIdx)
                                          }
                                          className="p-1 text-destructive hover:bg-destructive/10 rounded"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ── TAB: CAPABILITY KEYWORDS ── */}
        <TabsContent value="keywords" className="space-y-6">
          <Card className="p-6 rounded-2xl border-slate-200/90 bg-white shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Capability Keywords Directory</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Curate interactive SEO keyword pills rendered in the footer above the brand signature in a compact, centered layout.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={handleAddKeyword}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-4 text-xs font-semibold shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Keyword</span>
              </Button>
            </div>

            {/* General Settings for Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl border border-slate-200/90 bg-slate-50/60">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-slate-900">Enable Keywords Section</div>
                  <div className="text-[11px] text-slate-500">
                    Display the compact capability directory on public website footer.
                  </div>
                </div>
                <Switch
                  checked={config.keywords?.enabled !== false}
                  onCheckedChange={(val) =>
                    setConfig({
                      ...config,
                      keywords: { ...config.keywords, enabled: val },
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Section Title / Heading
                </label>
                <Input
                  value={config.keywords?.title || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      keywords: { ...config.keywords, title: e.target.value },
                    })
                  }
                  placeholder="Trending Capabilities & Directory"
                  className="text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Batch Add Box */}
            <div className="p-4 rounded-xl border border-blue-200/60 bg-blue-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>Quick Batch Add Keywords</span>
                </div>
                <span className="text-[11px] text-blue-600">Comma or newline separated</span>
              </div>
              <Textarea
                rows={2}
                value={batchKeywordText}
                onChange={(e) => setBatchKeywordText(e.target.value)}
                placeholder="e.g. Algolia Search Engine, Omnichannel Logistics, Klaviyo Automation, Next.js Commerce"
                className="text-xs bg-white rounded-xl"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  type="button"
                  onClick={handleBatchAddKeywords}
                  disabled={!batchKeywordText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-8 px-3 text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Multiple Keywords
                </Button>
              </div>
            </div>

            {/* Keyword List Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Active Keywords Directory ({config.keywords?.items?.length || 0})</span>
                <span className="text-[11px] text-slate-400 font-normal">Reorder with arrows</span>
              </div>

              {(config.keywords?.items?.length || 0) === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl space-y-2">
                  <Sparkles className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500">No keywords configured yet. Add keywords above.</p>
                </div>
              ) : (
                (config.keywords?.items || []).map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveKeyword(idx, 'up')}
                        disabled={idx === 0}
                        className="h-7 w-7 text-slate-500 hover:text-slate-900"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveKeyword(idx, 'down')}
                        disabled={idx === (config.keywords?.items?.length || 0) - 1}
                        className="h-7 w-7 text-slate-500 hover:text-slate-900"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </Button>
                      <span className="text-[11px] font-mono font-bold text-slate-400 w-5 text-center">
                        #{idx + 1}
                      </span>
                    </div>

                    <Input
                      value={item.label}
                      onChange={(e) => {
                        const next = [...(config.keywords?.items || [])];
                        next[idx] = { ...item, label: e.target.value };
                        setConfig({
                          ...config,
                          keywords: { ...config.keywords, items: next },
                        });
                      }}
                      placeholder="Keyword Label"
                      className="text-xs h-8 flex-1 bg-white rounded-lg"
                    />

                    <Input
                      value={item.url || ''}
                      onChange={(e) => {
                        const next = [...(config.keywords?.items || [])];
                        next[idx] = { ...item, url: e.target.value };
                        setConfig({
                          ...config,
                          keywords: { ...config.keywords, items: next },
                        });
                      }}
                      placeholder="/services or /solutions"
                      className="text-xs h-8 font-mono flex-1 bg-white rounded-lg"
                    />

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <Switch
                        checked={item.isActive}
                        onCheckedChange={(val) => {
                          const next = [...(config.keywords?.items || [])];
                          next[idx] = { ...item, isActive: val };
                          setConfig({
                            ...config,
                            keywords: { ...config.keywords, items: next },
                          });
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveKeyword(idx)}
                        className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 h-7 w-7"
                        title="Delete Keyword"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        {/* ── TAB: CONTACT ── */}
        <TabsContent value="contact" className="space-y-6">
          <Card className="p-6 rounded-2xl border-slate-200/90 bg-white shadow-xs space-y-6">
            <CardHeader className="p-0 border-b border-slate-100 pb-4">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Footer Contact Information</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                By default, the footer reuses global corporate contact information from Global Settings. You may override them specifically for the footer below.
              </CardDescription>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/60 md:col-span-2">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-foreground">Show Contact Column</div>
                  <div className="text-[11px] text-muted-foreground">
                    Display direct contact information in the footer left column.
                  </div>
                </div>
                <Switch
                  checked={config.contact.enabled}
                  onCheckedChange={(val) =>
                    setConfig({
                      ...config,
                      contact: { ...config.contact, enabled: val },
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Primary Email (Override)
                </label>
                <Input
                  value={config.contact.emailOverride}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      contact: { ...config.contact, emailOverride: e.target.value },
                    })
                  }
                  placeholder={contactDefaults?.primaryEmail || 'contact@gypsym.com'}
                  className="text-xs font-mono"
                />
                <p className="text-[10px] text-muted-foreground">
                  Inherited default: {contactDefaults?.primaryEmail || 'None set'}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Primary Phone (Override)
                </label>
                <Input
                  value={config.contact.phoneOverride}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      contact: { ...config.contact, phoneOverride: e.target.value },
                    })
                  }
                  placeholder={contactDefaults?.phone || '+1-212-555-0199'}
                  className="text-xs font-mono"
                />
                <p className="text-[10px] text-muted-foreground">
                  Inherited default: {contactDefaults?.phone || 'None set'}
                </p>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-foreground">
                  Global Office Address (Override)
                </label>
                <Input
                  value={config.contact.addressOverride}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      contact: { ...config.contact, addressOverride: e.target.value },
                    })
                  }
                  placeholder={contactDefaults?.address || '175 Varick Street, New York, NY'}
                  className="text-xs"
                />
                <p className="text-[10px] text-muted-foreground">
                  Inherited default: {contactDefaults?.address || 'None set'}
                </p>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-foreground">
                  Office Badge Text
                </label>
                <Input
                  value={config.contact.badgeText}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      contact: { ...config.contact, badgeText: e.target.value },
                    })
                  }
                  placeholder="Global Engineering Hub"
                  className="text-xs"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ── TAB: REGIONS / MARKETS ── */}
        <TabsContent value="regions" className="space-y-6">
          <Card className="p-6 rounded-2xl border-slate-200/90 bg-white shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>Regional Markets & Practice Directories</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Create multi-country SEO directories inspired by the reference design. Each country displays a badge, title, and targeted service landing links.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={handleAddRegion}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-4 text-xs font-semibold shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Region</span>
              </Button>
            </div>

            {config.regions.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-xl space-y-3">
                <Globe className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground">
                  No regional markets configured.
                </p>
                <Button size="sm" variant="outline" onClick={handleAddRegion}>
                  + Add Region
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {config.regions.map((region, regionIdx) => {
                  const isExpanded = expandedRegionIdx === regionIdx;

                  return (
                    <div
                      key={region.id}
                      className="border border-border rounded-xl overflow-hidden bg-card/40 transition-all"
                    >
                      <div className="flex items-center justify-between p-3.5 bg-muted/40 border-b border-border/40">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center space-x-0.5 text-muted-foreground">
                            <button
                              type="button"
                              onClick={() => handleMoveRegion(regionIdx, 'up')}
                              disabled={regionIdx === 0}
                              className="p-1 hover:text-foreground disabled:opacity-30"
                              title="Move Region Up"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveRegion(regionIdx, 'down')}
                              disabled={regionIdx === config.regions.length - 1}
                              className="p-1 hover:text-foreground disabled:opacity-30"
                              title="Move Region Down"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedRegionIdx(isExpanded ? null : regionIdx)
                            }
                            className="flex items-center gap-2 text-left group/btn"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="px-1.5 py-0.5 rounded bg-muted font-mono font-bold text-[11px] text-foreground">
                              {region.code || 'GL'}
                            </span>
                            <span className="font-semibold text-xs text-foreground group-hover/btn:text-primary transition-colors">
                              {region.name || 'Untitled Country'}
                            </span>
                            {region.label && (
                              <span className="text-[10px] text-muted-foreground">
                                ({region.label})
                              </span>
                            )}
                            <Badge variant="secondary" className="text-[10px] font-mono ml-2">
                              {region.links.length} links
                            </Badge>
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-muted-foreground font-mono">
                              Active
                            </span>
                            <Switch
                              checked={region.isActive}
                              onCheckedChange={(val) => {
                                const next = [...config.regions];
                                next[regionIdx] = { ...region, isActive: val };
                                setConfig({ ...config, regions: next });
                              }}
                            />
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveRegion(regionIdx)}
                            className="text-destructive hover:bg-destructive/10 h-7 w-7"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-foreground">
                                Country Name
                              </label>
                              <Input
                                value={region.name}
                                onChange={(e) => {
                                  const next = [...config.regions];
                                  next[regionIdx] = { ...region, name: e.target.value };
                                  setConfig({ ...config, regions: next });
                                }}
                                className="text-xs h-8"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-foreground">
                                Country Code (2 letters)
                              </label>
                              <Input
                                value={region.code}
                                maxLength={4}
                                onChange={(e) => {
                                  const next = [...config.regions];
                                  next[regionIdx] = {
                                    ...region,
                                    code: e.target.value.toUpperCase(),
                                  };
                                  setConfig({ ...config, regions: next });
                                }}
                                className="text-xs h-8 font-mono uppercase"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-foreground">
                                Region Label (e.g. North America)
                              </label>
                              <Input
                                value={region.label}
                                onChange={(e) => {
                                  const next = [...config.regions];
                                  next[regionIdx] = { ...region, label: e.target.value };
                                  setConfig({ ...config, regions: next });
                                }}
                                className="text-xs h-8"
                              />
                            </div>
                          </div>

                          {/* Regional Links */}
                          <div className="space-y-2 pt-2 border-t border-border/40">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-mono font-semibold text-muted-foreground uppercase">
                                Links for {region.name}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddRegionLink(regionIdx)}
                                className="h-7 text-xs flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Link</span>
                              </Button>
                            </div>

                            {region.links.length === 0 ? (
                              <p className="text-[11px] text-muted-foreground py-2 italic">
                                No links configured for this country.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {region.links.map((link, linkIdx) => (
                                  <div
                                    key={link.id}
                                    className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-muted/20"
                                  >
                                    <Input
                                      value={link.label}
                                      onChange={(e) => {
                                        const nextLinks = [...region.links];
                                        nextLinks[linkIdx] = {
                                          ...link,
                                          label: e.target.value,
                                        };
                                        const nextRegions = [...config.regions];
                                        nextRegions[regionIdx] = {
                                          ...region,
                                          links: nextLinks,
                                        };
                                        setConfig({ ...config, regions: nextRegions });
                                      }}
                                      placeholder="Link Text"
                                      className="text-xs h-7 flex-1"
                                    />

                                    <Input
                                      value={link.url}
                                      onChange={(e) => {
                                        const nextLinks = [...region.links];
                                        nextLinks[linkIdx] = {
                                          ...link,
                                          url: e.target.value,
                                        };
                                        const nextRegions = [...config.regions];
                                        nextRegions[regionIdx] = {
                                          ...region,
                                          links: nextLinks,
                                        };
                                        setConfig({ ...config, regions: nextRegions });
                                      }}
                                      placeholder="/services"
                                      className="text-xs h-7 font-mono flex-1"
                                    />

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveRegionLink(regionIdx, linkIdx)
                                      }
                                      className="p-1 text-destructive hover:bg-destructive/10 rounded"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ── TAB: LARGE BRAND MARK ── */}
        <TabsContent value="large-brand" className="space-y-6">
          <Card className="p-6 rounded-2xl border-slate-200/90 bg-white shadow-xs space-y-6">
            <CardHeader className="p-0 border-b border-slate-100 pb-4">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <PanelBottom className="w-4 h-4 text-blue-600" />
                <span>Oversized Brand Wordmark</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Configure the massive, high-impact brand wordmark inspired by the reference design.
              </CardDescription>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/60 md:col-span-2">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-foreground">
                    Display Oversized Brand Mark
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Renders large spanning brand signature before the bottom copyright bar.
                  </div>
                </div>
                <Switch
                  checked={config.largeBrandMark.enabled}
                  onCheckedChange={(val) =>
                    setConfig({
                      ...config,
                      largeBrandMark: { ...config.largeBrandMark, enabled: val },
                    })
                  }
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-foreground">
                  Brand Wordmark Text (Override)
                </label>
                <Input
                  value={config.largeBrandMark.textOverride}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      largeBrandMark: {
                        ...config.largeBrandMark,
                        textOverride: e.target.value,
                      },
                    })
                  }
                  placeholder={brandName.toUpperCase()}
                  className="text-xs font-bold tracking-wider uppercase"
                />
                <p className="text-[11px] text-muted-foreground">
                  Defaults to active company name: {brandName.toUpperCase()}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Visual Opacity ({Math.round(config.largeBrandMark.opacity * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.04"
                  max="0.9"
                  step="0.02"
                  value={config.largeBrandMark.opacity}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      largeBrandMark: {
                        ...config.largeBrandMark,
                        opacity: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Alignment</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          largeBrandMark: {
                            ...config.largeBrandMark,
                            alignment: align,
                          },
                        })
                      }
                      className={`py-2 px-3 rounded-lg border text-xs font-medium capitalize transition-all ${
                        config.largeBrandMark.alignment === align
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Wordmark Preview */}
            <div className="pt-6 border-t border-border/40">
              <span className="text-[11px] font-mono text-muted-foreground block mb-2">
                Live Text Render Preview:
              </span>
              <div className="p-8 rounded-2xl bg-[#07090e] border border-white/10 text-center overflow-hidden">
                <span
                  style={{ opacity: config.largeBrandMark.opacity }}
                  className="font-black text-4xl sm:text-6xl tracking-tighter uppercase text-white select-none block"
                >
                  {config.largeBrandMark.textOverride || brandName.toUpperCase()}
                </span>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ── TAB: LEGAL LINKS ── */}
        <TabsContent value="legal" className="space-y-6">
          <Card className="p-6 rounded-2xl border-slate-200/90 bg-white shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Legal & Compliance Links</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Policies, terms of service, disclosures, and regulatory filings rendered in the bottom bar.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={handleAddLegalLink}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-4 text-xs font-semibold shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Link</span>
              </Button>
            </div>

            {/* Quick-Add from Verified Available Pages */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span>Available Verified Site Pages:</span>
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Click to add directly to footer
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { label: 'Privacy Policy', url: '/privacy' },
                  { label: 'Terms of Service', url: '/terms' },
                  { label: 'Security & Certifications', url: '/trust/certifications' },
                  { label: 'Cookie Declaration', url: '/cookies' },
                  { label: 'Sitemap XML', url: '/sitemap.xml' },
                  { label: 'About Gypsym', url: '/about' },
                  { label: 'Core Services', url: '/services' },
                  { label: 'Portfolio Works', url: '/portfolio' },
                  { label: 'Contact Advisory', url: '/contact' },
                  { label: 'Book Discovery', url: '/book' },
                ].map((availPage) => {
                  const alreadyAdded = config.legalLinks.some(
                    (l) => l.url.trim().toLowerCase() === availPage.url.toLowerCase()
                  );
                  return (
                    <button
                      key={availPage.url}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => {
                        const newLink: LegalLinkItem = {
                          id: `leg-${Date.now()}`,
                          label: availPage.label,
                          url: availPage.url,
                          isExternal: false,
                          displayOrder: config.legalLinks.length + 1,
                          isActive: true,
                        };
                        setConfig({
                          ...config,
                          legalLinks: [...config.legalLinks, newLink],
                        });
                        notify.success(`Added "${availPage.label}" to footer legal links.`);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                        alreadyAdded
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 cursor-default opacity-80'
                          : 'border-border bg-card hover:border-primary hover:text-primary cursor-pointer'
                      }`}
                    >
                      {alreadyAdded ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Plus className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span>{availPage.label}</span>
                      <span className="text-[10px] font-mono opacity-60">({availPage.url})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              {config.legalLinks.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                  No legal links configured. Click any verified page above or &quot;Add Custom Link&quot;.
                </div>
              ) : (
                config.legalLinks.map((link, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === config.legalLinks.length - 1;
                  return (
                    <div
                      key={link.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border border-border bg-card/60"
                    >
                      <div className="flex items-center gap-1 self-start sm:self-auto">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isFirst}
                          onClick={() => handleMoveLegalLink(idx, 'up')}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isLast}
                          onClick={() => handleMoveLegalLink(idx, 'down')}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <Input
                        value={link.label}
                        onChange={(e) => {
                          const next = [...config.legalLinks];
                          next[idx] = { ...link, label: e.target.value };
                          setConfig({ ...config, legalLinks: next });
                        }}
                        placeholder="Privacy Policy"
                        className="text-xs h-8 sm:w-52"
                      />

                      <Input
                        value={link.url}
                        onChange={(e) => {
                          const next = [...config.legalLinks];
                          next[idx] = { ...link, url: e.target.value };
                          setConfig({ ...config, legalLinks: next });
                        }}
                        placeholder="/privacy"
                        className="text-xs h-8 font-mono flex-1"
                      />

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Open link in new tab to test"
                        >
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </Button>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {link.isActive ? 'Active' : 'Disabled'}
                          </span>
                          <Switch
                            checked={link.isActive}
                            onCheckedChange={(val) => {
                              const next = [...config.legalLinks];
                              next[idx] = { ...link, isActive: val };
                              setConfig({ ...config, legalLinks: next });
                            }}
                          />
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveLegalLink(idx)}
                          className="text-destructive hover:bg-destructive/10 h-7 w-7"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Copyright Template Settings */}
            <div className="pt-6 border-t border-border/40 space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Copyright Declaration Pattern
              </label>
              <Input
                value={config.copyright.template}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    copyright: { ...config.copyright, template: e.target.value },
                  })
                }
                className="text-xs font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Supports <code className="font-mono">&#123;year&#125;</code> and{' '}
                <code className="font-mono">&#123;brand&#125;</code> tokens. Evaluated at runtime so year updates automatically.
              </p>
              <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground font-mono mt-2">
                Live output:{' '}
                <span className="text-foreground font-semibold">
                  {config.copyright.template
                    .replace('{year}', new Date().getFullYear().toString())
                    .replace('{brand}', brandName)}
                </span>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ── TAB: BADGES ── */}
        <TabsContent value="badges" className="space-y-6">
          <Card className="p-6 rounded-2xl border-slate-200/90 bg-white shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Footer Badges & Certifications</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Highlight official partnerships, security standards (ISO 27001, SOC 2), or platform alliances.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={handleAddBadge}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-4 text-xs font-semibold shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Badge</span>
              </Button>
            </div>

            <div className="space-y-3">
              {(config.badges?.length || 0) === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center italic">
                  No badges configured. Click &quot;Add Badge&quot; above.
                </p>
              ) : (
                (config.badges || []).map((badge, idx) => (
                  <div
                    key={badge.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl border border-border bg-card/60"
                  >
                    <Input
                      value={badge.title}
                      onChange={(e) => {
                        const next = [...config.badges];
                        next[idx] = { ...badge, title: e.target.value };
                        setConfig({ ...config, badges: next });
                      }}
                      placeholder="Badge Title (e.g. Shopify Plus Partner)"
                      className="text-xs h-8 flex-1"
                    />

                    <Input
                      value={badge.url || ''}
                      onChange={(e) => {
                        const next = [...config.badges];
                        next[idx] = { ...badge, url: e.target.value };
                        setConfig({ ...config, badges: next });
                      }}
                      placeholder="Optional link URL"
                      className="text-xs h-8 font-mono flex-1"
                    />

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Switch
                        checked={badge.isActive}
                        onCheckedChange={(val) => {
                          const next = [...config.badges];
                          next[idx] = { ...badge, isActive: val };
                          setConfig({ ...config, badges: next });
                        }}
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveBadge(idx)}
                        className="text-destructive hover:bg-destructive/10 h-7 w-7"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        {/* ── TAB: CTA BANNER ── */}
        <TabsContent value="cta" className="space-y-6">
          <Card className="p-6 rounded-2xl border-slate-200/90 bg-white shadow-xs space-y-6">
            <CardHeader className="p-0 border-b border-slate-100 pb-4">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <PanelBottom className="w-4 h-4 text-blue-600" />
                <span>Optional Footer CTA Strip</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                A high-conversion call-to-action bar placed directly above the footer navigation.
              </CardDescription>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/60 md:col-span-2">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-foreground">Enable Footer CTA</div>
                  <div className="text-[11px] text-muted-foreground">
                    When disabled, the CTA strip is gracefully omitted.
                  </div>
                </div>
                <Switch
                  checked={config.cta.enabled}
                  onCheckedChange={(val) =>
                    setConfig({
                      ...config,
                      cta: { ...config.cta, enabled: val },
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Eyebrow</label>
                <Input
                  value={config.cta.eyebrow}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      cta: { ...config.cta, eyebrow: e.target.value },
                    })
                  }
                  placeholder="PARTNER WITH US"
                  className="text-xs font-mono uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Title</label>
                <Input
                  value={config.cta.title}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      cta: { ...config.cta, title: e.target.value },
                    })
                  }
                  placeholder="Ready to build the next-generation enterprise?"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-foreground">Description</label>
                <Textarea
                  rows={2}
                  value={config.cta.description}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      cta: { ...config.cta, description: e.target.value },
                    })
                  }
                  placeholder="Schedule a dedicated architecture session with our principal engineers."
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Button Label</label>
                <Input
                  value={config.cta.buttonLabel}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      cta: { ...config.cta, buttonLabel: e.target.value },
                    })
                  }
                  placeholder="Let's Talk"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Button URL</label>
                <Input
                  value={config.cta.buttonUrl}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      cta: { ...config.cta, buttonUrl: e.target.value },
                    })
                  }
                  placeholder="/book"
                  className="text-xs font-mono"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ── TAB: APPEARANCE ── */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="p-6 rounded-2xl border-slate-200/90 bg-white shadow-xs space-y-6">
            <CardHeader className="p-0 border-b border-slate-100 pb-4">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <PanelBottom className="w-4 h-4 text-blue-600" />
                <span>Footer Surface & Color Styling</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Fine-tune surface shades, borders, and ambient light effects for the dark card.
              </CardDescription>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Surface Dark Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.appearance.surfaceColor.startsWith('#') ? config.appearance.surfaceColor : '#07090e'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        appearance: {
                          ...config.appearance,
                          surfaceColor: e.target.value,
                        },
                      })
                    }
                    className="w-9 h-9 rounded cursor-pointer border border-border"
                  />
                  <Input
                    value={config.appearance.surfaceColor}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        appearance: {
                          ...config.appearance,
                          surfaceColor: e.target.value,
                        },
                      })
                    }
                    className="text-xs font-mono"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Default: #07090e</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Border Color (RGBA / HEX)
                </label>
                <Input
                  value={config.appearance.borderColor}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      appearance: {
                        ...config.appearance,
                        borderColor: e.target.value,
                      },
                    })
                  }
                  className="text-xs font-mono"
                />
                <p className="text-[10px] text-muted-foreground">
                  Default: rgba(255, 255, 255, 0.08)
                </p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/60 md:col-span-2">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-foreground">
                    Ambient Radial Glow Effect
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Soft top glow creating modern deep spatial lighting.
                  </div>
                </div>
                <Switch
                  checked={config.appearance.glowEffect}
                  onCheckedChange={(val) =>
                    setConfig({
                      ...config,
                      appearance: { ...config.appearance, glowEffect: val },
                    })
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ── TAB: LIVE PREVIEW ── */}
        <TabsContent value="preview" className="space-y-6">
          <Card className="p-6 rounded-2xl border-slate-200/90 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>Footer Live Visual Preview</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Real-time render reflecting active configuration, menus, and branding tokens.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-mono bg-blue-50/50 text-blue-700 border-blue-200">
                Interactive Preview
              </Badge>
            </div>

            {/* Rendered Container Mock */}
            <div className="p-4 sm:p-6 bg-neutral-100 rounded-3xl overflow-hidden border border-border">
              <div
                style={{
                  backgroundColor: config.appearance.surfaceColor || '#07090e',
                  borderColor: config.appearance.borderColor || 'rgba(255, 255, 255, 0.08)',
                }}
                className="rounded-3xl border text-white p-6 sm:p-10 space-y-8"
              >
                {/* CTA if enabled */}
                {config.cta.enabled && (
                  <div className="pb-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-[10px] font-mono text-primary uppercase">
                        {config.cta.eyebrow}
                      </span>
                      <h4 className="text-lg font-bold text-white">
                        {config.cta.title}
                      </h4>
                      <p className="text-xs text-neutral-400">
                        {config.cta.description}
                      </p>
                    </div>
                    <span className="px-4 py-2 rounded-full bg-white text-neutral-900 font-semibold text-xs shrink-0">
                      {config.cta.buttonLabel} →
                    </span>
                  </div>
                )}

                {/* Top columns */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-white/10">
                  <div className="md:col-span-5 space-y-4">
                    {config.brand.customLogoUrl ? (
                      <img
                        src={config.brand.customLogoUrl}
                        alt={brandName}
                        className="h-8 max-w-[180px] object-contain"
                      />
                    ) : (
                      <div className="text-xl font-bold tracking-tight text-white">
                        {brandName}
                      </div>
                    )}
                    <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
                      {config.brand.description}
                    </p>
                    {config.contact.enabled && (
                      <div className="text-xs text-neutral-400 font-mono space-y-1">
                        <div>{config.contact.emailOverride || contactDefaults?.primaryEmail || 'contact@gypsym.com'}</div>
                        <div>{config.contact.phoneOverride || contactDefaults?.phone || '+1-212-555-0199'}</div>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {navGroups.filter(g => g.isActive !== false).map((g, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="text-xs font-mono font-semibold text-neutral-400 uppercase">
                          {g.label}
                        </div>
                        <ul className="space-y-1 text-xs text-neutral-300">
                          {g.children.filter(c => c.isActive !== false).map((c, cIdx) => (
                            <li key={cIdx} className="hover:text-white cursor-pointer">
                              {c.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Regions */}
                {config.regions.filter(r => r.isActive).length > 0 && (
                  <div className="pb-8 border-b border-white/10 space-y-3">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                      Regional Markets
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {config.regions.filter(r => r.isActive).map((r, rIdx) => (
                        <div key={rIdx} className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
                            <span className="px-1 py-0.5 rounded bg-white/10 font-mono text-[9px]">
                              {r.code}
                            </span>
                            <span>{r.name}</span>
                          </div>
                          <ul className="space-y-1 text-[11px] text-neutral-400">
                            {r.links.filter(l => l.isActive !== false).map((l, lIdx) => (
                              <li key={lIdx} className="truncate">
                                {l.label}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Large Wordmark */}
                {config.largeBrandMark.enabled && (
                  <div className="py-4 text-center overflow-hidden">
                    <span
                      style={{ opacity: config.largeBrandMark.opacity }}
                      className="font-black text-5xl sm:text-7xl tracking-tighter uppercase text-white block select-none"
                    >
                      {config.largeBrandMark.textOverride || brandName.toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Bottom Bar */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-400 font-mono gap-2">
                  <div>
                    {config.copyright.template
                      .replace('{year}', new Date().getFullYear().toString())
                      .replace('{brand}', brandName)}
                  </div>
                  <div className="flex gap-4">
                    {config.legalLinks.filter(l => l.isActive).map((l, lIdx) => (
                      <span key={lIdx} className="hover:text-white cursor-pointer">
                        {l.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
