'use client';

import * as React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Save,
  Plus,
  Trash2,
  Network,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { notify } from '@/lib/notifications';
import { normalizeErrorMessage } from '@/lib/api';
import { seoService, GeoProfileData } from '@/services/seo.service';

export function GeoTab() {
  const [profile, setProfile] = React.useState<GeoProfileData>({
    brandName: '',
    legalName: '',
    shortDescription: '',
    longDescription: '',
    industry: '',
    foundedYear: '',
    headquarters: '',
    serviceAreas: [],
    websiteUrl: '',
    contactEmail: '',
    contactPhone: '',
    founderInfo: '',
    keyDifferentiators: [],
    topicalEntities: [],
  });

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // Input helpers for array values
  const [newServiceArea, setNewServiceArea] = React.useState('');
  const [newDifferentiator, setNewDifferentiator] = React.useState('');
  const [newEntityName, setNewEntityName] = React.useState('');
  const [newEntityType, setNewEntityType] = React.useState('Technology');
  const [newEntityDesc, setNewEntityDesc] = React.useState('');

  const loadGeo = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await seoService.getGeo();
      if (data && typeof data === 'object') {
        setProfile({
          brandName: data.brandName || '',
          legalName: data.legalName || '',
          shortDescription: data.shortDescription || '',
          longDescription: data.longDescription || '',
          industry: data.industry || '',
          foundedYear: data.foundedYear || '',
          headquarters: data.headquarters || '',
          serviceAreas: Array.isArray(data.serviceAreas) ? data.serviceAreas : [],
          websiteUrl: data.websiteUrl || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          founderInfo: data.founderInfo || '',
          keyDifferentiators: Array.isArray(data.keyDifferentiators) ? data.keyDifferentiators : [],
          topicalEntities: Array.isArray(data.topicalEntities) ? data.topicalEntities : [],
        });
      }
    } catch (err) {
      notify.error({ title: 'Failed to load GEO profile', description: normalizeErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadGeo();
  }, [loadGeo]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.brandName.trim()) {
      notify.error({ title: 'Validation error', description: 'Brand Name is required for GEO.' });
      return;
    }

    try {
      setSaving(true);
      await seoService.updateGeo(profile);
      notify.success({ title: 'GEO profile saved', description: 'Generative Engine entity profile updated.' });
    } catch (err) {
      notify.error({ title: 'Failed to save GEO settings', description: normalizeErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const addServiceArea = () => {
    const val = newServiceArea.trim();
    if (val && !profile.serviceAreas?.includes(val)) {
      setProfile((prev) => ({
        ...prev,
        serviceAreas: [...(prev.serviceAreas || []), val],
      }));
      setNewServiceArea('');
    }
  };

  const removeServiceArea = (idx: number) => {
    setProfile((prev) => ({
      ...prev,
      serviceAreas: prev.serviceAreas?.filter((_, i) => i !== idx),
    }));
  };

  const addDifferentiator = () => {
    const val = newDifferentiator.trim();
    if (val && !profile.keyDifferentiators?.includes(val)) {
      setProfile((prev) => ({
        ...prev,
        keyDifferentiators: [...(prev.keyDifferentiators || []), val],
      }));
      setNewDifferentiator('');
    }
  };

  const removeDifferentiator = (idx: number) => {
    setProfile((prev) => ({
      ...prev,
      keyDifferentiators: prev.keyDifferentiators?.filter((_, i) => i !== idx),
    }));
  };

  const addEntity = () => {
    const name = newEntityName.trim();
    if (name) {
      setProfile((prev) => ({
        ...prev,
        topicalEntities: [
          ...(prev.topicalEntities || []),
          { name, type: newEntityType, description: newEntityDesc.trim() },
        ],
      }));
      setNewEntityName('');
      setNewEntityDesc('');
    }
  };

  const removeEntity = (idx: number) => {
    setProfile((prev) => ({
      ...prev,
      topicalEntities: prev.topicalEntities?.filter((_, i) => i !== idx),
    }));
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground animate-pulse">
        Loading Generative Engine Profile...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Brand Entity Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Generative Engine Optimization (GEO)
              </CardTitle>
              <CardDescription>
                Define authoritative corporate entity attributes, core capabilities, and topical knowledge graphs consumed by LLMs.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={loadGeo}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload
              </Button>
              <Button type="submit" size="sm" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Consistency Verification Banner */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-semibold text-foreground">Canonical Entity Grounding</span>
              <p className="text-muted-foreground leading-relaxed">
                By maintaining a single source of truth for the corporate identity ({profile.brandName || 'Gypsym Technology'}), AI crawlers establish high topical authority and attribute enterprise solutions accurately.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="brandName">Canonical Brand Name *</Label>
              <Input
                id="brandName"
                placeholder="Gypsym Technology"
                value={profile.brandName}
                onChange={(e) => setProfile((p) => ({ ...p, brandName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="legalName">Legal / Corporate Name</Label>
              <Input
                id="legalName"
                placeholder="Gypsym Technology LLC / Inc."
                value={profile.legalName || ''}
                onChange={(e) => setProfile((p) => ({ ...p, legalName: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="shortDescription">Concise Entity Positioning (1-2 Sentences)</Label>
            <Textarea
              id="shortDescription"
              placeholder="e.g. Enterprise software engineering firm specializing in high-throughput cloud cores and AI ecosystems."
              value={profile.shortDescription || ''}
              onChange={(e) => setProfile((p) => ({ ...p, shortDescription: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="longDescription">Comprehensive Organization Authority Statement</Label>
            <Textarea
              id="longDescription"
              placeholder="Detailed authoritative corporate overview highlighting engineering credentials, architectural standards, and mission..."
              value={profile.longDescription || ''}
              onChange={(e) => setProfile((p) => ({ ...p, longDescription: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="industry">Industry Sector</Label>
              <Input
                id="industry"
                placeholder="Enterprise Software, Cloud"
                value={profile.industry || ''}
                onChange={(e) => setProfile((p) => ({ ...p, industry: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="foundedYear">Founded Year</Label>
              <Input
                id="foundedYear"
                placeholder="2018"
                value={profile.foundedYear || ''}
                onChange={(e) => setProfile((p) => ({ ...p, foundedYear: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="headquarters">Global Headquarters</Label>
              <Input
                id="headquarters"
                placeholder="San Francisco, CA"
                value={profile.headquarters || ''}
                onChange={(e) => setProfile((p) => ({ ...p, headquarters: e.target.value }))}
              />
            </div>
          </div>

          {/* Service Areas */}
          <div className="space-y-3 pt-2 border-t">
            <Label>Geographic Service & Operating Areas</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. North America, United Kingdom, MENA"
                value={newServiceArea}
                onChange={(e) => setNewServiceArea(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addServiceArea();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addServiceArea}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.serviceAreas && profile.serviceAreas.length > 0 ? (
                profile.serviceAreas.map((area, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1.5 py-1 px-2.5">
                    {area}
                    <button
                      type="button"
                      onClick={() => removeServiceArea(idx)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No service regions added yet.</span>
              )}
            </div>
          </div>

          {/* Key Differentiators */}
          <div className="space-y-3 pt-2 border-t">
            <Label>Authoritative Differentiators (Fact Quotations)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. 99.999% SLA architectural guarantees on core banking services"
                value={newDifferentiator}
                onChange={(e) => setNewDifferentiator(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addDifferentiator();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addDifferentiator}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {profile.keyDifferentiators && profile.keyDifferentiators.length > 0 ? (
                profile.keyDifferentiators.map((diff, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border bg-muted/30 flex items-center justify-between text-xs font-medium"
                  >
                    <span>• {diff}</span>
                    <button
                      type="button"
                      onClick={() => removeDifferentiator(idx)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No differentiator points defined.</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topical Entities Knowledge Graph */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Topical Authority & Knowledge Entities
          </CardTitle>
          <CardDescription>
            Map the core technical and architectural entities associated with Gypsym Technology in the semantic graph.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Entity inputs */}
          <div className="p-4 rounded-lg border bg-muted/20 space-y-3">
            <div className="text-xs font-semibold text-foreground">Add Semantic Entity</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                placeholder="Entity Name (e.g. Next.js)"
                value={newEntityName}
                onChange={(e) => setNewEntityName(e.target.value)}
              />
              <select
                value={newEntityType}
                onChange={(e) => setNewEntityType(e.target.value)}
                className="h-9 px-3 rounded-md border bg-background text-sm"
              >
                <option value="Technology">Technology</option>
                <option value="Architecture">Architecture</option>
                <option value="Industry">Industry</option>
                <option value="Service">Service</option>
                <option value="Methodology">Methodology</option>
              </select>
              <Button type="button" onClick={addEntity} disabled={!newEntityName.trim()}>
                <Plus className="h-4 w-4 mr-1" /> Add Entity
              </Button>
            </div>
            <Input
              placeholder="Entity context / description (e.g. High-performance SSR React framework used for enterprise web portals)"
              value={newEntityDesc}
              onChange={(e) => setNewEntityDesc(e.target.value)}
            />
          </div>

          {/* List of Topical Entities */}
          {profile.topicalEntities && profile.topicalEntities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.topicalEntities.map((ent, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border bg-card/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground">{ent.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {ent.type}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => removeEntity(idx)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {ent.description && <p className="text-xs text-muted-foreground">{ent.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-muted-foreground border rounded-lg bg-muted/10">
              No topical entities defined. Add key technologies, architectures, and capabilities above.
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
