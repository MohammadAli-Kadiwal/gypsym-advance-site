/**
 * General purpose Image Optimization Utility for Gypsym Web
 * Used for background images, open-graph cards, and direct HTML image elements.
 */
export function optimizeImageUrl(
  url?: string | null,
  options?: {
    width?: number;
    height?: number;
    quality?: number | 'auto' | 'auto:good' | 'auto:best';
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  }
): string {
  if (!url || typeof url !== 'string') return '';

  const cleanUrl = url.trim();
  if (cleanUrl.startsWith('data:') || cleanUrl.endsWith('.svg') || cleanUrl.includes('.svg?')) {
    return cleanUrl;
  }

  const { width = 1200, height, quality = 'auto:good', format = 'auto' } = options || {};

  // Cloudinary Optimization
  if (cleanUrl.includes('res.cloudinary.com')) {
    const uploadIndex = cleanUrl.indexOf('/upload/');
    if (uploadIndex !== -1) {
      const prefix = cleanUrl.substring(0, uploadIndex + 8);
      const suffix = cleanUrl.substring(uploadIndex + 8);
      const cleanSuffix = suffix.replace(/^(f_auto|q_auto[^/]*|w_\d+|c_\w+|h_\d+|dpr_\d+|,)+\//, '');

      const params: string[] = [`f_${format}`, `q_${quality}`];
      if (width) params.push(`w_${width}`);
      if (height) params.push(`h_${height}`);
      params.push('c_limit');

      return `${prefix}${params.join(',')}/${cleanSuffix}`;
    }
  }

  // Unsplash Optimization
  if (cleanUrl.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(cleanUrl);
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('fit', 'crop');
      if (width) parsed.searchParams.set('w', String(width));
      if (height) parsed.searchParams.set('h', String(height));
      parsed.searchParams.set('q', quality === 'auto' || quality === 'auto:good' ? '80' : String(quality));
      return parsed.toString();
    } catch {
      return cleanUrl;
    }
  }

  return cleanUrl;
}

