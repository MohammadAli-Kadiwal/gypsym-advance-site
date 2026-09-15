import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { SearchModal } from '@/components/search-modal';
import { ThemeProvider, themeInitScript } from '@/components/theme-provider';
import { DynamicBrandStyleTag } from '@/components/branding-provider';
import { SmoothScrollProvider } from '@/components/smooth-scroll-provider';
import { GlobalWebsiteLoader, RouteProgressBar } from '@/components/motion';
import { getHeaderData } from '@/lib/api';

export const metadata: Metadata = {
  title: {
    default: 'Gypsym Technology | Engineering the Global Enterprise',
    template: '%s | Gypsym Technology',
  },
  description:
    'Gypsym Technology partners with Fortune 100 leaders to architect zero-downtime cloud cores, sovereign AI ecosystems, and high-frequency distributed ledgers.',
  keywords: [
    'enterprise cloud architecture',
    'distributed systems',
    'sovereign AI',
    'zero trust cybersecurity',
    'core banking modernization',
  ],
  authors: [{ name: 'Gypsym Technology' }],
  metadataBase: new URL('https://gypsym.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gypsym.com',
    siteName: 'Gypsym Technology',
    title: 'Gypsym Technology | Engineering the Global Enterprise',
    description: 'Planetary-scale digital infrastructure for the modern enterprise.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gypsym Technology',
    description: 'Planetary-scale digital infrastructure for the modern enterprise.',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerData = await getHeaderData();
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
