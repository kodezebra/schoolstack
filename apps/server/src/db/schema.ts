import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

export const pages = sqliteTable('pages', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  status: text('status', { enum: ['draft', 'published'] }).notNull().default('draft'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const blocks = sqliteTable('blocks', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  pageId: text('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  content: text('content').notNull(),
  order: integer('order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const assets = sqliteTable('assets', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  key: text('key').notNull().unique(), // R2 Object Key
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const siteSettings = sqliteTable('site_settings', {
  id: text('id').primaryKey().$defaultFn(() => 'default'),
  logoText: text('logo_text').notNull().default('KZ Cloud'),
  logoType: text('logo_type').notNull().default('icon'), // 'icon' | 'image'
  logoIcon: text('logo_icon').notNull().default('zap'),
  logoImage: text('logo_image'),
  favicon: text('favicon'),
  footerDescription: text('footer_description'),
  primaryColor: text('primary_color').notNull().default('#6366f1'),
  accentColor: text('accent_color').notNull().default('#ff6b35'),
  navbarConfig: text('navbar_config'),
  navbarCta: text('navbar_cta'), // { label: string, url: string, show: boolean }
  footerConfig: text('footer_config'),
  footerSocials: text('footer_socials'), // Array<{ platform: string, url: string }>
  // Theme configuration
  theme: text('theme').notNull().default('modern'), // 'modern' | 'minimal' | 'bold' | 'playful'
  backgroundLight: text('background_light').notNull().default('#f6f7f8'),
  backgroundDark: text('background_dark').notNull().default('#101922'),
  fontDisplay: text('font_display').notNull().default('Quicksand'), // Font for headings
  fontBody: text('font_body').notNull().default('Plus Jakarta Sans'), // Font for body text
  borderRadius: text('border_radius').notNull().default('lg'), // 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  darkMode: text('dark_mode').notNull().default('system'), // 'light' | 'dark' | 'system'
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
