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
