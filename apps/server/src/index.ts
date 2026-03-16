import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import apiApp from './routes'
import publicApp from './routes/public'

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
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
  return corsMiddleware(c, next)
})

app.use('*', secureHeaders({
  crossOriginResourcePolicy: false,
}))

// All API Routes grouped under /api
app.route('/api', apiApp)

// Public SSR Routes
app.route('/', publicApp)

export default app