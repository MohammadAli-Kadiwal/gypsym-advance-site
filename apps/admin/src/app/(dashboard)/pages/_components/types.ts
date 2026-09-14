// Shared types for Pages CMS section editor

export interface HeroSection {
  id: string;
  componentType: string;
  isActive: boolean;
  contentPayload: HeroPayload;
}

export interface HeroPayload {
  titleHighlight?: string;
  eyebrow?: { text?: string; enabled?: boolean };
  headline?: {
    segments?: Array<{ text?: string; value?: string; highlight?: boolean; italic?: boolean }>;
    hasInlineVideo?: boolean;
    inlineVideoPosition?: number;
  };
  description?: { content?: string; enabled?: boolean };
  primaryCta?: { label?: string; url?: string };
  videoCta?: { enabled?: boolean; label?: string; videoUrl?: string };
  backgroundMedia?: {
    videoUrl?: string;
    desktopImageUrl?: string;
    overlayOpacity?: number;
  };
  clientStrip?: {
    enabled?: boolean;
    title?: string;
    bgColor?: string;
    clients?: Array<{ name: string }>;
  };
}

export interface MetricsCard {
  id?: string;
  title?: string;
  metric?: { displayValue?: string; value?: number; prefix?: string; description?: string };
  period?: { label?: string };
  region?: string;
  category?: string;
  geography?: string;
  verification?: { label?: string; source?: string; enabled?: boolean };
  appearance?: { cardBg?: string; barColor?: string; accentToken?: string };
}

export interface MetricsPayload {
  titleHighlight?: string;
  eyebrow?: { text?: string; style?: string; enabled?: boolean };
  headline?: { segments?: Array<{ type?: string; value?: string; text?: string }> };
  description?: { content?: string; enabled?: boolean };
  supportingText?: { content?: string; enabled?: boolean };
  backgroundColor?: string;
  cards?: MetricsCard[];
}

export interface MetricsSection {
  id: string;
  componentType: string;
  isActive: boolean;
  contentPayload: MetricsPayload;
}

export interface RevenueExperimentPayload {
  titleHighlight?: string;
  eyebrow?: string;
  headline?: string;
  description?: string;
  ctaText?: string;
  ctaUrl?: string;
  experimentTag?: string;
  winnerBadge?: string;
  metricTitle?: string;
  controlLabel?: string;
  controlValue?: string;
  controlSubtext?: string;
  variantLabel?: string;
  variantValue?: string;
  variantSubtext?: string;
  bars?: number[];
}

export interface RevenueExperimentSection {
  id: string;
  componentType: string;
  isActive: boolean;
  contentPayload: RevenueExperimentPayload;
}

export interface WhatWeChangeCard {
  id?: string;
  type?: 'cart' | 'speed' | 'theme';
  title?: string;
  description?: string;
  cartLabel?: string;
  cartStep?: string;
  checkoutButtonText?: string;
  metrics?: Array<{ label?: string; value?: string; percent?: number }>;
  items?: Array<{ title?: string; badge?: string }>;
}

export interface WhatWeChangePayload {
  titleHighlight?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  cards?: WhatWeChangeCard[];
}

export interface WhatWeChangeSection {
  id: string;
  componentType: string;
  isActive: boolean;
  contentPayload: WhatWeChangePayload;
}

export interface DeliveryProcessStep {
  id?: string;
  stepNumber?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  altText?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface DeliveryProcessPayload {
  eyebrow?: string;
  title?: string;
  titleHighlight?: string;
  description?: string;
  scrollHintText?: string;
  stickyScrollEnabled?: boolean;
  steps?: DeliveryProcessStep[];
}

export interface DeliveryProcessSection {
  id: string;
  componentType: string;
  isActive: boolean;
  contentPayload: DeliveryProcessPayload;
}

export interface VideoTestimonial {
  id: string;
  clientName: string;
  name?: string;
  company: string;
  role?: string;
  location?: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration?: string;
  durationText?: string;
  quoteSnippet?: string;
  quote?: string;
  metricHighlight?: string;
  isActive?: boolean;
  order?: number;
}

export interface TextTestimonial {
  id: string;
  clientName: string;
  name?: string;
  company: string;
  role?: string;
  location?: string;
  avatarUrl?: string;
  rating: number;
  content: string;
  quote?: string;
  projectType?: string;
  isFeatured?: boolean;
  isRepeatClient?: boolean;
  isVerified?: boolean;
  verifiedSource?: string;
  sourceUrl?: string;
  date?: string;
  isActive?: boolean;
  order?: number;
}

export interface RatingSummary {
  enabled: boolean;
  ratingValue: number;
  maxRating: number;
  reviewCountText: string;
  badgeText?: string;
}

export interface BottomTrustBar {
  enabled: boolean;
  trustStatements: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface ClientTestimonialsPayload {
  eyebrow?: string;
  title?: string;
  titleHighlight?: string;
  description?: string;
  autoplayVideos?: boolean;
  ratingSummary?: RatingSummary;
  videoTestimonials?: VideoTestimonial[];
  textTestimonials?: TextTestimonial[];
  bottomTrustBar?: BottomTrustBar;
}

export interface ClientTestimonialsSection {
  id: string;
  componentType: string;
  isActive: boolean;
  contentPayload: ClientTestimonialsPayload;
}

export interface PortfolioProject {
  id?: string;
  orderNumber?: string;
  title?: string;
  client?: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  altText?: string;
  projectUrl?: string;
  tags?: string[];
  metrics?: string;
}

export interface PortfolioPayload {
  eyebrow?: string;
  title?: string;
  titleHighlight?: string;
  description?: string;

  // Hover settings
  hoverEffectsEnabled?: boolean;
  viewButtonEnabled?: boolean;
  viewButtonLabel?: string;
  viewButtonPosition?: 'center' | 'bottom-center' | 'bottom-right';
  overlayEnabled?: boolean;
  backdropBlurEnabled?: boolean;
  imageZoomEnabled?: boolean;

  // 3D Animation settings
  threeDScrollEnabled?: boolean;
  threeDIntensity?: 'subtle' | 'premium';
  mouseParallaxEnabled?: boolean;

  // Display limits
  maxDisplayCount?: number;

  projects?: PortfolioProject[];
}

export interface PortfolioSection {
  id: string;
  componentType: string;
  isActive: boolean;
  contentPayload: PortfolioPayload;
}

export interface SelectedClientRef {
  clientId: string;
  displayOrder: number;
  visibility?: boolean;
}

export interface ClientsLayoutSettings {
  preset?: '8/6/4' | '6/4/2' | '8/8' | '6/6/6' | '5/5' | 'equal' | 'custom';
  rowPattern?: number[];
  overflowBehavior?: 'continue' | 'limit';
  rowAlignment?: 'center' | 'left';
  logoStyle?: 'muted' | 'grayscale' | 'monochrome' | 'original';
  logoSize?: 'small' | 'medium' | 'large';
  gap?: 'compact' | 'medium' | 'relaxed';
  displayMode?: 'cards' | 'minimal' | 'marquee';
  showMetricsBar?: boolean;
}

export interface ClientsAnimationSettings {
  enableReveal?: boolean;
  revealStyle?: 'stagger' | 'fade';
  hoverEffect?: boolean;
}

export interface ClientsPayload {
  eyebrow?: string;
  title?: string;
  titleHighlight?: string;
  description?: string;
  cta?: {
    enabled?: boolean;
    label?: string;
    url?: string;
    target?: '_self' | '_blank';
  };
  layout?: ClientsLayoutSettings;
  animation?: ClientsAnimationSettings;
  selectedClients?: SelectedClientRef[];
  clients?: Array<{
    id: string;
    name: string;
    logoUrl?: string;
    websiteUrl?: string | null;
    tier?: string;
    displayOrder?: number;
  }>;
}

export interface ClientsSection {
  id: string;
  componentType: string;
  isActive: boolean;
  contentPayload: ClientsPayload;
}

export interface PartnersLayoutSettings {
  preset?: '8/6/4' | '6/4/2' | '8/8' | '6/6/6' | '5/5' | 'custom';
  rowPattern?: number[];
  desktopRow1?: number;
  desktopRow2?: number;
  desktopRow3?: number;
  mobileCols?: 2 | 3;
  logoStyle?: 'muted' | 'grayscale' | 'monochrome' | 'original';
  logoSize?: 'small' | 'medium' | 'large';
  gap?: 'compact' | 'medium' | 'relaxed';
  rowAlignment?: 'center' | 'left';
}

export interface PartnersAnimationSettings {
  enableReveal?: boolean;
  hoverEffect?: boolean;
}

export interface PartnersPayload {
  eyebrow?: string;
  title?: string;
  titleHighlight?: string;
  description?: string;
  cta?: {
    enabled?: boolean;
    label?: string;
    url?: string;
    target?: '_self' | '_blank';
  };
  layout?: PartnersLayoutSettings;
  animation?: PartnersAnimationSettings;
  partners?: Array<{
    id: string;
    slug?: string | null;
    name: string;
    logoUrl?: string | null;
    logoDarkUrl?: string | null;
    shortDescription?: string | null;
    description?: string | null;
    websiteUrl?: string | null;
    partnerType?: string | null;
    industry?: string | null;
    tier?: string;
    displayOrder?: number;
    showOnHomepage?: boolean;
  }>;
}

export interface PartnersSection {
  id: string;
  componentType: string;
  isActive: boolean;
  contentPayload: PartnersPayload;
}

export interface ContactFieldConfig {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox';
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  options?: string[];
  width?: 'full' | 'half';
}

export interface ContactPayload {
  eyebrow?: string;
  title?: string;
  titleHighlight?: string;
  description?: string;
  contactInfo?: {
    useGlobalDefaults?: boolean;
    email?: string;
    phone?: string;
    address?: string;
    officeHours?: string;
  };
  supportCard?: {
    enabled?: boolean;
    title?: string;
    description?: string;
    ctaLabel?: string;
    ctaUrl?: string;
  };
  form?: {
    formTitle?: string;
    formSubtitle?: string;
    submitButtonText?: string;
    privacyNote?: string;
    successTitle?: string;
    successMessage?: string;
    fields?: ContactFieldConfig[];
  };
  globalContactDetails?: {
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    socialLinks?: Array<{ platform: string; url: string }> | null;
  };
}

export interface ContactSection {
  id: string;
  componentType: string;
  isActive: boolean;
  contentPayload: ContactPayload;
}

export interface CtaButton {
  label: string;
  url: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'glow';
  target?: '_self' | '_blank';
}

export interface CtaAppearance {
  backgroundType?: 'brand' | 'surface' | 'gradient' | 'image';
  backgroundImageUrl?: string;
  overlayOpacity?: number;
  enableGlow?: boolean;
}

export interface CtaLayout {
  alignment?: 'left' | 'center' | 'right';
  containerWidth?: 'narrow' | 'contained' | 'wide';
  borderRadius?: 'none' | 'md' | 'xl' | '2xl' | '3xl';
}

export interface CtaPayload {
  eyebrow?: string;
  title?: string;
  titleHighlight?: string;
  description?: string;
  primaryButton?: CtaButton;
  secondaryButton?: {
    enabled?: boolean;
    label?: string;
    url?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'glow';
    target?: '_self' | '_blank';
  };
  appearance?: CtaAppearance;
  layout?: CtaLayout;
}

export interface CtaSection {
  id: string;
  componentType: string;
  isActive: boolean;
  contentPayload: CtaPayload;
}

export interface PageData {
  id?: string;
  slug?: string;
  title?: string;
  status?: string;
  layoutType?: string;
  sections?: Array<{
    id: string;
    componentType: string;
    sectionIdentifier: string;
    contentPayload: unknown;
    isActive: boolean;
  }>;
}

