import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, and } from 'drizzle-orm'
import { pages, blocks, siteSettings } from '@/db/schema'
import { PublicLayout } from '@/layouts/public'
import * as Blocks from '@/components/blocks'

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

  // Filter out navbar and footer blocks - they come from global settings
  const contentBlocks = pageBlocks.filter((block: any) => {
    const type = block.type.toLowerCase()
    return type !== 'navbar' && type !== 'footer'
  })

  return c.html(
    <PublicLayout 
      title={page.metaTitle || page.title} 
      description={page.metaDescription || page.description || ''}
      dashboardUrl={dashboardUrl}
      settings={settings}
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

// DEDICATED CONTACT PAGE (Ensures /contact always works)
// app.get('/contact-us', async (c) => {
//   const db = drizzle(c.env.DB)
//   const dashboardUrl = c.env.FRONTEND_URL || 'http://localhost:5173'

//   // Try to find a custom contact page first
//   const page = await db
//     .select()
//     .from(pages)
//     .where(and(eq(pages.slug, 'contact'), eq(pages.status, 'published')))
//     .get()

//   if (page) {
//     return renderPage(c, 'contact')
//   }

//   // Fallback to a default contact page if no CMS page exists
//   const settings = await db.select().from(siteSettings).where(eq(siteSettings.id, 'default')).get()
  
//   return c.html(
//     <PublicLayout 
//       title="Contact Us" 
//       description="Get in touch with us. We'd love to hear from you."
//       dashboardUrl={dashboardUrl}
//       settings={settings}
//     >
//       <Blocks.ContactForm 
//         content={{
//           tagline: "Contact Us",
//           title: "Get In Touch",
//           subtitle: "We'd love to hear from you. Send us a message and we'll respond as soon as possible."
//         }} 
//       />
//     </PublicLayout>
//   )
// })

// ANY SLUG
app.get('/:slug', (c) => renderPage(c, c.req.param('slug')))

export default app
