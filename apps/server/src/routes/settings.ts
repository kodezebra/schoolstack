import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { siteSettings } from '../db/schema'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// GET site settings
app.get('/', async (c) => {
  const db = drizzle(c.env.DB)
  let settings = await db.select().from(siteSettings).where(eq(siteSettings.id, 'default')).get()

  if (!settings) {
    // Initialize if not exists
    [settings] = await db.insert(siteSettings).values({ id: 'default' }).returning()
  }

  return c.json(settings)
})

// PUT update site settings (Partial Update)
app.put('/', async (c) => {
  const db = drizzle(c.env.DB)
  
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  // Build update object only with provided fields
  const updateData: any = {
    updatedAt: new Date()
  }

  const fields = [
    'logoText', 'logoType', 'logoIcon', 'logoImage', 'favicon',
    'footerDescription', 'primaryColor', 'accentColor',
    'navbarConfig', 'navbarCta', 'footerConfig', 'footerSocials'
  ]

  for (const field of fields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field]
    }
  }

  const [updated] = await db.update(siteSettings)
    .set(updateData)
    .where(eq(siteSettings.id, 'default'))
    .returning()

  return c.json(updated)
})

export default app
