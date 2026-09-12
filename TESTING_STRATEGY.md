# Gypsym Technology: Comprehensive Enterprise Testing Strategy & Quality Assurance Framework

## 1. Executive Summary & Quality Engineering Philosophy

This document defines the comprehensive Quality Engineering (QE) and Automation Strategy for the entire Gypsym Technology platform. The platform comprises:
- **Public Website (`apps/web`)**: Server-rendered and statically generated Next.js App Router application optimized for performance, accessibility, dynamic CMS rendering, and SEO.
- **Admin Workstation (`apps/admin`)**: High-density enterprise CMS workstation featuring a 3-pane Page Builder, Digital Asset Management (DAM), 38 operational modules, and granular Role-Based Access Control (RBAC).
- **Core Backend Engine (`apps/api`)**: NestJS modular REST API adhering to strict hexagonal/layered architecture, correlation ID tracing, centralized RFC 7807 error handling, and Prisma ORM persistence.
- **Database Layer (`packages/database`)**: PostgreSQL 16 schema managed via Prisma migrations, with composite indices, foreign keys, soft deletion, and revision snapshots.
- **Shared Schemas (`packages/shared-types`)**: Strict TypeScript contracts shared across monorepo workspaces.

### 1.1 Core QA Principles
1. **Shift-Left Quality**: Security, accessibility, and type-safety validations run locally in pre-commit hooks and PR gates, preventing defects from reaching integration branches.
2. **Zero-Trust Authorization & RBAC**: Every endpoint and UI element is guarded. Testing explicitly verifies negative access paths across all 5 standard roles (`SUPER_ADMIN`, `ADMIN`, `EDITOR`, `AUTHOR`, `VIEWER`).
3. **Deterministic Isolation**: Tests execute against ephemeral Testcontainers or isolated database schemas, guaranteeing zero flaky state leakage between test suites.
4. **Contract-Driven Testing**: DTOs, OpenAPI specifications, and Zod schemas act as single sources of truth. Frontends and backends are tested against identical contracts.
5. **Continuous Verification**: Automated quality gates block merging or deployment if coverage, performance budgets, or security vulnerabilities exceed established thresholds.

---

## 2. Test Pyramid & Automation Tooling Ecosystem

```
             / \
            /   \      E2E Automation (Playwright)
           /     \     Cross-app flows, Visual Regression, A11y (axe)
          /-------\
         /         \    API & Integration Testing (Supertest, Jest, Testcontainers)
        /           \   Contract validation, RBAC guards, DB migrations
       /-------------\
      /               \  Unit & Component Testing (Vitest, React Testing Library)
     /                 \ Pure logic, state reducers, DTOs, UI primitives
    /-------------------\
```

### 2.1 Tooling & Technology Stack

| Layer | Primary Framework / Tool | Purpose & Scope | Execution Frequency |
| :--- | :--- | :--- | :--- |
| **Type Check & Lint** | `tsc --noEmit`, ESLint, Prettier | Strict type safety, unused import detection, coding standards | Pre-commit & Every PR |
| **Unit Testing** | Vitest / Jest | Pure functions, formatters, validation schemas, Zustand/store reducers | Every commit / PR |
| **Component Testing** | React Testing Library + `@testing-library/jest-dom` | Isolated UI components, Form state changes, `<PermissionGuard>` visibility | Every commit / PR |
| **API Integration** | Supertest, NestJS TestingModule | Controller-Service-Repository integration, request validation, exception filters | PR & Pre-merge |
| **Database Testing** | Testcontainers (PostgreSQL), Prisma Migrate | Schema integrity, constraint enforcement, transaction rollbacks, index performance | PR & Nightly |
| **E2E Testing** | Playwright (Chromium, Firefox, WebKit) | Critical business flows, multi-tenant interactions, viewport responsiveness | Pre-merge & Staging |
| **Visual Regression** | Playwright Screenshot Diffing (`toMatchSnapshot`) | Pixel-perfect design system alignment, light/dark mode regressions | Staging Deploy |
| **Accessibility (A11y)**| `@axe-core/playwright`, Pa11y | WCAG 2.1 AA automated compliance, color contrast, keyboard navigation | PR & Staging |
| **Load & Performance** | k6, Google Lighthouse CI (LHCI) | Core Web Vitals (LCP, FID/INP, CLS), API throughput SLA (p95 < 120ms @ 5k req/s) | Nightly & Pre-release |
| **Security Scanning** | Snyk, Trivy, OWASP ZAP, GitGuardian | SAST/DAST, dependency vulnerabilities, secret leakage, OWASP Top 10 | CI Pipeline & Nightly |

---

## 3. Domain-Specific Testing Strategies

### 3.1 Unit Testing
- **Scope**:
  - Utility functions (`formatBytes`, `formatDateTime`, `cn`, slugifiers).
  - Validation schemas (Zod configs in `env.schema.ts`, DTO class-validator decorators).
  - Pure React hooks and in-memory CMS collections (`useCmsCollection`).
  - Access-control predicates (`hasPermission`, role inheritance).
- **Standards**: 100% code coverage on utility functions, validation regexes, and authorization policies. No mocking of internal business logic.

### 3.2 Integration & Service Layer Testing
- **Scope**:
  - NestJS dependency injection graph resolution.
  - Interaction between Service layer, Repository abstractions, and Prisma client.
  - Database transactions (`prisma.$transaction`) verifying atomic commit or rollback upon downstream failure.
  - Event dispatchers (audit log emitters, email notification triggers).
- **Execution**: Run with live PostgreSQL instances in Docker (Testcontainers) configured with transaction rollback per test suite.

### 3.3 REST API Testing
- **Scope**:
  - Strict compliance with `API_SPECIFICATION.md` (/api/v1 base URL).
  - Standard JSON response envelope structure:
    ```json
    {
      "success": true,
      "data": { ... },
      "timestamp": "2026-09-10T12:00:00.000Z",
      "requestId": "req-...",
      "correlationId": "corr-..."
    }
    ```
  - Standard RFC 7807 problem details for all 4xx/5xx responses.
  - HTTP header validation (`x-request-id`, `x-correlation-id`, `x-frame-options: DENY`, strict CSP).
  - Query parameter parsing: pagination (`page`, `limit`), sorting (`sortBy`, `sortOrder`), filtering, and full-text search.

### 3.4 Database Testing
- **Scope**:
  - **Migration Idempotency**: Verify `prisma migrate deploy` executes up/down cleanly against empty and existing databases.
  - **Constraints**: Enforce unique indexes (e.g. `users.email`, `pages.slug`, `roles.name`), composite keys, and cascade behaviors.
  - **Soft Deletes**: Validate that queries with soft-deleted entities (`deletedAt IS NOT NULL`) do not leak into active API responses.
  - **Auditability**: Verify timestamp triggers (`createdAt`, `updatedAt`) and foreign key reference cascades.

### 3.5 Authentication & Session Security Testing
- **Scope**:
  - **Credential Verification**: Password hashing via Argon2id. Rejection of weak passwords, plaintext storage verification.
  - **JWT Tokens**: Asymmetric RSA/ECDSA signing or HMAC-SHA256 verification. Expiry boundary checks (access token 15 min, refresh token 7 days).
  - **Refresh Token Rotation**: Immediate single-use rotation. Immediate invalidation of all sessions if a reuse anomaly is detected.
  - **2FA TOTP**: Time-drift tolerance (±1 step), replay rejection of the same 6-digit TOTP within the same 30-second window.

### 3.6 Authorization & Granular RBAC Testing
- **Scope**:
  - Matrix validation across all 5 system roles:
    1. `SUPER_ADMIN`: Full root access across all modules, settings, IAM, and audit ledgers.
    2. `ADMIN`: Full CRUD on content, media, workflows; restricted from root security settings.
    3. `EDITOR`: Create, edit, and publish content; no user management or system settings access.
    4. `AUTHOR`: Create and edit own draft content; cannot publish directly or modify others' content.
    5. `VIEWER`: Read-only telemetry, pages, and media; zero mutating action access.
  - **Dual-Layer Shielding**:
    1. UI Level: Buttons, drawers, and actions gated via `<PermissionGuard permission="...">`.
    2. API Level: NestJS `@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)`.

### 3.7 CMS & Publishing Workflow Testing
- **Scope**:
  - State machine lifecycle: `DRAFT` ➔ `IN_REVIEW` ➔ `SCHEDULED` ➔ `PUBLISHED` ➔ `ARCHIVED`.
  - Edge invalidation triggers: Publishing a page must dispatch ISR revalidation requests (`res.revalidate`) to `apps/web`.
  - Slug collision prevention: Cannot create or publish two active pages sharing the same path `/solutions/cloud-modernization`.

### 3.8 Page Builder & Dynamic Canvas Testing
- **Scope**:
  - Catalog integrity: Validation of all 19 section types (Hero, Logo Cloud, Stats Banner, Services Grid, Solutions Grid, Technology Radar, Timeline, etc.).
  - Section manipulation: Move up/down array mutations, add section from catalog, toggle visibility, and delete.
  - Viewport fidelity: Rendering consistency across `Desktop` (100%), `Tablet` (768px), and `Mobile` (375px) modes.
  - Schema serialization: Ensure section configuration JSON strictly adheres to section prop contracts without data stripping.

### 3.9 Media Library (DAM) Testing
- **Scope**:
  - File upload restrictions: Allowed MIME types (`image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`, `application/pdf`). Rejection of executable scripts (`.exe`, `.sh`, `.php`, `.js`).
  - Size boundary tests: Files up to 50MB permitted; immediate rejection of files exceeding quota.
  - Image optimization pipeline: Generation of responsive webp variants, thumbnail generation, and metadata extraction (dimensions, color profile, EXIF stripping).
  - Folder hierarchy: Deep nesting, move operations, and cascade deletion guards.

### 3.10 SEO & Structured Data Testing
- **Scope**:
  - HTML `<head>` tags: `<title>`, `<meta name="description">`, `<meta name="robots">`, `<link rel="canonical">`.
  - Social Graph: OpenGraph (`og:title`, `og:image`, `og:url`) and Twitter Cards (`summary_large_image`).
  - Structured Data: Validation of JSON-LD schema objects (`Organization`, `TechArticle`, `JobPosting`, `BreadcrumbList`) against Schema.org validators.
  - Search crawlers: Dynamic `/robots.txt` configuration and `/sitemap.xml` XML schema compliance.

### 3.11 Form & Lead Qualification Testing
- **Scope**:
  - Executive Briefing Form: Multi-step wizard validation, email syntax verification, phone format normalization, and Honeypot anti-spam verification.
  - Job Application Form: Resume upload validation (PDF only, < 10MB), candidate data payload sanitization.
  - XSS Protection: HTML entity escaping on all user-submitted text inputs.

### 3.12 Admin Workstation Testing
- **Scope**:
  - `DataTable<T>` component: Multi-column sorting, debounced search (300ms debounce), status facet filter pills, pagination state management, and row selection docks.
  - `CrudSheet`: Drawer open/close transitions, dirty form state tracking with discard confirmation, validation error tooltips.
  - `ConfirmDialog`: 2-step confirmation modal on all destructive actions (delete, restore snapshot).
  - Global `CMD+K` Command Palette: Keyboard shortcut triggers, fuzzy searching, keyboard arrow selection, Escape dismissal.

### 3.13 End-to-End (E2E) Automation Testing
- **Scope**:
  - Realistic multi-app synthetic scenarios executing in parallel against live services.
  - Example: An Editor logs into `apps/admin`, creates a new Case Study, publishes it; Playwright switches context to `apps/web`, verifies immediate appearance on `/case-studies`, tests user lead submission, and validates receipt in `apps/admin/system/inbox`.

### 3.14 Accessibility (A11y) Testing
- **Scope**:
  - Full automated Axe audit in Playwright runs on all 35 public pages and 38 admin routes.
  - Zero critical or serious WCAG 2.1 AA violations permitted.
  - Keyboard navigation: All interactive buttons, modals, dropdowns, and drawers accessible via `Tab`, `Enter`, `Space`, `Esc`. Focus trapped correctly in open modals.
  - Contrast ratios: Minimum 4.5:1 for normal text and 3:1 for large display headlines.

### 3.15 Performance & SLA Testing
- **Scope**:
  - **Frontend Core Web Vitals**:
    - Largest Contentful Paint (LCP) ≤ 2.0s
    - First Input Delay (FID) / Interaction to Next Paint (INP) ≤ 100ms
    - Cumulative Layout Shift (CLS) ≤ 0.05
    - First Load Shared JS ≤ 100 kB
  - **Backend API Throughput & Latency**:
    - Under baseline load (500 concurrent users): p95 latency ≤ 80ms, error rate 0.00%.
    - Under peak stress (5,000 requests/sec via k6): p95 latency ≤ 250ms, error rate ≤ 0.01%.

### 3.16 Security & Hardening Testing
- **Scope**:
  - Injection attacks: SQL Injection, NoSQL Injection, OS Command Injection.
  - Cross-Site Scripting (XSS): Stored, Reflected, and DOM-based.
  - Broken Object Level Authorization (BOLA/IDOR): Users attempting to access other users' drafts or private records by guessing UUIDs.
  - Rate Limiting: 100 requests per minute per IP on public APIs; 5 attempts per 15 minutes on `/auth/login`.

### 3.17 Regression Testing Strategy
- **Scope**:
  - Fast smoke test suite (60 seconds) executed on every pull request.
  - Full regression test suite (API, E2E, Visual Diffs) executed before promoting release candidates to Production.
  - Synthetic health monitors constantly pinging production `/api/v1/health/liveness` and `/api/v1/health/readiness`.

---

## 4. Test Cases for Critical Enterprise Flows

```
+----------------------------------------------------------------------------------------------------+
|                                    CRITICAL FLOW TEST SUITE                                        |
+----------------------------------------------------------------------------------------------------+
| 01. Login & MFA        05. Edit Page (Builder)   09. Change Branding     13. Contact Submission    |
| 02. Token Refresh      06. Publish Page          10. Change Navigation   14. Job Application       |
| 03. RBAC Enforcement   07. Restore Revision      11. Create Blog         15. SEO Update            |
| 04. Create Page        08. Upload Media (DAM)    12. Publish Blog        16. Admin Audit Log       |
+----------------------------------------------------------------------------------------------------+
```

---

### TC-FLOW-001: IAM Login & Authentication Challenge
- **Components**: `apps/admin`, `apps/api`, `packages/database`
- **Objective**: Verify secure authentication, token generation, session initialization, and invalid login handling.
- **Preconditions**: User `elena.rostova@gypsym.com` exists with role `ADMIN`, password `SuperSecurePass123!`.
- **Test Steps**:
  1. POST `/api/v1/auth/login` with email and password.
  2. Attempt login with incorrect password `WrongPassword999!`.
  3. Attempt 5 consecutive failed logins within 60 seconds.
- **Expected Results & Assertions**:
  - On valid credentials:
    - HTTP 200 OK.
    - Response body contains JWT `accessToken` (valid for 15m), `user` object with role `ADMIN`.
    - HTTP-only Secure cookie `refreshToken` set (SameSite=Strict, Path=/api/v1/auth/refresh).
  - On invalid credentials:
    - HTTP 401 Unauthorized with RFC 7807 message: `"Invalid credentials provided"`.
  - On 6th attempt:
    - HTTP 429 Too Many Requests: `"Authentication rate limit exceeded. Account temporarily throttled."`

---

### TC-FLOW-002: Refresh Token Rotation & Replay Attack Defense
- **Components**: `apps/api`, `packages/database`
- **Objective**: Verify that refresh tokens are single-use, issue new access/refresh pairs, and detect token theft.
- **Preconditions**: Active session exists for `marcus.vance@gypsym.com` with `refreshToken-A`.
- **Test Steps**:
  1. POST `/api/v1/auth/refresh` using `refreshToken-A`.
  2. Verify receipt of new `refreshToken-B` and `accessToken-2`.
  3. Attempt to use old `refreshToken-A` a second time (simulating adversary replaying stolen token).
- **Expected Results & Assertions**:
  - Step 1: HTTP 200 OK. `refreshToken-B` issued. Database marks `refreshToken-A` as consumed.
  - Step 3: HTTP 401 Unauthorized. API detects reused revoked token.
  - **Security Reaction**: All active refresh tokens for Marcus Vance are immediately revoked in PostgreSQL. Audit ledger logs `SECURITY_ALERT: REFRESH_TOKEN_REPLAY_DETECTED`.

---

### TC-FLOW-003: RBAC Multi-Tier Authorization Enforcement
- **Components**: `apps/admin`, `apps/api`
- **Objective**: Verify that non-privileged roles cannot perform restricted actions, both at UI level and API gateway level.
- **Preconditions**: Users with roles `SUPER_ADMIN`, `ADMIN`, `EDITOR`, `AUTHOR`, `VIEWER` exist.
- **Test Steps**:
  1. Login as `VIEWER`. Request GET `/api/v1/users` and DELETE `/api/v1/pages/pg-1`.
  2. Login as `AUTHOR`. Request POST `/api/v1/pages` (own draft) vs DELETE `/api/v1/system/settings`.
  3. Login as `SUPER_ADMIN`. Request DELETE `/api/v1/pages/pg-1`.
- **Expected Results & Assertions**:
  - `VIEWER` calling DELETE `/api/v1/pages/pg-1` receives HTTP 403 Forbidden with payload `{"error": "Forbidden", "message": "Requires permission: pages:delete"}`. UI hides all delete buttons.
  - `AUTHOR` creating a page succeeds (HTTP 201). `AUTHOR` modifying system settings receives HTTP 403 Forbidden.
  - `SUPER_ADMIN` calling DELETE receives HTTP 200/204, audit ledger logs action.

---

### TC-FLOW-004: Create Dynamic Page & Validate Draft State
- **Components**: `apps/admin`, `apps/api`, `packages/database`
- **Objective**: Verify creation of a new page with default sections in `DRAFT` status.
- **Preconditions**: Authenticated as `EDITOR`.
- **Test Steps**:
  1. Open `/pages` in `apps/admin`.
  2. Click `+ New Page`. Fill title: `"Autonomous Sovereign Cloud"`, slug: `"/solutions/sovereign-cloud"`.
  3. Submit creation form.
- **Expected Results & Assertions**:
  - POST `/api/v1/pages` returns HTTP 201 Created.
  - Record created in PostgreSQL with `status: 'DRAFT'`, `version: 1`.
  - Public website `apps/web` navigating to `/solutions/sovereign-cloud` returns HTTP 404 (draft pages are never publicly visible).
  - Admin data table updates dynamically without requiring full page reload.

---

### TC-FLOW-005: Edit Page via 3-Pane Page Builder Canvas
- **Components**: `apps/admin`, `apps/api`, `packages/database`
- **Objective**: Verify drag-and-drop section reordering, property inspector updates, and viewport responsiveness.
- **Preconditions**: Page `pg-1` exists with 4 sections.
- **Test Steps**:
  1. Open `/pages/pg-1/builder`.
  2. Reorder Section 2 (Logo Cloud) above Section 1 (Hero) via the outliner controls.
  3. Click Section 1. In the right Inspector, change Headline to `"Zero-Downtime Sovereign Infrastructure"`.
  4. Click `+ Add Section` from the catalog and choose `FEATURE_GRID`.
  5. Toggle viewport switcher: `Desktop` (100%) ➔ `Tablet` (768px) ➔ `Mobile` (375px).
- **Expected Results & Assertions**:
  - Live canvas updates reactively.
  - Auto-save indicator reflects `"Saved to draft"`.
  - PUT `/api/v1/pages/pg-1/sections` sends updated section array with correct `orderIndex` (0, 1, 2, 3).
  - Canvas viewport container resizes smoothly without horizontal scroll or layout overflow.

---

### TC-FLOW-006: Publish Page & Verify Edge Invalidation
- **Components**: `apps/admin`, `apps/api`, `apps/web`
- **Objective**: Verify publishing workflow, revision snapshot persistence, and instantaneous public cache revalidation.
- **Preconditions**: Page `pg-1` has pending draft updates.
- **Test Steps**:
  1. In Page Builder, click `Publish Page`.
  2. Confirm publication modal dialog.
  3. Send GET request to public website `http://localhost:3000/`.
- **Expected Results & Assertions**:
  - POST `/api/v1/pages/pg-1/publish` returns HTTP 200 OK.
  - Database status updates to `'PUBLISHED'`.
  - A new `PageRevision` row (`v1.4`) is inserted into PostgreSQL with a full JSON snapshot of the page schema.
  - API triggers Next.js on-demand revalidation (`revalidatePath('/')`).
  - Public website immediately displays updated headline `"Zero-Downtime Sovereign Infrastructure"`.

---

### TC-FLOW-007: Point-in-Time Snapshot Restore & Rollback
- **Components**: `apps/admin`, `apps/api`, `packages/database`, `apps/web`
- **Objective**: Verify historical revision comparisons and 1-click snapshot restore with zero downtime.
- **Preconditions**: Page `pg-1` has revisions `v1.0`, `v1.1`, `v1.2`, `v1.3`. Active production is `v1.3`.
- **Test Steps**:
  1. Open `/pages/pg-1/revisions`.
  2. Select `v1.1` from snapshot list.
  3. Verify side-by-side visual diff inspector highlights modifications between `v1.1` and `v1.3`.
  4. Click `Restore This Snapshot`. Confirm prompt.
- **Expected Results & Assertions**:
  - POST `/api/v1/pages/pg-1/revisions/rev-1/restore` returns HTTP 200 OK.
  - New revision `v1.4 (Rolled back to v1.1)` is created. Active content reverts to snapshot properties.
  - Audit log records `PAGE_ROLLBACK` with actor ID and timestamp.
  - Public website updates immediately upon reload.

---

### TC-FLOW-008: Media Asset Upload, Virus Scan & Storage Pipeline
- **Components**: `apps/admin`, `apps/api`, Media Storage
- **Objective**: Verify media asset ingestion, MIME validation, thumbnail generation, and metadata extraction.
- **Preconditions**: Authenticated as `EDITOR`.
- **Test Steps**:
  1. Open `/media` DAM library.
  2. Drag and drop `architecture-mesh.png` (PNG, 3.4 MB, 2400x1600).
  3. Attempt to upload `exploit.php` (renamed as `exploit.php.png` with application/x-php payload).
- **Expected Results & Assertions**:
  - Valid image:
    - HTTP 201 Created. Asset stored with unique UUID filename.
    - Responsive WebP and AVIF variants generated.
    - Metadata inspector sheet renders dimensions `2400x1600`, file size `3.4 MB`, and provides 1-click URL copy.
  - Malicious image:
    - HTTP 400 Bad Request / 422 Unprocessable Entity.
    - Deep buffer magic-byte inspection identifies executable PHP script.
    - File rejected, zero bytes written to storage, security warning logged.

---

### TC-FLOW-009: Change Brand Design Tokens & Live Preview Reflection
- **Components**: `apps/admin`, `apps/api`, `apps/web`
- **Objective**: Verify branding palette customization and live CSS variable emission.
- **Preconditions**: Authenticated as `ADMIN`.
- **Test Steps**:
  1. Navigate to `/site/branding`.
  2. Update Primary Brand Color from `#2563EB` to `#3B82F6` and Font Family to `"Outfit, sans-serif"`.
  3. Click `Save Brand Tokens`.
  4. Inspect public website `/` styling.
- **Expected Results & Assertions**:
  - PUT `/api/v1/site/branding` returns HTTP 200 OK.
  - Database table `BrandSettings` updated.
  - Public site root CSS variables `--primary` and `--font-sans` revalidate dynamically.
  - Typography renders in Outfit across all headings.

---

### TC-FLOW-010: Update Global Navigation Tree & Mega-Menu Topology
- **Components**: `apps/admin`, `apps/api`, `apps/web`
- **Objective**: Verify navigation hierarchy reordering, mega-menu link additions, and header reflection.
- **Preconditions**: Navigation has 6 root links: Services, Solutions, Industries, Technology, Case Studies, Insights.
- **Test Steps**:
  1. Open `/site/navigation`.
  2. Add new header item: Label: `"Trust & Alliances"`, Href: `"/trust/certifications"`.
  3. Reorder `"Trust & Alliances"` before `"Case Studies"`.
  4. Save navigation configuration.
- **Expected Results & Assertions**:
  - PUT `/api/v1/site/navigation` returns HTTP 200 OK.
  - Navigation cache invalidated.
  - Public site desktop sticky navbar displays `"Trust & Alliances"` in designated position.
  - Mobile slide-out drawer reflects the updated links in matching sequence.

---

### TC-FLOW-011: Create Editorial Whitepaper with Rich Content
- **Components**: `apps/admin`, `apps/api`, `packages/database`
- **Objective**: Verify technical blog creation with syntax-highlighted code snippets, categories, tags, and reading time estimation.
- **Preconditions**: Category `"Distributed Systems"` and Tag `"eBPF"` exist.
- **Test Steps**:
  1. Open `/editorial/blog`. Click `+ New Article`.
  2. Enter title: `"Kernel-Bypassing Telemetry with eBPF at 100Gbps"`.
  3. Assign category, author, and tags. Fill 1,500-word body with markdown code blocks.
  4. Save article.
- **Expected Results & Assertions**:
  - POST `/api/v1/blogs` returns HTTP 201 Created.
  - Word count calculated; `readingTime: '6 min'` computed automatically.
  - Markdown parsed safely without rendering unsanitized scripts.

---

### TC-FLOW-012: Publish Whitepaper & Trigger Social Metadata Preview
- **Components**: `apps/admin`, `apps/api`, `apps/web`
- **Objective**: Verify whitepaper publication, OpenGraph card generation, and Schema.org `TechArticle` structured data.
- **Preconditions**: Draft blog article from TC-FLOW-011 exists.
- **Test Steps**:
  1. Change status to `PUBLISHED` and save.
  2. Query public route `http://localhost:3000/blog/kernel-bypassing-telemetry-ebpf`.
  3. Validate HTML `<meta>` tags and `<script type="application/ld+json">`.
- **Expected Results & Assertions**:
  - HTTP 200 OK with SSG prerendering.
  - `<meta property="og:title" content="Kernel-Bypassing Telemetry with eBPF at 100Gbps">`.
  - JSON-LD conforms to `TechArticle` specification: valid `headline`, `author`, `publisher`, `datePublished`.

---

### TC-FLOW-013: Public Contact / Executive Briefing Submission
- **Components**: `apps/web`, `apps/api`, `apps/admin`
- **Objective**: Verify multi-step lead qualification, spam rejection, database insertion, and admin inbox notification.
- **Preconditions**: User visits `http://localhost:3000/contact`.
- **Test Steps**:
  1. Step 1: Select Interest Area `"Private Cloud Infrastructure"`.
  2. Step 2: Fill Name: `"David Sterling"`, Email: `"d.sterling@vanguard.com"`, Company: `"Vanguard Institutional"`.
  3. Step 3: Scope: `"Zero-downtime migration of clearing cluster"`, Budget: `"$1M - $5M"`, Timeline: `"Q4 2026"`.
  4. Leave hidden honeypot field empty and click `Submit Briefing Request`.
  5. Repeat submission with honeypot field filled (bot simulation).
- **Expected Results & Assertions**:
  - Real submission:
    - POST `/api/v1/contact` returns HTTP 201 Created.
    - Confirmation screen renders in UI.
    - Lead row appears in `apps/admin/system/inbox` with status `NEW`.
    - Notification indicator appears in admin top bar.
  - Bot submission:
    - HTTP 400 Bad Request or silent drop (HTTP 200 without DB write), avoiding spam pollution.

---

### TC-FLOW-014: Candidate Job Application & Resume Processing
- **Components**: `apps/web`, `apps/api`, `apps/admin`
- **Objective**: Verify career requisition display, candidate submission with PDF attachment, and ATS desk triage.
- **Preconditions**: Requisition `job-1` (`Principal Distributed Systems Engineer`) is open.
- **Test Steps**:
  1. Open `/careers/principal-distributed-systems-engineer`.
  2. Complete application form: Name, Email, LinkedIn, GitHub URL.
  3. Attach `resume.pdf` (PDF, 1.8 MB).
  4. Submit application.
- **Expected Results & Assertions**:
  - POST `/api/v1/careers/jobs/job-1/apply` returns HTTP 201 Created.
  - Resume securely uploaded to private bucket with signed URL access only.
  - Application displays in `apps/admin/content/jobs` under candidate desk.

---

### TC-FLOW-015: Global SEO Defaults Update & SERP Simulator Sync
- **Components**: `apps/admin`, `apps/api`, `apps/web`
- **Objective**: Verify search engine metadata defaults, live SERP simulator updates, and `robots.txt` emission.
- **Preconditions**: Authenticated as `ADMIN`.
- **Test Steps**:
  1. Navigate to `/site/seo`.
  2. Update Default Title Template to `"%s | Gypsym Technology Enterprise"`.
  3. Update Default Meta Description.
  4. Add custom Disallow directive to `robots.txt` editor: `Disallow: /internal-audit/`.
  5. Save SEO Configuration.
- **Expected Results & Assertions**:
  - PUT `/api/v1/site/seo` returns HTTP 200 OK.
  - Live SERP snippet updates in realtime showing headline and snippet truncation indicators.
  - Request to `http://localhost:3000/robots.txt` outputs updated directives accurately.

---

### TC-FLOW-016: Immutable Audit Ledger & Structured Diff Inspection
- **Components**: `apps/admin`, `apps/api`, `packages/database`
- **Objective**: Verify that all mutating admin operations create immutable, timestamped audit records with JSON diffs.
- **Preconditions**: User `elena.rostova@gypsym.com` executes a role update on another user.
- **Test Steps**:
  1. In `/system/users`, change user role from `AUTHOR` to `EDITOR`.
  2. Open `/system/audit`.
  3. Find top audit entry and click `View Diff`.
- **Expected Results & Assertions**:
  - An immutable row exists in `AuditLog` table.
  - Actor: `Elena Rostova`, IP: `192.168.1.100`, Resource: `User: usr-4`, Action: `UPDATE_ROLE`.
  - Slide-out sheet renders structured JSON diff:
    ```json
    {
      "before": { "role": "AUTHOR" },
      "after": { "role": "EDITOR" }
    }
    ```
  - Audit log table does NOT expose edit or delete buttons to ANY role (including `SUPER_ADMIN`).

---

## 5. Edge Cases & Critical Failure Scenarios

| Failure Category | Trigger Scenario | Expected System Defense & Recovery | Test Method |
| :--- | :--- | :--- | :--- |
| **Concurrent Mutation** | Two editors simultaneously save edits to the same page (`pg-1`). | **Optimistic Concurrency Control**: Entity includes `version` column. Second save encounters version mismatch, returns HTTP 409 Conflict with `"Document was modified by another session. Please merge changes."` | Concurrent k6 / Playwright requests. |
| **Broken Image CDN** | DAM image file deleted from storage while referenced in active page section. | **Graceful Degradation**: Next.js `<Image>` fallback renders styled neutral placeholder with broken asset alert in admin inspector. No 500 crashes. | Mock 404 on asset endpoint. |
| **Malformed JSON Section** | Direct database insertion of invalid section block payload missing `type` or `headline`. | **Safe Deserialization**: Page Builder and Public Renderer wrap section renderers in React Error Boundaries. Corrupted section isolated with console warning; remaining 18 sections render unhindered. | Inject bad JSON into DB test container. |
| **Database Pool Exhaustion** | 5,000 burst queries exhaust PostgreSQL connection pool. | **Queueing & Circuit Breaking**: Prisma connection pool timeout handled gracefully. API returns HTTP 503 Service Unavailable with `Retry-After: 5` header; does not crash process. | k6 burst ramp-up test. |
| **Session Revocation Race** | User deleted or role demoted while active JWT access token still has 12 minutes validity. | **Token Blacklisting / Short-Lived Tokens**: Critical mutating endpoints re-verify active user status in database/Redis cache before executing destructive actions. | Integration test demoting role mid-session. |
| **XSS Payload Injection** | User enters `<script>alert(document.cookie)</script>` or `javascript:void(0)` in CTA links or rich text. | **Context-Aware Sanitization**: React escapes text by default; sanitize-html strips forbidden tags/schemes from markdown. Links strictly validated for `http/https` protocols. | Automated OWASP ZAP / XSS suite. |
| **Network Timeout in Builder** | Editor clicks "Publish" during transient network disconnect. | **Idempotent Retry & UI Lock**: Submit button shows loading spinner with disabled state preventing double-submit. Re-try logic uses idempotent keys. | Chrome DevTools network throttling / offline. |

---

## 6. Minimum Quality Gates for Production Deployment

No release candidate shall be promoted to production without satisfying 100% of the following automated gates:

```
+----------------------------------------------------------------------------------------------------+
|                                    CI / CD QUALITY GATES                                           |
+----------------------------------------------------------------------------------------------------+
| [GATE 1] Typecheck & Lint    -> 0 Errors (tsc strict mode, ESLint clean)                           |
| [GATE 2] Unit & Component    -> >= 90% logic coverage, 100% auth & utility coverage                |
| [GATE 3] API Contract        -> 100% schema match, 0 unhandled exceptions                          |
| [GATE 4] End-to-End Tests    -> All 16 critical flows pass across Chromium, Firefox, WebKit       |
| [GATE 5] Accessibility (A11y)-> 0 Critical or Serious axe-core violations (WCAG 2.1 AA)            |
| [GATE 6] Security Scanning   -> 0 Critical/High CVEs (Snyk), 0 leaked secrets (Trivy/GitGuardian) |
| [GATE 7] Core Web Vitals     -> Lighthouse Performance >= 95, LCP < 2.0s, CLS < 0.05               |
| [GATE 8] API Load SLA        -> p95 latency < 120ms under 2,000 req/s with 0.00% error rate        |
+----------------------------------------------------------------------------------------------------+
```

### 6.1 Enforcement Protocol
1. **Pull Request Stage**: Gates 1, 2, 3, and 6 run automatically on every branch commit. Merge is blocked if any check fails.
2. **Staging Stage**: Gates 4, 5, 7, and 8 run automatically upon merge to `develop` against isolated staging environments.
3. **Production Deployment**: Blue/Green deployment with `/api/v1/health/readiness` health check probes. Automatic traffic rollback is triggered if 5xx HTTP error rates exceed 0.05% within 5 minutes of release.
