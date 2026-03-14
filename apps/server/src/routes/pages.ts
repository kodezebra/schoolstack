import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, desc } from 'drizzle-orm'
import { pages, blocks } from '../db/schema'
import { z } from 'zod'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Validation Schemas
const createPageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  blocks: z.array(z.any()).optional(),
})

const updatePageSchema = createPageSchema.partial()

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
  
  const validation = createPageSchema.safeParse(body)
  if (!validation.success) {
    return c.json({ error: 'Invalid input', details: validation.error.format() }, 400)
  }

  const { title, slug, description, status, metaTitle, metaDescription, blocks: initialBlocks } = validation.data;
  
  const [newPage] = await db.insert(pages).values({
    title,
    slug,
    description,
    status,
    metaTitle,
    metaDescription,
  }).returning()

  if (initialBlocks && initialBlocks.length > 0) {
    const blocksToInsert = initialBlocks.map((b: any, index: number) => ({
      pageId: newPage.id,
      type: b.type,
      content: typeof b.content === 'string' ? b.content : JSON.stringify(b.content),
      order: index,
    }))
    await db.insert(blocks).values(blocksToInsert)
  }

  return c.json(newPage)
})

// PATCH update page settings
app.patch('/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const validation = updatePageSchema.safeParse(body)
  if (!validation.success) {
    return c.json({ error: 'Invalid input', details: validation.error.format() }, 400)
  }

  const [updatedPage] = await db.update(pages)
    .set({
      ...validation.data,
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

// DELETE page
app.delete('/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')

  // Delete blocks first (though they might be cascade deleted depending on schema, 
  // let's be explicit if not sure, or just rely on schema if it's there)
  await db.delete(blocks).where(eq(blocks.pageId, id))
  
  const result = await db.delete(pages).where(eq(pages.id, id)).returning()

  if (result.length === 0) {
    return c.json({ error: 'Page not found' }, 404)
  }

  return c.json({ success: true })
})

export default app
