import { Hono } from 'hono'
import { cors } from 'hono/cors'
import apiApp from './routes'
import publicApp from './routes/public'

type Bindings = {
  DB: D1Database
  FRONTEND_URL: string
  ASSETS: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

// Clean, secure CORS implementation
app.use('/api/*', async (c, next) => {
  const frontendUrl = c.env.FRONTEND_URL
  const allowedOrigins = [frontendUrl, 'http://localhost:5173']
  
  return cors({
    origin: (origin) => {
      if (allowedOrigins.includes(origin)) return origin
      return frontendUrl // Default to production frontend for security
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })(c, next)
})

app.route('/api', apiApp)

app.route('/', publicApp)

export default app
