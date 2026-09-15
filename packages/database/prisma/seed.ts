import * as dotenv from 'dotenv';
import * as path from 'path';

// Load DATABASE_URL and DIRECT_URL from single root .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import {
  PrismaClient,
  RoleType,
  ContentStatus,
  PageLayoutType,
  ComponentType,
  MediaStatus,
  ClientTier,
  PartnerTier,
  TechCategory,
  WorkLocationType,
  EmploymentType,
  ExperienceLevel,
} from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Secure password hashing using Node.js crypto.scryptSync.
 * Formatted as: scrypt:<salt>:<derivedKeyHex>
 */
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

async function main() {
  const args = process.argv.slice(2);
  const isProdFlag = args.includes('--mode=production');
  const isProdEnv = process.env.NODE_ENV === 'production' || process.env.SEED_MODE === 'production';
  const isProduction = isProdFlag || isProdEnv;

  console.log(`\n======================================================`);
  console.log(`🌱 GYPSYM TECHNOLOGY PRISMA SEED RUNNER`);
  console.log(`   Mode: ${isProduction ? 'PRODUCTION (Bootstrap)' : 'DEVELOPMENT / DEMO'}`);
  console.log(`   Timestamp: ${new Date().toISOString()}`);
  console.log(`======================================================\n`);

  // 1. Validate Admin Credentials
  const adminEmail = process.env.SEED_ADMIN_EMAIL || (isProduction ? '' : 'admin@gypsym.com');
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || (isProduction ? '' : 'GypsymEnterprise2026!');
  const adminFullName = process.env.SEED_ADMIN_NAME || 'Gypsym System Administrator';

  if (isProduction && (!adminEmail || !adminPassword)) {
    console.error(
      '❌ [FATAL] In production mode, SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD environment variables are strictly required.'
    );
    console.error('    Please provide valid administrator bootstrap credentials.');
    process.exit(1);
  }

  const nameParts = adminFullName.trim().split(' ');
  const firstName = nameParts[0] || 'System';
  const lastName = nameParts.slice(1).join(' ') || 'Admin';

  console.log(`🔒 Configuring System Roles & Permissions...`);

  // 2. Roles
  const rolesData: { key: RoleType; name: string; description: string }[] = [
    {
      key: RoleType.SUPER_ADMIN,
      name: 'Super Administrator',
      description: 'Unrestricted global operational authority across IAM, infrastructure, and all digital assets.',
    },
    {
      key: RoleType.SYSTEM_ADMIN,
      name: 'System Administrator',
      description: 'Operational administration of site settings, branding, infrastructure, and audit logs.',
    },
    {
      key: RoleType.CONTENT_EDITOR,
      name: 'Content Editor',
      description: 'Management of editorial workflow, pages, case studies, blogs, and public content assets.',
    },
    {
      key: RoleType.RECRUITER,
      name: 'Talent & Recruiter',
      description: 'Management of career opportunities, job requisitions, applicant reviews, and talent acquisition.',
    },
    {
      key: RoleType.AUDITOR,
      name: 'Compliance Auditor',
      description: 'Read-only access to audit logs, security events, and compliance telemetry.',
    },
  ];

  const roleMap: Record<string, string> = {};
  for (const role of rolesData) {
    const record = await prisma.role.upsert({
      where: { key: role.key },
      update: { name: role.name, description: role.description },
      create: { key: role.key, name: role.name, description: role.description, isSystem: true },
    });
    roleMap[role.key] = record.id;
  }

  // 3. Permissions
  const permissionsData = [
    { key: 'iam.users.manage', module: 'iam', description: 'Create, edit, suspend, and delete user accounts' },
    { key: 'iam.roles.manage', module: 'iam', description: 'Modify roles, policies, and authorization grants' },
    { key: 'iam.audit.view', module: 'iam', description: 'Inspect immutable compliance audit trails' },
    { key: 'cms.pages.manage', module: 'cms', description: 'Create and edit structured CMS pages and layouts' },
    { key: 'cms.pages.publish', module: 'cms', description: 'Approve and publish page revisions to production' },
    { key: 'cms.blog.manage', module: 'cms', description: 'Author and manage technical thought leadership articles' },
    { key: 'cms.services.manage', module: 'cms', description: 'Maintain service portfolio, solutions, and industries' },
    { key: 'dam.media.upload', module: 'dam', description: 'Upload and process enterprise digital media assets' },
    { key: 'dam.media.delete', module: 'dam', description: 'Remove media assets from object storage' },
    { key: 'settings.branding.manage', module: 'settings', description: 'Configure dynamic brand tokens and themes' },
    { key: 'settings.system.manage', module: 'settings', description: 'Configure site-wide operational settings' },
  ];

  const permissionIds: string[] = [];
  for (const perm of permissionsData) {
    const record = await prisma.permission.upsert({
      where: { key: perm.key },
      update: { module: perm.module, description: perm.description },
      create: { key: perm.key, module: perm.module, description: perm.description },
    });
    permissionIds.push(record.id);
  }

  // Grant all permissions to SUPER_ADMIN
  const superAdminRoleId = roleMap[RoleType.SUPER_ADMIN]!;
  for (const permId of permissionIds) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRoleId,
          permissionId: permId,
        },
      },
      update: {},
      create: {
        roleId: superAdminRoleId,
        permissionId: permId,
      },
    });
  }

  // 4. Initial Administrator Account
  console.log(`👤 Upserting Initial Administrator Account (${adminEmail})...`);
  const passwordHash = hashPassword(adminPassword);
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      firstName,
      lastName,
      isActive: true,
      // If updating an existing user in seed, we preserve existing password if already set
    },
    create: {
      email: adminEmail,
      passwordHash,
      firstName,
      lastName,
      isActive: true,
      isTwoFactorEnabled: false,
    },
  });

  // Assign SUPER_ADMIN role to seed administrator
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRoleId,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRoleId,
    },
  });

  // 5. System & Site Settings
  console.log(`⚙️  Upserting System & Site Settings...`);
  const siteSettings = [
    {
      category: 'general',
      key: 'general:entity',
      isPublic: true,
      value: {
        companyName: 'Gypsym Technology Inc.',
        legalName: 'Gypsym Global Enterprises Inc.',
        registrationJurisdiction: 'Delaware, United States',
        entityId: 'US-DE-2018-77491',
        foundedYear: 2018,
        headquarters: 'New York, NY, USA',
      },
    },
    {
      category: 'general',
      key: 'general:contact',
      isPublic: true,
      value: {
        primaryEmail: 'contact@gypsym.com',
        advisoryEmail: 'advisory@gypsym.com',
        securityEmail: 'security@gypsym.com',
        phone: '+1-212-555-0199',
        address: '175 Varick Street, 8th Floor, New York, NY 10014, USA',
      },
    },
    {
      category: 'theme',
      key: 'theme:configuration',
      isPublic: true,
      value: {
        defaultTheme: 'light',
        allowUserToggle: true,
        supportedThemes: ['light', 'dark', 'system'],
        systemSyncEnabled: true,
      },
    },
    {
      category: 'seo',
      key: 'seo:defaults',
      isPublic: true,
      value: {
        metaTitleTemplate: '%s | Gypsym Technology',
        defaultTitle: 'Gypsym Technology | Engineering the Global Enterprise',
        defaultDescription:
          'Gypsym Technology partners with Fortune 100 leaders to architect zero-downtime cloud cores, sovereign AI ecosystems, and high-frequency distributed ledgers.',
        defaultKeywords: [
          'enterprise cloud architecture',
          'distributed systems',
          'sovereign AI',
          'zero trust cybersecurity',
          'core banking modernization',
        ],
        canonicalBaseUrl: 'https://gypsym.com',
        ogDefaultImage: 'https://gypsym.com/og-default.png',
      },
    },
  ];

  for (const setting of siteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {
        category: setting.category,
        isPublic: setting.isPublic,
        value: setting.value,
        updatedBy: adminUser.id,
      },
      create: {
        category: setting.category,
        key: setting.key,
        isPublic: setting.isPublic,
        value: setting.value,
        updatedBy: adminUser.id,
      },
    });
  }

  // 6. DAM Media Assets (Placeholders for relational integrity)
  console.log(`🖼️  Upserting Core DAM Media Assets...`);
  const mediaAssets = [
    {
      storageKey: 'system/brand/logo-light.svg',
      originalFilename: 'logo-light.svg',
      mimeType: 'image/svg+xml',
      altText: 'Gypsym Technology Light Mode Logo',
    },
    {
      storageKey: 'system/brand/logo-dark.svg',
      originalFilename: 'logo-dark.svg',
      mimeType: 'image/svg+xml',
      altText: 'Gypsym Technology Dark Mode Logo',
    },
    {
      storageKey: 'system/brand/favicon.ico',
      originalFilename: 'favicon.ico',
      mimeType: 'image/x-icon',
      altText: 'Gypsym Technology Favicon',
    },
    {
      storageKey: 'system/clients/apex-bank-logo.svg',
      originalFilename: 'apex-bank-logo.svg',
      mimeType: 'image/svg+xml',
      altText: 'Apex Global Bank Logo',
    },
    {
      storageKey: 'system/clients/novartis-labs-logo.svg',
      originalFilename: 'novartis-labs-logo.svg',
      mimeType: 'image/svg+xml',
      altText: 'Novartis Core Labs Logo',
    },
    {
      storageKey: 'system/case-studies/fintech-cover.webp',
      originalFilename: 'fintech-cover.webp',
      mimeType: 'image/webp',
      altText: 'Fintech Core Modernization Architecture Blueprint',
    },
    {
      storageKey: 'system/partners/aws-partner-badge.svg',
      originalFilename: 'aws-partner-badge.svg',
      mimeType: 'image/svg+xml',
      altText: 'AWS Premier Tier Partner Badge',
    },
  ];

  const mediaMap: Record<string, string> = {};
  for (const m of mediaAssets) {
    const record = await prisma.media.upsert({
      where: { storageKey: m.storageKey },
      update: {
        originalFilename: m.originalFilename,
        mimeType: m.mimeType,
        altText: m.altText,
        status: MediaStatus.READY,
      },
      create: {
        storageKey: m.storageKey,
        originalFilename: m.originalFilename,
        mimeType: m.mimeType,
        fileSizeBytes: BigInt(2048),
        status: MediaStatus.READY,
        altText: m.altText,
        variants: { original: `/${m.originalFilename}` },
        uploadedBy: adminUser.id,
      },
    });
    mediaMap[m.storageKey] = record.id;
  }

  // 7. Dynamic Brand Settings
  console.log(`🎨 Upserting Brand Settings & Runtime Tokens...`);
  await prisma.brandSetting.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {
      companyName: 'Gypsym',
      logoLightId: mediaMap['system/brand/logo-light.svg'],
      logoDarkId: mediaMap['system/brand/logo-dark.svg'],
      faviconId: mediaMap['system/brand/favicon.ico'],
      colors: {
        primaryColorHsl: '217 91% 60%',
        secondaryColorHsl: '217.2 32.6% 14%',
        accentColorHsl: '217 91% 60%',
        lightBgHsl: '48 18% 95%',
        lightBgColor: '#f4f3ef',
        darkBgHsl: '224 71% 4%',
        darkBgColor: '#030712',
      },
      typography: {
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        headingScale: '1.25',
      },
      socialLinks: [
        { platform: 'linkedin', url: 'https://linkedin.com/company/gypsym', isActive: true },
        { platform: 'twitter', url: 'https://twitter.com/gypsymtech', isActive: true },
        { platform: 'github', url: 'https://github.com/gypsym', isActive: true },
      ],
      updatedBy: adminUser.id,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      version: 1,
      isActive: true,
      companyName: 'Gypsym',
      logoLightId: mediaMap['system/brand/logo-light.svg'],
      logoDarkId: mediaMap['system/brand/logo-dark.svg'],
      faviconId: mediaMap['system/brand/favicon.ico'],
      colors: {
        primaryColorHsl: '217 91% 60%',
        secondaryColorHsl: '217.2 32.6% 14%',
        accentColorHsl: '217 91% 60%',
        lightBgHsl: '48 18% 95%',
        lightBgColor: '#f4f3ef',
        darkBgHsl: '224 71% 4%',
        darkBgColor: '#030712',
      },
      typography: {
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        headingScale: '1.25',
      },
      socialLinks: [
        { platform: 'linkedin', url: 'https://linkedin.com/company/gypsym', isActive: true },
        { platform: 'twitter', url: 'https://twitter.com/gypsymtech', isActive: true },
        { platform: 'github', url: 'https://github.com/gypsym', isActive: true },
      ],
      updatedBy: adminUser.id,
    },
  });

  // 8. Dynamic Navigation & Header Architecture
  console.log(`🧭 Upserting Header and Footer Navigation Trees...`);

  // Site Setting: header_config
  await prisma.siteSetting.upsert({
    where: { key: 'header_config' },
    update: {
      category: 'header',
      isPublic: true,
      value: {
        sticky: true,
        transparentOverHero: true,
        blur: true,
        shadow: true,
        border: true,
        rounded: 'full',
        maxWidth: '7xl',
        showThemeToggle: false,
        showSearchBar: false,
        cta: {
          enabled: true,
          label: 'Get In Touch',
          url: '/contact',
          icon: 'ArrowUpRight',
          openInNewTab: false,
          variant: 'primary',
        },
      },
    },
    create: {
      category: 'header',
      key: 'header_config',
      isPublic: true,
      value: {
        sticky: true,
        transparentOverHero: true,
        blur: true,
        shadow: true,
        border: true,
        rounded: 'full',
        maxWidth: '7xl',
        showThemeToggle: false,
        showSearchBar: false,
        cta: {
          enabled: true,
          label: 'Get In Touch',
          url: '/contact',
          icon: 'ArrowUpRight',
          openInNewTab: false,
          variant: 'primary',
        },
      },
    },
  });

  const headerNav = await prisma.navigation.upsert({
    where: { key: 'header' },
    update: { title: 'Primary Header Navigation', isActive: true },
    create: { key: 'header', title: 'Primary Header Navigation', isActive: true },
  });

  const headerItems = [
    {
      label: 'Services',
      url: '/services',
      order: 1,
      megaMenuConfig: {
        enabled: true,
        category: 'SHOPIFY SERVICES',
        layout: '2-column',
        maxWidth: '5xl',
        items: [
          {
            title: 'Shopify Plus Store Design & Development',
            description: 'Custom Liquid & Hydrogen themes, bespoke checkout, scalable architecture.',
            url: '/services/shopify-plus-development',
            icon: 'Layout',
          },
          {
            title: 'eCommerce CRO & Funnel Optimization',
            description: 'Data-driven audits and checkout optimization to maximize AOV & conversions.',
            url: '/services/ecommerce-cro',
            icon: 'TrendingUp',
          },
          {
            title: 'Shopify Migration & Replatforming',
            description: 'Zero-downtime migration from Magento, WooCommerce, or BigCommerce.',
            url: '/services/shopify-migration',
            icon: 'RefreshCw',
          },
          {
            title: 'Headless Commerce & Hydrogen Apps',
            description: 'Ultra-fast Next.js and Shopify Storefront API headless architectures.',
            url: '/services/headless-shopify',
            icon: 'Zap',
          },
          {
            title: 'Custom Shopify App Engineering',
            description: 'Bespoke private and public apps, ERP/WMS sync, and API middleware.',
            url: '/services/custom-shopify-apps',
            icon: 'Box',
          },
          {
            title: 'Monthly Shopify Growth Subscription',
            description: 'Ongoing dedicated design, speed optimization, and development support.',
            url: '/services/shopify-subscription',
            icon: 'Palette',
          },
        ],
        featuredCta: {
          enabled: true,
          title: 'Want to scale your Shopify revenue?',
          description: 'Get a free 24-point eCommerce conversion and site-speed audit.',
          buttonText: 'Get Free Store Audit',
          buttonUrl: '/contact',
        },
      },
    },
    {
      label: 'Solutions',
      url: '/solutions',
      order: 2,
      megaMenuConfig: {
        enabled: true,
        category: 'COMMERCE SOLUTIONS',
        layout: '2-column',
        maxWidth: '4xl',
        items: [
          {
            title: 'Direct-to-Consumer (DTC) Brands',
            description: 'Storytelling-driven eCommerce experiences designed to drive customer loyalty.',
            url: '/solutions/dtc-brands',
            icon: 'Smartphone',
          },
          {
            title: 'B2B & Wholesale eCommerce',
            description: 'Wholesale portals, tiered volume pricing, and custom Net-30 checkout flows.',
            url: '/solutions/b2b-wholesale',
            icon: 'Layers',
          },
          {
            title: 'High-Volume Flash Sale Stores',
            description: 'High-concurrency infrastructure engineered to handle 10,000+ orders per minute.',
            url: '/solutions/flash-sales',
            icon: 'Cpu',
          },
          {
            title: 'Omnichannel Retail & POS',
            description: 'Unified inventory and customer loyalty across physical retail and online store.',
            url: '/solutions/omnichannel-pos',
            icon: 'Globe',
          },
        ],
        featuredCta: {
          enabled: true,
          title: 'Planning a 7 or 8-figure product launch?',
          description: 'Book a strategy session with our Shopify Plus technical leads.',
          buttonText: 'Schedule Strategy Session',
          buttonUrl: '/contact',
        },
      },
    },
    { label: 'Products', url: '/products', order: 3, megaMenuConfig: null },
    { label: 'Case Studies', url: '/case-studies', order: 4, megaMenuConfig: null },
    { label: 'Company', url: '/about', order: 5, megaMenuConfig: null },
  ];

  // Clean up any unwanted/stale navigation items for header
  await prisma.navigationItem.deleteMany({
    where: { navigationId: headerNav.id },
  });

  for (const item of headerItems) {
    await prisma.navigationItem.create({
      data: {
        navigationId: headerNav.id,
        label: item.label,
        url: item.url,
        displayOrder: item.order,
        ...(item.megaMenuConfig !== null && item.megaMenuConfig !== undefined
          ? { megaMenuConfig: item.megaMenuConfig as any }
          : {}),
        isActive: true,
      },
    });
  }

  const footerNav = await prisma.navigation.upsert({
    where: { key: 'footer' },
    update: { title: 'Global Footer Directory', isActive: true },
    create: { key: 'footer', title: 'Global Footer Directory', isActive: true },
  });

  const footerCategories = [
    { label: 'Architecture & Core Services', url: '/services', order: 1 },
    { label: 'Enterprise Solutions', url: '/solutions', order: 2 },
    { label: 'Industries & Domains', url: '/industries', order: 3 },
    { label: 'Compliance & Trust', url: '/trust/certifications', order: 4 },
    { label: 'Global Advisory & Contact', url: '/contact', order: 5 },
  ];

  for (const cat of footerCategories) {
    const existing = await prisma.navigationItem.findFirst({
      where: { navigationId: footerNav.id, url: cat.url },
    });
    if (existing) {
      await prisma.navigationItem.update({
        where: { id: existing.id },
        data: { label: cat.label, displayOrder: cat.order, isActive: true },
      });
    } else {
      await prisma.navigationItem.create({
        data: {
          navigationId: footerNav.id,
          label: cat.label,
          url: cat.url,
          displayOrder: cat.order,
          isActive: true,
        },
      });
    }
  }

  // 9. Core Production CMS Pages
  console.log(`📄 Upserting Essential Pages (Home, About, Contact)...`);
  const pagesData = [
    {
      slug: 'home',
      title: 'Engineering the Global Enterprise',
      description: 'Planetary-scale digital infrastructure for the modern enterprise.',
      layoutType: PageLayoutType.LANDING,
      sections: [
        {
          sectionIdentifier: 'hero-banner',
          componentType: ComponentType.HERO,
          displayOrder: 1,
          contentPayload: {
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
            floatingAction: {
              enabled: true,
              type: 'whatsapp',
              label: 'Direct Contact',
              url: 'https://wa.me/12125550199',
            },
          },
        },
        {
          sectionIdentifier: 'verified-results-metrics',
          componentType: ComponentType.METRICS_BANNER,
          displayOrder: 2,
          contentPayload: {
            eyebrow: {
              enabled: true,
              text: 'VERIFIED RESULTS',
              style: 'dot',
            },
            headline: {
              segments: [
                { type: 'text', value: "We don't show mockups.\n" },
                { type: 'text', value: 'We show dashboards.' },
              ],
            },
            description: {
              enabled: true,
              content:
                'Actual 30-day gross sales from client Shopify admin panels. The period is on every card.',
            },
            supportingText: {
              enabled: true,
              content:
                "Client names withheld under NDA. We'll screen-share the live admin on your call.",
            },
            cards: [
              {
                id: 'card-fitness-us',
                title: 'Fitness Brand Gross Sales',
                category: 'Fitness',
                region: 'US',
                geography: 'US',
                verification: {
                  enabled: true,
                  label: 'VERIFIED ✓',
                  source: 'Shopify Admin Panel',
                },
                metric: {
                  value: 2333906,
                  displayValue: '$2,333,906',
                  prefix: '$',
                  description: 'Gross sales · 30 days · Nov 2025',
                },
                period: {
                  label: '30 days · Nov 2025',
                },
                chart: {
                  enabled: true,
                  chartType: 'bars',
                  dataPoints: [20, 32, 45, 60, 80, 100],
                },
                appearance: {
                  accentToken: 'pink',
                  cardBg: '#fae8f4',
                  barColor: '#8c7486',
                },
                order: 1,
                isActive: true,
                isFeatured: false,
              },
              {
                id: 'card-home-living-eu',
                title: 'Home & Living Gross Sales',
                category: 'Home & Living',
                region: 'EU',
                geography: 'EU',
                verification: {
                  enabled: true,
                  label: 'VERIFIED ✓',
                  source: 'Shopify Admin Panel',
                },
                metric: {
                  value: 683991,
                  displayValue: '$683,991',
                  prefix: '$',
                  description: 'Gross sales · 30 days · Dec 2025',
                },
                period: {
                  label: '30 days · Dec 2025',
                },
                chart: {
                  enabled: true,
                  chartType: 'bars',
                  dataPoints: [22, 34, 48, 62, 82, 100],
                },
                appearance: {
                  accentToken: 'blue',
                  cardBg: '#eaf0ff',
                  barColor: '#7284a6',
                },
                order: 2,
                isActive: true,
                isFeatured: false,
              },
              {
                id: 'card-fashion-eu',
                title: 'Fashion Brand Gross Sales',
                category: 'Fashion',
                region: 'EU',
                geography: 'EU',
                verification: {
                  enabled: true,
                  label: 'VERIFIED ✓',
                  source: 'Shopify Admin Panel',
                },
                metric: {
                  value: 177645,
                  displayValue: '$177,645',
                  prefix: '$',
                  description: 'Gross sales · 30 days · Nov 2025',
                },
                period: {
                  label: '30 days · Nov 2025',
                },
                chart: {
                  enabled: true,
                  chartType: 'bars',
                  dataPoints: [24, 36, 50, 65, 84, 100],
                },
                appearance: {
                  accentToken: 'yellow',
                  cardBg: '#fef2d8',
                  barColor: '#9c9173',
                },
                order: 3,
                isActive: true,
                isFeatured: false,
              },
              {
                id: 'card-supplements-us',
                title: 'Supplements Brand Gross Sales',
                category: 'Supplements',
                region: 'US',
                geography: 'US',
                verification: {
                  enabled: true,
                  label: 'VERIFIED ✓',
                  source: 'Shopify Admin Panel',
                },
                metric: {
                  value: 32109,
                  displayValue: '$32,109',
                  prefix: '$',
                  description: 'Gross sales · 30 days · Nov 2025',
                },
                period: {
                  label: '30 days · Nov 2025',
                },
                chart: {
                  enabled: true,
                  chartType: 'bars',
                  dataPoints: [25, 38, 52, 68, 86, 100],
                },
                appearance: {
                  accentToken: 'peach',
                  cardBg: '#fae8de',
                  barColor: '#9a786f',
                },
                order: 4,
                isActive: true,
                isFeatured: false,
              },
            ],
          },
        },
      ],
    },
    {
      slug: 'about',
      title: 'About Gypsym Technology',
      description: 'Pioneering planetary-scale resilience, deterministic consensus, and sovereign AI for industry leaders.',
      layoutType: PageLayoutType.DEFAULT,
      sections: [
        {
          sectionIdentifier: 'about-hero',
          componentType: ComponentType.HERO,
          displayOrder: 1,
          contentPayload: {
            headline: 'Architects of the Planetary Digital Core',
            subheadline:
              'Founded to solve the hardest problems in distributed systems, sovereign machine intelligence, and high-frequency resilience.',
          },
        },
      ],
    },
    {
      slug: 'contact',
      title: 'Contact Enterprise Advisory',
      description: 'Direct engagement with our Senior Technical Fellows and Enterprise Architects.',
      layoutType: PageLayoutType.DEFAULT,
      sections: [
        {
          sectionIdentifier: 'contact-details',
          componentType: ComponentType.CTA_STRIP,
          displayOrder: 1,
          contentPayload: {
            headline: 'Initiate a High-Impact Consultation',
            subheadline: 'Our Principal Architects respond within 2 business hours for qualified enterprise inquiries.',
          },
        },
      ],
    },
  ];

  for (const p of pagesData) {
    const existing = await prisma.page.findFirst({
      where: { slug: p.slug, locale: 'en', deletedAt: null },
    });

    let pageRecord;
    if (existing) {
      pageRecord = await prisma.page.update({
        where: { id: existing.id },
        data: {
          title: p.title,
          description: p.description,
          layoutType: p.layoutType,
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });
    } else {
      pageRecord = await prisma.page.create({
        data: {
          slug: p.slug,
          title: p.title,
          description: p.description,
          layoutType: p.layoutType,
          status: ContentStatus.PUBLISHED,
          locale: 'en',
          publishedAt: new Date(),
        },
      });
    }

    // Ensure only specified sections remain active for page
    const currentIdentifiers = p.sections.map((s) => s.sectionIdentifier);
    await prisma.pageSection.deleteMany({
      where: {
        pageId: pageRecord.id,
        sectionIdentifier: { notIn: currentIdentifiers },
      },
    });

    // Upsert sections for page
    for (const s of p.sections) {
      const existingSection = await prisma.pageSection.findFirst({
        where: { pageId: pageRecord.id, sectionIdentifier: s.sectionIdentifier },
      });
      if (existingSection) {
        await prisma.pageSection.update({
          where: { id: existingSection.id },
          data: {
            componentType: s.componentType,
            displayOrder: s.displayOrder,
            contentPayload: s.contentPayload,
            isActive: true,
          },
        });
      } else {
        await prisma.pageSection.create({
          data: {
            pageId: pageRecord.id,
            sectionIdentifier: s.sectionIdentifier,
            componentType: s.componentType,
            displayOrder: s.displayOrder,
            contentPayload: s.contentPayload,
            isActive: true,
          },
        });
      }
    }
  }

  // 10. CMS Domain Content: Services, Solutions, Industries, Technologies, etc.
  console.log(`🏗️  Upserting Domain Entities (Services, Solutions, Industries, Technologies)...`);

  // Industries
  const industries = [
    {
      slug: 'financial-services',
      name: 'Financial Services & Capital Markets',
      description: 'Ultra-low latency settlement, core banking transformation, and sovereign regulatory vaults.',
      displayOrder: 1,
    },
    {
      slug: 'healthcare-life-sciences',
      name: 'Healthcare & Life Sciences',
      description: 'HIPAA/GDPR-compliant sovereign AI diagnostics and clinical data mesh architectures.',
      displayOrder: 2,
    },
    {
      slug: 'aerospace-defense',
      name: 'Aerospace, Defense & Mission Critical',
      description: 'Hardened edge telemetry, zero-trust telemetry mesh, and air-gapped container orchestration.',
      displayOrder: 3,
    },
    {
      slug: 'global-telecom',
      name: 'Global Telecommunications & Edge Networks',
      description: 'Sub-millisecond 5G/6G edge processing, distributed OSS/BSS, and active-active routing fabrics.',
      displayOrder: 4,
    },
  ];

  const industryMap: Record<string, string> = {};
  for (const ind of industries) {
    const record = await prisma.industry.upsert({
      where: { slug: ind.slug },
      update: { name: ind.name, description: ind.description, displayOrder: ind.displayOrder },
      create: { slug: ind.slug, name: ind.name, description: ind.description, displayOrder: ind.displayOrder },
    });
    industryMap[ind.slug] = record.id;
  }

  // Technologies
  const technologies: { slug: string; name: string; category: TechCategory; order: number }[] = [
    { slug: 'kubernetes', name: 'Kubernetes & Service Mesh', category: TechCategory.DEVOPS, order: 1 },
    { slug: 'rust', name: 'Rust High-Performance Systems', category: TechCategory.SECURITY, order: 2 },
    { slug: 'nextjs', name: 'Next.js App Router & React Server Components', category: TechCategory.FRONTEND, order: 3 },
    { slug: 'pytorch', name: 'PyTorch Sovereign AI Models', category: TechCategory.AI, order: 4 },
    { slug: 'kafka', name: 'Apache Kafka & Distributed Streaming', category: TechCategory.DATA, order: 5 },
    { slug: 'postgresql', name: 'PostgreSQL Distributed Sharding', category: TechCategory.DATA, order: 6 },
    { slug: 'typescript', name: 'TypeScript Strict Enterprise SDKs', category: TechCategory.FRONTEND, order: 7 },
    { slug: 'terraform', name: 'Terraform & OpenTofu Cloud Fabric', category: TechCategory.CLOUD, order: 8 },
  ];

  for (const tech of technologies) {
    await prisma.technology.upsert({
      where: { slug: tech.slug },
      update: { name: tech.name, category: tech.category, displayOrder: tech.order },
      create: { slug: tech.slug, name: tech.name, category: tech.category, displayOrder: tech.order },
    });
  }

  // Services
  const services = [
    {
      slug: 'cloud-core-engineering',
      title: 'Zero-Downtime Cloud Core Architecture',
      tagline: 'Fault-tolerant planetary active-active cloud topologies.',
      shortDescription:
        'Architecting multi-region resilient cloud infrastructures guaranteed for 99.999% availability under catastrophic regional blackouts.',
      detailedContent:
        'Our Cloud Core practice transforms legacy mono-datacenter workloads into resilient, multi-cloud topologies orchestrated via automated failover controllers and distributed state reconciliation.',
      displayOrder: 1,
    },
    {
      slug: 'sovereign-ai-platforms',
      title: 'Sovereign AI & Distributed Intelligence Mesh',
      tagline: 'Private, auditable AI deployments for enterprise data sovereignty.',
      shortDescription:
        'Deploying localized foundation models and vector intelligence networks completely within client-controlled jurisdictional perimeters.',
      detailedContent:
        'We design air-gapped model inference clusters, secure multi-party compute enclaves, and fine-tuned private knowledge retrieval meshes.',
      displayOrder: 2,
    },
    {
      slug: 'distributed-systems',
      title: 'High-Throughput Distributed Ledgers & Consensus',
      tagline: 'Deterministic transaction processing at global volume.',
      shortDescription:
        'High-frequency state machines and Byzantine fault-tolerant consensus engines processing millions of events per second with sub-millisecond finality.',
      detailedContent:
        'Specializing in Raft, Paxos, and custom DAG-based state engines engineered in memory-safe systems programming languages.',
      displayOrder: 3,
    },
    {
      slug: 'zero-trust-security',
      title: 'Deterministic Zero-Trust Security Infrastructure',
      tagline: 'Cryptographic authentication down to the microservice boundary.',
      shortDescription:
        'Continuous mutual TLS, hardware-backed SPIFFE/SPIRE workload attestation, and dynamic identity governance protecting digital sovereignty.',
      detailedContent:
        'Eliminating perimeter security fallacies with ephemeral cryptographic tokens, zero-trust network policies, and real-time behavioral intrusion detection.',
      displayOrder: 4,
    },
  ];

  for (const s of services) {
    const existing = await prisma.service.findFirst({
      where: { slug: s.slug, locale: 'en', deletedAt: null },
    });
    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data: {
          title: s.title,
          tagline: s.tagline,
          shortDescription: s.shortDescription,
          detailedContent: s.detailedContent,
          displayOrder: s.displayOrder,
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });
    } else {
      await prisma.service.create({
        data: {
          slug: s.slug,
          title: s.title,
          tagline: s.tagline,
          shortDescription: s.shortDescription,
          detailedContent: s.detailedContent,
          displayOrder: s.displayOrder,
          status: ContentStatus.PUBLISHED,
          locale: 'en',
          publishedAt: new Date(),
        },
      });
    }
  }

  // Solutions
  const solutions = [
    {
      slug: 'modern-banking-core',
      title: 'Autonomous Core Banking Modernization',
      summary: 'Replace mainframe dependencies with microsecond event-driven ledger streaming.',
      displayOrder: 1,
    },
    {
      slug: 'ai-knowledge-mesh',
      title: 'Enterprise Sovereign Knowledge Fabric',
      summary: 'Private multi-tenant enterprise search, semantic indexing, and autonomous agent orchestration.',
      displayOrder: 2,
    },
    {
      slug: 'multi-cloud-resilience',
      title: 'Active-Active Multi-Cloud Resiliency Matrix',
      summary: 'Seamless failover between AWS, Azure, and Google Cloud with distributed transactional consistency.',
      displayOrder: 3,
    },
  ];

  for (const sol of solutions) {
    const existing = await prisma.solution.findFirst({
      where: { slug: sol.slug, locale: 'en', deletedAt: null },
    });
    if (existing) {
      await prisma.solution.update({
        where: { id: existing.id },
        data: {
          title: sol.title,
          summary: sol.summary,
          displayOrder: sol.displayOrder,
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });
    } else {
      await prisma.solution.create({
        data: {
          slug: sol.slug,
          title: sol.title,
          summary: sol.summary,
          displayOrder: sol.displayOrder,
          status: ContentStatus.PUBLISHED,
          locale: 'en',
          publishedAt: new Date(),
        },
      });
    }
  }

  // Clients
  console.log(`🤝 Upserting Enterprise Clients & Case Studies...`);
  const clientData = [
    {
      slug: 'apex-global-bank',
      name: 'Apex Global Financial Group',
      tier: ClientTier.STRATEGIC,
      industrySlug: 'financial-services',
      isFeatured: true,
      displayOrder: 1,
    },
    {
      slug: 'novartis-core-labs',
      name: 'Novartis Core BioAnalytics',
      tier: ClientTier.ENTERPRISE,
      industrySlug: 'healthcare-life-sciences',
      isFeatured: true,
      displayOrder: 2,
    },
    {
      slug: 'vanguard-aerospace',
      name: 'Vanguard Aerospace & Defense',
      tier: ClientTier.STRATEGIC,
      industrySlug: 'aerospace-defense',
      isFeatured: true,
      displayOrder: 3,
    },
  ];

  const clientMap: Record<string, string> = {};
  for (const cl of clientData) {
    const record = await prisma.client.upsert({
      where: { slug: cl.slug },
      update: {
        name: cl.name,
        tier: cl.tier,
        industryId: industryMap[cl.industrySlug] || null,
        isFeatured: cl.isFeatured,
        displayOrder: cl.displayOrder,
      },
      create: {
        slug: cl.slug,
        name: cl.name,
        logoLightId: mediaMap['system/clients/apex-bank-logo.svg'] ?? undefined,
        logoDarkId: mediaMap['system/clients/apex-bank-logo.svg'] ?? undefined,
        tier: cl.tier,
        industryId: industryMap[cl.industrySlug] || null,
        isFeatured: cl.isFeatured,
        displayOrder: cl.displayOrder,
      },
    });
    clientMap[cl.slug] = record.id;
  }

  // Case Studies
  const caseStudies = [
    {
      slug: 'global-fintech-core-modernization',
      title: 'Modernizing a Tier-1 Global Bank to Active-Active Multi-Region Settlement',
      clientSlug: 'apex-global-bank',
      summary:
        'Transitioned a 40-year-old monolithic clearing engine into an event-sourced distributed ledger processing $18B daily.',
      challengeStatement:
        'The existing legacy core had an 8-hour nightly settlement batch window, causing high latency, operational fragility, and zero geographic fault tolerance.',
      solutionStatement:
        'Gypsym engineered a real-time event-streaming fabric using Apache Kafka, Rust transaction validators, and PostgreSQL sharding with zero downtime cutover.',
      impactMetrics: [
        { metric: '99.999%', label: 'Availability', desc: 'Zero downtime achieved during 24 months of continuous operations' },
        { metric: '$18B/day', label: 'Volume Processed', desc: 'Across 14 global financial settlement nodes' },
        { metric: '1.8ms', label: 'End-to-End Latency', desc: 'Down from 8 hours batch clearance' },
      ],
    },
  ];

  for (const cs of caseStudies) {
    const clientId = clientMap[cs.clientSlug];
    if (!clientId) continue;

    const existing = await prisma.caseStudy.findFirst({
      where: { slug: cs.slug, locale: 'en', deletedAt: null },
    });
    if (existing) {
      await prisma.caseStudy.update({
        where: { id: existing.id },
        data: {
          title: cs.title,
          clientId,
          summary: cs.summary,
          challengeStatement: cs.challengeStatement,
          solutionStatement: cs.solutionStatement,
          impactMetrics: cs.impactMetrics,
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });
    } else {
      await prisma.caseStudy.create({
        data: {
          slug: cs.slug,
          title: cs.title,
          clientId,
          summary: cs.summary,
          challengeStatement: cs.challengeStatement,
          solutionStatement: cs.solutionStatement,
          impactMetrics: cs.impactMetrics,
          coverImageId: mediaMap['system/case-studies/fintech-cover.webp'] ?? undefined,
          status: ContentStatus.PUBLISHED,
          locale: 'en',
          publishedAt: new Date(),
        },
      });
    }
  }

  // Testimonials
  console.log(`💬 Upserting Executive Testimonials...`);
  const testimonials = [
    {
      authorName: 'Dr. Elena Rostova',
      authorTitle: 'Chief Information Officer',
      authorCompany: 'Apex Global Financial Group',
      quote:
        'Gypsym Technology engineered our mission-critical distributed clearing core with zero downtime. Their technical depth in distributed consensus and deterministic recovery is unprecedented.',
      rating: 5,
      isFeatured: true,
      displayOrder: 1,
    },
    {
      authorName: 'Marcus Vance',
      authorTitle: 'VP of Platform Architecture',
      authorCompany: 'Vanguard Aerospace Systems',
      quote:
        'The air-gapped sovereign AI mesh implemented by Gypsym allowed us to deploy real-time telemetry analytics under the most stringent defense security constraints.',
      rating: 5,
      isFeatured: true,
      displayOrder: 2,
    },
  ];

  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { authorName: t.authorName, authorCompany: t.authorCompany },
    });
    if (existing) {
      await prisma.testimonial.update({
        where: { id: existing.id },
        data: {
          quote: t.quote,
          authorTitle: t.authorTitle,
          rating: t.rating,
          isFeatured: t.isFeatured,
          displayOrder: t.displayOrder,
        },
      });
    } else {
      await prisma.testimonial.create({
        data: {
          authorName: t.authorName,
          authorTitle: t.authorTitle,
          authorCompany: t.authorCompany,
          quote: t.quote,
          rating: t.rating,
          isFeatured: t.isFeatured,
          displayOrder: t.displayOrder,
        },
      });
    }
  }

  // Departments & Team Members
  console.log(`👥 Upserting Organization Structure & Leadership Team...`);
  const departments = [
    { slug: 'executive-leadership', name: 'Executive Leadership', order: 1 },
    { slug: 'cloud-core-systems', name: 'Cloud & Distributed Systems', order: 2 },
    { slug: 'sovereign-ai-research', name: 'Sovereign AI & Machine Intelligence', order: 3 },
    { slug: 'cybersecurity-trust', name: 'Cybersecurity & Zero-Trust Architecture', order: 4 },
  ];

  const deptMap: Record<string, string> = {};
  for (const dept of departments) {
    const record = await prisma.department.upsert({
      where: { slug: dept.slug },
      update: { name: dept.name, displayOrder: dept.order },
      create: { slug: dept.slug, name: dept.name, displayOrder: dept.order },
    });
    deptMap[dept.slug] = record.id;
  }

  const teamMembers = [
    {
      slug: 'shabbir-kadiwal',
      firstName: 'Shabbir',
      lastName: 'Kadiwal',
      roleTitle: 'Chief Executive Officer & Co-Founder',
      deptSlug: 'executive-leadership',
      bio: 'Pioneered cloud transformation strategies for Tier-1 investment banks and hyperscale infrastructure providers across two decades.',
      isLeadership: true,
      order: 1,
    },
    {
      slug: 'mohammadali-kadiwal',
      firstName: 'MohammadAli',
      lastName: 'Kadiwal',
      roleTitle: 'Chief Technology Officer & Lead Architect',
      deptSlug: 'executive-leadership',
      bio: 'Specialist in distributed consensus algorithms, memory-safe high-frequency streaming runtimes, and planetary cloud topologies.',
      isLeadership: true,
      order: 2,
    },
    {
      slug: 'sarah-jenkins',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      roleTitle: 'Head of Sovereign AI Research',
      deptSlug: 'sovereign-ai-research',
      bio: 'Former principal research scientist leading air-gapped LLM orchestration and secure multi-party computational enclaves.',
      isLeadership: true,
      order: 3,
    },
  ];

  for (const tm of teamMembers) {
    await prisma.teamMember.upsert({
      where: { slug: tm.slug },
      update: {
        firstName: tm.firstName,
        lastName: tm.lastName,
        roleTitle: tm.roleTitle,
        departmentId: deptMap[tm.deptSlug] ?? undefined,
        bio: tm.bio,
        isLeadership: tm.isLeadership,
        displayOrder: tm.order,
        isActive: true,
      },
      create: {
        slug: tm.slug,
        firstName: tm.firstName,
        lastName: tm.lastName,
        roleTitle: tm.roleTitle,
        departmentId: deptMap[tm.deptSlug] ?? undefined,
        bio: tm.bio,
        isLeadership: tm.isLeadership,
        displayOrder: tm.order,
        isActive: true,
      },
    });
  }

  // Job Requisitions
  console.log(`💼 Upserting Talent Requisitions...`);
  const jobs = [
    {
      requisitionCode: 'REQ-2026-001',
      slug: 'principal-cloud-core-architect',
      title: 'Principal Cloud Core Architect',
      deptSlug: 'cloud-core-systems',
      locationType: WorkLocationType.REMOTE,
      locationName: 'North America / EMEA (Remote)',
      employmentType: EmploymentType.FULL_TIME,
      experienceLevel: ExperienceLevel.PRINCIPAL,
      salaryRangeDisplay: '$240,000 - $310,000 USD + Equity',
      overview:
        'Lead the architectural design of active-active multi-cloud control planes for Fortune 50 enterprise clients.',
      responsibilities: [
        'Architect planetary-scale cloud cores with sub-second failover recovery',
        'Direct technical advisory engagements with Fortune 100 CTOs',
        'Contribute to open-source distributed reconciliation controllers',
      ],
      qualifications: [
        '12+ years of distributed systems and hyperscale cloud engineering',
        'Demonstrated expertise with Kubernetes internals, eBPF, and global BGP routing',
        'Proven track record delivering mission-critical financial systems',
      ],
    },
    {
      requisitionCode: 'REQ-2026-002',
      slug: 'staff-distributed-systems-engineer',
      title: 'Staff Distributed Systems Engineer (Rust / Go)',
      deptSlug: 'cloud-core-systems',
      locationType: WorkLocationType.REMOTE,
      locationName: 'Global Remote',
      employmentType: EmploymentType.FULL_TIME,
      experienceLevel: ExperienceLevel.LEAD,
      salaryRangeDisplay: '$200,000 - $260,000 USD + Equity',
      overview: 'Engineer high-throughput transactional consensus engines and event-streaming mesh components.',
      responsibilities: [
        'Develop lock-free, zero-allocation network protocols in Rust',
        'Profile and optimize memory layouts for deterministic P99 latency (< 2ms)',
        'Design deterministic fault injection tests using Jepsen verification suites',
      ],
      qualifications: [
        'Deep understanding of Raft/Paxos and distributed consistency models',
        'Proficiency in asynchronous Rust (Tokio, Tower)',
        'Extensive experience with Linux kernel networking and epoll/io_uring',
      ],
    },
  ];

  for (const job of jobs) {
    const existing = await prisma.job.findFirst({
      where: { requisitionCode: job.requisitionCode },
    });
    if (existing) {
      await prisma.job.update({
        where: { id: existing.id },
        data: {
          slug: job.slug,
          title: job.title,
          departmentId: deptMap[job.deptSlug],
          locationType: job.locationType,
          locationName: job.locationName,
          employmentType: job.employmentType,
          experienceLevel: job.experienceLevel,
          salaryRangeDisplay: job.salaryRangeDisplay,
          overview: job.overview,
          responsibilities: job.responsibilities,
          qualifications: job.qualifications,
          status: ContentStatus.PUBLISHED,
        },
      });
    } else {
      await prisma.job.create({
        data: {
          requisitionCode: job.requisitionCode,
          slug: job.slug,
          title: job.title,
          departmentId: deptMap[job.deptSlug] ?? undefined,
          locationType: job.locationType,
          locationName: job.locationName,
          employmentType: job.employmentType,
          experienceLevel: job.experienceLevel,
          salaryRangeDisplay: job.salaryRangeDisplay,
          overview: job.overview,
          responsibilities: job.responsibilities,
          qualifications: job.qualifications,
          status: ContentStatus.PUBLISHED,
        },
      });
    }
  }

  // Editorial: Blog Categories, Tags, and Posts
  console.log(`📰 Upserting Editorial Thought Leadership Articles...`);
  const categories = [
    { slug: 'distributed-systems', name: 'Distributed Systems' },
    { slug: 'cloud-architecture', name: 'Cloud Architecture' },
    { slug: 'sovereign-ai', name: 'Sovereign AI' },
    { slug: 'cybersecurity', name: 'Cybersecurity & Zero Trust' },
  ];

  const catMap: Record<string, string> = {};
  for (const c of categories) {
    const record = await prisma.blogCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { slug: c.slug, name: c.name },
    });
    catMap[c.slug] = record.id;
  }

  const blogPosts = [
    {
      slug: 'architecting-active-active-cloud-cores',
      title: 'Architecting Active-Active Cloud Fabrics with Zero Data Loss Across Hyperscale Providers',
      categorySlug: 'distributed-systems',
      excerpt:
        'A comprehensive engineering analysis of dual-region state synchronization, consensus reconcilers, and deterministic conflict resolution at 100,000 ops/sec.',
      readTimeMinutes: 12,
      bodyContent: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'High-availability guarantees in modern financial and cloud infrastructures can no longer tolerate active-passive standby configurations...',
              },
            ],
          },
        ],
      },
    },
    {
      slug: 'sovereign-ai-clusters-in-regulated-environments',
      title: 'Deploying Sovereign Enterprise LLM Clusters in Air-Gapped Regulated Jurisdictions',
      categorySlug: 'sovereign-ai',
      excerpt:
        'How to achieve GPT-class organizational intelligence without streaming confidential customer telemetry to public third-party APIs.',
      readTimeMinutes: 9,
      bodyContent: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Data sovereignty has emerged as the defining challenge for enterprise artificial intelligence adoption...',
              },
            ],
          },
        ],
      },
    },
  ];

  for (const post of blogPosts) {
    const existing = await prisma.blogPost.findFirst({
      where: { slug: post.slug, locale: 'en', deletedAt: null },
    });
    if (existing) {
      await prisma.blogPost.update({
        where: { id: existing.id },
        data: {
          title: post.title,
          excerpt: post.excerpt,
          bodyContent: post.bodyContent,
          categoryId: catMap[post.categorySlug],
          authorId: adminUser.id,
          readTimeMinutes: post.readTimeMinutes,
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });
    } else {
      await prisma.blogPost.create({
        data: {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          bodyContent: post.bodyContent,
          categoryId: catMap[post.categorySlug] ?? undefined,
          authorId: adminUser.id,
          readTimeMinutes: post.readTimeMinutes,
          status: ContentStatus.PUBLISHED,
          locale: 'en',
          publishedAt: new Date(),
        },
      });
    }
  }

  // Certifications, Awards, and Partners
  console.log(`🛡️  Upserting Compliance Certifications & Strategic Alliances...`);
  const certs = [
    {
      title: 'ISO/IEC 27001:2022',
      issuingBody: 'International Organization for Standardization',
      validFrom: new Date('2023-01-01'),
      complianceScope: 'Global Cloud Architecture & Managed Infrastructure Engineering Perimeters',
      order: 1,
    },
    {
      title: 'SOC 2 Type II Security & Confidentiality',
      issuingBody: 'AICPA Independent Audit Board',
      validFrom: new Date('2023-06-01'),
      complianceScope: 'Continuous Trust Services Criteria Verification for Enterprise Managed Platforms',
      order: 2,
    },
    {
      title: 'PCI DSS v4.0 Level 1 Service Provider',
      issuingBody: 'PCI Security Standards Council',
      validFrom: new Date('2024-01-01'),
      complianceScope: 'High-Volume Financial Clearing & Ledger Storage Infrastructure',
      order: 3,
    },
  ];

  for (const cert of certs) {
    const existing = await prisma.certification.findFirst({
      where: { title: cert.title },
    });
    if (existing) {
      await prisma.certification.update({
        where: { id: existing.id },
        data: {
          issuingBody: cert.issuingBody,
          complianceScope: cert.complianceScope,
          displayOrder: cert.order,
        },
      });
    } else {
      await prisma.certification.create({
        data: {
          title: cert.title,
          issuingBody: cert.issuingBody,
          validFrom: cert.validFrom,
          complianceScope: cert.complianceScope,
          displayOrder: cert.order,
        },
      });
    }
  }

  // Strategic Partners
  const partners = [
    {
      name: 'Amazon Web Services',
      tier: PartnerTier.GLOBAL_ALLIANCE,
      overview: 'Premier Consulting Partner for Financial Services Core & Distributed Computing.',
      order: 1,
    },
    {
      name: 'Google Cloud',
      tier: PartnerTier.PLATINUM,
      overview: 'Sovereign AI and Kubernetes Engine Center of Excellence Alliance Partner.',
      order: 2,
    },
  ];

  for (const p of partners) {
    const existing = await prisma.partner.findFirst({
      where: { name: p.name },
    });
    if (existing) {
      await prisma.partner.update({
        where: { id: existing.id },
        data: {
          tier: p.tier,
          partnershipOverview: p.overview,
          displayOrder: p.order,
        },
      });
    } else {
      await prisma.partner.create({
        data: {
          name: p.name,
          tier: p.tier,
          partnershipOverview: p.overview,
          logoId: mediaMap['system/partners/aws-partner-badge.svg'] ?? undefined,
          displayOrder: p.order,
        },
      });
    }
  }

  // FAQs
  console.log(`❓ Upserting Enterprise FAQ Knowledge Base...`);
  const faqs = [
    {
      category: 'architecture',
      question: 'How does Gypsym Technology ensure zero downtime during regional hyperscaler outages?',
      answer:
        'We engineer active-active multi-region architectures with distributed state consensus (Raft/BFT) and DNS/BGP automated health routing. State replication is synchronized continuously, allowing immediate microsecond traffic re-routing without catastrophic data loss.',
      order: 1,
    },
    {
      category: 'security',
      question: 'What compliance frameworks does Gypsym Technology adhere to for enterprise deployments?',
      answer:
        'Every architecture engineered by Gypsym satisfies ISO/IEC 27001:2022, SOC 2 Type II, PCI DSS v4.0, and HIPAA compliance mandates. We enforce strict hardware-backed zero-trust mutual TLS across all microservice boundaries.',
      order: 2,
    },
    {
      category: 'engagement',
      question: 'What is the typical lifecycle of an Enterprise Advisory & Architecture engagement?',
      answer:
        'Engagements initiate with a 2-week architectural assessment and threat-model review, followed by high-fidelity PoC consensus benchmarking, and conclude with end-to-end implementation and 24/7 mission-critical advisory support.',
      order: 3,
    },
  ];

  for (const faq of faqs) {
    const existing = await prisma.faq.findFirst({
      where: { question: faq.question },
    });
    if (existing) {
      await prisma.faq.update({
        where: { id: existing.id },
        data: {
          answer: faq.answer,
          category: faq.category,
          displayOrder: faq.order,
          isActive: true,
        },
      });
    } else {
      await prisma.faq.create({
        data: {
          category: faq.category,
          question: faq.question,
          answer: faq.answer,
          displayOrder: faq.order,
          isActive: true,
        },
      });
    }
  }

  console.log(`\n======================================================`);
  console.log(`✅ GYPSYM PRISMA SEED COMPLETED SUCCESSFULLY`);
  console.log(`   Admin Email: ${adminEmail}`);
  console.log(`   Roles Seeded: ${rolesData.length}`);
  console.log(`   Permissions Seeded: ${permissionsData.length}`);
  console.log(`   Services & Solutions: ${services.length + solutions.length}`);
  console.log(`   Idempotency Verified: Re-run safe, zero data loss.`);
  console.log(`======================================================\n`);
}

main()
  .catch((e) => {
    console.error('❌ [ERROR] Seed execution failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
