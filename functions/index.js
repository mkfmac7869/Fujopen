const functions = require('firebase-functions');
const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend('re_Fkx6FBkJ_ENMg8QQpgD8jgTDtHnodZu1S');

// Configuration
const FROM_EMAIL = 'Fujairah Open 2026 <noreply@fujopen.com>';
const APP_URL = 'https://www.fujopen.com';

// CORS configuration
const corsOptions = {
  origin: [
    'https://www.fujopen.com',
    'https://fujopen.com',
    'https://fuj2026-f22a7.web.app',
    'https://fuj2026-f22a7.firebaseapp.com',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
};

/**
 * Helper function to send email
 */
async function sendEmail(to, subject, html, attachments = []) {
  try {
    const emailPayload = {
      from: FROM_EMAIL,
      to,
      subject,
      html
    };

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      console.log('📎 Adding attachments to email:', attachments.length, 'files');
      console.log('📎 Attachment details:', attachments.map(a => ({ filename: a.filename, size: a.content?.length || 0 })));
      emailPayload.attachments = attachments;
    } else {
      console.log('⚠️ No attachments to add');
    }

    console.log('📧 Sending email to:', to);
    console.log('📧 Subject:', subject);
    console.log('📧 Has attachments:', !!emailPayload.attachments);
    
    const { data, error } = await resend.emails.send(emailPayload);

    if (error) {
      console.error('❌ Resend error:', error);
      return { success: false, error };
    }

    console.log('✅ Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Email exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 1. WELCOME EMAIL
 */
exports.sendWelcomeEmail = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    const result = await sendEmail(
      email,
      'Welcome to Fujairah Open 2026! 🥋',
      `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 40px 30px; text-align: center; }
            .content { background: #f8f9fa; padding: 40px 30px; }
            .feature-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #6366f1; }
            .button { background: #6366f1; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; padding: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 32px;">🥋 Welcome to Fujairah Open 2026!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">13th International Taekwondo Championships</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1e3a8a;">Hello ${name}! 👋</h2>
              <p style="font-size: 16px;">Welcome to the official platform for the <strong>13th Fujairah Open International Taekwondo Championships 2026</strong>.</p>
              
              <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #856404;">⏳ Account Approval Pending</h4>
                <p style="margin: 0; color: #856404;">Your account is pending approval. You'll receive an email once approved.</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${APP_URL}" class="button">Go to Dashboard</a>
              </div>
              
              <p style="margin-top: 30px;">Need help? Contact us at <a href="mailto:info@fujairahopen.com" style="color: #6366f1;">info@fujairahopen.com</a></p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;"><strong>13th Fujairah Open 2026</strong></p>
              <p style="margin: 5px 0;">International Taekwondo Championships</p>
            </div>
          </div>
        </body>
        </html>
      `
    );

    if (result.success) {
      return res.status(200).json({ success: true, message: 'Email sent' });
    } else {
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 2. ACCOUNT APPROVED EMAIL
 */
exports.sendAccountApproved = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    const result = await sendEmail(
      email,
      '✅ Your Account Has Been Approved! - Fujairah Open 2026',
      `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 50px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 48px;">✅</h1>
              <h2 style="margin: 15px 0; font-size: 32px;">Account Approved!</h2>
            </div>
            
            <div style="background: #f8f9fa; padding: 40px 30px;">
              <h2 style="color: #1e3a8a;">Great News, ${name}! 🎉</h2>
              <p>Your account has been <strong style="color: #10b981;">APPROVED</strong>!</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${APP_URL}/login" style="background: #6366f1; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px;">🔑 Log In Now</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    );

    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 3. VISA EMAIL
 */
exports.sendVisaEmail = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, type, status, visaDocumentUrl, visaDocumentData, applicantName, additionalNotes } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    let subject = 'Visa Application Update - Fujairah Open 2026';
    let html = '';
    let attachments = [];
    
    // Modern glassmorphism email base template
    const emailBaseStyle = `
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          line-height: 1.6; 
          color: #1f2937;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .email-wrapper {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
          min-height: 100vh;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .header {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
          position: relative;
        }
        .logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
        }
        .content {
          padding: 40px 30px;
        }
        .status-badge {
          display: inline-block;
          padding: 12px 24px;
          border-radius: 25px;
          font-weight: bold;
          font-size: 16px;
          margin: 20px 0;
        }
        .status-approved { background: linear-gradient(135deg, #10b981, #059669); color: white; }
        .status-rejected { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }
        .status-pending { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
        .status-processing { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }
        .status-additional { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }
        .status-reviewing { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; }
        .status-submitted { background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; }
        .glass-box {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          padding: 25px;
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          margin: 20px 0;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .note-box {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
          border-left: 4px solid #ef4444;
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
        }
        .button {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          padding: 16px 40px;
          text-decoration: none;
          border-radius: 12px;
          display: inline-block;
          font-weight: bold;
          font-size: 16px;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
          transition: all 0.3s;
        }
        .footer {
          background: linear-gradient(135deg, #1e293b, #0f172a);
          color: rgba(255, 255, 255, 0.7);
          text-align: center;
          padding: 30px;
          font-size: 13px;
        }
      </style>
    `;

    // Status-specific configurations
    const statusConfig = {
      approved: {
        title: 'VISA APPROVED',
        icon: '✅',
        color: 'status-approved',
        message: `Congratulations! Your visa application has been approved.`
      },
      rejected: {
        title: 'VISA APPLICATION REJECTED',
        icon: '❌',
        color: 'status-rejected',
        message: `We regret to inform you that your visa application has been rejected.`
      },
      pending: {
        title: 'VISA APPLICATION PENDING',
        icon: '⏳',
        color: 'status-pending',
        message: `Your visa application is pending review.`
      },
      processing: {
        title: 'VISA IN PROCESS',
        icon: '⚙️',
        color: 'status-processing',
        message: `Your visa application is currently being processed.`
      },
      reviewing: {
        title: 'UNDER OC REVIEW',
        icon: '🔍',
        color: 'status-reviewing',
        message: `Your visa application is being reviewed by the Organizing Committee.`
      },
      submitted: {
        title: 'SUBMITTED TO GRFA',
        icon: '📤',
        color: 'status-submitted',
        message: `Your visa application has been submitted to the GRFA for processing.`
      },
      additional: {
        title: 'ADDITIONAL DOCUMENTS REQUIRED',
        icon: '📎',
        color: 'status-additional',
        message: `Additional documents are required for your visa application.`
      }
    };

    const currentStatus = statusConfig[status] || statusConfig.pending;
    
    // If status is approved and we have a visa document
    if (status === 'approved' && (visaDocumentUrl || visaDocumentData)) {
      subject = '✅ Your Visa is Approved! - Fujairah Open 2026';
      
      html = `
        <!DOCTYPE html>
        <html>
        <head>${emailBaseStyle}</head>
        <body>
          <div class="email-wrapper">
            <div class="email-container">
              <div class="header">
                <img src="https://www.fujopen.com/images/13th%20Fuj.%20OITC.png" alt="Fujairah Open 2026" class="logo" />
                <h1 style="margin: 10px 0; font-size: 32px; font-weight: 800;">FUJAIRAH OPEN 2026</h1>
                <p style="margin: 5px 0; font-size: 14px; opacity: 0.9;">13th International Taekwondo Championships</p>
              </div>
              
              <div class="content">
                <h2 style="color: #1e3a8a; font-size: 28px; margin-bottom: 10px;">Hello ${name}! 👋</h2>
                
                <div class="glass-box" style="text-align: center;">
                  <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
                  <span class="status-badge status-approved">VISA APPROVED</span>
                  <p style="font-size: 18px; color: #059669; font-weight: 600; margin: 15px 0;">Your journey to Fujairah is confirmed!</p>
                </div>
                
                <p style="font-size: 16px; line-height: 1.8;">
                  Congratulations! Your visa application for the <strong>13th Fujairah Open International Taekwondo Championships 2026</strong> has been <strong style="color: #10b981;">APPROVED</strong>!
                </p>
                
                <div class="glass-box">
                  <h3 style="margin-top: 0; color: #1e3a8a;">📎 Visa Document Attached</h3>
                  <p style="margin: 10px 0;">Your approved visa document is attached to this email as a PDF file.</p>
                  <p style="background: rgba(16, 185, 129, 0.1); padding: 10px; border-radius: 8px; font-weight: 600; color: #059669;">
                    📄 Filename: Visa_${applicantName || name}.pdf
                  </p>
                </div>
                
                <div class="glass-box">
                  <h3 style="margin-top: 0; color: #1e3a8a;">📋 Important Instructions</h3>
                  <ol style="color: #374151; line-height: 2; margin: 15px 0;">
                    <li><strong>Download</strong> the attached PDF document</li>
                    <li><strong>Print</strong> a copy to bring when traveling</li>
                    <li><strong>Present</strong> it at UAE immigration</li>
                    <li><strong>Verify</strong> all details are correct</li>
                  </ol>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <p style="font-size: 18px; color: #1e3a8a; font-weight: 600; margin-bottom: 15px;">Complete Your Championship Preparation</p>
                  <a href="${APP_URL}/en/hotel" class="button" style="margin: 5px;">🏨 Book Hotel</a>
                  <a href="${APP_URL}/en/transportation" class="button" style="margin: 5px;">🚗 Transportation</a>
                </div>
              </div>
              
              <div class="footer">
                <img src="https://www.fujopen.com/images/13th%20Fuj.%20OITC.png" alt="Logo" style="width: 50px; height: 50px; margin-bottom: 15px;" />
                <p style="margin: 5px 0; font-size: 14px; font-weight: 600;">13th Fujairah Open 2026</p>
                <p style="margin: 5px 0;">International Taekwondo Championships</p>
                <p style="margin: 15px 0 5px; font-size: 12px;">www.fujopen.com | info@fujairahopen.com</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Add visa document as attachment
      console.log('📎 Processing attachment...');
      console.log('📎 visaDocumentUrl:', visaDocumentUrl);
      console.log('📎 visaDocumentData:', visaDocumentData ? 'provided' : 'not provided');
      
      if (visaDocumentData) {
        // If base64 data is provided
        console.log('📎 Using base64 data');
        attachments.push({
          filename: `Visa_${applicantName || name}.pdf`,
          content: visaDocumentData,
          type: 'application/pdf'
        });
      } else if (visaDocumentUrl) {
        // If URL is provided, fetch the file
        console.log('📎 Fetching from URL:', visaDocumentUrl);
        try {
          const https = require('https');
          const response = await new Promise((resolve, reject) => {
            https.get(visaDocumentUrl, (res) => {
              console.log('📎 HTTP response status:', res.statusCode);
              const chunks = [];
              res.on('data', (chunk) => {
                console.log('📎 Received chunk:', chunk.length, 'bytes');
                chunks.push(chunk);
              });
              res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                console.log('📎 Total bytes received:', buffer.length);
                resolve(buffer);
              });
              res.on('error', reject);
            }).on('error', reject);
          });
          
          console.log('📎 Converting to base64...');
          const base64Content = response.toString('base64');
          console.log('📎 Base64 length:', base64Content.length);
          
          attachments.push({
            filename: `Visa_${applicantName || name}.pdf`,
            content: base64Content,
            type: 'application/pdf'
          });
          console.log('✅ Attachment added successfully');
        } catch (fetchError) {
          console.error('❌ Error fetching visa document:', fetchError);
          // Continue without attachment but log the error
        }
      } else {
        console.log('⚠️ No visa document URL or data provided');
      }
    } else {
      // For other statuses - beautiful glassmorphism template
      subject = `${currentStatus.icon} ${currentStatus.title} - Fujairah Open 2026`;
      
      html = `
        <!DOCTYPE html>
        <html>
        <head>${emailBaseStyle}</head>
        <body>
          <div class="email-wrapper">
            <div class="email-container">
              <div class="header">
                <img src="https://www.fujopen.com/images/13th%20Fuj.%20OITC.png" alt="Fujairah Open 2026" class="logo" />
                <h1 style="margin: 10px 0; font-size: 32px; font-weight: 800;">FUJAIRAH OPEN 2026</h1>
                <p style="margin: 5px 0; font-size: 14px; opacity: 0.9;">13th International Taekwondo Championships</p>
              </div>
              
              <div class="content">
                <h2 style="color: #1e3a8a; font-size: 28px; margin-bottom: 10px;">Hello ${name}! 👋</h2>
                
                <div class="glass-box" style="text-align: center;">
                  <div style="font-size: 48px; margin-bottom: 15px;">${currentStatus.icon}</div>
                  <span class="status-badge ${currentStatus.color}">${currentStatus.title}</span>
                  <p style="font-size: 16px; margin: 15px 0; line-height: 1.8;">${currentStatus.message}</p>
                </div>
                
                ${additionalNotes ? `
                  <div class="note-box">
                    <h3 style="margin-top: 0; color: #dc2626; font-size: 18px;">📝 Admin Notes:</h3>
                    <p style="margin: 10px 0; font-size: 15px; color: #991b1b; line-height: 1.8; white-space: pre-wrap;">${additionalNotes}</p>
                  </div>
                ` : ''}
                
                ${status === 'additional' ? `
                  <div class="glass-box">
                    <h3 style="margin-top: 0; color: #dc2626;">⚠️ Action Required</h3>
                    <p style="margin: 10px 0; font-size: 15px; line-height: 1.8;">
                      Please upload the requested additional documents through your dashboard to continue the visa application process.
                    </p>
                    <div style="text-align: center; margin: 20px 0;">
                      <a href="${APP_URL}/en/visa" class="button">Upload Documents</a>
                    </div>
                  </div>
                ` : ''}
                
                ${status === 'rejected' ? `
                  <div class="glass-box">
                    <h3 style="margin-top: 0; color: #1e3a8a;">💡 Next Steps</h3>
                    <p style="margin: 10px 0; font-size: 15px; line-height: 1.8;">
                      If you have questions about this decision, please contact our support team at 
                      <a href="mailto:info@fujairahopen.com" style="color: #6366f1; font-weight: 600;">info@fujairahopen.com</a>
                    </p>
                  </div>
                ` : ''}
                
                ${status === 'reviewing' || status === 'submitted' || status === 'processing' ? `
                  <div class="glass-box">
                    <h3 style="margin-top: 0; color: #1e3a8a;">⏱️ What's Next?</h3>
                    <p style="margin: 10px 0; font-size: 15px; line-height: 1.8;">
                      Your application is progressing smoothly. You'll receive another email notification once the status changes.
                      Please check your dashboard for real-time updates.
                    </p>
                  </div>
                ` : ''}
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${APP_URL}/en/visa" class="button">View Application Status</a>
                </div>
                
                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                  Questions? Contact us at <a href="mailto:info@fujairahopen.com" style="color: #6366f1; font-weight: 600;">info@fujairahopen.com</a>
                </p>
              </div>
              
              <div class="footer">
                <img src="https://www.fujopen.com/images/13th%20Fuj.%20OITC.png" alt="Logo" style="width: 50px; height: 50px; margin-bottom: 15px;" />
                <p style="margin: 5px 0; font-size: 14px; font-weight: 600;">13th Fujairah Open 2026</p>
                <p style="margin: 5px 0;">International Taekwondo Championships</p>
                <p style="margin: 15px 0 5px; font-size: 12px;">www.fujopen.com | info@fujairahopen.com</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const result = await sendEmail(email, subject, html, attachments);

    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error in sendVisaEmail:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 4. HOTEL EMAIL
 */
exports.sendHotelEmail = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, hotelName } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    const result = await sendEmail(
      email,
      '🏨 Hotel Booking Confirmed - Fujairah Open 2026',
      `
        <div style="font-family: Arial, sans-serif;">
          <h2>Hello ${name}!</h2>
          <p>Your hotel reservation has been confirmed!</p>
          <p><strong>Hotel:</strong> ${hotelName || 'TBD'}</p>
          <p><a href="${APP_URL}/hotel" style="background: #6366f1; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View Booking</a></p>
        </div>
      `
    );

    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 5. ADMIN NOTIFICATION
 */
exports.sendAdminNotification = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { adminEmail, newUserData } = req.body;

    if (!adminEmail) {
      return res.status(400).json({ error: 'Admin email is required' });
    }

    const result = await sendEmail(
      adminEmail,
      '🔔 New User Registration - Approval Required',
      `
        <div style="font-family: Arial, sans-serif;">
          <h2>New User Awaiting Approval</h2>
          <p><strong>Name:</strong> ${newUserData.name}</p>
          <p><strong>Email:</strong> ${newUserData.email}</p>
          <p><strong>Position:</strong> ${newUserData.position}</p>
          <p><a href="${APP_URL}/admin/user-management" style="background: #10b981; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Review User</a></p>
        </div>
      `
    );

    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});


