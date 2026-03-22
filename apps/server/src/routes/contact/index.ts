import { Hono } from 'hono'
import { getDb } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'
import { contactSubmissions } from '@/db/schema'
import { z } from 'zod'
import { authMiddleware, requireRole } from '@/middleware/auth'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Schema for public POST
const submissionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(1, 'Message is required'),
  subject: z.string().optional(),
})

// 1. PUBLIC: Submit Contact Form
app.post('/', async (c) => {
  const db = getDb(c)
  let body: any
  
  try {
    // We try to parse as JSON first, but handle form-data too if needed
    const contentType = c.req.header('content-type')
    if (contentType?.includes('application/json')) {
      body = await c.req.json()
    } else {
      body = await c.req.parseBody()
    }
  } catch (e) {
    return c.json({ error: 'Invalid request body' }, 400)
  }

  const validation = submissionSchema.safeParse(body)
  if (!validation.success) {
    return c.json({ error: 'Validation failed', details: validation.error.format() }, 400)
  }

  const { name, email, message, subject } = validation.data

  try {
    const [newSubmission] = await db.insert(contactSubmissions).values({
      name,
      email,
      message,
      subject: subject || 'New Contact Submission',
      data: JSON.stringify(body), // Keep everything for custom fields
    }).returning()

    return c.json({ 
      success: true, 
      message: 'Thank you for your message! We will get back to you soon.',
      id: newSubmission.id 
    })
  } catch (e) {
    console.error('Contact submission error:', e)
    return c.json({ error: 'Failed to save submission. Please try again later.' }, 500)
  }
})

// --- ADMIN ROUTES (require auth) ---
app.use('/*', authMiddleware)

// 2. ADMIN: List all submissions
app.get('/', requireRole('owner', 'admin'), async (c) => {
  const db = getDb(c)
  const results = await db.select()
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt))
  
  return c.json(results)
})

// 3. ADMIN: Update status (mark as read/archived)
app.patch('/:id', requireRole('owner', 'admin'), async (c) => {
  const id = c.req.param('id')
  const { status } = await c.req.json()

  if (!['pending', 'read', 'archived'].includes(status)) {
    return c.json({ error: 'Invalid status' }, 400)
  }

  const db = getDb(c)
  const [updated] = await db.update(contactSubmissions)
    .set({ status, updatedAt: new Date() })
    .where(eq(contactSubmissions.id, id))
    .returning()

  if (!updated) return c.notFound()
  return c.json(updated)
})

// 4. ADMIN: Delete a submission
app.delete('/:id', requireRole('owner', 'admin'), async (c) => {
  const id = c.req.param('id')
  const db = getDb(c)
  
  const deleted = await db.delete(contactSubmissions)
    .where(eq(contactSubmissions.id, id))
    .returning()

  if (deleted.length === 0) return c.notFound()
  return c.json({ success: true })
})

export default app
