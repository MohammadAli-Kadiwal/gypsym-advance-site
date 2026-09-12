import * as React from 'react';
import { PageSectionDto } from '@/lib/cms-types';
import { getSectionComponent } from './section-registry';

interface SectionRendererProps {
  sections?: PageSectionDto[];
}

/**
 * Reusable Section Renderer.
 * Determines ordering, visibility, and delegates rendering to registered section components.
 * Zero hardcoded page structure. Zero fallback sections.
 */
export function SectionRenderer({ sections }: SectionRendererProps) {
  if (!sections || sections.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="inline-flex items-center space-x-2 rounded-md border border-border bg-muted/30 px-4 py-2 text-xs font-mono text-muted-foreground">
          <span>Required CMS sections unavailable for this page.</span>
        </div>
      </div>
    );
  }

  // Filter active sections and sort strictly by displayOrder
  const activeSections = sections
    .filter((s) => s.isActive !== false)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  if (activeSections.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="inline-flex items-center space-x-2 rounded-md border border-border bg-muted/30 px-4 py-2 text-xs font-mono text-muted-foreground">
          <span>No active CMS sections found for this page.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {activeSections.map((section) => {
        const Component = getSectionComponent(section.componentType, section.sectionIdentifier);
        return (
          <section
            key={section.id}
            id={section.sectionIdentifier}
            data-section-type={section.componentType}
            data-section-order={section.displayOrder}
            className="w-full relative"
          >
            <Component section={section} />
          </section>
        );
      })}
    </div>
  );
}
