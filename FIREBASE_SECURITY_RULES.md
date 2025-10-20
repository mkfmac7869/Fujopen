# Firebase Security Rules for Fujairah Open 2026

## ⚠️ IMPORTANT: Apply These Rules to Fix User Approval

The user approval feature requires proper Firebase Security Rules. Please apply these rules in your Firebase Console.

## 📋 How to Apply Rules

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Replace the existing rules with the rules below
5. Click **"Publish"**

---

## 🔒 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users Collection
    match /users/{userId} {
      // Allow read for authenticated users
      allow read: if isAuthenticated();
      
      // Allow create for any authenticated user (registration)
      allow create: if isAuthenticated();
      
      // Allow update for:
      // 1. The user themselves (own profile)
      // 2. Admin users (for approval and management)
      allow update: if isOwner(userId) || isAdmin();
      
      // Only admins can delete users
      allow delete: if isAdmin();
    }
    
    // Visa Applications Collection
    match /visaApplications/{applicationId} {
      // Allow read for authenticated users
      allow read: if isAuthenticated();
      
      // Allow create for authenticated users
      allow create: if isAuthenticated();
      
      // Allow update for:
      // 1. The application owner
      // 2. Admins
      allow update: if isAuthenticated() && 
                       (resource.data.userId == request.auth.uid || isAdmin());
      
      // Only admins can delete
      allow delete: if isAdmin();
    }
    
    // Visa Folders Collection (for organizing applications)
    match /visaFolders/{folderId} {
      // Allow read for authenticated users
      allow read: if isAuthenticated();
      
      // Only admins can create/update/delete folders
      allow create, update, delete: if isAdmin();
    }
    
    // Hotel Bookings Collection
    match /hotelBookings/{bookingId} {
      // Allow read for authenticated users
      allow read: if isAuthenticated();
      
      // Allow create for authenticated users
      allow create: if isAuthenticated();
      
      // Allow update for the booking owner or admins
      allow update: if isAuthenticated() && 
                       (resource.data.userId == request.auth.uid || isAdmin());
      
      // Only admins can delete
      allow delete: if isAdmin();
    }
    
    // Hotels Collection (hotel data)
    match /hotels/{hotelId} {
      // Allow read for authenticated users
      allow read: if isAuthenticated();
      
      // Only admins can create/update/delete hotels
      allow create, update, delete: if isAdmin();
    }
    
    // Transportation Requests Collection
    match /transportationRequests/{requestId} {
      // Allow read for authenticated users
      allow read: if isAuthenticated();
      
      // Allow create for authenticated users
      allow create: if isAuthenticated();
      
      // Allow update for the request owner or admins
      allow update: if isAuthenticated() && 
                       (resource.data.userId == request.auth.uid || isAdmin());
      
      // Only admins can delete
      allow delete: if isAdmin();
    }
    
    // Certificates Collection
    match /certificates/{certificateId} {
      // Allow read for all authenticated users
      allow read: if isAuthenticated();
      
      // Only admins can create/update/delete
      allow create, update, delete: if isAdmin();
    }
    
    // Certificate Settings Collection
    match /certificateSettings/{settingId} {
      // Allow read for all authenticated users
      allow read: if isAuthenticated();
      
      // Only admins can update
      allow create, update, delete: if isAdmin();
    }
  }
}
```

---

## 🔥 Firebase Storage Rules (for file uploads)

Navigate to **Storage** → **Rules** tab and apply:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Passport scans
    match /passports/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // Visa application documents (main path)
    match /visaDocuments/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // Alternative visa applications path
    match /visaApplications/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // Approved visa documents (admin uploads only)
    match /approvedVisas/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Team logos
    match /teamLogos/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // Profile photos
    match /profilePhotos/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // Personal photos for visa applications
    match /personalPhotos/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // License/certificate files
    match /licenses/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // National ID documents
    match /nationalIds/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // Additional documents
    match /additionalDocs/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // Additional documents (alternative path)
    match /additionalDocuments/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // Certificate templates (admin uploads only)
    match /certificateTemplates/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Hotel booking documents
    match /hotelDocuments/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // Transportation documents
    match /transportationDocuments/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if request.auth.uid == userId || isAdmin();
    }
  }
}
```

---

## ✅ Testing the Rules

After applying the rules:

1. **Test User Approval**:
   - Log in as admin
   - Go to User Management
   - Try to approve a pending user
   - Should work now! ✅

2. **Test User Login**:
   - Unapproved users should NOT be able to login
   - Approved users CAN login
   - Admins can always login

3. **Check Console**:
   - Open browser console (F12)
   - Look for detailed error messages
   - Should see "✅ User approved in Firestore" message

---

## 🚨 Common Issues

### Issue 1: "permission-denied" error
**Solution**: Make sure you've published the Firestore rules above

### Issue 2: Admin can't update users
**Solution**: Verify your admin user has `role: 'admin'` in Firestore

### Issue 3: Storage upload fails
**Solution**: Apply the Storage rules above

---

## 📊 Verify Admin Role

Make sure your admin account has the correct role in Firestore:

1. Go to Firebase Console → Firestore Database
2. Find the `users` collection
3. Find your admin user document
4. Verify it has: `role: "admin"`
5. If not, add this field manually

---

## 🔍 Debug Steps

If approval still doesn't work:

1. Open browser console (F12)
2. Look for error messages starting with "❌"
3. Check the error code and message
4. Verify Firebase rules are published
5. Verify admin user has correct role
6. Try refreshing the page

---

**Need help?** Check the console logs for detailed error information!

