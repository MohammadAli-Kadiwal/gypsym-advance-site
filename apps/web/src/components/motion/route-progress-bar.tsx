'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = React.useState<boolean>(false);
  const [progress, setProgress] = React.useState<number>(0);

  // Trigger brief top progress line on route or searchParam change
  React.useEffect(() => {
    setIsNavigating(true);
    setProgress(30);

    const midTimer = setTimeout(() => {
      setProgress(85);
    }, 120);

    const endTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 200);
    }, 280);

    return () => {
      clearTimeout(midTimer);
      clearTimeout(endTimer);
    };
  }, [pathname, searchParams]);

  if (!isNavigating && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[99998] h-[2.5px] pointer-events-none"
    >
      <div
        className="h-full bg-[#d9127b] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: '0 0 8px var(--brand-accent, #d9127b)',
        }}
      />
    </div>
  );
}
