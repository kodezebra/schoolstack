import { Hono } from 'hono'
import { cors } from 'hono/cors'
import pagesApp from './routes/pages'
import publicApp from './routes/public'
import authApp from './routes/auth'

type Bindings = {
  DB: D1Database
  FRONTEND_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('*', async (c, next) => {
  const origin = c.env.FRONTEND_URL || 'http://localhost:5173'
  const corsMiddleware = cors({
    origin: origin,
    credentials: true,
  })
  return corsMiddleware(c, next)
})

// Auth Routes
app.route('/api/auth', authApp)

// CMS Admin Routes
app.route('/api/pages', pagesApp)

// Public SSR Routes
app.route('/', publicApp)

export default app