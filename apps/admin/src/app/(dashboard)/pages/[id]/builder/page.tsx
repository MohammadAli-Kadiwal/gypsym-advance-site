'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, MoveUp, MoveDown, Trash2,
  Monitor, Tablet, Smartphone, Play, Video,
  Plus, Save,
  Upload, Link2, Loader2, Settings2, Layers, Type,
  MousePointerClick, Users, ShieldCheck, BarChart3,
  Sparkles,
} from 'lucide-react';
import { Image as LucideImage } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useCmsCollection } from '@/lib/store';
import { fetchApi } from '@/lib/api-client';
import { notify } from '@/lib/notifications';

interface PageSection {
  id: string;
  sectionIdentifier: string;
  componentType: string;
  displayOrder: number;
  contentPayload: any;
  isActive: boolean;
}

// ─── Image Upload Field ───────────────────────────────────────────────────────
function ImageUploadField({ value, onChange, placeholder = 'https://...', label }: {
  value: string; onChange: (url: string) => void; placeholder?: string; label?: string;
}) {
  const [mode, setMode] = React.useState<'url' | 'upload'>('url');
  const [busy, setBusy] = React.useState(false);
  const ref = React.useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    const r = new FileReader();
    r.onload = ev => { onChange(ev.target?.result as string); setBusy(false); };
    r.onerror = () => setBusy(false);
    r.readAsDataURL(f);
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-[11px] font-semibold text-white/55">{label}</p>}
      <div className="flex rounded-lg overflow-hidden border border-white/10 w-fit text-[11px]">
        {(['url', 'upload'] as const).map(m => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-medium transition-colors ${
              mode === m ? 'bg-[#9ae625] text-neutral-950' : 'bg-white/5 text-white/45 hover:bg-white/10 hover:text-white/70'
            }`}>
            {m === 'url' ? <Link2 className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
            {m === 'url' ? 'URL' : 'Upload'}
          </button>
        ))}
      </div>
      {mode === 'url' ? (
        <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="h-9 font-mono text-xs bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:border-[#9ae625]/50" />
      ) : (
        <div onClick={() => ref.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 bg-white/3 hover:border-[#9ae625]/35 hover:bg-white/5 transition-all cursor-pointer p-4 min-h-[76px]">
          {busy ? <Loader2 className="h-5 w-5 text-[#9ae625] animate-spin" /> :
           value?.startsWith('data:') ? <img src={value} alt="preview" className="h-10 w-auto object-contain rounded" /> :
           <><Upload className="h-4 w-4 text-white/20" /><span className="text-[10px] text-white/30">Click to upload</span></>}
          <input ref={ref} type="file" accept="image/*,image/svg+xml" onChange={handleFile} className="hidden" />
        </div>
      )}
      {value && !value.startsWith('data:') && value.startsWith('http') && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/4 border border-white/8">
          <img src={value} alt="" className="h-6 w-auto object-contain rounded shrink-0"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span className="text-[10px] text-white/25 font-mono truncate">{value.slice(0, 42)}…</span>
        </div>
      )}
    </div>
  );
}

// ─── Collapsible Inspector Card ───────────────────────────────────────────────
function Card({ title, Icon, children, open: defaultOpen = true }: {
  title: string; Icon?: React.ElementType; children: React.ReactNode; open?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="rounded-xl border border-white/8 bg-[#13161f] overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/4 transition-colors">
        <span className="flex items-center gap-2 text-xs font-semibold text-white/75">
          {Icon && <Icon className="h-3.5 w-3.5 text-[#9ae625]" />}
          {title}
        </span>
        <span className={`text-[10px] text-white/20 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">{children}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><p className="text-[11px] font-medium text-white/40">{label}</p>{children}</div>;
}

// ─── Animation & Motion Card ──────────────────────────────────────────────────
function AnimationCard({
  value,
  onChange,
}: {
  value?: {
    enabled?: boolean;
    direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';
    intensity?: 'subtle' | 'normal' | 'expressive';
    stagger?: 'none' | 'fast' | 'normal' | 'slow';
    repeat?: boolean;
  };
  onChange: (anim: any) => void;
}) {
  const anim = value || {};
  const enabled = anim.enabled !== false;
  const direction = anim.direction || 'up';
  const intensity = anim.intensity || 'normal';
  const stagger = anim.stagger || 'normal';
  const repeat = !!anim.repeat;

  const [previewKey, setPreviewKey] = React.useState(0);
  const triggerPreview = () => setPreviewKey((k) => k + 1);

  return (
    <Card title="Animation & Motion" Icon={Sparkles as any} open={false}>
      <style>{`
        @keyframes motionPreview-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes motionPreview-down { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes motionPreview-left { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes motionPreview-right { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes motionPreview-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes motionPreview-scale { from { opacity: 0; transform: scale(0.88); } to { opacity: 1; transform: scale(1); } }
      `}</style>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/70 font-medium">Enable Motion</span>
          <Switch
            checked={enabled}
            onCheckedChange={(v) => onChange({ ...anim, enabled: v })}
          />
        </div>

        {enabled && (
          <>
            <Field label="Direction">
              <div className="grid grid-cols-3 gap-1.5">
                {(['up', 'down', 'left', 'right', 'fade', 'scale'] as const).map((dir) => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => {
                      onChange({ ...anim, direction: dir });
                      triggerPreview();
                    }}
                    className={`py-1 text-[10px] font-mono rounded capitalize transition-all border ${
                      direction === dir
                        ? 'bg-[#9ae625] text-neutral-950 font-bold border-[#9ae625]'
                        : 'bg-white/5 text-white/50 border-white/8 hover:bg-white/10'
                    }`}
                  >
                    {dir}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Intensity">
              <div className="grid grid-cols-3 gap-1.5">
                {(['subtle', 'normal', 'expressive'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      onChange({ ...anim, intensity: lvl });
                      triggerPreview();
                    }}
                    className={`py-1 text-[10px] font-mono rounded capitalize transition-all border ${
                      intensity === lvl
                        ? 'bg-[#9ae625] text-neutral-950 font-bold border-[#9ae625]'
                        : 'bg-white/5 text-white/50 border-white/8 hover:bg-white/10'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Stagger">
              <div className="grid grid-cols-4 gap-1">
                {(['none', 'fast', 'normal', 'slow'] as const).map((stg) => (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => {
                      onChange({ ...anim, stagger: stg });
                      triggerPreview();
                    }}
                    className={`py-1 text-[10px] font-mono rounded capitalize transition-all border ${
                      stagger === stg
                        ? 'bg-[#9ae625] text-neutral-950 font-bold border-[#9ae625]'
                        : 'bg-white/5 text-white/50 border-white/8 hover:bg-white/10'
                    }`}
                  >
                    {stg}
                  </button>
                ))}
              </div>
            </Field>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs text-white/60 block">Repeat On Scroll</span>
                <span className="text-[10px] text-white/30 block">Bidirectional reveal</span>
              </div>
              <Switch
                checked={repeat}
                onCheckedChange={(v) => onChange({ ...anim, repeat: v })}
              />
            </div>

            {/* Live Interactive Preview Box */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[10px] text-white/40 mb-1.5">
                <span>Live Motion Preview</span>
                <button
                  type="button"
                  onClick={triggerPreview}
                  className="text-[#9ae625] hover:underline"
                >
                  Replay ↺
                </button>
              </div>
              <div className="h-16 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden p-2">
                <div
                  key={previewKey}
                  style={{
                    animation: `motionPreview-${direction} 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                  }}
                  className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs text-white font-mono flex items-center gap-1.5 shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9ae625]" />
                  <span>{direction.toUpperCase()} · {intensity}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

// ─── Main Page Builder ────────────────────────────────────────────────────────
export default function PageBuilderView() {
  const params = useParams();
  const pageId = params.id as string;
  const toast = React.useCallback((type: 'success' | 'error' | 'info', message: string) => {
    if (type === 'success') notify.success(message);
    else if (type === 'error') notify.error(message);
    else notify.info(message);
  }, []);
  const { data: pages } = useCmsCollection<any>('pages');
  const page = pages.find((p: any) => p.id === pageId) || { id: pageId, title: 'Homepage', slug: 'home' };

  const [viewport, setViewport] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [saving, setSaving] = React.useState(false);
  const [sections, setSections] = React.useState<PageSection[]>([]);
  const [activeId, setActiveId] = React.useState('');

  React.useEffect(() => {
    (async () => {
      try {
        const slug = page.slug === '/' || page.slug === 'home' ? 'home' : page.slug.replace(/^\//, '');
        const d = await fetchApi<any>(`/pages/${slug}`);
        if (d?.sections?.length) { setSections(d.sections); setActiveId(d.sections[0].id); }
      } catch (e: any) { toast('error', `Load failed: ${e.message}`); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.slug]);

  const active = sections.find(s => s.id === activeId) || sections[0];
  const raw = active?.contentPayload || {};

  // Derived normalized values
  const segs = React.useMemo(() => {
    if (raw.headline?.segments?.length) return raw.headline.segments.map((s: any) => ({ text: s.value || s.text || '', italic: s.type === 'italic' || !!s.italic, highlight: s.type === 'highlight' || !!s.highlight }));
    return [{ text: 'Shopify Agency', italic: false, highlight: false }];
  }, [raw]);

  const desc       = typeof raw.description === 'string' ? raw.description : raw.description?.content || '';
  const ctaLabel   = raw.primaryCta?.label || 'Scale Your Store';
  const ctaHref    = raw.primaryCta?.url || raw.primaryCta?.href || '/contact';
  const videoOn    = raw.videoCta?.enabled ?? true;
  const videoLabel = raw.videoCta?.label || 'Watch Showreel';
  const videoUrl   = raw.videoCta?.videoUrl || '';
  const bgUrl      = raw.backgroundMedia?.url || raw.bg?.desktopImageUrl || '';
  const bgOpacity  = raw.backgroundMedia?.overlayOpacity ?? raw.bg?.overlayOpacity ?? 0.35;
  const stripOn    = raw.clientStrip?.enabled ?? true;
  const stripTitle = raw.clientStrip?.title || 'The agency behind ..';
  const logos: Array<{ name: string; logo?: string; logoUrl?: string }> = React.useMemo(() => raw.clientStrip?.clients || [], [raw]);

  // Patch helper — merges updates into active section payload
  const patch = (u: any) => {
    if (!active) return;
    setSections(p => p.map(s => s.id === active.id ? { ...s, contentPayload: { ...s.contentPayload, ...u } } : s));
  };

  const patchSegs = (ns: typeof segs) =>
    patch({ headline: { ...raw.headline, segments: ns.map((s: any) => ({ type: s.italic ? 'italic' : s.highlight ? 'highlight' : 'text', value: s.text })) } });

  // Save all sections to DB
  const save = async () => {
    setSaving(true);
    try {
      for (const sec of sections)
        await fetchApi(`/sections/${sec.id}`, { method: 'PUT', body: JSON.stringify({ contentPayload: sec.contentPayload, displayOrder: sec.displayOrder, isActive: sec.isActive }) });
      toast('success', 'All changes saved & published successfully!');
    } catch (e: any) {
      toast('error', e.message || 'Save failed. Please try again.');
    } finally { setSaving(false); }
  };

  // Move section up / down
  const move = (i: number, dir: 'up' | 'down') => {
    const ti = dir === 'up' ? i - 1 : i + 1;
    if (ti < 0 || ti >= sections.length) return;
    const n = [...sections];
    [n[i], n[ti]] = [{ ...n[ti]!, displayOrder: i }, { ...n[i]!, displayOrder: ti }];
    setSections(n as PageSection[]);
  };

  // Logo helpers
  const updateLogo = (i: number, u: Partial<{ name: string; logoUrl: string }>) =>
    patch({ clientStrip: { ...raw.clientStrip, clients: logos.map((l, j) => j === i ? { ...l, ...u } : l) } });
  const addLogo = () =>
    patch({ clientStrip: { ...raw.clientStrip, clients: [...logos, { name: 'New Client', logo: 'new', logoUrl: '' }] } });
  const removeLogo = (i: number) =>
    patch({ clientStrip: { ...raw.clientStrip, clients: logos.filter((_, j) => j !== i) } });

  // ── METRICS_BANNER Helpers ──
  const mPayload = active?.componentType === 'METRICS_BANNER' ? raw : {};
  const mEyebrow = mPayload.eyebrow || { enabled: true, text: 'TELEMETRY & VERIFIED PERFORMANCE' };
  const mSegs = React.useMemo(() => {
    if (mPayload.headline?.segments?.length) {
      return mPayload.headline.segments.map((s: any) => ({
        text: s.value || s.text || '',
        italic: s.type === 'italic' || !!s.italic,
        highlight: s.type === 'highlight' || !!s.highlight,
        accent: s.type === 'accent' || !!s.accent,
      }));
    }
    return [
      { text: 'Real impact, ', italic: false, highlight: false, accent: false },
      { text: 'empirically ', italic: false, highlight: true, accent: false },
      { text: 'verified', italic: true, highlight: false, accent: false },
      { text: ' across planetary scales.', italic: false, highlight: false, accent: false },
    ];
  }, [mPayload]);
  const mDesc = typeof mPayload.description === 'string' ? mPayload.description : mPayload.description?.content || '';
  const mSupport = typeof mPayload.supportingText === 'string' ? mPayload.supportingText : mPayload.supportingText?.content || '';
  const mTrust = mPayload.verificationStatement?.text || 'ALL TELEMETRY CRYPTOGRAPHICALLY ATTESTED & THIRD-PARTY VERIFIED';
  const mCards: any[] = React.useMemo(() => mPayload.cards || [], [mPayload]);

  const patchMSegs = (ns: typeof mSegs) =>
    patch({
      headline: {
        ...mPayload.headline,
        segments: ns.map((s: any) => ({
          type: s.italic ? 'italic' : s.highlight ? 'highlight' : s.accent ? 'accent' : 'text',
          value: s.text,
        })),
      },
    });

  const updateCard = (cardId: string, u: any) => {
    const updated = (mPayload.cards || []).map((c: any) => c.id === cardId ? { ...c, ...u } : c);
    patch({ cards: updated });
  };

  const addCard = () => {
    const newCard = {
      id: `card-${Date.now()}`,
      title: 'Carrier-Grade Telemetry Metric',
      category: 'ENTERPRISE DOMAIN',
      region: 'Global Tier-1',
      verification: {
        enabled: true,
        label: 'THIRD-PARTY AUDITED',
        source: 'Global Enterprise Audit',
      },
      metric: {
        value: 100,
        displayValue: '99.99%',
        description: 'Empirically audited metric description cleared across production clusters.',
      },
      period: {
        label: 'Continuous 24/7 SLA',
      },
      chart: {
        enabled: true,
        chartType: 'bars',
        dataPoints: [40, 55, 65, 80, 90, 100],
        tone: 'primary',
      },
      appearance: {
        variant: 'default',
      },
      order: (mPayload.cards?.length || 0) + 1,
      isActive: true,
      isFeatured: false,
    };
    patch({ cards: [...(mPayload.cards || []), newCard] });
  };

  const removeCard = (cardId: string) => {
    patch({ cards: (mPayload.cards || []).filter((c: any) => c.id !== cardId) });
  };

  return (
    <>
      <div className="-m-6 md:-m-8 flex flex-col bg-[#0b0d12] overflow-hidden" style={{ height: 'calc(100vh - 3.5rem)' }}>

        {/* ── TOP BAR ── */}
        <header className="flex h-[54px] shrink-0 items-center justify-between border-b border-white/6 bg-[#0f1117] px-5">
          <div className="flex items-center gap-4">
            <Link href="/pages" className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors font-medium">
              <ArrowLeft className="h-3.5 w-3.5" /> Exit Builder
            </Link>
            <div className="h-4 w-px bg-white/8" />
            <span className="font-bold text-sm text-white">{page.title}</span>
            <span className="font-mono text-[11px] text-white/25 bg-white/5 px-1.5 py-0.5 rounded-md">{page.slug}</span>
          </div>

          {/* Viewport */}
          <div className="flex items-center gap-0.5 rounded-xl border border-white/8 bg-white/4 p-1">
            {([['desktop', Monitor, 'Desktop'], ['tablet', Tablet, 'Tablet (768px)'], ['mobile', Smartphone, 'Mobile (390px)']] as const).map(([id, Icon, title]) => (
              <button key={id} title={title} onClick={() => setViewport(id)}
                className={`p-2 rounded-lg transition-all ${viewport === id ? 'bg-[#9ae625] text-neutral-950 shadow-sm' : 'text-white/30 hover:text-white/65'}`}>
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>

          {/* Save */}
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 h-9 px-5 rounded-full bg-[#9ae625] hover:bg-[#b0f535] text-neutral-950 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#9ae625]/15">
            {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving…</> : <><Save className="h-3.5 w-3.5" />Save & Publish</>}
          </button>
        </header>

        {/* ── 3-PANE ── */}
        <div className="flex flex-1 min-h-0">

          {/* LEFT: Sections tree */}
          <aside className="w-52 shrink-0 border-r border-white/6 bg-[#0f1117] flex flex-col">
            <div className="px-4 py-3 border-b border-white/6 flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-[#9ae625] shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#9ae625]/55">Sections</span>
              <span className="ml-auto text-[10px] text-white/20 font-mono">{sections.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {sections.map((sec, idx) => {
                const sel = sec.id === active?.id;
                return (
                  <div key={sec.id} onClick={() => setActiveId(sec.id)}
                    className={`group flex items-center justify-between rounded-lg px-2.5 py-2 cursor-pointer border text-xs transition-all ${
                      sel ? 'border-[#9ae625]/25 bg-[#9ae625]/6 text-white font-semibold' : 'border-transparent hover:border-white/6 hover:bg-white/4 text-white/40 hover:text-white/70'
                    }`}>
                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                      <span className="font-mono text-[9px] text-white/18 shrink-0">{idx + 1}.</span>
                      <span className="truncate">{sec.sectionIdentifier || sec.componentType}</span>
                    </div>
                    <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); move(idx, 'up'); }} className="p-0.5 hover:text-[#9ae625] text-white/15 transition-colors"><MoveUp className="h-3 w-3" /></button>
                      <button onClick={e => { e.stopPropagation(); move(idx, 'down'); }} className="p-0.5 hover:text-[#9ae625] text-white/15 transition-colors"><MoveDown className="h-3 w-3" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* CENTER: Canvas */}
          <main className="flex-1 overflow-y-auto bg-[#0b0d12] p-6 flex flex-col items-center">
            <div className={`transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border border-white/6 ${
              viewport === 'desktop' ? 'w-full max-w-5xl' : viewport === 'tablet' ? 'w-[768px]' : 'w-[390px]'
            }`} style={{ background: '#f4f3ef', minHeight: 560 }}>
              {sections.filter(s => s.isActive).map(sec => {
                const sel = sec.id === active?.id;
                if (sec.componentType === 'HERO') return (
                  <div key={sec.id} onClick={() => setActiveId(sec.id)}
                    className={`relative cursor-pointer overflow-hidden transition-all ${sel ? 'ring-2 ring-[#9ae625] ring-inset' : ''}`}
                    style={{ background: '#111', minHeight: 480, display: 'flex', flexDirection: 'column' }}>
                    {bgUrl && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgUrl})` }} />}
                    <div className="absolute inset-0 bg-black" style={{ opacity: bgOpacity }} />
                    {sel && <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 rounded-full bg-[#9ae625] px-3 py-1 text-[10px] font-bold text-neutral-950"><Settings2 className="h-3 w-3" />EDITING HERO</div>}
                    <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-8 py-16 gap-5">
                      <h1 className="text-3xl font-bold text-white leading-tight max-w-2xl">
                        {segs.map((s: any, i: number) => <span key={i} className={`mr-1 ${s.italic ? 'font-serif italic font-normal text-white/75' : s.highlight ? 'text-[#9ae625]' : 'text-white'}`}>{s.text}</span>)}
                      </h1>
                      {desc && <p className="text-sm text-white/50 max-w-lg leading-relaxed">{desc}</p>}
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        {ctaLabel && <span className="rounded-full bg-white text-neutral-900 px-5 py-2 text-sm font-semibold shadow">{ctaLabel}</span>}
                        {videoOn && <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/8 text-white px-4 py-2 text-sm"><Play className="h-3.5 w-3.5 fill-current" />{videoLabel}</span>}
                      </div>
                    </div>
                    {stripOn && logos.length > 0 && (
                      <div className="relative z-10 bg-white border-t border-black/10 px-6 py-3 flex items-center gap-3 overflow-hidden">
                        <span className="text-[11px] text-neutral-400 whitespace-nowrap shrink-0">{stripTitle}</span>
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                          {logos.slice(0, 5).map((l, i) => l.logoUrl ? <img key={i} src={l.logoUrl} alt={l.name} className="h-8 w-auto object-contain shrink-0" /> : <span key={i} className="text-[11px] font-semibold text-neutral-500 whitespace-nowrap shrink-0">{l.name}</span>)}
                          {logos.length > 5 && <span className="text-[11px] text-neutral-400 shrink-0">+{logos.length - 5} more</span>}
                        </div>
                      </div>
                    )}
                  </div>
                );

                if (sec.componentType === 'METRICS_BANNER') {
                  const p = sec.contentPayload || {};
                  const cEyebrow = p.eyebrow;
                  const cHeadline = p.headline;
                  const cDesc = typeof p.description === 'string' ? p.description : p.description?.content;
                  const cSupport = typeof p.supportingText === 'string' ? p.supportingText : p.supportingText?.content;
                  const cCards = (p.cards || []).filter((c: any) => c.isActive !== false);

                  const THEME_BGS: Record<string, { bg: string; bar: string }> = {
                    pink: { bg: '#fae8f4', bar: '#8c7486' },
                    blue: { bg: '#eaf0ff', bar: '#7284a6' },
                    yellow: { bg: '#fef2d8', bar: '#9c9173' },
                    peach: { bg: '#fae8de', bar: '#9a786f' },
                  };
                  const DEFAULT_KEYS = ['pink', 'blue', 'yellow', 'peach'];

                  return (
                    <div key={sec.id} onClick={() => setActiveId(sec.id)}
                      className={`relative cursor-pointer transition-all p-6 sm:p-10 ${sel ? 'ring-2 ring-[#9ae625] ring-inset' : 'hover:bg-[#eeede9]'}`}
                      style={{ background: '#F4F3EF' }}>
                      {sel && (
                        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 rounded-full bg-[#9ae625] px-3 py-1 text-[10px] font-bold text-neutral-950 shadow-sm">
                          <Settings2 className="h-3 w-3" />EDITING VERIFIED RESULTS
                        </div>
                      )}

                      {/* Header Preview */}
                      <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-8">
                        {cEyebrow?.enabled && cEyebrow.text && (
                          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-[#d9287c] uppercase">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d9287c]" />
                            <span>{cEyebrow.text}</span>
                          </div>
                        )}
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 leading-tight whitespace-pre-line">
                          {cHeadline?.segments?.length ? (
                            cHeadline.segments.map((seg: any, idx: number) => {
                              if (seg.type === 'italic') return <span key={idx} className="font-serif italic font-normal mr-1">{seg.value}</span>;
                              return <span key={idx} className="mr-1">{seg.value}</span>;
                            })
                          ) : (
                            <span>{cHeadline?.text || "We don't show mockups.\nWe show dashboards."}</span>
                          )}
                        </h2>
                        {cDesc && <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed max-w-xl mx-auto">{cDesc}</p>}
                        {cSupport && <p className="text-[11px] text-neutral-500 max-w-lg mx-auto">{cSupport}</p>}
                      </div>

                      {/* Cards Preview Grid */}
                      <div className={`grid gap-4 ${
                        viewport === 'desktop' ? 'grid-cols-4' : viewport === 'tablet' ? 'grid-cols-2' : 'grid-cols-1'
                      }`}>
                        {cCards.map((card: any, idx: number) => {
                          const fallbackKey = DEFAULT_KEYS[idx % DEFAULT_KEYS.length] || 'pink';
                          const themeObj = THEME_BGS[card.appearance?.accentToken || ''] || THEME_BGS[fallbackKey] || THEME_BGS.pink || { bg: '#fae8f4', bar: '#8c7486' };
                          const cardBg = card.appearance?.cardBg || themeObj?.bg || '#fae8f4';
                          const barColor = card.appearance?.barColor || themeObj?.bar || '#8c7486';
                          const disp = card.metric?.displayValue || `${card.metric?.prefix || ''}${card.metric?.value || 0}${card.metric?.suffix || ''}`;
                          const pts = card.chart?.dataPoints?.length ? card.chart.dataPoints : [22, 34, 46, 60, 80, 100];
                          const maxPt = Math.max(...pts, 1);

                          return (
                            <div key={card.id || idx} className="rounded-[24px] p-5 border border-black/[0.04] shadow-sm flex flex-col justify-between"
                              style={{ backgroundColor: cardBg }}>
                              <div>
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[11px] font-medium text-neutral-600 truncate">
                                    {card.category}{card.region ? ` · ${card.region}` : ''}
                                  </span>
                                  {card.verification?.enabled && (
                                    <span className="shrink-0 bg-white text-[#d9287c] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm border border-pink-100">
                                      {card.verification.label || 'VERIFIED ✓'}
                                    </span>
                                  )}
                                </div>

                                <div className="mt-4 mb-1">
                                  <div className="text-2xl sm:text-[26px] font-bold text-neutral-900 tracking-tight leading-none">
                                    {disp}
                                  </div>
                                  {card.metric?.description && (
                                    <p className="text-[10px] text-neutral-500 font-normal mt-1.5 leading-relaxed">
                                      {card.metric.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Mini 6 ascending bars */}
                              <div className="flex items-end gap-1.5 h-8 w-full mt-4">
                                {pts.map((val: number, i: number) => {
                                  const opacity = 0.28 + (i / Math.max(pts.length - 1, 1)) * 0.72;
                                  return (
                                    <div key={i} className="flex-1 rounded-sm"
                                      style={{
                                        height: `${Math.max(18, (val / maxPt) * 100)}%`,
                                        backgroundColor: barColor,
                                        opacity: opacity,
                                      }} />
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={sec.id} onClick={() => setActiveId(sec.id)}
                    className={`p-10 cursor-pointer transition-all ${sel ? 'ring-2 ring-[#9ae625] ring-inset' : 'hover:bg-[#eeede9]'}`}
                    style={{ background: '#f4f3ef' }}>
                    <div className="text-[10px] font-mono text-[#5a8a00] uppercase tracking-wider mb-1">{sec.componentType}</div>
                    <h2 className="text-xl font-bold text-neutral-800">{sec.sectionIdentifier}</h2>
                  </div>
                );
              })}
            </div>
          </main>

          {/* RIGHT: Inspector */}
          <aside className="w-[308px] shrink-0 border-l border-white/6 bg-[#0f1117] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-white/6 shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ae625]/55">Inspector</p>
              <h3 className="text-sm font-bold text-white mt-1 truncate">{active?.sectionIdentifier || active?.componentType || 'No section'}</h3>
            </div>

            {active?.componentType === 'HERO' ? (
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">

                <Card title="Background" Icon={LucideImage as any}>
                  <ImageUploadField label="Image / Video URL" value={bgUrl}
                    onChange={url => patch({ backgroundMedia: { ...raw.backgroundMedia, url, type: 'image', overlayOpacity: bgOpacity }, bg: { ...raw.bg, desktopImageUrl: url } })}
                    placeholder="https://images.unsplash.com/..." />
                  <Field label={`Dark overlay — ${Math.round(bgOpacity * 100)}%`}>
                    <input type="range" min="0.05" max="0.90" step="0.05" value={bgOpacity}
                      onChange={e => patch({ backgroundMedia: { ...raw.backgroundMedia, url: bgUrl, overlayOpacity: +e.target.value }, bg: { ...raw.bg, overlayOpacity: +e.target.value } })}
                      className="w-full accent-[#9ae625] h-1.5 cursor-pointer" />
                  </Field>
                </Card>

                <Card title="Headline" Icon={Type as any}>
                  <div className="space-y-2">
                    {segs.map((seg: any, i: number) => (
                      <div key={i} className="rounded-lg border border-white/8 bg-white/3 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] text-white/18">SEG #{i + 1}</span>
                          <button type="button" onClick={() => patchSegs(segs.filter((_: any, j: number) => j !== i))}
                            className="text-white/18 hover:text-red-400 transition-colors"><Trash2 className="h-3 w-3" /></button>
                        </div>
                        <Input value={seg.text} onChange={e => patchSegs(segs.map((s: any, j: number) => j === i ? { ...s, text: e.target.value } : s))}
                          className="h-8 text-xs bg-white/5 border-white/10 text-white" />
                        <div className="flex gap-4 text-[11px] text-white/35">
                          {(['italic', 'highlight'] as const).map(k => (
                            <label key={k} className="flex items-center gap-1.5 cursor-pointer select-none">
                              <input type="checkbox" checked={seg[k] || false} className="accent-[#9ae625]"
                                onChange={e => patchSegs(segs.map((s: any, j: number) => j === i ? { ...s, [k]: e.target.checked } : s))} />
                              <span className={k === 'highlight' ? 'text-[#9ae625] font-semibold' : 'italic'}>{k === 'italic' ? 'Italic' : 'Highlight'}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => patchSegs([...segs, { text: 'New Word', italic: false, highlight: false }])}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/10 py-2 text-[11px] text-white/30 hover:border-[#9ae625]/35 hover:text-[#9ae625] transition-all">
                      <Plus className="h-3 w-3" />Add Segment
                    </button>
                  </div>
                </Card>

                <Card title="Description" Icon={Type as any} open={false}>
                  <Textarea value={desc} rows={3} placeholder="Hero description…"
                    onChange={e => patch({ description: { enabled: true, content: e.target.value, alignment: 'center' } })}
                    className="text-xs bg-white/5 border-white/10 text-white placeholder:text-white/18 resize-none" />
                </Card>

                <Card title="Primary CTA" Icon={MousePointerClick as any} open={false}>
                  <Field label="Button label">
                    <Input value={ctaLabel} placeholder="Scale Your Store" className="h-9 text-xs bg-white/5 border-white/10 text-white"
                      onChange={e => patch({ primaryCta: { ...raw.primaryCta, label: e.target.value, url: ctaHref } })} />
                  </Field>
                  <Field label="URL">
                    <Input value={ctaHref} placeholder="/contact" className="h-9 font-mono text-xs bg-white/5 border-white/10 text-white"
                      onChange={e => patch({ primaryCta: { ...raw.primaryCta, label: ctaLabel, url: e.target.value } })} />
                  </Field>
                </Card>

                <Card title="Video CTA" Icon={Video as any} open={false}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50">Show video button</span>
                    <Switch checked={videoOn} onCheckedChange={v => patch({ videoCta: { ...raw.videoCta, enabled: v } })} />
                  </div>
                  {videoOn && <>
                    <Field label="Label">
                      <Input value={videoLabel} placeholder="Watch Showreel" className="h-9 text-xs bg-white/5 border-white/10 text-white"
                        onChange={e => patch({ videoCta: { ...raw.videoCta, enabled: true, label: e.target.value, videoUrl: videoUrl } })} />
                    </Field>
                    <Field label="Video URL">
                      <Input value={videoUrl} placeholder="https://youtube.com/watch?v=…" className="h-9 font-mono text-xs bg-white/5 border-white/10 text-white"
                        onChange={e => patch({ videoCta: { ...raw.videoCta, enabled: true, label: videoLabel, videoUrl: e.target.value } })} />
                    </Field>
                  </>}
                </Card>

                <Card title="Agency Behind Strip" Icon={Users as any}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50">Show strip</span>
                    <Switch checked={stripOn} onCheckedChange={v => patch({ clientStrip: { ...raw.clientStrip, enabled: v } })} />
                  </div>
                  {stripOn && <>
                    <Field label="Strip label">
                      <Input value={stripTitle} placeholder="The agency behind .." className="h-9 text-xs bg-white/5 border-white/10 text-white"
                        onChange={e => patch({ clientStrip: { ...raw.clientStrip, title: e.target.value } })} />
                    </Field>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {logos.map((cl, i) => (
                        <div key={i} className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] text-white/18">CLIENT #{i + 1}</span>
                            <button type="button" onClick={() => removeLogo(i)} className="text-white/18 hover:text-red-400 transition-colors"><Trash2 className="h-3 w-3" /></button>
                          </div>
                          <Field label="Name">
                            <Input value={cl.name} placeholder="Client name" className="h-8 text-xs bg-white/5 border-white/10 text-white"
                              onChange={e => updateLogo(i, { name: e.target.value })} />
                          </Field>
                          <ImageUploadField label="Logo image" value={cl.logoUrl || ''} placeholder="https://cdn.../logo.svg"
                            onChange={url => updateLogo(i, { logoUrl: url })} />
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={addLogo}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/10 py-2.5 text-[11px] text-white/30 hover:border-[#9ae625]/35 hover:text-[#9ae625] transition-all">
                      <Plus className="h-3 w-3" />Add Client Logo
                    </button>
                  </>}
                </Card>

                {/* Animation Settings */}
                <AnimationCard
                  value={raw.animation}
                  onChange={anim => patch({ animation: anim })}
                />

              </div>
            ) : active?.componentType === 'METRICS_BANNER' ? (
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">

                {/* Eyebrow */}
                <Card title="Eyebrow Badge" Icon={Sparkles as any}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50">Show eyebrow pill</span>
                    <Switch checked={mEyebrow.enabled ?? true}
                      onCheckedChange={v => patch({ eyebrow: { ...mEyebrow, enabled: v } })} />
                  </div>
                  {(mEyebrow.enabled ?? true) && (
                    <Field label="Eyebrow text">
                      <Input value={mEyebrow.text || ''} placeholder="TELEMETRY & VERIFIED PERFORMANCE"
                        className="h-8 font-mono text-xs bg-white/5 border-white/10 text-white"
                        onChange={e => patch({ eyebrow: { ...mEyebrow, text: e.target.value } })} />
                    </Field>
                  )}
                </Card>

                {/* Headline */}
                <Card title="Headline Segments" Icon={Type as any}>
                  <div className="space-y-2">
                    {mSegs.map((seg: any, i: number) => (
                      <div key={i} className="rounded-lg border border-white/8 bg-white/3 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] text-white/18">SEG #{i + 1}</span>
                          <button type="button" onClick={() => patchMSegs(mSegs.filter((_: any, j: number) => j !== i))}
                            className="text-white/18 hover:text-red-400 transition-colors"><Trash2 className="h-3 w-3" /></button>
                        </div>
                        <Input value={seg.text} onChange={e => patchMSegs(mSegs.map((s: any, j: number) => j === i ? { ...s, text: e.target.value } : s))}
                          className="h-8 text-xs bg-white/5 border-white/10 text-white" />
                        <div className="flex gap-4 text-[11px] text-white/35">
                          {(['italic', 'highlight'] as const).map(k => (
                            <label key={k} className="flex items-center gap-1.5 cursor-pointer select-none">
                              <input type="checkbox" checked={seg[k] || false} className="accent-[#9ae625]"
                                onChange={e => patchMSegs(mSegs.map((s: any, j: number) => j === i ? { ...s, [k]: e.target.checked } : s))} />
                              <span className={k === 'highlight' ? 'text-[#9ae625] font-semibold' : 'italic'}>{k === 'italic' ? 'Italic' : 'Highlight'}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => patchMSegs([...mSegs, { text: 'New Phrase', italic: false, highlight: false, accent: false }])}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/10 py-2 text-[11px] text-white/30 hover:border-[#9ae625]/35 hover:text-[#9ae625] transition-all">
                      <Plus className="h-3 w-3" />Add Segment
                    </button>
                  </div>
                </Card>

                {/* Description & Supporting */}
                <Card title="Description & Supporting" Icon={Type as any} open={false}>
                  <Field label="Section description">
                    <Textarea value={mDesc} rows={3} placeholder="Every metric cleared through rigorous auditing…"
                      onChange={e => patch({ description: { enabled: true, content: e.target.value } })}
                      className="text-xs bg-white/5 border-white/10 text-white placeholder:text-white/18 resize-none" />
                  </Field>
                  <Field label="Supporting footnote">
                    <Textarea value={mSupport} rows={2} placeholder="Audited across 14 sovereign data regions…"
                      onChange={e => patch({ supportingText: { enabled: true, content: e.target.value } })}
                      className="text-xs bg-white/5 border-white/10 text-white placeholder:text-white/18 resize-none" />
                  </Field>
                </Card>

                {/* Trust Statement */}
                <Card title="Trust Statement" Icon={ShieldCheck as any} open={false}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50">Show trust statement</span>
                    <Switch checked={mPayload.verificationStatement?.enabled ?? true}
                      onCheckedChange={v => patch({ verificationStatement: { ...mPayload.verificationStatement, enabled: v } })} />
                  </div>
                  <Field label="Statement copy">
                    <Input value={mTrust} placeholder="ALL TELEMETRY CRYPTOGRAPHICALLY ATTESTED & THIRD-PARTY VERIFIED"
                      className="h-8 font-mono text-xs bg-white/5 border-white/10 text-white"
                      onChange={e => patch({ verificationStatement: { enabled: true, text: e.target.value, icon: 'ShieldCheck' } })} />
                  </Field>
                </Card>

                {/* Metric Cards */}
                <Card title={`Metric Cards (${mCards.length})`} Icon={BarChart3 as any}>
                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-0.5">
                    {mCards.map((card: any, idx: number) => {
                      const isF = card.isFeatured || card.appearance?.variant === 'featured';
                      const pts = card.chart?.dataPoints || [];
                      return (
                        <div key={card.id || idx} className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] text-[#9ae625] font-bold">CARD #{idx + 1}</span>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1 text-[10px] text-white/40 cursor-pointer select-none">
                                <input type="checkbox" checked={isF} className="accent-[#9ae625]"
                                  onChange={e => updateCard(card.id, { isFeatured: e.target.checked, appearance: { variant: e.target.checked ? 'featured' : 'default' } })} />
                                <span className={isF ? 'text-[#9ae625] font-bold' : ''}>Featured</span>
                              </label>
                              <button type="button" onClick={() => removeCard(card.id)}
                                className="text-white/20 hover:text-red-400 transition-colors">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          <Field label="Card title">
                            <Input value={card.title || ''} placeholder="Metric title"
                              className="h-8 text-xs bg-white/5 border-white/10 text-white"
                              onChange={e => updateCard(card.id, { title: e.target.value })} />
                          </Field>

                          <div className="grid grid-cols-2 gap-2">
                            <Field label="Category">
                              <Input value={card.category || ''} placeholder="FINANCIAL SERVICES"
                                className="h-7 text-[11px] bg-white/5 border-white/10 text-white uppercase font-mono"
                                onChange={e => updateCard(card.id, { category: e.target.value })} />
                            </Field>
                            <Field label="Region">
                              <Input value={card.region || ''} placeholder="Global / North America"
                                className="h-7 text-[11px] bg-white/5 border-white/10 text-white font-mono"
                                onChange={e => updateCard(card.id, { region: e.target.value })} />
                            </Field>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Field label="Metric display value">
                              <Input value={card.metric?.displayValue || ''} placeholder="$40B+"
                                className="h-8 text-xs font-mono font-bold bg-white/5 border-white/10 text-[#9ae625]"
                                onChange={e => updateCard(card.id, { metric: { ...card.metric, displayValue: e.target.value } })} />
                            </Field>
                            <Field label="Period label">
                              <Input value={card.period?.label || ''} placeholder="Rolling 30-Day Peak"
                                className="h-8 text-[11px] font-mono bg-white/5 border-white/10 text-white"
                                onChange={e => updateCard(card.id, { period: { ...card.period, label: e.target.value } })} />
                            </Field>
                          </div>

                          <Field label="Metric description">
                            <Textarea value={card.metric?.description || ''} rows={2} placeholder="Daily gross transactional volume..."
                              className="text-xs bg-white/5 border-white/10 text-white resize-none"
                              onChange={e => updateCard(card.id, { metric: { ...card.metric, description: e.target.value } })} />
                          </Field>

                          <div className="p-2 rounded-lg bg-black/20 border border-white/5 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-white/50 font-medium">Audit Verification</span>
                              <Switch checked={card.verification?.enabled ?? true}
                                onCheckedChange={v => updateCard(card.id, { verification: { ...card.verification, enabled: v } })} />
                            </div>
                            {(card.verification?.enabled ?? true) && (
                              <div className="grid grid-cols-2 gap-2">
                                <Field label="Badge label">
                                  <Input value={card.verification?.label || ''} placeholder="THIRD-PARTY AUDITED"
                                    className="h-7 text-[10px] bg-white/5 border-white/10 text-white uppercase font-mono"
                                    onChange={e => updateCard(card.id, { verification: { ...card.verification, label: e.target.value } })} />
                                </Field>
                                <Field label="Audit source">
                                  <Input value={card.verification?.source || ''} placeholder="BSI Global ISO 27001"
                                    className="h-7 text-[10px] bg-white/5 border-white/10 text-white"
                                    onChange={e => updateCard(card.id, { verification: { ...card.verification, source: e.target.value } })} />
                                </Field>
                              </div>
                            )}
                          </div>

                          <div className="p-2 rounded-lg bg-black/20 border border-white/5 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-white/50 font-medium">Mini Chart Visualization</span>
                              <Switch checked={card.chart?.enabled ?? true}
                                onCheckedChange={v => updateCard(card.id, { chart: { ...card.chart, enabled: v } })} />
                            </div>
                            {(card.chart?.enabled ?? true) && (
                              <>
                                <div className="flex gap-2">
                                  {(['bars', 'sparkline'] as const).map(type => (
                                    <button key={type} type="button"
                                      onClick={() => updateCard(card.id, { chart: { ...card.chart, chartType: type } })}
                                      className={`px-2.5 py-1 text-[10px] font-mono rounded capitalize transition-colors ${
                                        (card.chart?.chartType || 'bars') === type ? 'bg-[#9ae625] text-neutral-950 font-bold' : 'bg-white/5 text-white/40'
                                      }`}>
                                      {type}
                                    </button>
                                  ))}
                                </div>
                                <Field label="Data points (comma-separated)">
                                  <Input value={pts.join(', ')} placeholder="38, 52, 65, 58, 72, 85, 78, 92, 95, 100"
                                    className="h-7 text-[10px] font-mono bg-white/5 border-white/10 text-white"
                                    onChange={e => {
                                      const parsed = e.target.value.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
                                      updateCard(card.id, { chart: { ...card.chart, dataPoints: parsed } });
                                    }} />
                                </Field>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button type="button" onClick={addCard}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/10 py-2.5 text-[11px] text-white/30 hover:border-[#9ae625]/35 hover:text-[#9ae625] transition-all mt-2">
                    <Plus className="h-3 w-3" />Add Telemetry Metric Card
                  </button>
                </Card>

                {/* Animation Settings */}
                <AnimationCard
                  value={mPayload.animation}
                  onChange={anim => patch({ animation: anim })}
                />

              </div>
            ) : active ? (
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
                <Card title="Section Info" Icon={Settings2 as any}>
                  <div className="space-y-2">
                    <Field label="Identifier">
                      <div className="text-xs font-mono text-[#9ae625] bg-white/5 border border-white/10 rounded px-2.5 py-1.5 truncate">
                        {active.sectionIdentifier}
                      </div>
                    </Field>
                    <Field label="Component Type">
                      <div className="text-xs font-mono text-white/70 bg-white/5 border border-white/10 rounded px-2.5 py-1.5 truncate">
                        {active.componentType}
                      </div>
                    </Field>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-white/60">Section Active</span>
                      <Switch
                        checked={active.isActive}
                        onCheckedChange={v => setSections(p => p.map(s => s.id === active.id ? { ...s, isActive: v } : s))}
                      />
                    </div>
                  </div>
                </Card>

                <AnimationCard
                  value={active.contentPayload?.animation}
                  onChange={anim => patch({ animation: anim })}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-3">
                  <Settings2 className="h-10 w-10 text-white/8 mx-auto" />
                  <p className="text-xs text-white/22 max-w-[180px] leading-relaxed">Select a section to configure its properties.</p>
                </div>
              </div>
            )}

            {/* Bottom save */}
            <div className="shrink-0 p-4 border-t border-white/6">
              <button onClick={save} disabled={saving}
                className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-[#9ae625] hover:bg-[#b0f535] text-neutral-950 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#9ae625]/10">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving to database…</> : <><Save className="h-4 w-4" />Save & Publish</>}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
