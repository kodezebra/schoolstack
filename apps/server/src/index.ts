import { Hono } from 'hono'
import { cors } from 'hono/cors'
import pagesApp from './routes/pages'
import publicApp from './routes/public'
import authApp from './routes/auth'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('*', cors({
  origin: 'http://localhost:5173', // Adjust to your frontend URL
  credentials: true, // Crucial for HttpOnly cookies
}))

// Auth Routes
app.route('/api/auth', authApp)

// CMS Admin Routes
app.route('/api/pages', pagesApp)

// Public SSR Routes
app.route('/', publicApp)

export default app