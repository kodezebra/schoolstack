export type VideoPlatform = 'youtube' | 'tiktok'

export interface VideoItem {
  id: string
  platform: VideoPlatform
  videoId: string
  url: string
  embedUrl: string
  thumbnail: string
  title?: string
  embedAllowed: boolean
}

export interface VideoParseResult {
  success: boolean
  platform?: VideoPlatform
  videoId?: string
  embedUrl?: string
  thumbnail?: string
  embedAllowed?: boolean
  error?: string
}

export function parseVideoUrl(url: string): VideoParseResult {
  const lowerUrl = url.toLowerCase()

  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return parseYouTubeUrl(url)
  }

  if (lowerUrl.includes('tiktok.com')) {
    return parseTikTokUrl(url)
  }

  return { success: false, error: 'Unsupported platform. Use YouTube or TikTok.' }
}

function parseYouTubeUrl(url: string): VideoParseResult {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      const videoId = match[1]
      return {
        success: true,
        platform: 'youtube',
        videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        embedAllowed: true,
      }
    }
  }

  return { success: false, error: 'Invalid YouTube URL' }
}

function parseTikTokUrl(url: string): VideoParseResult {
  const match = url.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/)
  if (match) {
    const videoId = match[1]
    return {
      success: true,
      platform: 'tiktok',
      videoId,
      embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
      thumbnail: '',
      embedAllowed: false,
    }
  }

  return { success: false, error: 'Invalid TikTok URL' }
}

export function createVideoBlock(url: string, title?: string): Omit<VideoItem, 'id'> {
  const parsed = parseVideoUrl(url)

  return {
    platform: parsed.platform!,
    videoId: parsed.videoId!,
    url,
    embedUrl: parsed.embedUrl!,
    thumbnail: parsed.thumbnail || '',
    title: title || (parsed.platform === 'tiktok' ? 'TikTok Video' : 'YouTube Video'),
    embedAllowed: parsed.embedAllowed ?? true,
  }
}

export async function enrichVideoBlock(block: Omit<VideoItem, 'id'>): Promise<Omit<VideoItem, 'id'>> {
  if (block.platform === 'tiktok' && !block.thumbnail) {
    try {
      const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(block.url)}`)
      if (response.ok) {
        const data = await response.json() as { thumbnail_url?: string; title?: string }
        return {
          ...block,
          thumbnail: data.thumbnail_url || '',
          title: block.title || data.title || 'TikTok Video',
        }
      }
    } catch {
      // Failed to fetch metadata
    }
  }

  return block
}
