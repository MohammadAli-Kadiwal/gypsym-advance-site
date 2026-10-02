import * as React from 'react';
import { getSiteUrl } from '@/lib/site-url';

export interface JsonLdProps {
  data: Record<string, any> | Array<Record<string, any>>;
}

/**
 * Renders a standardized, safe JSON-LD script tag for search engine indexing.
 */
export function JsonLd({ data }: JsonLdProps) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Builds schema.org BreadcrumbList
 */
export function buildBreadcrumbsSchema(
  items: Array<{ name: string; item: string }>,
  baseUrl = getSiteUrl()
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: crumb.item.startsWith('http') ? crumb.item : `${baseUrl}${crumb.item}`,
    })),
  };
}

/**
 * Builds schema.org Service
 */
export interface ServiceSchemaOptions {
  name: string;
  description: string;
  url: string;
  providerName?: string;
  providerUrl?: string;
  image?: string;
  serviceType?: string;
  areaServed?: string;
  offers?: Array<{ name?: string; price?: string | number; priceCurrency?: string }>;
}

export function buildServiceSchema({
  name,
  description,
  url,
  providerName = 'Gypsym Technology',
  providerUrl = getSiteUrl(),
  image,
  serviceType = 'Shopify & E-Commerce Engineering',
  areaServed = 'Worldwide',
  offers,
}: ServiceSchemaOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url,
    serviceType,
    areaServed: {
      '@type': 'AdministrativeArea',
      name: areaServed,
    },
    provider: {
      '@type': 'Organization',
      name: providerName,
      url: providerUrl,
    },
    image: image ? (image.startsWith('http') ? image : `${providerUrl}${image}`) : undefined,
    offers: offers?.length
      ? offers.map((offer) => ({
          '@type': 'Offer',
          name: offer.name || name,
          price: offer.price || undefined,
          priceCurrency: offer.priceCurrency || 'USD',
          availability: 'https://schema.org/InStock',
        }))
      : undefined,
  };
}

/**
 * Builds schema.org FAQPage
 */
export function buildFaqSchema(faqs: Array<{ question: string; answer: string }>) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Builds schema.org BlogPosting / TechArticle
 */
export interface ArticleSchemaOptions {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  publisherName?: string;
  publisherLogo?: string;
  keywords?: string[];
  articleSection?: string;
}

export function buildArticleSchema({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName = 'Gypsym Technology Engineering Team',
  publisherName = 'Gypsym Technology',
  publisherLogo = `${getSiteUrl()}/logo.svg`,
  keywords,
  articleSection,
}: ArticleSchemaOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description,
    url,
    image: image ? [image] : undefined,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      logo: {
        '@type': 'ImageObject',
        url: publisherLogo,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: keywords?.length ? keywords.join(', ') : undefined,
    articleSection,
  };
}

/**
 * Builds schema.org CollectionPage for Portfolio / Case Studies
 */
export interface ProjectItem {
  title: string;
  description?: string;
  url?: string;
  image?: string;
  client?: string;
}

export function buildPortfolioSchema(
  projects: ProjectItem[],
  pageUrl = `${getSiteUrl()}/portfolio`
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Shopify Plus & D2C Stores Portfolio',
    description: 'Curated showcase of high-growth Shopify Plus storefronts engineered by Gypsym Technology.',
    url: pageUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: projects.map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'CreativeWork',
          name: p.title,
          description: p.description,
          image: p.image,
          url: p.url || pageUrl,
        },
      })),
    },
  };
}

/**
 * Builds schema.org WebPage / AboutPage / ContactPage
 */
export function buildWebPageSchema({
  name,
  description,
  url,
  type = 'WebPage',
}: {
  name: string;
  description?: string;
  url: string;
  type?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CheckoutPage';
}) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    description,
    url,
  };
}

/**
 * Builds schema.org Organization
 */
export function buildOrganizationSchema({
  name = 'Gypsym Technology',
  url = getSiteUrl(),
  logo = `${getSiteUrl()}/logo.svg`,
  description = 'High-performance Shopify Plus engineering and headless e-commerce architecture firm.',
  sameAs = [
    'https://twitter.com/gypsymtech',
    'https://linkedin.com/company/gypsym',
    'https://github.com/gypsym',
  ],
  contactPoint = {
    '@type': 'ContactPoint',
    contactType: 'sales and engineering support',
    email: 'hello@gypsym.com',
    availableLanguage: ['English'],
  },
}: {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  contactPoint?: Record<string, any>;
} = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    sameAs,
    contactPoint,
  };
}

