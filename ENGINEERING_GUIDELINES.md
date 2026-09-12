# Gypsym Technology: Engineering Standards & Architectural Governance
## Document Version: 1.0.0-ENG-RULES
### Lead Engineer & Architectural Directorate

---

## 1. Zero-Tolerance Quality Directives

All engineering contributions across `apps/web`, `apps/admin`, `apps/api`, and `packages/*` must strictly adhere to these 15 core tenets. Violations will be rejected at automated CI linting and code review gates.

1. **TypeScript Strict Mode:** `"strict": true` enforced across all workspace `tsconfig.json` files. `noImplicitAny: true`, `strictNullChecks: true`.
2. **Zero Unnecessary `any`:** `any` is strictly prohibited. Use explicit interfaces, generic parameters, or `unknown` with runtime Zod parsing.
3. **No Duplicated Business Logic:** Business rules live exclusively in domain Services (`apps/api`) or shared utility validators (`packages/shared-types`). Never duplicate validation or transformation across layers.
4. **No Magic Strings or Numbers:** All statuses, event names, component identifiers, roles, and configuration thresholds must be defined as typed constants or TypeScript enums.
5. **No Giant Files or Components:**
   * Backend Services / Repositories: Max 300 lines of code (LOC). Split into focused sub-services or handlers.
   * Frontend Components: Max 250 LOC. Extract UI sub-trees into co-located sub-components.
6. **No Circular Dependencies:** Strictly enforce unidirectional imports:
   * `Presentation` → `Application` → `Domain` ← `Infrastructure`
   * `apps/*` → `packages/*` (never the reverse; packages never depend on apps).
7. **No Direct Database Access from Controllers:** Controllers must never import `PrismaService` or execute SQL queries. All persistence is delegated to Repositories via Services.
8. **No Business Logic in Controllers:** Controllers are thin HTTP adapters responsible only for payload routing, executing DTO validation pipes, checking permission guards, and returning response envelopes.
9. **No Direct API Calls in Random UI Components:** UI components must never call `axios.get(...)` or `fetch(...)` directly. All network communication is centralized in typed feature API clients with query hooks.
10. **No Hardcoded CMS Content or Branding:** Content, copy, logos, colors, navigation menus, and SEO metadata must be driven by API payloads and design tokens.
11. **Composition Over Inheritance:** Utilize dependency injection, functional composition, and React component composition over deep class inheritance hierarchies.
12. **Centralized Error Handling:** All exceptions must be standard domain exceptions caught by the centralized NestJS exception filter.
13. **Structured Logging:** No raw `console.log`. Use structured JSON logging via `Pino` with `correlationId` and `requestId`.
14. **Centralized Axios Configuration:** A single Axios client instance per application (`apps/web`, `apps/admin`) with unified error interceptors and correlation ID propagation.
15. **100% Test Coverage on Core Domain Logic:** Every domain service, permission guard, and data transformation pipeline must be covered by automated unit and integration tests.

---

## 2. Layered Architectural Flow

### 2.1 Backend Request Lifecycle (`apps/api`)

```
[ Incoming HTTP Request ]
       │
       ▼
[ Controller ] ──────────────► Validates DTO via ValidationPipe (Zod / Class-Validator)
       │
       ▼
[ Guards & Policies ] ───────► Verifies JWT signature (JwtAuthGuard) & RBAC claims (PermissionsGuard)
       │
       ▼
[ Application Service ] ─────► Enforces business logic, orchestrates domain state, checks invariants
       │
       ▼
[ Repository ] ──────────────► Encapsulates queries, transactions, and persistence mapping
       │
       ▼
[ Prisma ORM ] ──────────────► Parameterized PostgreSQL execution via connection pool
       │
       ▼
[ Standard Envelope ] ───────► { success: true, data: T, meta?: {...}, requestId, correlationId }
```

### 2.2 Frontend Architecture Flow (`apps/web` & `apps/admin`)

```
[ Next.js Page Route ] ──────► High-level route layout & server-side metadata generation
       │
       ▼
[ Feature Module ] ──────────► Domain container orchestrating data fetching & state
       │
       ▼
[ Presentation Component ] ──► Pure UI view rendering Design System tokens (CVA + Tailwind)
       │
       ▼
[ Typed API Client ] ────────► Centralized Axios instance with retry logic & error handling
```

---

## 3. Monorepo Scaffolding & Execution Roadmap

With all foundational design, architectural, database, API, and UX specifications approved, the implementation phase proceeds in 6 sequential engineering milestones:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        IMPLEMENTATION ROADMAP                          │
└────────────────────────────────────────────────────────────────────────┘

  [ Milestone 1: Monorepo Foundation ]
  • Turborepo root configuration, pnpm workspaces, and build pipelines
  • packages/tsconfig, packages/eslint-config, packages/shared-types
  • packages/database: Prisma schema, migration setup, and seeds
  • packages/ui: Design system tokens, Tailwind config, and Radix primitives

  [ Milestone 2: Core Backend Engine (apps/api) ]
  • NestJS bootstrapping with Fastify/Express adapter, Helmet, CORS
  • Centralized ExceptionFilter, LoggingInterceptor, TransformInterceptor
  • AuthModule, UsersModule, RolesModule, PermissionsModule (RBAC)
  • Dynamic SettingsModule, BrandingModule, NavigationModule

  [ Milestone 3: Content, CMS & DAM Modules (apps/api) ]
  • PagesModule & PageSectionsModule with revision snapshot engine
  • MediaModule with S3 pre-signed upload issuance and Sharp pipeline
  • ServicesModule, SolutionsModule, CaseStudiesModule, BlogModule, JobsModule
  • ContactModule with Turnstile validation, rate limiting & CRM outbox

  [ Milestone 4: Enterprise Admin Portal (apps/admin) ]
  • Next.js App Router shell: Collapsible Sidebar, Header, Command Palette
  • Auth flow: Login, sliding session refresh, TOTP 2FA modal
  • Dynamic Page Builder with drag-and-drop canvas (@dnd-kit)
  • Content registries, DAM media explorer, Brand Token studio, Audit explorer

  [ Milestone 5: Public Experience Engine (apps/web) ]
  • Next.js App Router root layout with dynamic brand theme injection
  • Server Components (RSC) for Homepage, About, Services, Case Studies, Blog
  • Interactive client islands: CMD+K Search, Navigation drawer, Contact wizard
  • SEO automation: Dynamic sitemaps, robots.txt, Schema.org JSON-LD

  [ Milestone 6: Quality, Performance & Verification ]
  • Unit tests (Jest/Vitest) for services, repositories, and UI components
  • End-to-end integration tests (Playwright) for critical user journeys
  • Core Web Vitals audit (LCP < 1.8s, FID < 100ms, CLS < 0.05)
  • Security audit: OWASP Top 10 checklist, CSP headers, rate-limiting stress test
```

---
*End of Engineering Standards & Architectural Governance. Ready for immediate Phase 1 Monorepo Scaffolding.*
