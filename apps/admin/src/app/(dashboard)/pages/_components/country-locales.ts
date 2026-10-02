// Exhaustive Global Currency & Timezone Datasets and Country Meta Helpers

export interface CountryMeta {
  name: string;
  flag: string;
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
 * Searches and automatically detects matching country locale metadata (Timezone, Currency, Flag, Slug).
 * Supports fuzzy matching against country names, slugs, ISO codes, and common aliases.
 */
export function findCountryLocale(query: string): CountryPresetItem | null {
  if (!query || typeof query !== 'string') return null;
  const raw = query.trim().toLowerCase();
  if (!raw) return null;

  const normalized = raw.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // 1. Direct key match in KNOWN_COUNTRIES
  if (KNOWN_COUNTRIES[normalized]) {
    const k = KNOWN_COUNTRIES[normalized];
    return {
      name: k.name,
      slug: normalized.length <= 3 ? k.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : normalized,
      flag: k.flag,
      currency: k.currency,
      timezone: k.timezone,
      region: k.region,
    };
  }

  // 2. Exact or prefix match against country name
  for (const item of COUNTRY_PRESETS) {
    const itemNorm = item.name.toLowerCase();
    if (itemNorm === raw || item.slug === normalized) {
      return item;
    }
  }

  // 3. Partial / word boundary match
  for (const item of COUNTRY_PRESETS) {
    const itemNorm = item.name.toLowerCase();
    if (itemNorm.startsWith(raw) || raw.startsWith(itemNorm)) {
      return item;
    }
  }

  // 4. Aliases
  const aliasMap: Record<string, string> = {
    usa: 'united-states',
    america: 'united-states',
    us: 'united-states',
    uk: 'united-kingdom',
    britain: 'united-kingdom',
    england: 'united-kingdom',
    uae: 'united-arab-emirates',
    dubai: 'united-arab-emirates',
    emirates: 'united-arab-emirates',
    ksa: 'saudi-arabia',
    saudi: 'saudi-arabia',
    deutschland: 'germany',
    bharat: 'india',
  };

  const aliasKey = aliasMap[raw] || aliasMap[normalized];
  if (aliasKey && KNOWN_COUNTRIES[aliasKey]) {
    const k = KNOWN_COUNTRIES[aliasKey];
    return {
      name: k.name,
      slug: aliasKey,
      flag: k.flag,
      currency: k.currency,
      timezone: k.timezone,
      region: k.region,
    };
  }

  return null;
}

export function getCountryMeta(slug?: string, title?: string, heroPayload?: Record<string, any>): CountryMeta {
  const normalized = (slug || '').toLowerCase();
  const known = KNOWN_COUNTRIES[normalized];
  const cleanTitle = (title || slug || 'Global Market').split('|')[0]?.trim() || 'Global Market';

  const currency = heroPayload?.country?.currency || known?.currency || 'USD';
  const timezone = heroPayload?.country?.timezone || known?.timezone || 'America/New_York';
  const flag = known?.flag || '🌐';
  const region = known?.region || 'International';

  return {
    name: cleanTitle,
    flag,
    currency,
    timezone,
    region,
  };
}
