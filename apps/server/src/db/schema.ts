import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  role: text('role', { enum: ['owner', 'admin', 'editor', 'viewer'] }).notNull().default('viewer'),
  photo: text('photo'), // R2 URL for profile photo
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
  // School information for reports
  schoolName: text('school_name').notNull().default('Your School Name'),
  schoolAddress: text('school_address').default('Kampala, Uganda'),
  schoolPhone: text('school_phone').default('+256 700 000 000'),
  schoolEmail: text('school_email').default('info@school.com'),
  // Theme configuration
  theme: text('theme').notNull().default('modern'), // 'modern' | 'minimal' | 'bold' | 'playful'
  backgroundLight: text('background_light').notNull().default('#f6f7f8'),
  backgroundDark: text('background_dark').notNull().default('#101922'),
  fontDisplay: text('font_display').notNull().default('Quicksand'), // Font for headings
  fontBody: text('font_body').notNull().default('Plus Jakarta Sans'), // Font for body text
  borderRadius: text('border_radius').notNull().default('lg'), // 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  darkMode: text('dark_mode').notNull().default('system'), // 'light' | 'dark' | 'system'
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  extraFeesLibrary: text('extra_fees_library'), // JSON array of common extra fees
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

export const levels = sqliteTable('levels', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(), // Nursery, LKG, UKG, P1-P7, S1-S6
  order: integer('order').notNull().default(0),
  academicYearId: text('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }),
  classTeacherId: text('class_teacher_id').references(() => staff.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const students = sqliteTable('students', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  admissionNo: text('admission_no').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  gender: text('gender', { enum: ['male', 'female', 'other'] }).notNull(),
  dob: integer('dob', { mode: 'timestamp' }),
  levelId: text('level_id').notNull().references(() => levels.id, { onDelete: 'cascade' }),
  rollNo: text('roll_no'),
  parentName: text('parent_name').notNull(),
  parentPhone: text('parent_phone').notNull(),
  parentEmail: text('parent_email'),
  address: text('address'),
  photo: text('photo'),
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
  role: text('role', { enum: ['teacher', 'admin', 'counselor', 'principal'] }).notNull().default('teacher'),
  department: text('department'),
  qualifications: text('qualifications'),
  experience: text('experience'), // years of experience
  photo: text('photo'),
  status: text('status', { enum: ['active', 'inactive'] }).notNull().default('active'),
  joinDate: integer('join_date', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const feeStructures = sqliteTable('fee_structures', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  levelId: text('level_id').references(() => levels.id, { onDelete: 'cascade' }),
  academicYearId: text('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  amount: integer('amount').notNull(),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  scope: text('scope', { enum: ['all', 'preschool', 'lower_primary', 'upper_primary'] }).notNull().default('all'),
  status: text('status', { enum: ['active', 'closed'] }).notNull().default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const feePayments = sqliteTable('fee_payments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  feeStructureId: text('fee_structure_id').references(() => feeStructures.id, { onDelete: 'cascade' }),
  extraFeeId: text('extra_fee_id').references(() => studentFees.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  paymentDate: integer('payment_date', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  paymentMethod: text('payment_method', { enum: ['cash', 'mobile_money', 'bank', 'school_pay'] }).notNull(),
  transactionNo: text('transaction_no'),
  receiptNo: text('receipt_no'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const feeOverrides = sqliteTable('fee_overrides', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  feeStructureId: text('fee_structure_id').notNull().references(() => feeStructures.id, { onDelete: 'cascade' }),
  overrideAmount: integer('override_amount').notNull(), // in UGX (integer)
  reason: text('reason'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const studentFees = sqliteTable('student_fees', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), // e.g., "Transport", "Class Tour", "Uniform"
  amount: integer('amount').notNull(), // in UGX (integer)
  isRecurring: integer('is_recurring', { mode: 'boolean' }).notNull().default(true), // true = every term, false = one-time
  status: text('status', { enum: ['active', 'paid', 'removed'] }).notNull().default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// =======================
// Exam & Marks
// =======================

export const subjects = sqliteTable('subjects', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(), // e.g., Mathematics, English, Science
  code: text('code'), // e.g., MATH, ENG
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const terms = sqliteTable('terms', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(), // "Term 1", "Term 2", "Term 3"
  academicYearId: text('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  status: text('status', { enum: ['upcoming', 'active', 'closed'] }).notNull().default('upcoming'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const exams = sqliteTable('exams', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(), // e.g., "Term 1 Mathematics Exam"
  type: text('type', { enum: ['test', 'midterm', 'final', 'assignment', 'quiz'] }).notNull(),
  academicYearId: text('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }),
  levelId: text('level_id').notNull().references(() => levels.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  termId: text('term_id').references(() => terms.id, { onDelete: 'set null' }),
  examSetId: text('exam_set_id').references(() => examSets.id, { onDelete: 'set null' }),
  examDate: integer('exam_date', { mode: 'timestamp' }).notNull(),
  totalMarks: integer('total_marks').notNull().default(100),
  status: text('status', { enum: ['draft', 'published'] }).notNull().default('draft'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const examResults = sqliteTable('exam_results', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  examId: text('exam_id').notNull().references(() => exams.id, { onDelete: 'cascade' }),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  marks: integer('marks').notNull(),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const levelSubjects = sqliteTable('level_subjects', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  levelId: text('level_id').notNull().references(() => levels.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  teacherId: text('teacher_id').references(() => staff.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const examSets = sqliteTable('exam_sets', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(), // e.g., "Beginning of Term", "Mid Term", "End of Term"
  description: text('description'),
  academicYearId: text('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }),
  termId: text('term_id').references(() => terms.id, { onDelete: 'set null' }),
  levelId: text('level_id').notNull().references(() => levels.id, { onDelete: 'cascade' }),
  startDate: integer('start_date', { mode: 'timestamp' }),
  endDate: integer('end_date', { mode: 'timestamp' }),
  status: text('status', { enum: ['draft', 'published', 'completed'] }).notNull().default('draft'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const gradeScales = sqliteTable('grade_scales', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(), // "Default Scale", "Primary"
  academicYearId: text('academic_year_id').references(() => academicYears.id, { onDelete: 'cascade' }),
  grades: text('grades').notNull(), // JSON: [{ grade: "A", minMarks: 90, maxMarks: 100, points: 4.0, color: "green" }]
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
