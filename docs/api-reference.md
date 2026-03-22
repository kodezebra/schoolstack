# API Reference

REST API endpoints for SchoolStack.

## Base URL

| Environment | Base URL |
|-------------|----------|
| Local | `http://localhost:8787/api` |
| Production | `https://yourdomain.com/api` |

## Authentication

Most endpoints require authentication via session cookie. The cookie is set on login.

### Endpoints

#### `POST /api/auth/bootstrap`

Create the first owner account. Only works when no users exist.

```json
// Request
{
  "email": "admin@example.com",
  "password": "secure-password",
  "name": "Admin User"
}

// Response (201)
{
  "message": "Admin created successfully",
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "owner"
  }
}
```

#### `POST /api/auth/login`

Authenticate user.

```json
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response (200)
{
  "message": "Logged in",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin"
  }
}
```

#### `GET /api/auth/me`

Get current user.

```json
// Response (200)
{
  "id": "...",
  "email": "user@example.com",
  "name": "User Name",
  "role": "admin"
}
```

#### `PATCH /api/auth/me`

Update current user profile.

```json
// Request
{
  "name": "New Name",
  "email": "newemail@example.com"
}
```

#### `POST /api/auth/change-password`

Change current user's password.

```json
// Request
{
  "currentPassword": "old-password",
  "newPassword": "new-secure-password"
}
```

#### `POST /api/auth/logout`

End current session.

```json
// Response (200)
{ "success": true }
```

---

## Users

**Requires**: `admin` or `owner` role

#### `GET /api/users`

List all users.

```json
// Response (200)
[
  {
    "id": "...",
    "email": "user@example.com",
    "name": "User Name",
    "role": "editor",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

#### `POST /api/users`

Create new user.

```json
// Request
{
  "email": "newuser@example.com",
  "password": "temporary-password",
  "name": "New User",
  "role": "editor"
}

// Response (201)
{
  "id": "...",
  "email": "newuser@example.com",
  "name": "New User",
  "role": "editor"
}
```

#### `PATCH /api/users/:id`

Update user.

```json
// Request
{
  "name": "Updated Name",
  "role": "admin"
}
```

#### `DELETE /api/users/:id`

Delete user.

```json
// Response (200)
{ "success": true }
```

---

## School: Academic Years

#### `GET /api/school/academic-years`

List academic years.

```json
// Response (200)
[
  {
    "id": "...",
    "name": "2024-2025",
    "isActive": true,
    "startDate": "2024-01-15",
    "endDate": "2024-12-15"
  }
]
```

#### `POST /api/school/academic-years`

Create academic year.

```json
// Request
{
  "name": "2024-2025",
  "startDate": "2024-01-15",
  "endDate": "2024-12-15"
}
```

#### `DELETE /api/school/academic-years/:id`

Delete academic year.

---

## School: Terms

#### `GET /api/school/terms`

List terms.

**Query params**: `academicYearId`

```json
// Response (200)
[
  {
    "id": "...",
    "name": "Term 1",
    "academicYearId": "...",
    "startDate": "2024-01-15",
    "endDate": "2024-04-15"
  }
]
```

#### `POST /api/school/terms`

Create term.

```json
// Request
{
  "name": "Term 1",
  "academicYearId": "...",
  "startDate": "2024-01-15",
  "endDate": "2024-04-15"
}
```

---

## School: Levels

#### `GET /api/school/levels`

List levels (grades/classes).

```json
// Response (200)
[
  {
    "id": "...",
    "name": "Primary 1",
    "code": "P1",
    "category": "primary"
  }
]
```

#### `POST /api/school/levels`

Create level.

```json
// Request
{
  "name": "Primary 1",
  "code": "P1",
  "category": "primary"
}
```

---

## School: Students

#### `GET /api/school/students`

List students.

**Query params**: `levelId`, `academicYearId`, `search`, `page`, `limit`

```json
// Response (200)
{
  "students": [...],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

#### `POST /api/school/students`

Create student.

```json
// Request
{
  "firstName": "John",
  "lastName": "Doe",
  "gender": "male",
  "dob": "2015-03-15",
  "levelId": "...",
  "admissionNo": "STU-001",
  "parentName": "Jane Doe",
  "parentPhone": "+256...",
  "parentEmail": "jane@example.com"
}
```

#### `GET /api/school/students/:id`

Get student details.

#### `PATCH /api/school/students/:id`

Update student.

#### `DELETE /api/school/students/:id`

Delete student.

---

## School: Staff

#### `GET /api/school/staff`

List staff members.

**Query params**: `search`

```json
// Response (200)
[
  {
    "id": "...",
    "firstName": "Jane",
    "lastName": "Smith",
    "gender": "female",
    "email": "jane@school.com",
    "phone": "+256...",
    "role": "teacher",
    "levelId": "..."
  }
]
```

#### `POST /api/school/staff`

Create staff member.

```json
// Request
{
  "firstName": "Jane",
  "lastName": "Smith",
  "gender": "female",
  "email": "jane@school.com",
  "phone": "+256...",
  "role": "teacher",
  "levelId": "..."
}
```

---

## School: Subjects

#### `GET /api/school/subjects`

List subjects.

```json
// Response (200)
[
  {
    "id": "...",
    "name": "Mathematics",
    "code": "MATH"
  }
]
```

#### `POST /api/school/subjects`

Create subject.

```json
// Request
{
  "name": "Mathematics",
  "code": "MATH"
}
```

---

## School: Fee Structures

#### `GET /api/school/fees`

List fee structures.

**Query params**: `levelId`, `termId`

```json
// Response (200)
[
  {
    "id": "...",
    "name": "Tuition Fee",
    "amount": 500000,
    "levelId": "...",
    "termId": "...",
    "category": "tuition"
  }
]
```

#### `POST /api/school/fees`

Create fee structure.

```json
// Request
{
  "name": "Tuition Fee",
  "amount": 500000,
  "levelId": "...",
  "termId": "...",
  "category": "tuition"
}
```

---

## School: Payments

#### `GET /api/school/payments`

List payments.

**Query params**: `studentId`, `termId`

#### `POST /api/school/payments`

Record payment.

```json
// Request
{
  "studentId": "...",
  "feeId": "...",
  "amount": 250000,
  "paymentMethod": "cash",
  "reference": "PAY-001"
}
```

#### `GET /api/school/payments/receipt/:id`

Generate payment receipt.

---

## School: Exams

#### `GET /api/school/exams`

List exams.

**Query params**: `termId`, `levelId`

```json
// Response (200)
[
  {
    "id": "...",
    "title": "End of Term Exam",
    "termId": "...",
    "levelId": "...",
    "totalMarks": 100,
    "startDate": "2024-04-01"
  }
]
```

#### `POST /api/school/exams`

Create exam.

```json
// Request
{
  "title": "End of Term Exam",
  "termId": "...",
  "levelId": "...",
  "totalMarks": 100,
  "startDate": "2024-04-01"
}
```

---

## School: Results

#### `POST /api/school/results`

Record exam results.

```json
// Request
{
  "examId": "...",
  "studentId": "...",
  "subjectId": "...",
  "marks": 85
}
```

#### `GET /api/school/results/student/:studentId`

Get student results.

**Query params**: `termId`, `examId`

---

## School: Reports

#### `GET /api/school/reports/student/:studentId`

Get student report card data.

**Query params**: `termId`, `academicYearId`

```json
// Response (200)
{
  "school": { "name": "...", "logoType": "..." },
  "student": { "id": "...", "firstName": "...", "admissionNo": "..." },
  "level": { "name": "Primary 1" },
  "academicYear": { "name": "2024-2025" },
  "term": { "name": "Term 1" },
  "subjects": [
    {
      "subjectId": "...",
      "subjectName": "Mathematics",
      "marks": 85,
      "totalMarks": 100,
      "grade": "A"
    }
  ],
  "summary": {
    "totalObtained": 450,
    "totalMax": 500,
    "average": 90,
    "overallGrade": "A"
  }
}
```

---

## School: Dashboard

#### `GET /api/school/dashboard`

Get dashboard statistics.

```json
// Response (200)
{
  "totalStudents": 150,
  "totalStaff": 25,
  "totalRevenue": 15000000,
  "pendingFees": 5000000,
  "recentPayments": [...],
  "examsThisTerm": 3
}
```

---

## CMS: Pages

#### `GET /api/pages`

List pages.

**Query params**: `status` (draft/published)

```json
// Response (200)
[
  {
    "id": "...",
    "title": "About Us",
    "slug": "about",
    "status": "published",
    "type": "page"
  }
]
```

#### `POST /api/pages`

Create page.

```json
// Request
{
  "title": "About Us",
  "slug": "about",
  "status": "draft",
  "type": "page"
}
```

#### `PATCH /api/pages/:id`

Update page.

#### `DELETE /api/pages/:id`

Delete page.

---

## CMS: Blocks

#### `GET /api/pages/:id/blocks`

Get page blocks.

#### `PUT /api/pages/:id/blocks`

Update page blocks (replace all).

```json
// Request
{
  "blocks": [
    { "type": "hero", "order": 0, "content": { "title": "...", "text": "..." } },
    { "type": "features", "order": 1, "content": { "items": [...] } }
  ]
}
```

---

## Contact

#### `POST /api/contact`

Submit contact form (public).

```json
// Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Inquiry",
  "message": "Hello, I have a question..."
}
```

#### `GET /api/contact`

List submissions (admin only).

#### `PATCH /api/contact/:id`

Update submission status (pending/read/archived).

#### `DELETE /api/contact/:id`

Delete submission.

---

## Settings

#### `GET /api/settings`

Get site settings.

```json
// Response (200)
{
  "siteName": "Your School Name",
  "schoolName": "Your School Name",
  "schoolAddress": "123 Education Street",
  "schoolPhone": "+256...",
  "schoolEmail": "info@school.com",
  "logoType": "icon",
  "logoIcon": "graduation-cap",
  "primaryColor": "#4F46E5"
}
```

#### `PATCH /api/settings`

Update settings.

```json
// Request
{
  "schoolName": "New School Name",
  "primaryColor": "#059669"
}
```

---

## Assets

#### `POST /api/assets/upload`

Upload file.

**Body**: `multipart/form-data` with `file` field

```json
// Response (201)
{
  "id": "...",
  "url": "https://assets.../filename.jpg",
  "filename": "filename.jpg",
  "mimeType": "image/jpeg",
  "size": 102400
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request - invalid input |
| 401 | Unauthorized - not logged in |
| 403 | Forbidden - insufficient permissions |
| 404 | Not found |
| 409 | Conflict - duplicate resource |
| 500 | Internal server error |
