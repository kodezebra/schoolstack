import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, desc } from 'drizzle-orm'
import { assets, sessions } from '../db/schema'
import { getCookie } from 'hono/cookie'
import { createId } from '@paralleldrive/cuid2'

type Bindings = {
  DB: D1Database
  ASSETS: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

// Auth Middleware Helper
const getSession = async (c: any) => {
  const db = drizzle(c.env.DB)
  const sessionId = getCookie(c, 'session')
  if (!sessionId) return null

  const session = await db.select().from(sessions).where(eq(sessions.id, sessionId as string)).get()
  if (!session || session.expiresAt < new Date()) return null
  return session
}

// UPLOAD
app.post('/upload', async (c) => {
  const session = await getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)

  const formData = await c.req.parseBody()
  const file = formData['file'] as File

  if (!file) return c.json({ error: 'No file uploaded' }, 400)

  const db = drizzle(c.env.DB)
  const key = `${createId()}-${file.name}`
  
  // Upload to R2
  await c.env.ASSETS.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { originalName: file.name }
  })

  // Save to DB
  const [asset] = await db.insert(assets).values({
    name: file.name,
    key,
    mimeType: file.type,
    size: file.size,
  }).returning()

  return c.json(asset)
})

// LIST
app.get('/', async (c) => {
  const session = await getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)

  const db = drizzle(c.env.DB)
  const result = await db.select().from(assets).orderBy(desc(assets.createdAt))
  return c.json(result)
})

// SERVE / PROXY
app.get('/:key', async (c) => {
  const key = c.req.param('key')
  const object = await c.env.ASSETS.get(key)

  if (!object) return c.notFound()

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)

  return c.body(object.body, 200, Object.fromEntries(headers))
})

// DELETE
app.delete('/:id', async (c) => {
  const session = await getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)

  const id = c.req.param('id')
  const db = drizzle(c.env.DB)

  const asset = await db.select().from(assets).where(eq(assets.id, id)).get()
  if (!asset) return c.notFound()

  // Delete from R2
  await c.env.ASSETS.delete(asset.key)

  // Delete from DB
  await db.delete(assets).where(eq(assets.id, id))

  return c.json({ success: true })
})

export default app
