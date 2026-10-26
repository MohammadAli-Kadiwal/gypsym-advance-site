// Exhaustive Global Currency & Timezone Datasets and Country Meta Helpers

export interface CountryMeta {
  name: string;
  flag: string;
  isoCode?: string;
  currency: string;
  currencySymbol?: string;
  timezone: string;
  region: string;
}

export interface CurrencyOption {
  code: string;
  label: string;
}

export interface TzOption {
  tz: string;
  region: string;
  label: string;
}

// ── Complete Global Currencies (All 160+ ISO 4217 Currencies) ─────────────────
export const ALL_CURRENCIES: CurrencyOption[] = (() => {
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function') {
      const dn = new Intl.DisplayNames(['en'], { type: 'currency' });
      const codes = Intl.supportedValuesOf('currency');
      return codes.map((code) => {
        let name = code;
        try {
          name = dn.of(code) || code;
        } catch {
          name = code;
        }
        return { code, label: `${code} — ${name}` };
      });
    }
  } catch {
    // fallback
  }

  return [
    { code: 'USD', label: 'USD — US Dollar' },
    { code: 'EUR', label: 'EUR — Euro' },
    { code: 'GBP', label: 'GBP — British Pound' },
    { code: 'AED', label: 'AED — United Arab Emirates Dirham' },
    { code: 'SAR', label: 'SAR — Saudi Riyal' },
    { code: 'AUD', label: 'AUD — Australian Dollar' },
    { code: 'CAD', label: 'CAD — Canadian Dollar' },
    { code: 'INR', label: 'INR — Indian Rupee' },
    { code: 'SGD', label: 'SGD — Singapore Dollar' },
    { code: 'OMR', label: 'OMR — Omani Rial' },
    { code: 'QAR', label: 'QAR — Qatari Riyal' },
    { code: 'KWD', label: 'KWD — Kuwaiti Dinar' },
    { code: 'BHD', label: 'BHD — Bahraini Dinar' },
    { code: 'CHF', label: 'CHF — Swiss Franc' },
    { code: 'JPY', label: 'JPY — Japanese Yen' },
    { code: 'NZD', label: 'NZD — New Zealand Dollar' },
    { code: 'ZAR', label: 'ZAR — South African Rand' },
    { code: 'SEK', label: 'SEK — Swedish Krona' },
    { code: 'NOK', label: 'NOK — Norwegian Krone' },
    { code: 'DKK', label: 'DKK — Danish Krone' },
    { code: 'HKD', label: 'HKD — Hong Kong Dollar' },
  ];
})();

// ── Complete Global Timezones (All 400+ IANA Timezones) ───────────────────────
export const ALL_TIMEZONES: TzOption[] = (() => {
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function') {
      const list = Intl.supportedValuesOf('timeZone');
      const now = new Date();
      return list.map((tz) => {
        let offset = '';
        try {
          const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(now);
          offset = parts.find((p) => p.type === 'timeZoneName')?.value || '';
        } catch {
          offset = '';
        }
        const region = tz.includes('/') ? (tz.split('/')[0] || 'Other') : 'Other';
        const city = tz.includes('/') ? tz.split('/').slice(1).join(' / ').replace(/_/g, ' ') : tz;
        return {
          tz,
          region,
          label: `${city}${offset ? ` (${offset})` : ''}`,
        };
      });
    }
  } catch {
    // fallback
  }

  return [
    { tz: 'UTC', label: 'UTC (GMT)', region: 'UTC' },
    { tz: 'America/New_York', label: 'New York (GMT-5)', region: 'America' },
    { tz: 'Europe/London', label: 'London (GMT)', region: 'Europe' },
    { tz: 'Asia/Dubai', label: 'Dubai (GMT+4)', region: 'Asia' },
    { tz: 'Asia/Kolkata', label: 'Kolkata (GMT+5:30)', region: 'Asia' },
  ];
})();

// Timezones grouped by geographical region for <optgroup> rendering
export const TIMEZONE_REGIONS: [string, TzOption[]][] = (() => {
  const map: Record<string, TzOption[]> = {};
  for (const item of ALL_TIMEZONES) {
    if (!map[item.region]) map[item.region] = [];
    map[item.region]!.push(item);
  }
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
})();

export const KNOWN_COUNTRIES: Record<string, CountryMeta> = {
  'united-states': { name: 'United States', flag: '🇺🇸', currency: 'USD', currencySymbol: '$', timezone: 'America/New_York', region: 'North America' },
  us: { name: 'United States', flag: '🇺🇸', currency: 'USD', currencySymbol: '$', timezone: 'America/New_York', region: 'North America' },
  uk: { name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', currencySymbol: '£', timezone: 'Europe/London', region: 'Europe / UK' },
  'united-kingdom': { name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', currencySymbol: '£', timezone: 'Europe/London', region: 'Europe / UK' },
  'saudi-arabia': { name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', currencySymbol: '﷼', timezone: 'Asia/Riyadh', region: 'Middle East / GCC' },
  sa: { name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', currencySymbol: '﷼', timezone: 'Asia/Riyadh', region: 'Middle East / GCC' },
  'united-arab-emirates': { name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', currencySymbol: 'د.إ', timezone: 'Asia/Dubai', region: 'Middle East / GCC' },
  uae: { name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', currencySymbol: 'د.إ', timezone: 'Asia/Dubai', region: 'Middle East / GCC' },
  australia: { name: 'Australia', flag: '🇦🇺', currency: 'AUD', currencySymbol: 'A$', timezone: 'Australia/Sydney', region: 'Asia Pacific / Oceania' },
  au: { name: 'Australia', flag: '🇦🇺', currency: 'AUD', currencySymbol: 'A$', timezone: 'Australia/Sydney', region: 'Asia Pacific / Oceania' },
  oman: { name: 'Oman', flag: '🇴🇲', currency: 'OMR', currencySymbol: 'ر.ع.', timezone: 'Asia/Dubai', region: 'Middle East / GCC' },
  om: { name: 'Oman', flag: '🇴🇲', currency: 'OMR', currencySymbol: 'ر.ع.', timezone: 'Asia/Dubai', region: 'Middle East / GCC' },
  canada: { name: 'Canada', flag: '🇨🇦', currency: 'CAD', currencySymbol: 'C$', timezone: 'America/Toronto', region: 'North America' },
  ca: { name: 'Canada', flag: '🇨🇦', currency: 'CAD', currencySymbol: 'C$', timezone: 'America/Toronto', region: 'North America' },
  germany: { name: 'Germany', flag: '🇩🇪', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Berlin', region: 'Europe' },
  de: { name: 'Germany', flag: '🇩🇪', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Berlin', region: 'Europe' },
  india: { name: 'India', flag: '🇮🇳', currency: 'INR', currencySymbol: '₹', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  in: { name: 'India', flag: '🇮🇳', currency: 'INR', currencySymbol: '₹', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  singapore: { name: 'Singapore', flag: '🇸🇬', currency: 'SGD', currencySymbol: 'S$', timezone: 'Asia/Singapore', region: 'Asia Pacific' },
  sg: { name: 'Singapore', flag: '🇸🇬', currency: 'SGD', currencySymbol: 'S$', timezone: 'Asia/Singapore', region: 'Asia Pacific' },
  qatar: { name: 'Qatar', flag: '🇶🇦', currency: 'QAR', currencySymbol: 'ر.ق', timezone: 'Asia/Riyadh', region: 'Middle East / GCC' },
  qa: { name: 'Qatar', flag: '🇶🇦', currency: 'QAR', currencySymbol: 'ر.ق', timezone: 'Asia/Riyadh', region: 'Middle East / GCC' },
  kuwait: { name: 'Kuwait', flag: '🇰🇼', currency: 'KWD', currencySymbol: 'د.ك', timezone: 'Asia/Riyadh', region: 'Middle East / GCC' },
  kw: { name: 'Kuwait', flag: '🇰🇼', currency: 'KWD', currencySymbol: 'د.ك', timezone: 'Asia/Riyadh', region: 'Middle East / GCC' },
  france: { name: 'France', flag: '🇫🇷', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Paris', region: 'Europe' },
  fr: { name: 'France', flag: '🇫🇷', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Paris', region: 'Europe' },
  japan: { name: 'Japan', flag: '🇯🇵', currency: 'JPY', currencySymbol: '¥', timezone: 'Asia/Tokyo', region: 'Asia Pacific' },
  jp: { name: 'Japan', flag: '🇯🇵', currency: 'JPY', currencySymbol: '¥', timezone: 'Asia/Tokyo', region: 'Asia Pacific' },
  italy: { name: 'Italy', flag: '🇮🇹', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Rome', region: 'Europe' },
  it: { name: 'Italy', flag: '🇮🇹', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Rome', region: 'Europe' },
  spain: { name: 'Spain', flag: '🇪🇸', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Madrid', region: 'Europe' },
  es: { name: 'Spain', flag: '🇪🇸', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Madrid', region: 'Europe' },
  netherlands: { name: 'Netherlands', flag: '🇳🇱', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Amsterdam', region: 'Europe' },
  nl: { name: 'Netherlands', flag: '🇳🇱', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Amsterdam', region: 'Europe' },
  switzerland: { name: 'Switzerland', flag: '🇨🇭', currency: 'CHF', currencySymbol: 'CHF', timezone: 'Europe/Zurich', region: 'Europe' },
  ch: { name: 'Switzerland', flag: '🇨🇭', currency: 'CHF', currencySymbol: 'CHF', timezone: 'Europe/Zurich', region: 'Europe' },
  sweden: { name: 'Sweden', flag: '🇸🇪', currency: 'SEK', currencySymbol: 'kr', timezone: 'Europe/Stockholm', region: 'Europe' },
  se: { name: 'Sweden', flag: '🇸🇪', currency: 'SEK', currencySymbol: 'kr', timezone: 'Europe/Stockholm', region: 'Europe' },
  norway: { name: 'Norway', flag: '🇳🇴', currency: 'NOK', currencySymbol: 'kr', timezone: 'Europe/Oslo', region: 'Europe' },
  no: { name: 'Norway', flag: '🇳🇴', currency: 'NOK', currencySymbol: 'kr', timezone: 'Europe/Oslo', region: 'Europe' },
  denmark: { name: 'Denmark', flag: '🇩🇰', currency: 'DKK', currencySymbol: 'kr', timezone: 'Europe/Copenhagen', region: 'Europe' },
  dk: { name: 'Denmark', flag: '🇩🇰', currency: 'DKK', currencySymbol: 'kr', timezone: 'Europe/Copenhagen', region: 'Europe' },
  brazil: { name: 'Brazil', flag: '🇧🇷', currency: 'BRL', currencySymbol: 'R$', timezone: 'America/Sao_Paulo', region: 'South America' },
  br: { name: 'Brazil', flag: '🇧🇷', currency: 'BRL', currencySymbol: 'R$', timezone: 'America/Sao_Paulo', region: 'South America' },
  mexico: { name: 'Mexico', flag: '🇲🇽', currency: 'MXN', currencySymbol: '$', timezone: 'America/Mexico_City', region: 'North America' },
  mx: { name: 'Mexico', flag: '🇲🇽', currency: 'MXN', currencySymbol: '$', timezone: 'America/Mexico_City', region: 'North America' },
  'south-africa': { name: 'South Africa', flag: '🇿🇦', currency: 'ZAR', currencySymbol: 'R', timezone: 'Africa/Johannesburg', region: 'Africa' },
  za: { name: 'South Africa', flag: '🇿🇦', currency: 'ZAR', currencySymbol: 'R', timezone: 'Africa/Johannesburg', region: 'Africa' },
  'new-zealand': { name: 'New Zealand', flag: '🇳🇿', currency: 'NZD', currencySymbol: 'NZ$', timezone: 'Pacific/Auckland', region: 'Asia Pacific / Oceania' },
  nz: { name: 'New Zealand', flag: '🇳🇿', currency: 'NZD', currencySymbol: 'NZ$', timezone: 'Pacific/Auckland', region: 'Asia Pacific / Oceania' },
  bahrain: { name: 'Bahrain', flag: '🇧🇭', currency: 'BHD', currencySymbol: '.د.ب', timezone: 'Asia/Bahrain', region: 'Middle East / GCC' },
  bh: { name: 'Bahrain', flag: '🇧🇭', currency: 'BHD', currencySymbol: '.د.ب', timezone: 'Asia/Bahrain', region: 'Middle East / GCC' },
  ireland: { name: 'Ireland', flag: '🇮🇪', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Dublin', region: 'Europe' },
  ie: { name: 'Ireland', flag: '🇮🇪', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Dublin', region: 'Europe' },
  belgium: { name: 'Belgium', flag: '🇧🇪', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Brussels', region: 'Europe' },
  be: { name: 'Belgium', flag: '🇧🇪', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Brussels', region: 'Europe' },
  austria: { name: 'Austria', flag: '🇦🇹', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Vienna', region: 'Europe' },
  at: { name: 'Austria', flag: '🇦🇹', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Vienna', region: 'Europe' },
  poland: { name: 'Poland', flag: '🇵🇱', currency: 'PLN', currencySymbol: 'zł', timezone: 'Europe/Warsaw', region: 'Europe' },
  pl: { name: 'Poland', flag: '🇵🇱', currency: 'PLN', currencySymbol: 'zł', timezone: 'Europe/Warsaw', region: 'Europe' },
  portugal: { name: 'Portugal', flag: '🇵🇹', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Lisbon', region: 'Europe' },
  pt: { name: 'Portugal', flag: '🇵🇹', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Lisbon', region: 'Europe' },
  turkey: { name: 'Turkey', flag: '🇹🇷', currency: 'TRY', currencySymbol: '₺', timezone: 'Europe/Istanbul', region: 'Europe' },
  tr: { name: 'Turkey', flag: '🇹🇷', currency: 'TRY', currencySymbol: '₺', timezone: 'Europe/Istanbul', region: 'Europe' },
  china: { name: 'China', flag: '🇨🇳', currency: 'CNY', currencySymbol: '¥', timezone: 'Asia/Shanghai', region: 'Asia Pacific' },
  cn: { name: 'China', flag: '🇨🇳', currency: 'CNY', currencySymbol: '¥', timezone: 'Asia/Shanghai', region: 'Asia Pacific' },
  'hong-kong': { name: 'Hong Kong', flag: '🇭🇰', currency: 'HKD', currencySymbol: 'HK$', timezone: 'Asia/Hong_Kong', region: 'Asia Pacific' },
  hk: { name: 'Hong Kong', flag: '🇭🇰', currency: 'HKD', currencySymbol: 'HK$', timezone: 'Asia/Hong_Kong', region: 'Asia Pacific' },
  'south-korea': { name: 'South Korea', flag: '🇰🇷', currency: 'KRW', currencySymbol: '₩', timezone: 'Asia/Seoul', region: 'Asia Pacific' },
  kr: { name: 'South Korea', flag: '🇰🇷', currency: 'KRW', currencySymbol: '₩', timezone: 'Asia/Seoul', region: 'Asia Pacific' },
  malaysia: { name: 'Malaysia', flag: '🇲🇾', currency: 'MYR', currencySymbol: 'RM', timezone: 'Asia/Kuala_Lumpur', region: 'Asia Pacific' },
  my: { name: 'Malaysia', flag: '🇲🇾', currency: 'MYR', currencySymbol: 'RM', timezone: 'Asia/Kuala_Lumpur', region: 'Asia Pacific' },
  indonesia: { name: 'Indonesia', flag: '🇮🇩', currency: 'IDR', currencySymbol: 'Rp', timezone: 'Asia/Jakarta', region: 'Asia Pacific' },
  id: { name: 'Indonesia', flag: '🇮🇩', currency: 'IDR', currencySymbol: 'Rp', timezone: 'Asia/Jakarta', region: 'Asia Pacific' },
  thailand: { name: 'Thailand', flag: '🇹🇭', currency: 'THB', currencySymbol: '฿', timezone: 'Asia/Bangkok', region: 'Asia Pacific' },
  th: { name: 'Thailand', flag: '🇹🇭', currency: 'THB', currencySymbol: '฿', timezone: 'Asia/Bangkok', region: 'Asia Pacific' },
  vietnam: { name: 'Vietnam', flag: '🇻🇳', currency: 'VND', currencySymbol: '₫', timezone: 'Asia/Ho_Chi_Minh', region: 'Asia Pacific' },
  vn: { name: 'Vietnam', flag: '🇻🇳', currency: 'VND', currencySymbol: '₫', timezone: 'Asia/Ho_Chi_Minh', region: 'Asia Pacific' },
  philippines: { name: 'Philippines', flag: '🇵🇭', currency: 'PHP', currencySymbol: '₱', timezone: 'Asia/Manila', region: 'Asia Pacific' },
  ph: { name: 'Philippines', flag: '🇵🇭', currency: 'PHP', currencySymbol: '₱', timezone: 'Asia/Manila', region: 'Asia Pacific' },
  egypt: { name: 'Egypt', flag: '🇪🇬', currency: 'EGP', currencySymbol: 'E£', timezone: 'Africa/Cairo', region: 'Middle East & Africa' },
  eg: { name: 'Egypt', flag: '🇪🇬', currency: 'EGP', currencySymbol: 'E£', timezone: 'Africa/Cairo', region: 'Middle East & Africa' },
  nigeria: { name: 'Nigeria', flag: '🇳🇬', currency: 'NGN', currencySymbol: '₦', timezone: 'Africa/Lagos', region: 'Africa' },
  ng: { name: 'Nigeria', flag: '🇳🇬', currency: 'NGN', currencySymbol: '₦', timezone: 'Africa/Lagos', region: 'Africa' },
  kenya: { name: 'Kenya', flag: '🇰🇪', currency: 'KES', currencySymbol: 'KSh', timezone: 'Africa/Nairobi', region: 'Africa' },
  ke: { name: 'Kenya', flag: '🇰🇪', currency: 'KES', currencySymbol: 'KSh', timezone: 'Africa/Nairobi', region: 'Africa' },
  finland: { name: 'Finland', flag: '🇫🇮', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Helsinki', region: 'Europe' },
  fi: { name: 'Finland', flag: '🇫🇮', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Helsinki', region: 'Europe' },
  greece: { name: 'Greece', flag: '🇬🇷', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Athens', region: 'Europe' },
  gr: { name: 'Greece', flag: '🇬🇷', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Athens', region: 'Europe' },
  'czech-republic': { name: 'Czech Republic', flag: '🇨🇿', currency: 'CZK', currencySymbol: 'Kč', timezone: 'Europe/Prague', region: 'Europe' },
  cz: { name: 'Czech Republic', flag: '🇨🇿', currency: 'CZK', currencySymbol: 'Kč', timezone: 'Europe/Prague', region: 'Europe' },
  israel: { name: 'Israel', flag: '🇮🇱', currency: 'ILS', currencySymbol: '₪', timezone: 'Asia/Jerusalem', region: 'Middle East' },
  il: { name: 'Israel', flag: '🇮🇱', currency: 'ILS', currencySymbol: '₪', timezone: 'Asia/Jerusalem', region: 'Middle East' },
  argentina: { name: 'Argentina', flag: '🇦🇷', currency: 'ARS', currencySymbol: '$', timezone: 'America/Argentina/Buenos_Aires', region: 'South America' },
  ar: { name: 'Argentina', flag: '🇦🇷', currency: 'ARS', currencySymbol: '$', timezone: 'America/Argentina/Buenos_Aires', region: 'South America' },
  chile: { name: 'Chile', flag: '🇨🇱', currency: 'CLP', currencySymbol: '$', timezone: 'America/Santiago', region: 'South America' },
  cl: { name: 'Chile', flag: '🇨🇱', currency: 'CLP', currencySymbol: '$', timezone: 'America/Santiago', region: 'South America' },
  colombia: { name: 'Colombia', flag: '🇨🇴', currency: 'COP', currencySymbol: '$', timezone: 'America/Bogota', region: 'South America' },
  co: { name: 'Colombia', flag: '🇨🇴', currency: 'COP', currencySymbol: '$', timezone: 'America/Bogota', region: 'South America' },
  pakistan: { name: 'Pakistan', flag: '🇵🇰', currency: 'PKR', currencySymbol: '₨', timezone: 'Asia/Karachi', region: 'Asia Pacific' },
  pk: { name: 'Pakistan', flag: '🇵🇰', currency: 'PKR', currencySymbol: '₨', timezone: 'Asia/Karachi', region: 'Asia Pacific' },
  bangladesh: { name: 'Bangladesh', flag: '🇧🇩', currency: 'BDT', currencySymbol: '৳', timezone: 'Asia/Dhaka', region: 'Asia Pacific' },
  bd: { name: 'Bangladesh', flag: '🇧🇩', currency: 'BDT', currencySymbol: '৳', timezone: 'Asia/Dhaka', region: 'Asia Pacific' },
};

export interface CountryPresetItem {
  name: string;
  slug: string;
  flag: string;
  currency: string;
  timezone: string;
  region: string;
}

// Deduplicated list of country presets for autocompletion and rapid selection
export const COUNTRY_PRESETS: CountryPresetItem[] = (() => {
  const map = new Map<string, CountryPresetItem>();
  for (const [key, val] of Object.entries(KNOWN_COUNTRIES)) {
    if (key.length <= 3 && !key.includes('-')) continue; // Skip 2-letter codes for preset dropdown display
    if (!map.has(val.name)) {
      map.set(val.name, {
        name: val.name,
        slug: key,
        flag: val.flag,
        currency: val.currency,
        timezone: val.timezone,
        region: val.region,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
})();

/**
 * Universal Unicode Flag Emoji Generator from standard 2-letter ISO 3166-1 alpha-2 code
 * e.g. "IN" -> 🇮🇳, "US" -> 🇺🇸, "KW" -> 🇰🇼, "AE" -> 🇦🇪, "DE" -> 🇩🇪, "GB" -> 🇬🇧
 */
export function getFlagEmojiFromCountryCode(code: string): string {
  if (!code || typeof code !== 'string') return '';
  const clean = code.trim().toUpperCase();
  if (clean.length !== 2 || !/^[A-Z]{2}$/.test(clean)) return '';
  return String.fromCodePoint(
    127397 + clean.charCodeAt(0),
    127397 + clean.charCodeAt(1)
  );
}

/**
 * Reverse extraction: extract standard 2-letter ISO 3166-1 alpha-2 code from a Flag Emoji
 * e.g. "🇺🇸" -> "US", "🇮🇳" -> "IN", "🇰🇼" -> "KW", "🇩🇪" -> "DE"
 */
export function getCountryCodeFromFlagEmoji(flag: string): string {
  if (!flag || typeof flag !== 'string') return '';
  const codePoints = [...flag].map((c) => c.codePointAt(0) || 0);
  const code0 = codePoints[0];
  const code1 = codePoints[1];
  if (
    codePoints.length === 2 &&
    code0 !== undefined && code0 >= 127462 && code0 <= 127487 &&
    code1 !== undefined && code1 >= 127462 && code1 <= 127487
  ) {
    return String.fromCharCode(code0 - 127397, code1 - 127397);
  }
  return '';
}

/**
 * Strips agency and marketing slug/title prefixes to cleanly isolate the country or territory name
 * e.g. "shopify-agency-in-california" -> "california"
 * e.g. "shopify-agency-in-newyork" -> "newyork"
 * e.g. "Shopify Agency in California | Gypsym" -> "California"
 */
export function cleanLocationQuery(query: string): string {
  if (!query || typeof query !== 'string') return '';
  let str = query.trim().split('|')[0] || '';
  // Title-style prefixes
  str = str
    .replace(/^shopify\s+(plus\s+)?agency\s+in\s+/i, '')
    .replace(/^ecommerce\s+agency\s+in\s+/i, '')
    .replace(/^web\s+design\s+in\s+/i, '')
    .replace(/^agency\s+in\s+/i, '')
    .replace(/^in\s+/i, '');
  // Slug-style prefixes
  str = str
    .replace(/^shopify-plus-agency-in-/i, '')
    .replace(/^shopify-agency-in-/i, '')
    .replace(/^ecommerce-agency-in-/i, '')
    .replace(/^web-design-in-/i, '')
    .replace(/^agency-in-/i, '')
    .replace(/^in-/i, '')
    .replace(/-agency$/i, '')
    .replace(/-shopify$/i, '');
  return str.trim();
}

// Build reverse region name to ISO code mapping dynamically via Intl.DisplayNames
const REGION_NAMES_TO_ISO: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function') {
      const dn = new Intl.DisplayNames(['en'], { type: 'region' });
      let regionCodes: string[] = [];
      try {
        if (typeof (Intl as any).supportedValuesOf === 'function') {
          regionCodes = (Intl as any).supportedValuesOf('region') || [];
        }
      } catch {
        // fallback
      }
      if (!regionCodes.length) {
        regionCodes = Object.keys(KNOWN_COUNTRIES).filter((k) => k.length === 2).map((k) => k.toUpperCase());
      }
      for (const code of regionCodes) {
        if (/^[A-Z]{2}$/.test(code)) {
          try {
            const name = dn.of(code);
            if (name) {
              const lower = name.toLowerCase();
              map[lower] = code;
              map[lower.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')] = code;
            }
          } catch {
            // ignore
          }
        }
      }
    }
  } catch {
    // fallback
  }
  return map;
})();

/**
 * Regional subdivisions, US states, provinces, and metros mapped to their sovereign nation
 */
export const REGIONAL_SUBDIVISIONS: Record<
  string,
  { country: string; flag: string; isoCode: string; currency: string; timezone: string; region: string }
> = {
  // US States & Metros -> United States (🇺🇸 / US)
  california: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Los_Angeles', region: 'North America' },
  'new-york': { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/New_York', region: 'North America' },
  'new-york-state': { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/New_York', region: 'North America' },
  newyork: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/New_York', region: 'North America' },
  nyc: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/New_York', region: 'North America' },
  texas: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Chicago', region: 'North America' },
  florida: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/New_York', region: 'North America' },
  illinois: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Chicago', region: 'North America' },
  chicago: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Chicago', region: 'North America' },
  washington: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Los_Angeles', region: 'North America' },
  seattle: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Los_Angeles', region: 'North America' },
  massachusetts: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/New_York', region: 'North America' },
  boston: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/New_York', region: 'North America' },
  'los-angeles': { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Los_Angeles', region: 'North America' },
  'san-francisco': { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Los_Angeles', region: 'North America' },
  miami: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/New_York', region: 'North America' },
  georgia: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/New_York', region: 'North America' },
  atlanta: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/New_York', region: 'North America' },
  pennsylvania: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/New_York', region: 'North America' },
  ohio: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/New_York', region: 'North America' },
  michigan: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Detroit', region: 'North America' },
  'north-carolina': { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/New_York', region: 'North America' },
  virginia: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/New_York', region: 'North America' },
  arizona: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Phoenix', region: 'North America' },
  colorado: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Denver', region: 'North America' },
  denver: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Denver', region: 'North America' },
  'new-jersey': { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/New_York', region: 'North America' },
  tennessee: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Chicago', region: 'North America' },
  indiana: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Indiana/Indianapolis', region: 'North America' },
  missouri: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Chicago', region: 'North America' },
  maryland: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/New_York', region: 'North America' },
  wisconsin: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Chicago', region: 'North America' },
  minnesota: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Chicago', region: 'North America' },
  'south-carolina': { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/New_York', region: 'North America' },
  alabama: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Chicago', region: 'North America' },
  louisiana: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Chicago', region: 'North America' },
  kentucky: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/New_York', region: 'North America' },
  oregon: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Los_Angeles', region: 'North America' },
  oklahoma: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Chicago', region: 'North America' },
  connecticut: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/New_York', region: 'North America' },
  utah: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Denver', region: 'North America' },
  iowa: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Chicago', region: 'North America' },
  nevada: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Los_Angeles', region: 'North America' },
  'las-vegas': { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Los_Angeles', region: 'North America' },
  austin: { country: 'United States', flag: '🇺🇸', isoCode: 'US', currency: 'USD', timezone: 'America/Chicago', region: 'North America' },

  // Canada Provinces & Metros -> Canada (🇨🇦 / CA)
  ontario: { country: 'Canada', flag: '🇨🇦', isoCode: 'CA', currency: 'CAD', timezone: 'America/Toronto', region: 'North America' },
  quebec: { country: 'Canada', flag: '🇨🇦', isoCode: 'CA', currency: 'CAD', timezone: 'America/Montreal', region: 'North America' },
  'british-columbia': { country: 'Canada', flag: '🇨🇦', isoCode: 'CA', currency: 'CAD', timezone: 'America/Vancouver', region: 'North America' },
  alberta: { country: 'Canada', flag: '🇨🇦', isoCode: 'CA', currency: 'CAD', timezone: 'America/Edmonton', region: 'North America' },
  toronto: { country: 'Canada', flag: '🇨🇦', isoCode: 'CA', currency: 'CAD', timezone: 'America/Toronto', region: 'North America' },
  vancouver: { country: 'Canada', flag: '🇨🇦', isoCode: 'CA', currency: 'CAD', timezone: 'America/Vancouver', region: 'North America' },
  montreal: { country: 'Canada', flag: '🇨🇦', isoCode: 'CA', currency: 'CAD', timezone: 'America/Montreal', region: 'North America' },

  // Australia States & Metros -> Australia (🇦🇺 / AU)
  'new-south-wales': { country: 'Australia', flag: '🇦🇺', isoCode: 'AU', currency: 'AUD', timezone: 'Australia/Sydney', region: 'Asia Pacific / Oceania' },
  victoria: { country: 'Australia', flag: '🇦🇺', isoCode: 'AU', currency: 'AUD', timezone: 'Australia/Melbourne', region: 'Asia Pacific / Oceania' },
  queensland: { country: 'Australia', flag: '🇦🇺', isoCode: 'AU', currency: 'AUD', timezone: 'Australia/Brisbane', region: 'Asia Pacific / Oceania' },
  'western-australia': { country: 'Australia', flag: '🇦🇺', isoCode: 'AU', currency: 'AUD', timezone: 'Australia/Perth', region: 'Asia Pacific / Oceania' },
  sydney: { country: 'Australia', flag: '🇦🇺', isoCode: 'AU', currency: 'AUD', timezone: 'Australia/Sydney', region: 'Asia Pacific / Oceania' },
  melbourne: { country: 'Australia', flag: '🇦🇺', isoCode: 'AU', currency: 'AUD', timezone: 'Australia/Melbourne', region: 'Asia Pacific / Oceania' },
  brisbane: { country: 'Australia', flag: '🇦🇺', isoCode: 'AU', currency: 'AUD', timezone: 'Australia/Brisbane', region: 'Asia Pacific / Oceania' },

  // UK Metros & Nations -> United Kingdom (🇬🇧 / GB)
  england: { country: 'United Kingdom', flag: '🇬🇧', isoCode: 'GB', currency: 'GBP', timezone: 'Europe/London', region: 'Europe / UK' },
  scotland: { country: 'United Kingdom', flag: '🇬🇧', isoCode: 'GB', currency: 'GBP', timezone: 'Europe/London', region: 'Europe / UK' },
  wales: { country: 'United Kingdom', flag: '🇬🇧', isoCode: 'GB', currency: 'GBP', timezone: 'Europe/London', region: 'Europe / UK' },
  'northern-ireland': { country: 'United Kingdom', flag: '🇬🇧', isoCode: 'GB', currency: 'GBP', timezone: 'Europe/London', region: 'Europe / UK' },
  london: { country: 'United Kingdom', flag: '🇬🇧', isoCode: 'GB', currency: 'GBP', timezone: 'Europe/London', region: 'Europe / UK' },
  manchester: { country: 'United Kingdom', flag: '🇬🇧', isoCode: 'GB', currency: 'GBP', timezone: 'Europe/London', region: 'Europe / UK' },
  birmingham: { country: 'United Kingdom', flag: '🇬🇧', isoCode: 'GB', currency: 'GBP', timezone: 'Europe/London', region: 'Europe / UK' },

  // UAE Emirates & Metros -> United Arab Emirates (🇦🇪 / AE)
  dubai: { country: 'United Arab Emirates', flag: '🇦🇪', isoCode: 'AE', currency: 'AED', timezone: 'Asia/Dubai', region: 'Middle East / GCC' },
  'abu-dhabi': { country: 'United Arab Emirates', flag: '🇦🇪', isoCode: 'AE', currency: 'AED', timezone: 'Asia/Dubai', region: 'Middle East / GCC' },
  abudhabi: { country: 'United Arab Emirates', flag: '🇦🇪', isoCode: 'AE', currency: 'AED', timezone: 'Asia/Dubai', region: 'Middle East / GCC' },
  sharjah: { country: 'United Arab Emirates', flag: '🇦🇪', isoCode: 'AE', currency: 'AED', timezone: 'Asia/Dubai', region: 'Middle East / GCC' },

  // India States, Union Territories & Metros -> India (🇮🇳 / IN)
  maharashtra: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  karnataka: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  delhi: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  'delhi-ncr': { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  delhincr: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  'new-delhi': { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  newdelhi: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  mumbai: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  bangalore: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  bengaluru: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  hyderabad: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  chennai: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  kolkata: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  pune: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  gujarat: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  ahmedabad: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  'tamil-nadu': { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  tamilnadu: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  telangana: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  rajasthan: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  punjab: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  'west-bengal': { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  westbengal: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  kerala: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  haryana: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  gurgaon: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  gurugram: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  noida: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  'uttar-pradesh': { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  uttarpradesh: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  'andhra-pradesh': { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  andhrapradesh: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  'madhya-pradesh': { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  madhyapradesh: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  goa: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  chandigarh: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  jaipur: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  surat: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  kochi: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  lucknow: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },
  indore: { country: 'India', flag: '🇮🇳', isoCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', region: 'Asia Pacific' },

  // Germany States & Metros -> Germany (🇩🇪 / DE)
  bavaria: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  bayern: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  berlin: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  munich: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  muenchen: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  hamburg: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  frankfurt: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  cologne: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  koeln: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  stuttgart: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  dusseldorf: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  duesseldorf: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  'baden-wuerttemberg': { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  badenwuerttemberg: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  hessen: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  hesse: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  'north-rhine-westphalia': { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  northrhinewestphalia: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  nrw: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  saxony: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  sachsen: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  leipzig: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  dresden: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  hannover: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  hanover: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  nuernberg: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  nuremberg: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  bremen: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  dortmund: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  essen: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
  bonn: { country: 'Germany', flag: '🇩🇪', isoCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', region: 'Europe' },
};

/**
 * Common Aliases mapping to KNOWN_COUNTRIES keys or ISO codes
 */
const COUNTRY_ALIASES: Record<string, string> = {
  usa: 'united-states',
  america: 'united-states',
  us: 'united-states',
  unitedstates: 'united-states',
  uk: 'united-kingdom',
  britain: 'united-kingdom',
  'great-britain': 'united-kingdom',
  greatbritain: 'united-kingdom',
  england: 'united-kingdom',
  gb: 'united-kingdom',
  unitedkingdom: 'united-kingdom',
  uae: 'united-arab-emirates',
  dubai: 'united-arab-emirates',
  'abu-dhabi': 'united-arab-emirates',
  abudhabi: 'united-arab-emirates',
  emirates: 'united-arab-emirates',
  unitedarabemirates: 'united-arab-emirates',
  ae: 'united-arab-emirates',
  ksa: 'saudi-arabia',
  saudi: 'saudi-arabia',
  saudiarabia: 'saudi-arabia',
  sa: 'saudi-arabia',
  deutschland: 'germany',
  de: 'germany',
  bharat: 'india',
  hindustan: 'india',
  in: 'india',
  holland: 'netherlands',
  nl: 'netherlands',
  korea: 'south-korea',
  southkorea: 'south-korea',
  kr: 'south-korea',
  turkiye: 'turkey',
  tr: 'turkey',
  czechia: 'czech-republic',
  cz: 'czech-republic',
  kuwait: 'kuwait',
  kw: 'kuwait',
  qatar: 'qatar',
  qa: 'qatar',
  oman: 'oman',
  om: 'oman',
  bahrain: 'bahrain',
  bh: 'bahrain',
  australia: 'australia',
  au: 'australia',
  canada: 'canada',
  ca: 'canada',
  britishcolumbia: 'british-columbia',
  newsouthwales: 'new-south-wales',
  newzealand: 'new-zealand',
  southafrica: 'south-africa',
  hongkong: 'hong-kong',
  france: 'france',
  fr: 'france',
  japan: 'japan',
  jp: 'japan',
  singapore: 'singapore',
  sg: 'singapore',
  italy: 'italy',
  it: 'italy',
  spain: 'spain',
  es: 'spain',
  switzerland: 'switzerland',
  ch: 'switzerland',
  sweden: 'sweden',
  se: 'sweden',
  norway: 'norway',
  no: 'norway',
  denmark: 'denmark',
  dk: 'denmark',
  brazil: 'brazil',
  br: 'brazil',
  mexico: 'mexico',
  mx: 'mexico',
};

/**
 * Searches and automatically detects matching country locale metadata (Timezone, Currency, Flag, Slug).
 * Supports fuzzy matching against country names, slugs, ISO codes, regional subdivisions, and common aliases.
 */
export function findCountryLocale(query: string): CountryPresetItem | null {
  if (!query || typeof query !== 'string') return null;

  const cleaned = cleanLocationQuery(query);
  const raw = (cleaned || query).trim().toLowerCase();
  if (!raw) return null;

  const normalized = raw.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const unhyphenated = normalized.replace(/-/g, '');

  // 1. Regional Subdivisions (e.g. Maharashtra, Karnataka, Delhi, Bavaria, Berlin, California, etc.)
  const sub =
    REGIONAL_SUBDIVISIONS[normalized] ||
    REGIONAL_SUBDIVISIONS[unhyphenated] ||
    REGIONAL_SUBDIVISIONS[raw];
  if (sub) {
    return {
      name: sub.country,
      slug: sub.country.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      flag: sub.flag,
      currency: sub.currency,
      timezone: sub.timezone,
      region: sub.region,
    };
  }

  // 2. Direct key match in KNOWN_COUNTRIES
  const known = KNOWN_COUNTRIES[normalized] || KNOWN_COUNTRIES[unhyphenated];
  if (known) {
    return {
      name: known.name,
      slug: normalized.length <= 3 ? known.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : normalized,
      flag: known.flag,
      currency: known.currency,
      timezone: known.timezone,
      region: known.region,
    };
  }

  // 3. Direct match in COUNTRY_ALIASES
  const aliasTarget =
    COUNTRY_ALIASES[raw] ||
    COUNTRY_ALIASES[normalized] ||
    COUNTRY_ALIASES[unhyphenated];
  if (aliasTarget) {
    const k = KNOWN_COUNTRIES[aliasTarget];
    if (k) {
      return {
        name: k.name,
        slug: aliasTarget,
        flag: k.flag,
        currency: k.currency,
        timezone: k.timezone,
        region: k.region,
      };
    }
    const subTarget = REGIONAL_SUBDIVISIONS[aliasTarget];
    if (subTarget) {
      return {
        name: subTarget.country,
        slug: subTarget.country.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        flag: subTarget.flag,
        currency: subTarget.currency,
        timezone: subTarget.timezone,
        region: subTarget.region,
      };
    }
  }

  // 4. Exact or prefix match against country name in COUNTRY_PRESETS
  for (const item of COUNTRY_PRESETS) {
    const itemNorm = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const itemUnhyphen = itemNorm.replace(/-/g, '');
    if (
      itemNorm === normalized ||
      itemUnhyphen === unhyphenated ||
      item.slug === normalized ||
      item.slug.replace(/-/g, '') === unhyphenated
    ) {
      return item;
    }
  }

  // 5. Partial / word boundary match against preset countries
  for (const item of COUNTRY_PRESETS) {
    const itemNorm = item.name.toLowerCase();
    if (itemNorm.startsWith(raw) || raw.startsWith(itemNorm)) {
      return item;
    }
  }

  // 6. Substring match across regional subdivisions (e.g. "shopify-agency-in-maharashtra" contains "maharashtra")
  for (const [subKey, subVal] of Object.entries(REGIONAL_SUBDIVISIONS)) {
    if (normalized.includes(subKey) || unhyphenated.includes(subKey.replace(/-/g, ''))) {
      return {
        name: subVal.country,
        slug: subVal.country.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        flag: subVal.flag,
        currency: subVal.currency,
        timezone: subVal.timezone,
        region: subVal.region,
      };
    }
  }

  // 7. Check if query matches an ISO 3166-1 alpha-2 code directly (e.g. "KW", "IN", "US", "DE")
  if (raw.length === 2 && /^[a-z]{2}$/.test(raw)) {
    const flag = getFlagEmojiFromCountryCode(raw);
    if (flag) {
      try {
        const dn = new Intl.DisplayNames(['en'], { type: 'region' });
        const name = dn.of(raw.toUpperCase()) || raw.toUpperCase();
        return {
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          flag,
          currency: 'USD',
          timezone: 'UTC',
          region: 'International',
        };
      } catch {
        // fallback
      }
    }
  }

  // 8. Check Intl.DisplayNames reverse lookup (all 249 ISO regions)
  const isoFromRegion = REGION_NAMES_TO_ISO[raw] || REGION_NAMES_TO_ISO[normalized];
  if (isoFromRegion) {
    const flag = getFlagEmojiFromCountryCode(isoFromRegion);
    try {
      const dn = new Intl.DisplayNames(['en'], { type: 'region' });
      const name = dn.of(isoFromRegion) || query;
      return {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        flag: flag || '🌐',
        currency: 'USD',
        timezone: 'UTC',
        region: 'International',
      };
    } catch {
      // fallback
    }
  }

  return null;
}

export function getCountryMeta(slug?: string, title?: string, heroPayload?: Record<string, any>): CountryMeta {
  const cleanedSlug = cleanLocationQuery(slug || '');
  const normalizedSlug = cleanedSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const rawTitle = (title || slug || 'Global Market').split('|')[0]?.trim() || 'Global Market';
  const cleanTitle = cleanLocationQuery(rawTitle) || rawTitle;
  const countryName = heroPayload?.country?.name ? cleanLocationQuery(heroPayload.country.name) : cleanTitle;

  const matchedLocale =
    findCountryLocale(countryName) ||
    findCountryLocale(cleanTitle) ||
    findCountryLocale(normalizedSlug) ||
    findCountryLocale(slug || '') ||
    findCountryLocale(rawTitle) ||
    findCountryLocale(heroPayload?.country?.flag ? getCountryCodeFromFlagEmoji(heroPayload.country.flag) : '');

  // 1. Explicit flag in heroPayload if it's a real flag (not '🌐' and not empty)
  let flag = heroPayload?.country?.flag;
  let isoCode = '';
  if (flag && flag !== '🌐' && flag.trim() !== '') {
    isoCode = getCountryCodeFromFlagEmoji(flag);
  }

  // 2. If no valid flag or flag is '🌐', use matchedLocale
  if (!flag || flag === '🌐' || flag.trim() === '') {
    flag = matchedLocale?.flag;
    isoCode = matchedLocale ? getCountryCodeFromFlagEmoji(matchedLocale.flag) || (matchedLocale.slug.length === 2 ? matchedLocale.slug.toUpperCase() : '') : '';
  }

  // Fallback 2-letter ISO code from slug
  if ((!flag || flag === '🌐' || flag.trim() === '') && /^[a-z]{2}$/i.test(normalizedSlug)) {
    const isoFlag = getFlagEmojiFromCountryCode(normalizedSlug);
    if (isoFlag) {
      flag = isoFlag;
      isoCode = normalizedSlug.toUpperCase();
    }
  }

  if (!flag || flag.trim() === '') {
    flag = '🌐';
  }
  if (!isoCode && flag && flag !== '🌐') {
    isoCode = getCountryCodeFromFlagEmoji(flag);
  }

  const currency = heroPayload?.country?.currency || matchedLocale?.currency || 'USD';
  const timezone = heroPayload?.country?.timezone || matchedLocale?.timezone || 'America/New_York';
  const region = matchedLocale?.region || 'International';

  return {
    name: cleanTitle || matchedLocale?.name || 'Global Market',
    flag,
    isoCode,
    currency,
    timezone,
    region,
  };
}


