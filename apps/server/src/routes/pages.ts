import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, desc } from 'drizzle-orm'
import { pages, blocks } from '../db/schema'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// GET all pages
app.get('/', async (c) => {
  const db = drizzle(c.env.DB)
  const result = await db.select().from(pages).orderBy(desc(pages.updatedAt))
  return c.json(result)
})

// GET single page with blocks
app.get('/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  
  const page = await db.select().from(pages).where(eq(pages.id, id)).get()
  
  if (!page) return c.json({ error: 'Page not found' }, 404)

  const pageBlocks = await db
    .select()
    .from(blocks)
    .where(eq(blocks.pageId, id))
    .orderBy(blocks.order)

  return c.json({ ...page, blocks: pageBlocks })
})

// POST new page
app.post('/', async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()
  
  const [newPage] = await db.insert(pages).values({
    title: body.title,
    slug: body.slug,
    description: body.description,
    status: body.status,
    metaTitle: body.metaTitle,
    metaDescription: body.metaDescription,
  }).returning()

  return c.json(newPage)
})

// PATCH update page settings
app.patch('/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const [updatedPage] = await db.update(pages)
    .set({
      title: body.title,
      slug: body.slug,
      description: body.description,
      status: body.status,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      updatedAt: new Date()
    })
    .where(eq(pages.id, id))
    .returning()

  return c.json(updatedPage)
})

// PUT sync blocks
app.put('/:id/blocks', async (c) => {
  const db = drizzle(c.env.DB)
  const pageId = c.req.param('id')
  const newBlocks = await c.req.json()

  await db.delete(blocks).where(eq(blocks.pageId, pageId))

  if (newBlocks.length > 0) {
    const blocksToInsert = newBlocks.map((b: any, index: number) => ({
      pageId,
      type: b.type,
      content: typeof b.content === 'string' ? b.content : JSON.stringify(b.content),
      order: index,
    }))
    
    await db.insert(blocks).values(blocksToInsert)
  }

  await db.update(pages)
    .set({ updatedAt: new Date() })
    .where(eq(pages.id, pageId))

  return c.json({ success: true })
})

export default app
