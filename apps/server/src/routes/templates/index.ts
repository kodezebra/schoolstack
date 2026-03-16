import { Hono } from 'hono'
import { PAGE_TEMPLATES } from '@/lib/page-templates'

const app = new Hono()

// Public - read only templates
app.get('/', (c) => {
  return c.json(PAGE_TEMPLATES)
})

export default app
