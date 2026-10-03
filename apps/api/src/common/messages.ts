/**
 * Centralized Backend API Messages & Exceptions Dictionary
 * =======================================================
 * All backend API error messages, conflict explanations, and warnings
 * are defined here in one file so they can easily be updated.
 */

export const API_MESSAGES = {
  // ── Pages & CMS ──
  PAGE_ALREADY_EXISTS: (slug: string) => `A page with slug '/${slug}' already exists.`,
  PAGE_NOT_FOUND: (slug: string) => `Page '${slug}' not found`,
  HOME_SLUG_IMMUTABLE: "Cannot change URL slug of the root 'home' landing page.",
  PAGE_PROTECTED: (slug: string) => `The core system page '/${slug}' is protected and cannot be deleted.`,

  // ── Blog & Categories ──
  CATEGORY_ALREADY_EXISTS: (slug: string) => `A category with route slug "${slug}" already exists.`,
  CATEGORY_NOT_FOUND: (idOrSlug: string) => `Category '${idOrSlug}' not found`,

  // ── Users & Auth ──
  USER_ALREADY_EXISTS: (email: string) => `A user with email ${email} already exists.`,
  USER_NOT_FOUND: 'User account not found',
  INVALID_CREDENTIALS: 'Invalid email or password credentials',
  SESSION_EXPIRED: 'Session expired or revoked',

  // ── Generic ──
  UNAUTHORIZED: 'Authentication required to access this resource',
  FORBIDDEN: 'You do not have permission to perform this action',
  INTERNAL_ERROR: 'An unexpected internal server error occurred',
} as const;

export default API_MESSAGES;
