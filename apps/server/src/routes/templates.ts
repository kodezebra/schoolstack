import { Hono } from 'hono'
import { PAGE_TEMPLATES } from '../lib/page-templates'

const app = new Hono()

// GET all available page templates
app.get('/', (c) => {
  return c.json(PAGE_TEMPLATES)
})

export default app
