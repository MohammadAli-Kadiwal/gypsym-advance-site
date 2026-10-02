'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AdminContentContainer } from '@/components/layout/admin-page';
import { PortfolioStudio } from '../_components/portfolio-studio';

export default function PortfolioPageStudio() {
  const router = useRouter();

  return (
    <AdminContentContainer variant="wide" className="pb-24">
      <PortfolioStudio onBack={() => router.push('/pages')} />
    </AdminContentContainer>
  );
}

