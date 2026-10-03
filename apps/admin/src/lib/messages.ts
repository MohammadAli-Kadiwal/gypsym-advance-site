/**
 * Centralized Application Messages Dictionary
 * ===========================================
 * All user-facing error, warning, and success messages are defined here in one file
 * so they can easily be edited, audited, customized, or localized in the future.
 */

export const ERROR_MESSAGES = {
  // ── Generic & System Errors ──
  UNEXPECTED: 'An unexpected error occurred.',
  OPERATION_FAILED: 'Unable to complete the operation.',
  NETWORK_ERROR: 'Unable to connect to the backend server. Please verify your connection.',
  REQUEST_TIMEOUT: 'The request took too long to complete. Please try again.',
  DATABASE_CONSTRAINT: 'The operation could not be completed due to a database constraint. Please check your inputs.',

  // ── HTTP Status Specific ──
  BAD_REQUEST: 'Invalid request. Please verify the submitted data.',
  UNAUTHORIZED: 'Your session has expired or is invalid. Please sign in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  CONFLICT: 'A conflict occurred. This record or unique field already exists.',
  VALIDATION_FAILED: 'Validation failed. Please verify the form inputs.',
  RATE_LIMIT_EXCEEDED: (seconds?: number) =>
    seconds
      ? `Too many requests. Please wait ${seconds} seconds before trying again.`
      : 'Too many requests. Please wait a moment before trying again.',
  SERVER_ERROR: 'A server error occurred. Please try again later.',

  // ── Pages & Country Studio ──
  PAGES: {
    COUNTRY_NAME_REQUIRED: 'Country name is required.',
    PAGE_CREATE_FAILED: 'Failed to create country page',
    PAGE_SAVE_FAILED: 'Failed to save country page settings',
    PAGE_DELETE_FAILED: 'Failed to delete country page.',
    PAGE_STATUS_FAILED: 'Failed to update status.',
    PAGE_SYNC_FAILED: 'Unable to synchronize pages from database.',
    SECTION_DELETE_FAILED: 'Failed to delete section.',
    SECTION_SAVE_FAILED: 'Failed to save page sections.',
  },

  // ── Partners ──
  PARTNERS: {
    NAME_REQUIRED: 'Partner name is required.',
    CREATE_FAILED: 'Could not create partner. Please check inputs.',
    UPDATE_FAILED: 'Could not update partner.',
    DELETE_FAILED: 'Failed to delete partner.',
  },

  // ── Editorial & Blog ──
  BLOG: {
    CATEGORY_CREATE_FAILED: 'Failed to create category.',
    CATEGORY_SAVE_FAILED: 'Failed to save blog category.',
    CATEGORY_DELETE_FAILED: 'Failed to delete category.',
    CATEGORY_LOAD_FAILED: 'Failed to load blog categories.',
    CATEGORY_HAS_ARTICLES: (name: string, count: number) =>
      `Cannot delete "${name}" because it has ${count} assigned article(s). Please reassign them first.`,
    POST_LOAD_FAILED: 'Failed to load blog posts.',
    POST_SAVE_FAILED: 'Failed to save blog article.',
    POST_DELETE_FAILED: 'Failed to delete blog article.',
  },

  // ── Users & Team ──
  USERS: {
    EMAIL_REQUIRED: 'Valid enterprise email is required.',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
    PASSWORDS_DO_NOT_MATCH: 'Passwords do not match.',
    SUPER_ADMIN_EXISTS: 'A Super Administrator account already exists. Only one Super Admin is permitted.',
    CANNOT_DELETE_SELF: 'You cannot delete your own active administrator account.',
    CREATE_FAILED: 'Failed to create user.',
    UPDATE_FAILED: 'Failed to update user.',
    DELETE_FAILED: 'Failed to delete user.',
    LOAD_FAILED: 'Failed to load user records.',
  },

  // ── Site Settings, Security & Integrations ──
  SETTINGS: {
    BRANDING_SAVE_FAILED: 'Unable to save branding settings to backend.',
    SMTP_LOAD_FAILED: 'Unable to load SMTP configuration.',
    SMTP_SAVE_FAILED: 'Unable to save SMTP settings. Check input parameters.',
    EMAIL_TEST_FAILED: 'Unable to send test email. Check your SMTP configuration.',
    SECURITY_LOAD_FAILED: 'Could not load security settings.',
    SECURITY_UPDATE_FAILED: 'Failed to update security settings.',
    SECURITY_UNBLOCK_FAILED: (ip: string) => `Failed to unblock ${ip}.`,
    SCRIPTS_LOAD_FAILED: 'Could not load current script settings. Using standard defaults.',
    SCRIPTS_UPDATE_FAILED: 'Failed to update script settings.',
    RECAPTCHA_LOAD_FAILED: 'Unable to load reCAPTCHA configuration.',
    RECAPTCHA_SAVE_FAILED: 'Failed to save reCAPTCHA settings.',
    NAVIGATION_LOAD_FAILED: 'Unable to load navigation configuration.',
    NAVIGATION_UPDATE_FAILED: 'Unable to update navigation.',
    SOCIALS_UPDATE_FAILED: 'Failed to update social profiles.',
  },
} as const;

export const WARNING_MESSAGES = {
  UNSAVED_CHANGES: 'You have unsaved changes that will be lost if you leave.',
  SESSION_EXPIRING: 'Your session is about to expire soon. Please save your work.',
  SLOW_NETWORK: 'Slow network response detected. The operation may take longer than usual.',
  REINDEX_WARNING: 'Triggering search re-indexing may temporarily increase server resource usage.',
  DELETE_CONFIRM_GENERIC: 'This action is permanent and cannot be undone.',
} as const;

export const SUCCESS_MESSAGES = {
  // ── Pages ──
  PAGES: {
    COUNTRY_CREATED: (name: string, currency: string, timezone: string) =>
      `Country page for "${name}" created with ${currency} and ${timezone}.`,
    COUNTRY_SAVED: (name: string) => `Country page for "${name}" saved.`,
    PAGE_SAVED: (slug: string) => `Page settings for "/${slug}" saved successfully.`,
    PAGE_CREATED: (title: string) => `Page "${title}" created successfully.`,
    COUNTRY_DELETED: (title?: string) => `Country page for "${title || 'Selected Market'}" deleted.`,
    STATUS_UPDATED: (status: 'PUBLISHED' | 'DRAFT' | string) =>
      `Status updated to ${status === 'PUBLISHED' ? 'Published' : 'Draft'}.`,
  },

  // ── Partners ──
  PARTNERS: {
    CREATED: (name: string) => `Partner "${name}" created successfully.`,
    UPDATED: (name: string) => `Partner "${name}" updated successfully.`,
    DELETED: (name: string) => `Partner "${name}" deleted.`,
  },

  // ── Blog ──
  BLOG: {
    CATEGORY_CREATED: (name: string) => `Category "${name}" created successfully.`,
    CATEGORY_SAVED: (name: string) => `Category "${name}" updated successfully.`,
    CATEGORY_DELETED: (name: string) => `Category "${name}" deleted.`,
    POST_CREATED: (title: string) => `Post "${title}" created successfully.`,
    POST_SAVED: (title: string) => `Post "${title}" updated successfully.`,
    POST_DELETED: 'Post deleted successfully.',
  },

  // ── Users ──
  USERS: {
    CREATED: (email: string) => `User account for ${email} created successfully.`,
    UPDATED: 'User updated successfully.',
    DELETED: (email: string) => `User ${email} has been deactivated and removed.`,
    PASSWORD_RESET: (email: string) => `Password reset for ${email}. All active sessions have been revoked.`,
  },
} as const;

export const MESSAGES = {
  ERRORS: ERROR_MESSAGES,
  WARNINGS: WARNING_MESSAGES,
  SUCCESS: SUCCESS_MESSAGES,
} as const;

export default MESSAGES;
