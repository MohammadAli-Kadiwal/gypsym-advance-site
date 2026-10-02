'use client';

import * as React from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { fetchApi, normalizeErrorMessage } from '@/lib/api-client';
import { notify } from '@/lib/notifications';
import { AdminContentContainer, AdminPageHeader } from '@/components/layout/admin-page';
import {
  Save,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Sliders,
  Menu,
  Loader2,
  Palette,
  Check,
  Eye,
} from 'lucide-react';

interface MegaMenuItem {
  title: string;
  href: string;
  description?: string;
  icon?: string;
  badge?: string;
}

interface MegaMenuConfig {
  columns?: number;
  categoryTitle?: string;
  items?: MegaMenuItem[];
  featuredCard?: {
    badge?: string;
    title?: string;
    description?: string;
    ctaLabel?: string;
    ctaHref?: string;
    image?: string;
  };
}

interface NavItem {
  id?: string;
  label: string;
  url: string;
  icon?: string | null;
  badgeText?: string | null;
  isExternal?: boolean;
  displayOrder?: number;
  isActive?: boolean;
  megaMenuConfig?: MegaMenuConfig | null;
  children?: any[];
}

interface HeaderConfig {
  sticky: boolean;
  transparentOverHero: boolean;
  blur: boolean;
  rounded: 'full' | 'lg' | 'none';
  border: boolean;
  shadow: boolean;
  maxWidth: string;
  showThemeToggle: boolean;
  showSearchBar: boolean;
  headerBgColor?: string;
  headerBgPureWhite?: boolean;
  activeLinkColor?: string;
  activeLinkBgColor?: string;
  activeLinkStyle?: 'pill' | 'solid' | 'tint' | 'border' | 'dot';
  cta: {
    enabled: boolean;
    label: string;
    url: string;
    variant: string;
    icon: string;
  };
}

const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  sticky: true,
  transparentOverHero: false,
  blur: true,
  rounded: 'full',
  border: true,
  shadow: true,
  maxWidth: '7xl',
  showThemeToggle: false,
  showSearchBar: false,
  headerBgColor: '#ffffff',
  headerBgPureWhite: true,
  activeLinkColor: '#09090b',
  activeLinkBgColor: '#f4f4f5',
  activeLinkStyle: 'pill',
  cta: {
    enabled: true,
    label: 'Book Call',
    url: '/book',
    variant: 'primary',
    icon: 'ArrowUpRight',
  },
};

export default function NavigationBuilderPage() {
  const [items, setItems] = React.useState<NavItem[]>([]);
  const [headerConfig, setHeaderConfig] = React.useState<HeaderConfig>(DEFAULT_HEADER_CONFIG);
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchApi<any>('/header');
        if (data?.navigation?.items) {
          setItems(data.navigation.items);
        }
        if (data?.config) {
          setHeaderConfig((prev) => ({ ...prev, ...data.config }));
        }
      } catch (err: any) {
        console.error('Failed to load header data:', err);
        notify.error('Unable to load navigation configuration.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddItem = () => {
    const newItem: NavItem = {
      label: 'New Link',
      url: '/page',
      isActive: true,
      displayOrder: items.length,
      megaMenuConfig: null,
    };
    setItems([...items, newItem]);
    setExpandedIndex(items.length);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const handleMove = (idx: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === items.length - 1))
      return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const next = [...items];
    const current = next[idx];
    const target = next[targetIdx];
    if (!current || !target) return;
    next[idx] = target;
    next[targetIdx] = current;
    setItems(next);
    if (expandedIndex === idx) setExpandedIndex(targetIdx);
    notify.info('Navigation order updated.');
  };

  const handleUpdateItem = (index: number, updates: Partial<NavItem>) => {
    setItems(items.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  };

  const handleToggleMegaMenu = (index: number) => {
    const item = items[index];
    if (!item) return;

    if (item.megaMenuConfig) {
      handleUpdateItem(index, { megaMenuConfig: null });
    } else {
      handleUpdateItem(index, {
        megaMenuConfig: {
          columns: 3,
          categoryTitle: `${item.label.toUpperCase()} ARCHITECTURE`,
          items: [
            {
              title: `${item.label} Capability`,
              href: `${item.url}/capability-1`,
              description: 'Enterprise grade architecture with continuous zero-downtime operations.',
              icon: 'Layers',
              badge: 'CORE',
            },
          ],
          featuredCard: {
            badge: 'EXECUTIVE ADVISORY',
            title: `Enterprise ${item.label} Briefing`,
            description: 'Direct architectural review session with principal enterprise fellows.',
            ctaLabel: 'Schedule Briefing',
            ctaHref: '/contact',
          },
        },
      });
    }
  };

  const handleAddMegaMenuItem = (navIndex: number) => {
    const item = items[navIndex];
    if (!item?.megaMenuConfig) return;

    const currentSubItems = item.megaMenuConfig.items || [];
    const newSubItem: MegaMenuItem = {
      title: 'New Service Tile',
      href: `${item.url}/new-service`,
      description: 'High-throughput deterministic capability with zero downtime.',
      icon: 'Layers',
      badge: 'PROD',
    };

    handleUpdateItem(navIndex, {
      megaMenuConfig: {
        ...item.megaMenuConfig,
        items: [...currentSubItems, newSubItem],
      },
    });
  };

  const handleUpdateMegaMenuItem = (
    navIndex: number,
    subIndex: number,
    updates: Partial<MegaMenuItem>
  ) => {
    const item = items[navIndex];
    if (!item?.megaMenuConfig?.items) return;

    const newSubItems = item.megaMenuConfig.items.map((sub, i) =>
      i === subIndex ? { ...sub, ...updates } : sub
    );

    handleUpdateItem(navIndex, {
      megaMenuConfig: {
        ...item.megaMenuConfig,
        items: newSubItems,
      },
    });
  };

  const handleRemoveMegaMenuItem = (navIndex: number, subIndex: number) => {
    const item = items[navIndex];
    if (!item?.megaMenuConfig?.items) return;

    handleUpdateItem(navIndex, {
      megaMenuConfig: {
        ...item.megaMenuConfig,
        items: item.megaMenuConfig.items.filter((_, i) => i !== subIndex),
      },
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);

      // 1. Update navigation items
      await fetchApi('/navigation/header', {
        method: 'PUT',
        body: JSON.stringify({ items }),
      });

      // 2. Update site setting header_config
      await fetchApi('/settings/header_config', {
        method: 'PUT',
        body: JSON.stringify({ value: headerConfig }),
      });

      notify.success('Navigation updated successfully.');
    } catch (err: any) {
      console.error('Save failed:', err);
      notify.error(normalizeErrorMessage(err, 'Unable to update navigation.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-500 font-mono">Loading Navigation & Header State...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminContentContainer variant="standard">
      <AdminPageHeader
        title="Navigation & Header"
        description="Manage navigation links, dropdown mega-menus, and floating header action buttons."
        actions={
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="gap-2 shadow-xs cursor-pointer"
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
        }
      />

      <Tabs defaultValue="navigation" className="space-y-6">
        <TabsList className="bg-card border border-border/40 p-1">
          <TabsTrigger value="navigation" className="text-xs flex items-center gap-1.5">
            <Menu className="h-3.5 w-3.5" /> Navigation Items & Mega Menus
          </TabsTrigger>
          <TabsTrigger value="header" className="text-xs flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5" /> Floating Header Geometry & CTA
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: NAVIGATION & MEGA MENUS */}
        <TabsContent value="navigation" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Top-Level Menu Items</h2>
              <p className="text-xs text-muted-foreground">
                Reorder or click to expand mega-menu configuration.
              </p>
            </div>
            <Button type="button" onClick={handleAddItem} size="sm" variant="outline">
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Menu Item
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const isExpanded = expandedIndex === idx;
              const hasMegaMenu = !!item.megaMenuConfig;

              return (
                <Card key={idx} className="border-border/60 overflow-hidden">
                  {/* Item Header Row */}
                  <div className="flex items-center justify-between p-3.5 bg-card/80">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-0.5 text-muted-foreground mr-1">
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'up')}
                          className="p-1 hover:text-foreground"
                          disabled={idx === 0}
                        >
                          <MoveUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'down')}
                          className="p-1 hover:text-foreground"
                          disabled={idx === items.length - 1}
                        >
                          <MoveDown className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                        className="flex items-center space-x-2 text-left group"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                          {item.label || 'Untitled'}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {item.url}
                        </span>
                      </button>

                      {hasMegaMenu && (
                        <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wider ml-2">
                          Mega Menu ({item.megaMenuConfig?.items?.length || 0})
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(idx)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Item Configuration */}
                  {isExpanded && (
                    <div className="p-4 border-t border-border/40 bg-card/40 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-foreground">Menu Label</label>
                          <Input
                            value={item.label}
                            onChange={(e) => handleUpdateItem(idx, { label: e.target.value })}
                            placeholder="e.g. Services"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-foreground">Destination URL</label>
                          <Input
                            value={item.url}
                            onChange={(e) => handleUpdateItem(idx, { url: e.target.value })}
                            placeholder="/services"
                            className="h-8 font-mono text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-foreground">Optional Badge</label>
                          <Input
                            value={item.badgeText || ''}
                            onChange={(e) => handleUpdateItem(idx, { badgeText: e.target.value })}
                            placeholder="e.g. NEW"
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>

                      {/* Mega Menu Toggle */}
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card">
                        <div>
                          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            Enable Dropdown Mega-Menu Panel
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Displays a multi-column card grid with service icons, descriptions, and featured advisory card.
                          </div>
                        </div>
                        <Switch
                          checked={hasMegaMenu}
                          onCheckedChange={() => handleToggleMegaMenu(idx)}
                        />
                      </div>

                      {/* Mega Menu Sub-Builder */}
                      {hasMegaMenu && item.megaMenuConfig && (
                        <div className="p-4 rounded-lg border border-primary/20 bg-primary/[0.02] space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-foreground">Category Header Label</label>
                              <Input
                                value={item.megaMenuConfig.categoryTitle || ''}
                                onChange={(e) =>
                                  handleUpdateItem(idx, {
                                    megaMenuConfig: {
                                      ...item.megaMenuConfig,
                                      categoryTitle: e.target.value,
                                    },
                                  })
                                }
                                placeholder="CAPABILITIES ARCHITECTURE"
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-foreground">Grid Columns</label>
                              <select
                                value={item.megaMenuConfig.columns || 3}
                                onChange={(e) =>
                                  handleUpdateItem(idx, {
                                    megaMenuConfig: {
                                      ...item.megaMenuConfig,
                                      columns: parseInt(e.target.value, 10),
                                    },
                                  })
                                }
                                className="w-full h-8 rounded border border-input bg-card px-2 text-xs text-foreground"
                              >
                                <option value={2}>2 Columns</option>
                                <option value={3}>3 Columns</option>
                                <option value={4}>4 Columns</option>
                              </select>
                            </div>
                          </div>

                          {/* Sub-Items Tiles */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-foreground">
                                Mega Menu Capability Tiles ({item.megaMenuConfig.items?.length || 0})
                              </span>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddMegaMenuItem(idx)}
                                className="h-7 text-xs"
                              >
                                <Plus className="h-3 w-3 mr-1" /> Add Tile
                              </Button>
                            </div>

                            <div className="space-y-2">
                              {(item.megaMenuConfig.items || []).map((subItem, subIdx) => (
                                <div
                                  key={subIdx}
                                  className="p-3 rounded border border-border/60 bg-card space-y-2 text-xs"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono text-[10px] text-muted-foreground font-semibold">
                                      TILE #{subIdx + 1}
                                    </span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveMegaMenuItem(idx, subIdx)}
                                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <Input
                                      value={subItem.title}
                                      onChange={(e) =>
                                        handleUpdateMegaMenuItem(idx, subIdx, { title: e.target.value })
                                      }
                                      placeholder="Title"
                                      className="h-7 text-xs"
                                    />
                                    <Input
                                      value={subItem.href}
                                      onChange={(e) =>
                                        handleUpdateMegaMenuItem(idx, subIdx, { href: e.target.value })
                                      }
                                      placeholder="/path"
                                      className="h-7 font-mono text-xs"
                                    />
                                    <Input
                                      value={subItem.icon || 'Layers'}
                                      onChange={(e) =>
                                        handleUpdateMegaMenuItem(idx, subIdx, { icon: e.target.value })
                                      }
                                      placeholder="Icon (e.g. Cloud, Shield, Cpu)"
                                      className="h-7 text-xs"
                                    />
                                  </div>

                                  <Textarea
                                    value={subItem.description || ''}
                                    onChange={(e) =>
                                      handleUpdateMegaMenuItem(idx, subIdx, {
                                        description: e.target.value,
                                      })
                                    }
                                    placeholder="Supporting description for the tile..."
                                    rows={2}
                                    className="text-xs min-h-[44px]"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Featured Advisory Card */}
                          <div className="space-y-2 pt-2 border-t border-border/40">
                            <span className="text-xs font-semibold text-foreground">
                              Featured Advisory Card (Right Column)
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <Input
                                value={item.megaMenuConfig.featuredCard?.title || ''}
                                onChange={(e) =>
                                  handleUpdateItem(idx, {
                                    megaMenuConfig: {
                                      ...item.megaMenuConfig,
                                      featuredCard: {
                                        ...item.megaMenuConfig?.featuredCard,
                                        title: e.target.value,
                                      },
                                    },
                                  })
                                }
                                placeholder="Featured Card Title"
                                className="h-8 text-xs"
                              />
                              <Input
                                value={item.megaMenuConfig.featuredCard?.badge || ''}
                                onChange={(e) =>
                                  handleUpdateItem(idx, {
                                    megaMenuConfig: {
                                      ...item.megaMenuConfig,
                                      featuredCard: {
                                        ...item.megaMenuConfig?.featuredCard,
                                        badge: e.target.value,
                                      },
                                    },
                                  })
                                }
                                placeholder="Badge (e.g. EXECUTIVE ADVISORY)"
                                className="h-8 text-xs"
                              />
                              <Input
                                value={item.megaMenuConfig.featuredCard?.ctaLabel || ''}
                                onChange={(e) =>
                                  handleUpdateItem(idx, {
                                    megaMenuConfig: {
                                      ...item.megaMenuConfig,
                                      featuredCard: {
                                        ...item.megaMenuConfig?.featuredCard,
                                        ctaLabel: e.target.value,
                                      },
                                    },
                                  })
                                }
                                placeholder="CTA Button Label"
                                className="h-8 text-xs"
                              />
                              <Input
                                value={item.megaMenuConfig.featuredCard?.ctaHref || ''}
                                onChange={(e) =>
                                  handleUpdateItem(idx, {
                                    megaMenuConfig: {
                                      ...item.megaMenuConfig,
                                      featuredCard: {
                                        ...item.megaMenuConfig?.featuredCard,
                                        ctaHref: e.target.value,
                                      },
                                    },
                                  })
                                }
                                placeholder="CTA URL"
                                className="h-8 font-mono text-xs"
                              />
                            </div>
                            <Textarea
                              value={item.megaMenuConfig.featuredCard?.description || ''}
                              onChange={(e) =>
                                handleUpdateItem(idx, {
                                  megaMenuConfig: {
                                    ...item.megaMenuConfig,
                                    featuredCard: {
                                      ...item.megaMenuConfig?.featuredCard,
                                      description: e.target.value,
                                    },
                                  },
                                })
                              }
                              placeholder="Featured card description..."
                              rows={2}
                              className="text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB 2: FLOATING HEADER SETTINGS */}
        <TabsContent value="header" className="space-y-4">
          <Card className="p-6 space-y-6">
            <div>
              <CardTitle className="text-sm">Floating Header Appearance</CardTitle>
              <CardDescription className="text-xs">
                Control the fixed floating pill aesthetics and scroll transitions across the web application.
              </CardDescription>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card">
                <div>
                  <div className="text-xs font-semibold text-foreground">Sticky Header</div>
                  <div className="text-[11px] text-muted-foreground">Header remains pinned to top on scroll</div>
                </div>
                <Switch
                  checked={headerConfig.sticky}
                  onCheckedChange={(val) => setHeaderConfig({ ...headerConfig, sticky: val })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card">
                <div>
                  <div className="text-xs font-semibold text-foreground">Transparent Over Hero</div>
                  <div className="text-[11px] text-muted-foreground">Translucent pill bar at page top, solidifies on scroll</div>
                </div>
                <Switch
                  checked={headerConfig.transparentOverHero}
                  onCheckedChange={(val) =>
                    setHeaderConfig({ ...headerConfig, transparentOverHero: val })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card">
                <div>
                  <div className="text-xs font-semibold text-foreground">Backdrop Blur</div>
                  <div className="text-[11px] text-muted-foreground">Glassmorphic frosted blur effect</div>
                </div>
                <Switch
                  checked={headerConfig.blur}
                  onCheckedChange={(val) => setHeaderConfig({ ...headerConfig, blur: val })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card">
                <div>
                  <div className="text-xs font-semibold text-foreground">Rounded Pill Shape</div>
                  <div className="text-[11px] text-muted-foreground">Geometry of the floating navigation container</div>
                </div>
                <select
                  value={headerConfig.rounded}
                  onChange={(e) =>
                    setHeaderConfig({
                      ...headerConfig,
                      rounded: e.target.value as 'full' | 'lg' | 'none',
                    })
                  }
                  className="h-8 rounded border border-input bg-background px-2 text-xs text-foreground"
                >
                  <option value="full">Pill (full)</option>
                  <option value="lg">Rounded (lg)</option>
                  <option value="none">Square (none)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card">
                <div>
                  <div className="text-xs font-semibold text-foreground">Dark / Light Mode Toggle</div>
                  <div className="text-[11px] text-muted-foreground">Show or hide the theme switcher button in the public header</div>
                </div>
                <Switch
                  checked={headerConfig.showThemeToggle}
                  onCheckedChange={(val) => setHeaderConfig({ ...headerConfig, showThemeToggle: val })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card">
                <div>
                  <div className="text-xs font-semibold text-foreground">Search Bar / Command Palette</div>
                  <div className="text-[11px] text-muted-foreground">Show or hide the Search trigger button in the public header</div>
                </div>
                <Switch
                  checked={headerConfig.showSearchBar}
                  onCheckedChange={(val) => setHeaderConfig({ ...headerConfig, showSearchBar: val })}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-foreground">Header Action Button (CTA)</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Call-to-action button placed at the right side of the floating header.
                  </p>
                </div>
                <Switch
                  checked={headerConfig.cta.enabled}
                  onCheckedChange={(val) =>
                    setHeaderConfig({
                      ...headerConfig,
                      cta: { ...headerConfig.cta, enabled: val },
                    })
                  }
                />
              </div>

              {headerConfig.cta.enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Button Label</label>
                    <Input
                      value={headerConfig.cta.label}
                      onChange={(e) =>
                        setHeaderConfig({
                          ...headerConfig,
                          cta: { ...headerConfig.cta, label: e.target.value },
                        })
                      }
                      placeholder="e.g. Get In Touch"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Target URL</label>
                    <Input
                      value={headerConfig.cta.url}
                      onChange={(e) =>
                        setHeaderConfig({
                          ...headerConfig,
                          cta: { ...headerConfig.cta, url: e.target.value },
                        })
                      }
                      placeholder="/contact"
                      className="h-8 font-mono text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* CARD 2: HEADER BACKGROUND & ACTIVE PAGE LINK COLOR SETTINGS */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <span>Header Background & Active Page Colors</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Ensure any active page is prominently highlighted in the header navigation, and configure pure white header background.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[11px] font-mono text-primary bg-primary/10 border-primary/20">
                Live Navbar Theme
              </Badge>
            </div>

            {/* Header Background Mode */}
            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-foreground">Pure White Header Background</div>
                  <div className="text-[11px] text-muted-foreground">
                    Set header background to crisp, solid pure white (#ffffff) without translucent tinting
                  </div>
                </div>
                <Switch
                  checked={headerConfig.headerBgPureWhite ?? true}
                  onCheckedChange={(val) =>
                    setHeaderConfig({
                      ...headerConfig,
                      headerBgPureWhite: val,
                      headerBgColor: val ? '#ffffff' : (headerConfig.headerBgColor || '#ffffff'),
                      transparentOverHero: !val,
                    })
                  }
                />
              </div>

              {!headerConfig.headerBgPureWhite && (
                <div className="pt-2 border-t border-border/50 flex items-center gap-3">
                  <label className="text-xs text-muted-foreground font-medium">Custom Header Color:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={headerConfig.headerBgColor || '#ffffff'}
                      onChange={(e) =>
                        setHeaderConfig({ ...headerConfig, headerBgColor: e.target.value })
                      }
                      className="h-7 w-7 rounded border border-input cursor-pointer p-0"
                    />
                    <Input
                      value={headerConfig.headerBgColor || '#ffffff'}
                      onChange={(e) =>
                        setHeaderConfig({ ...headerConfig, headerBgColor: e.target.value })
                      }
                      className="h-7 w-28 font-mono text-xs"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Active Navigation Link Color Settings */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Active Page Indicator & Link Colors
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Active Link Text Color */}
                <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <span>Active Link Text Color</span>
                      <span
                        className="inline-block w-3 h-3 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: headerConfig.activeLinkColor || '#09090b' }}
                      />
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Font color for whichever page is currently active.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={headerConfig.activeLinkColor || '#09090b'}
                      onChange={(e) =>
                        setHeaderConfig({ ...headerConfig, activeLinkColor: e.target.value })
                      }
                      className="h-8 w-8 rounded-lg border border-input cursor-pointer p-0"
                    />
                    <Input
                      value={headerConfig.activeLinkColor || '#09090b'}
                      onChange={(e) =>
                        setHeaderConfig({ ...headerConfig, activeLinkColor: e.target.value })
                      }
                      placeholder="#09090b"
                      className="h-8 font-mono text-xs flex-1"
                    />
                  </div>

                  {/* Preset Swatches */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      Quick Swatches
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'Obsidian', hex: '#09090b' },
                        { label: 'Gypsym Lime', hex: '#9ae625' },
                        { label: 'Sapphire', hex: '#2563eb' },
                        { label: 'Indigo', hex: '#6366f1' },
                        { label: 'Emerald', hex: '#10b981' },
                        { label: 'Coral', hex: '#f43f5e' },
                        { label: 'Amber', hex: '#f59e0b' },
                      ].map((preset) => {
                        const isSelected = (headerConfig.activeLinkColor || '#09090b').toLowerCase() === preset.hex.toLowerCase();
                        return (
                          <button
                            key={preset.hex}
                            type="button"
                            onClick={() =>
                              setHeaderConfig({ ...headerConfig, activeLinkColor: preset.hex })
                            }
                            className={`px-2 py-1 rounded-md text-[11px] font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
                              isSelected
                                ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                                : 'border-border/60 hover:border-border text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/10"
                              style={{ backgroundColor: preset.hex }}
                            />
                            <span>{preset.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Active Link Pill Style & Background */}
                <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Active Link Pill Style
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Visual container badge behind the active navigation item.
                    </p>
                  </div>

                  <select
                    value={headerConfig.activeLinkStyle || 'pill'}
                    onChange={(e) =>
                      setHeaderConfig({
                        ...headerConfig,
                        activeLinkStyle: e.target.value as any,
                      })
                    }
                    className="w-full h-8 rounded border border-input bg-background px-2 text-xs text-foreground"
                  >
                    <option value="pill">Soft Neutral Pill (#f4f4f5)</option>
                    <option value="tint">Subtle 10% Color Tint</option>
                    <option value="solid">Solid Inverted Pill</option>
                    <option value="border">Crisp Border Outline</option>
                    <option value="dot">Minimalist Dot Only</option>
                  </select>

                  <div className="space-y-1 pt-1">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <span>Custom Active Background</span>
                      <span
                        className="inline-block w-3 h-3 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: headerConfig.activeLinkBgColor || '#f4f4f5' }}
                      />
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={headerConfig.activeLinkBgColor || '#f4f4f5'}
                        onChange={(e) =>
                          setHeaderConfig({ ...headerConfig, activeLinkBgColor: e.target.value })
                        }
                        className="h-8 w-8 rounded-lg border border-input cursor-pointer p-0"
                      />
                      <Input
                        value={headerConfig.activeLinkBgColor || '#f4f4f5'}
                        onChange={(e) =>
                          setHeaderConfig({ ...headerConfig, activeLinkBgColor: e.target.value })
                        }
                        placeholder="#f4f4f5"
                        className="h-8 font-mono text-xs flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE HEADER PREVIEW MOCKUP */}
            <div className="p-4 rounded-xl border border-border/80 bg-muted/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-primary" />
                  <span>Live Interactive Preview</span>
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Shows how the pure white header and active link appear to visitors
                </span>
              </div>

              {/* Simulated Floating Header Bar */}
              <div
                className="w-full rounded-2xl border border-neutral-200 px-4 py-3 flex items-center justify-between shadow-xs transition-colors"
                style={{
                  backgroundColor: headerConfig.headerBgColor || '#ffffff',
                }}
              >
                {/* Simulated Logo */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#9ae625] text-neutral-950 font-bold text-xs">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span className="font-bold text-sm text-neutral-900 tracking-tight">Gypsym</span>
                </div>

                {/* Simulated Navigation Links */}
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs text-neutral-600 px-2.5 py-1">Home</span>
                  <span className="text-xs text-neutral-600 px-2.5 py-1">Services</span>

                  {/* ACTIVE ITEM MOCKUP */}
                  {(() => {
                    const activeCol = headerConfig.activeLinkColor || '#09090b';
                    const activeBgCol = headerConfig.activeLinkBgColor || '#f4f4f5';
                    const styleType = headerConfig.activeLinkStyle || 'pill';

                    const bg =
                      styleType === 'solid'
                        ? activeCol
                        : styleType === 'tint'
                        ? `${activeCol}15`
                        : styleType === 'border' || styleType === 'dot'
                        ? 'transparent'
                        : activeBgCol;

                    const textCol =
                      styleType === 'solid' && (activeCol === '#09090b' || activeCol === '#000000')
                        ? '#ffffff'
                        : activeCol;

                    const borderStyle =
                      styleType === 'border'
                        ? `1.5px solid ${activeCol}`
                        : styleType === 'pill'
                        ? '1px solid rgba(0,0,0,0.08)'
                        : undefined;

                    return (
                      <span
                        className="text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-xs transition-all"
                        style={{
                          backgroundColor: bg,
                          color: textCol,
                          border: borderStyle,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: styleType === 'solid' ? '#ffffff' : activeCol,
                          }}
                        />
                        <span>ROI Calculator</span>
                      </span>
                    );
                  })()}

                  <span className="text-xs text-neutral-600 px-2.5 py-1">Portfolio</span>
                  <span className="text-xs text-neutral-600 px-2.5 py-1">Blog</span>
                  <span className="text-xs text-neutral-600 px-2.5 py-1">Contact</span>
                </div>

                {/* Simulated CTA button */}
                <div className="px-3.5 py-1.5 rounded-full bg-neutral-950 text-white text-xs font-medium shrink-0">
                  {headerConfig.cta?.label || 'Book Call'}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminContentContainer>
  );
}
