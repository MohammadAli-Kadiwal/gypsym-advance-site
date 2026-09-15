import { PageSectionDto } from '@/lib/cms-types';
import { getSectionComponent } from './section-registry';
import { ScrollReveal } from '@/components/motion';

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
    <div className="flex flex-col w-full overflow-x-clip">
      {activeSections.map((section) => {
        const Component = getSectionComponent(section.componentType, section.sectionIdentifier);

        // Section-level animation configuration (Rules 8, 9, 11, 47, 51)
        const animConfig = section.contentPayload?.animation || {};
        const isAnimEnabled = animConfig.enabled !== false;
        const animDirection = animConfig.direction || 'up';
        const animIntensity = animConfig.intensity || 'subtle';
        const animRepeat = Boolean(animConfig.repeat);

        return (
          <section
            key={section.id}
            id={section.sectionIdentifier}
            data-section-type={section.componentType}
            data-section-order={section.displayOrder}
            className="w-full relative overflow-x-clip"
          >
            {isAnimEnabled ? (
              <ScrollReveal
                direction={animDirection}
                intensity={animIntensity}
                repeat={animRepeat}
                once={!animRepeat}
                className="w-full"
              >
                <Component section={section} />
              </ScrollReveal>
            ) : (
              <Component section={section} />
            )}
          </section>
        );
      })}
    </div>
  );
}
