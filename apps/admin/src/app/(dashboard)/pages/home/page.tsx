'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { HomeSectionsStudio } from '../_components/home-sections-studio';

export default function HomePageStudio() {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto py-2">
      <HomeSectionsStudio onBack={() => router.push('/pages')} />
    </div>
  );
}
