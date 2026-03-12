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

// PUT update site settings
app.put('/', async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()
  
  const [updated] = await db.update(siteSettings)
    .set({
      logoText: body.logoText,
      logoType: body.logoType,
      logoIcon: body.logoIcon,
      logoImage: body.logoImage,
      favicon: body.favicon,
      footerDescription: body.footerDescription,
      primaryColor: body.primaryColor,
      accentColor: body.accentColor,
      navbarConfig: body.navbarConfig,
      footerConfig: body.footerConfig,
      updatedAt: new Date()
    })
    .where(eq(siteSettings.id, 'default'))
    .returning()
    
  return c.json(updated)
})

export default app
