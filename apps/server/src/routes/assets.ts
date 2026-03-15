import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, desc } from 'drizzle-orm'
import { assets } from '@/db/schema'
import { createId } from '@paralleldrive/cuid2'
import { authMiddleware, requireRole } from '@/middleware/auth'

type Bindings = {
  DB: D1Database
  ASSETS: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

// List & Upload: editor+
// Delete: admin+
// Serve: public (needed for public pages)

// UPLOAD - editor+
app.post('/upload', authMiddleware, requireRole('owner', 'admin', 'editor'), async (c) => {
  const formData = await c.req.parseBody()
  const file = formData['file'] as File

  if (!file) return c.json({ error: 'No file uploaded' }, 400)

  const db = drizzle(c.env.DB)
  const key = `${createId()}-${file.name}`
  
  await c.env.ASSETS.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { originalName: file.name }
  })

  const [asset] = await db.insert(assets).values({
    name: file.name,
    key,
    mimeType: file.type,
    size: file.size,
  }).returning()

  return c.json(asset)
})

// LIST - editor+
app.get('/', authMiddleware, requireRole('owner', 'admin', 'editor'), async (c) => {
  const db = drizzle(c.env.DB)
  const result = await db.select().from(assets).orderBy(desc(assets.createdAt))
  return c.json(result)
})

// SERVE - Public (needed for public pages)
app.get('/:key', async (c) => {
  const key = c.req.param('key')
  const object = await c.env.ASSETS.get(key)

  if (!object) return c.notFound()

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)

  return c.body(object.body, 200, Object.fromEntries(headers))
})

// DELETE - admin+
app.delete('/:id', authMiddleware, requireRole('owner', 'admin'), async (c) => {
  const id = c.req.param('id')
  const db = drizzle(c.env.DB)

  const asset = await db.select().from(assets).where(eq(assets.id, id)).get()
  if (!asset) return c.notFound()

  await c.env.ASSETS.delete(asset.key)
  await db.delete(assets).where(eq(assets.id, id))

  return c.json({ success: true })
})

export default app
