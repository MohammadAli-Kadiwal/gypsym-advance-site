export interface ParsedVideo {
  type: 'youtube' | 'vimeo' | 'loom' | 'direct' | 'iframe';
  embedUrl: string;
  isDirectFile: boolean;
}

/**
 * Parses user-provided video URLs (YouTube, Vimeo, Loom, Cloudinary, direct MP4/WebM/MOV)
 * and resolves the appropriate embed or streamable URL.
 */
export function parseVideoUrl(rawUrl?: string | null): ParsedVideo | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const url = rawUrl.trim();
  if (!url) return null;

  // 1. YouTube
  // Supports: youtu.be/<id>, youtube.com/watch?v=<id>, youtube.com/embed/<id>, youtube.com/shorts/<id>, etc.
  const ytRegex = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?.*v=|embed\/|shorts\/|v\/|live\/))([a-zA-Z0-9_-]{11})/i;
  const ytMatch = url.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
      isDirectFile: false,
    };
  }

  // 2. Vimeo
  // Supports: vimeo.com/<id>, player.vimeo.com/video/<id>
  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`,
      isDirectFile: false,
    };
  }

  // 3. Loom
  // Supports: loom.com/share/<id>, loom.com/embed/<id>
  const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9_-]+)/i);
  if (loomMatch && loomMatch[1]) {
    const videoId = loomMatch[1];
    return {
      type: 'loom',
      embedUrl: `https://www.loom.com/embed/${videoId}?autoplay=1`,
      isDirectFile: false,
    };
  }

  // 4. Direct video files (.mp4, .webm, .mov, .m4v, .ogg)
  const cleanPath = (url.split('?')[0] || '').split('#')[0]?.toLowerCase() || '';
  const directExtensions = ['.mp4', '.webm', '.mov', '.m4v', '.ogg'];
  const isDirect = directExtensions.some((ext) => cleanPath.endsWith(ext));

  if (isDirect) {
    return {
      type: 'direct',
      embedUrl: url,
      isDirectFile: true,
    };
  }

  // 5. Fallback - treat as generic embed URL
  return {
    type: 'iframe',
    embedUrl: url,
    isDirectFile: false,
  };
}
