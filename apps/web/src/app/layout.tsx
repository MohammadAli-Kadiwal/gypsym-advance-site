import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ThemeProvider, themeInitScript } from '@/components/theme-provider';

const SearchModal = dynamic(
  () => import('@/components/search-modal').then((mod) => mod.SearchModal),
  { ssr: false }
);
import { DynamicBrandStyleTag } from '@/components/branding-provider';
import { SmoothScrollProvider } from '@/components/smooth-scroll-provider';
import { GlobalWebsiteLoader, RouteProgressBar } from '@/components/motion';
import { getHeaderData, getScriptSettings, getPublicGlobalSeo } from '@/lib/api';
import { ScriptInjector } from '@/components/script-injector';
import { getSiteUrl } from '@/lib/site-url';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPublicGlobalSeo().catch(() => null);

  const siteName = seo?.siteName || 'Gypsym Technology';
  const defaultTitle = seo?.defaultTitle || `${siteName} | Enterprise Architecture`;
  const template = seo?.metaTitleTemplate || `%s | ${siteName}`;
  const description = seo?.defaultDescription || undefined;
  const keywords = seo?.defaultKeywords || [];
  const baseUrl = seo?.siteUrl || seo?.canonicalBaseUrl || getSiteUrl();
  const ogImage = seo?.defaultOgImage || seo?.ogDefaultImage ? [{ url: seo.defaultOgImage || seo.ogDefaultImage }] : undefined;
  const twitterCard = (seo?.twitterCard as any) || 'summary_large_image';

  return {
    title: {
      default: defaultTitle,
      template: template,
    },
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    authors: seo?.defaultAuthor ? [{ name: seo.defaultAuthor }] : [{ name: siteName }],
    metadataBase: new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`),
    openGraph: {
      type: 'website',
      locale: seo?.defaultLocale || 'en_US',
      url: baseUrl,
      siteName: siteName,
      title: defaultTitle,
      description,
      images: ogImage,
    },
    twitter: {
      card: twitterCard,
      title: defaultTitle,
      description,
      images: ogImage?.[0]?.url ? [ogImage[0].url] : undefined,
      creator: seo?.twitterHandle || undefined,
    },
    icons: {
      icon: [
        {
          url: seo?.favicon || '/favicon.ico',
          type: (seo?.favicon?.includes('svg') || seo?.favicon?.startsWith('data:image/svg'))
            ? 'image/svg+xml'
            : 'image/x-icon',
        },
      ],
      shortcut: seo?.favicon || '/favicon.ico',
      apple: seo?.favicon || '/favicon.ico',
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
  const [headerData, scriptSettings, globalSeo] = await Promise.all([
    getHeaderData(),
    getScriptSettings().catch(() => null),
    getPublicGlobalSeo().catch(() => null),
  ]);

  const companyName = globalSeo?.organizationName || headerData.branding?.companyName || 'Gypsym Technology';
  const siteUrl = globalSeo?.siteUrl || getSiteUrl();
  const logoUrl = globalSeo?.organizationLogo || headerData.branding?.logoLight || `${siteUrl}/logo.svg`;
  const socialProfiles = (globalSeo?.socialProfiles || []).map((s) => s.url).filter(Boolean);

  // Dynamic Organization & WebSite JSON-LD Schema
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: companyName,
      url: siteUrl,
      logo: logoUrl,
      description: globalSeo?.organizationDescription || undefined,
      email: globalSeo?.email || undefined,
      telephone: globalSeo?.phone || undefined,
      address: globalSeo?.address
        ? {
            '@type': 'PostalAddress',
            streetAddress: globalSeo.address,
            addressCountry: globalSeo.country || undefined,
          }
        : undefined,
      sameAs: socialProfiles.length > 0 ? socialProfiles : undefined,
      contactPoint: globalSeo?.phone
        ? {
            '@type': 'ContactPoint',
            telephone: globalSeo.phone,
            contactType: 'Customer Service & Architecture Advisory',
            areaServed: 'Worldwide',
          }
        : undefined,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: companyName,
      url: siteUrl,
      description: globalSeo?.siteDescription || undefined,
    },
  ];

  const rawFavicon =
    globalSeo?.favicon && (globalSeo.favicon.startsWith('data:') || globalSeo.favicon.startsWith('http') || globalSeo.favicon.startsWith('/'))
      ? globalSeo.favicon
      : headerData.branding?.favicon || '/favicon.ico';
  const isSvg = rawFavicon.includes('svg') || rawFavicon.startsWith('data:image/svg');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type={isSvg ? 'image/svg+xml' : 'image/x-icon'} href={rawFavicon} />
        <link rel="shortcut icon" href={rawFavicon} />
        <link rel="apple-touch-icon" href={rawFavicon} />
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
        <DynamicBrandStyleTag tokens={{ faviconUrl: rawFavicon }} />
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
