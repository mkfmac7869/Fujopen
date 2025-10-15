# 🔒 Account Approval System - Testing Guide

## ✅ What Was Fixed

The login system now **BLOCKS unapproved users** and shows clear error messages. Here's what changed:

### 1. **Email/Password Login** ✅
- Users with `approved: false` **CANNOT login**
- Clear error message: "Your account is pending approval. Please wait for admin confirmation."
- User is signed out immediately if not approved

### 2. **Google Sign-In** ✅
- New Google users are created with `approved: false`
- Existing unapproved Google users **CANNOT login**
- Clear error messages for both scenarios

### 3. **Visual Feedback** ✅
- Error messages are displayed prominently on the login page
- Warning-styled alerts (yellow/orange) for approval-related messages
- Error-styled alerts (red) for other login issues

---

## 🧪 How to Test

### Test 1: Register New Account (Email/Password)

1. **Register a new account** at `/register`
2. Fill in all details and submit
3. You should receive:
   - ✅ Welcome email with "Pending Approval" notice
   - ✅ Admin receives notification email

4. **Try to login** with the new account:
   - ❌ **Login should FAIL**
   - ⚠️ Error message: "Your account is pending approval. Please wait for admin confirmation."

5. **Check browser console** (F12):
   ```
   🔐 Attempting login for: user@example.com
   ✅ Firebase auth successful, checking approval status...
   📋 User data: { role: 'user', approved: false }
   ❌ Account not approved, signing out...
   ```

---

### Test 2: Approve Account (Admin)

1. **Login as Admin**
2. Go to **User Management** (`/admin/user-management`)
3. Click on **"Pending Approval"** tab
4. Find the new user
5. Click **"Approve"** button (green checkmark)
6. User should receive approval email

---

### Test 3: Login After Approval

1. **Try to login again** with the approved account
2. **Login should SUCCEED** ✅
3. User is redirected to home page

4. **Check browser console**:
   ```
   🔐 Attempting login for: user@example.com
   ✅ Firebase auth successful, checking approval status...
   📋 User data: { role: 'user', approved: true }
   ✅ Account approved, login successful!
   ```

---

### Test 4: Google Sign-In (New User)

1. **Click "Sign in with Google"** on `/login`
2. Select a Google account that has NEVER signed in before
3. Account is created in Firestore with `approved: false`
4. **User is signed out immediately**
5. ⚠️ Error message: "Your account has been created but is pending approval..."

6. **Check browser console**:
   ```
   🔐 Attempting Google sign-in...
   ✅ Google auth successful, checking user data...
   📝 New Google user, creating profile (pending approval)...
   ❌ New Google user needs admin approval, signing out...
   ```

---

### Test 5: Google Sign-In (Existing Unapproved User)

1. **Try Google sign-in** with previously created account
2. **Login should FAIL** ❌
3. ⚠️ Error message: "Your account is pending approval..."

---

### Test 6: Admin Always Allowed

1. **Admin accounts** should ALWAYS be able to login
2. Even if `approved: false`, admins bypass the check
3. Role check: `userData.role !== 'admin'`

---

## 🔍 Debugging

### Check Browser Console (F12)

Every login attempt now logs detailed information:

| Emoji | Meaning |
|-------|---------|
| 🔐 | Login attempt started |
| ✅ | Step completed successfully |
| 📋 | User data retrieved |
| ❌ | Login blocked (not approved) |
| ⚠️ | Warning or missing data |

### Common Issues

#### Issue 1: Users can still login (not blocked)
**Solution**: 
1. Check Firebase Security Rules are applied
2. Verify user document has `approved` field
3. Check console logs for approval status

#### Issue 2: Error message not showing
**Solution**:
1. Clear browser cache and refresh
2. Check Network tab (F12) for API errors
3. Verify AuthContext is throwing the error correctly

#### Issue 3: Admin can't login
**Solution**:
1. Verify admin has `role: 'admin'` in Firestore
2. Admins bypass approval check

---

## 📊 Firestore Structure

### Users Collection

Each user document should have:

```javascript
{
  fullName: "John Doe",
  email: "john@example.com",
  phone: "+971501234567",
  position: "coach",
  teamName: "Dubai Tigers",
  country: "UAE",
  role: "user",           // or "admin"
  approved: false,        // ← KEY FIELD
  profileCompleted: true,
  createdAt: "2025-01-15T10:30:00.000Z",
  approvedAt: "2025-01-15T12:00:00.000Z" // Added after approval
}
```

---

## ✉️ Email Notifications

### Welcome Email (New Registration)
- **To**: New user
- **Content**: Welcome message + "Pending Approval" notice
- **Trigger**: Account creation

### Admin Notification
- **To**: All admins
- **Content**: New user details + approval link
- **Trigger**: New registration

### Approval Email
- **To**: Approved user
- **Content**: Approval confirmation + login link
- **Trigger**: Admin approves account

---

## 🚀 Quick Test Script

Run this in browser console while on login page:

```javascript
// Test login with unapproved account
const testLogin = async () => {
  console.log('🧪 Testing login for unapproved user...');
  // Type email and password in form
  // Click login button
  // Watch console for logs
};
```

---

## ✅ Success Criteria

### ✅ Unapproved users CANNOT login
### ✅ Clear error messages shown
### ✅ Approved users CAN login
### ✅ Admins always allowed
### ✅ Email notifications working
### ✅ Google sign-in also blocked

---

## 📞 Need Help?

If login blocking is not working:

1. **Check Browser Console** (F12) for detailed logs
2. **Verify Firebase Rules** are applied (see FIREBASE_SECURITY_RULES.md)
3. **Check Firestore** - verify user has `approved: false`
4. **Clear Browser Cache** and try again

---

**Last Updated**: After fixing login bypass issue
**Status**: ✅ Ready for production testing

