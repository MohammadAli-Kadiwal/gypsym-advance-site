'use client';

import * as React from 'react';
import {
  Shield,
  ShieldAlert,
  Save,
  ExternalLink,
  Plus,
  Trash2,
  Eye,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { notify } from '@/lib/notifications';
import { normalizeErrorMessage } from '@/lib/api';
import { seoService, RobotsConfigData } from '@/services/seo.service';

export function RobotsTab() {
  const [config, setConfig] = React.useState<RobotsConfigData>({
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/admin/', '/api/', '/private/'],
      },
    ],
    sitemapUrl: '',
    customText: '',
  });

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);

  // Path input state for each rule
  const [newAllowPath, setNewAllowPath] = React.useState<{ [ruleIdx: number]: string }>({});
  const [newDisallowPath, setNewDisallowPath] = React.useState<{ [ruleIdx: number]: string }>({});

  const loadRobots = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await seoService.getRobots();
      if (data && typeof data === 'object') {
        setConfig({
          rules: Array.isArray(data.rules) && data.rules.length > 0 ? data.rules : [
            { userAgent: '*', allow: ['/'], disallow: ['/admin/', '/api/'] },
          ],
          sitemapUrl: data.sitemapUrl || '',
          customText: data.customText || '',
        });
      }
    } catch (err) {
      notify.error({ title: 'Failed to load robots.txt config', description: normalizeErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadRobots();
  }, [loadRobots]);

  const hasDangerousDisallowAll = React.useMemo(() => {
    return config.rules.some(
      (r) => (r.userAgent === '*' || r.userAgent === 'Googlebot') && r.disallow.includes('/')
    );
  }, [config.rules]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasDangerousDisallowAll) {
      const confirmed = window.confirm(
        'CRITICAL SEO WARNING: You are about to block all search engine crawlers from the root URL (Disallow: /). This will remove Gypsym Technology from Google and Bing search results. Are you sure you want to proceed?'
      );
      if (!confirmed) return;
    }

    try {
      setSaving(true);
      await seoService.updateRobots(config);
      notify.success({ title: 'robots.txt saved', description: 'Search bot directives updated successfully.' });
    } catch (err) {
      notify.error({ title: 'Failed to save robots.txt', description: normalizeErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const addRule = () => {
    setConfig((prev) => ({
      ...prev,
      rules: [...prev.rules, { userAgent: 'Googlebot', allow: ['/'], disallow: [] }],
    }));
  };

  const removeRule = (idx: number) => {
    setConfig((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== idx),
    }));
  };

  const addAllowPath = (ruleIdx: number) => {
    const val = (newAllowPath[ruleIdx] || '').trim();
    if (!val) return;
    const formatted = val.startsWith('/') ? val : `/${val}`;
    setConfig((prev) => {
      const nextRules = prev.rules.map((rule, idx) => {
        if (idx !== ruleIdx) return rule;
        return {
          ...rule,
          allow: rule.allow.includes(formatted) ? rule.allow : [...rule.allow, formatted],
        };
      });
      return { ...prev, rules: nextRules };
    });
    setNewAllowPath((prev) => ({ ...prev, [ruleIdx]: '' }));
  };

  const removeAllowPath = (ruleIdx: number, pathIdx: number) => {
    setConfig((prev) => {
      const nextRules = prev.rules.map((rule, idx) => {
        if (idx !== ruleIdx) return rule;
        return {
          ...rule,
          allow: rule.allow.filter((_, i) => i !== pathIdx),
        };
      });
      return { ...prev, rules: nextRules };
    });
  };

  const addDisallowPath = (ruleIdx: number) => {
    const val = (newDisallowPath[ruleIdx] || '').trim();
    if (!val) return;
    const formatted = val.startsWith('/') ? val : `/${val}`;
    setConfig((prev) => {
      const nextRules = prev.rules.map((rule, idx) => {
        if (idx !== ruleIdx) return rule;
        return {
          ...rule,
          disallow: rule.disallow.includes(formatted) ? rule.disallow : [...rule.disallow, formatted],
        };
      });
      return { ...prev, rules: nextRules };
    });
    setNewDisallowPath((prev) => ({ ...prev, [ruleIdx]: '' }));
  };

  const removeDisallowPath = (ruleIdx: number, pathIdx: number) => {
    setConfig((prev) => {
      const nextRules = prev.rules.map((rule, idx) => {
        if (idx !== ruleIdx) return rule;
        return {
          ...rule,
          disallow: rule.disallow.filter((_, i) => i !== pathIdx),
        };
      });
      return { ...prev, rules: nextRules };
    });
  };

  const previewRobotsText = React.useMemo(() => {
    const lines: string[] = ['# Dynamic robots.txt generated by Gypsym Technology CMS', ''];
    config.rules.forEach((rule) => {
      lines.push(`User-agent: ${rule.userAgent}`);
      rule.allow.forEach((a) => lines.push(`Allow: ${a}`));
      rule.disallow.forEach((d) => lines.push(`Disallow: ${d}`));
      lines.push('');
    });
    if (config.sitemapUrl) {
      lines.push(`Sitemap: ${config.sitemapUrl}`);
    }
    if (config.customText?.trim()) {
      lines.push('');
      lines.push(config.customText.trim());
    }
    return lines.join('\n');
  }, [config]);

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground animate-pulse">
        Loading Robots.txt Configuration...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Robots.txt Directive Management
              </CardTitle>
              <CardDescription>
                Define crawling permissions for search engine robots, AI web scrapers, and automated indexes.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open('http://localhost:3000/robots.txt', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Live /robots.txt
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Hide Preview' : 'Preview Text'}
              </Button>
              <Button type="submit" size="sm" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Directives'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Critical Warning if blocking whole site */}
          {hasDangerousDisallowAll && (
            <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm">CRITICAL DANGER: Site-wide blocking active</div>
                <div className="text-xs mt-1 leading-relaxed">
                  You have configured <code>Disallow: /</code> for User-agent * or Googlebot. Search engines will not index any page of Gypsym Technology. Remove this rule for production visibility.
                </div>
              </div>
            </div>
          )}

          {/* Rules List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">User-Agent Rules</Label>
              <Button type="button" variant="outline" size="sm" onClick={addRule}>
                <Plus className="h-4 w-4 mr-1.5" /> Add User-Agent Block
              </Button>
            </div>

            {config.rules.map((rule, ruleIdx) => (
              <div key={ruleIdx} className="p-4 rounded-xl border bg-muted/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Label htmlFor={`ua-${ruleIdx}`} className="text-xs font-semibold text-muted-foreground">
                      User-agent:
                    </Label>
                    <Input
                      id={`ua-${ruleIdx}`}
                      value={rule.userAgent}
                      onChange={(e) => {
                        const val = e.target.value;
                        setConfig((prev) => ({
                          ...prev,
                          rules: prev.rules.map((r, idx) => (idx === ruleIdx ? { ...r, userAgent: val } : r)),
                        }));
                      }}
                      className="w-48 h-8 font-mono text-xs"
                      placeholder="* or Googlebot"
                    />
                  </div>
                  {config.rules.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRule(ruleIdx)}
                      className="text-destructive hover:text-destructive h-8 px-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Allow Paths */}
                  <div className="space-y-2 p-3 rounded-lg border bg-background/50">
                    <Label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Allow Paths</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="/ or /services"
                        value={newAllowPath[ruleIdx] || ''}
                        onChange={(e) => setNewAllowPath((p) => ({ ...p, [ruleIdx]: e.target.value }))}
                        className="h-8 text-xs font-mono"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addAllowPath(ruleIdx);
                          }
                        }}
                      />
                      <Button type="button" size="sm" variant="outline" className="h-8" onClick={() => addAllowPath(ruleIdx)}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {rule.allow.map((path, pIdx) => (
                        <Badge key={pIdx} variant="outline" className="text-xs font-mono gap-1 text-emerald-600 border-emerald-500/30">
                          Allow: {path}
                          <button
                            type="button"
                            onClick={() => removeAllowPath(ruleIdx, pIdx)}
                            className="hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Disallow Paths */}
                  <div className="space-y-2 p-3 rounded-lg border bg-background/50">
                    <Label className="text-xs font-semibold text-rose-600 dark:text-rose-400">Disallow Paths</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="/admin/ or /api/"
                        value={newDisallowPath[ruleIdx] || ''}
                        onChange={(e) => setNewDisallowPath((p) => ({ ...p, [ruleIdx]: e.target.value }))}
                        className="h-8 text-xs font-mono"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addDisallowPath(ruleIdx);
                          }
                        }}
                      />
                      <Button type="button" size="sm" variant="outline" className="h-8" onClick={() => addDisallowPath(ruleIdx)}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {rule.disallow.map((path, pIdx) => (
                        <Badge key={pIdx} variant="outline" className="text-xs font-mono gap-1 text-rose-600 border-rose-500/30">
                          Disallow: {path}
                          <button
                            type="button"
                            onClick={() => removeDisallowPath(ruleIdx, pIdx)}
                            className="hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sitemap Declaration */}
          <div className="space-y-1.5 pt-4 border-t">
            <Label htmlFor="sitemapUrl">Sitemap URL Declaration</Label>
            <Input
              id="sitemapUrl"
              placeholder="https://gypsym.com/sitemap.xml (or leave blank for automatic domain detection)"
              value={config.sitemapUrl || ''}
              onChange={(e) => setConfig((p) => ({ ...p, sitemapUrl: e.target.value }))}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              If left blank, the system automatically appends <code>Sitemap: [Site URL]/sitemap.xml</code> using the configured Global Site URL.
            </p>
          </div>

          {/* Custom Raw Directives */}
          <div className="space-y-1.5 pt-2">
            <Label htmlFor="customText">Custom / Additional Directives</Label>
            <Textarea
              id="customText"
              placeholder="e.g. Crawl-delay: 10&#10;User-agent: GPTBot&#10;Disallow: /"
              value={config.customText || ''}
              onChange={(e) => setConfig((p) => ({ ...p, customText: e.target.value }))}
              rows={3}
              className="font-mono text-xs"
            />
          </div>

          {/* Live Preview */}
          {showPreview && (
            <div className="pt-4 border-t space-y-2">
              <span className="text-xs font-semibold text-foreground">Generated /robots.txt Output:</span>
              <pre className="p-4 rounded-lg bg-muted/60 font-mono text-xs overflow-x-auto border">
                {previewRobotsText}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
