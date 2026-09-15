'use client';

import * as React from 'react';
import axios from 'axios';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

interface RecaptchaPublicConfig {
  enabled: boolean;
  siteKey: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

let cachedConfig: RecaptchaPublicConfig | null = null;
let configPromise: Promise<RecaptchaPublicConfig> | null = null;

async function fetchRecaptchaPublicConfig(): Promise<RecaptchaPublicConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }
  if (configPromise) {
    return configPromise;
  }

  configPromise = axios
    .get<RecaptchaPublicConfig>(`${API_BASE_URL}/settings/recaptcha/public`, { timeout: 5000 })
    .then((res) => {
      cachedConfig = res.data;
      return res.data;
    })
    .catch((err) => {
      console.warn('[reCAPTCHA] Failed to load config, failing open:', err?.message);
      const fallback: RecaptchaPublicConfig = { enabled: false, siteKey: null };
      cachedConfig = fallback;
      return fallback;
    });

  return configPromise;
}

export function useRecaptcha() {
  const [config, setConfig] = React.useState<RecaptchaPublicConfig | null>(cachedConfig);
  const [scriptLoaded, setScriptLoaded] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    fetchRecaptchaPublicConfig().then((cfg) => {
      if (!isMounted) return;
      setConfig(cfg);

      if (!cfg.enabled || !cfg.siteKey) {
        return;
      }

      if (typeof window === 'undefined') return;

      const scriptId = 'recaptcha-v3-script';
      let existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (existingScript) {
        if (window.grecaptcha) {
          setScriptLoaded(true);
        } else {
          existingScript.addEventListener('load', () => setScriptLoaded(true));
        }
        return;
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(cfg.siteKey)}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (isMounted) {
          setScriptLoaded(true);
        }
      };
      script.onerror = () => {
        console.warn('[reCAPTCHA] Script failed to load (possibly blocked by client/adblocker)');
      };

      document.head.appendChild(script);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const executeRecaptcha = React.useCallback(
    async (action: string = 'submit'): Promise<string | null> => {
      if (!config?.enabled || !config?.siteKey) {
        return null;
      }

      if (typeof window === 'undefined' || !window.grecaptcha) {
        return null;
      }

      try {
        return await new Promise<string | null>((resolve) => {
          const timeout = setTimeout(() => {
            console.warn('[reCAPTCHA] Execution timed out after 4 seconds, proceeding gracefully');
            resolve(null);
          }, 4000);

          window.grecaptcha!.ready(async () => {
            try {
              const token = await window.grecaptcha!.execute(config.siteKey!, { action });
              clearTimeout(timeout);
              resolve(token);
            } catch (execErr) {
              clearTimeout(timeout);
              console.warn('[reCAPTCHA] Execution failed:', execErr);
              resolve(null);
            }
          });
        });
      } catch (err) {
        console.warn('[reCAPTCHA] Error acquiring token:', err);
        return null;
      }
    },
    [config]
  );

  return {
    isEnabled: Boolean(config?.enabled && config?.siteKey),
    siteKey: config?.siteKey || null,
    isReady: scriptLoaded && Boolean(window.grecaptcha),
    executeRecaptcha,
  };
}
