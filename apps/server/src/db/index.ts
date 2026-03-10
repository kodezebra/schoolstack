import { drizzle } from 'drizzle-orm/d1'
import type { Context } from 'hono'
import type { Bindings } from '@/types'
import * as schema from './schema'

export const getDb = (c: Context<{ Bindings: Bindings }>) => {
  return drizzle(c.env.DB, { schema })
}