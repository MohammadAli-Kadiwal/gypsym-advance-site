/**
 * Dynamic CMS TypeScript Interfaces
 * All public website content is modeled dynamically through these contracts.
 * Zero hardcoded content, zero mock data.
 */

export interface PageSectionDto {
  id: string;
  pageId: string;
  sectionIdentifier: string;
  componentType: string;
  displayOrder: number;
  contentPayload: Record<string, any>;
  stylesOverride?: Record<string, any> | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SeoMetadataDto {
  id?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  twitterCard?: string | null;
  noIndex?: boolean;
  structuredData?: Record<string, any> | null;
}

export interface PageDto {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  layoutType: string;
  status: string;
  locale: string;
  publishedAt?: string | null;
  sections: PageSectionDto[];
  seoMetadata?: SeoMetadataDto | null;
}

export interface MegaMenuItem {
  title: string;
  description: string;
  url: string;
  icon?: string;
  badge?: string;
}

export interface MegaMenuFeaturedCta {
  enabled: boolean;
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
}

export interface MegaMenuConfig {
  enabled: boolean;
  category: string;
  layout?: string;
  maxWidth?: string;
  items: MegaMenuItem[];
  featuredCta?: MegaMenuFeaturedCta;
}

export interface NavigationItemDto {
  id: string;
  navigationId: string;
  parentId?: string | null;
  label: string;
  url: string;
  icon?: string | null;
  badgeText?: string | null;
  isExternal: boolean;
  displayOrder: number;
  megaMenuConfig?: MegaMenuConfig | null;
  isActive: boolean;
  children?: NavigationItemDto[];
}

export interface NavigationDto {
  id: string;
  key: string;
  title: string;
  isActive: boolean;
  items: NavigationItemDto[];
}

export interface HeaderConfigDto {
  sticky?: boolean;
  transparentOverHero?: boolean;
  blur?: boolean;
  shadow?: boolean;
  border?: boolean;
  rounded?: string;
  maxWidth?: string;
  showThemeToggle?: boolean;
  showSearchBar?: boolean;
  cta?: {
    enabled?: boolean;
    label?: string;
    url?: string;
    icon?: string;
    openInNewTab?: boolean;
    variant?: string;
  };
}

export interface HeaderDataDto {
  branding: BrandSettingsDto | null;
  navigation: NavigationDto | null;
  config: HeaderConfigDto | null;
}

export interface BrandSettingsDto {
  id?: string;
  companyName: string;
  colors?: {
    primaryColorHsl?: string;
    secondaryColorHsl?: string;
    accentColorHsl?: string;
    lightBgHsl?: string;
    darkBgHsl?: string;
    lightBgColor?: string;
    darkBgColor?: string;
    [key: string]: any;
  };
  typography?: {
    fontFamily?: string;
    headingScale?: string;
    [key: string]: any;
  };
  socialLinks?: Array<{
    platform: string;
    url: string;
    icon?: string;
    isActive?: boolean;
  }>;
  logoLight?: string | null;
  logoDark?: string | null;
  favicon?: string | null;
}

// Hero Section Contracts
export interface HeadlineSegment {
  type: 'text' | 'italic' | 'highlight' | 'accent';
  value: string;
}

export interface TrustBadge {
  name: string;
  label: string;
  imageUrl?: string;
}

export interface HeroTrustRating {
  enabled: boolean;
  rating: number;
  ratingMax: number;
  stars?: number;
  reviewCount: string;
  reviewText: string;
  ratingSource?: string;
  badges?: TrustBadge[];
}

export interface HeroCta {
  enabled: boolean;
  label: string;
  url: string;
  icon?: string;
  variant?: string;
}

export interface HeroVideoCta {
  enabled: boolean;
  label: string;
  videoUrl: string;
  icon?: string;
}

export interface HeroBackgroundMedia {
  desktopImageUrl: string;
  mobileImageUrl?: string;
  videoUrl?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  focalPoint?: string;
}

export interface ClientLogo {
  name: string;
  logo?: string;
  logoUrl?: string;
  url?: string;
}

export interface ClientStrip {
  enabled: boolean;
  title: string;
  clients: ClientLogo[];
}

export interface FloatingAction {
  enabled: boolean;
  type: 'whatsapp' | 'contact';
  label: string;
  url: string;
}

export interface HeroPayload {
  titleHighlight?: string;
  eyebrow?: {
    enabled: boolean;
    text: string;
    style?: string;
  };
  trustRating?: HeroTrustRating;
  headline?: {
    segments: HeadlineSegment[];
    hasInlineVideo?: boolean;
    inlineVideoPosition?: number;
  };
  description?: {
    enabled: boolean;
    content: string;
    alignment?: 'center' | 'left';
  };
  primaryCta?: HeroCta;
  videoCta?: HeroVideoCta;
  backgroundMedia?: HeroBackgroundMedia;
  clientStrip?: ClientStrip;
  floatingAction?: FloatingAction;
}

// Verified Results & Metric Showcase Contracts
export interface ResultCardVerification {
  enabled: boolean;
  label: string;
  source?: string;
  date?: string;
  url?: string;
  badge?: string;
}

export interface ResultCardMetric {
  value: number;
  displayValue?: string;
  prefix?: string;
  suffix?: string;
  currency?: string;
  currencyPosition?: 'prefix' | 'suffix';
  decimalPrecision?: number;
  formatting?: 'compact' | 'currency' | 'standard' | 'percentage';
  description: string;
}

export interface ResultCardPeriod {
  periodType?: string;
  label: string;
  startDate?: string;
  endDate?: string;
}

export interface ResultCardChart {
  enabled: boolean;
  chartType: 'bars' | 'sparkline' | 'progress';
  dataPoints: number[];
  tone?: 'primary' | 'accent' | 'emerald' | 'purple' | 'amber';
}

export interface ResultCardAppearance {
  variant?: 'default' | 'featured';
  accentToken?: string;
}

export interface ResultCardPayload {
  id: string;
  title: string;
  category: string;
  industry?: string;
  geography?: string;
  region?: string;
  verification?: ResultCardVerification;
  metric: ResultCardMetric;
  period?: ResultCardPeriod;
  chart?: ResultCardChart;
  appearance?: ResultCardAppearance;
  order: number;
  isActive: boolean;
  isFeatured?: boolean;
}

export interface VerifiedResultsPayload {
  titleHighlight?: string;
  eyebrow?: {
    enabled: boolean;
    text: string;
    style?: string;
  };
  headline?: {
    segments?: Array<{ type: 'text' | 'highlight' | 'italic' | 'accent'; value: string }>;
    text?: string;
  };
  description?: {
    enabled: boolean;
    content: string;
  };
  supportingText?: {
    enabled: boolean;
    content: string;
  };
  verificationStatement?: {
    enabled: boolean;
    text: string;
    icon?: string;
  };
  layoutConfig?: {
    alignment?: 'center' | 'left';
    maxWidth?: string;
    columns?: number;
  };
  cards: ResultCardPayload[];
}

export interface VideoTestimonialDto {
  id: string;
  clientName: string;
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
  isActive: boolean;
  order: number;
}

export interface TextTestimonialDto {
  id: string;
  clientName: string;
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
  isActive: boolean;
  order: number;
}

export interface RatingSummaryDto {
  enabled: boolean;
  ratingValue: number;
  maxRating: number;
  reviewCountText: string;
  badgeText?: string;
}

export interface BottomTrustBarDto {
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
  ratingSummary?: RatingSummaryDto;
  videoTestimonials?: VideoTestimonialDto[];
  textTestimonials?: TextTestimonialDto[];
  bottomTrustBar?: BottomTrustBarDto;
}


