import { PrismaClient, ComponentType } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding all 12 Home Page sections in PostgreSQL...');

  const homePage = await prisma.page.findFirst({
    where: { slug: 'home', deletedAt: null },
  });

  if (!homePage) {
    console.error('❌ Home page not found!');
    return;
  }

  console.log(`Found Home page ID: ${homePage.id}`);

  const sectionsToUpsert = [
    // 1. Hero Banner (preserve if exists)
    {
      sectionIdentifier: 'hero-banner',
      componentType: ComponentType.HERO,
      displayOrder: 1,
      isActive: true,
      defaultPayload: {
        eyebrow: {
          enabled: false,
          text: 'ENTERPRISE CLOUD CORE & SOVEREIGN AI',
          style: 'pill',
        },
        trustRating: {
          enabled: true,
          rating: 5.0,
          ratingMax: 5.0,
          stars: 5,
          reviewCount: 'hundreds of merchant reviews',
          reviewText: 'Based on hundreds of verified merchant reviews',
          ratingSource: 'Shopify Plus Partner & Verified Reviews',
          badges: [
            { name: 'Shopify Plus', label: 'Shopify Plus Partner' },
            { name: 'Clutch', label: 'Clutch 5.0' },
            { name: 'Fiverr Pro', label: 'Fiverr Pro' },
            { name: 'Top Rated', label: 'Top eCommerce Studio' },
          ],
        },
        headline: {
          segments: [
            { type: 'text', value: 'Shopify ' },
            { type: 'italic', value: 'Studio ' },
            { type: 'text', value: 'for\n' },
            { type: 'highlight', value: 'Brands ' },
            { type: 'text', value: '& Merchants' },
          ],
          hasInlineVideo: true,
          inlineVideoPosition: 4,
        },
        description: {
          enabled: true,
          content:
            'From custom Shopify Plus stores to high-converting eCommerce experiences. Built to convert visitors. Built to scale your revenue.',
          alignment: 'center',
        },
        primaryCta: {
          enabled: true,
          label: 'Scale Your Store',
          url: '/contact',
          icon: 'ArrowUpRight',
          variant: 'primary',
        },
        videoCta: {
          enabled: true,
          label: 'Gypsym Studio Reel',
          videoUrl: 'https://res.cloudinary.com/dorhkx3tj/video/upload/v1779362848/IMG_1122_jgcztz.mov',
          icon: 'Play',
        },
        backgroundMedia: {
          desktopImageUrl:
            'https://res.cloudinary.com/dshotouwu/video/upload/so_0,f_jpg,q_80/v1782707510/gypsym_bg_video_ydv8vg.jpg',
          mobileImageUrl:
            'https://res.cloudinary.com/dshotouwu/video/upload/so_0,f_jpg,q_80/v1782707510/gypsym_bg_video_ydv8vg.jpg',
          videoUrl:
            'https://res.cloudinary.com/dshotouwu/video/upload/v1782707510/gypsym_bg_video_ydv8vg.mp4',
          overlayColor: '#000000',
          overlayOpacity: 0.3,
          focalPoint: 'center',
        },
        clientStrip: {
          enabled: true,
          title: 'The agency behind ..',
          clients: [
            { name: 'Springfree', logo: 'springfree', logoUrl: 'https://cdn.prod.website-files.com/696f172efacb311f86007ec0/6979dd980128708e9ebf0fe1_Feature%20Card%20(3).svg' },
            { name: 'Zoefull', logo: 'zoefull', logoUrl: 'https://cdn.prod.website-files.com/696f172efacb311f86007ec0/6979ddee87f63e9febdd720b_Feature%20Card%20(4).svg' },
            { name: 'Nutradora', logo: 'nutradora', logoUrl: 'https://cdn.prod.website-files.com/696f172efacb311f86007ec0/6979de091db4c0e377f11d7c_Feature%20Card%20(5).svg' },
            { name: 'Mahaekart', logo: 'mahaekart', logoUrl: 'https://cdn.prod.website-files.com/696f172efacb311f86007ec0/6979de698d579838430c261a_Feature%20Card%20(6).svg' },
            { name: 'Ta Chat', logo: 'tachat', logoUrl: 'https://cdn.prod.website-files.com/696f172efacb311f86007ec0/6979de811d91c2a9ef083daa_Feature%20Card%20(7).svg' },
            { name: 'C&A', logo: 'ca', logoUrl: 'https://cdn.prod.website-files.com/696f172efacb311f86007ec0/6979dee9b8c3b5a0558fb6cb_Feature%20Card%20(8).svg' },
            { name: 'PPC Legend', logo: 'ppclegend', logoUrl: 'https://cdn.prod.website-files.com/696f172efacb311f86007ec0/6979df0ee47b62496991984b_Feature%20Card%20(9).svg' },
            { name: 'Jack2 Media', logo: 'jack2media', logoUrl: 'https://cdn.prod.website-files.com/696f172efacb311f86007ec0/6979df2782e1352f10cbb6fe_Feature%20Card%20(10).svg' },
            { name: 'AJH Accountant', logo: 'ajh', logoUrl: 'https://cdn.prod.website-files.com/696f172efacb311f86007ec0/6979dff09a450a50d282bcdc_Feature%20Card%20(13).svg' },
            { name: 'Amplify', logo: 'amplify', logoUrl: 'https://cdn.prod.website-files.com/696f172efacb311f86007ec0/6979e0418194178a175d1969_Feature%20Card%20(16).svg' },
          ],
        },
      },
    },

    // 2. Verified Results Metrics
    {
      sectionIdentifier: 'verified-results-metrics',
      componentType: ComponentType.METRICS_BANNER,
      displayOrder: 2,
      isActive: true,
      defaultPayload: {
        eyebrow: { enabled: true, text: 'VERIFIED RESULTS', style: 'dot' },
        headline: {
          segments: [
            { type: 'text', value: "We don't show mockups.\n" },
            { type: 'text', value: 'We show dashboards.' },
          ],
        },
        description: {
          enabled: true,
          content: 'Actual 30-day gross sales from client Shopify admin panels. The period is on every card.',
        },
        supportingText: {
          enabled: true,
          content: "Client names withheld under NDA. We'll screen-share the live admin on your call.",
        },
        cards: [
          {
            id: 'card-fitness-us',
            title: 'Fitness Brand Gross Sales',
            category: 'Fitness',
            region: 'US',
            geography: 'US',
            verification: { enabled: true, label: 'VERIFIED ✓', source: 'Shopify Admin Panel' },
            metric: { value: 2333906, displayValue: '$2,333,906', prefix: '$', description: 'Gross sales · 30 days · Nov 2025' },
            period: { label: '30 days · Nov 2025' },
            chart: { enabled: true, chartType: 'bars', dataPoints: [20, 32, 45, 60, 80, 100] },
            appearance: { accentToken: 'pink', cardBg: '#fae8f4', barColor: '#8c7486' },
            order: 1,
            isActive: true,
          },
          {
            id: 'card-home-living-eu',
            title: 'Home & Living Gross Sales',
            category: 'Home & Living',
            region: 'EU',
            geography: 'EU',
            verification: { enabled: true, label: 'VERIFIED ✓', source: 'Shopify Admin Panel' },
            metric: { value: 683991, displayValue: '$683,991', prefix: '$', description: 'Gross sales · 30 days · Dec 2025' },
            period: { label: '30 days · Dec 2025' },
            chart: { enabled: true, chartType: 'bars', dataPoints: [22, 34, 48, 62, 82, 100] },
            appearance: { accentToken: 'blue', cardBg: '#eaf0ff', barColor: '#7284a6' },
            order: 2,
            isActive: true,
          },
          {
            id: 'card-fashion-eu',
            title: 'Fashion Brand Gross Sales',
            category: 'Fashion',
            region: 'EU',
            geography: 'EU',
            verification: { enabled: true, label: 'VERIFIED ✓', source: 'Shopify Admin Panel' },
            metric: { value: 177645, displayValue: '$177,645', prefix: '$', description: 'Gross sales · 30 days · Nov 2025' },
            period: { label: '30 days · Nov 2025' },
            chart: { enabled: true, chartType: 'bars', dataPoints: [24, 36, 50, 65, 84, 100] },
            appearance: { accentToken: 'yellow', cardBg: '#fef2d8', barColor: '#9c9173' },
            order: 3,
            isActive: true,
          },
          {
            id: 'card-supplements-us',
            title: 'Supplements Brand Gross Sales',
            category: 'Supplements',
            region: 'US',
            geography: 'US',
            verification: { enabled: true, label: 'VERIFIED ✓', source: 'Shopify Admin Panel' },
            metric: { value: 32109, displayValue: '$32,109', prefix: '$', description: 'Gross sales · 30 days · Nov 2025' },
            period: { label: '30 days · Nov 2025' },
            chart: { enabled: true, chartType: 'bars', dataPoints: [25, 38, 52, 68, 86, 100] },
            appearance: { accentToken: 'peach', cardBg: '#fae8de', barColor: '#9a786f' },
            order: 4,
            isActive: true,
          },
        ],
      },
    },

    // 3. CRO Revenue Experiment
    {
      sectionIdentifier: 'cro-revenue-experiment',
      componentType: ComponentType.CTA_STRIP,
      displayOrder: 3,
      isActive: true,
      defaultPayload: {
        eyebrow: 'CRO REVENUE EXPERIMENT',
        headline: 'Test what makes money, not what looks nice',
        description:
          'Every month we ship experiments against a single number — revenue per session. Winners stay, losers get reverted, and you see both.',
        ctaText: 'Start a CRO audit',
        ctaUrl: '#audit',
        experimentTag: 'Experiment 14 · PDP bundle block',
        winnerBadge: 'WINNER',
        metricTitle: 'Revenue per session',
        controlLabel: 'Control',
        controlValue: '$1.94',
        controlSubtext: 'rev / session',
        variantLabel: 'Variant B',
        variantValue: '$2.61',
        variantSubtext: '+34.5% · 97% conf.',
        bars: [25, 38, 55, 70, 85, 100],
      },
    },

    // 4. What We Actually Change
    {
      sectionIdentifier: 'what-we-actually-change',
      componentType: ComponentType.FEATURE_GRID,
      displayOrder: 4,
      isActive: true,
      defaultPayload: {
        eyebrow: 'WHAT WE ACTUALLY CHANGE',
        title: 'Give shoppers fewer reasons to leave',
        description:
          'Every store we touch gets the same three things fixed first — the ones that move revenue before any new traffic is bought.',
        cards: [
          {
            id: 'card-1',
            type: 'cart',
            title: 'Fewer steps to buy',
            description:
              'We strip the friction between product page and paid order — variants, upsells, and checkout included.',
            cartLabel: 'Cart',
            cartStep: '1 step',
            checkoutButtonText: 'Checkout · $89.00',
          },
          {
            id: 'card-2',
            type: 'speed',
            title: 'Fast on real phones',
            description:
              "Tested on mid-range devices and slow networks, not on a developer's laptop. Core Web Vitals pass before launch.",
            metrics: [
              { label: 'LCP', value: '0.9s', percent: 75 },
              { label: 'CLS', value: '0.02', percent: 88 },
            ],
          },
          {
            id: 'card-3',
            type: 'theme',
            title: 'Yours to run after',
            description:
              'Clean Liquid and native theme sections, so your team edits the store without opening a ticket.',
            items: [
              { title: 'Hero section', badge: 'Editable' },
              { title: 'Bundle block', badge: 'Editable' },
              { title: 'Reviews', badge: 'Editable' },
            ],
          },
        ],
      },
    },

    // 5. Portfolio / Our Work
    {
      sectionIdentifier: 'portfolio-showcase',
      componentType: ComponentType.FEATURE_GRID,
      displayOrder: 5,
      isActive: true,
      defaultPayload: {
        eyebrow: 'PORTFOLIO',
        title: 'Our Work In Production',
        titleHighlight: 'Our Work',
        description:
          'High-performance architectures, mission-critical platforms, and conversion engines engineered for global enterprises.',
        hoverEffectsEnabled: true,
        viewButtonEnabled: true,
        viewButtonLabel: 'View',
        viewButtonPosition: 'center',
        overlayEnabled: true,
        backdropBlurEnabled: true,
        imageZoomEnabled: true,
        maxDisplayCount: 5,
        threeDScrollEnabled: true,
        threeDIntensity: 'premium',
        mouseParallaxEnabled: true,
        projects: [
          {
            id: 'proj-01',
            orderNumber: '01',
            title: 'Apex Capital Derivatives Exchange',
            client: 'Apex Capital Management',
            category: 'Financial Infrastructure',
            description:
              'Ultra-low-latency distributed clearing architecture processing $40B+ daily transaction volume with sub-10ms finality.',
            imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=1200&auto=format&fit=crop',
            altText: 'Apex Capital derivatives trading terminal and liquidity ledger',
            projectUrl: '/portfolio/apex-capital-derivatives',
            tags: ['Rust', 'eBPF', 'Kafka'],
            metrics: '$40B+ Daily Volume · 99.999% SLA',
          },
          {
            id: 'proj-02',
            orderNumber: '02',
            title: 'Sovereign RAG Neural Knowledge Mesh',
            client: 'Sovereign Cloud AI',
            category: 'Generative AI & Search',
            description:
              'Enterprise-grade air-gapped hybrid retrieval engine indexing 250M+ unstructured contracts with semantic vector guarantees.',
            imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
            altText: 'Sovereign RAG vector embeddings and neural retrieval visualizer',
            projectUrl: '/portfolio/sovereign-rag-mesh',
            tags: ['Python', 'pgvector', 'vLLM'],
            metrics: '250M+ Vectors · 12ms Latency',
          },
          {
            id: 'proj-03',
            orderNumber: '03',
            title: 'Global Telecommunications Edge Network',
            client: 'Vanguard Telecom',
            category: 'Distributed Edge Systems',
            description:
              'Distributed CDN routing fabric executing dynamic geo-steered request deduplication across 180 multi-region points of presence.',
            imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
            altText: 'Global edge traffic distribution mesh and telemetry console',
            projectUrl: '/portfolio/turbomesh-edge-network',
            tags: ['Go', 'Wasm', 'Anycast'],
            metrics: '180 PoPs · 4.8ms Global Routing',
          },
          {
            id: 'proj-04',
            orderNumber: '04',
            title: 'Veloce Autonomous Payments Orchestrator',
            client: 'Veloce Global Pay',
            category: 'Fintech & Settlement',
            description:
              'Cross-border automated FX routing engine settling multi-currency batches with automated liquidity balancing.',
            imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop',
            altText: 'Autonomous payments flow diagram and liquidity analytics',
            projectUrl: '/portfolio/veloce-payments',
            tags: ['TypeScript', 'Temporal', 'Postgres'],
            metrics: '1.2M Tx/sec · Zero Reconciliation Drift',
          },
          {
            id: 'proj-05',
            orderNumber: '05',
            title: 'Aura Cloud Zero-Trust Security Fabric',
            client: 'Aura Cloud Infrastructure',
            category: 'Cybersecurity & IAM',
            description:
              'Hardware-isolated cryptographic enclave manager securing confidential multi-tenant computing for government contractors.',
            imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop',
            altText: 'Zero-trust security telemetry dashboard and enclave status',
            projectUrl: '/portfolio/aura-cloud-security',
            tags: ['Nitro Enclaves', 'mTLS', 'SPIFFE'],
            metrics: 'FedRAMP High Ready · Sub-ms Verification',
          },
        ],
      },
    },

    // 6. Delivery Process
    {
      sectionIdentifier: 'delivery-process',
      componentType: ComponentType.TABBED_SOLUTIONS,
      displayOrder: 6,
      isActive: true,
      defaultPayload: {
        eyebrow: 'DELIVERY METHODOLOGY',
        title: 'Our Four Step Delivery Process',
        titleHighlight: 'Process',
        description:
          'Our process is built to deliver clarity, consistency, and results at every stage. By combining strategy, design, and execution, we ensure each website is thoughtfully crafted, aligned with your goals, and optimized for long-term performance.',
        scrollHintText: 'Scroll to see our process',
        stickyScrollEnabled: true,
        steps: [
          {
            id: 'step-1',
            stepNumber: '.01',
            title: 'Discovery & Strategy',
            description:
              "We start with your business, your buyers, and the search landscape you're competing in (both Google and AI). Then we map what matters. The opportunities, the risks, the metrics that guide every decision from here.",
            imageUrl: '/images/process/step-1.jpg',
            altText: 'Discovery & Strategy workshop with team and stakeholders',
          },
          {
            id: 'step-2',
            stepNumber: '.02',
            title: 'Architecture & UX',
            description:
              'Conversion pathways, technical architecture, and interactive wireframes engineered to eliminate friction, accelerate page speeds, and retain qualified enterprise buyers.',
            imageUrl: '/images/process/step-2.jpg',
            altText: 'Scalable cloud architecture and interactive wireframes',
          },
          {
            id: 'step-3',
            stepNumber: '.03',
            title: 'Design & Prototype',
            description:
              'Bespoke design systems, typography tokens, component libraries, and interactive prototypes bringing your enterprise brand identity to life with pixel precision.',
            imageUrl: '/images/process/step-3.jpg',
            altText: 'Design system and typography tokens in Figma',
          },
          {
            id: 'step-4',
            stepNumber: '.04',
            title: 'Build, Ship, Keep Improving',
            description:
              'Modern engineering, headless infrastructure, automated CI/CD pipelines, Core Web Vitals optimization, and continuous conversion experiments after launch.',
            imageUrl: '/images/process/step-4.jpg',
            altText: 'Production engineering and deployment telemetry',
          },
        ],
      },
    },

    // 7. Capabilities
    {
      sectionIdentifier: 'our-capabilities',
      componentType: ComponentType.FEATURE_GRID,
      displayOrder: 7,
      isActive: true,
      defaultPayload: {
        eyebrow: 'OUR CAPABILITIES',
        title: 'Engineered with modern tools for scalable digital products',
        titleHighlight: 'engineering',
        description:
          'We combine world-class design systems with robust, high-performance engineering. Our multidisciplinary team leverages the modern web ecosystem to build digital experiences that load instantly, convert visitors, and scale seamlessly.',
        image: {
          url: '/images/capabilities-engineer.jpg',
          alt: 'Senior Software & Solutions Engineer',
          badgeText: 'Enterprise-Grade Execution',
        },
        technologies: [
          { name: 'Figma', category: 'Design Systems' },
          { name: 'Webflow', category: 'Visual Development' },
          { name: 'Relume', category: 'Component Library' },
          { name: 'Midjourney', category: 'Generative Visuals' },
          { name: 'Framer', category: 'Interactivity & Motion' },
          { name: 'React.js', category: 'UI Engineering' },
          { name: 'NEXT.js', category: 'Full-Stack Architecture' },
          { name: 'node.js', category: 'High-Throughput Runtime' },
          { name: 'Tailwind css', category: 'Utility Design System' },
        ],
        highlights: [
          { title: 'Sub-second load times', description: 'Engineered for 95+ Google Lighthouse scores' },
          { title: 'Pixel-perfect fidelity', description: 'Zero compromise from Figma canvas to production' },
          { title: 'Scalable architecture', description: 'TypeScript, modular APIs & headless CMS' },
        ],
        ctaText: 'Consult With Engineering',
        ctaUrl: '#contact-inquiry',
      },
    },

    // 8. Client Testimonials
    {
      sectionIdentifier: 'client-testimonials',
      componentType: ComponentType.TESTIMONIAL_SLIDER,
      displayOrder: 8,
      isActive: true,
      defaultPayload: {
        eyebrow: 'CLIENT LOVE',
        title: 'Hear it from the founders.',
        titleHighlight: 'founders.',
        description: 'Real experiences from businesses we have helped build, scale, and transform.',
        ratingSummary: {
          enabled: true,
          ratingValue: 4.9,
          maxRating: 5.0,
          reviewCountText: 'On camera, not a screenshot',
          badgeText: 'Verified Client Reviews',
        },
        videoTestimonials: [
          {
            id: 'video-1',
            name: 'Sarah Jenkins',
            role: 'CEO & Founder',
            company: 'Meridian Health',
            quote: 'Working with Gypsym completely reshaped our patient conversion pipeline and boosted signups by 140%.',
            thumbnailUrl: '/images/testimonials/founder-1.jpg',
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-41315-large.mp4',
            durationText: '1:45',
            metricHighlight: '+140% patient signups',
          },
          {
            id: 'video-2',
            name: 'Marcus Vance',
            role: 'Chief Technology Officer',
            company: 'Aether Logistics',
            quote: 'They eliminated our legacy tech bottlenecks in weeks. Delivery was on time, transparent, and seamless.',
            thumbnailUrl: '/images/testimonials/founder-2.jpg',
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-41315-large.mp4',
            durationText: '2:12',
            metricHighlight: '4.2x faster checkout',
          },
          {
            id: 'video-3',
            name: 'Elena Rostova',
            role: 'Head of Growth',
            company: 'Veloce Retail Group',
            quote: 'Our mobile revenue jumped within the first sprint. The level of engineering and aesthetic craft is world-class.',
            thumbnailUrl: '/images/testimonials/founder-3.jpg',
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-41315-large.mp4',
            durationText: '1:30',
            metricHighlight: '+28% AOV increase',
          },
        ],
        textTestimonials: [
          {
            id: 'text-1',
            name: 'David Chen',
            role: 'VP of Product',
            company: 'Strata Cloud Systems',
            avatarUrl: '/images/testimonials/avatar-1.jpg',
            quote:
              'Before Gypsym, our conversion rate was stalled at 1.8%. Within three weeks of deploying the new architecture and streamlined checkout, our qualified lead volume surged past 4.2%. They operate like an elite in-house strike team rather than an agency.',
            rating: 5,
            isRepeatClient: true,
            isFeatured: true,
            projectType: 'Full Platform Overhaul',
          },
          {
            id: 'text-2',
            name: 'Amara Okafor',
            role: 'Founder & Managing Director',
            company: 'Novi Financial Tech',
            avatarUrl: '/images/testimonials/avatar-2.jpg',
            quote:
              'Their attention to detail across typography, micro-interactions, and backend resilience is unmatched. Every single launch milestone was hit without surprise delays or regressions.',
            rating: 5,
            isRepeatClient: true,
            isFeatured: false,
            projectType: 'Fintech Web Experience',
          },
          {
            id: 'text-3',
            name: 'Liam Gallagher',
            role: 'Co-Founder & COO',
            company: 'Pulse Commerce Labs',
            avatarUrl: '/images/testimonials/avatar-3.jpg',
            quote:
              'The return on investment was visible within the first month. Our server response times dropped by 65% and our organic enterprise search inquiries more than doubled.',
            rating: 5,
            isRepeatClient: false,
            isFeatured: false,
            projectType: 'Headless Next.js Storefront',
          },
          {
            id: 'text-4',
            name: 'Sophie Laurent',
            role: 'Global Digital Director',
            company: 'Atelier Maison',
            avatarUrl: '/images/testimonials/avatar-4.jpg',
            quote:
              'Gypsym delivered a high-fashion luxury digital experience that performs like a high-frequency trading system. Flawless animations, zero lag, and rave reviews from our VIP clients.',
            rating: 5,
            isRepeatClient: true,
            isFeatured: true,
            projectType: 'Luxury E-Commerce Replatform',
          },
        ],
      },
    },

    // 9. Clients / Trusted By
    {
      sectionIdentifier: 'clients-trusted-by',
      componentType: ComponentType.LOGO_CLOUD,
      displayOrder: 9,
      isActive: true,
      defaultPayload: {
        eyebrow: 'CLIENTS & PARTNERS',
        title: 'Trusted by High-Growth Brands & Global Scale-Ups',
        titleHighlight: 'High-Growth Brands',
        description:
          'Powering mission-critical digital infrastructure, headless e-commerce flagships, and enterprise cloud software for market-defining companies.',
        tagline: 'Join 150+ market-defining companies engineered by Gypsym',
        badgeText: 'Verified Client Registry',
        statLabel: 'Enterprises & Brands Scaled Globally',
        statNumber: '150+',
      },
    },

    // 10. Partners
    {
      sectionIdentifier: 'homepage-partners',
      componentType: ComponentType.FEATURE_GRID,
      displayOrder: 10,
      isActive: true,
      defaultPayload: {
        eyebrow: 'STRATEGIC ALLIANCES',
        title: 'Certified Ecosystem & Technology Partners',
        titleHighlight: 'Ecosystem',
        description:
          'We collaborate with the world’s leading cloud infrastructure, payment networks, and sovereign intelligence platforms.',
        showFilters: true,
        viewAllButtonEnabled: true,
        viewAllButtonLabel: 'Explore All Technology Alliances',
        viewAllButtonUrl: '/partners',
      },
    },

    // 11. Contact Inquiry
    {
      sectionIdentifier: 'contact-inquiry',
      componentType: ComponentType.CONTACT,
      displayOrder: 11,
      isActive: true,
      defaultPayload: {
        eyebrow: 'DIRECT ENGAGEMENT',
        title: 'Initiate an Architectural Consultation',
        titleHighlight: 'Consultation',
        description:
          'Engage directly with our technical leadership. We evaluate system architecture, scale bottlenecks, and enterprise implementation scopes under strict non-disclosure terms.',
        contactInfo: {
          useGlobalDefaults: true,
        },
        supportCard: {
          enabled: true,
          title: 'Rapid Architecture Assessment',
          description:
            'Qualifying enterprise projects receive a 45-minute technical roadmap briefing with our CTO office.',
          ctaLabel: 'Book Priority Session',
          ctaUrl: '#inquiry-form',
        },
        form: {
          formTitle: 'Direct Engineering Inquiry',
          formSubtitle: 'Connect with a principal architect within 24 business hours.',
          submitButtonText: 'Submit Inquiry',
          privacyNote: 'Protected by enterprise NDA standards. No solicitation.',
          successTitle: 'Inquiry Transmitted',
          successMessage:
            'Thank you. Our engineering desk has received your briefing and will review specifications shortly.',
          fields: [
            {
              id: 'f-name',
              name: 'fullName',
              label: 'Full Name',
              type: 'text',
              placeholder: 'Dr. Evelyn Reed',
              required: true,
              width: 'full',
            },
            {
              id: 'f-email',
              name: 'email',
              label: 'Work Email',
              type: 'email',
              placeholder: 'evelyn@enterprise.com',
              required: true,
              width: 'full',
            },
            {
              id: 'f-company',
              name: 'companyName',
              label: 'Company Name',
              type: 'text',
              placeholder: 'Apex Cloud Systems',
              required: false,
              width: 'half',
            },
            {
              id: 'f-budget',
              name: 'budgetRange',
              label: 'Estimated Budget',
              type: 'select',
              placeholder: 'Select investment tier',
              options: ['$25k - $50k', '$50k - $100k', '$100k - $250k', '$250k+'],
              required: false,
              width: 'half',
            },
            {
              id: 'f-project',
              name: 'projectScope',
              label: 'Project Scope & Requirements',
              type: 'textarea',
              placeholder: 'Detail your platform goals, timelines, and architectural constraints...',
              required: true,
              width: 'full',
            },
          ],
        },
      },
    },

    // 12. CTA Banner
    {
      sectionIdentifier: 'homepage-cta',
      componentType: ComponentType.CTA,
      displayOrder: 12,
      isActive: true,
      defaultPayload: {
        eyebrow: 'ENTERPRISE ARCHITECTURE',
        title: 'Ready to Accelerate Your Digital Transformation?',
        titleHighlight: 'Transformation',
        description:
          'Partner with our systems engineers and cloud architects to build resilient, distributed digital infrastructure engineered for uncompromising scale.',
        primaryButton: {
          label: 'Schedule an Architectural Briefing',
          url: '#contact-inquiry',
          variant: 'glow',
          target: '_self',
        },
        secondaryButton: {
          enabled: true,
          label: 'Explore Technology Radar',
          url: '/services',
          variant: 'outline',
          target: '_self',
        },
        appearance: {
          backgroundType: 'gradient',
          overlayOpacity: 40,
          enableGlow: true,
        },
        layout: {
          alignment: 'center',
          containerWidth: 'contained',
          borderRadius: '2xl',
        },
      },
    },
  ];

  for (const item of sectionsToUpsert) {
    const existing = await prisma.pageSection.findFirst({
      where: {
        pageId: homePage.id,
        sectionIdentifier: item.sectionIdentifier,
      },
    });

    if (existing) {
      await prisma.pageSection.update({
        where: { id: existing.id },
        data: {
          displayOrder: item.displayOrder,
          isActive: item.isActive,
          componentType: item.componentType,
          // Preserve custom edits if already populated, otherwise initialize
          contentPayload:
            existing.contentPayload && Object.keys(existing.contentPayload as object).length > 2
              ? existing.contentPayload
              : item.defaultPayload,
        },
      });
      console.log(`✅ Updated section [${item.displayOrder}]: ${item.sectionIdentifier}`);
    } else {
      await prisma.pageSection.create({
        data: {
          pageId: homePage.id,
          sectionIdentifier: item.sectionIdentifier,
          componentType: item.componentType,
          displayOrder: item.displayOrder,
          isActive: item.isActive,
          contentPayload: item.defaultPayload,
        },
      });
      console.log(`✨ Created section [${item.displayOrder}]: ${item.sectionIdentifier}`);
    }
  }

  console.log('🎉 All 12 Home Page sections are successfully synced in the database!');
}

main()
  .catch((e) => {
    console.error('Error seeding sections:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
