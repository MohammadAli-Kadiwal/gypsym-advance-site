# Gypsym Technology: Truly Dynamic CMS Architecture Blueprint

**Status**: Architectural Mandate & Master Blueprint  
**Standard**: Zero Hardcoded CMS Content • Zero Hardcoded Branding • Zero Hardcoded Navigation  
**Pipeline**: `Admin Workstation` ➔ `CMS Engine` ➔ `PostgreSQL 16 (Prisma)` ➔ `NestJS Core API` ➔ `Next.js App Router (ISR)` ➔ `Live Dynamic Website`  
**Date**: September 2026  

---

## 1. The Core Architectural Philosophy

```
  ┌────────────────────────┐
  │   Admin Workstation    │  <-- Administrator modifies: Logo, Brand Colors, Nav Links,
  │      (apps/admin)      │      Hero Headings, Services, Case Studies, Reorders Sections
  └───────────┬────────────┘
              │  HTTP / REST (Axios)
              ▼
  ┌────────────────────────┐
  │    NestJS Core API     │  <-- DTO Validation, RBAC Guards, Transactional Services,
  │       (apps/api)       │      Audit Ledger Logging, Edge Revalidation Webhooks
  └───────────┬────────────┘
              │  Prisma ORM
              ▼
  ┌────────────────────────┐
  │      PostgreSQL 16     │  <-- Normalized Reusable Entities, Page Section JSON Graphs,
  │  (packages/database)   │      SiteSettings, BrandSettings, Navigation Tree, Revisions
  └───────────┬────────────┘
              │  REST API with ISR Cache Tags
              ▼
  ┌────────────────────────┐
  │    Next.js Website     │  <-- Dynamic Root Layout (CSS Variable Injection),
  │       (apps/web)       │      Dynamic Navigation, DynamicSectionRegistry, Zero Hardcoded Pages
  └───────────┬────────────┘
              │  Edge CDN
              ▼
  ┌────────────────────────┐
  │      End Consumer      │  <-- Instant Reflection of Content, Branding, and Layout Updates
  │     (Public Web)       │      Without Developer Code Changes or Deployments
  └────────────────────────┘
```

### The Anti-Pattern to Avoid
- **DO NOT** create static, hardcoded pages (`HomePage.tsx`, `AboutPage.tsx`, `ServicesPage.tsx`) containing hardcoded headline strings, static JSX arrays, or static CSS variables in `globals.css`.
- **DO NOT** duplicate content entities across pages (e.g. re-typing the Cloud Modernization service inside the homepage, the services page, and the solutions page).

### The Dynamic Pattern Enforced
- Content entities (`Services`, `Solutions`, `Industries`, `Technologies`, `CaseStudies`, `Clients`, `Testimonials`, `Blogs`) are **canonical single sources of truth** in the database.
- A **Page** is a lightweight container specifying metadata and a list of ordered **Page Sections**.
- A **Page Section** references either a block configuration or points to canonical reusable content entities (`type: "SERVICES_GRID"`, `type: "LOGO_CLOUD"`, `type: "CASE_STUDIES_REEL"`).
- The public website renders pages via a generic **`DynamicSectionRegistry`** that reads the database section graph and mounts the corresponding modular components.

---

## 2. Reusable Content Entity & Page Relationship Topology

```
Reusable Content Entities (Canonical Database Records):
  ├── Services (UUID, slug, title, tagline, deliverables[], sla, techTags[])
  ├── Solutions (UUID, slug, title, roiMetrics[], complianceStandards[])
  ├── Industries (UUID, slug, name, regulatoryDrivers[], architectureBlueprint)
  ├── Technologies (UUID, name, radarRing: ADOPT|TRIAL, category: CLOUD|AI)
  ├── Case Studies (UUID, slug, clientName, verifiedMetrics[], csuiteQuote)
  ├── Clients (UUID, name, logoMediaId, tier: STRATEGIC|ENTERPRISE)
  ├── Testimonials (UUID, quote, authorName, authorTitle, company, avatarUrl)
  └── Blogs (UUID, slug, title, readingTime, markdownBody, authorId)
               │
               ▼  Referenced by Section Key or Filter
┌─────────────────────────────────────────────────────────────┐
│                      PAGE SECTIONS                          │
│                                                             │
│  Section 1: HERO          (props: { headline, ctaText, ctaLink })
│  Section 2: LOGO_CLOUD    (queries: Client.findMany({ isActive: true }))
│  Section 3: STATS_BANNER  (props: { metrics: [{ stat, label }] })
│  Section 4: SERVICES_GRID (queries: Service.findMany({ isFeatured: true }))
│  Section 5: CASE_STUDIES  (queries: CaseStudy.findMany({ isFeatured: true }))
│  Section 6: CTA_STRIP     (props: { headline, buttonText, buttonUrl })
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼  Ordered by orderIndex
┌─────────────────────────────────────────────────────────────┐
│                          PAGE                               │
│  (id, slug: "/", title: "Homepage", status: "PUBLISHED")   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Dynamic Branding Architecture (Zero Code Changes)

How an administrator changes the primary brand color from `#2563EB` to `#7C3AED` or changes the company name:

```
[Admin Branding Studio]
  │  POST /api/v1/site/branding { primaryColor: "262 83% 58%", companyName: "Gypsym Global" }
  ▼
[PostgreSQL BrandSettings Table]
  │  Stores: { primaryColor: "262 83% 58%", fontSans: "Outfit", logoLightUrl: "..." }
  ▼
[API: GET /api/v1/site/branding]
  │  Cache Tag: 'site-branding'
  ▼
[Next.js Root Layout: apps/web/src/app/layout.tsx]
```

### Implementation in `apps/web/src/app/layout.tsx`:
```tsx
import { getBrandSettings } from '@/lib/api';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const branding = await getBrandSettings();

  return (
    <html lang="en" className="dark">
      <head>
        {/* Dynamic Brand CSS Variable Injection */}
        <style id="gypsym-dynamic-brand-tokens">{`
          :root {
            --primary: ${branding.primaryColorHsl};
            --font-sans: ${branding.fontFamily}, sans-serif;
          }
          .dark {
            --primary: ${branding.primaryColorHsl};
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
```
**Result**: When the color is updated in Admin, an ISR webhook calls `revalidateTag('site-branding')`. The next user request renders with the new color without rebuilding or redeploying code.

---

## 4. Dynamic Navigation Architecture (Zero Deployments)

How an administrator adds a new link or creates a mega-menu:

```
[Admin Navigation Builder]
  │  PUT /api/v1/site/navigation { headerLinks: [...], footerColumns: [...] }
  ▼
[PostgreSQL Navigation Table]
  │  Stores ordered tree of navigation items and mega-menu links
  ▼
[Next.js Header: apps/web/src/components/header.tsx]
```

### Implementation in `apps/web/src/components/header.tsx`:
```tsx
import Link from 'next/link';
import { getNavigation, getBrandSettings } from '@/lib/api';

export async function Header() {
  const [navigation, branding] = await Promise.all([
    getNavigation(),
    getBrandSettings(),
  ]);

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Dynamic Logo & Company Name */}
        <Link href="/" className="flex items-center space-x-2">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt={branding.companyName} className="h-8 w-auto" />
          ) : (
            <span className="font-bold text-lg">{branding.companyName}</span>
          )}
        </Link>

        {/* Dynamic Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigation.headerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Dynamic CTA Button */}
        {navigation.ctaButton && (
          <Link
            href={navigation.ctaButton.href}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
          >
            {navigation.ctaButton.label}
          </Link>
        )}
      </div>
    </header>
  );
}
```

---

## 5. Dynamic Page Router & Section Registry

Instead of static routes with hardcoded sections, the website utilizes a **Dynamic Section Registry** that renders any page published in PostgreSQL:

### 5.1 Dynamic Section Registry (`apps/web/src/components/sections/section-registry.tsx`)
```tsx
import * as React from 'react';
import { HeroSection } from './hero-section';
import { LogoCloudSection } from './logo-cloud-section';
import { StatsBannerSection } from './stats-banner-section';
import { ServicesGridSection } from './services-grid-section';
import { SolutionsGridSection } from './solutions-grid-section';
import { TechRadarSection } from './tech-radar-section';
import { CaseStudiesSection } from './case-studies-section';
import { TestimonialsSection } from './testimonials-section';
import { FaqSection } from './faq-section';
import { CtaStripSection } from './cta-strip-section';
import { RichTextSection } from './rich-text-section';

export interface PageSectionModel {
  id: string;
  type: string;
  headline: string;
  subtitle?: string;
  content?: any;
  ctaText?: string;
  ctaLink?: string;
  isVisible: boolean;
  orderIndex: number;
}

const SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
  HERO: HeroSection,
  LOGO_CLOUD: LogoCloudSection,
  STATS_BANNER: StatsBannerSection,
  SERVICES_GRID: ServicesGridSection,
  SOLUTIONS_GRID: SolutionsGridSection,
  TECH_GRID: TechRadarSection,
  CASE_STUDIES: CaseStudiesSection,
  TESTIMONIALS: TestimonialsSection,
  FAQ_ACCORDION: FaqSection,
  CTA_STRIP: CtaStripSection,
  RICH_TEXT: RichTextSection,
};

export function DynamicSectionRenderer({ sections }: { sections: PageSectionModel[] }) {
  const visibleSections = sections
    .filter((s) => s.isVisible)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="flex flex-col">
      {visibleSections.map((section) => {
        const Component = SECTION_COMPONENTS[section.type];
        if (!Component) {
          console.warn(`[DynamicSectionRenderer] Unknown section type: ${section.type}`);
          return null;
        }
        return <Component key={section.id} data={section} />;
      })}
    </div>
  );
}
```

### 5.2 Dynamic Catch-All Page Route (`apps/web/src/app/[[...slug]]/page.tsx`)
```tsx
import { notFound } from 'next/navigation';
import { getPageBySlug, getAllPublishedPageSlugs } from '@/lib/api';
import { DynamicSectionRenderer } from '@/components/sections/section-registry';
import { Metadata } from 'next';

interface PageProps {
  params: { slug?: string[] };
}

export async function generateStaticParams() {
  const slugs = await getAllPublishedPageSlugs();
  return slugs.map((slug) => ({
    slug: slug === '/' ? [] : slug.split('/').filter(Boolean),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = params.slug ? `/${params.slug.join('/')}` : '/';
  const page = await getPageBySlug(slug);
  if (!page) return {};

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription,
    alternates: { canonical: `https://gypsym.com${slug === '/' ? '' : slug}` },
    openGraph: {
      title: page.seoTitle || page.title,
      description: page.seoDescription,
      images: page.ogImage ? [{ url: page.ogImage }] : [],
    },
  };
}

export default async function DynamicCmsPage({ params }: PageProps) {
  const slug = params.slug ? `/${params.slug.join('/')}` : '/';
  const page = await getPageBySlug(slug);

  if (!page || page.status !== 'PUBLISHED') {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <DynamicSectionRenderer sections={page.sections} />
    </main>
  );
}
```

---

## 6. Target Backend Module Topology (`apps/api/src/`)

```
apps/api/src/
├── common/
│   ├── decorators/           # @CurrentUser, @RequirePermissions, @Public
│   ├── guards/               # JwtAuthGuard, RolesGuard, PermissionsGuard, ThrottlerGuard
│   ├── interceptors/         # TransformResponseInterceptor, LoggingInterceptor
│   ├── filters/              # GlobalExceptionFilter (RFC 7807)
│   ├── middleware/           # CorrelationIdMiddleware, RequestIdMiddleware
│   └── pagination/           # PaginationQueryDto, PaginatedResult<T>
│
├── config/                   # env.schema.ts (Zod validation)
├── database/                 # PrismaService with soft-delete & connection pooling
│
├── modules/
│   ├── auth/                 # Login, Refresh token rotation, Logout, 2FA TOTP
│   ├── users/                # IAM user management, active toggle
│   ├── roles/                # RBAC role definitions
│   ├── permissions/          # Granular permission dictionary & matrix
│   │
│   ├── site/                 # SiteSettings (entity info, contacts, timezones)
│   ├── branding/             # BrandSettings (colors, logos, font scales)
│   ├── navigation/           # Navigation links, Mega-menus, Footer columns
│   ├── pages/                # Pages CRUD, Sections reordering, Revisions restore
│   ├── media/                # DAM uploader, S3 presigned URLs, MIME sniffing
│   ├── seo/                  # SEO defaults, robots.txt, dynamic sitemap feeds
│   │
│   ├── services/             # Reusable Services catalog
│   ├── solutions/            # Reusable Solutions catalog
│   ├── industries/           # Reusable Industries catalog
│   ├── technologies/         # Reusable Tech Radar catalog
│   ├── case-studies/         # Reusable Case Studies catalog
│   ├── projects/             # R&D Labs & Open Source projects
│   ├── clients/              # Client directory & alliances
│   ├── testimonials/         # C-suite endorsements & quotes
│   ├── team/                 # Leadership directors & architecture fellows
│   ├── careers/              # Culture pillars & benefits
│   ├── jobs/                 # Open ATS requisitions & applications
│   ├── blog/                 # Whitepapers, Categories, Tags
│   ├── faq/                  # Technical FAQs
│   ├── certifications/       # ISO/SOC-2 compliance registries
│   ├── awards/               # Global technology awards
│   ├── partners/             # Hyperscaler alliances
│   │
│   ├── contact/              # Inquiries inbox, qualification triage
│   ├── newsletter/           # Subscribers, CSV export
│   ├── notifications/        # Operational alerts & telemetry signals
│   └── audit/                # Immutable compliance ledger
│
├── app.module.ts             # Central root module registration
└── main.ts                   # Bootstrapper (Helmet, CORS, Pipes, Shutdown hooks)
```

---

## 7. Execution Order for Dynamic Pipeline Completion

```
Step 1: Unify RoleType Enum in schema.prisma & shared-types.
   ↓
Step 2: Generate & verify PostgreSQL Prisma Client.
   ↓
Step 3: Implement Backend Content & IAM Modules in apps/api.
   ↓
Step 4: Mount Modules in app.module.ts with PermissionsGuard & Throttler.
   ↓
Step 5: Connect Admin Workstation (apps/admin) to live NestJS REST API.
   ↓
Step 6: Build DynamicSectionRenderer & Catch-All Route in apps/web.
   ↓
Step 7: Wire Dynamic Brand Token & Navigation Injectors in apps/web layout.
   ↓
Step 8: Validate End-to-End Dynamic Loop (Admin change -> DB -> API -> Web).
```
