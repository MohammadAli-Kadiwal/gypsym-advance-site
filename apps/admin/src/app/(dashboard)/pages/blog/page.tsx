'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AdminContentContainer } from '@/components/layout/admin-page';
import { BlogStudio } from '../_components/blog-studio';

export default function BlogPageStudio() {
  const router = useRouter();

  return (
    <AdminContentContainer variant="wide" className="pb-24">
      <BlogStudio onBack={() => router.push('/pages')} />
    </AdminContentContainer>
  );
}
