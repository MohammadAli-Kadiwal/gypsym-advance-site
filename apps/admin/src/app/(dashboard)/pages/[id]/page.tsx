'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { UniversalPageStudio } from '../_components/universal-page-studio';

export default function CustomPageStudio() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  return (
    <div className="max-w-7xl mx-auto py-2">
      <UniversalPageStudio pageId={id} onBack={() => router.push('/pages')} />
    </div>
  );
}
