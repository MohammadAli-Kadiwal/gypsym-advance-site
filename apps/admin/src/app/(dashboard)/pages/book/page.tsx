'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { BookStudio } from '../_components/book-studio';

export default function BookPageStudio() {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto py-2">
      <BookStudio onBack={() => router.push('/pages')} />
    </div>
  );
}
