import type { LucideIcon } from "lucide-react"
import { 
  Crown, 
  Shield, 
  FileText, 
  Users
} from "lucide-react"

export type UserRole = "owner" | "admin" | "editor" | "viewer"

export interface Persona {
  id: UserRole
  name: string
  description: string
  icon: LucideIcon
  color: string
}

export interface HelpArticle {
  id: string
  title: string
  role: UserRole | "all"
  category: string
  content: string
  keywords: string[]
  featured?: boolean
}

export interface WhatsNewItem {
  version: string
  date: string
  title: string
  description: string
  features: string[]
}

export const personas: Persona[] = [
  {
    id: "owner",
    name: "School Owner",
    description: "Full access to all features including user management and settings",
    icon: Crown,
    color: "text-purple-500"
  },
  {
    id: "admin",
    name: "Administrator",
    description: "Day-to-day operations, student records, staff, and fee management",
    icon: Shield,
    color: "text-blue-500"
  },
  {
    id: "editor",
    name: "Content Manager",
    description: "Website content, CMS pages, and media management",
    icon: FileText,
    color: "text-green-500"
  },
  {
    id: "viewer",
    name: "Parent",
    description: "View child's progress, grades, attendance, and school updates",
    icon: Users,
    color: "text-orange-500"
  }
]

export const whatsNew: WhatsNewItem[] = [
  {
    version: "1.2.0",
    date: "March 2026",
    title: "New Dashboard Experience",
    description: "We've redesigned the dashboard with improved navigation and quick actions.",
    features: [
      "Redesigned stats cards with real-time data",
      "New quick action buttons",
      "Improved student search",
      "Better mobile responsiveness"
    ]
  },
  {
    version: "1.1.0",
    date: "February 2026",
    title: "Enhanced Fee Management",
    description: "Better tools for managing school fees and payments.",
    features: [
      "New payment recording interface",
      "Improved receipt generation",
      "Better outstanding fee reports",
      "Discount and waiver support"
    ]
  },
  {
    version: "1.0.0",
    date: "January 2026",
    title: "Initial Release",
    description: "Welcome to KidzKave!",
    features: [
      "Student management",
      "Staff management",
      "Fee management",
      "CMS pages",
      "Exam results",
      "Contact submissions"
    ]
  }
]

export const helpArticles: HelpArticle[] = [
  {
    id: "setup-guide",
    title: "Complete Setup Guide",
    role: "owner",
    category: "Getting Started",
    featured: true,
    keywords: ["setup", "first time", "new school", "configure", "settings", "levels", "students", "staff"],
    content: `
# Complete Setup Guide

Follow these steps to set up your school from scratch.

## Step 1: Configure School Settings

Go to **Settings** and fill in:
- School Name, Address, Phone, Email
- Logo type (icon or image)
- Primary brand color

## Step 2: Set Up Academic Year

Go to **School** → **Terms**
1. Click **Add Academic Year** (e.g., "2025-2026")
2. Set start and end dates
3. Mark as **Current**
4. Add Terms: Click **Add Term** for each term in the year

## Step 3: Create Levels (Classes)

Go to **School** → **Settings** → **Levels**
1. Click **Add Level**
2. Enter Name (e.g., "Primary 1"), Code (e.g., "P1")
3. Select Category (Nursery/Primary/Secondary)
4. Repeat for all your classes

Common structure: PN, N1, N2, P1-P7, S1-S6

## Step 4: Add Subjects

Go to **School** → **Subjects**
1. Click **Add Subjects**
2. Select from common subjects OR add custom
3. Common: Mathematics, English, Science, SST, RE, PE

## Step 5: Add Staff

Go to **School** → **Staff**
1. Click **Add Staff**
2. Fill: Name, Gender, Email, Phone, Role
3. Assign to a Level (optional)
4. Upload photo (optional)

To assign subjects: **School** → **Settings** → **Level Subjects**

## Step 6: Add Students

Go to **School** → **Students**
1. Click **Add Student**
2. Fill: Name, Gender, DOB, Level, Admission No
3. Add Parent info (Name, Phone)
4. Save

For bulk import: Click **Import**, download CSV, fill, upload

## Step 7: Set Up Fees

Go to **School** → **Fees**
1. Click **Add Fee Structure**
2. Fill: Name, Amount, Category, Level, Term
3. Categories: Tuition, Uniform, Transport, etc.

## Step 8: Create First Exam

Go to **School** → **Exams**
1. Click **Add Exam**
2. Fill: Title, Term, Level, Total Marks
3. Enter results when ready

## You're Ready!

Now you can:
- Record payments in **Fees**
- Enter exam results
- Generate reports
- Build your website in **Website Pages**
`
  },
  {
    id: "getting-started",
    title: "Getting Started",
    role: "all",
    category: "Basics",
    keywords: ["start", "begin", "setup", "login", "dashboard"],
    content: `
# Getting Started with KidzKave

Welcome to KidzKave! This guide will help you get up and running quickly.

## Your First Login

1. Go to your school's login page
2. Enter your email and password
3. Click "Sign In"

## Dashboard Overview

Your dashboard shows:
- **Quick Stats** - Key numbers at a glance
- **Recent Activity** - Latest updates
- **Quick Actions** - Common tasks

## Finding Help

- Click the **?** button for context help
- Use **Search** to find specific topics
- Visit the **Help Center** for full guides
`
  },
  {
    id: "navigation",
    title: "Navigation Guide",
    role: "all",
    category: "Basics",
    keywords: ["menu", "sidebar", "navigate", "find"],
    content: `
# Navigation Guide

## Sidebar Menu

The sidebar contains all main sections:
- **Dashboard** - Home overview
- **School** - Students, staff, fees, exams
- **CMS** - Website pages
- **Submissions** - Contact messages
- **Settings** - Configuration

## Finding Pages

Use **Ctrl + K** to open quick search:
1. Type what you're looking for
2. Press Enter to go directly

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| G then D | Go to Dashboard |
| G then S | Go to School |
| ? | Open Help |
| Ctrl + K | Search |
`
  },
  {
    id: "student-management",
    title: "Managing Students",
    role: "admin",
    category: "School Management",
    keywords: ["student", "add", "edit", "delete", "enroll"],
    content: `
# Managing Students

## Adding a New Student

1. Go to **School** → **Students**
2. Click **Add Student**
3. Fill in required information:
   - First name, Last name
   - Gender, Date of birth
   - Level/Class
   - Admission number
4. Add parent details
5. Click **Save**

## Editing Student Info

1. Find student in list
2. Click to open profile
3. Click **Edit**
4. Make changes
5. Save

## Student Enrollment

Each student belongs to:
- One level per academic year
- Multiple subjects
`
  },
  {
    id: "fee-collection",
    title: "Collecting Fees",
    role: "admin",
    category: "Fees",
    keywords: ["fee", "payment", "collect", "receipt"],
    content: `
# Collecting Fees

## Recording a Payment

1. Go to **School** → **Fees**
2. Search for student
3. Click **Record Payment**
4. Select fee type
5. Enter amount and method
6. Confirm

## Payment Methods

Available options:
- Cash
- Bank Transfer
- Mobile Money
- Cheque

## Receipts

Receipts generate automatically:
- Print for records
- Email to parent
- Download as PDF
`
  },
  {
    id: "exam-results",
    title: "Entering Exam Results",
    role: "admin",
    category: "Exams",
    keywords: ["exam", "results", "grades", "marks"],
    content: `
# Entering Exam Results

## Recording Marks

1. Go to **School** → **Exams**
2. Select exam and subject
3. Enter marks for each student
4. Save

## Grade Scales

| Percentage | Grade |
|------------|-------|
| 90-100% | A |
| 80-89% | B |
| 70-79% | C |
| 60-69% | D |
| Below 60% | F |

## Generating Reports

1. Go to **Reports**
2. Select student/term
3. Generate report card
`
  },
  {
    id: "cms-pages",
    title: "Managing Website Pages",
    role: "editor",
    category: "CMS",
    keywords: ["page", "website", "content", "publish"],
    content: `
# Managing Website Pages

## Creating a Page

1. Go to **CMS**
2. Click **New Page**
3. Add title and content
4. Use blocks to build
5. Save as Draft or Publish

## Block Types

Available blocks:
- **Hero** - Banner with headline
- **Features** - Icon list
- **Gallery** - Image grid
- **Text** - Rich text
- **Contact** - Contact info

## Publishing

1. Set status to **Published**
2. Save
3. Page goes live
`
  },
  {
    id: "user-management",
    title: "Managing Users",
    role: "owner",
    category: "Administration",
    keywords: ["user", "role", "permission", "access"],
    content: `
# Managing Users

## User Roles

| Role | Access Level |
|------|--------------|
| Owner | Full access |
| Admin | Operations management |
| Editor | Content management |
| Viewer | Read-only access |

## Adding a User

1. Go to **Users**
2. Click **Add User**
3. Enter details
4. Select role
5. Create account

## Permissions

Owners can:
- Manage all users
- Change settings
- Access everything

Admins can:
- Manage students/staff
- Handle fees
- Cannot manage owners
`
  },
  {
    id: "viewing-grades",
    title: "Viewing Grades",
    role: "viewer",
    category: "Academics",
    keywords: ["grade", "marks", "report", "progress"],
    content: `
# Viewing Your Child's Grades

## Accessing Grades

1. Go to your dashboard
2. Click on your child's name
3. Select **Academics**

## Understanding Grades

| Grade | Meaning |
|-------|---------|
| A | Excellent |
| B | Very Good |
| C | Good |
| D | Satisfactory |
| F | Needs Improvement |

## Report Cards

View term-by-term progress:
- Subject grades
- Overall average
- Class ranking
`
  },
  {
    id: "checking-attendance",
    title: "Checking Attendance",
    role: "viewer",
    category: "Academics",
    keywords: ["attendance", "absent", "present"],
    content: `
# Checking Attendance

## Viewing Attendance

1. Go to your child's profile
2. Click **Attendance**

## Attendance Summary

See:
- Days present
- Days absent
- Attendance percentage

## Contact School

If you have concerns:
- Use contact form
- Call school office
- Attend parent meetings
`
  },
  {
    id: "dark-mode",
    title: "Dark Mode",
    role: "all",
    category: "Settings",
    keywords: ["dark", "light", "theme", "mode"],
    content: `
# Dark Mode

## Toggle Theme

Click the theme button in the header to switch between:
- **Light Mode** - Bright background
- **Dark Mode** - Dark background

## Auto Theme

Set your preference:
1. Go to **Settings** → **Profile**
2. Choose theme option:
   - Light
   - Dark
   - System (follows device)
`
  }
]

export const helpCategories = [
  "Getting Started",
  "Basics",
  "School Management",
  "Fees",
  "Exams",
  "CMS",
  "Administration",
  "Academics",
  "Settings"
]

export function getArticlesForRole(role: UserRole): HelpArticle[] {
  return helpArticles.filter(article => article.role === "all" || article.role === role)
}

export function getFeaturedArticles(role?: UserRole): HelpArticle[] {
  const filtered = role ? getArticlesForRole(role) : helpArticles
  return filtered.filter(article => article.featured)
}

export function searchArticles(query: string, role?: UserRole): HelpArticle[] {
  const lowerQuery = query.toLowerCase()
  const articles = role ? getArticlesForRole(role) : helpArticles
  
  return articles.filter(article => {
    const matchesTitle = article.title.toLowerCase().includes(lowerQuery)
    const matchesKeywords = article.keywords.some(k => k.includes(lowerQuery))
    const matchesCategory = article.category.toLowerCase().includes(lowerQuery)
    return matchesTitle || matchesKeywords || matchesCategory
  })
}

export function getArticleById(id: string): HelpArticle | undefined {
  return helpArticles.find(article => article.id === id)
}

export function getArticlesByCategory(category: string, role?: UserRole): HelpArticle[] {
  const articles = role ? getArticlesForRole(role) : helpArticles
  return articles.filter(article => article.category === category)
}
