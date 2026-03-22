import { drizzle } from 'drizzle-orm/d1'

export const getDb = (c: any) => drizzle(c.env.DB)
