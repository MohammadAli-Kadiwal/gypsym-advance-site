'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AdminContentContainer } from '@/components/layout/admin-page';
import { BookStudio } from '../_components/book-studio';

export default function BookPageStudio() {
  const router = useRouter();

  return (
    <AdminContentContainer variant="wide" className="pb-24">
      <BookStudio onBack={() => router.push('/pages')} />
    </AdminContentContainer>
  );
}

