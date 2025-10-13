import { sendWelcomeEmail } from '../../lib/emailService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    console.log('📧 Sending welcome email to:', email);
    const result = await sendWelcomeEmail(email, name);

    if (result.success) {
      console.log('✅ Welcome email sent successfully to:', email);
      return res.status(200).json({ success: true, message: 'Email sent' });
    } else {
      console.error('❌ Failed to send welcome email:', result.error);
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('❌ Error in welcome email API:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

