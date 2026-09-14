const fs = require('fs');
const path = require('path');
let PrismaClient;
try {
  PrismaClient = require('@prisma/client').PrismaClient;
} catch (e) {
  try {
    PrismaClient = require(path.join(__dirname, '..', 'packages', 'database', 'node_modules', '@prisma', 'client')).PrismaClient;
  } catch (e2) {
    PrismaClient = require(path.join(__dirname, '..', 'node_modules', '.pnpm', '@prisma+client@5.22.0_prisma@5.22.0', 'node_modules', '@prisma', 'client')).PrismaClient;
  }
}

const prisma = new PrismaClient();

const PARTNER_DATA = [
  {
    name: 'Amazon Web Services',
    slug: 'aws',
    tier: 'GLOBAL_ALLIANCE',
    partnerType: 'Cloud Infrastructure',
    industry: 'Enterprise Cloud & Compute',
    shortDescription: 'Premier Consulting Partner for Cloud Architecture & Core Banking',
    websiteUrl: 'https://aws.amazon.com',
    file: 'aws.svg',
    svg: `<svg viewBox="0 0 88 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <text x="36" y="18" fill="currentColor" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="22" letter-spacing="0.5">aws</text>
  <path d="M54 22.5c-9.5 4.8-22.5 5.2-32 1.2-.6-.3-.1-1 .5-.7 8.8 3.8 21.2 3.5 29.8-.7.7-.4 1.4.3.7.9l1-.7z" fill="#FF9900"/>
  <path d="M55 20.8l2.2 2.8-3.4.6c-.3 0-.4-.4-.1-.6l1.3-2.8z" fill="#FF9900"/>
</svg>`,
    displayOrder: 1,
  },
  {
    name: 'Google Cloud',
    slug: 'google-cloud',
    tier: 'GLOBAL_ALLIANCE',
    partnerType: 'Sovereign AI & Kubernetes',
    industry: 'Cloud Infrastructure & AI',
    shortDescription: 'Enterprise Kubernetes & Vertex AI Center of Excellence',
    websiteUrl: 'https://cloud.google.com',
    file: 'google-cloud.svg',
    svg: `<svg viewBox="0 0 142 26" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(2, 2) scale(1.15)">
    <path d="M19.5 8.2c0-.6-.1-1.3-.2-1.9H10v3.7h5.3c-.2 1.2-.9 2.2-2 2.9v2.4h3.1c1.9-1.7 3.1-4.2 3.1-7.1z" fill="#4285F4"/>
    <path d="M10 17.9c2.7 0 4.9-.9 6.6-2.4l-3.1-2.4c-.9.6-2 1-3.5 1-2.7 0-4.9-1.8-5.7-4.2H1.1v2.5c1.7 3.3 5.1 5.5 8.9 5.5z" fill="#34A853"/>
    <path d="M4.3 9.9c-.2-.6-.3-1.3-.3-2 0-.7.1-1.4.3-2V3.4H1.1C.4 4.8 0 6.3 0 7.9s.4 3.1 1.1 4.5l3.2-2.5z" fill="#FBBC05"/>
    <path d="M10 3.8c1.5 0 2.8.5 3.8 1.5l2.9-2.9C14.9.9 12.7 0 10 0 6.2 0 2.8 2.2 1.1 5.5l3.2 2.5c.8-2.4 3-4.2 5.7-4.2z" fill="#EA4335"/>
  </g>
  <text x="32" y="18" fill="currentColor" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="15" letter-spacing="-0.3">Google Cloud</text>
</svg>`,
    displayOrder: 2,
  },
  {
    name: 'Microsoft Azure',
    slug: 'microsoft-azure',
    tier: 'GLOBAL_ALLIANCE',
    partnerType: 'Enterprise Cloud',
    industry: 'Hybrid Cloud & Security',
    shortDescription: 'Certified Cloud Solutions Partner for Azure OpenAI & FinOps',
    websiteUrl: 'https://azure.microsoft.com',
    file: 'microsoft-azure.svg',
    svg: `<svg viewBox="0 0 115 26" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M17 3l-9 16.5 6.5 8.5 12.5-25H17zm1.8 9.3l-5.6 15.7h13.3l-7.7-15.7z" fill="#0078D4" transform="translate(1, -2) scale(0.95)"/>
  <text x="35" y="18.5" fill="#0078D4" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="17" letter-spacing="-0.4">Azure</text>
</svg>`,
    displayOrder: 3,
  },
  {
    name: 'Cloudflare',
    slug: 'cloudflare',
    tier: 'PLATINUM',
    partnerType: 'Edge & DDoS Security',
    industry: 'Edge Computing & WAF',
    shortDescription: 'Zero Trust Network Architecture & Distributed Edge Worker Alliance',
    websiteUrl: 'https://cloudflare.com',
    file: 'cloudflare.svg',
    svg: `<svg viewBox="0 0 140 26" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M23 9c-.5-3.5-3.6-6.2-7.3-6.2-3.1 0-5.9 2-6.8 4.8C7 8.1 4.3 11.2 4.3 14.8c0 4 3.2 7.2 7.2 7.2h16c3 0 5.3-2.4 5.3-5.3 0-2.8-2.2-5.2-5.1-5.4l-3.5-2.3z" fill="#F38020" transform="translate(0, -1) scale(1.05)"/>
  <text x="37" y="18" fill="#F38020" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="14.5" letter-spacing="0.8">CLOUDFLARE</text>
</svg>`,
    displayOrder: 4,
  },
  {
    name: 'Datadog',
    slug: 'datadog',
    tier: 'PLATINUM',
    partnerType: 'Observability & APM',
    industry: 'Cloud Monitoring & Telemetry',
    shortDescription: 'Full-stack Distributed Tracing & Real-time Anomaly Detection',
    websiteUrl: 'https://datadoghq.com',
    file: 'datadog.svg',
    svg: `<svg viewBox="0 0 126 26" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="22" height="22" x="2" y="2" rx="5" fill="#632CA6"/>
  <path d="M8.5 7.5c0-.9.8-1.6 1.6-1.6s1.6.7 1.6 1.6v5.5h-3.2v-5.5zm4.4 3.3h2.2v2.2h-2.2v-2.2z" fill="#fff"/>
  <text x="31" y="18" fill="#632CA6" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="14.5" letter-spacing="0.6">DATADOG</text>
</svg>`,
    displayOrder: 5,
  },
  {
    name: 'Snowflake',
    slug: 'snowflake',
    tier: 'PLATINUM',
    partnerType: 'Data Cloud & Warehousing',
    industry: 'Big Data & Analytics',
    shortDescription: 'Secure Data Mesh & High-performance Realtime Data Pipelines',
    websiteUrl: 'https://snowflake.com',
    file: 'snowflake.svg',
    svg: `<svg viewBox="0 0 130 26" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M13 2v22M3 8l20 10M3 18l20-10" stroke="#29B5E8" stroke-width="2.8" stroke-linecap="round"/>
  <text x="31" y="18.5" fill="#29B5E8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="16" letter-spacing="-0.3">snowflake</text>
</svg>`,
    displayOrder: 6,
  },
  {
    name: 'Stripe',
    slug: 'stripe',
    tier: 'PREMIER',
    partnerType: 'Global Payments & Billing',
    industry: 'FinTech & Payments Infrastructure',
    shortDescription: 'Certified Stripe Partner for Multi-currency Enterprise Billing',
    websiteUrl: 'https://stripe.com',
    file: 'stripe.svg',
    svg: `<svg viewBox="0 0 88 26" fill="none" xmlns="http://www.w3.org/2000/svg">
  <text x="3" y="20" fill="#635BFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="25" letter-spacing="-0.8">stripe</text>
</svg>`,
    displayOrder: 7,
  },
  {
    name: 'Vercel',
    slug: 'vercel',
    tier: 'PREMIER',
    partnerType: 'Edge Frontend & Serverless',
    industry: 'Web Performance & Frameworks',
    shortDescription: 'Next.js Enterprise Deployment & Sub-second Global Edge Invalidation',
    websiteUrl: 'https://vercel.com',
    file: 'vercel.svg',
    svg: `<svg viewBox="0 0 105 26" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 3l11 19H3L14 3z" fill="currentColor"/>
  <text x="32" y="18.5" fill="currentColor" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="15" letter-spacing="1.2">VERCEL</text>
</svg>`,
    displayOrder: 8,
  },
  {
    name: 'Shopify Plus',
    slug: 'shopify-plus',
    tier: 'PREMIER',
    partnerType: 'Enterprise Headless Commerce',
    industry: 'Global eCommerce & Retail',
    shortDescription: 'Official Shopify Plus Partner building high-volume storefronts',
    websiteUrl: 'https://shopify.com/plus',
    file: 'shopify-plus.svg',
    svg: `<svg viewBox="0 0 134 26" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M18 4l-3 1s-1.8-1.8-4-1.8c-3 0-4.5 2-4.5 4.5 0 4 7.5 5.5 7.5 9.5 0 3-2 4.5-5 4.5-3.5 0-5.5-2-5.5-2l1-2.5s2 1.5 4.2 1.5c1.8 0 2.5-1 2.5-2.2 0-3.8-7.5-4.5-7.5-9 0-3.8 2.8-6.5 7-6.5 2.5 0 4.2 1.2 4.2 1.2L18 4z" fill="#96bf48" transform="scale(1.08)"/>
  <text x="27" y="18.5" fill="currentColor" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="15.5">shopify<tspan fill="#96bf48" font-size="14.5" font-weight="900"> plus</tspan></text>
</svg>`,
    displayOrder: 9,
  },
  {
    name: 'Figma',
    slug: 'figma',
    tier: 'TECHNOLOGY',
    partnerType: 'Design Systems & Tokens',
    industry: 'Product Design & Prototyping',
    shortDescription: 'Automated Code-to-Canvas Token Synchronization',
    websiteUrl: 'https://figma.com',
    file: 'figma.svg',
    svg: `<svg viewBox="0 0 98 26" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(3, 1) scale(0.6)">
    <path d="M16 0H8C3.58 0 0 3.58 0 8s3.58 8 8 8h8V0z" fill="#F24E1E"/>
    <path d="M0 24c0-4.42 3.58-8 8-8h8v16H8c-4.42 0-8-3.58-8-8z" fill="#0ACF83"/>
    <path d="M0 40c0-4.42 3.58-8 8-8h8v8c0 4.42-3.58 8-8 8s-8-3.58-8-8z" fill="#A259FF"/>
    <path d="M16 16h8c4.42 0 8-3.58 8-8s-3.58-8-8-8h-8v16z" fill="#FF7262"/>
    <path d="M32 24c0-4.42-3.58-8-8-8h-8v16h8c4.42 0 8-3.58 8-8z" fill="#1ABCFE"/>
  </g>
  <text x="32" y="18.5" fill="currentColor" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="16">Figma</text>
</svg>`,
    displayOrder: 10,
  },
  {
    name: 'OpenAI',
    slug: 'openai',
    tier: 'TECHNOLOGY',
    partnerType: 'Generative AI & LLMs',
    industry: 'Artificial Intelligence',
    shortDescription: 'Enterprise GPT-4o fine-tuning & sovereign retrieval agent networks',
    websiteUrl: 'https://openai.com',
    file: 'openai.svg',
    svg: `<svg viewBox="0 0 110 26" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="13" cy="13" r="10.5" stroke="#10a37f" stroke-width="2.5" fill="none"/>
  <circle cx="13" cy="13" r="4.2" fill="#10a37f"/>
  <text x="31" y="18.5" fill="currentColor" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="15.5">OpenAI</text>
</svg>`,
    displayOrder: 11,
  },
  {
    name: 'Supabase',
    slug: 'supabase',
    tier: 'TECHNOLOGY',
    partnerType: 'Realtime PostgreSQL & Auth',
    industry: 'Database Infrastructure',
    shortDescription: 'Managed Postgres & pgvector low-latency embeddings store',
    websiteUrl: 'https://supabase.com',
    file: 'supabase.svg',
    svg: `<svg viewBox="0 0 120 26" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M15 2L3 15h11l-2 11 12-14H13l2-12z" fill="#3ECF8E" transform="scale(0.95)"/>
  <text x="30" y="18.5" fill="currentColor" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="15.5">supabase</text>
</svg>`,
    displayOrder: 12,
  },
  {
    name: 'Redis',
    slug: 'redis',
    tier: 'TECHNOLOGY',
    partnerType: 'In-Memory Cache & Queues',
    industry: 'Distributed Data Systems',
    shortDescription: 'High-throughput cluster session stores and sub-millisecond PubSub',
    websiteUrl: 'https://redis.io',
    file: 'redis.svg',
    svg: `<svg viewBox="0 0 96 26" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="22" height="22" rx="4.5" fill="#D82C20"/>
  <text x="31" y="18.5" fill="#D82C20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="16.5">redis</text>
</svg>`,
    displayOrder: 13,
  },
  {
    name: 'GitLab',
    slug: 'gitlab',
    tier: 'TECHNOLOGY',
    partnerType: 'DevSecOps & CI/CD',
    industry: 'Software Delivery & Governance',
    shortDescription: 'Continuous Delivery Pipelines with Automated Compliance Scans',
    websiteUrl: 'https://gitlab.com',
    file: 'gitlab.svg',
    svg: `<svg viewBox="0 0 102 26" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(1, 0) scale(0.92)">
    <path d="M14 4l4 10H6l4-10z" fill="#FC6D26"/>
    <path d="M3 14l11 14L6 14H3z" fill="#E24329"/>
    <path d="M25 14l-11 14 8-14h3z" fill="#E24329"/>
  </g>
  <text x="30" y="18.5" fill="currentColor" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="15.5">GitLab</text>
</svg>`,
    displayOrder: 14,
  },
  {
    name: 'Docker',
    slug: 'docker',
    tier: 'TECHNOLOGY',
    partnerType: 'Containerization & Tooling',
    industry: 'Developer Tooling & Runtimes',
    shortDescription: 'Reproducible Cloud Development Environments and Microservices',
    websiteUrl: 'https://docker.com',
    file: 'docker.svg',
    svg: `<svg viewBox="0 0 110 26" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(1, 1) scale(1.05)">
    <rect x="3" y="11" width="3.5" height="3.5" rx="0.5" fill="#2496ED"/>
    <rect x="7.5" y="11" width="3.5" height="3.5" rx="0.5" fill="#2496ED"/>
    <rect x="12" y="11" width="3.5" height="3.5" rx="0.5" fill="#2496ED"/>
    <rect x="7.5" y="6.5" width="3.5" height="3.5" rx="0.5" fill="#2496ED"/>
    <rect x="12" y="6.5" width="3.5" height="3.5" rx="0.5" fill="#2496ED"/>
    <path d="M22 12c-.4-.8-1.2-1.2-2-1.2-.8 0-1.5.4-1.8 1-1.2-.2-2.4.4-2.8 1.5H2c-.4 3.2 2 6 6 6 5.5 0 10-2.8 12.4-7.2l.6-.1z" fill="#2496ED"/>
  </g>
  <text x="31" y="18.5" fill="#2496ED" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="15.5">docker</text>
</svg>`,
    displayOrder: 15,
  },
  {
    name: 'GitHub',
    slug: 'github',
    tier: 'TECHNOLOGY',
    partnerType: 'Source Control & Actions',
    industry: 'Code Intelligence & Automation',
    shortDescription: 'GitHub Enterprise & Actions CI/CD Architecture Alliance',
    websiteUrl: 'https://github.com',
    file: 'github.svg',
    svg: `<svg viewBox="0 0 102 26" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M13 2C6.9 2 2 6.9 2 13c0 4.9 3.2 9 7.6 10.5.5.1.8-.2.8-.5v-1.9c-3 .7-3.7-1.4-3.7-1.4-.5-1.2-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.5-.3-5.1-1.2-5.1-5.5 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-3 0 0 .9-.3 3.1 1.1.9-.3 1.8-.4 2.8-.4s1.9.1 2.8.4c2.2-1.4 3.1-1.1 3.1-1.1.6 1.6.2 2.7.1 3 .7.8 1.1 1.8 1.1 3 0 4.3-2.6 5.2-5.1 5.5.4.3.8 1.1.8 2.2v3.3c0 .3.2.6.8.5 4.4-1.5 7.6-5.6 7.6-10.5 0-6.1-4.9-11-11-11z" fill="currentColor"/>
  <text x="31" y="18.5" fill="currentColor" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="16">GitHub</text>
</svg>`,
    displayOrder: 16,
  },
  {
    name: 'Auth0',
    slug: 'auth0',
    tier: 'TECHNOLOGY',
    partnerType: 'Identity & Authentication',
    industry: 'Cybersecurity & IAM',
    shortDescription: 'Universal SSO, Multi-factor Authentication & RBAC Federation',
    websiteUrl: 'https://auth0.com',
    file: 'auth0.svg',
    svg: `<svg viewBox="0 0 100 26" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M13 2l-8 3.1v8c0 5.7 3.5 10.6 8 12 4.5-1.4 8-6.3 8-12v-8L13 2zm0 16c-2.6 0-4.9-2.2-4.9-4.9S10.4 8.2 13 8.2s4.9 2.2 4.9 4.9-2.3 4.9-4.9 4.9z" fill="#EB5424" transform="scale(0.96)"/>
  <text x="30" y="18.5" fill="#EB5424" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="15.5">auth0</text>
</svg>`,
    displayOrder: 17,
  },
  {
    name: 'HashiCorp',
    slug: 'hashicorp',
    tier: 'TECHNOLOGY',
    partnerType: 'Infrastructure as Code',
    industry: 'Terraform & Vault Cloud Security',
    shortDescription: 'Automated Multi-cloud Provisioning & Secrets Lifecycle Governance',
    websiteUrl: 'https://hashicorp.com',
    file: 'hashicorp.svg',
    svg: `<svg viewBox="0 0 120 26" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(1, 1) scale(0.95)">
    <path d="M9 4l-4 2.5v9l4 2.5V4zm9 0l-4 2.5v9l4 2.5V4zm-4 11.5l-4 2.5v5.5l4-2.5v-5.5zm9 0l-4 2.5v5.5l4-2.5v-5.5z" fill="currentColor"/>
  </g>
  <text x="30" y="18.5" fill="currentColor" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="14.5">HashiCorp</text>
</svg>`,
    displayOrder: 18,
  },
];

async function run() {
  console.log('Writing SVGs to public directories...');
  const dirs = [
    path.join(__dirname, '..', 'apps', 'web', 'public', 'partners'),
    path.join(__dirname, '..', 'apps', 'admin', 'public', 'partners'),
  ];

  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true });
  }

  for (const p of PARTNER_DATA) {
    for (const dir of dirs) {
      fs.writeFileSync(path.join(dir, p.file), p.svg.trim(), 'utf8');
    }
  }
  console.log(`Saved ${PARTNER_DATA.length} SVGs to public directories.`);

  console.log('Synchronizing database partner records...');

  for (const item of PARTNER_DATA) {
    const logoUrl = `/partners/${item.file}`;

    // Find or create media row
    let media = await prisma.media.findFirst({
      where: { originalFilename: item.file },
    });

    if (!media) {
      media = await prisma.media.create({
        data: {
          originalFilename: item.file,
          mimeType: 'image/svg+xml',
          fileSizeBytes: BigInt(item.svg.length),
          storageKey: `partners/${item.file}`,
          altText: `${item.name} logo`,
          variants: { original: logoUrl },
        },
      });
    } else {
      await prisma.media.update({
        where: { id: media.id },
        data: { variants: { original: logoUrl } },
      });
    }

    // Upsert partner record
    const existing = await prisma.partner.findFirst({
      where: {
        OR: [
          { slug: item.slug },
          { name: item.name },
        ],
      },
    });

    if (existing) {
      await prisma.partner.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          slug: item.slug,
          tier: item.tier,
          partnerType: item.partnerType,
          industry: item.industry,
          shortDescription: item.shortDescription,
          websiteUrl: item.websiteUrl,
          logoId: media.id,
          displayOrder: item.displayOrder,
          status: 'PUBLISHED',
          showOnHomepage: true,
        },
      });
      console.log(`Updated partner: ${item.name} (#${item.displayOrder})`);
    } else {
      await prisma.partner.create({
        data: {
          name: item.name,
          slug: item.slug,
          tier: item.tier,
          partnerType: item.partnerType,
          industry: item.industry,
          shortDescription: item.shortDescription,
          websiteUrl: item.websiteUrl,
          logoId: media.id,
          displayOrder: item.displayOrder,
          status: 'PUBLISHED',
          showOnHomepage: true,
        },
      });
      console.log(`Created partner: ${item.name} (#${item.displayOrder})`);
    }
  }

  console.log('All 18 partners synced to database successfully!');
  await prisma.$disconnect();
}

run().catch((err) => {
  console.error('Error during partner seed:', err);
  process.exit(1);
});
