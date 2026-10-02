'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AdminContentContainer } from '@/components/layout/admin-page';
import { HomeSectionsStudio } from '../_components/home-sections-studio';

export default function HomePageStudio() {
  const router = useRouter();

  return (
    <AdminContentContainer variant="wide" className="pb-24">
      <HomeSectionsStudio onBack={() => router.push('/pages')} />
    </AdminContentContainer>
  );
}

