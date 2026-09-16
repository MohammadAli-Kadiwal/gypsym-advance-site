'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PortfolioStudio } from '../_components/portfolio-studio';

export default function PortfolioPageStudio() {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto py-2">
      <PortfolioStudio onBack={() => router.push('/pages')} />
    </div>
  );
}
