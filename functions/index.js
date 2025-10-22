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
    
    // Modern glassmorphism email template - LANDSCAPE DESIGN matching website
    const emailBaseStyle = `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Montserrat', Arial, sans-serif;
          line-height: 1.6; 
          color: #ffffff;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          min-height: 100vh;
        }
        .email-wrapper {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          padding: 30px;
          min-height: 100vh;
        }
        .email-container {
          max-width: 900px;
          margin: 0 auto;
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.15);
        }
        .header {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          color: white;
          padding: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .logo {
          width: 70px;
          height: 70px;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }
        .header-text h1 {
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 5px 0;
          background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .header-text p {
          font-size: 13px;
          opacity: 0.9;
          margin: 0;
        }
        .content {
          padding: 40px;
        }
        .status-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border-radius: 16px;
          padding: 30px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.15);
          margin: 20px 0;
        }
        .status-badge {
          display: inline-block;
          padding: 10px 24px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .status-approved { background: linear-gradient(135deg, #10b981, #059669); color: white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); }
        .status-rejected { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); }
        .status-pending { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4); }
        .status-processing { background: linear-gradient(135deg, #a855f7, #9333ea); color: white; box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4); }
        .status-additional { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); }
        .status-reviewing { background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4); }
        .status-submitted { background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4); }
        .glass-box {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          padding: 25px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          margin: 20px 0;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.15);
        }
        .note-box {
          background: rgba(239, 68, 68, 0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-left: 4px solid #ef4444;
          padding: 20px;
          border-radius: 12px;
          margin: 20px 0;
          border: 1px solid rgba(239, 68, 68, 0.3);
          box-shadow: 0 4px 20px rgba(239, 68, 68, 0.2);
        }
        .button {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 10px;
          display: inline-block;
          font-weight: 700;
          font-size: 15px;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 15px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .info-row:last-child { border-bottom: none; }
        .info-label {
          font-weight: 600;
          opacity: 0.7;
          font-size: 14px;
        }
        .info-value {
          font-weight: 700;
          font-size: 15px;
          text-align: right;
        }
        .footer {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px);
          color: rgba(255, 255, 255, 0.6);
          padding: 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
        }
        @media only screen and (max-width: 600px) {
          .grid-2 { grid-template-columns: 1fr; }
          .header { flex-direction: column; text-align: center; }
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
              <!-- Header -->
              <div class="header">
                <div class="logo-section">
                  <img src="https://www.fujopen.com/images/fujairah-logo.png" alt="Fujairah Open 2026" class="logo" />
                  <div class="header-text">
                    <h1>FUJAIRAH OPEN 2026</h1>
                    <p>13th International Taekwondo Championships</p>
                  </div>
                </div>
                <span class="status-badge status-approved">VISA APPROVED</span>
              </div>
              
              <!-- Content -->
              <div class="content">
                <h2 style="font-size: 26px; margin-bottom: 20px; font-weight: 800;">Hello ${name}! 👋</h2>
                
                <!-- Status Card -->
                <div class="status-card">
                  <div style="text-align: center; margin-bottom: 25px;">
                    <div style="font-size: 60px; margin-bottom: 10px;">✅</div>
                    <h3 style="font-size: 22px; font-weight: 800; margin-bottom: 10px;">CONGRATULATIONS!</h3>
                    <p style="font-size: 16px; opacity: 0.9;">Your visa has been approved successfully</p>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">Status:</span>
                    <span class="info-value" style="color: #10b981;">✅ APPROVED</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Visa Document:</span>
                    <span class="info-value">📎 Attached (PDF)</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Championship:</span>
                    <span class="info-value">Fujairah Open 2026</span>
                  </div>
                </div>
                
                <!-- Important Instructions -->
                <div class="glass-box">
                  <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 15px; color: #fff;">📋 Important Instructions</h3>
                  <ol style="line-height: 2; margin: 10px 0 10px 20px; opacity: 0.9;">
                    <li><strong>Download</strong> the attached visa PDF document</li>
                    <li><strong>Print</strong> a physical copy for travel</li>
                    <li><strong>Present</strong> it at UAE immigration upon arrival</li>
                    <li><strong>Verify</strong> all details match your passport</li>
                  </ol>
                </div>
                
                <!-- Next Steps -->
                <div class="grid-2">
                  <div class="glass-box" style="text-align: center;">
                    <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 15px;">🏨 Book Your Hotel</h4>
                    <p style="font-size: 14px; opacity: 0.8; margin-bottom: 15px;">Reserve your accommodation</p>
                    <a href="${APP_URL}/en/hotel" class="button">Book Now</a>
                  </div>
                  <div class="glass-box" style="text-align: center;">
                    <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 15px;">🚗 Transportation</h4>
                    <p style="font-size: 14px; opacity: 0.8; margin-bottom: 15px;">Arrange airport transfers</p>
                    <a href="${APP_URL}/en/transportation" class="button">Request Now</a>
                  </div>
                </div>
              </div>
              
              <!-- Footer -->
              <div class="footer" style="text-align: center;">
                <img src="https://www.fujopen.com/images/fujairah-logo.png" alt="Logo" style="width: 40px; height: 40px; margin-bottom: 10px; opacity: 0.7;" />
                <p style="margin: 5px 0; font-size: 13px; font-weight: 600;">13th Fujairah Open 2026 | International Taekwondo Championships</p>
                <p style="margin: 10px 0; font-size: 12px;">www.fujopen.com | info@fujairahopen.com</p>
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
              <!-- Header -->
              <div class="header">
                <div class="logo-section">
                  <img src="https://www.fujopen.com/images/fujairah-logo.png" alt="Fujairah Open 2026" class="logo" />
                  <div class="header-text">
                    <h1>FUJAIRAH OPEN 2026</h1>
                    <p>13th International Taekwondo Championships</p>
                  </div>
                </div>
                <span class="status-badge ${currentStatus.color}">${currentStatus.title}</span>
              </div>
              
              <!-- Content -->
              <div class="content">
                <h2 style="font-size: 26px; margin-bottom: 20px; font-weight: 800;">Hello ${name}! 👋</h2>
                
                <!-- Status Card -->
                <div class="status-card">
                  <div style="text-align: center; margin-bottom: 25px;">
                    <div style="font-size: 60px; margin-bottom: 10px;">${currentStatus.icon}</div>
                    <h3 style="font-size: 22px; font-weight: 800; margin-bottom: 10px;">${currentStatus.title}</h3>
                    <p style="font-size: 16px; opacity: 0.9;">${currentStatus.message}</p>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">Application Status:</span>
                    <span class="info-value">${currentStatus.title}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Applicant:</span>
                    <span class="info-value">${name}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Championship:</span>
                    <span class="info-value">Fujairah Open 2026</span>
                  </div>
                </div>
                
                ${additionalNotes ? `
                  <!-- Admin Notes -->
                  <div class="note-box">
                    <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 15px; color: #fca5a5;">📝 MESSAGE FROM ADMIN</h3>
                    <p style="font-size: 15px; line-height: 1.8; color: #fecaca; white-space: pre-wrap; margin: 0;">${additionalNotes}</p>
                  </div>
                ` : ''}
                
                ${status === 'additional' ? `
                  <!-- Action Required -->
                  <div class="glass-box">
                    <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 15px; color: #fff;">⚠️ Action Required</h3>
                    <p style="font-size: 15px; opacity: 0.9; margin-bottom: 20px; line-height: 1.8;">
                      Additional documents are required to process your visa application. Please upload them as soon as possible.
                    </p>
                    <div style="text-align: center;">
                      <a href="${APP_URL}/en/visa" class="button">Upload Documents Now</a>
                    </div>
                  </div>
                ` : ''}
                
                ${status === 'rejected' ? `
                  <!-- Next Steps for Rejection -->
                  <div class="glass-box">
                    <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 15px; color: #fff;">💡 Need Assistance?</h3>
                    <p style="font-size: 15px; opacity: 0.9; line-height: 1.8;">
                      If you have questions about this decision or need clarification, our support team is here to help.
                    </p>
                    <p style="margin-top: 15px; font-size: 15px;">
                      📧 Email: <a href="mailto:info@fujairahopen.com" style="color: #60a5fa; font-weight: 600; text-decoration: none;">info@fujairahopen.com</a>
                    </p>
                  </div>
                ` : ''}
                
                ${status === 'reviewing' || status === 'submitted' || status === 'processing' || status === 'pending' ? `
                  <!-- Progress Update -->
                  <div class="glass-box">
                    <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 15px; color: #fff;">⏱️ What's Next?</h3>
                    <p style="font-size: 15px; opacity: 0.9; line-height: 1.8;">
                      Your application is progressing smoothly. You'll receive email notifications as the status updates.
                      Track your application status in real-time through your dashboard.
                    </p>
                  </div>
                ` : ''}
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 35px 0;">
                  <a href="${APP_URL}/en/visa" class="button" style="font-size: 16px; padding: 16px 48px;">
                    View Application Dashboard
                  </a>
                </div>
              </div>
              
              <!-- Footer -->
              <div class="footer" style="text-align: center;">
                <img src="https://www.fujopen.com/images/fujairah-logo.png" alt="Logo" style="width: 40px; height: 40px; margin-bottom: 10px; opacity: 0.7;" />
                <p style="margin: 5px 0; font-size: 13px; font-weight: 600;">13th Fujairah Open 2026 | International Taekwondo Championships</p>
                <p style="margin: 10px 0; font-size: 12px;">www.fujopen.com | info@fujairahopen.com</p>
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


