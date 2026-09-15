/**
 * Global Motion Tokens & Configuration
 * Gypsym Technology Design System
 * 
 * Provides unified easing, duration, distance, and stagger presets.
 * Shared across all public sections and components.
 */

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';
export type MotionIntensity = 'subtle' | 'medium' | 'strong';
export type StaggerPreset = 'none' | 'small' | 'medium';

export interface MotionConfig {
  enabled?: boolean;
  direction?: RevealDirection;
  intensity?: MotionIntensity;
  stagger?: StaggerPreset;
  repeat?: boolean; // If true, re-triggers when re-entering viewport from any direction
  delay?: number;
  duration?: number;
}

export const MOTION_TOKENS = {
  // Apple / Stripe / Vercel style premium deceleration curve
  easing: {
    standard: 'cubic-bezier(0.16, 1, 0.3, 1)',
    smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
    entrance: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
  },

  duration: {
    fast: 450,
    normal: 700,
    slow: 950,
  },

  distance: {
    // Desktop distances
    desktop: {
      subtle: 30,
      medium: 45,
      strong: 65,
    },
    // Mobile distances (capped to prevent viewport stretching or horizontal overflow)
    mobile: {
      subtle: 15,
      medium: 22,
      strong: 30,
    },
  },

  stagger: {
    none: 0,
    small: 75,
    medium: 130,
    large: 180,
    maxCeiling: 400, // Strict maximum cap to ensure content is never kept waiting
  },
} as const;
