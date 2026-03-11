import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, and, or } from 'drizzle-orm'
import { pages, blocks } from '../db/schema'
import { BaseLayout } from '../layouts/base'
import { Hero, TextBlock, NotFound, Footer } from '../components/blocks'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

const renderPage = async (c: any, slug: string) => {
  const db = drizzle(c.env.DB)
  const dashboardUrl = c.env.FRONTEND_URL || 'http://localhost:5173'

  const page = await db
    .select()
    .from(pages)
    .where(and(eq(pages.slug, slug), eq(pages.status, 'published')))
    .get()

  if (!page) {
    return c.html(
      <BaseLayout title="404 - Page Not Found">
        <NotFound dashboardUrl={dashboardUrl} />
        <Footer dashboardUrl={dashboardUrl} />
      </BaseLayout>,
      404
    )
  }

  const pageBlocks = await db
    .select()
    .from(blocks)
    .where(eq(blocks.pageId, page.id))
    .orderBy(blocks.order)

  return c.html(
    <BaseLayout 
      title={page.metaTitle || page.title} 
      description={page.metaDescription || page.description || ''}
    >
      <main>
        {pageBlocks.map((block) => {
          const content = typeof block.content === 'string' ? JSON.parse(block.content) : block.content
          if (block.type === 'hero') return <Hero content={content} />
          if (block.type === 'text') return <TextBlock content={content} />
          return null
        })}
      </main>
      <Footer dashboardUrl={dashboardUrl} />
    </BaseLayout>
  )
}

// HOME PAGE
app.get('/', (c) => renderPage(c, 'home'))

// ANY SLUG
app.get('/:slug', (c) => renderPage(c, c.req.param('slug')))

export default app
