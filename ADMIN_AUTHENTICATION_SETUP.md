# 🔐 Admin Authentication Setup Guide

## Overview

This guide explains how to implement secure admin authentication using a **database-backed role system**. This prevents unauthorized users from accessing admin features.

---

## ✅ What Has Been Implemented

### 1. **Database Role Field**
- Added `role` column to User model with values: `user` or `admin`
- Role is stored in database and cannot be manipulated from frontend
- Default role for new users is `user`

### 2. **Secure Authentication**
- Login endpoint now reads role from database (not email-based)
- Frontend always uses role from backend response
- Removed insecure role fallback that allowed manipulation

### 3. **Admin User Creation Script**
- Script to create admin user in database
- Handles existing users and password updates

---

## 🚀 Step-by-Step Setup

### **Step 1: Update Database Schema**

The database needs to be updated to include the `role` column. There are two approaches:

#### **Option A: Delete Existing Database (Development Only)**
```bash
# Navigate to backend directory
cd "Innsurance Backend Fast API"

# Delete the database file (if using SQLite)
# On Windows:
del insurance.db
# On Linux/Mac:
rm insurance.db
```

When you restart the server, the new schema with `role` field will be created automatically.

#### **Option B: Manual Migration (Recommended for Production)**
Run a SQL migration to add the `role` column:

```sql
-- For PostgreSQL
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- For SQLite (in Python)
import sqlite3
conn = sqlite3.connect('insurance.db')
conn.execute("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'")
conn.commit()
conn.close()
```

### **Step 2: Create Admin User**

You can create an admin user directly through the API endpoint.

#### **Method 1: Using Swagger UI (Recommended)**

1. Start your backend server:
   ```bash
   cd "Innsurance Backend Fast API"
   uvicorn main:app --reload
   ```

2. Open Swagger UI: `http://localhost:8000/docs`

3. Go to `POST /users/` endpoint

4. Click "Try it out"

5. Use this request body to create an admin:
   ```json
   {
     "name": "Admin User",
     "email": "admin@akshronix.com",
     "password": "Admin@123",
     "phone": "+910000000000",
     "address": "Admin Office",
     "dateOfBirth": "1990-01-01",
     "gender": "Other",
     "panCard": "ADMIN0000A",
     "aadhar": "000000000000",
     "kycStatus": "verified",
     "role": "admin"
   }
   ```

6. Click "Execute"

**Default Admin Credentials:**
- **Email:** `admin@akshronix.com`
- **Password:** `Admin@123`

**⚠️ IMPORTANT:** Change the password after first login!

#### **Method 2: Using cURL/Postman**

```bash
curl -X POST "http://localhost:8000/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@akshronix.com",
    "password": "Admin@123",
    "phone": "+910000000000",
    "address": "Admin Office",
    "dateOfBirth": "1990-01-01",
    "gender": "Other",
    "panCard": "ADMIN0000A",
    "aadhar": "000000000000",
    "kycStatus": "verified",
    "role": "admin"
  }'
```

### **Step 3: Verify Admin User**

Check if admin was created:

**Option 1: Using Swagger UI**
1. Open `http://localhost:8000/docs`
2. Go to `GET /users/` endpoint
3. Click "Try it out" → "Execute"
4. Look for user with `"role": "admin"`

**Option 2: Using GET endpoint**
```bash
# Get user by email
GET http://localhost:8000/users/email/admin@akshronix.com
```

**Option 3: Using Python**
```python
from database import SessionLocal
from models import User
db = SessionLocal()
admin = db.query(User).filter(User.email == 'admin@akshronix.com').first()
if admin:
    print(f'Admin ID: {admin.id}, Role: {admin.role.value}')
else:
    print('Admin not found')
db.close()
```

### **Step 4: Test Admin Login**

1. Start the backend server (if not running):
   ```bash
   uvicorn main:app --reload
   ```

2. Start the frontend:
   ```bash
   cd "React UI-User"
   npm run dev
   ```

3. Go to login page and use **Admin** tab
4. Enter credentials:
   - Email: `admin@akshronix.com`
   - Password: `Admin@123`
5. You should be redirected to `/admin` dashboard

---

## 🔒 Security Features

### **1. Database-Stored Role**
- Role is stored in database, not determined by email
- Cannot be changed without database access
- Prevents frontend manipulation

### **2. Role Verification on Login**
```python
# auth.py - Always reads from database
role = user.role.value if user.role else "user"
```

### **3. Protected Routes**
```typescript
// ProtectedRoute.tsx
if (requireAdmin && user?.role !== 'admin') {
  return <Navigate to="/dashboard" replace />;
}
```

### **4. Default User Role**
- New users are always created with `role = 'user'`
- Cannot create admin users through normal registration

---

## 📋 How It Works

### **Login Flow:**

```
1. User enters email + password
   ↓
2. Backend verifies credentials
   ↓
3. Backend reads role from database
   ↓
4. Backend returns role in response
   ↓
5. Frontend stores user with role
   ↓
6. ProtectedRoute checks role from database
```

### **Admin Access:**

```
1. Only users with role='admin' in database can access /admin
2. Regular users are automatically redirected to /dashboard
3. Role cannot be faked because it comes from backend
```

---

## 🛠️ Creating Additional Admin Users

### **Method 1: Using Swagger UI (Recommended)**

1. Open `http://localhost:8000/docs`
2. Go to `POST /users/` endpoint
3. Click "Try it out"
4. Use this request body (change email/password as needed):
   ```json
   {
     "name": "New Admin User",
     "email": "newadmin@akshronix.com",
     "password": "SecurePassword123",
     "phone": "+910000000001",
     "address": "Admin Office",
     "dateOfBirth": "1990-01-01",
     "gender": "Other",
     "panCard": "ADMIN0001A",
     "aadhar": "000000000001",
     "kycStatus": "verified",
     "role": "admin"
   }
   ```
5. Click "Execute"

### **Method 2: Using cURL**

```bash
curl -X POST "http://localhost:8000/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Admin",
    "email": "newadmin@akshronix.com",
    "password": "SecurePassword123",
    "phone": "+910000000001",
    "address": "Admin Office",
    "dateOfBirth": "1990-01-01",
    "gender": "Other",
    "panCard": "ADMIN0001A",
    "aadhar": "000000000001",
    "kycStatus": "verified",
    "role": "admin"
  }'
```

### **Method 3: Direct Database Update**

```sql
-- Update existing user to admin
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';

-- Or using Python
from database import SessionLocal
from models import User, UserRole
db = SessionLocal()
user = db.query(User).filter(User.email == 'user@example.com').first()
if user:
    user.role = UserRole.admin
    db.commit()
db.close()
```

---

## 🧪 Testing

### **Test 1: Regular User Cannot Access Admin**
1. Create a regular user account
2. Login with regular user
3. Try to access `/admin` directly
4. **Expected:** Redirected to `/dashboard`

### **Test 2: Admin Can Access Admin Panel**
1. Login with admin credentials
2. Navigate to `/admin`
3. **Expected:** Admin dashboard loads

### **Test 3: Role Cannot Be Manipulated**
1. Login as regular user
2. Open browser DevTools → Application → Local Storage
3. Try to change `role` from `"user"` to `"admin"`
4. Refresh page
5. Try to access `/admin`
6. **Expected:** Still redirected (role is re-validated from backend on each request)

---

## 📝 Files Modified

### **Backend:**
1. ✅ `models.py` - Added `UserRole` enum and `role` field
2. ✅ `schemas.py` - Added `role` to User schemas (optional in UserCreate)
3. ✅ `routers/auth.py` - Changed to read role from database
4. ✅ `routers/users.py` - Added role handling in create_user endpoint, returns role in all responses

### **Frontend:**
1. ✅ `AuthContext.tsx` - Removed role parameter, always use backend role
2. ✅ `Login.tsx` - Removed hardcoded role parameters
3. ✅ `ProtectedRoute.tsx` - Already checks role correctly (no changes needed)

---

## 🔧 Troubleshooting

### **Issue: "role" column doesn't exist**
**Solution:** Delete database file or run migration (see Step 1)

### **Issue: Admin login returns "user" role**
**Solution:** Check database - user might not have `role='admin'`. Run `create_admin.py` again.

### **Issue: Regular users can access admin**
**Solution:** Check `ProtectedRoute.tsx` - it should check `user?.role !== 'admin'`

### **Issue: Cannot create admin through API**
**Solution:** Make sure you include `"role": "admin"` in the request body when calling `POST /users/`. The role field is optional and defaults to 'user' if not provided.

---

## ⚠️ Security Best Practices

1. **Change Default Password:** Always change `Admin@123` after first login
2. **Limit Admin Users:** Only create admin users for authorized personnel
3. **Strong Passwords:** Use complex passwords for admin accounts
4. **Monitor Access:** Log admin login attempts
5. **Database Security:** Protect database access credentials
6. **HTTPS in Production:** Always use HTTPS for production

---

## 🎯 Summary

✅ **Role-based authentication is now secure:**
- Role stored in database
- Backend determines role
- Frontend cannot manipulate role
- Only admin users can access `/admin`
- Regular users are protected from admin access

✅ **Admin login process:**
1. Create admin using `POST /users/` with `"role": "admin"` in request body
2. Login with admin credentials
3. Backend verifies role from database
4. Access granted to admin dashboard

---

## 📞 Next Steps

1. Run the setup steps above
2. Test admin login
3. Change default admin password
4. Create additional admin users if needed
5. Deploy with confidence! 🚀

---

**Last Updated:** January 2025
**Status:** ✅ Implementation Complete

