import { Hono } from 'hono'
import { getDb } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'
import { pages, blocks } from '@/db/schema'
import { z } from 'zod'
import { authMiddleware, requireRole } from '@/middleware/auth'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', authMiddleware)
app.use('/', requireRole('owner', 'admin', 'editor'))

// Validation Schemas
const createPageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  order: z.number().optional().default(0),
  status: z.enum(['draft', 'published']).default('draft'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  blocks: z.array(z.any()).optional(),
})

const updatePageSchema = createPageSchema.partial()

// GET all pages with hierarchy
app.get('/', async (c) => {
  const db = getDb(c)
  const result = await db.select().from(pages).orderBy(pages.order, desc(pages.updatedAt))
  
  // Build hierarchical structure recursively
  const pageMap = new Map(result.map(p => [p.id, { ...p, children: [] as any[] }]))
  const rootPages: any[] = []

  for (const page of result) {
    const pageWithChildren = pageMap.get(page.id)
    if (page.parentId && pageMap.has(page.parentId)) {
      pageMap.get(page.parentId)!.children.push(pageWithChildren)
    } else {
      rootPages.push(pageWithChildren)
    }
  }
  
  return c.json(rootPages)
})

// GET single page with blocks
app.get('/:id', async (c) => {
  const db = getDb(c)
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
  const db = getDb(c)
  const body = await c.req.json()
  
  const validation = createPageSchema.safeParse(body)
  if (!validation.success) {
    return c.json({ error: 'Invalid input', details: validation.error.format() }, 400)
  }

  const { title, slug, description, parentId, order, status, metaTitle, metaDescription, blocks: initialBlocks } = validation.data;

  const newPage = await db.insert(pages).values({
    title,
    slug,
    description,
    parentId: parentId || null,
    order,
    status,
    metaTitle,
    metaDescription,
  }).returning().get()

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
  const db = getDb(c)
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
  const db = getDb(c)
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
  const db = getDb(c)
  const id = c.req.param('id')

  // Delete blocks first (though they might be cascade deleted depending on schema, 
  // let's be explicit if not sure, or just rely on schema if it's there)
  await db.delete(blocks).where(eq(blocks.pageId, id))
  
  const deleted = await db.delete(pages).where(eq(pages.id, id)).returning().get()

  if (!deleted) {
    return c.json({ error: 'Page not found' }, 404)
  }

  return c.json({ success: true })
})

export default app
