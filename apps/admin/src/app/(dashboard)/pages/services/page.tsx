'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AdminContentContainer } from '@/components/layout/admin-page';
import { ServicesStudio } from '../_components/services-studio';

export default function ServicesPageStudio() {
  const router = useRouter();

  return (
    <AdminContentContainer variant="wide" className="pb-24">
      <ServicesStudio onBack={() => router.push('/pages')} />
    </AdminContentContainer>
  );
}

