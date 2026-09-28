'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { HomeSectionsStudio } from '../_components/home-sections-studio';

export default function HomePageStudio() {
  const router = useRouter();

  return (
    <div className="w-full pb-24">
      <HomeSectionsStudio onBack={() => router.push('/pages')} />
    </div>
  );
}
