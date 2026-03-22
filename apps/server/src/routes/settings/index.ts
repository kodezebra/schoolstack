import { Hono } from 'hono'
import { getDb } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { siteSettings } from '@/db/schema'
import { authMiddleware, requireRole } from '@/middleware/auth'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', authMiddleware)
app.use('/', requireRole('owner', 'admin'))

app.get('/', async (c) => {
  const db = getDb(c)
  let settings = await db.select().from(siteSettings).where(eq(siteSettings.id, 'default')).get()

  if (!settings) {
    [settings] = await db.insert(siteSettings).values({ id: 'default' }).returning()
  }

  return c.json(settings)
})

app.put('/', async (c) => {
  const db = getDb(c)
  
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const updateData: any = {
    updatedAt: new Date()
  }

  const fields = [
    'logoText', 'logoType', 'logoIcon', 'logoImage', 'favicon',
    'footerDescription', 'primaryColor', 'accentColor',
    'navbarConfig', 'navbarCta', 'footerConfig', 'footerSocials',
    'schoolName', 'schoolAddress', 'schoolPhone', 'schoolEmail',
    'theme', 'fontDisplay', 'fontBody', 'borderRadius', 'darkMode',
    'backgroundLight', 'backgroundDark', 'reportCardTheme'
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

// Extra fees library
app.get('/extra-fees', async (c) => {
  const db = getDb(c)
  const settings = await db.select().from(siteSettings).where(eq(siteSettings.id, 'default')).get()
  
  let library: any[] = []
  if (settings?.extraFeesLibrary) {
    try {
      library = JSON.parse(settings.extraFeesLibrary as string)
    } catch {
      library = []
    }
  }
  
  return c.json(library)
})

app.put('/extra-fees', async (c) => {
  const db = getDb(c)
  
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const library = body.library || []

  const [updated] = await db.update(siteSettings)
    .set({ 
      extraFeesLibrary: JSON.stringify(library),
      updatedAt: new Date()
    })
    .where(eq(siteSettings.id, 'default'))
    .returning()

  return c.json({ success: true, library })
})

export default app
