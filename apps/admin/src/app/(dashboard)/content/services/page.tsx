'use client';

import * as React from 'react';
import {
  Plus,
  Trash2,
  X,
  ExternalLink,
  Layers,
  CheckCircle2,
  Loader2,
  DollarSign,
  HelpCircle,
  Sparkles,
  ShoppingBag,
  ShoppingCart,
  Layout,
  Search,
  ShieldCheck,
  Palette,
  Zap,
  Rocket,
  Globe,
  Code,
  Check,
} from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/crud/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { BaseRecord, ItemStatus } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import { notify } from '@/lib/notifications';
import { fetchApi } from '@/lib/api-client';
import { StatusToggleField } from '@/components/crud/status-toggle-field';

export interface ServiceProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface ServicePriceCurrency {
  currency: string;
  symbol: string;
  amount: string;
  period?: string;
}

export interface ServicePriceTier {
  name: string;
  description: string;
  isPopular?: boolean;
  prices: ServicePriceCurrency[];
  features: string[];
}

export interface ServiceBenefit {
  title: string;
  description: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceRecord extends BaseRecord {
  title: string;
  slug: string;
  tagline: string;
  shortDescription: string;
  detailedContent: string;
  category: string;
  iconName?: string;
  displayOrder: number;
  technologies?: string[];
  deliverables?: string[];
  process?: ServiceProcessStep[];
  benefits?: ServiceBenefit[];
  faqs?: ServiceFaq[];
  pricing?: ServicePriceTier[];
}

const CATEGORY_PRESETS = [
  'E-Commerce',
  'Design & Engineering',
  'Growth & Search',
  'Operations & Retainers',
  'Performance & CRO',
  'Setup & Launch',
];

const ICON_OPTIONS = [
  { name: 'ShoppingBag', label: 'Bag', icon: ShoppingBag },
  { name: 'ShoppingCart', label: 'Cart', icon: ShoppingCart },
  { name: 'Layout', label: 'Layout', icon: Layout },
  { name: 'Search', label: 'Search', icon: Search },
  { name: 'ShieldCheck', label: 'Shield', icon: ShieldCheck },
  { name: 'Palette', label: 'Palette', icon: Palette },
  { name: 'Zap', label: 'Zap', icon: Zap },
  { name: 'Rocket', label: 'Rocket', icon: Rocket },
  { name: 'Layers', label: 'Layers', icon: Layers },
  { name: 'Globe', label: 'Globe', icon: Globe },
  { name: 'Code', label: 'Code', icon: Code },
  { name: 'Sparkles', label: 'Sparkles', icon: Sparkles },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingBag,
  ShoppingCart,
  Layout,
  Search,
  ShieldCheck,
  Palette,
  Zap,
  Rocket,
  Layers,
  Globe,
  Code,
  Sparkles,
};

interface ServiceFormState {
  title: string;
  slug: string;
  category: string;
  iconName: string;
  tagline: string;
  shortDescription: string;
  detailedContent: string;
  displayOrder: number;
  status: ItemStatus;
  technologiesText: string;
  deliverables: string[];
  process: ServiceProcessStep[];
  pricing: ServicePriceTier[];
  benefits: ServiceBenefit[];
  faqs: ServiceFaq[];
}

const DEFAULT_PRICING: ServicePriceTier[] = [
  {
    name: 'Starter Store',
    description: 'For emerging D2C brands ready to launch a high-converting flagship store.',
    isPopular: false,
    prices: [
      { currency: 'USD', symbol: '$', amount: '4,999' },
      { currency: 'GBP', symbol: '£', amount: '3,999' },
      { currency: 'AED', symbol: 'AED ', amount: '18,500' },
    ],
    features: [
      'Custom Theme Setup & Styling',
      'Up to 50 Products Configured',
      'Payment & Shipping Setup',
      'Mobile Responsive Layout',
      'Basic SEO & Schema Markup',
      '14-Day Post-Launch Support',
    ],
  },
  {
    name: 'Growth Store',
    description: 'For scaling brands doing $500K-$2M seeking custom UI/UX and higher AOV.',
    isPopular: true,
    prices: [
      { currency: 'USD', symbol: '$', amount: '9,999' },
      { currency: 'GBP', symbol: '£', amount: '7,999' },
      { currency: 'AED', symbol: 'AED ', amount: '36,500' },
    ],
    features: [
      '100% Bespoke UI/UX Design in Figma',
      'Modular OS 2.0 Sections',
      'Custom Cart Drawer & Upsells',
      'ERP / Klaviyo Email Integration',
      'Core Web Vitals Optimization',
      '45-Day Dedicated Hypercare',
    ],
  },
  {
    name: 'Shopify Plus Enterprise',
    description: 'For high-volume brands ($2M-$20M+) requiring headless or multi-region architecture.',
    isPopular: false,
    prices: [
      { currency: 'USD', symbol: '$', amount: '24,999+' },
      { currency: 'GBP', symbol: '£', amount: '19,999+' },
      { currency: 'AED', symbol: 'AED ', amount: '91,500+' },
    ],
    features: [
      'Multi-Region & Multi-Currency Architecture',
      'Custom Checkout Extensibility Apps',
      'B2B Wholesale Portal Integration',
      'Dedicated Technical Account Manager',
      'Sub-Second Page Speed SLA',
      '90-Day VIP Dedicated Support',
    ],
  },
];

const DEFAULT_BENEFITS: ServiceBenefit[] = [
  { title: 'Maximum Conversion Velocity', description: 'Engineered checkout funnels designed to increase AOV and lower cart abandonment rates.' },
  { title: 'Global Scale Ready', description: 'Multi-currency, international taxation, and localized checkout flows for worldwide selling.' },
  { title: 'Seamless Inventory Sync', description: 'Automated real-time inventory and catalog management across channels with ERP connectors.' },
  { title: 'Sub-Second Load Times', description: 'Lightweight code architecture built strictly to exceed Google Core Web Vitals.' },
  { title: 'Mobile-First Experience', description: 'Designed specifically for the 78%+ of modern e-commerce shoppers purchasing on mobile viewports.' },
  { title: 'Bank-Grade Security', description: 'PCI-DSS Level 1 compliance and advanced fraud protection integration right out of the box.' },
];

const DEFAULT_FAQS: ServiceFaq[] = [
  { question: 'How long does a complete e-commerce build take?', answer: 'A standard custom Shopify build typically takes between 4 to 8 weeks depending on catalog complexity, custom section requirements, and external integrations.' },
  { question: 'Can you migrate our existing store from WooCommerce or Magento?', answer: 'Yes! We specialize in seamless zero-downtime data migrations including customer accounts, order history, catalog taxonomy, and 301 SEO redirects to preserve your rankings.' },
  { question: 'Which payment gateways do you configure?', answer: 'We configure Shopify Payments, Stripe, PayPal, Klarna, Afterpay, and regional gateways like Tamara and Tabby for the Gulf/Middle East markets.' },
  { question: 'What support is included after launch?', answer: 'Every build includes 30 to 90 days of dedicated hypercare where we monitor live transactions, fix any edge-case bugs, and provide 1-on-1 team training.' },
];

const DEFAULT_FORM: ServiceFormState = {
  title: '',
  slug: '',
  category: 'E-Commerce',
  iconName: 'ShoppingBag',
  tagline: '',
  shortDescription: '',
  detailedContent: '',
  displayOrder: 1,
  status: 'PUBLISHED',
  technologiesText: 'Shopify Plus, Liquid, Hydrogen, React, TypeScript',
  deliverables: [
    'Custom Shopify Theme Development',
    'Core Web Vitals Speed Optimization',
    'Seamless Third-Party App Integrations',
    'Post-Launch Hypercare & Support',
  ],
  process: [
    { step: '01', title: 'Strategy & Architecture', description: 'Catalog and UX blueprinting tailored for high conversion.' },
    { step: '02', title: 'Design & Prototyping', description: 'Bespoke mobile-first visual designs in Figma.' },
    { step: '03', title: 'Liquid Engineering', description: 'Modular OS 2.0 sections with zero app bloat.' },
    { step: '04', title: 'Launch & Hypercare', description: 'Rigorous QA and zero-downtime go-live support.' },
  ],
  pricing: DEFAULT_PRICING,
  benefits: DEFAULT_BENEFITS,
  faqs: DEFAULT_FAQS,
};

export default function ServicesAdminPage() {
  const [mounted, setMounted] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [services, setServices] = React.useState<ServiceRecord[]>([]);

  // Dialog State
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ServiceRecord | null>(null);
  const [form, setForm] = React.useState<ServiceFormState>(DEFAULT_FORM);
  const [activeTab, setActiveTab] = React.useState('basic');
  const [newDeliverable, setNewDeliverable] = React.useState('');
  const [newFeatureText, setNewFeatureText] = React.useState<Record<number, string>>({});

  // ── Load live services from NestJS API ──────────────────────────────────────
  const loadServices = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchApi<ServiceRecord[]>('/services');
      if (Array.isArray(data)) {
        setServices(
          data.map((s) => ({
            ...s,
            status: (s.status || 'PUBLISHED') as ItemStatus,
          }))
        );
      } else {
        setServices([]);
      }
    } catch {
      notify.error('Failed to load services from backend database.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setMounted(true);
    loadServices();
  }, [loadServices]);

  // ── Auto-slugify helper ─────────────────────────────────────────────────────
  function handleTitleChange(val: string) {
    if (!editingItem) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setForm((prev) => ({ ...prev, title: val, slug: generatedSlug }));
    } else {
      setForm((prev) => ({ ...prev, title: val }));
    }
  }

  // ── Open Create Dialog ──────────────────────────────────────────────────────
  function handleOpenAdd() {
    setEditingItem(null);
    setForm({
      ...DEFAULT_FORM,
      pricing: JSON.parse(JSON.stringify(DEFAULT_PRICING)),
      benefits: JSON.parse(JSON.stringify(DEFAULT_BENEFITS)),
      faqs: JSON.parse(JSON.stringify(DEFAULT_FAQS)),
      displayOrder: services.length + 1,
    });
    setActiveTab('basic');
    setNewDeliverable('');
    setNewFeatureText({});
    setDialogOpen(true);
  }

  // ── Open Edit Dialog ────────────────────────────────────────────────────────
  function handleOpenEdit(item: ServiceRecord) {
    setEditingItem(item);
    setForm({
      title: item.title,
      slug: item.slug,
      category: item.category || 'E-Commerce',
      iconName: item.iconName || 'ShoppingBag',
      tagline: item.tagline || '',
      shortDescription: item.shortDescription || '',
      detailedContent: item.detailedContent || '',
      displayOrder: item.displayOrder ?? 1,
      status: (item.status || 'PUBLISHED') as ItemStatus,
      technologiesText: (item.technologies || []).join(', '),
      deliverables:
        item.deliverables && item.deliverables.length > 0
          ? [...item.deliverables]
          : [...DEFAULT_FORM.deliverables],
      process:
        item.process && item.process.length > 0
          ? [...item.process]
          : [...DEFAULT_FORM.process],
      pricing:
        item.pricing && item.pricing.length > 0
          ? JSON.parse(JSON.stringify(item.pricing))
          : JSON.parse(JSON.stringify(DEFAULT_PRICING)),
      benefits:
        item.benefits && item.benefits.length > 0
          ? JSON.parse(JSON.stringify(item.benefits))
          : JSON.parse(JSON.stringify(DEFAULT_BENEFITS)),
      faqs:
        item.faqs && item.faqs.length > 0
          ? JSON.parse(JSON.stringify(item.faqs))
          : JSON.parse(JSON.stringify(DEFAULT_FAQS)),
    });
    setActiveTab('basic');
    setNewDeliverable('');
    setNewFeatureText({});
    setDialogOpen(true);
  }

  // ── Submit Save (Create / Update) ───────────────────────────────────────────
  async function handleSave() {
    if (!form.title.trim()) {
      notify.error('Service Name is required.');
      return;
    }
    if (!form.slug.trim()) {
      notify.error('URL Slug is required.');
      return;
    }

    setSaving(true);
    const techArray = form.technologiesText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      category: form.category.trim(),
      iconName: form.iconName || 'ShoppingBag',
      tagline: form.tagline.trim(),
      shortDescription: form.shortDescription.trim(),
      detailedContent: form.detailedContent.trim(),
      displayOrder: Number(form.displayOrder) || 1,
      status: form.status,
      technologies: techArray,
      deliverables: form.deliverables,
      process: form.process,
      pricing: form.pricing,
      benefits: form.benefits,
      faqs: form.faqs,
    };

    try {
      if (editingItem) {
        const updated = await fetchApi<ServiceRecord>(`/services/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setServices((prev) =>
          prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
        );
        notify.success(`Service "${updated.title}" updated successfully.`);
      } else {
        const created = await fetchApi<ServiceRecord>('/services', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setServices((prev) => [...prev, created]);
        notify.success(`Service "${created.title}" created successfully.`);
      }
      setDialogOpen(false);
    } catch {
      notify.error('Failed to save service. Please check your input and try again.');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    await fetchApi(`/services/${id}`, { method: 'DELETE' });
    setServices((prev) => prev.filter((s) => s.id !== id));
  }

  // ── Bulk Delete ─────────────────────────────────────────────────────────────
  async function handleBulkDelete(ids: string[]) {
    await fetchApi('/services/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
    setServices((prev) => prev.filter((s) => !ids.includes(s.id)));
  }

  // ── Bulk Status ─────────────────────────────────────────────────────────────
  async function handleBulkStatus(ids: string[], status: ItemStatus) {
    try {
      await fetchApi('/services/bulk-status', {
        method: 'PUT',
        body: JSON.stringify({ ids, status }),
      });
      setServices((prev) =>
        prev.map((s) => (ids.includes(s.id) ? { ...s, status } : s))
      );
      notify.success(`Updated ${ids.length} services to ${status}.`);
    } catch {
      notify.error('Failed to update status.');
    }
  }

  // ── Deliverable list modifiers ──────────────────────────────────────────────
  function addDeliverable() {
    if (!newDeliverable.trim()) return;
    setForm((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, newDeliverable.trim()],
    }));
    setNewDeliverable('');
  }

  function removeDeliverable(idx: number) {
    setForm((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== idx),
    }));
  }

  // ── Pricing Tiers modifiers ─────────────────────────────────────────────────
  function addPricingTier() {
    setForm((prev) => ({
      ...prev,
      pricing: [
        ...prev.pricing,
        {
          name: 'Custom Tier',
          description: 'Specialized package tailored for your exact architecture.',
          isPopular: false,
          prices: [
            { currency: 'USD', symbol: '$', amount: '14,999' },
            { currency: 'GBP', symbol: '£', amount: '11,999' },
            { currency: 'AED', symbol: 'AED ', amount: '55,000' },
          ],
          features: [
            'Dedicated Lead Architect',
            'Full Custom Code Ownership',
            'SLA Performance Monitoring',
          ],
        },
      ],
    }));
  }

  function removePricingTier(index: number) {
    setForm((prev) => ({
      ...prev,
      pricing: prev.pricing.filter((_, i) => i !== index),
    }));
  }

  function updatePricingTierField(index: number, field: keyof ServicePriceTier, value: any) {
    setForm((prev) => ({
      ...prev,
      pricing: prev.pricing.map((tier, i) => (i === index ? { ...tier, [field]: value } : tier)),
    }));
  }

  function updatePriceCurrency(tierIndex: number, currency: string, amount: string) {
    setForm((prev) => ({
      ...prev,
      pricing: prev.pricing.map((tier, i) => {
        if (i !== tierIndex) return tier;
        const prices = tier.prices || [];
        const existingIdx = prices.findIndex((p) => p.currency === currency);
        let nextPrices: ServicePriceCurrency[];
        const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : 'AED ';
        if (existingIdx >= 0) {
          nextPrices = prices.map((p, pIdx) => (pIdx === existingIdx ? { ...p, amount } : p));
        } else {
          nextPrices = [...prices, { currency, symbol, amount }];
        }
        return { ...tier, prices: nextPrices };
      }),
    }));
  }

  function addTierFeature(tierIndex: number) {
    const text = (newFeatureText[tierIndex] || '').trim();
    if (!text) return;
    setForm((prev) => ({
      ...prev,
      pricing: prev.pricing.map((tier, i) =>
        i === tierIndex ? { ...tier, features: [...(tier.features || []), text] } : tier
      ),
    }));
    setNewFeatureText((prev) => ({ ...prev, [tierIndex]: '' }));
  }

  function removeTierFeature(tierIndex: number, featureIndex: number) {
    setForm((prev) => ({
      ...prev,
      pricing: prev.pricing.map((tier, i) =>
        i === tierIndex
          ? { ...tier, features: tier.features.filter((_, fIdx) => fIdx !== featureIndex) }
          : tier
      ),
    }));
  }

  // ── Key Benefits modifiers ──────────────────────────────────────────────────
  function addBenefit() {
    setForm((prev) => ({
      ...prev,
      benefits: [
        ...prev.benefits,
        {
          title: 'High-Impact Commercial Lift',
          description: 'Measurable metric gains validated across live client store checkouts.',
        },
      ],
    }));
  }

  function removeBenefit(index: number) {
    setForm((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  }

  function updateBenefit(index: number, field: keyof ServiceBenefit, value: string) {
    setForm((prev) => ({
      ...prev,
      benefits: prev.benefits.map((b, i) => (i === index ? { ...b, [field]: value } : b)),
    }));
  }

  // ── FAQs modifiers ──────────────────────────────────────────────────────────
  function addFaq() {
    setForm((prev) => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        {
          question: 'What is the onboarding timeline for this service?',
          answer: 'We typically commence kickoff within 3 to 5 business days after proposal approval.',
        },
      ],
    }));
  }

  function removeFaq(index: number) {
    setForm((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  }

  function updateFaq(index: number, field: keyof ServiceFaq, value: string) {
    setForm((prev) => ({
      ...prev,
      faqs: prev.faqs.map((f, i) => (i === index ? { ...f, [field]: value } : f)),
    }));
  }

  // ── Columns for DataTable ───────────────────────────────────────────────────
  const columns: ColumnDef<ServiceRecord>[] = [
    {
      key: 'title',
      header: 'Service & Slug',
      sortable: true,
      render: (item) => {
        const IconComponent = ICON_MAP[item.iconName || 'ShoppingBag'] || ShoppingBag;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                <span>{item.title}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400 block">/services/{item.slug}</span>
            </div>
            <a
              href={`/services/${item.slug}`}
              target="_blank"
              rel="noreferrer"
              title="Open live service page"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        );
      },
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
          {item.category || 'Specialized'}
        </span>
      ),
    },
    {
      key: 'pricing',
      header: 'Pricing Tiers',
      render: (item) => {
        const count = item.pricing?.length || 0;
        const lowestUsd = item.pricing?.[0]?.prices?.find((p) => p.currency === 'USD')?.amount;
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>{count > 0 ? `${count} Tiers ${lowestUsd ? `($${lowestUsd})` : ''}` : '3 Default'}</span>
          </div>
        );
      },
    },
    {
      key: 'deliverables',
      header: 'Deliverables & FAQs',
      render: (item) => (
        <div className="flex flex-col text-[11px] text-slate-600 space-y-0.5">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            {item.deliverables?.length || 4} Deliverables
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <HelpCircle className="w-3 h-3 text-slate-400" />
            {item.faqs?.length || 4} FAQs · {item.benefits?.length || 6} Benefits
          </span>
        </div>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Last Modified',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-[11px] text-slate-500">
          {item.updatedAt ? formatDate(item.updatedAt) : '—'}
        </span>
      ),
    },
  ];

  if (!mounted || loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <>
      <DataTable<ServiceRecord>
        title="Services Studio"
        description="Comprehensive management of practice areas, multi-currency pricing packages, deliverables, execution playbooks, and FAQ accordions."
        data={services}
        columns={columns}
        searchKeys={['title', 'slug', 'category', 'tagline', 'shortDescription']}
        requiredPermission="content:write"
        addButtonLabel="Add Service"
        entityName="service"
        emptyStateTitle="No services found in database."
        emptyStateDescription="Add a new service offering to dynamically display it on the public website."
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onBulkStatusChange={handleBulkStatus}
      />

      {/* ── Rich Multi-Tab Dialog Editor ────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  {editingItem ? `Edit Service: ${editingItem.title}` : 'Add New Service'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Full control over pricing tiers, benefits, playbooks, and deliverables. Saves immediately to PostgreSQL.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-3 border-b border-slate-100 bg-white">
              <TabsList className="bg-slate-100/80 p-1 flex flex-wrap h-auto gap-1">
                <TabsTrigger value="basic" className="text-xs font-semibold">
                  1. General & Icon
                </TabsTrigger>
                <TabsTrigger value="content" className="text-xs font-semibold">
                  2. Messaging
                </TabsTrigger>
                <TabsTrigger value="deliverables" className="text-xs font-semibold">
                  3. Deliverables & Stack
                </TabsTrigger>
                <TabsTrigger value="playbook" className="text-xs font-semibold">
                  4. 4-Step Playbook
                </TabsTrigger>
                <TabsTrigger value="pricing" className="text-xs font-semibold text-emerald-700 data-[state=active]:text-emerald-900">
                  5. Pricing Packages
                </TabsTrigger>
                <TabsTrigger value="benefits" className="text-xs font-semibold">
                  6. Key Benefits
                </TabsTrigger>
                <TabsTrigger value="faqs" className="text-xs font-semibold">
                  7. FAQs
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* ── TAB 1: General & Icon ── */}
              <TabsContent value="basic" className="m-0 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Service Name *</label>
                    <Input
                      value={form.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. E-commerce Solutions"
                      className="text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">URL Slug *</label>
                    <div className="relative">
                      <Input
                        value={form.slug}
                        onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                        placeholder="e-commerce-solutions"
                        className="text-sm font-mono pl-24"
                      />
                      <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-400 select-none">
                        /services/
                      </span>
                    </div>
                  </div>
                </div>

                {/* Icon Selector Grid */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-semibold text-slate-700">Service Icon</label>
                  <p className="text-[11px] text-slate-500">
                    Used in navigation mega menu, services directory grid, and hero banners.
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {ICON_OPTIONS.map((opt) => {
                      const IconComp = opt.icon;
                      const isSelected = form.iconName === opt.name;
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, iconName: opt.name }))}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs ring-1 ring-indigo-600'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <IconComp className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                          <span className="text-xs font-medium truncate">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-slate-700">Practice Category</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {CATEGORY_PRESETS.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, category: cat }))}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                          form.category === cat
                            ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="Or enter custom category..."
                    className="text-sm"
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5 max-w-xs">
                    <label className="text-xs font-semibold text-slate-700">Display Order</label>
                    <Input
                      type="number"
                      value={form.displayOrder}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, displayOrder: parseInt(e.target.value, 10) || 1 }))
                      }
                      className="text-sm"
                    />
                  </div>

                  {/* Publication Status: Draft vs Public */}
                  <StatusToggleField
                    value={form.status}
                    onChange={(status) => setForm((prev) => ({ ...prev, status }))}
                  />
                </div>
              </TabsContent>

              {/* ── TAB 2: Messaging & Narrative ── */}
              <TabsContent value="content" className="m-0 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Service Tagline / Punchline</label>
                  <Input
                    value={form.tagline}
                    onChange={(e) => setForm((prev) => ({ ...prev, tagline: e.target.value }))}
                    placeholder="e.g. Complete Shopify & Shopify Plus stores designed to sell — not just look pretty."
                    className="text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Short Summary / Strategic Overview</label>
                  <Textarea
                    rows={3}
                    value={form.shortDescription}
                    onChange={(e) => setForm((prev) => ({ ...prev, shortDescription: e.target.value }))}
                    placeholder="Concise 2-sentence summary shown on cards and hero descriptions..."
                    className="text-sm leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Deep Technical Implementation Narrative
                  </label>
                  <Textarea
                    rows={5}
                    value={form.detailedContent}
                    onChange={(e) => setForm((prev) => ({ ...prev, detailedContent: e.target.value }))}
                    placeholder="Detailed explanation of our architectural approach, code hygiene, Liquid optimizations, and headless capabilities..."
                    className="text-sm leading-relaxed"
                  />
                </div>
              </TabsContent>

              {/* ── TAB 3: Deliverables & Stack ── */}
              <TabsContent value="deliverables" className="m-0 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Core Technologies & Tooling</label>
                  <Input
                    value={form.technologiesText}
                    onChange={(e) => setForm((prev) => ({ ...prev, technologiesText: e.target.value }))}
                    placeholder="Shopify Plus, Liquid, Hydrogen, React, TypeScript, GraphQL"
                    className="text-sm font-mono"
                  />
                  <p className="text-[11px] text-slate-400">
                    Comma-separated tools displayed as badges on the service inner page.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">Guaranteed Deliverables</label>
                    <span className="text-[11px] text-slate-400">{form.deliverables.length} items</span>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={newDeliverable}
                      onChange={(e) => setNewDeliverable(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addDeliverable();
                        }
                      }}
                      placeholder="Add a new deliverable (e.g. Sub-Second Speed Guarantee)..."
                      className="text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addDeliverable}
                      className="shrink-0"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {form.deliverables.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-800 group"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{item}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDeliverable(idx)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                          title="Remove item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* ── TAB 4: 4-Step Playbook ── */}
              <TabsContent value="playbook" className="m-0 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    The 4 execution phases showcased on the service page Playbook section.
                  </p>
                </div>

                <div className="space-y-3">
                  {form.process.map((step, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-indigo-600/10 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {step.step || `0${idx + 1}`}
                        </span>
                        <Input
                          value={step.title}
                          onChange={(e) => {
                            const newTitle = e.target.value;
                            setForm((prev) => ({
                              ...prev,
                              process: prev.process.map((p, i) => (i === idx ? { ...p, title: newTitle } : p)),
                            }));
                          }}
                          placeholder="Phase Title"
                          className="text-xs font-semibold bg-white"
                        />
                      </div>
                      <Textarea
                        rows={2}
                        value={step.description}
                        onChange={(e) => {
                          const newDesc = e.target.value;
                          setForm((prev) => ({
                            ...prev,
                            process: prev.process.map((p, i) => (i === idx ? { ...p, description: newDesc } : p)),
                          }));
                        }}
                        placeholder="Phase execution details..."
                        className="text-xs bg-white leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* ── TAB 5: Pricing Packages ── */}
              <TabsContent value="pricing" className="m-0 space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span>Interactive Pricing Packages & Multi-Currency SLA</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configures the 3-column pricing tier cards with dynamic USD ($), GBP (£), and AED (AED) switcher.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPricingTier}
                    className="text-xs font-semibold border-emerald-300 text-emerald-700 hover:bg-emerald-50 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Tier
                  </Button>
                </div>

                <div className="space-y-5">
                  {form.pricing.map((tier, tierIdx) => {
                    const usdPrice = tier.prices?.find((p) => p.currency === 'USD')?.amount || '';
                    const gbpPrice = tier.prices?.find((p) => p.currency === 'GBP')?.amount || '';
                    const aedPrice = tier.prices?.find((p) => p.currency === 'AED')?.amount || '';

                    return (
                      <div
                        key={tierIdx}
                        className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5 space-y-4 relative group"
                      >
                        {/* Header: Tier Name, Popular Switch, Delete */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                          <div className="flex-1 space-y-1">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                              Package Tier #{tierIdx + 1} Name
                            </label>
                            <Input
                              value={tier.name}
                              onChange={(e) => updatePricingTierField(tierIdx, 'name', e.target.value)}
                              placeholder="e.g. Starter Store, Growth Store, Enterprise"
                              className="text-sm font-bold bg-white"
                            />
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                              <span className="text-xs font-semibold text-slate-700">Most Popular Badge</span>
                              <Switch
                                checked={Boolean(tier.isPopular)}
                                onCheckedChange={(checked) => updatePricingTierField(tierIdx, 'isPopular', checked)}
                              />
                            </div>
                            {form.pricing.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removePricingTier(tierIdx)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Remove pricing tier"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Description / Subtitle */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600">Target Audience Description</label>
                          <Input
                            value={tier.description}
                            onChange={(e) => updatePricingTierField(tierIdx, 'description', e.target.value)}
                            placeholder="e.g. For scaling brands doing $500K-$2M seeking custom UI/UX and higher AOV."
                            className="text-xs bg-white"
                          />
                        </div>

                        {/* Multi-Currency Price Grid */}
                        <div className="space-y-1.5 pt-1">
                          <label className="text-[11px] font-semibold text-slate-700 block">
                            Multi-Currency Pricing Amounts
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-slate-500">USD ($) Amount</span>
                              <div className="relative">
                                <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">$</span>
                                <Input
                                  value={usdPrice}
                                  onChange={(e) => updatePriceCurrency(tierIdx, 'USD', e.target.value)}
                                  placeholder="9,999"
                                  className="text-xs font-mono font-semibold pl-6 bg-white"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-slate-500">GBP (£) Amount</span>
                              <div className="relative">
                                <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">£</span>
                                <Input
                                  value={gbpPrice}
                                  onChange={(e) => updatePriceCurrency(tierIdx, 'GBP', e.target.value)}
                                  placeholder="7,999"
                                  className="text-xs font-mono font-semibold pl-6 bg-white"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-slate-500">AED (AED) Amount</span>
                              <div className="relative">
                                <span className="absolute left-2.5 top-2 text-[10px] font-bold text-slate-400">AED</span>
                                <Input
                                  value={aedPrice}
                                  onChange={(e) => updatePriceCurrency(tierIdx, 'AED', e.target.value)}
                                  placeholder="36,500"
                                  className="text-xs font-mono font-semibold pl-10 bg-white"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Included Features Checklist */}
                        <div className="space-y-2 pt-2 border-t border-slate-200/80">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-700">
                              Included Deliverables & Features ({tier.features?.length || 0})
                            </label>
                          </div>

                          <div className="flex gap-2">
                            <Input
                              value={newFeatureText[tierIdx] || ''}
                              onChange={(e) =>
                                setNewFeatureText((prev) => ({ ...prev, [tierIdx]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addTierFeature(tierIdx);
                                }
                              }}
                              placeholder="e.g. 100% Bespoke UI/UX Design in Figma..."
                              className="text-xs bg-white"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addTierFeature(tierIdx)}
                              className="text-xs shrink-0"
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" /> Add Feature
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                            {(tier.features || []).map((feat, fIdx) => (
                              <div
                                key={fIdx}
                                className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
                              >
                                <div className="flex items-center gap-1.5 truncate pr-2">
                                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span className="truncate">{feat}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeTierFeature(tierIdx, fIdx)}
                                  className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition-colors shrink-0"
                                  title="Remove feature"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* ── TAB 6: Key Benefits ── */}
              <TabsContent value="benefits" className="m-0 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#d9287c]" />
                      <span>Key Benefits Grid (Commercial & Technical Impact)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Displayed as high-converting cards in the &quot;Key Benefits for Your Bottom Line&quot; section.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addBenefit}
                    className="text-xs font-semibold border-pink-300 text-pink-700 hover:bg-pink-50 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Benefit
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {form.benefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-400">Card #{idx + 1}</span>
                        {form.benefits.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBenefit(idx)}
                            className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                            title="Remove benefit card"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <Input
                        value={benefit.title}
                        onChange={(e) => updateBenefit(idx, 'title', e.target.value)}
                        placeholder="Benefit Headline (e.g. Sub-Second Load Times)"
                        className="text-xs font-bold bg-white"
                      />
                      <Textarea
                        rows={2}
                        value={benefit.description}
                        onChange={(e) => updateBenefit(idx, 'description', e.target.value)}
                        placeholder="Explain concrete impact for merchant bottom line..."
                        className="text-xs bg-white leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* ── TAB 7: FAQs Accordion ── */}
              <TabsContent value="faqs" className="m-0 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-indigo-600" />
                      <span>Frequently Asked Questions (FAQ Accordion)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Displayed as interactive collapsible FAQ accordions on the service detail page.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFaq}
                    className="text-xs font-semibold border-indigo-300 text-indigo-700 hover:bg-indigo-50 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add FAQ
                  </Button>
                </div>

                <div className="space-y-3">
                  {form.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 relative group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-400">Question #{idx + 1}</span>
                        {form.faqs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFaq(idx)}
                            className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                            title="Remove FAQ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <Input
                        value={faq.question}
                        onChange={(e) => updateFaq(idx, 'question', e.target.value)}
                        placeholder="e.g. Can you migrate our existing store from WooCommerce or Magento?"
                        className="text-xs font-semibold bg-white"
                      />
                      <Textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
                        placeholder="Provide clear, confident technical answer..."
                        className="text-xs bg-white leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                {editingItem ? 'Save Changes' : 'Create Service'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
