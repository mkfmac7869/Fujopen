# 🔥 Firebase Email System Configuration

## ✅ **LIVE and WORKING!**

Your email notification system is fully deployed and operational on Firebase Cloud Functions with Resend.

---

## 📍 **Active Domains**

Your email functions work on all these domains:

### **Primary Domain:**
- 🌐 **https://www.fujopen.com** (Custom Domain)
- 🌐 **https://fujopen.com**

### **Firebase Default Domains:**
- 🔥 **https://fuj2026-f22a7.web.app**
- 🔥 **https://fuj2026-f22a7.firebaseapp.com**

### **Development:**
- 💻 **http://localhost:3000**
- 💻 **http://localhost:3001**

---

## 📧 **Email Functions (5 Active)**

All functions are accessible from any of your domains:

### 1. **Welcome Email**
```
POST https://www.fujopen.com/api/send-welcome-email
POST https://fuj2026-f22a7.web.app/api/send-welcome-email
POST https://fuj2026-f22a7.firebaseapp.com/api/send-welcome-email

Body:
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

### 2. **Account Approved**
```
POST https://www.fujopen.com/api/send-account-approved
POST https://fuj2026-f22a7.web.app/api/send-account-approved
POST https://fuj2026-f22a7.firebaseapp.com/api/send-account-approved

Body:
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

### 3. **Visa Email**
```
POST https://www.fujopen.com/api/send-visa-email
POST https://fuj2026-f22a7.web.app/api/send-visa-email
POST https://fuj2026-f22a7.firebaseapp.com/api/send-visa-email

Body:
{
  "email": "user@example.com",
  "name": "John Doe",
  "type": "application",
  "status": "approved"
}
```

### 4. **Hotel Email**
```
POST https://www.fujopen.com/api/send-hotel-email
POST https://fuj2026-f22a7.web.app/api/send-hotel-email
POST https://fuj2026-f22a7.firebaseapp.com/api/send-hotel-email

Body:
{
  "email": "user@example.com",
  "name": "John Doe",
  "hotelName": "Hotel Name"
}
```

### 5. **Admin Notification**
```
POST https://www.fujopen.com/api/send-admin-notification
POST https://fuj2026-f22a7.web.app/api/send-admin-notification
POST https://fuj2026-f22a7.firebaseapp.com/api/send-admin-notification

Body:
{
  "adminEmail": "admin@fujopen.com",
  "newUserData": {
    "name": "New User",
    "email": "newuser@example.com",
    "position": "Coach",
    "teamName": "Team Name",
    "country": "UAE"
  }
}
```

---

## 🔧 **Technical Details**

### **Firebase Configuration:**
- **Project ID**: fuj2026-f22a7
- **Region**: us-central1
- **Runtime**: Node.js 18
- **Email Service**: Resend API

### **CORS Configuration:**
```javascript
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### **From Email:**
```
Fujairah Open 2026 <noreply@fujopen.com>
```

---

## 📊 **Monitoring**

### **Firebase Console:**
- **Functions Dashboard**: https://console.firebase.google.com/project/fuj2026-f22a7/functions
- **Function Logs**: https://console.firebase.google.com/project/fuj2026-f22a7/functions/logs
- **Usage Metrics**: https://console.firebase.google.com/project/fuj2026-f22a7/usage

### **Resend Dashboard:**
- **Sent Emails**: https://resend.com/emails
- **API Keys**: https://resend.com/api-keys
- **Domain Settings**: https://resend.com/domains

---

## 🧪 **Testing**

Test any function from command line:

```bash
curl -X POST https://www.fujopen.com/api/send-welcome-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User"
  }'
```

Or from browser console (F12):

```javascript
fetch('https://www.fujopen.com/api/send-welcome-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    name: 'Test User'
  })
})
.then(r => r.json())
.then(data => console.log(data));
```

---

## 💰 **Costs**

**Firebase Functions (Blaze Plan):**
- First 2,000,000 invocations/month: **FREE**
- After: $0.40 per million invocations
- **Your expected cost**: ~$0/month (well within free tier)

**Resend:**
- First 100 emails/day: **FREE**
- First 3,000 emails/month: **FREE**
- After: $1 per 1,000 emails

---

## 🚀 **Deployment Commands**

### **Deploy Functions Only:**
```bash
cd c:\Users\Dell\Desktop\FUJ_OPEN_2026\FUJ_react
firebase deploy --only functions
```

### **Deploy Hosting Only:**
```bash
cd c:\Users\Dell\Desktop\FUJ_OPEN_2026\FUJ_react\awrora-react
npm run build
cd ..
firebase deploy --only hosting
```

### **Deploy Everything:**
```bash
cd c:\Users\Dell\Desktop\FUJ_OPEN_2026\FUJ_react\awrora-react
npm run build
cd ..
firebase deploy
```

---

## ✅ **Status: LIVE**

- ✅ All 5 functions deployed
- ✅ All 440 pages deployed
- ✅ Custom domain connected
- ✅ Firebase domains active
- ✅ CORS configured
- ✅ Resend integrated
- ✅ Email templates ready

**Everything is working perfectly! 🎉**

