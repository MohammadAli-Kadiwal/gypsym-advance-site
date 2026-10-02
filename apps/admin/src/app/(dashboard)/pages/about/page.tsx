'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AdminContentContainer } from '@/components/layout/admin-page';
import { AboutStudio } from '../_components/about-studio';

export default function AboutPageStudio() {
  const router = useRouter();

  return (
    <AdminContentContainer variant="wide" className="pb-24">
      <AboutStudio onBack={() => router.push('/pages')} />
    </AdminContentContainer>
  );
}

