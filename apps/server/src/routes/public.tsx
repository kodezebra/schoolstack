import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, and } from 'drizzle-orm'
import { pages, blocks, siteSettings } from '../db/schema'
import { PublicLayout } from '../layouts/public'
import * as Blocks from '../components/blocks'

type Bindings = {
  DB: D1Database
  FRONTEND_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

const renderPage = async (c: any, slug: string) => {
  const db = drizzle(c.env.DB)
  const dashboardUrl = c.env.FRONTEND_URL || 'http://localhost:5173'

  // Fetch Site Settings
  const settings = await db.select().from(siteSettings).where(eq(siteSettings.id, 'default')).get()

  const page = await db
    .select()
    .from(pages)
    .where(and(eq(pages.slug, slug), eq(pages.status, 'published')))
    .get()

  if (!page) {
    return c.html(
      <PublicLayout 
        title="404 - Page Not Found" 
        dashboardUrl={dashboardUrl} 
        settings={settings}
      >
        <Blocks.NotFound dashboardUrl={dashboardUrl} />
      </PublicLayout>,
      404
    )
  }

  const pageBlocks = await db
    .select()
    .from(blocks)
    .where(eq(blocks.pageId, page.id))
    .orderBy(blocks.order)

  // Identify overrides
  let navbarOverride = null
  let footerOverride = null
  
  const contentBlocks = pageBlocks.filter(block => {
    const type = block.type.toLowerCase()
    if (type === 'navbar') {
      navbarOverride = typeof block.content === 'string' ? JSON.parse(block.content) : block.content
      return false
    }
    if (type === 'footer') {
      footerOverride = typeof block.content === 'string' ? JSON.parse(block.content) : block.content
      return false
    }
    return true
  })

  return c.html(
    <PublicLayout 
      title={page.metaTitle || page.title} 
      description={page.metaDescription || page.description || ''}
      dashboardUrl={dashboardUrl}
      settings={settings}
      navbarOverride={navbarOverride}
      footerOverride={footerOverride}
    >
      {contentBlocks.map((block) => {
        const content = typeof block.content === 'string' ? JSON.parse(block.content) : block.content
        // Convert kebab-case to PascalCase (e.g., 'contact-form' -> 'ContactForm')
        const typeName = block.type
          .split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join('')
        const BlockComponent = (Blocks as any)[typeName]

        if (BlockComponent) {
          if (block.type === 'hero') {
            return <BlockComponent content={content} settings={settings} />
          }
          return <BlockComponent content={content} />
        }

        return null
      })}
    </PublicLayout>
  )
}

// HOME PAGE
app.get('/', (c) => renderPage(c, 'home'))

// ANY SLUG
app.get('/:slug', (c) => renderPage(c, c.req.param('slug')))

export default app
