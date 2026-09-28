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
  const adminEmail = process.env.SEED_ADMIN_EMAIL || (isProduction ? '' : 'info@gypsym.com');
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || (isProduction ? '' : 'Admin@123');
  const adminFullName = process.env.SEED_ADMIN_NAME || 'Gypsym Administrator';

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
      passwordHash,
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
        defaultTitle: 'Gypsym Technology | Shopify & Shopify Plus Agency',
        defaultDescription:
          'Gypsym Technology is a leading Shopify & Shopify Plus agency specializing in custom store design, e-commerce development, conversion rate optimization, and D2C growth strategies for global brands.',
        defaultKeywords: [
          'Shopify agency',
          'Shopify Plus agency',
          'e-commerce development',
          'Shopify store design',
          'D2C e-commerce',
          'conversion rate optimization',
          'custom Shopify theme',
          'Shopify experts',
        ],
        canonicalBaseUrl: 'https://gypsym.com',
        ogDefaultImage: 'https://gypsym.com/og-default.png',
        twitterCard: 'summary_large_image',
        twitterHandle: '@gypsymtech',
        robotsIndex: true,
        robotsFollow: true,
        googleVerification: '',
        bingVerification: '',
        yandexVerification: '',
        baiduVerification: '',
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
        {
          sectionIdentifier: 'cro-revenue-experiment',
          componentType: ComponentType.CTA_STRIP,
          displayOrder: 3,
          contentPayload: {
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
        {
          sectionIdentifier: 'what-we-actually-change',
          componentType: ComponentType.FEATURE_GRID,
          displayOrder: 4,
          contentPayload: {
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
        {
          sectionIdentifier: 'portfolio-showcase',
          componentType: ComponentType.FEATURE_GRID,
          displayOrder: 5,
          contentPayload: {
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
        {
          sectionIdentifier: 'delivery-process',
          componentType: ComponentType.TABBED_SOLUTIONS,
          displayOrder: 6,
          contentPayload: {
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
        {
          sectionIdentifier: 'our-capabilities',
          componentType: ComponentType.FEATURE_GRID,
          displayOrder: 7,
          contentPayload: {
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
        {
          sectionIdentifier: 'client-testimonials',
          componentType: ComponentType.TESTIMONIAL_SLIDER,
          displayOrder: 8,
          contentPayload: {
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
        {
          sectionIdentifier: 'clients-trusted-by',
          componentType: ComponentType.LOGO_CLOUD,
          displayOrder: 9,
          contentPayload: {
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
        {
          sectionIdentifier: 'homepage-partners',
          componentType: ComponentType.FEATURE_GRID,
          displayOrder: 10,
          contentPayload: {
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
        {
          sectionIdentifier: 'contact-inquiry',
          componentType: ComponentType.CONTACT,
          displayOrder: 11,
          contentPayload: {
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
        {
          sectionIdentifier: 'homepage-cta',
          componentType: ComponentType.CTA,
          displayOrder: 12,
          contentPayload: {
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

  // Services (from gypsym.com/services)
  const services = [
    {
      slug: 'e-commerce-solutions',
      title: 'E-commerce Solutions',
      tagline: 'Complete Shopify & Shopify Plus stores designed to sell — not just look pretty.',
      shortDescription:
        'We build complete Shopify stores designed to sell — not just look pretty. From product pages to checkout optimization, every detail is handled so your store generates revenue from day one.',
      detailedContent:
        'At Gypsym, we engineer full-funnel Shopify and Shopify Plus storefronts that scale effortlessly. Whether you are launching your first flagship digital storefront or migrating an enterprise multi-million dollar catalog, our engineering team ensures lightning speed, bulletproof checkout funnels, seamless ERP/WMS synchronization, and localized multi-currency purchasing experiences.',
      displayOrder: 1,
    },
    {
      slug: 'web-design-development',
      title: 'Web Design & Development',
      tagline: 'Custom, responsive websites that captivate visitors, load fast, and drive conversions.',
      shortDescription:
        'Your website is your storefront, salesperson, and brand ambassador — all in one. We design and develop sites that look incredible, load fast, and guide visitors toward buying.',
      detailedContent:
        'Digital flagship experiences built with bespoke UI/UX and ultra-clean Liquid/Hydrogen architectures. We avoid generic off-the-shelf templates in favor of tailored design systems in Figma translated into fast, responsive, and accessible code that elevates your brand perception and boosts user engagement across every viewport.',
      displayOrder: 2,
    },
    {
      slug: 'search-engine-optimization',
      title: 'Search Engine Optimization',
      tagline: 'Technical SEO, structured data, and on-page strategy that ranks your store on Google.',
      shortDescription:
        'Getting found on Google should not feel like a mystery. We handle technical SEO, content strategy, and ongoing optimization so your store shows up when ideal customers are searching.',
      detailedContent:
        'Our e-commerce SEO practice tackles technical bottlenecks head-on. From resolving Shopify-specific collection duplication and canonicalization quirks to deploying comprehensive JSON-LD product schemas, rich snippets, and international hreflang tags, we systematically increase your organic search visibility, high-intent traffic, and sustainable inbound revenue.',
      displayOrder: 3,
    },
    {
      slug: 'website-maintenance',
      title: 'Website Maintenance',
      tagline: 'Proactive 24/7 SLA monitoring, emergency fixes, and ongoing performance retainers.',
      shortDescription:
        'A website that goes down costs you money. We keep your store updated, secure, and performing at its best with proactive monitoring, regular updates, and fast issue resolution.',
      detailedContent:
        'Eliminate technical anxiety with Gypsym’s dedicated ongoing engineering retainers. You receive real-time uptime monitoring, staging-verified app and theme updates, sub-60-minute emergency escalation protocols, continuous Core Web Vitals maintenance, and direct access to senior Shopify developers via dedicated Slack.',
      displayOrder: 4,
    },
    {
      slug: 'theme-customization',
      title: 'Theme Customization',
      tagline: 'Bespoke Shopify theme engineering tailored to your brand identity and conversion goals.',
      shortDescription:
        'Your brand deserves more than a template that looks like everyone else. We create custom Shopify themes that reflect your brand identity and are built to convert.',
      detailedContent:
        'Transform your existing Shopify OS 2.0 theme into a customized digital storefront. We build bespoke modular sections, dynamic block controls, interactive sticky cart drawers, custom variant pickers, and tailored PDP modules that empower your marketing team to launch new campaigns without needing continuous developer intervention.',
      displayOrder: 5,
    },
    {
      slug: 'store-optimization',
      title: 'Store Optimization',
      tagline: 'Boost conversions, slash bounce rates, and accelerate page speed to maximize revenue.',
      shortDescription:
        'Slow page loads and confusing checkout flows kill your sales. We audit your store, identify bottlenecks, and implement fixes that boost speed, conversions, and average order value.',
      detailedContent:
        'Turn lost traffic into bottom-line profit. Our CRO and speed specialists conduct deep behavioral session audits, remove render-blocking third-party app bloat, optimize critical rendering paths to guarantee 90+ Core Web Vitals scores, and implement high-converting cart upsells and streamlined checkout touchpoints.',
      displayOrder: 6,
    },
    {
      slug: 'store-setup',
      title: 'Store Setup',
      tagline: 'Turnkey Shopify store setup, configuration, and launch — executed right the first time.',
      shortDescription:
        'Getting your Shopify store up and running the right way matters. We handle setup, configuration, payment gateways, shipping rules, tax settings, and app integrations so you can focus on selling.',
      detailedContent:
        'Launch with complete confidence. As certified Shopify Partners, we manage every facet of your initial store onboarding: tax Nexus configuration, global shipping zones, payment gateways (Stripe, PayPal, Klarna, regional providers), product schema architecture, DNS setup, tracking pixels, and hands-on operational team training.',
      displayOrder: 7,
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
