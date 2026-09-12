# Gypsym Technology: Public Website UX & Architecture Specification
## Document Version: 1.0.0-PUBLIC-UX
### Foundational Specifications: [PRD.md](file:///e:/dev/gypsym-advance-site/PRD.md) | [HLD.md](file:///e:/dev/gypsym-advance-site/HLD.md) | [LLD.md](file:///e:/dev/gypsym-advance-site/LLD.md) | [DESIGN_SYSTEM.md](file:///e:/dev/gypsym-advance-site/DESIGN_SYSTEM.md)
### Technology Stack: Next.js 14+ (App Router), React Server Components (RSC), Tailwind CSS, shadcn/ui

---

## 1. Global Experience Philosophy & Storytelling Framework

The Gypsym Technology public digital platform is engineered as a **living enterprise storytelling engine**. Unlike static marketing brochures, it projects market dominance, engineering precision, institutional stability, and transformation outcomes.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ENTERPRISE STORYTELLING FRAMEWORK                        │
├───────────────────────┬─────────────────────────┬───────────────────────────┤
│ 1. Value First        │ 2. Provable Proof       │ 3. Progressive Disclosure │
│    (Clarity over Buzz)│    (Metrics over Claims)│    (Scannable to Deep)    │
├───────────────────────┼─────────────────────────┼───────────────────────────┤
│ Immediate executive   │ Every capability is     │ Executive summaries lead  │
│ proposition within    │ backed by verified case │ into technical blueprints,│
│ 3 seconds of load.    │ study metrics and logos.│ architectures, and SLAs.  │
└───────────────────────┴─────────────────────────┴───────────────────────────┘
```

### Global Structural Shell

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Gypsym Technology  │  Solutions ▾  Services ▾  Industries ▾  Company ▾  Blog    │  [Search CMD+K]  [Book Briefing] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│                                  PAGE CONTENT REGION                                   │
│            (React Server Components with Tagged Incremental Revalidation)              │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ GLOBAL ENTERPRISE FOOTER                                                               │
│ Columns: Capabilities | Industries | Research & News | Company | Trust & Compliance    │
│ Badges: ISO 27001 Certified • SOC 2 Type II Audited • GDPR Compliant                  │
│ Copyright © 2026 Gypsym Technology Inc. All rights reserved.                          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Exhaustive Page Specifications

---

### Page 1: Homepage (`/`)

#### 1. Objective & Target Audience
* **Objective:** Establish Gypsym Technology as a premier global enterprise technology partner; route high-intent decision-makers into solution consultation funnels within 2 clicks.
* **Audience:** Enterprise C-Suite (CTO, CIO, VP Engineering), procurement heads, strategic partners, and tier-1 engineering candidates.
* **SEO Intent:** Primary brand authority (`Gypsym Technology`, `enterprise cloud modernization`, `planetary-scale software engineering`, `AI enterprise transformation`). Title: `Gypsym Technology | Engineering the Global Enterprise`.

#### 2. Content Hierarchy & Sections

| Order | Section Module | Structural Layout & Components | Explicit Business Purpose | Admin-Controlled Content |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Hero Section** | `Display-2XL` Headline, Eyebrow Badge, Lead Paragraph, Dual CTAs (`[Schedule Executive Briefing]` primary + `[Explore Capabilities]` outline), Background Ambient Glow (`hsl(var(--primary)/0.15)`). | Establishes immediate category leadership; drives primary lead qualification. | Headline, subtitle, badge tag, CTA button routes and copy. |
| **2** | **Client Logo Marquee** | Infinite horizontal marquee with greyscale client logos transitioning to high-contrast white on hover. | Instant social proof and institutional trust within the first scroll. | Selected client accounts (`Client` model), marquee speed. |
| **3** | **Company Positioning** | 2-column narrative grid: Bold manifesto statement on left; 3 pillars (Planetary Scale, Security Sovereign, Zero Technical Drift) on right. | Differentiates Gypsym from generic IT consultancies by stating engineering philosophy. | Manifesto title, body narrative, pillar headlines. |
| **4** | **Core Capabilities Grid** | Interactive 3-column card grid with hover border highlights (`border-primary/40`), icons, short descriptions, and link anchors. | Gives immediate structural clarity to Gypsym's breadth of offerings. | Selected services from `Service` model. |
| **5** | **Solutions by Industry** | Tabbed solution switcher (FinTech, Healthcare, Public Sector, Telecom) with dynamic architectural diagram preview. | Directly answers industry-specific regulatory and scale requirements. | Active industries and mapped solutions. |
| **6** | **Impact Metrics Banner** | Full-width high-contrast slate banner with 4 primary numbers (`+320% Throughput`, `99.999% Uptime`, `$180M+ Cost Saved`, `45M+ Users`). | Quantifiable business outcomes validating engineering competence. | Array of 4 stat items (`metric`, `label`, `subtext`). |
| **7** | **Featured Case Studies** | 2-column showcase cards with high-res cover imagery, client logo badge, challenge statement, and verified metric chip. | Bridges theoretical claims with real-world enterprise delivery proof. | Selected case study IDs (`CaseStudy` model). |
| **8** | **Technology Radar** | Interactive chip filter showcasing core competencies across Cloud, Distributed Systems, AI/ML, and Cyber Defense. | Demonstrates modern architectural maturity to technical buyers and talent. | Selected technologies from `Technology` model. |
| **9** | **Executive Testimonial** | Centered single-quote endorsement with 5-star rating, author avatar, executive title, and company badge. | Humanizes enterprise validation from peer C-suite leaders. | Selected testimonial ID (`Testimonial` model). |
| **10**| **Delivery Process** | 4-step progressive horizontal timeline: `01. Architectural Audit` → `02. Target State Blueprint` → `03. Resilient Implementation` → `04. 24/7 Managed Operations`. | De-risks procurement by clarifying engagement transparency. | Step numbers, titles, and step descriptions. |
| **11**| **Latest Insights** | 3-column card grid displaying newest engineering whitepapers and articles with read-time badges. | Positions Gypsym leadership as visionary thought leaders. | Dynamic query: Latest 3 `BlogPost` records. |
| **12**| **High-Impact CTA Strip**| Full-bleed card with gradient border, high-impact headline (*"Ready to Architect What's Next?"*), and consultation scheduler. | Final conversion catch before footer exit. | Headline, subtext, button label, form route. |

#### 3. Responsive & Motion Specifications
* **Responsive:** Logo marquee pauses on touch; 3-column grids stack into single columns with swipe hints on mobile; impact metrics switch to 2x2 grid.
* **Motion:** Staggered fade-up entry on viewport enter (`120ms` delay per item); subtle parallax on hero background glow.

---

### Page 2: About Us (`/about`)

#### 1. Objective & Target Audience
* **Objective:** Articulate corporate heritage, global footprint, leadership ethos, and compliance posture.
* **Audience:** Institutional investors, enterprise risk assessors, prospective leadership talent, and industry analysts.
* **SEO Intent:** `About Gypsym Technology`, `enterprise engineering leadership`, `corporate governance`. Title: `About Us | Heritage & Leadership | Gypsym Technology`.

#### 2. Sections & Content Hierarchy
1. **Executive Hero:** *"Engineered on the Principles of Resilience and Integrity."*
2. **Global Footprint & Locations:** Interactive map showing headquarters (London, New York, Singapore, Zurich) with regional office details and headcount.
3. **Corporate Timeline (Milestones):** Vertical timeline tracing founding, major platform launches, and global expansion milestones.
4. **Leadership Team Showcase:** Grid of executive profiles featuring headshots, role titles, bios, and LinkedIn verification links.
5. **Certifications & Compliance Badges:** Display of ISO 27001, SOC 2 Type II, and hyperscaler competency certifications.
6. **Core Values Grid:** 4 value cards (*"Architectural Rigor"*, *"Radical Transparency"*, *"Client Sovereignty"*, *"Continuous Mastery"*).

---

### Page 3: Services (`/services` & `/services/[slug]`)

#### 1. Objective & Target Audience
* **Index Objective:** Comprehensive catalog of capabilities enabling buyers to find specific technical offerings.
* **Detail Objective:** Deep architectural breakdown of a single service (e.g., *Cloud Native Modernization*), outlining deliverables, methodologies, SLAs, and case studies.
* **SEO Intent:** `enterprise cloud architecture`, `distributed systems consulting`, `AI transformation services`.

#### 2. Service Detail Page (`/services/[slug]`) Layout
1. **Service Hero:** Service Title, Tagline, Breadcrumbs (`Home > Services > Cloud Modernization`), and CTA `[Request Architecture Review]`.
2. **Capability Breakdown:** 4-part feature grid detailing specific technical scopes (e.g., Kubernetes Orchestration, Zero Trust Networking).
3. **Methodology & SLAs:** Tabbed interface explaining discovery, execution, transition, and guaranteed SLAs (e.g., 99.99% availability).
4. **Integrated Tech Stack:** Logo chips of technologies leveraged within this service.
5. **Related Case Studies:** 2 client stories specifically filtered by this service ID.
6. **Targeted Service CTA:** Direct consultation inquiry form pre-selecting this service in the dropdown.

---

### Page 4: Solutions (`/solutions` & `/solutions/[slug]`)

#### 1. Objective & Target Audience
* **Objective:** Align technical capabilities with business outcomes (e.g., *Legacy Core Banking Modernization*, *Omnichannel Healthcare Platforms*).
* **Audience:** Business unit heads, Chief Digital Officers, and line-of-business executives.
* **SEO Intent:** `fintech enterprise solutions`, `healthcare cloud compliance`, `telecom edge computing`.

#### 2. Solution Detail Page (`/solutions/[slug]`) Layout
1. **Solution Executive Hero:** Business problem statement and strategic outcome headline.
2. **Business Challenge Matrix:** Split column: *"The Traditional Roadblocks"* vs. *"The Gypsym Approach"*.
3. **Reference Architecture Diagram:** High-resolution interactive architectural blueprint with zoom lightbox.
4. **Measurable ROI Calculator / Benchmark:** Visual metrics proving cost reduction, latency optimization, and time-to-market acceleration.
5. **Mapped Services & Industry Compliance:** Clear links to foundational services and compliance frameworks (e.g., HIPAA, PCI-DSS).

---

### Page 5: Industries (`/industries` & `/industries/[slug]`)

#### 1. Objective & Target Audience
* **Objective:** Establish vertical domain authority and deep regulatory fluency.
* **Verticals:** Financial Services & Banking, Healthcare & Life Sciences, Public Sector & Defense, Telecommunications, Manufacturing & Supply Chain.
* **Detail Layout:** Industry Overview → Regulatory Compliance Standards (SEC, HIPAA, FedRAMP) → Bespoke Case Studies → Industry Practice Leaders.

---

### Page 6: Technology & Innovation (`/technology`)

#### 1. Objective & Target Audience
* **Objective:** Showcase technology expertise, engineering philosophy, and technical radar.
* **Audience:** Enterprise Architects, Staff Engineers, and technical evaluators.
* **SEO Intent:** `enterprise technology stack`, `Gypsym tech radar`, `modern engineering practices`.
* **Content Layout:**
  * **Interactive Tech Radar:** Interactive visual map categorized into `Adopt`, `Trial`, `Assess`, `Hold` across Cloud, Data, AI, and Security.
  * **Open Source Contributions:** Highlighted GitHub repositories and community contributions maintained by Gypsym engineering.
  * **Engineering Standards Whitepaper:** Direct download gate for the annual *Gypsym Enterprise Architectural Standards Guide*.

---

### Page 7: Case Studies (`/case-studies` & `/case-studies/[slug]`)

#### 1. Objective & Target Audience
* **Index Objective:** Filterable proof library allowing prospects to find stories matching their exact industry, tech stack, and challenge.
* **Detail Objective:** Long-form proof narrative detailing the exact transformation journey.
* **SEO Intent:** `cloud modernization case study`, `enterprise fintech transformation`, `AI deployment success story`.

#### 2. Case Study Detail Page (`/case-studies/[slug]`) Layout
1. **Hero & Client Pill:** Client name, industry tag, hero headline, and prominent metric pill (e.g., `"-68% Infrastructure Spend"`).
2. **Executive Summary Grid:** 4 metadata chips: Client Tier, Timeline (e.g., *8 Months*), Technologies Used, Regional Scope.
3. **The Challenge:** In-depth problem statement explaining the legacy bottlenecks, security vulnerabilities, or scale ceilings.
4. **The Solution & Architecture:** Narrative explaining the architectural approach, accompanied by diagrams and implementation phases.
5. **Business Impact & Results:** Verified stats grid (`Throughput`, `Cost`, `Latency`) and client executive quote.
6. **Client Endorsement Card:** High-profile card displaying verified client quote, author name, title, and corporate logo.

---

### Page 8: Projects & R&D Labs (`/projects`)

#### 1. Objective & Target Audience
* **Objective:** Highlight internal R&D initiatives, patents, open-source toolkits, and experimental technologies.
* **Content:** Cards with GitHub link, live sandbox link, technical description, and maintainer details.

---

### Page 9: Clients & Alliances (`/clients`)

#### 1. Objective & Target Audience
* **Objective:** Comprehensive institutional directory of verified client partnerships and hyperscaler alliances.
* **Content:** Tiered display (`Strategic Partners`, `Enterprise Clients`, `Showcase Implementations`), client quotes, and partnership tier badges (e.g., *AWS Premier Tier Services Partner*).

---

### Page 10: Leadership & Team (`/team`)

#### 1. Objective & Target Audience
* **Objective:** Put faces to the institution; demonstrate depth of engineering and business leadership.
* **Content:** Filterable by department (Executive, Distributed Systems, AI, Cybersecurity). Cards with headshots, role titles, bios, and LinkedIn/Twitter links.

---

### Page 11: Careers & Talent Hub (`/careers` & `/careers/[slug]`)

#### 1. Objective & Target Audience
* **Objective:** Attract world-class global software engineers, architects, and product strategists.
* **SEO Intent:** `engineering careers at Gypsym`, `staff software engineer jobs`, `remote enterprise architecture roles`. Title: `Careers | Join Gypsym Technology`.

#### 2. Layout & Job Detail Specifications
* **Careers Landing (`/careers`):** Culture manifesto, global benefits (equity, remote stipend, conferences), office gallery, and filterable job board.
* **Job Detail View (`/careers/[slug]`):**
  * Requisition header (Title, Department, Location: Remote/Hybrid, Seniority, Requisition Code).
  * Role Purpose, Responsibilities array, Qualifications, and Nice-to-haves.
  * Direct Application Drawer / Form (First Name, Last Name, Email, LinkedIn, Portfolio, Resume PDF upload with Turnstile bot protection).
  * Schema.org `JobPosting` JSON-LD dynamically injected into page `<head>`.

---

### Page 12: Blog & Knowledge Hub (`/blog` & `/blog/[slug]`)

#### 1. Objective & Target Audience
* **Objective:** Drive organic search traffic, establish architectural thought leadership, and capture engineering subscriber leads.
* **SEO Intent:** Long-tail architectural keywords (`zero trust architecture in banking`, `event driven microservices with Kafka`). Title: `Insights & Engineering Blog | Gypsym Technology`.

#### 2. Article Reader View (`/blog/[slug]`) Layout
1. **Article Header:** Primary Category badge, Title (`Display-LG`), Excerpt, Author avatar + name + role, Publish date, and Read time badge.
2. **Sticky Table of Contents (TOC):** Left sidebar with scroll-spy highlighting current heading level (H2, H3).
3. **Structured Article Body:** ProseMirror-rendered clean typography (`prose prose-invert lg:prose-xl`) with syntax-highlighted code snippets, callout boxes, and zoomable diagrams.
4. **Author Bio Card:** Author photo, bio, and other articles by this author.
5. **Related Articles:** 3 articles dynamically computed based on matching tags and categories.
6. **Inline Newsletter Capture:** Targeted subscription form embedded at end of article.

---

### Page 13: Contact & Global Consultations (`/contact`)

#### 1. Objective & Target Audience
* **Objective:** Inbound enterprise lead capture with automated qualification.
* **Audience:** Ready-to-buy decision makers and procurement executives.
* **SEO Intent:** `contact Gypsym Technology`, `enterprise architecture consultation`. Title: `Contact Us | Schedule an Architecture Briefing | Gypsym Technology`.

#### 2. Interactive Lead Qualification Wizard
* **Step 1: Focus Area:** Select capability of interest (Cloud Modernization, AI Engineering, Distributed Systems, Cybersecurity, Other).
* **Step 2: Project Scope & Timeline:** Expected launch timeline (< 3 months, 3-6 months, 6-12 months) and estimated budget tier.
* **Step 3: Identity & Company:** Full Name, Business Email (validated against disposable email blacklist), Phone, Company, Job Title, Project Narrative.
* **Verification & Submission:** Cloudflare Turnstile token verified before dispatching to `/api/v1/contact`.
* **Sidebar:** Global office directory (London HQ, New York, Singapore, Zurich) with phone numbers, direct email, and interactive office hours.

---

### Pages 14–16: Legal & Trust Center (`/privacy`, `/terms`, `/cookies`)

#### 1. Objective & Standards
* **Objective:** Bulletproof regulatory compliance (GDPR, CCPA, ISO 27001).
* **Layout:** Clean single-column reading view (`max-w-3xl`) with last-updated timestamp, sticky table of contents, and downloadable signed PDF version.
* **Cookie Policy:** Includes interactive *"Manage Cookie Preferences"* trigger allowing users to reopen the consent banner and modify tracking preferences at any time.

---

### Page 17: Error Page (`404 Not Found`)

#### 1. Objective & Experience
* **Objective:** Retain visitors who land on broken or outdated links.
* **Design:** Branded error interface featuring a stylized terminal motif: `Error: 404 - Resource Not Found on Cluster`.
* **Helpful Pathways:** Search bar, links to popular hubs (Solutions, Blog, Careers), and a direct button to return to the Homepage (`/`).

---

## 3. SEO & Structured Data (JSON-LD) Master Schema

Every public page dynamically emits tailored Schema.org structured data to maximize organic visibility and rich Google search snippets:

```typescript
// Base Organization Schema (Emitted on Root Layout)
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Corporation',
  name: 'Gypsym Technology',
  url: 'https://gypsym.com',
  logo: 'https://cdn.gypsym.com/assets/logo-light.svg',
  sameAs: [
    'https://linkedin.com/company/gypsym',
    'https://twitter.com/gypsymtech',
    'https://github.com/gypsym-technology',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-212-555-0199',
    contactType: 'Enterprise Sales',
    areaServed: 'Worldwide',
    availableLanguage: ['English', 'German', 'French'],
  },
};
```

* **Blog Articles:** Dynamically injects `TechArticle` schema with `author`, `datePublished`, `publisher`, and `image`.
* **Job Postings:** Injects `JobPosting` schema with `hiringOrganization`, `jobLocation`, `employmentType`, and `validThrough`.
* **Services & Solutions:** Injects `Service` schema with `provider`, `serviceType`, and `areaServed`.
* **Breadcrumbs:** Injects `BreadcrumbList` on all hierarchical detail routes.

---

## 4. Conclusion & UX Sign-Off

This Public Website UX Specification provides a comprehensive, component-level roadmap for all 17 public routes and dynamic detail engines. By pairing radical visual polish with measurable business objectives and structured data, the platform ensures that Gypsym Technology commands immediate authority across the global enterprise landscape.

---
*End of Public Website UX Specification.*
