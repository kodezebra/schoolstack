# Administrator Guide

**Role:** `admin` | **Version:** 1.0

---

## Welcome

As an Administrator, you manage the day-to-day operations of your school. You have access to student records, staff management, fee collection, and most settings. This guide helps you perform your daily tasks efficiently.

---

## Getting Started Checklist

- [ ] Log in and verify your access
- [ ] Check your school profile
- [ ] Review current academic year setup
- [ ] Familiarize yourself with the student list
- [ ] Check pending fee payments

---

## Your Dashboard

The dashboard gives you a quick overview:

| Section | What You'll See |
|---------|-----------------|
| **Stats Cards** | Total students, staff, pending fees |
| **Recent Activity** | Latest payments and submissions |
| **Quick Actions** | Common tasks for fast access |

### Customizing Your Dashboard

The dashboard shows relevant information based on your role. You'll see:
- Student enrollment numbers
- Fee collection status
- Recent contact submissions
- Upcoming exams

---

## Student Management

### Viewing All Students

1. Navigate to **School** → **Students**
2. Use filters to find students:
   - By level/class
   - By academic year
   - By search (name or admission number)
3. Click on a student to view full details

### Adding a New Student

**Step 1: Navigate to Add Student**

1. Go to **School** → **Students**
2. Click **Add Student**

**Step 2: Enter Student Information**

| Field | Required | Description |
|-------|----------|-------------|
| First Name | Yes | Student's first name |
| Last Name | Yes | Student's last name |
| Gender | Yes | Male/Female |
| Date of Birth | Yes | Use format YYYY-MM-DD |
| Level | Yes | Current class/enrollment |
| Admission No | Yes | Unique identifier |

**Step 3: Enter Parent/Guardian Details**

| Field | Required | Description |
|-------|----------|-------------|
| Parent Name | Yes | Primary guardian |
| Phone Number | Yes | Contact number |
| Email | No | Optional email |

**Step 4: Save**

Click **Save Student** to create the record.

### Editing Student Information

1. Find the student in the list
2. Click on their record
3. Click **Edit** (pencil icon)
4. Make changes
5. Click **Save Changes**

### Removing a Student

1. Open student record
2. Click **Delete**
3. Confirm deletion

> ⚠️ **Warning:** This permanently removes the student and their payment/exam records.

### Bulk Operations

**Importing Students:**

1. Go to **School** → **Students**
2. Click **Import**
3. Upload CSV file with columns:
   - firstName, lastName, gender, dob, level, admissionNo, parentName, parentPhone
4. Review preview
5. Click **Confirm Import**

---

## Staff Management

### Adding a Staff Member

1. Navigate to **School** → **Staff**
2. Click **Add Staff**
3. Fill in details:

| Field | Required | Description |
|-------|----------|-------------|
| First Name | Yes | Staff first name |
| Last Name | Yes | Staff last name |
| Gender | Yes | Male/Female |
| Email | Yes | Work email |
| Phone | Yes | Contact number |
| Role | Yes | Teacher/Administrator/etc. |
| Level | No | Primary assigned class |

4. Upload photo (optional)
5. Click **Save**

### Assigning Teachers to Subjects

1. Go to **School** → **Settings**
2. Scroll to **Level Subjects**
3. Select a Level
4. For each subject:
   - Select teacher from dropdown
5. Changes auto-save

### Viewing Staff Details

1. Find staff member in list
2. Click to open profile
3. View:
   - Contact information
   - Assigned subjects
   - Class assignments
   - Attendance records (if enabled)

---

## Fee Management

### Creating a Fee Structure

**Step 1: Create New Fee**

1. Go to **School** → **Fees**
2. Click **Add Fee Structure**

**Step 2: Configure Fee**

| Field | Description |
|-------|-------------|
| Name | Fee description (e.g., "Term 1 Tuition") |
| Amount | Total amount in currency |
| Category | Tuition, Uniform, Transport, Book, Other |
| Level | Apply to specific level or "All Levels" |
| Term | Select academic term |

**Step 3: Save**

Click **Save Fee Structure**.

### Recording a Payment

**Step 1: Find Student**

1. Go to **School** → **Fees**
2. Search for student by name or admission number

**Step 2: Record Payment**

1. Click **Record Payment** on student's account
2. Select fee type
3. Enter:
   - Amount paid
   - Payment method (Cash, Bank Transfer, Mobile Money)
   - Reference number (optional)
   - Notes (optional)
4. Click **Confirm Payment**

**Step 3: Receipt**

System automatically generates receipt. You can:
- Print receipt
- Email receipt to parent
- Download PDF

### Applying Discounts

1. Open student account
2. Click **Add Override**
3. Enter:
   - Discount type (Percentage or Fixed)
   - Discount value
   - Reason
4. Save

### Viewing Payment History

1. Go to **School** → **Fees**
2. Click **Payment History**
3. Filter by:
   - Date range
   - Level
   - Payment status
4. Export to CSV if needed

### Fee Collection Report

Generate reports for accounting:

1. Click **View Reports**
2. Select:
   - Term
   - Level (optional)
   - Date range
3. View:
   - Total expected
   - Total collected
   - Outstanding balance

---

## Academic Setup

### Managing Academic Years

**Creating a New Year:**

1. Go to **School** → **Academic Years**
2. Click **Add Year**
3. Enter name (e.g., "2024-2025")
4. Set start and end dates
5. Mark as **Active** if current

**Switching Years:**

1. Click year selector in header
2. Select desired academic year
3. Data filters to selected year

### Managing Terms

**Adding a Term:**

1. Navigate to **School** → **Terms**
2. Click **Add Term**
3. Select academic year
4. Enter term name and dates
5. Save

### Managing Levels (Classes)

**Adding a Level:**

1. Go to **School** → **Levels**
2. Click **Add Level**
3. Enter:
   - Name (e.g., "Primary 1")
   - Code (e.g., "P1")
   - Category (Nursery/Primary/Secondary)
4. Save

---

## Subjects

### Adding Subjects

1. Navigate to **School** → **Subjects**
2. Click **Add Subjects**
3. Choose:
   - **Quick Select**: Choose from common subjects
   - **Custom**: Add your own

### Common Subjects Available

| Subject | Code |
|---------|------|
| Mathematics | MATH |
| English | ENG |
| Integrated Science | SCI |
| Social Studies | SST |
| Religious Education | RE |
| Physical Education | PE |
| Art and Technology | ART |

---

## Contact Submissions

### Managing Inbox

1. Go to **Submissions**
2. View incoming messages
3. Filter by status:
   - **New**: Unread submissions
   - **Read**: Processed
   - **Archived**: Filed away

### Processing a Submission

1. Click on submission
2. View full message
3. Actions:
   - **Reply**: Opens email client
   - **Archive**: Mark as processed
   - **Delete**: Remove submission

---

## Settings

### Accessing Settings

Navigate to **Settings** to configure:

- School information
- Branding and logos
- Academic structure
- User management
- Theme settings

### Changing School Info

1. Go to **Settings**
2. Edit school name, address, contact
3. Changes apply to receipts and reports

---

## Troubleshooting

### Student not appearing in list

- Check if filters are applied (level, year)
- Verify student is enrolled in current academic year
- Try search by admission number

### Cannot record payment

- Check student has outstanding fees
- Verify fee structure exists for their level
- Check payment amount doesn't exceed balance

### Fee report showing incorrect totals

- Verify all fee structures are properly configured
- Check date range filters
- Confirm all students are enrolled

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `G` then `D` | Go to Dashboard |
| `G` then `S` | Go to School |
| `G` then `F` | Go to Fees |
| `Ctrl` + `K` | Search |
| `?` | Open Help |

---

## Best Practices

### Daily Operations

1. **Morning Check**: Review new submissions and pending payments
2. **Student Records**: Update enrollment weekly
3. **Fee Collection**: Record payments same day

### Data Management

- Keep student contact info updated
- Archive old academic years
- Backup reports monthly

### Security

- Don't share login credentials
- Log out on shared computers
- Report suspicious activity

---

## Getting Help

Click the **?** button for:
- Context-sensitive help
- Search documentation
- Contact support

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | March 2026 | Initial release |

---
