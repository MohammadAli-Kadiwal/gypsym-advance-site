'use client';

import * as React from 'react';
import {
  Link2,
  Globe,
  Save,
  Plus,
  Trash2,
  Edit2,
  Languages,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { notify } from '@/lib/notifications';
import { normalizeErrorMessage } from '@/lib/api';
import { seoService, HreflangLocaleData, GlobalSeoData } from '@/services/seo.service';

export function CanonicalsTab() {
  const [globalSeo, setGlobalSeo] = React.useState<GlobalSeoData | null>(null);
  const [locales, setLocales] = React.useState<HreflangLocaleData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // Hreflang modal
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingIdx, setEditingIdx] = React.useState<number | null>(null);
  const [locCode, setLocCode] = React.useState('');
  const [locName, setLocName] = React.useState('');
  const [locHreflang, setLocHreflang] = React.useState('');
  const [locDomain, setLocDomain] = React.useState('');
  const [locIsDefault, setLocIsDefault] = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [g, h] = await Promise.all([
        seoService.getGlobal(),
        seoService.getHreflang(),
      ]);
      setGlobalSeo(g);
      setLocales(Array.isArray(h?.locales) ? h.locales : []);
    } catch (err) {
      notify.error({ title: 'Failed to load canonical & hreflang settings', description: normalizeErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveCanonicals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSeo) return;
    try {
      setSaving(true);
      await Promise.all([
        seoService.updateGlobal(globalSeo),
        seoService.updateHreflang({ locales }),
      ]);
      notify.success({ title: 'Settings saved', description: 'Canonical URL and hreflang directives updated.' });
    } catch (err) {
      notify.error({ title: 'Failed to save canonicals', description: normalizeErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAddLocale = () => {
    setEditingIdx(null);
    setLocCode('');
    setLocName('');
    setLocHreflang('');
    setLocDomain('');
    setLocIsDefault(locales.length === 0);
    setIsDialogOpen(true);
  };

  const handleOpenEditLocale = (loc: HreflangLocaleData, idx: number) => {
    setEditingIdx(idx);
    setLocCode(loc.code);
    setLocName(loc.name);
    setLocHreflang(loc.hreflangCode);
    setLocDomain(loc.domain || '');
    setLocIsDefault(loc.isDefault || false);
    setIsDialogOpen(true);
  };

  const handleSaveLocale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locCode.trim() || !locName.trim() || !locHreflang.trim()) {
      notify.error({ title: 'Validation error', description: 'Language code, name, and hreflang code are required.' });
      return;
    }

    const newLoc: HreflangLocaleData = {
      code: locCode.trim().toLowerCase(),
      name: locName.trim(),
      hreflangCode: locHreflang.trim().toLowerCase(),
      domain: locDomain.trim() || undefined,
      isDefault: locIsDefault,
    };

    setLocales((prev) => {
      let updated = [...prev];
      if (newLoc.isDefault) {
        updated = updated.map((l) => ({ ...l, isDefault: false }));
      }
      if (editingIdx !== null) {
        updated[editingIdx] = newLoc;
      } else {
        updated.push(newLoc);
      }
      return updated;
    });

    setIsDialogOpen(false);
  };

  const handleDeleteLocale = (idx: number) => {
    setLocales((prev) => prev.filter((_, i) => i !== idx));
  };

  if (loading || !globalSeo) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground animate-pulse">
        Loading Canonical & International SEO settings...
      </div>
    );
  }

  return (
    <form onSubmit={handleSaveCanonicals} className="space-y-6">
      {/* Canonicals Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                Canonical URL & Indexing Controls
              </CardTitle>
              <CardDescription>
                Define canonical base domains, automatic URL normalization, and indexing policy to prevent duplicate content penalties.
              </CardDescription>
            </div>
            <Button type="submit" size="sm" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="canonicalBaseUrl">Canonical Base URL (Origin Domain) *</Label>
              <Input
                id="canonicalBaseUrl"
                placeholder="https://gypsym.com"
                value={globalSeo.canonicalBaseUrl || globalSeo.siteUrl || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setGlobalSeo((p) => (p ? { ...p, canonicalBaseUrl: val, siteUrl: val } : p));
                }}
                required
              />
              <p className="text-xs text-muted-foreground">
                All automatic canonical tags will prefix this base URL (e.g. <code>https://gypsym.com/services</code>).
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-lg border bg-muted/20">
              <div className="text-xs font-semibold text-foreground">Global Default Indexing Policy</div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="robotsIndex" className="cursor-pointer text-xs font-medium">
                    Index Pages by Default
                  </Label>
                  <p className="text-[11px] text-muted-foreground">Allow search engines to index pages unless overridden.</p>
                </div>
                <Switch
                  id="robotsIndex"
                  checked={globalSeo.robotsIndex ?? true}
                  onCheckedChange={(checked) => setGlobalSeo((p) => (p ? { ...p, robotsIndex: checked } : p))}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="space-y-0.5">
                  <Label htmlFor="robotsFollow" className="cursor-pointer text-xs font-medium">
                    Follow Links by Default
                  </Label>
                  <p className="text-[11px] text-muted-foreground">Allow bots to crawl outbound links on pages.</p>
                </div>
                <Switch
                  id="robotsFollow"
                  checked={globalSeo.robotsFollow ?? true}
                  onCheckedChange={(checked) => setGlobalSeo((p) => (p ? { ...p, robotsFollow: checked } : p))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hreflang / International SEO Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Languages className="h-5 w-5 text-primary" />
                Hreflang & International SEO Locales
              </CardTitle>
              <CardDescription>
                Instruct search engines which language and regional version to serve across international search results.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleOpenAddLocale}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Locale
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {locales.length === 0 ? (
            <div className="py-8 text-center border rounded-lg bg-muted/20">
              <Globe className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <div className="text-sm font-semibold">Single Language Website</div>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                No international hreflang locales defined. Gypsym Technology currently serves default English (en-US).
              </p>
              <Button type="button" variant="outline" size="sm" className="mt-3" onClick={handleOpenAddLocale}>
                <Plus className="h-4 w-4 mr-1.5" /> Configure First Locale
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground text-left">
                  <tr>
                    <th className="p-3">Language / Region</th>
                    <th className="p-3">Code</th>
                    <th className="p-3">Hreflang Tag</th>
                    <th className="p-3">Domain / Alternate</th>
                    <th className="p-3">Default</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {locales.map((loc, idx) => (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-semibold text-foreground">{loc.name}</td>
                      <td className="p-3 font-mono text-xs">{loc.code}</td>
                      <td className="p-3 font-mono text-xs text-primary">{loc.hreflangCode}</td>
                      <td className="p-3 font-mono text-xs text-muted-foreground">{loc.domain || 'Same origin'}</td>
                      <td className="p-3">
                        {loc.isDefault ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">
                            x-default
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleOpenEditLocale(loc, idx)}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteLocale(idx)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Locale Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSaveLocale}>
            <DialogHeader>
              <DialogTitle>{editingIdx !== null ? 'Edit Locale' : 'Add Hreflang Locale'}</DialogTitle>
              <DialogDescription>
                Define ISO language and regional codes for international indexing.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="locName">Display Name *</Label>
                <Input
                  id="locName"
                  placeholder="e.g. English (United States) or German (DACH)"
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="locCode">Locale Code *</Label>
                  <Input
                    id="locCode"
                    placeholder="en or de"
                    value={locCode}
                    onChange={(e) => setLocCode(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="locHreflang">Hreflang Code *</Label>
                  <Input
                    id="locHreflang"
                    placeholder="en-us or de-de"
                    value={locHreflang}
                    onChange={(e) => setLocHreflang(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="locDomain">Custom Domain / Prefix (Optional)</Label>
                <Input
                  id="locDomain"
                  placeholder="e.g. https://de.gypsym.com"
                  value={locDomain}
                  onChange={(e) => setLocDomain(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="locIsDefault" className="cursor-pointer text-sm">
                  Set as <code>x-default</code> fallback
                </Label>
                <Switch id="locIsDefault" checked={locIsDefault} onCheckedChange={setLocIsDefault} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingIdx !== null ? 'Update Locale' : 'Add Locale'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </form>
  );
}
