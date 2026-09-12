# Enterprise Admin Portal UX & Frontend Design Specification
## Project: Gypsym Technology Digital Platform & Enterprise CMS

---

| Document Metadata | Value |
| :--- | :--- |
| **Document Version** | 1.0.0-ADMIN-UX |
| **Status** | Approved UX & Frontend Specification |
| **Author** | Enterprise SaaS Product Designer, UX Architect & Frontend Architect |
| **Application Package** | `apps/admin` (Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Axios) |
| **Design Paradigm** | High-Density Enterprise SaaS (Linear / Stripe / Vercel design benchmark) |
| **Target Viewports** | Desktop-first (1440px+ optimized, 1024px minimum desktop, responsive tablet inspection) |
| **Date** | September 2026 |

---

## 1. UX Philosophy & Enterprise Design System

The Gypsym Technology Admin Panel is designed as a **mission-critical operational workstation**. It rejects generic, unstyled dashboard templates in favor of a keyboard-first, high-density, low-latency enterprise interface inspired by Linear, Vercel, Stripe, and Sanity Studio.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CORE UX PRINCIPLES                              │
├───────────────────────┬─────────────────────────┬───────────────────────────┤
│   High Information    │      Keyboard-First     │    Safe State Mutations   │
│        Density        │        Efficiency       │   & Reversible Actions    │
├───────────────────────┼─────────────────────────┼───────────────────────────┤
│ Crisp typography,     │ CMD+K command palette,  │ Real-time autosave, side- │
│ compact rows, clean   │ global keyboard shortcuts│ by-side diff rollback,   │
│ borders, contextual   │ for publishing, search,  │ 2-step destructive action │
│ flyout sheets.        │ navigation, and modals. │ confirmation flows.       │
└───────────────────────┴─────────────────────────┴───────────────────────────┘
```

### 1.1 Visual Token System & Theming
Built directly on custom HSL color tokens integrated with Tailwind CSS and Radix UI (`shadcn/ui`):

* **Color Palette (Dark Default with Seamless Daylight Switch):**
  * **Backgrounds:** `slate-950` (Canvas root), `slate-900` (Surface cards & sidebar), `slate-800/60` (Elevated modals & popovers).
  * **Borders & Dividers:** `slate-800/80` (Subtle 1px boundaries with zero drop-shadow clutter).
  * **Brand Primary:** Electric Cobalt (`hsl(217, 91%, 60%)`) for primary triggers and focus indicators.
  * **Semantic Accents:**
    * Success / Published: Emerald (`hsl(151, 65%, 45%)`)
    * Warning / In Review: Amber (`hsl(38, 92%, 50%)`)
    * Draft: Slate (`hsl(215, 16%, 47%)`)
    * Destructive / Error: Crimson (`hsl(0, 84%, 60%)`)
* **Typography:**
  * Primary Interface: `Inter` or `Geist Sans` with strict tracking and optical sizing.
  * Monospace & Code: `JetBrains Mono` for slugs, IDs, JSON diffs, and structured metadata.
* **Micro-Interactions:** Subtle 120ms ease-out transitions on hover, sheet slide-outs, and optimistic UI mutations.

---

## 2. Information Architecture (IA) & Navigation Hierarchy

The admin platform is structured into **5 Top-Level Workspaces** mapped logically to user mental models and operational workflows.

```
Gypsym Admin Architecture
│
├── 1. Executive Telemetry
│   └── /dashboard                         (Lead volume, traffic, job candidates, system health)
│
├── 2. Content Operations (CMS)
│   ├── /pages                             (Page tree, dynamic section builder, route hierarchy)
│   ├── /solutions                         (Business solutions, industry alignments)
│   ├── /services                          (Capability hierarchy, tech mappings)
│   ├── /case-studies                      (Client stories, impact metrics)
│   ├── /portfolio                         (Projects, R&D showcase, open source)
│   ├── /editorial                         (Blog articles, categories, tags, author desk)
│   ├── /trust                             (Clients, Testimonials, Certifications, Awards, Partners)
│   └── /talent                            (Job requisitions, Candidate ATS desk)
│
├── 3. Digital Asset Management (DAM)
│   └── /media                             (Virtual folder explorer, bulk uploader, metadata editor)
│
├── 4. Site Governance & Experience
│   ├── /site/branding                     (Logos, color palettes, typography scales)
│   ├── /site/navigation                   (Mega-menu builder, footer link columns)
│   ├── /site/seo                          (Default meta, robots.txt, dynamic sitemaps, redirects)
│   └── /site/settings                     (Contact information, legal disclosures, API settings)
│
└── 5. System Administration & Compliance
    ├── /system/iam                        (User accounts, roles, permissions matrix)
    ├── /system/audit                      (Immutable compliance ledger with diff viewer)
    └── /system/inbox                      (Lead inquiries, CRM sync status, notification center)
```

---

## 3. Global Shell & Layout Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Gypsym Tech Admin   │  [Search or CMD+K]               │ (Env: Prod)  [🔔 3]  [User Avatar ▼]  │
├────────────────────────────┼───────────────────────────────────────────────────────────────────────────┤
│ 📁 DASHBOARD               │  Pages  ›  Enterprise Cloud  ›  Section Builder  [● Draft Saved 2s ago]   │
│                            ├───────────────────────────────────────────────────────────────────────────┤
│ 📝 CONTENT                 │  [Page Title: Enterprise Cloud Modernization                    ]        │
│   • Dynamic Pages          │  Tabs: [ Canvas Builder ]  [ SEO & Social ]  [ Revisions ]  [ Settings ]  │
│   • Solutions & Services   ├─────────────────────────────────────────────┬─────────────────────────────┤
│   • Case Studies & Clients │                                             │ Section Inspector           │
│   • Blog & Insights        │   [+] Add Section                           │ ─────────────────────────── │
│   • Careers & Jobs         │                                             │ Selected: Hero Component    │
│   • FAQs & Certifications  │   ⠿ 1. Hero Section (Variant A)   [👁] [⚙]  │ Headline:                   │
│                            │   ⠿ 2. Metrics Banner Strip       [👁] [⚙]  │ [Modernize at Scale       ] │
│ 🖼️ MEDIA LIBRARY           │   ⠿ 3. Tabbed Solutions Grid      [👁] [⚙]  │ Primary CTA:                │
│   • All Assets             │   ⠿ 4. Executive Testimonial      [👁] [⚙]  │ [Schedule Briefing        ] │
│   • Folders                │   ⠿ 5. Global Lead CTA Strip      [👁] [⚙]  │ Padding Y: [ 6rem         ] │
│                            │                                             │                             │
│ ⚙️ SITE & SYSTEM           │                                             │ [Discard]    [Save Section] │
│   • Branding & Tokens      ├─────────────────────────────────────────────┴─────────────────────────────┤
│   • Navigation & Menus     │ Status: DRAFT   │   [Preview ↗]   [Schedule...]   [ Publish Page (CMD+P) ]    │
│   • IAM & Security         └───────────────────────────────────────────────────────────────────────────┘
│   • Audit Logs             │
└────────────────────────────┘
```

### 3.1 Key Shell Elements
1. **Collapsible Workspace Sidebar:**
   * Two operational states: Expanded (`260px`) and Icon-Collapsed (`64px`).
   * Nested accordions for deep content clusters (e.g., Content, Site Governance).
   * Badge counters for active items requiring review (e.g., `In Review: 2`, `New Inquiries: 5`).
   * Persistent bottom drawer showing connected environment (`PRODUCTION`), Redis status, and active user profile.
2. **Command / Search Interface (`CMD+K` / `Ctrl+K`):**
   * Instant overlay dialog running fuzzy search across all entities, actions, and settings.
   * Actions supported: Jump to page, create new blog post, upload asset, invite user, toggle dark mode.
3. **Dynamic Breadcrumb Bar:**
   * Contextual path with inline dropdown switchers (e.g., clicking on `Enterprise Cloud` opens a dropdown listing other sibling pages for instant switching).
   * Autosave status indicator (`Saving...`, `● Saved to cloud 2s ago`, `⚠️ Unsaved changes`).
4. **Action Dock (Sticky Bottom Footer):**
   * Persists at the bottom of all edit views, containing primary state actions: `Discard`, `Preview`, `Request Review`, `Schedule`, `Publish Now`.

---

## 4. UI Patterns & Component Specifications

### 4.1 Enterprise Data Table Engine
Built with `@tanstack/react-table` and `shadcn/ui` primitives.
* **Sticky Header:** Column headers remain fixed during vertical scrolling.
* **Faceted Column Filters:** Popover filters for status, department, category, and date ranges.
* **Column Visibility Manager:** Users can customize which columns are visible; preferences are persisted in `localStorage`.
* **Row Selection & Floating Bulk Action Dock:**
  * Selecting checkboxes triggers a floating dock at bottom-center showing: `3 items selected | [Publish Selected] [Change Status ▼] [Delete...] [Clear]`.
* **Row Hover Quick-Actions:** Hovering over any row exposes contextual buttons without opening the record: `Edit`, `Preview`, `Duplicate`, `Archive`.

### 4.2 Drawers & Sheets vs. Modals
* **Slide-Out Sheets (Right Drawer, `480px` or `640px`):** Used for quick editing tasks that preserve background context (e.g., editing image alt-text in DAM, viewing candidate resume and recruiter notes, quick-editing a FAQ item).
* **Center Dialogs (`520px` max width):** Used strictly for high-focus single decisions: Destructive confirmations, 2FA setup, invite user modal.
* **Confirmation Flows for Destructive Actions:**
  * Deleting a published page, purging media, or revoking an admin requires typing the resource name or clicking a timed countdown button (`Confirm in 3s...`).

### 4.3 Form Architecture, Dirty Tracking & Autosave
* **Form Engine:** `react-hook-form` integrated with `zod` schemas generated from `@gypsym/shared-types`.
* **Field State Indicators:** Visually highlights fields modified since last published version.
* **Autosave Engine:** Debounced background sync (`1500ms` idle) saving drafts to `PUT /api/v1/admin/.../draft`.
* **Unsaved Changes Shield:** Next.js navigation interceptor alerting users if they attempt to navigate away with unpersisted edits.

### 4.4 Skeletons, Empty States & Error Boundaries
* **Skeleton Screens:** Custom shimmer loading skeletons matching the exact geometry of cards, tables, and section builders—zero generic spinning wheels.
* **Polished Empty States:** Illustrated SVG placeholders with clear value proposition and primary action (e.g., *"No case studies found. Publish your first customer transformation story to showcase client impact."* `[+ Create Case Study]`).
* **Section Error Isolation:** If one component in a complex page builder fails validation, the error is isolated to that section's accordion header with a red alert badge.

---

## 5. CMS Editorial & Publishing Workflow

### 5.1 Content State Machine

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CMS EDITORIAL LIFECYCLE                         │
└────────────────────────────────────────────────────────────────────────┘

  [ 1. DRAFT ] ──────────► [ 2. IN REVIEW ] ──────────► [ 3. APPROVED ]
       ▲                         │                            │
       │                         ▼                            ▼
       │                  (Changes Requested)          [ 4. PUBLISHED ]
       │                         │                            │
       │                         ▼                            ├──────────────┐
       └─────────────────────────┴────────────────────────────┤              ▼
                                                              ▼        [ 6. TRASHED ]
                                                       [ 5. ARCHIVED ]
```

### 5.2 Pre-Publish Validation Checklist
Clicking "Publish" executes a client-side and server-side validation pipeline displayed in a slide-out verification checklist:

```
┌─────────────────────────────────────────────────────────┐
│ Pre-Publish Verification                      [ Close ] │
├─────────────────────────────────────────────────────────┤
│  ✓ Page slug is unique and valid                        │
│  ✓ Primary Hero section configured                      │
│  ✓ All required section fields populated                │
│  ✓ SEO Title & Meta Description present                 │
│  ✓ OpenGraph social share image assigned                │
│  ⚠️ Warning: 1 image missing Alt-Text (Accessibility)    │
├─────────────────────────────────────────────────────────┤
│ [ Resolve Warnings ]            [ Confirm & Publish ]   │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Live Preview Engine
* **Split-Pane & Full-Preview:** Admins can toggle between a side-by-side split screen (form on left, live canvas on right) or open a standalone preview window.
* **Device Viewport Switcher:** Responsive frame controls at the top of the canvas: `Desktop (1440px)`, `Tablet (768px)`, `Mobile (375px)`.
* **Next.js Draft Mode Integration:** Preview URLs load securely with cryptographic tokens, rendering uncommitted draft state directly inside the public Next.js rendering engine.

### 5.4 Point-in-Time Revision History & Visual Diff
* Every publication and save action generates an entry in the Revisions tab.
* **Split Diff Inspector:** Displays a side-by-side comparison showing exact changes:
  * Green highlight: Added text, new sections, updated colors.
  * Red highlight: Removed copy, deleted sections.
* **1-Click Rollback:** Button to `Restore This Version`, copying historical snapshot state into a new active draft.

### 5.5 SEO & Social Graph Live Preview Cards
Within the SEO tab, admins see live rendered simulations:
* **Google SERP Snippet Preview:** Real-time preview of the title, green URL breadcrumb, and meta description with character count progress bars (Title: 54/60 chars, Desc: 142/155 chars).
* **Social Share Cards:** Exact replicas of LinkedIn, X (Twitter), and Facebook feed cards showing the selected OpenGraph banner, headline, and domain.

---

## 6. Modular Page Builder Architecture

The Page Builder is the flagship feature of the CMS, enabling non-technical operators to build bespoke, high-performance enterprise landing pages.

### 6.1 Builder Canvas Layout
* **Left Column (Section Tree & Outliner, `320px`):**
  * Drag-and-drop sortable list of page sections.
  * Section status indicators: Active (`👁`), Hidden (`👁‍🗨`), Draft.
  * Quick-actions: Duplicate, Remove, Move Up/Down.
  * `[+ Add New Section]` button triggering the Section Palette.
* **Center / Right Column (Section Configuration Inspector):**
  * Displays dynamic form fields mapped strictly to the selected section's schema.
  * Tabbed configuration: `Content`, `Design & Spacing`, `Responsive Visibility`.

### 6.2 Catalog of 19 Section Modules

| # | Section Name | Identifier | Configurable Content Payload | Responsive Controls |
| :- | :--- | :--- | :--- | :--- |
| 1 | **Hero Section** | `HERO` | Headline, Tagline, Primary CTA (label, URL, style), Secondary CTA, Background Media (Video/Image), Alignment (Left/Center). | Height (Full/Auto), Mobile media toggle. |
| 2 | **Rich Text Block** | `RICH_TEXT` | ProseMirror/Tiptap block editor, Max container width (`prose-lg`, `prose-xl`). | Column layout on desktop. |
| 3 | **Feature Grid** | `FEATURE_GRID` | Section title, subtitle, Grid columns (2, 3, 4), Array of `{ icon, title, description, badge }`. | 1 col mobile, 2 col tablet. |
| 4 | **Services Grid** | `SERVICES_GRID` | Selected Service IDs, Card presentation style (Minimal, Detailed with SLAs). | Card count per row. |
| 5 | **Solutions Grid** | `SOLUTIONS_GRID` | Linked Solution IDs, Hover effect variant, Read more trigger. | Staggered grid toggle. |
| 6 | **Industry Showcase** | `INDUSTRY_GRID` | Linked Industry IDs, Background accent colors, Icon styles. | Slider vs. Static grid. |
| 7 | **Technology Radar** | `TECH_GRID` | Filter by category (`CLOUD`, `AI`, `DATA`), Interactive chip selector. | Compact vs. Expanded badges. |
| 8 | **Impact Stats Banner** | `STATS_BANNER` | Array of `{ metric: "+320%", label: "Cloud Scale", description: "..." }`, Background style. | Horizontal scroll on mobile. |
| 9 | **Client Logo Cloud** | `LOGO_CLOUD` | Selected Client IDs, Marquee animation speed, Greyscale vs. Full color. | Row count on mobile. |
| 10 | **Testimonials Slider** | `TESTIMONIALS` | Selected Testimonial IDs, Layout (Single large quote vs. 3-column cards), Star rating toggle. | Autoplay toggle, swipe support. |
| 11 | **Case Studies Reel** | `CASE_STUDIES` | Filter by Industry/Tech, Card style, View all case studies CTA link. | Horizontal carousel on mobile. |
| 12 | **Call to Action (CTA)** | `CTA_STRIP` | High-impact banner headline, description, primary & secondary action buttons, Accent glow variant. | Stack buttons on mobile. |
| 13 | **Accordion FAQ** | `FAQ_ACCORDION` | Selected FAQ Category or custom array of `{ question, answer }`, Search filter toggle. | Open first item by default. |
| 14 | **Leadership Team** | `TEAM_GRID` | Department filter, Display layout (Executive grid vs. compact list), Bio modal toggle. | 2 col mobile, 4 col desktop. |
| 15 | **Company Timeline** | `TIMELINE` | Array of milestones `{ year, title, description, image }`, Orientation (Vertical/Horizontal). | Vertical stack on mobile. |
| 16 | **Split Image + Text** | `IMAGE_TEXT` | Image asset, Alignment (Image Left vs. Image Right), Eyebrow tag, Headline, Rich description, Bullet points, Action button. | Image on top on mobile. |
| 17 | **Video Showcase** | `VIDEO_SHOWCASE`| Video URL (YouTube, Vimeo, or self-hosted S3), Poster thumbnail, Autoplay on scroll toggle, Caption. | Aspect ratio (16:9, 21:9). |
| 18 | **Media Gallery** | `GALLERY` | Multi-image asset selection, Layout (Masonry, Carousel, Uniform grid), Lightbox zoom toggle. | Masonry column count. |
| 19 | **Contact Router** | `CONTACT_BLOCK` | Embedded consultation wizard, Office address card display, Map toggle. | Form position (Left/Center). |

---

## 7. Media Library & Digital Asset Management (DAM) UX

### 7.1 DAM Workspace Layout
* **Folder Tree Sidebar (`240px`):**
  * Virtual folder hierarchy (`/Logos`, `/Case-Studies`, `/Team`, `/Blog`, `/Banners`).
  * `[+ New Folder]` quick action and drag-and-drop folder moving.
* **Asset Grid / List View:**
  * Toggle between Visual Grid (large thumbnails with dimensions and badges) and High-Density List (compact table with size, MIME type, upload date).
  * Hovering an asset card reveals quick-actions: `Inspect`, `Copy CDN URL`, `Edit Alt-Text`, `Delete`.
* **Direct Multi-File Dropzone:**
  * Dropping files anywhere on the canvas displays a full-screen blurred dropzone overlay: *"Drop files to upload to /Blog/2026"*.
  * Upload Progress Modal: Shows concurrent uploads with real-time transfer speeds, chunk progress, and automated format conversion indicators (`Compressing to AVIF...`).
* **Asset Detail Inspector Sheet:**
  * Clicking an asset slides open a right-side inspector sheet showing:
    * Image preview with zoom controls.
    * File dimensions, byte size, aspect ratio, and extracted dominant HEX color.
    * Alt-Text & Caption inputs with instant save.
    * Generated responsive variants preview (`thumb`, `sm`, `md`, `lg`, `avif`, `webp`).
    * **Usage Traceability:** Displays a list of all pages and blog posts currently referencing this asset to prevent accidental broken links upon deletion.

---

## 8. Site Governance & Experience Workspaces

### 8.1 Dynamic Brand & Design Token Studio (`/site/branding`)
* **Color Token Palette Editor:**
  * Real-time HSL/Hex color pickers for `brand-primary`, `brand-secondary`, `brand-accent`, `surface-dark`, `surface-light`.
  * Live mini-preview showing how token adjustments affect buttons, hero backgrounds, and navigation elements.
* **Typography Configuration:**
  * Font family selector (Inter, Outfit, Roboto, JetBrains Mono).
  * Interactive typographic scale slider adjusting base body size and heading scale ratios with real-time preview.
* **Asset Uploaders:** Dedicated slots for Primary Light Logo, Dark Logo, Monogram Mark, Favicon (.ico), and Apple Touch Icon.

### 8.2 Navigation & Mega-Menu Builder (`/site/navigation`)
* Visual tree builder for `Header Navigation` and `Footer Columns`.
* Supports drag-and-drop reordering and nesting up to 3 levels deep.
* Mega-Menu Inspector: Allows editors to assign custom promotional cards, badge tags ("New", "Beta"), and contextual icons to navigation dropdowns.

---

## 9. System Administration, IAM & Compliance Workspaces

### 9.1 User Management & Granular RBAC Matrix (`/system/iam`)
* User directory table showing active status, 2FA enforcement status, assigned roles, and last login timestamps.
* Role-Permission Matrix View: Super Admins can view and toggle atomic permissions (`pages:write`, `careers:publish`, `media:delete`) across custom or system roles.

### 9.2 Audit Log Explorer & JSON Diff Inspector (`/system/audit`)
* Real-time log table displaying `Timestamp`, `Actor`, `Action`, `Resource`, `IP Address`.
* **Inspect Diff Drawer:** Clicking any audit entry opens a slide-out showing the exact JSON snapshot before and after the mutation:
```json
// Example Audit Diff View
{
  "before": {
    "status": "DRAFT",
    "publishedAt": null
  },
  "after": {
    "status": "PUBLISHED",
    "publishedAt": "2026-09-10T11:45:00.000Z"
  }
}
```

---

## 10. Frontend Architecture Blueprint (`apps/admin`)

### 10.1 Component & Feature Directory Structure

```
apps/admin/src/
├── app/                               # Next.js App Router
│   ├── (auth)/login/page.tsx          # Login & 2FA modal
│   ├── (dashboard)/
│   │   ├── layout.tsx                 # Protected Dashboard Shell (Sidebar, Header, Dock)
│   │   ├── page.tsx                   # Executive Telemetry Dashboard
│   │   ├── pages/                     # Dynamic Page Builder Views
│   │   ├── content/                   # Entity Registries (Services, Solutions, Clients)
│   │   ├── editorial/                 # Blog Article Editor
│   │   ├── media/                     # Digital Asset Management
│   │   ├── site/                      # Branding, Navigation, SEO
│   │   └── system/                    # IAM, Audit Logs, Inbox
├── components/
│   ├── shell/                         # Sidebar, Header, Breadcrumbs, ActionDock, CommandPalette
│   ├── table/                         # DataTable, FacetedFilter, ColumnToggle, BulkActions
│   ├── builder/                       # Canvas, SectionTree, SectionInspector, ViewportSwitcher
│   ├── forms/                         # FormField, RichTextEditor, MediaPicker, SlugInput
│   ├── ui/                            # shadcn/ui primitives (Button, Sheet, Dialog, Popover)
│   └── feedback/                      # Toast, Skeletons, EmptyState, ErrorBoundary
├── features/                          # Domain feature logic, hooks, and API clients
│   ├── auth/                          # useAuthStore, useLoginMutation
│   ├── pages/                         # usePageQuery, useSaveSectionsMutation, usePublishPage
│   ├── media/                         # useMediaLibraryQuery, usePresignedUpload
│   └── branding/                      # useBrandingTokens, useUpdateBranding
├── hooks/                             # Shared utility hooks (useDebounce, useKeyboardShortcut)
└── lib/                               # Axios client, QueryClient, diff utilities
```

### 10.2 State Management Rules
* **Server State (TanStack Query):** Handles all remote API caching, background refetching, optimistic mutations, and query invalidation.
* **Transient UI State (Zustand):** Lightweight stores managing:
  * `useSidebarStore`: Sidebar collapsed/expanded state.
  * `useCommandPaletteStore`: Open/closed state of `CMD+K` modal.
  * `useBuilderStore`: Active selected section ID, active viewport (`desktop` | `tablet` | `mobile`), undo/redo history stacks.
* **Form State (React Hook Form):** Form field dirty states, validation errors, and input synchronization.

---

## 11. Conclusion & UX Sign-Off

This Admin Panel design delivers a high-density, professional enterprise workstation tailored to the speed, complexity, and visual authority required by Gypsym Technology. By decoupling modular sections from hardcoded templates and embedding strict revision governance, non-technical marketing teams can operate the entire global digital footprint with institutional confidence.

---
*End of Admin Panel UX & Frontend Design Specification.*
