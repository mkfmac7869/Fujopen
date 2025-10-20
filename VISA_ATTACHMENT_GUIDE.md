# 📎 Visa Document Attachment Feature

## ✅ **LIVE! Visa documents now attach to approval emails**

When a visa is approved, the PDF document will be automatically attached to the email notification.

---

## 📧 **How to Use**

### **Option 1: Send Base64 Encoded PDF Data**

```javascript
await fetch('https://www.fujopen.com/api/send-visa-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe',
    status: 'approved',
    applicantName: 'JOHN_DOE', // Used in filename
    visaDocumentData: 'JVBERi0xLjQKJeLjz9MKM...' // Base64 PDF data
  })
});
```

### **Option 2: Send Firebase Storage URL**

```javascript
await fetch('https://www.fujopen.com/api/send-visa-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe',
    status: 'approved',
    applicantName: 'JOHN_DOE',
    visaDocumentUrl: 'https://firebasestorage.googleapis.com/...visa.pdf'
  })
});
```

---

## 🎯 **What Happens**

1. **Beautiful Email**: User receives a professional visa approval email
2. **PDF Attached**: Visa document is attached as `Visa_APPLICANT_NAME.pdf`
3. **Clear Instructions**: Email includes download and print instructions
4. **Direct Download**: User can download the PDF directly from email

---

## 📝 **Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | ✅ Yes | Recipient email |
| `name` | string | ✅ Yes | Recipient name for greeting |
| `status` | string | ✅ Yes | Use "approved" to attach document |
| `applicantName` | string | ❌ No | Name for PDF filename (defaults to `name`) |
| `visaDocumentData` | string | 🔶 Option 1 | Base64 encoded PDF data |
| `visaDocumentUrl` | string | 🔶 Option 2 | URL to download PDF from |

**Note**: Provide **either** `visaDocumentData` OR `visaDocumentUrl`, not both.

---

## 🏗️ **Integration Example**

### **In Your Visa Management Component:**

```javascript
// When admin approves visa
const handleApproveVisa = async (visaId) => {
  try {
    // 1. Update visa status in database
    await updateDoc(doc(db, 'visas', visaId), {
      status: 'approved',
      approvedAt: new Date()
    });

    // 2. Get visa data
    const visaData = await getDoc(doc(db, 'visas', visaId));
    const { applicantEmail, applicantName, visaDocumentUrl } = visaData.data();

    // 3. Send email with attachment
    await fetch('/api/send-visa-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: applicantEmail,
        name: applicantName,
        status: 'approved',
        applicantName: applicantName.replace(/ /g, '_').toUpperCase(),
        visaDocumentUrl: visaDocumentUrl // Firebase Storage URL
      })
    });

    toast.success('Visa approved and email sent with attachment!');
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to send approval email');
  }
};
```

---

## 🧪 **Testing**

### **Test with cURL:**

```bash
curl -X POST https://www.fujopen.com/api/send-visa-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "status": "approved",
    "applicantName": "TEST_USER",
    "visaDocumentUrl": "https://firebasestorage.googleapis.com/v0/b/your-bucket/o/visas%2Ftest.pdf?alt=media"
  }'
```

### **Test from Browser Console:**

```javascript
fetch('https://www.fujopen.com/api/send-visa-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'youremail@example.com',
    name: 'Your Name',
    status: 'approved',
    applicantName: 'YOUR_NAME',
    visaDocumentData: 'BASE64_PDF_DATA_HERE'
  })
})
.then(r => r.json())
.then(console.log);
```

---

## 📎 **Email Result**

When sent, the user will receive:

**Subject:** 🎉 Your Visa is Approved! - Fujairah Open 2026

**Content:**
- Beautiful HTML email with congratulations
- Green success theme
- Clear instructions to download and print
- Links to book hotel and transportation
- Important reminders about UAE entry

**Attachment:**
- `Visa_APPLICANT_NAME.pdf` (actual visa document)

---

## ⚠️ **Important Notes**

1. **File Size**: PDF attachments should be under 10MB (Resend limit)
2. **Format**: Only PDF format is supported for visa documents
3. **Filename**: Automatically generated as `Visa_APPLICANT_NAME.pdf`
4. **URL Access**: If using URLs, ensure they're publicly accessible
5. **Base64**: For base64 data, ensure it's properly encoded PDF content

---

## 🔍 **Troubleshooting**

### **Attachment not showing?**
- Check that `status` is exactly `"approved"`
- Verify `visaDocumentData` or `visaDocumentUrl` is provided
- Check Firebase Functions logs for errors
- Ensure URL is publicly accessible (not requiring authentication)

### **File size error?**
- Compress the PDF before uploading
- Resend has a 10MB attachment limit

### **Check Logs:**
```bash
firebase functions:log --only sendVisaEmail
```

---

## ✅ **Status: LIVE**

- ✅ Function deployed
- ✅ Attachment support active
- ✅ Works with both base64 and URLs
- ✅ Beautiful email template
- ✅ Professional PDF naming

**Ready to use! 🚀**

