'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AdminContentContainer } from '@/components/layout/admin-page';
import { ContactStudio } from '../_components/contact-studio';

export default function ContactPageStudio() {
  const router = useRouter();

  return (
    <AdminContentContainer variant="wide" className="pb-24">
      <ContactStudio onBack={() => router.push('/pages')} />
    </AdminContentContainer>
  );
}

