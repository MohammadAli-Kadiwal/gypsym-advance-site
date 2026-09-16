'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ServicesStudio } from '../_components/services-studio';

export default function ServicesPageStudio() {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto py-2">
      <ServicesStudio onBack={() => router.push('/pages')} />
    </div>
  );
}
