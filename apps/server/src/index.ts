import { Hono } from 'hono'
import { cors } from 'hono/cors'
import pagesApp from './routes/pages'
import publicApp from './routes/public'
import authApp from './routes/auth'
import assetsApp from './routes/assets'
import settingsApp from './routes/settings'

type Bindings = {
  DB: D1Database
  FRONTEND_URL: string
  ASSETS: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('*', async (c, next) => {
  const origin = c.env.FRONTEND_URL || 'http://localhost:5173'
  const corsMiddleware = cors({
    origin: origin,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
  return corsMiddleware(c, next)
})

// Auth Routes
app.route('/api/auth', authApp)

// Assets Routes
app.route('/api/assets', assetsApp)

// Settings Routes
app.route('/api/settings', settingsApp)

// CMS Admin Routes
app.route('/api/pages', pagesApp)

// Public SSR Routes
app.route('/', publicApp)

export default app