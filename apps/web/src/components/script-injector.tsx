'use client';

import * as React from 'react';
import Script from 'next/script';

export interface ScriptSettingsProps {
  googleAnalytics?: {
    enabled: boolean;
    measurementId: string;
  };
  googleTagManager?: {
    enabled: boolean;
    containerId: string;
  };
  facebookPixel?: {
    enabled: boolean;
    pixelId: string;
  };
  headerScripts?: string;
  footerScripts?: string;
}

export function ScriptInjector({
  settings,
}: {
  settings?: ScriptSettingsProps | null;
}) {
  const gaId = settings?.googleAnalytics?.enabled ? settings.googleAnalytics.measurementId?.trim() : '';
  const gtmId = settings?.googleTagManager?.enabled ? settings.googleTagManager.containerId?.trim() : '';
  const fbPixelId = settings?.facebookPixel?.enabled ? settings.facebookPixel.pixelId?.trim() : '';
  const headerScripts = settings?.headerScripts?.trim();
  const footerScripts = settings?.footerScripts?.trim();

  // Execute raw custom header and footer scripts safely in the DOM
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const cleanupNodes: Node[] = [];

    const injectRawHtml = (rawHtml: string, targetParent: HTMLElement, containerId: string) => {
      // Remove any existing container first
      const existing = document.getElementById(containerId);
      if (existing) {
        existing.remove();
      }

      const container = document.createElement('div');
      container.id = containerId;
      container.style.display = 'none';

      // Use range to properly parse and execute script tags
      try {
        const range = document.createRange();
        range.selectNode(document.body);
        const fragment = range.createContextualFragment(rawHtml);

        // Execute any script elements inside the fragment
        const scripts = fragment.querySelectorAll('script');
        scripts.forEach((oldScript) => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });
          newScript.textContent = oldScript.textContent;
          oldScript.parentNode?.replaceChild(newScript, oldScript);
        });

        container.appendChild(fragment);
        targetParent.appendChild(container);
        cleanupNodes.push(container);
      } catch (err) {
        // Fallback simple HTML injection
        container.innerHTML = rawHtml;
        targetParent.appendChild(container);
        cleanupNodes.push(container);
      }
    };

    if (headerScripts) {
      injectRawHtml(headerScripts, document.head, 'gypsym-custom-head-container');
    }

    if (footerScripts) {
      injectRawHtml(footerScripts, document.body, 'gypsym-custom-body-container');
    }

    return () => {
      cleanupNodes.forEach((node) => {
        try {
          node.parentNode?.removeChild(node);
        } catch {
          // ignore cleanup errors
        }
      });
    };
  }, [headerScripts, footerScripts]);

  return (
    <>
      {/* ── GOOGLE ANALYTICS (GA4) ── */}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {/* ── GOOGLE TAG MANAGER (GTM) ── */}
      {gtmId && (
        <Script id="google-tag-manager-init" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}
        </Script>
      )}

      {/* ── META (FACEBOOK) PIXEL ── */}
      {fbPixelId && (
        <>
          <Script id="meta-pixel-init" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${fbPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}
    </>
  );
}
