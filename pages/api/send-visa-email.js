import { sendVisaApplicationEmail, sendVisaStatusUpdate, sendVisaApprovedWithDocument } from '../../lib/emailService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, email, name, applicationData, status, visaUrl } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    let result;

    switch (type) {
      case 'application':
        console.log('📧 Sending visa application email to:', email);
        result = await sendVisaApplicationEmail(email, name, applicationData || {});
        break;

      case 'status':
        console.log('📧 Sending visa status update email to:', email, '- Status:', status);
        result = await sendVisaStatusUpdate(email, name, status, applicationData || {});
        break;

      case 'approved':
        console.log('📧 Sending visa approved email to:', email);
        result = await sendVisaApprovedWithDocument(email, name, visaUrl);
        break;

      default:
        return res.status(400).json({ error: 'Invalid email type' });
    }

    if (result.success) {
      console.log('✅ Visa email sent successfully to:', email);
      return res.status(200).json({ success: true, message: 'Email sent' });
    } else {
      console.error('❌ Failed to send visa email:', result.error);
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('❌ Error in visa email API:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

