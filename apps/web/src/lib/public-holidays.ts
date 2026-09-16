/**
 * Public Holidays Directory & Utility
 * Used to disable selection of official public holidays in discovery call bookings.
 */

// Fixed annual holidays observed every year
const FIXED_ANNUAL_HOLIDAYS: Record<string, string> = {
  '01-01': "New Year's Day",
  '01-26': 'Republic Day',
  '05-01': "Labour Day / Workers' Day",
  '08-15': 'Independence Day',
  '10-02': 'Mahatma Gandhi Jayanti',
  '12-25': 'Christmas Day',
};

// Variable / Lunar & Gazetted Public Holidays (2025 - 2028)
const SPECIFIC_HOLIDAYS: Record<string, string> = {
  // ── 2025 ──
  '2025-01-14': 'Makar Sankranti / Pongal',
  '2025-02-26': 'Maha Shivratri',
  '2025-03-14': 'Holi',
  '2025-03-31': 'Eid al-Fitr',
  '2025-04-10': 'Mahavir Jayanti',
  '2025-04-18': 'Good Friday',
  '2025-05-12': 'Buddha Purnima',
  '2025-06-07': 'Eid al-Adha (Bakrid)',
  '2025-07-06': 'Muharram',
  '2025-08-16': 'Janmashtami',
  '2025-09-05': 'Milad-un-Nabi',
  '2025-10-02': 'Dussehra / Vijayadashami',
  '2025-10-20': 'Diwali (Deepavali)',
  '2025-10-22': 'Bhai Dooj',
  '2025-11-05': 'Guru Nanak Jayanti',

  // ── 2026 (Current Year) ──
  '2026-01-14': 'Makar Sankranti / Pongal',
  '2026-02-15': 'Maha Shivratri',
  '2026-03-04': 'Holi',
  '2026-03-20': 'Eid al-Fitr',
  '2026-03-31': 'Mahavir Jayanti',
  '2026-04-03': 'Good Friday',
  '2026-05-27': 'Eid al-Adha (Bakrid)',
  '2026-05-31': 'Buddha Purnima',
  '2026-06-25': 'Muharram',
  '2026-08-15': 'Independence Day',
  '2026-09-04': 'Janmashtami',
  '2026-09-25': 'Milad-un-Nabi',
  '2026-10-20': 'Dussehra (Vijayadashami)',
  '2026-11-08': 'Diwali (Deepavali)',
  '2026-11-10': 'Bhai Dooj / Govardhan Puja',
  '2026-11-24': 'Guru Nanak Jayanti',

  // ── 2027 ──
  '2027-01-14': 'Makar Sankranti / Pongal',
  '2027-03-06': 'Maha Shivratri',
  '2027-03-10': 'Eid al-Fitr',
  '2027-03-23': 'Holi',
  '2027-03-26': 'Good Friday',
  '2027-04-19': 'Mahavir Jayanti',
  '2027-05-16': 'Eid al-Adha (Bakrid)',
  '2027-05-20': 'Buddha Purnima',
  '2027-06-15': 'Muharram',
  '2027-08-25': 'Janmashtami',
  '2027-09-15': 'Milad-un-Nabi',
  '2027-10-10': 'Dussehra (Vijayadashami)',
  '2027-10-29': 'Diwali (Deepavali)',
  '2027-10-31': 'Bhai Dooj',
  '2027-11-14': 'Guru Nanak Jayanti',

  // ── 2028 ──
  '2028-01-14': 'Makar Sankranti / Pongal',
  '2028-02-24': 'Maha Shivratri',
  '2028-02-28': 'Eid al-Fitr',
  '2028-03-11': 'Holi',
  '2028-04-07': 'Mahavir Jayanti',
  '2028-04-14': 'Good Friday',
  '2028-05-05': 'Eid al-Adha (Bakrid)',
  '2028-05-08': 'Buddha Purnima',
  '2028-06-03': 'Muharram',
  '2028-08-14': 'Janmashtami',
  '2028-09-03': 'Milad-un-Nabi',
  '2028-09-29': 'Dussehra (Vijayadashami)',
  '2028-10-17': 'Diwali (Deepavali)',
  '2028-10-19': 'Bhai Dooj',
  '2028-11-02': 'Guru Nanak Jayanti',
};

/**
 * Returns the name of the public holiday for a given date in 'YYYY-MM-DD' format,
 * or null if the date is a regular business day.
 */
export function getPublicHoliday(dateStr: string): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null;

  // Exact match from variable / lunar calendar
  if (SPECIFIC_HOLIDAYS[dateStr]) {
    return SPECIFIC_HOLIDAYS[dateStr];
  }

  // Check recurring annual fixed holidays (MM-DD)
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const mmDd = `${parts[1]}-${parts[2]}`;
    if (FIXED_ANNUAL_HOLIDAYS[mmDd]) {
      return FIXED_ANNUAL_HOLIDAYS[mmDd];
    }
  }

  return null;
}

/**
 * Checks if a given date string ('YYYY-MM-DD') is a public holiday.
 */
export function isPublicHoliday(dateStr: string): boolean {
  return getPublicHoliday(dateStr) !== null;
}
