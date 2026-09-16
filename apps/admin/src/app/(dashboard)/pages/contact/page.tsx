'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ContactStudio } from '../_components/contact-studio';

export default function ContactPageStudio() {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto py-2">
      <ContactStudio onBack={() => router.push('/pages')} />
    </div>
  );
}
