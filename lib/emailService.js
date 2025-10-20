import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend('re_Fkx6FBkJ_ENMg8QQpgD8jgTDtHnodZu1S');

// Configuration
const FROM_EMAIL = 'Fujairah Open 2026 <noreply@fujopen.com>'; // Verified domain
const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://www.fujopen.com';

/**
 * 1. WELCOME EMAIL - Sent when user registers
 */
export async function sendWelcomeEmail(userEmail, userName) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: 'Welcome to Fujairah Open 2026! 🥋',
      html: `
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
              <h2 style="color: #1e3a8a;">Hello ${userName}! 👋</h2>
              <p style="font-size: 16px;">Welcome to the official platform for the <strong>13th Fujairah Open International Taekwondo Championships 2026</strong>. We're excited to have you join us!</p>
              
              <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #856404;">⏳ Account Approval Pending</h4>
                <p style="margin: 0; color: #856404;">Your account is currently pending approval by our administrators. You will receive an email notification once your account is approved. After approval, you'll be able to log in and access all features.</p>
              </div>
              
              <h3 style="color: #1e3a8a; margin-top: 30px;">🎯 What You Can Do (After Approval):</h3>
              
              <div class="feature-box">
                <h4 style="margin: 0 0 10px 0; color: #6366f1;">📋 Apply for Visa</h4>
                <p style="margin: 0;">Submit your visa application with passport scanning and automatic OCR for quick processing.</p>
              </div>
              
              <div class="feature-box">
                <h4 style="margin: 0 0 10px 0; color: #6366f1;">🏨 Book Hotels</h4>
                <p style="margin: 0;">Reserve your accommodation at partner hotels near the championship venue.</p>
              </div>
              
              <div class="feature-box">
                <h4 style="margin: 0 0 10px 0; color: #6366f1;">🚗 Request Transportation</h4>
                <p style="margin: 0;">Arrange airport pickup and drop-off for your team members.</p>
              </div>
              
              <div class="feature-box">
                <h4 style="margin: 0 0 10px 0; color: #6366f1;">📊 Track Everything</h4>
                <p style="margin: 0;">Monitor all your applications, bookings, and requests in one dashboard.</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${APP_URL}" class="button">Go to Dashboard</a>
              </div>
              
              <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #856404;">📅 Important Dates:</h4>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Event Dates: TBD</li>
                  <li>Visa Application Deadline: TBD</li>
                  <li>Hotel Booking Deadline: TBD</li>
                </ul>
              </div>
              
              <p style="margin-top: 30px;">Need help? Contact us at <a href="mailto:info@fujairahopen.com" style="color: #6366f1;">info@fujairahopen.com</a></p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;"><strong>13th Fujairah Open 2026</strong></p>
              <p style="margin: 5px 0;">International Taekwondo Championships</p>
              <p style="margin: 15px 0 0 0; font-size: 12px;">You received this email because you registered on our platform.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Welcome email error:', error);
      return { success: false, error };
    }

    console.log('✅ Welcome email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Welcome email exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 2. VISA APPLICATION SUBMITTED - Sent immediately after visa application
 */
export async function sendVisaApplicationEmail(userEmail, userName, applicationData) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: 'Visa Application Received - Fujairah Open 2026',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 40px 30px; text-align: center; }
            .content { background: #f8f9fa; padding: 40px 30px; }
            .info-box { background: white; padding: 25px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .info-row:last-child { border-bottom: none; }
            .info-label { font-weight: bold; color: #6b7280; min-width: 150px; }
            .info-value { color: #111827; }
            .status-badge { background: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
            .button { background: #6366f1; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">✅ Visa Application Received</h1>
            </div>
            
            <div class="content">
              <h2 style="color: #1e3a8a;">Hello ${userName}!</h2>
              <p style="font-size: 16px;">Thank you for submitting your visa application for the <strong>13th Fujairah Open 2026</strong>.</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #1e3a8a;">📋 Application Details</h3>
                <div class="info-row">
                  <span class="info-label">Applicant Name:</span>
                  <span class="info-value">${applicationData.fullNameEnglish || userName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Passport Number:</span>
                  <span class="info-value">${applicationData.passportNumber || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Nationality:</span>
                  <span class="info-value">${applicationData.nationality || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Date of Birth:</span>
                  <span class="info-value">${applicationData.dateOfBirth || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Team/Club:</span>
                  <span class="info-value">${applicationData.teamName || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Status:</span>
                  <span class="info-value"><span class="status-badge">⏳ Under Review</span></span>
                </div>
                <div class="info-row">
                  <span class="info-label">Submitted:</span>
                  <span class="info-value">${new Date().toLocaleString()}</span>
                </div>
              </div>
              
              <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #1e40af;">📢 What Happens Next?</h4>
                <ul style="margin: 10px 0; padding-left: 20px; color: #1e40af;">
                  <li>Our team will review your application within 24-48 hours</li>
                  <li>You'll receive email notifications for any status changes</li>
                  <li>Check your dashboard to track the progress</li>
                  <li>Once approved, you'll receive your visa document via email</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="${APP_URL}/visa" class="button">View Application Status</a>
              </div>
              
              <p style="margin-top: 30px; color: #6b7280;">If you have any questions, please contact us at <a href="mailto:info@fujairahopen.com" style="color: #6366f1;">info@fujairahopen.com</a></p>
            </div>
            
            <div style="text-align: center; padding: 30px; color: #9ca3af; font-size: 13px;">
              <p>© 2026 Fujairah Open International Taekwondo Championships</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Visa application email error:', error);
      return { success: false, error };
    }

    console.log('✅ Visa application email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Visa application email exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 3. VISA STATUS UPDATE - Sent when visa status changes
 */
export async function sendVisaStatusUpdate(userEmail, userName, status, applicationData) {
  const statusConfig = {
    reviewing: {
      icon: '👀',
      title: 'Visa Application Under Review',
      color: '#f59e0b',
      bgcolor: '#fef3c7',
      message: 'Your visa application is currently being reviewed by our team.',
    },
    processing: {
      icon: '⏳',
      title: 'Visa Application Processing',
      color: '#3b82f6',
      bgcolor: '#dbeafe',
      message: 'Your visa application is being processed. This may take 24-48 hours.',
    },
    approved: {
      icon: '✅',
      title: 'Visa Approved!',
      color: '#10b981',
      bgcolor: '#d1fae5',
      message: 'Congratulations! Your visa application has been approved.',
    },
    rejected: {
      icon: '❌',
      title: 'Visa Application Requires Attention',
      color: '#ef4444',
      bgcolor: '#fee2e2',
      message: 'Your visa application requires additional information or review.',
    },
  };

  const config = statusConfig[status] || statusConfig.processing;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: `${config.icon} ${config.title} - Fujairah Open 2026`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: ${config.color}; color: white; padding: 40px 30px; text-align: center; }
            .content { background: #f8f9fa; padding: 40px 30px; }
            .status-box { background: ${config.bgcolor}; padding: 25px; border-radius: 10px; border-left: 5px solid ${config.color}; margin: 20px 0; }
            .button { background: #6366f1; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 36px;">${config.icon}</h1>
              <h2 style="margin: 10px 0 0 0; font-size: 24px;">${config.title}</h2>
            </div>
            
            <div class="content">
              <h2 style="color: #1e3a8a;">Hello ${userName}!</h2>
              <p style="font-size: 16px;">${config.message}</p>
              
              <div class="status-box">
                <h3 style="margin-top: 0; color: ${config.color};">Status Update</h3>
                <p style="font-size: 18px; margin: 10px 0;"><strong>Current Status:</strong> <span style="color: ${config.color}; font-weight: bold; text-transform: uppercase;">${status}</span></p>
                <p style="margin: 0;"><strong>Updated:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              ${status === 'approved' ? `
                <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin: 0 0 10px 0; color: #065f46;">🎉 Next Steps:</h4>
                  <ul style="margin: 10px 0; padding-left: 20px; color: #065f46;">
                    <li>Download your approved visa document from your dashboard</li>
                    <li>Print the visa and bring it with you to the UAE</li>
                    <li>Complete your hotel booking if not done yet</li>
                    <li>Arrange transportation from the airport</li>
                  </ul>
                </div>
              ` : ''}
              
              <div style="text-align: center;">
                <a href="${APP_URL}/visa" class="button">View Full Details</a>
              </div>
              
              <p style="margin-top: 30px; color: #6b7280;">Questions? Contact us at <a href="mailto:info@fujairahopen.com" style="color: #6366f1;">info@fujairahopen.com</a></p>
            </div>
            
            <div style="text-align: center; padding: 30px; color: #9ca3af; font-size: 13px;">
              <p>© 2026 Fujairah Open International Taekwondo Championships</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Visa status email error:', error);
      return { success: false, error };
    }

    console.log(`✅ Visa status email sent (${status}):`, data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Visa status email exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 4. VISA APPROVED WITH DOCUMENT - Sent when visa is approved (includes download link)
 */
export async function sendVisaApprovedWithDocument(userEmail, userName, visaDocumentUrl) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: '🎉 Your Visa is Approved! - Fujairah Open 2026',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 50px 30px; text-align: center; }
            .content { background: #f8f9fa; padding: 40px 30px; }
            .success-box { background: #d1fae5; padding: 30px; border-radius: 10px; border: 2px solid #10b981; margin: 20px 0; text-align: center; }
            .download-button { background: #10b981; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; font-size: 18px; }
            .button { background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 48px;">🎉</h1>
              <h2 style="margin: 15px 0; font-size: 32px;">Visa Approved!</h2>
              <p style="margin: 0; font-size: 18px;">Your journey to Fujairah Open 2026 is confirmed</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1e3a8a;">Congratulations ${userName}! 🥋</h2>
              <p style="font-size: 16px;">We're excited to inform you that your visa application for the <strong>13th Fujairah Open International Taekwondo Championships 2026</strong> has been <strong style="color: #10b981;">APPROVED</strong>!</p>
              
              <div class="success-box">
                <h3 style="margin-top: 0; color: #065f46; font-size: 24px;">✅ Visa Status: APPROVED</h3>
                <p style="font-size: 16px; margin: 15px 0;">Your visa document is ready for download</p>
                <a href="${visaDocumentUrl || APP_URL + '/visa'}" class="download-button">📄 Download Visa Document</a>
              </div>
              
              <div style="background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e3a8a;">📋 Important Instructions:</h3>
                <ol style="color: #374151; line-height: 1.8;">
                  <li><strong>Download your visa:</strong> Click the button above or visit your dashboard</li>
                  <li><strong>Print the document:</strong> Bring a printed copy when traveling to the UAE</li>
                  <li><strong>Keep it accessible:</strong> You'll need to present it at immigration</li>
                  <li><strong>Check validity:</strong> Ensure the visa dates match your travel plans</li>
                </ol>
              </div>
              
              <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #1e40af;">🎯 Ready for the Championship?</h4>
                <p style="margin: 10px 0; color: #1e40af;">Complete your preparations:</p>
                <div style="margin: 15px 0;">
                  <a href="${APP_URL}/hotel" class="button" style="background: #3b82f6;">🏨 Book Hotel</a>
                  <a href="${APP_URL}/transportation" class="button" style="background: #8b5cf6;">🚗 Arrange Transport</a>
                </div>
              </div>
              
              <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #856404;">⚠️ Important Reminders:</h4>
                <ul style="margin: 10px 0; padding-left: 20px; color: #856404;">
                  <li>Visa is valid for entry into the UAE only</li>
                  <li>Must be presented at immigration counter</li>
                  <li>Keep digital and physical copies</li>
                  <li>Ensure your passport is valid for 6+ months</li>
                </ul>
              </div>
              
              <p style="margin-top: 30px; text-align: center; font-size: 18px; color: #1e3a8a;"><strong>See you at the championship! 🥋🇦🇪</strong></p>
              
              <p style="margin-top: 30px; color: #6b7280;">Need help? Contact us at <a href="mailto:info@fujairahopen.com" style="color: #6366f1;">info@fujairahopen.com</a></p>
            </div>
            
            <div style="text-align: center; padding: 30px; color: #9ca3af; font-size: 13px;">
              <p>© 2026 Fujairah Open International Taekwondo Championships</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Visa approved email error:', error);
      return { success: false, error };
    }

    console.log('✅ Visa approved email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Visa approved email exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 5. HOTEL BOOKING CONFIRMATION - Sent when hotel booking is made
 */
export async function sendHotelBookingConfirmation(userEmail, userName, bookingData) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: '🏨 Hotel Booking Confirmed - Fujairah Open 2026',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 40px 30px; text-align: center; }
            .content { background: #f8f9fa; padding: 40px 30px; }
            .booking-box { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
            .info-row:last-child { border-bottom: none; }
            .button { background: #6366f1; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .status-badge { background: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🏨 Hotel Booking Confirmed!</h1>
            </div>
            
            <div class="content">
              <h2 style="color: #1e3a8a;">Hello ${userName}!</h2>
              <p style="font-size: 16px;">Your hotel reservation for the <strong>Fujairah Open 2026</strong> has been confirmed!</p>
              
              <div class="booking-box">
                <h3 style="margin-top: 0; color: #1e3a8a;">📋 Booking Details</h3>
                <div class="info-row">
                  <strong>Hotel:</strong>
                  <span>${bookingData.hotelName || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <strong>Location:</strong>
                  <span>${bookingData.location || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <strong>Room Type:</strong>
                  <span>${bookingData.roomType || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <strong>Number of Rooms:</strong>
                  <span>${bookingData.numberOfRooms || 1}</span>
                </div>
                <div class="info-row">
                  <strong>Check-in:</strong>
                  <span>${bookingData.checkIn ? new Date(bookingData.checkIn).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div class="info-row">
                  <strong>Check-out:</strong>
                  <span>${bookingData.checkOut ? new Date(bookingData.checkOut).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div class="info-row">
                  <strong>Total Price:</strong>
                  <span style="font-size: 20px; color: #10b981; font-weight: bold;">$${bookingData.totalPrice || '0'}</span>
                </div>
                <div class="info-row">
                  <strong>Confirmation #:</strong>
                  <span style="font-weight: bold; color: #6366f1;">${bookingData.confirmationNumber || 'Pending'}</span>
                </div>
                <div class="info-row">
                  <strong>Status:</strong>
                  <span class="status-badge">✅ Confirmed</span>
                </div>
              </div>
              
              ${bookingData.roomingList && bookingData.roomingList.length > 0 ? `
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin-top: 0; color: #1e3a8a;">👥 Guest Details</h4>
                  ${bookingData.roomingList.map((room, idx) => `
                    <div style="margin-bottom: 15px;">
                      <p style="margin: 5px 0; font-weight: bold;">Room ${idx + 1}:</p>
                      ${room.guests.map(guest => `
                        <p style="margin: 3px 0 3px 20px;">• ${guest.fullName} (Passport: ${guest.passportNumber})</p>
                      `).join('')}
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              
              <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #1e40af;">📢 Important Information:</h4>
                <ul style="margin: 10px 0; padding-left: 20px; color: #1e40af;">
                  <li>Please present your confirmation number at check-in</li>
                  <li>Valid photo ID required for all guests</li>
                  <li>Check-in time: Usually 2:00 PM</li>
                  <li>Check-out time: Usually 12:00 PM</li>
                  <li>Modifications subject to availability</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="${APP_URL}/hotel" class="button">View Full Booking</a>
              </div>
              
              <p style="margin-top: 30px; color: #6b7280;">Questions about your booking? Contact us at <a href="mailto:info@fujairahopen.com" style="color: #6366f1;">info@fujairahopen.com</a></p>
            </div>
            
            <div style="text-align: center; padding: 30px; color: #9ca3af; font-size: 13px;">
              <p>© 2026 Fujairah Open International Taekwondo Championships</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Hotel booking email error:', error);
      return { success: false, error };
    }

    console.log('✅ Hotel booking email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Hotel booking email exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 6. HOTEL BOOKING STATUS UPDATE - Sent when booking status changes
 */
export async function sendHotelStatusUpdate(userEmail, userName, status, bookingData) {
  const statusConfig = {
    pending: {
      icon: '⏳',
      title: 'Hotel Booking Pending',
      color: '#f59e0b',
      bgcolor: '#fef3c7',
      message: 'Your hotel booking is awaiting confirmation.',
    },
    confirmed: {
      icon: '✅',
      title: 'Hotel Booking Confirmed',
      color: '#10b981',
      bgcolor: '#d1fae5',
      message: 'Your hotel booking has been confirmed!',
    },
    modified: {
      icon: '🔄',
      title: 'Hotel Booking Modified',
      color: '#3b82f6',
      bgcolor: '#dbeafe',
      message: 'Your hotel booking has been modified.',
    },
    cancelled: {
      icon: '❌',
      title: 'Hotel Booking Cancelled',
      color: '#ef4444',
      bgcolor: '#fee2e2',
      message: 'Your hotel booking has been cancelled.',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: `${config.icon} ${config.title} - Fujairah Open 2026`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: ${config.color}; color: white; padding: 40px 30px; text-align: center; }
            .content { background: #f8f9fa; padding: 40px 30px; }
            .status-box { background: ${config.bgcolor}; padding: 25px; border-radius: 10px; border-left: 5px solid ${config.color}; margin: 20px 0; }
            .button { background: #6366f1; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 36px;">${config.icon}</h1>
              <h2 style="margin: 10px 0 0 0; font-size: 24px;">${config.title}</h2>
            </div>
            
            <div class="content">
              <h2 style="color: #1e3a8a;">Hello ${userName}!</h2>
              <p style="font-size: 16px;">${config.message}</p>
              
              <div class="status-box">
                <h3 style="margin-top: 0; color: ${config.color};">Booking Status Update</h3>
                <p style="font-size: 18px; margin: 10px 0;"><strong>Hotel:</strong> ${bookingData.hotelName || 'N/A'}</p>
                <p style="font-size: 18px; margin: 10px 0;"><strong>Status:</strong> <span style="color: ${config.color}; font-weight: bold; text-transform: uppercase;">${status}</span></p>
                <p style="margin: 0;"><strong>Updated:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${APP_URL}/hotel" class="button">View Booking Details</a>
              </div>
              
              <p style="margin-top: 30px; color: #6b7280;">Questions? Contact us at <a href="mailto:info@fujairahopen.com" style="color: #6366f1;">info@fujairahopen.com</a></p>
            </div>
            
            <div style="text-align: center; padding: 30px; color: #9ca3af; font-size: 13px;">
              <p>© 2026 Fujairah Open International Taekwondo Championships</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Hotel status email error:', error);
      return { success: false, error };
    }

    console.log(`✅ Hotel status email sent (${status}):`, data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Hotel status email exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 7. ADMIN NOTIFICATION - Sent to all admins when new user registers
 */
export async function sendAdminNewUserNotification(adminEmail, newUserData) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: '🔔 New User Registration - Approval Required',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 40px 30px; text-align: center; }
            .content { background: #f8f9fa; padding: 40px 30px; }
            .user-box { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 20px 0; }
            .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .info-row:last-child { border-bottom: none; }
            .info-label { font-weight: bold; color: #6b7280; min-width: 140px; }
            .info-value { color: #111827; }
            .button { background: #6366f1; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .approve-button { background: #10b981; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 5px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🔔 New User Registration</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Action Required: Approve User Account</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1e3a8a;">New User Awaiting Approval</h2>
              <p style="font-size: 16px;">A new user has registered on the Fujairah Open 2026 platform and is waiting for admin approval.</p>
              
              <div class="user-box">
                <h3 style="margin-top: 0; color: #1e3a8a;">👤 User Details</h3>
                <div class="info-row">
                  <span class="info-label">Full Name:</span>
                  <span class="info-value">${newUserData.name || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${newUserData.email || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Phone:</span>
                  <span class="info-value">${newUserData.phone || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Position:</span>
                  <span class="info-value" style="text-transform: uppercase; font-weight: 600;">${newUserData.position || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Team/Club:</span>
                  <span class="info-value">${newUserData.teamName || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Country:</span>
                  <span class="info-value">${newUserData.country || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Registration Date:</span>
                  <span class="info-value">${new Date().toLocaleString()}</span>
                </div>
              </div>
              
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #856404;">⚠️ Action Required</h4>
                <p style="margin: 0; color: #856404;">This user cannot log in until their account is approved by an administrator. Please review their information and approve or reject their account in the User Management panel.</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${APP_URL}/admin/user-management" class="approve-button">👥 Go to User Management</a>
              </div>
              
              <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #1e40af;">📋 Next Steps:</h4>
                <ol style="margin: 10px 0; padding-left: 20px; color: #1e40af;">
                  <li>Review the user's information carefully</li>
                  <li>Verify their position and team details</li>
                  <li>Approve or reject the account in User Management</li>
                  <li>User will be notified automatically upon approval</li>
                </ol>
              </div>
              
              <p style="margin-top: 30px; color: #6b7280; text-align: center; font-size: 14px;">This is an automated notification sent to all administrators.</p>
            </div>
            
            <div style="text-align: center; padding: 30px; color: #9ca3af; font-size: 13px;">
              <p>© 2026 Fujairah Open International Taekwondo Championships</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Admin notification email error:', error);
      return { success: false, error };
    }

    console.log('✅ Admin notification email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Admin notification email exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 8. USER ACCOUNT APPROVED - Sent when admin approves user account
 */
export async function sendAccountApprovedEmail(userEmail, userName) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: '✅ Your Account Has Been Approved! - Fujairah Open 2026',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 50px 30px; text-align: center; }
            .content { background: #f8f9fa; padding: 40px 30px; }
            .success-box { background: #d1fae5; padding: 30px; border-radius: 10px; border: 2px solid #10b981; margin: 20px 0; text-align: center; }
            .button { background: #6366f1; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 48px;">✅</h1>
              <h2 style="margin: 15px 0; font-size: 32px;">Account Approved!</h2>
              <p style="margin: 0; font-size: 18px;">You can now access your account</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1e3a8a;">Great News, ${userName}! 🎉</h2>
              <p style="font-size: 16px;">Your account for the <strong>13th Fujairah Open International Taekwondo Championships 2026</strong> has been <strong style="color: #10b981;">APPROVED</strong> by our administrators!</p>
              
              <div class="success-box">
                <h3 style="margin-top: 0; color: #065f46; font-size: 24px;">🔓 Account Status: ACTIVE</h3>
                <p style="font-size: 16px; margin: 15px 0;">You can now log in and access all features</p>
              </div>
              
              <div style="background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e3a8a;">🎯 What You Can Do Now:</h3>
                <ul style="color: #374151; line-height: 1.8;">
                  <li><strong>Apply for Visa:</strong> Submit visa applications with automatic OCR</li>
                  <li><strong>Book Hotels:</strong> Reserve accommodation at partner hotels</li>
                  <li><strong>Request Transportation:</strong> Arrange airport pickup and transfers</li>
                  <li><strong>Manage Team:</strong> Handle all your team's requirements in one place</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${APP_URL}/login" class="button">🔑 Log In Now</a>
              </div>
              
              <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #1e40af;">📋 Quick Start Guide:</h4>
                <ol style="margin: 10px 0; padding-left: 20px; color: #1e40af;">
                  <li>Log in using your email and password</li>
                  <li>Start with your visa application</li>
                  <li>Book your hotel accommodation</li>
                  <li>Arrange transportation if needed</li>
                  <li>Track everything from your dashboard</li>
                </ol>
              </div>
              
              <p style="margin-top: 30px; text-align: center; font-size: 18px; color: #1e3a8a;"><strong>Welcome aboard! 🥋🇦🇪</strong></p>
              
              <p style="margin-top: 30px; color: #6b7280;">Need help? Contact us at <a href="mailto:info@fujairahopen.com" style="color: #6366f1;">info@fujairahopen.com</a></p>
            </div>
            
            <div style="text-align: center; padding: 30px; color: #9ca3af; font-size: 13px;">
              <p>© 2026 Fujairah Open International Taekwondo Championships</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Account approved email error:', error);
      return { success: false, error };
    }

    console.log('✅ Account approved email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Account approved email exception:', error);
    return { success: false, error: error.message };
  }
}

// Export all functions
export default {
  sendWelcomeEmail,
  sendVisaApplicationEmail,
  sendVisaStatusUpdate,
  sendVisaApprovedWithDocument,
  sendHotelBookingConfirmation,
  sendHotelStatusUpdate,
  sendAdminNewUserNotification,
  sendAccountApprovedEmail,
};

