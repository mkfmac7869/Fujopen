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
    // Using direct URL from your domain
    const LOGO_URL = 'https://fujopen.com/images/fujairah-logo.png';
    
    const emailBaseStyle = `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Montserrat', Arial, sans-serif;
          line-height: 1.7; 
          color: #ffffff;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        }
        .email-wrapper {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          padding: 50px 30px;
          min-height: 100vh;
        }
        .email-container {
          max-width: 1100px;
          margin: 0 auto;
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(50px);
          -webkit-backdrop-filter: blur(50px);
          border-radius: 28px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7), inset 0 1px 3px rgba(255, 255, 255, 0.25);
        }
        .header {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.45) 0%, rgba(139, 92, 246, 0.45) 100%);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          color: white;
          padding: 40px 50px;
          display: table;
          width: 100%;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        .logo-section {
          display: table-cell;
          vertical-align: middle;
          width: 60%;
        }
        .logo-container {
          display: inline-block;
          vertical-align: middle;
          margin-right: 25px;
          background: rgba(255, 255, 255, 0.15);
          padding: 12px;
          border-radius: 15px;
          border: 2px solid rgba(255, 255, 255, 0.25);
        }
        .logo {
          width: 65px;
          height: 65px;
          vertical-align: middle;
          display: block;
        }
        .header-text {
          display: inline-block;
          vertical-align: middle;
        }
        .header-text h1 {
          font-size: 26px;
          font-weight: 900;
          margin: 0 0 5px 0;
          color: #ffffff;
          text-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
          letter-spacing: 0.5px;
        }
        .header-text p {
          font-size: 13px;
          margin: 0;
          color: #e0e7ff;
          font-weight: 500;
        }
        .badge-cell {
          display: table-cell;
          vertical-align: middle;
          text-align: right;
          width: 40%;
        }
        .content {
          padding: 50px;
        }
        .welcome-title {
          font-size: 30px;
          margin-bottom: 30px;
          font-weight: 900;
          color: #ffffff;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        .landscape-grid {
          display: table;
          width: 100%;
          margin: 30px 0;
        }
        .left-column {
          display: table-cell;
          width: 60%;
          padding-right: 25px;
          vertical-align: top;
        }
        .right-column {
          display: table-cell;
          width: 40%;
          vertical-align: top;
        }
        .status-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(50px);
          -webkit-backdrop-filter: blur(50px);
          border-radius: 20px;
          padding: 40px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 12px 45px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.2);
          margin: 0;
          text-align: center;
        }
        .status-badge {
          display: inline-block;
          padding: 14px 32px;
          border-radius: 30px;
          font-weight: 800;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: #ffffff !important;
          white-space: nowrap;
        }
        .status-approved { background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 8px 25px rgba(16, 185, 129, 0.6); }
        .status-rejected { background: linear-gradient(135deg, #ef4444, #dc2626); box-shadow: 0 8px 25px rgba(239, 68, 68, 0.6); }
        .status-pending { background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 8px 25px rgba(245, 158, 11, 0.6); }
        .status-processing { background: linear-gradient(135deg, #a855f7, #9333ea); box-shadow: 0 8px 25px rgba(168, 85, 247, 0.6); }
        .status-additional { background: linear-gradient(135deg, #ef4444, #dc2626); box-shadow: 0 8px 25px rgba(239, 68, 68, 0.6); }
        .status-reviewing { background: linear-gradient(135deg, #06b6d4, #0891b2); box-shadow: 0 8px 25px rgba(6, 182, 212, 0.6); }
        .status-submitted { background: linear-gradient(135deg, #06b6d4, #0891b2); box-shadow: 0 8px 25px rgba(6, 182, 212, 0.6); }
        .glass-box {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(45px);
          -webkit-backdrop-filter: blur(45px);
          padding: 28px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          margin: 25px 0;
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }
        .note-box {
          background: rgba(239, 68, 68, 0.15);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border-left: 5px solid #ef4444;
          padding: 28px;
          border-radius: 16px;
          margin: 25px 0;
          border: 1px solid rgba(239, 68, 68, 0.4);
          box-shadow: 0 8px 30px rgba(239, 68, 68, 0.3);
          color: #ffffff;
        }
        .button {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #ffffff !important;
          padding: 16px 40px;
          text-decoration: none;
          border-radius: 12px;
          display: inline-block;
          font-weight: 800;
          font-size: 15px;
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.25);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .info-row {
          padding: 18px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }
        .info-row:last-child { border-bottom: none; }
        .info-label {
          font-weight: 600;
          opacity: 0.75;
          font-size: 14px;
          color: #cbd5e1;
          display: inline-block;
          width: 45%;
        }
        .info-value {
          font-weight: 800;
          font-size: 16px;
          color: #ffffff;
          display: inline-block;
          text-align: right;
          width: 55%;
        }
        .footer {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(25px);
          color: rgba(255, 255, 255, 0.7);
          padding: 35px;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
          text-align: center;
        }
        h3 {
          color: #ffffff !important;
          font-weight: 800;
        }
        p, li {
          color: rgba(255, 255, 255, 0.95);
        }
        a {
          color: #93c5fd;
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
                  <div class="logo-container">
                    <img src="${LOGO_URL}" alt="Fujairah Open 2026" class="logo" />
                  </div>
                  <div class="header-text">
                    <h1>FUJAIRAH OPEN 2026</h1>
                    <p>13th International Taekwondo Championships</p>
                  </div>
                </div>
                <div class="badge-cell">
                  <span class="status-badge status-approved">✅ VISA APPROVED</span>
                </div>
              </div>
              
              <!-- Content with Landscape Columns -->
              <div class="content">
                <h2 class="welcome-title">Hello ${name}! 👋</h2>
                
                <div class="landscape-grid">
                  <!-- Left Column: Main Info -->
                  <div class="left-column">
                    <div class="glass-box">
                      <h3 style="font-size: 22px; margin-bottom: 20px;">🎉 CONGRATULATIONS!</h3>
                      <p style="font-size: 17px; line-height: 1.9; margin-bottom: 25px;">
                        Your visa application for the <strong>13th Fujairah Open International Taekwondo Championships 2026</strong> has been <strong style="color: #10b981;">APPROVED</strong>!
                      </p>
                      
                      <div class="info-row">
                        <span class="info-label">Applicant Name:</span>
                        <span class="info-value">${name}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Visa Status:</span>
                        <span class="info-value" style="color: #10b981;">✅ APPROVED</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Visa Document:</span>
                        <span class="info-value">📎 Attached (PDF)</span>
                      </div>
                    </div>
                    
                    <div class="glass-box">
                      <h3 style="font-size: 19px; margin-bottom: 18px;">📋 Next Steps</h3>
                      <ol style="line-height: 2.2; margin: 15px 0 15px 22px; font-size: 15px;">
                        <li><strong style="color: #93c5fd;">Download</strong> the attached visa PDF</li>
                        <li><strong style="color: #93c5fd;">Print</strong> physical copies</li>
                        <li><strong style="color: #93c5fd;">Present</strong> at UAE immigration</li>
                        <li><strong style="color: #93c5fd;">Verify</strong> all passport details</li>
                      </ol>
                    </div>
                  </div>
                  
                  <!-- Right Column: Actions -->
                  <div class="right-column">
                    <div class="status-card">
                      <div style="font-size: 70px; margin-bottom: 20px;">✅</div>
                      <h3 style="font-size: 20px; margin-bottom: 15px; color: #10b981;">VISA APPROVED!</h3>
                      <p style="font-size: 15px; opacity: 0.9; margin-bottom: 30px;">Your journey is confirmed</p>
                      <a href="${APP_URL}/en/visa" class="button" style="width: 100%; display: block; text-align: center; box-sizing: border-box;">VIEW DASHBOARD</a>
                    </div>
                    
                    <div class="glass-box" style="text-align: center;">
                      <h4 style="font-size: 17px; margin-bottom: 15px;">🏨 Book Hotel</h4>
                      <p style="font-size: 14px; opacity: 0.8; margin-bottom: 15px;">Reserve accommodation</p>
                      <a href="${APP_URL}/en/hotel" class="button" style="padding: 12px 28px; font-size: 13px;">Book Now</a>
                    </div>
                    
                    <div class="glass-box" style="text-align: center;">
                      <h4 style="font-size: 17px; margin-bottom: 15px;">🚗 Transportation</h4>
                      <p style="font-size: 14px; opacity: 0.8; margin-bottom: 15px;">Airport transfers</p>
                      <a href="${APP_URL}/en/transportation" class="button" style="padding: 12px 28px; font-size: 13px;">Request</a>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Footer -->
              <div class="footer">
                <div class="logo-container" style="display: inline-block; margin-bottom: 15px;">
                  <img src="${LOGO_URL}" alt="Logo" style="width: 45px; height: 45px; opacity: 0.8;" />
                </div>
                <p style="margin: 8px 0; font-size: 14px; font-weight: 700; color: #e0e7ff;">13th Fujairah Open 2026</p>
                <p style="margin: 5px 0; font-size: 12px;">International Taekwondo Championships</p>
                <p style="margin: 12px 0; font-size: 12px;">www.fujopen.com | info@fujairahopen.com</p>
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
                  <div class="logo-container">
                    <img src="${LOGO_URL}" alt="Fujairah Open 2026" class="logo" />
                  </div>
                  <div class="header-text">
                    <h1>FUJAIRAH OPEN 2026</h1>
                    <p>13th International Taekwondo Championships</p>
                  </div>
                </div>
                <div class="badge-cell">
                  <span class="status-badge ${currentStatus.color}">${currentStatus.icon} ${currentStatus.title}</span>
                </div>
              </div>
              
              <!-- Content with Landscape Columns -->
              <div class="content">
                <h2 class="welcome-title">Hello ${name}! 👋</h2>
                
                <div class="landscape-grid">
                  <!-- Left Column: Main Info -->
                  <div class="left-column">
                    <div class="glass-box">
                      <h3 style="font-size: 22px; margin-bottom: 20px;">${currentStatus.icon} ${currentStatus.title}</h3>
                      <p style="font-size: 17px; line-height: 1.9; margin-bottom: 25px;">
                        ${currentStatus.message}
                      </p>
                      
                      <div class="info-row">
                        <span class="info-label">Applicant Name:</span>
                        <span class="info-value">${name}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Current Status:</span>
                        <span class="info-value">${currentStatus.title}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Championship:</span>
                        <span class="info-value">Fujairah Open 2026</span>
                      </div>
                    </div>
                    
                    ${additionalNotes ? `
                      <!-- Admin Notes - PROMINENT DISPLAY -->
                      <div class="note-box">
                        <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 18px; color: #fca5a5;">📝 MESSAGE FROM ADMIN</h3>
                        <p style="font-size: 16px; line-height: 1.9; color: #ffffff; white-space: pre-wrap; margin: 0; font-weight: 500;">${additionalNotes}</p>
                      </div>
                    ` : ''}
                    
                    ${status === 'additional' ? `
                      <div class="glass-box">
                        <h3 style="font-size: 19px; margin-bottom: 18px;">⚠️ Action Required</h3>
                        <p style="font-size: 16px; line-height: 1.9; margin-bottom: 22px;">
                          Please upload the requested additional documents through your dashboard to continue the visa application process.
                        </p>
                        <a href="${APP_URL}/en/visa" class="button" style="width: 100%; display: block; text-align: center;">UPLOAD DOCUMENTS</a>
                      </div>
                    ` : ''}
                    
                    ${status === 'rejected' ? `
                      <div class="glass-box">
                        <h3 style="font-size: 19px; margin-bottom: 18px;">💡 Need Assistance?</h3>
                        <p style="font-size: 16px; line-height: 1.9; margin-bottom: 15px;">
                          If you have questions about this decision, contact our support team.
                        </p>
                        <p style="margin-top: 15px; font-size: 16px;">
                          📧 <a href="mailto:info@fujairahopen.com" style="color: #93c5fd; font-weight: 700; text-decoration: none;">info@fujairahopen.com</a>
                        </p>
                      </div>
                    ` : ''}
                    
                    ${status === 'reviewing' || status === 'submitted' || status === 'processing' || status === 'pending' ? `
                      <div class="glass-box">
                        <h3 style="font-size: 19px; margin-bottom: 18px;">⏱️ What's Next?</h3>
                        <p style="font-size: 16px; line-height: 1.9;">
                          Your application is progressing smoothly. You'll receive email notifications as the status updates. Check your dashboard for real-time progress.
                        </p>
                      </div>
                    ` : ''}
                  </div>
                  
                  <!-- Right Column: Status Card & Quick Actions -->
                  <div class="right-column">
                    <div class="status-card">
                      <div style="font-size: 80px; margin-bottom: 25px;">${currentStatus.icon}</div>
                      <h3 style="font-size: 19px; margin-bottom: 18px;">${currentStatus.title}</h3>
                      <p style="font-size: 15px; opacity: 0.95; margin-bottom: 35px; line-height: 1.8;">${currentStatus.message}</p>
                      <a href="${APP_URL}/en/visa" class="button" style="width: 90%; display: block; text-align: center; margin: 0 auto; box-sizing: border-box;">VIEW DASHBOARD</a>
                    </div>
                    
                    <div style="margin-top: 25px;">
                      <div class="glass-box" style="text-align: center; padding: 22px;">
                        <h4 style="font-size: 16px; margin-bottom: 12px; font-weight: 800;">📊 Track Status</h4>
                        <p style="font-size: 13px; opacity: 0.85; margin-bottom: 0;">Check real-time updates</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Footer -->
              <div class="footer">
                <div class="logo-container" style="display: inline-block; margin-bottom: 15px;">
                  <img src="${LOGO_URL}" alt="Logo" style="width: 45px; height: 45px; opacity: 0.8;" />
                </div>
                <p style="margin: 8px 0; font-size: 14px; font-weight: 700; color: #e0e7ff;">13th Fujairah Open 2026</p>
                <p style="margin: 5px 0; font-size: 12px;">International Taekwondo Championships</p>
                <p style="margin: 12px 0; font-size: 12px;">www.fujopen.com | info@fujairahopen.com</p>
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


