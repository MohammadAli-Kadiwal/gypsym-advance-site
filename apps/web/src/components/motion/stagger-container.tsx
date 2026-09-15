'use client';

import * as React from 'react';
import {
  RevealDirection,
  MotionIntensity,
  MOTION_TOKENS,
} from './motion-tokens';
import { ScrollReveal, ScrollRevealProps } from './scroll-reveal';

interface StaggerContextValue {
  staggerInterval: number;
  maxCeiling: number;
  baseDirection: RevealDirection;
  intensity: MotionIntensity;
  once: boolean;
  repeat: boolean;
  duration?: number;
}

const StaggerContext = React.createContext<StaggerContextValue>({
  staggerInterval: MOTION_TOKENS.stagger.small,
  maxCeiling: MOTION_TOKENS.stagger.maxCeiling,
  baseDirection: 'up',
  intensity: 'subtle',
  once: true,
  repeat: false,
});

export interface StaggerContainerProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  preset?: 'fast' | 'normal' | 'slow';
  staggerInterval?: number;
  maxCeiling?: number;
  direction?: RevealDirection;
  intensity?: MotionIntensity;
  once?: boolean;
  repeat?: boolean;
  duration?: number;
  as?: React.ElementType;
  className?: string;
}

export function StaggerContainer({
  children,
  preset,
  staggerInterval: explicitInterval,
  maxCeiling = MOTION_TOKENS.stagger.maxCeiling,
  direction = 'up',
  intensity = 'subtle',
  once = true,
  repeat = false,
  duration,
  as: Component = 'div',
  className = '',
  ...rest
}: StaggerContainerProps) {
  const Comp = Component as any;
  const computedInterval =
    explicitInterval !== undefined
      ? explicitInterval
      : preset === 'fast'
      ? MOTION_TOKENS.stagger.small
      : preset === 'slow'
      ? MOTION_TOKENS.stagger.large
      : MOTION_TOKENS.stagger.medium;

  const contextValue = React.useMemo<StaggerContextValue>(
    () => ({
      staggerInterval: computedInterval,
      maxCeiling,
      baseDirection: direction,
      intensity,
      once,
      repeat,
      duration,
    }),
    [computedInterval, maxCeiling, direction, intensity, once, repeat, duration],
  );

  return (
    <StaggerContext.Provider value={contextValue}>
      <Comp className={className} {...rest}>
        {children}
      </Comp>
    </StaggerContext.Provider>
  );
}

export interface RevealItemProps extends Omit<ScrollRevealProps, 'delay'> {
  index?: number;
  delayOffset?: number;
}

export function RevealItem({
  children,
  index = 0,
  delayOffset = 0,
  direction,
  intensity,
  once,
  repeat,
  duration,
  className = '',
  ...rest
}: RevealItemProps) {
  const ctx = React.useContext(StaggerContext);

  // Compute staggered delay with strict maximum ceiling cap (Rule 13)
  const calculatedDelay = Math.min(index * ctx.staggerInterval, ctx.maxCeiling) + delayOffset;

  return (
    <ScrollReveal
      direction={direction || ctx.baseDirection}
      intensity={intensity || ctx.intensity}
      duration={duration || ctx.duration}
      delay={calculatedDelay}
      once={once !== undefined ? once : ctx.once}
      repeat={repeat !== undefined ? repeat : ctx.repeat}
      className={className}
      {...rest}
    >
      {children}
    </ScrollReveal>
  );
}
