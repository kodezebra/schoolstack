import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  role: text('role', { enum: ['owner', 'admin', 'editor', 'viewer'] }).notNull().default('viewer'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

export const pages = sqliteTable('pages', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  parentId: text('parent_id'),
  order: integer('order').notNull().default(0),
  status: text('status', { enum: ['draft', 'published'] }).notNull().default('draft'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const blocks = sqliteTable('blocks', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  pageId: text('page_id').notNull(),
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

export const contactSubmissions = sqliteTable('contact_submissions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject'),
  message: text('message').notNull(),
  data: text('data'), // Store full form data as JSON string for custom fields
  status: text('status', { enum: ['pending', 'read', 'archived'] }).notNull().default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// =======================
// School Management
// =======================

export const academicYears = sqliteTable('academic_years', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(), // e.g., "2024-2025"
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  isCurrent: integer('is_current', { mode: 'boolean' }).notNull().default(false),
  status: text('status', { enum: ['active', 'closed'] }).notNull().default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const grades = sqliteTable('grades', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(), // Nursery, LKG, UKG, 1-12
  order: integer('order').notNull().default(0),
  academicYearId: text('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const students = sqliteTable('students', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  admissionNo: text('admission_no').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  gender: text('gender', { enum: ['male', 'female', 'other'] }).notNull(),
  dob: integer('dob', { mode: 'timestamp' }),
  gradeId: text('grade_id').notNull().references(() => grades.id, { onDelete: 'cascade' }),
  rollNo: text('roll_no'),
  image: text('image'), // URL to student photo
  parentName: text('parent_name').notNull(),
  parentPhone: text('parent_phone').notNull(),
  parentEmail: text('parent_email'),
  address: text('address'),
  status: text('status', { enum: ['active', 'transferred', 'graduated', 'withdrawn'] }).notNull().default('active'),
  enrollmentDate: integer('enrollment_date', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const staff = sqliteTable('staff', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  employeeNo: text('employee_no').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  image: text('image'), // URL to staff photo
  role: text('role', { enum: ['teacher', 'admin', 'counselor', 'principal'] }).notNull().default('teacher'),
  department: text('department'),
  qualifications: text('qualifications'),
  experience: text('experience'), // years of experience
  status: text('status', { enum: ['active', 'inactive'] }).notNull().default('active'),
  joinDate: integer('join_date', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const feeStructures = sqliteTable('fee_structures', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  gradeId: text('grade_id').notNull().references(() => grades.id, { onDelete: 'cascade' }),
  academicYearId: text('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), // e.g., "Term 1 Fees", "Annual Fees"
  description: text('description'),
  amount: integer('amount').notNull(), // in UGX (integer)
  dueDate: integer('due_date', { mode: 'timestamp' }),
  status: text('status', { enum: ['active', 'closed'] }).notNull().default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const feePayments = sqliteTable('fee_payments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  feeStructureId: text('fee_structure_id').notNull().references(() => feeStructures.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // in UGX (integer)
  paymentDate: integer('payment_date', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  paymentMethod: text('payment_method', { enum: ['cash', 'mobile_money', 'bank', 'school_pay'] }).notNull(),
  transactionNo: text('transaction_no'),
  receiptNo: text('receipt_no'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
