'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AdminContentContainer } from '@/components/layout/admin-page';
import { RoiStudio } from '../_components/roi-studio';

export default function RoiCalculatorPageStudio() {
  const router = useRouter();

  return (
    <AdminContentContainer variant="wide" className="pb-24">
      <RoiStudio onBack={() => router.push('/pages')} />
    </AdminContentContainer>
  );
}

