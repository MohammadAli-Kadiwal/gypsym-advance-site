'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import {
  Sparkles,
  Layers,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Box,
  Eye,
} from 'lucide-react';
import type {
  PortfolioSection,
  PortfolioPayload,
  PortfolioProject,
} from './types';

const Label = ({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-xs font-semibold text-slate-700 ${className}`} {...props} />
);

interface PortfolioSettingsProps {
  section: PortfolioSection;
  onChange: (updated: PortfolioSection) => void;
}

export function PortfolioSettings({ section, onChange }: PortfolioSettingsProps) {
  const p: PortfolioPayload = section.contentPayload || {};

  const update = (partial: Partial<PortfolioPayload>) => {
    onChange({
      ...section,
      contentPayload: {
        ...p,
        ...partial,
      },
    });
  };

  const projects: PortfolioProject[] = Array.isArray(p.projects) ? p.projects : [];

  const updateProject = (index: number, partial: Partial<PortfolioProject>) => {
    const updated = [...projects];
    updated[index] = {
      ...updated[index],
      ...partial,
    };
    update({ projects: updated });
  };

  const addProject = () => {
    const nextIndex = projects.length + 1;
    const newProject: PortfolioProject = {
      id: `proj-${Date.now()}`,
      orderNumber: String(nextIndex).padStart(2, '0'),
      title: `Showcase Project ${nextIndex}`,
      client: 'Enterprise Client',
      category: 'Digital Architecture',
      description: 'High-performance mission-critical platform engineered for global scale.',
      imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=1200&auto=format&fit=crop',
      altText: `Showcase project ${nextIndex} interface`,
      projectUrl: `/portfolio/project-${nextIndex}`,
      tags: ['Next.js', 'Turborepo'],
      metrics: '+35% Efficiency',
    };
    update({ projects: [...projects, newProject] });
  };

  const deleteProject = (index: number) => {
    if (projects.length <= 1) {
      alert('The portfolio section must contain at least one project.');
      return;
    }
    const updated = projects.filter((_, i) => i !== index);
    update({ projects: updated });
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const updated = [...projects];
    const temp = updated[index]!;
    updated[index] = updated[targetIndex]!;
    updated[targetIndex] = temp;
    update({ projects: updated });
  };

  return (
    <div className="space-y-6">
      {/* ── SECTION VISIBILITY ─────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm text-slate-800">
                  Portfolio / Our Work Section Visibility
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d9127b]/10 text-[#d9127b]">
                  Section 5 (After What We Change)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Display the 2 → 1 → 2 interactive showcase grid on the public home page.
              </p>
            </div>
            <Switch
              checked={section.isActive}
              onCheckedChange={(checked) => onChange({ ...section, isActive: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── SECTION HEADINGS ───────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d9127b]" />
            <CardTitle className="text-base font-bold text-slate-900">
              Section Header & Typography
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Control the eyebrow, headline, dynamic highlight, and introductory text.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Section Eyebrow</Label>
              <Input
                value={p.eyebrow || ''}
                onChange={(e) => update({ eyebrow: e.target.value })}
                placeholder="PORTFOLIO"
                className="text-xs h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Highlighted Phrase (Dynamic Brand Color)</Label>
              <Input
                value={p.titleHighlight || ''}
                onChange={(e) => update({ titleHighlight: e.target.value })}
                placeholder="Our Work"
                className="text-xs h-9 font-medium text-[#d9127b]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Main Title (Multi-line supported)</Label>
            <Input
              value={p.title || ''}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Our Work In Production"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Section Description</Label>
            <Textarea
              value={p.description || ''}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="High-performance architectures, mission-critical platforms, and conversion engines engineered for global enterprises."
              rows={2}
              className="text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── HOME PAGE DISPLAY LIMIT ────────────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#d9127b]" />
            <CardTitle className="text-base font-bold text-slate-900">
              Home Page Projects Display Count
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Control how many projects are shown in the Home page section. On mobile, projects are rendered in an interactive swipeable slider.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-w-md space-y-1.5">
            <Label>Number of Projects to Display on Home Page</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                max={projects.length || 50}
                value={p.maxDisplayCount !== undefined && p.maxDisplayCount !== null ? p.maxDisplayCount : ''}
                onChange={(e) => {
                  const val = e.target.value.trim() === '' ? undefined : parseInt(e.target.value, 10);
                  update({ maxDisplayCount: isNaN(val as number) ? undefined : val });
                }}
                placeholder={`All (${projects.length})`}
                className="text-xs h-9 w-36"
              />
              <span className="text-xs text-slate-500">
                {p.maxDisplayCount ? `Displaying top ${p.maxDisplayCount} of ${projects.length} projects` : `Displaying all ${projects.length} projects`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Enter a number (e.g. 3, 4, 5) to restrict the number of projects shown on the home page, or leave blank to display all {projects.length} projects.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── HOVER & VIEW BUTTON SETTINGS ───────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#d9127b]" />
            <CardTitle className="text-base font-bold text-slate-900">
              Card Hover & View Button Interaction
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Configure the floating &quot;View Project&quot; button, backdrop glass blur, and zoom transitions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div>
                <Label>Hover Effects</Label>
                <p className="text-[11px] text-slate-500">Enable card hover interactions</p>
              </div>
              <Switch
                checked={p.hoverEffectsEnabled !== false}
                onCheckedChange={(checked) => update({ hoverEffectsEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div>
                <Label>View Button</Label>
                <p className="text-[11px] text-slate-500">Floating &quot;View Project&quot; button</p>
              </div>
              <Switch
                checked={p.viewButtonEnabled !== false}
                onCheckedChange={(checked) => update({ viewButtonEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div>
                <Label>Dark/Glass Overlay</Label>
                <p className="text-[11px] text-slate-500">Subtle background tint on hover</p>
              </div>
              <Switch
                checked={p.overlayEnabled !== false}
                onCheckedChange={(checked) => update({ overlayEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div>
                <Label>Backdrop Blur</Label>
                <p className="text-[11px] text-slate-500">Controlled glassmorphism filter</p>
              </div>
              <Switch
                checked={p.backdropBlurEnabled !== false}
                onCheckedChange={(checked) => update({ backdropBlurEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div>
                <Label>Image Zoom</Label>
                <p className="text-[11px] text-slate-500">Subtle 1.04x scale inside card</p>
              </div>
              <Switch
                checked={p.imageZoomEnabled !== false}
                onCheckedChange={(checked) => update({ imageZoomEnabled: checked })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label>View Button Label</Label>
              <Input
                value={p.viewButtonLabel || 'View'}
                onChange={(e) => update({ viewButtonLabel: e.target.value })}
                placeholder="View"
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label>View Button Position</Label>
              <select
                value={p.viewButtonPosition || 'center'}
                onChange={(e) =>
                  update({
                    viewButtonPosition: e.target.value as
                      | 'center'
                      | 'bottom-center'
                      | 'bottom-right',
                  })
                }
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="center">Center (Recommended)</option>
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 3D SCROLL & PARALLAX SETTINGS ─────────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-[#d9127b]" />
            <CardTitle className="text-base font-bold text-slate-900">
              3D Scroll & Mouse Parallax Physics
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Controlled 3D depth perspective and desktop mouse tracking. Respects prefers-reduced-motion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div>
                <Label>3D Scroll Depth</Label>
                <p className="text-[11px] text-slate-500">Perspective rotation on scroll</p>
              </div>
              <Switch
                checked={p.threeDScrollEnabled !== false}
                onCheckedChange={(checked) => update({ threeDScrollEnabled: checked })}
              />
            </div>

            <div className="space-y-1.5 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <Label>3D Intensity Preset</Label>
              <select
                value={p.threeDIntensity || 'premium'}
                onChange={(e) =>
                  update({
                    threeDIntensity: e.target.value as 'subtle' | 'premium',
                  })
                }
                className="w-full h-8 rounded-md border border-input bg-background px-2 py-0.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
              >
                <option value="premium">Premium (Dynamic Depth)</option>
                <option value="subtle">Subtle (Restrained)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div>
                <Label>Mouse Parallax</Label>
                <p className="text-[11px] text-slate-500">Desktop-only micro tilt</p>
              </div>
              <Switch
                checked={p.mouseParallaxEnabled !== false}
                onCheckedChange={(checked) => update({ mouseParallaxEnabled: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── PROJECTS LIST (2 -> 1 -> 2 LAYOUT) ─────────────────────────── */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#d9127b]" />
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Showcase Projects (2 → 1 → 2 Layout)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Card 1 & 2: Row 1 | Card 3: Full-width Spotlight Row 2 | Card 4 & 5: Row 3
                </CardDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addProject}
              className="text-xs h-8 gap-1 border-dashed"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Project Card
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {projects.map((project, idx) => {
            const isFullWidth = idx % 5 === 2;
            const layoutPositionLabel = isFullWidth
              ? 'Row 2 (Full Width Spotlight)'
              : idx % 5 < 2
              ? `Row 1 (Card ${(idx % 5) + 1})`
              : `Row 3 (Card ${(idx % 5) - 1})`;

            return (
              <div
                key={project.id || idx}
                className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs"
              >
                {/* Header with layout tag & move controls */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#d9127b] bg-[#d9127b]/10 px-2 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                      {project.title || 'Untitled Project'}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {layoutPositionLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveProject(idx, 'up')}
                      disabled={idx === 0}
                      className="h-7 w-7 text-slate-500 hover:text-slate-800 disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveProject(idx, 'down')}
                      disabled={idx === projects.length - 1}
                      className="h-7 w-7 text-slate-500 hover:text-slate-800 disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteProject(idx)}
                      disabled={projects.length <= 1}
                      className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label>Numeric Badge (.01, .02)</Label>
                    <Input
                      value={project.orderNumber || ''}
                      onChange={(e) => updateProject(idx, { orderNumber: e.target.value })}
                      placeholder=".01"
                      className="text-xs h-8"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Project Title</Label>
                    <Input
                      value={project.title || ''}
                      onChange={(e) => updateProject(idx, { title: e.target.value })}
                      placeholder="Apex Capital Derivatives Exchange"
                      className="text-xs h-8 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label>Client Name</Label>
                    <Input
                      value={project.client || ''}
                      onChange={(e) => updateProject(idx, { client: e.target.value })}
                      placeholder="Apex Capital Management"
                      className="text-xs h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Industry / Category</Label>
                    <Input
                      value={project.category || ''}
                      onChange={(e) => updateProject(idx, { category: e.target.value })}
                      placeholder="Financial Infrastructure"
                      className="text-xs h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Key Metric Pill</Label>
                    <Input
                      value={project.metrics || ''}
                      onChange={(e) => updateProject(idx, { metrics: e.target.value })}
                      placeholder="$40B+ Daily Volume · 99.999% SLA"
                      className="text-xs h-8"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Project Summary</Label>
                  <Textarea
                    value={project.description || ''}
                    onChange={(e) => updateProject(idx, { description: e.target.value })}
                    placeholder="Short description of the technical achievement and enterprise business impact."
                    rows={2}
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Project Target URL</Label>
                    <Input
                      value={project.projectUrl || ''}
                      onChange={(e) => updateProject(idx, { projectUrl: e.target.value })}
                      placeholder="/portfolio/apex-capital"
                      className="text-xs h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Tech Stack Tags (comma separated)</Label>
                    <Input
                      value={Array.isArray(project.tags) ? project.tags.join(', ') : ''}
                      onChange={(e) =>
                        updateProject(idx, {
                          tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                        })
                      }
                      placeholder="Rust, eBPF, Kafka"
                      className="text-xs h-8"
                    />
                  </div>
                </div>

                {/* Project Image upload & Alt text */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <Label>Showcase Image</Label>
                    <ImageUploadField
                      value={project.imageUrl || ''}
                      onChange={(url) => updateProject(idx, { imageUrl: url })}
                      label="Upload Project Cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Image Alt Text</Label>
                    <Input
                      value={project.altText || ''}
                      onChange={(e) => updateProject(idx, { altText: e.target.value })}
                      placeholder="Detailed visual description for accessibility"
                      className="text-xs h-8 mt-1"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
