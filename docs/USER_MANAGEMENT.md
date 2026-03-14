# User Management System

## Overview

The CMS platform includes a comprehensive user management system with role-based access control (RBAC). This allows you to manage multiple users with different permission levels, from full administrative access to read-only viewing.

---

## Roles

The system has **4 distinct roles** with increasing levels of access:

### 👑 Owner
- **Who:** You (the business owner)
- **Access:** Everything
- **Special Powers:**
  - Billing and subscription management
  - Delete the account
  - Transfer ownership
  - Assign owner role to others
  - All admin capabilities

### 🛡️ Admin
- **Who:** Your team members/staff
- **Access:** Full operational control
- **Can Do:**
  - Manage users (create, edit, delete)
  - Access site settings
  - Full CMS access (create, edit, delete pages)
  - View dashboard
- **Cannot Do:**
  - Billing management
  - Delete account
  - Assign owner role

### ✏️ Editor
- **Who:** Your clients (e.g., School A, School B)
- **Access:** CMS content management only
- **Can Do:**
  - Create pages
  - Edit pages
  - Delete their own pages
  - Publish content
  - View dashboard
- **Cannot Do:**
  - Access Users page
  - Access Settings page
  - Manage other users
  - Change site configuration

### 👁️ Viewer
- **Who:** Stakeholders, parents, board members
- **Access:** Read-only
- **Can Do:**
  - View dashboard
  - View published pages
- **Cannot Do:**
  - Create or edit content
  - Access any administrative features

---

## Permission Matrix

| Feature | Owner | Admin | Editor | Viewer |
|---------|:-----:|:-----:|:------:|:------:|
| Billing & Subscription | ✅ | ❌ | ❌ | ❌ |
| Delete Account | ✅ | ❌ | ❌ | ❌ |
| Transfer Ownership | ✅ | ❌ | ❌ | ❌ |
| Manage Users | ✅ | ✅ | ❌ | ❌ |
| Site Settings | ✅ | ✅ | ❌ | ❌ |
| Create Pages | ✅ | ✅ | ✅ | ❌ |
| Edit Pages | ✅ | ✅ | ✅ | ❌ |
| Delete Pages | ✅ | ✅ | ✅ (own) | ❌ |
| Publish Pages | ✅ | ✅ | ✅ | ❌ |
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| View Pages | ✅ | ✅ | ✅ | ✅ |

---

## Navigation by Role

### Owner & Admin See:
```
┌──────────────────────────────────────────────┐
│ Dashboard | CMS | Users | Settings | Profile │
└──────────────────────────────────────────────┘
```

### Editor (Client) Sees:
```
┌──────────────────────────────────────────────┐
│ Dashboard | CMS | Profile                     │
└──────────────────────────────────────────────┘
```

### Viewer Sees:
```
┌──────────────────────────────────────────────┐
│ Dashboard | Profile                           │
└──────────────────────────────────────────────┘
```

---

## Getting Started

### First-Time Setup

1. **Bootstrap the system** (creates you as owner):
   ```bash
   POST /api/auth/bootstrap
   {
     "email": "your@email.com",
     "password": "secure-password",
     "name": "Your Name"
   }
   ```

2. **Login as owner**:
   - Navigate to `/login`
   - Enter your credentials
   - You now have full access

3. **Create your first client**:
   - Go to `/dashboard/users`
   - Click "Add User"
   - Fill in details, select "Editor" role
   - Share credentials with client

---

## User Management Guide

### Adding a New User

1. Navigate to **Users** in the dashboard
2. Click **"Add User"** button
3. Fill in the form:
   - **Name:** User's full name
   - **Email:** Their email address (must be unique)
   - **Password:** Temporary password (min 8 characters)
   - **Role:** Select appropriate role
4. Click **"Create User"**

**Best Practices:**
- Use strong temporary passwords
- Share credentials securely (not via email if possible)
- Assign the minimum role needed for their work

### Editing a User

1. Find the user in the **Users** table
2. Click the **⋮** (three dots) menu
3. Select **"Edit"**
4. Update information:
   - Change name or email
   - Modify role (if you have permission)
5. Click **"Save Changes"**

**Restrictions:**
- Cannot change your own role
- Cannot change owner role (owner only)
- Email must remain unique

### Deleting a User

1. Find the user in the **Users** table
2. Click the **⋮** (three dots) menu
3. Select **"Delete"**
4. Confirm the deletion

**Restrictions:**
- Cannot delete yourself
- Cannot delete the last owner
- All user sessions are terminated on deletion

---

## API Reference

### Authentication Endpoints

#### `POST /api/auth/bootstrap`
Create the first owner account.
```json
// Request
{
  "email": "owner@example.com",
  "password": "secure-password",
  "name": "Owner Name"
}

// Response
{
  "message": "Admin created successfully",
  "user": {
    "id": "...",
    "email": "owner@example.com",
    "name": "Owner Name",
    "role": "owner"
  }
}
```

#### `POST /api/auth/login`
Login with email and password.
```json
// Request
{
  "email": "user@example.com",
  "password": "password"
}

// Response
{
  "message": "Logged in",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "User Name",
    "role": "editor"
  }
}
```

#### `GET /api/auth/me`
Get current user info.
```json
// Response
{
  "id": "...",
  "email": "user@example.com",
  "name": "User Name",
  "role": "editor"
}
```

#### `PATCH /api/auth/me`
Update own profile.
```json
// Request
{
  "name": "New Name",
  "email": "newemail@example.com"
}
```

#### `POST /api/auth/change-password`
Change your password.
```json
// Request
{
  "currentPassword": "old-password",
  "newPassword": "new-secure-password"
}
```

#### `POST /api/auth/logout`
Logout current session.

---

### User Management Endpoints

#### `GET /api/users`
List all users. **Requires: admin or owner**
```json
// Response
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
Create new user. **Requires: admin or owner**
```json
// Request
{
  "email": "newuser@example.com",
  "password": "temporary-password",
  "name": "New User",
  "role": "editor"
}

// Response (201 Created)
{
  "id": "...",
  "email": "newuser@example.com",
  "name": "New User",
  "role": "editor",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### `PATCH /api/users/:id`
Update user. **Requires: admin or owner**
```json
// Request
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "admin"
}

// Response
{
  "id": "...",
  "email": "updated@example.com",
  "name": "Updated Name",
  "role": "admin"
}
```

#### `DELETE /api/users/:id`
Delete user. **Requires: admin or owner**
```json
// Response
{
  "success": true
}
```

---

## Security Features

### Password Handling
- All passwords are hashed using SHA-256 before storage
- Minimum 8 characters required
- Passwords never exposed in API responses

### Session Management
- Sessions stored with HTTP-only cookies
- 30-day expiration
- Sessions terminated on user deletion

### Access Control
- Role-checking middleware on all protected routes
- Automatic 403 Forbidden for unauthorized access
- Frontend navigation filtered by role

### Protection Rules
1. **Cannot delete yourself** - Prevents accidental self-removal
2. **Cannot delete last owner** - Ensures account always has an owner
3. **Only owner can assign owner role** - Prevents privilege escalation
4. **Cannot change your own role** - Prevents self-promotion/demotion
5. **Email uniqueness** - Each user must have unique email

---

## Common Use Cases

### Scenario 1: Adding a New Client (School)
1. Go to **Users** → **Add User**
2. Enter school contact details
3. Set role to **Editor**
4. Create secure temporary password
5. Share credentials with school
6. School can now manage their CMS pages

### Scenario 2: Hiring a Developer
1. Go to **Users** → **Add User**
2. Enter developer details
3. Set role to **Admin** (if they need full access)
4. Or **Editor** (if only CMS access needed)
5. Share credentials

### Scenario 3: Board Member Access
1. Go to **Users** → **Add User**
2. Enter board member details
3. Set role to **Viewer**
4. They can view but not modify anything

### Scenario 4: Removing a Former Client
1. Go to **Users**
2. Find the client in the table
3. Click **⋮** → **Delete**
4. Confirm deletion
5. All their sessions are terminated

---

## Troubleshooting

### "Cannot delete the last owner"
**Problem:** Trying to delete the only owner account.
**Solution:** Transfer ownership first or create another owner.

### "Email already in use"
**Problem:** Email address is already registered.
**Solution:** Use a different email or delete the existing account first.

### "Cannot change your own role"
**Problem:** Trying to modify your own role.
**Solution:** Ask another owner to change your role.

### "Only owner can assign owner role"
**Problem:** Admin trying to promote someone to owner.
**Solution:** Only an existing owner can assign the owner role.

### User can't access Users page
**Problem:** Editor or Viewer trying to access user management.
**Solution:** This is expected - only Owner and Admin can access Users.

---

## Best Practices

### For Owners
1. Keep owner accounts minimal (1-2 people max)
2. Regularly audit user list and roles
3. Remove inactive users promptly
4. Use strong passwords for all accounts
5. Document who has what role and why

### For Admins
1. Assign minimum necessary role
2. Use descriptive names (e.g., "School A - Principal")
3. Reset passwords when users forget
4. Monitor for unusual activity

### For Editors (Clients)
1. Change temporary password on first login
2. Only create content you're authorized to manage
3. Don't share your credentials
4. Log out when finished

### For Viewers
1. Read-only access - no modifications possible
2. Use for stakeholders who need visibility
3. No action required - just observe

---

## Database Schema

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' 
    CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER
);
```

---

## Future Enhancements

Potential features for future versions:

- [ ] Email invitations instead of manual password creation
- [ ] Password reset via email
- [ ] Two-factor authentication (2FA)
- [ ] Activity/audit logs
- [ ] Custom permission sets
- [ ] Multi-tenant support (per-client isolation)
- [ ] Session management UI (view/revoke active sessions)
- [ ] User avatars/profile pictures
- [ ] Last active timestamp

---

## Support

For issues or questions about user management:
- Check this documentation first
- Review API error messages
- Check browser console for frontend errors
- Verify user has appropriate role for the action
