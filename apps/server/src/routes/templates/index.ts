import { Hono } from 'hono'
import { PAGE_TEMPLATES } from '@/lib/page-templates'

type Bindings = {
  DB: D1Database
  FRONTEND_URL: string
  ASSETS: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

// Public - read only templates
app.get('/', (c) => {
  return c.json(PAGE_TEMPLATES)
})

export default app
