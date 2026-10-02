'use client';

import * as React from 'react';
import { PageSectionDto } from '@/lib/cms-types';
import { RevenueUpliftCalculator } from '@/components/calculator/revenue-calculator';

interface RoiCalculatorSectionProps {
  section: PageSectionDto;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function RoiCalculatorSection({ section: _section }: RoiCalculatorSectionProps) {
  return (
    <section className="w-full py-12 sm:py-16 md:py-20 bg-background">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
        <RevenueUpliftCalculator />
      </div>
    </section>
  );
}
