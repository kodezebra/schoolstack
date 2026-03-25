export type VideoPlatform = 'youtube' | 'vimeo' | 'tiktok' | 'instagram' | 'facebook' | 'unknown'

export interface VideoInfo {
  platform: VideoPlatform
  videoId: string
  embedUrl: string
}

export function detectVideoPlatform(url: string): VideoPlatform {
  const lowerUrl = url.toLowerCase()
  
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube'
  }
  if (lowerUrl.includes('vimeo.com')) {
    return 'vimeo'
  }
  if (lowerUrl.includes('tiktok.com')) {
    return 'tiktok'
  }
  if (lowerUrl.includes('instagram.com')) {
    return 'instagram'
  }
  if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.watch')) {
    return 'facebook'
  }
  
  return 'unknown'
}

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^[a-zA-Z0-9_-]{11}$/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function extractVimeoId(url: string): string | null {
  const patterns = [
    /vimeo\.com\/(?:video\/)?(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
    /^\d+$/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function extractTikTokId(url: string): string | null {
  const patterns = [
    /tiktok\.com\/@[\w.]+\/video\/(\d+)/,
    /tiktok\.com\/embed\/v1\/(\d+)/,
    /tiktok\.com\/embed\/(\d+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function extractInstagramId(url: string): string | null {
  const patterns = [
    /instagram\.com\/p\/([^/?]+)/,
    /instagram\.com\/reel\/([^/?]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function extractVideoId(url: string, platform: VideoPlatform): string | null {
  switch (platform) {
    case 'youtube':
      return extractYouTubeId(url)
    case 'vimeo':
      return extractVimeoId(url)
    case 'tiktok':
      return extractTikTokId(url)
    case 'instagram':
      return extractInstagramId(url)
    default:
      return null
  }
}

export function getEmbedUrl(platform: VideoPlatform, videoId: string): string {
  switch (platform) {
    case 'youtube':
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
    case 'vimeo':
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`
    case 'tiktok':
      return `https://www.tiktok.com/embed/v1/${videoId}`
    case 'instagram':
      return `https://www.instagram.com/p/${videoId}/embed/`
    case 'facebook':
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoId)}&show_text=false&width=560`
    default:
      return ''
  }
}

export function getVideoInfo(url: string): VideoInfo | null {
  const platform = detectVideoPlatform(url)
  
  if (platform === 'unknown') return null
  
  if (platform === 'facebook') {
    return {
      platform,
      videoId: url,
      embedUrl: getEmbedUrl(platform, url)
    }
  }
  
  const videoId = extractVideoId(url, platform)
  if (!videoId) return null
  
  return {
    platform,
    videoId,
    embedUrl: getEmbedUrl(platform, videoId)
  }
}
