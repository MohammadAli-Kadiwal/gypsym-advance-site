'use client';

import * as React from 'react';
import {
  FileJson,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  Building,
  Globe,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { notify } from '@/lib/notifications';
import { seoService, GlobalSeoData } from '@/services/seo.service';

export function SchemaTab() {
  const [globalSeo, setGlobalSeo] = React.useState<GlobalSeoData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [copiedType, setCopiedType] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const g = await seoService.getGlobal();
        setGlobalSeo(g);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const organizationSchema = React.useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: globalSeo?.organizationName || globalSeo?.siteName || '',
      url: globalSeo?.siteUrl || '',
      logo: globalSeo?.organizationLogo || globalSeo?.defaultOgImage || '',
      description: globalSeo?.organizationDescription || globalSeo?.siteDescription || '',
      email: globalSeo?.email || undefined,
      telephone: globalSeo?.phone || undefined,
      address: globalSeo?.address
        ? {
            '@type': 'PostalAddress',
            streetAddress: globalSeo.address,
            addressCountry: globalSeo.country || undefined,
          }
        : undefined,
      sameAs: globalSeo?.socialProfiles?.map((s) => s.url).filter(Boolean) || [],
    };
  }, [globalSeo]);

  const websiteSchema = React.useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: globalSeo?.siteName || '',
      url: globalSeo?.siteUrl || '',
      description: globalSeo?.siteDescription || '',
      potentialAction: globalSeo?.siteUrl
        ? {
            '@type': 'SearchAction',
            target: `${globalSeo.siteUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          }
        : undefined,
    };
  }, [globalSeo]);

  const webpageSchema = React.useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: globalSeo?.defaultTitle || globalSeo?.siteTitle || '',
      description: globalSeo?.defaultDescription || globalSeo?.siteDescription || '',
      url: globalSeo?.siteUrl || '',
      isPartOf: {
        '@type': 'WebSite',
        name: globalSeo?.siteName || '',
        url: globalSeo?.siteUrl || '',
      },
    };
  }, [globalSeo]);

  // Validation checks
  const orgValidation = React.useMemo(() => {
    const issues: string[] = [];
    if (!globalSeo?.organizationName && !globalSeo?.siteName) issues.push('Organization Name is missing');
    if (!globalSeo?.siteUrl) issues.push('Site URL is missing');
    if (!globalSeo?.organizationLogo && !globalSeo?.defaultOgImage) issues.push('Organization Logo URL is missing');
    if (!globalSeo?.organizationDescription && !globalSeo?.siteDescription) issues.push('Organization Description is missing');
    return issues;
  }, [globalSeo]);

  const copyToClipboard = (type: string, data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedType(type);
    notify.success({ title: 'Schema copied', description: `${type} JSON-LD copied to clipboard.` });
    setTimeout(() => setCopiedType(null), 2500);
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground animate-pulse">
        Generating Structured Data Schema...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <FileJson className="h-5 w-5 text-primary" />
                Structured Data & JSON-LD Schemas
              </CardTitle>
              <CardDescription>
                Enterprise Schema.org structured data dynamically generated from your active database configuration without fake fallbacks.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://validator.schema.org/', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Schema.org Validator
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Validation Warnings */}
          {orgValidation.length > 0 ? (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  Missing Required Schema Fields ({orgValidation.length}):
                </span>
                <ul className="list-disc pl-4 text-muted-foreground space-y-0.5">
                  {orgValidation.map((issue, idx) => (
                    <li key={idx}>{issue} (configure in Global SEO tab)</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Core Organization & WebSite structured data schemas are fully configured and valid.
              </div>
            </div>
          )}

          {/* Schema Tabs */}
          <Tabs defaultValue="org" className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="org" className="flex items-center gap-1.5 text-xs">
                <Building className="h-3.5 w-3.5" />
                Organization
              </TabsTrigger>
              <TabsTrigger value="website" className="flex items-center gap-1.5 text-xs">
                <Globe className="h-3.5 w-3.5" />
                WebSite
              </TabsTrigger>
              <TabsTrigger value="webpage" className="flex items-center gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5" />
                WebPage
              </TabsTrigger>
            </TabsList>

            <TabsContent value="org" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  JSON-LD output injected into <code>&lt;head&gt;</code> on all pages:
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard('Organization', organizationSchema)}
                >
                  {copiedType === 'Organization' ? (
                    <Check className="h-4 w-4 mr-1 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  Copy JSON-LD
                </Button>
              </div>
              <pre className="p-4 rounded-lg bg-muted/60 font-mono text-xs overflow-x-auto border max-h-96">
                {JSON.stringify(organizationSchema, null, 2)}
              </pre>
            </TabsContent>

            <TabsContent value="website" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  WebSite entity schema with SearchAction:
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard('WebSite', websiteSchema)}
                >
                  {copiedType === 'WebSite' ? (
                    <Check className="h-4 w-4 mr-1 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  Copy JSON-LD
                </Button>
              </div>
              <pre className="p-4 rounded-lg bg-muted/60 font-mono text-xs overflow-x-auto border max-h-96">
                {JSON.stringify(websiteSchema, null, 2)}
              </pre>
            </TabsContent>

            <TabsContent value="webpage" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  Canonical WebPage entity schema:
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard('WebPage', webpageSchema)}
                >
                  {copiedType === 'WebPage' ? (
                    <Check className="h-4 w-4 mr-1 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  Copy JSON-LD
                </Button>
              </div>
              <pre className="p-4 rounded-lg bg-muted/60 font-mono text-xs overflow-x-auto border max-h-96">
                {JSON.stringify(webpageSchema, null, 2)}
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
