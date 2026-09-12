import * as React from 'react';
import { cn } from '@/lib/utils';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4;
}

export function Heading({ level = 2, className, ...props }: HeadingProps) {
  const styles = {
    1: 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground',
    2: 'text-3xl md:text-4xl font-bold tracking-tight text-foreground',
    3: 'text-2xl md:text-3xl font-semibold tracking-tight text-foreground',
    4: 'text-xl md:text-2xl font-semibold text-foreground',
  };

  const Component = `h${level}` as React.ElementType;

  return <Component className={cn(styles[level], className)} {...props} />;
}
