import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { SearchModal } from '@/components/search-modal';
import { ThemeProvider, themeInitScript } from '@/components/theme-provider';
import { DynamicBrandStyleTag } from '@/components/branding-provider';
import { SmoothScrollProvider } from '@/components/smooth-scroll-provider';
import { GlobalWebsiteLoader, RouteProgressBar } from '@/components/motion';
import { getHeaderData, getSeoSettings, getScriptSettings } from '@/lib/api';
import { ScriptInjector } from '@/components/script-injector';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings().catch(() => null);

  const defaultTitle = seo?.defaultTitle || 'Gypsym Technology | Shopify & Shopify Plus Agency';
  const template = seo?.metaTitleTemplate || '%s | Gypsym Technology';
  const description =
    seo?.defaultDescription ||
    'Gypsym Technology is a leading Shopify & Shopify Plus agency specializing in custom store design, e-commerce development, conversion rate optimization, and D2C growth strategies for global brands.';
  const keywords = seo?.defaultKeywords || [
    'Shopify agency',
    'Shopify Plus agency',
    'e-commerce development',
    'Shopify store design',
    'D2C e-commerce',
    'conversion rate optimization',
    'custom Shopify theme',
    'Shopify experts',
  ];
  const baseUrl = seo?.canonicalBaseUrl || 'https://gypsym.com';
  const ogImage = seo?.ogDefaultImage ? [{ url: seo.ogDefaultImage }] : undefined;
  const twitterCard = (seo?.twitterCard as any) || 'summary_large_image';

  return {
    title: {
      default: defaultTitle,
      template: template,
    },
    description,
    keywords,
    authors: [{ name: 'Gypsym Technology' }],
    metadataBase: new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`),
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: baseUrl,
      siteName: 'Gypsym Technology',
      title: defaultTitle,
      description,
      images: ogImage,
    },
    twitter: {
      card: twitterCard,
      title: defaultTitle,
      description,
      images: ogImage?.[0]?.url ? [ogImage[0].url] : undefined,
    },
    icons: {
      icon: '/favicon.ico',
    },
    robots: seo?.robotsIndex === false ? { index: false, follow: false } : { index: true, follow: true },
    verification: {
      google: seo?.googleVerification || undefined,
      other: {
        ...(seo?.bingVerification ? { 'msvalidate.01': seo.bingVerification } : {}),
        ...(seo?.yandexVerification ? { yandex: seo.yandexVerification } : {}),
      },
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [headerData, scriptSettings] = await Promise.all([
    getHeaderData(),
    getScriptSettings().catch(() => null),
  ]);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Corporation',
    name: headerData.branding?.companyName || 'Gypsym Technology',
    url: 'https://gypsym.com',
    logo: headerData.branding?.logoLight || 'https://gypsym.com/logo.svg',
    sameAs: [
      'https://linkedin.com/company/gypsym',
      'https://twitter.com/gypsymtech',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-212-555-0199',
      contactType: 'Enterprise Architecture Advisory',
      areaServed: 'Worldwide',
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          id="gypsym-theme-init"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <DynamicBrandStyleTag />
        <ScriptInjector settings={scriptSettings} />
      </head>
      <body className="min-h-screen flex flex-col justify-between bg-[#f4f3ef] text-neutral-900 antialiased selection:bg-lime-200">
        <ThemeProvider defaultTheme="light">
          <SmoothScrollProvider>
            <GlobalWebsiteLoader brand={headerData?.branding} />
            <RouteProgressBar />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <SearchModal />
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
