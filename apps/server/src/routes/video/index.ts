import { Hono } from 'hono'
import { createId } from '@paralleldrive/cuid2'
import { parseVideoUrl, createVideoBlock, enrichVideoBlock, type VideoItem } from '@/lib/video-utils'

type Bindings = {
  DB: D1Database
  FRONTEND_URL: string
  ASSETS: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

app.post('/parse', async (c) => {
  const body = await c.req.json() as { url?: string; title?: string }

  if (!body.url) {
    return c.json({ error: 'Missing video URL' }, 400)
  }

  const parsed = parseVideoUrl(body.url)

  if (!parsed.success) {
    return c.json({ error: parsed.error || 'Failed to parse URL' }, 400)
  }

  let block = createVideoBlock(body.url, body.title)

  if (block.platform === 'tiktok' && !block.thumbnail) {
    block = await enrichVideoBlock(block)
  }

  return c.json({
    success: true,
    block: {
      id: createId(),
      ...block,
    },
  })
})

app.post('/enrich', async (c) => {
  const body = await c.req.json() as { block: Omit<VideoItem, 'id'> }

  if (!body.block) {
    return c.json({ error: 'Missing block data' }, 400)
  }

  const enriched = await enrichVideoBlock(body.block)

  return c.json({
    success: true,
    block: enriched,
  })
})

app.get('/thumbnail', async (c) => {
  const videoUrl = c.req.query('url')

  if (!videoUrl) {
    return c.json({ error: 'Missing video URL' }, 400)
  }

  const lowerUrl = videoUrl.toLowerCase()

  if (lowerUrl.includes('tiktok.com')) {
    try {
      const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`)
      if (!response.ok) {
        return c.json({ error: 'Could not fetch TikTok thumbnail' }, 404)
      }

      const data = await response.json() as { thumbnail_url?: string }
      if (data.thumbnail_url) {
        return c.json({ thumbnail: data.thumbnail_url, platform: 'tiktok' })
      }
      return c.json({ error: 'No thumbnail found' }, 404)
    } catch {
      return c.json({ error: 'Failed to fetch TikTok thumbnail' }, 500)
    }
  }

  return c.json({ error: 'Unsupported platform for thumbnail' }, 400)
})

export default app
