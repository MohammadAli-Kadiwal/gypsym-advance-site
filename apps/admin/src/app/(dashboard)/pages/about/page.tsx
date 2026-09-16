'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AboutStudio } from '../_components/about-studio';

export default function AboutPageStudio() {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto py-2">
      <AboutStudio onBack={() => router.push('/pages')} />
    </div>
  );
}
