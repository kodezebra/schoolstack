import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { getDb } from './db'
import { validatePhoto, uploadPhoto, deletePhoto, getPhotoPath } from './storage'
import { requireRole } from '../middleware/auth'

type Bindings = {
  DB: D1Database
  ASSETS: R2Bucket
}

export const createPhotoRoutes = (
  table: any,
  tableName: 'students' | 'staff',
  idColumn: any
) => {
  const photoRoutes = new Hono<{ Bindings: Bindings }>()

  photoRoutes.post('/:id/photo', requireRole('owner', 'admin', 'editor'), async (c) => {
    const db = getDb(c)
    const id = c.req.param('id')

    const formData = await c.req.parseBody()
    const file = formData['photo'] as File | null

    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }

    const validation = validatePhoto(file)
    if (!validation.valid) {
      return c.json({ error: validation.error }, 400)
    }

    const path = getPhotoPath(tableName, id)
    const result = await uploadPhoto(c.env.ASSETS, file, path, c.req.url)

    if (!result.success) {
      return c.json({ error: 'Failed to upload file to storage' }, 500)
    }

    const [updated] = await db.update(table)
      .set({ photo: result.url, updatedAt: new Date() })
      .where(eq(idColumn, id))
      .returning() as any

    if (!updated) return c.notFound()

    return c.json({ photo: result.url, success: true })
  })

  photoRoutes.delete('/:id/photo', requireRole('owner', 'admin', 'editor'), async (c) => {
    const db = getDb(c)
    const id = c.req.param('id')

    const record = await db.select().from(table).where(eq(idColumn, id)).get()
    if (!record) return c.notFound()

    await deletePhoto(c.env.ASSETS, record.photo || '')

    await db.update(table)
      .set({ photo: null, updatedAt: new Date() })
      .where(eq(idColumn, id))
      .returning() as any

    return c.json({ success: true })
  })

  return photoRoutes
}
