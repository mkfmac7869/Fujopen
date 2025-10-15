import { sendAccountApprovedEmail } from '../../lib/emailService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Missing email or name' });
    }

    const result = await sendAccountApprovedEmail(email, name);

    if (result.success) {
      return res.status(200).json({ 
        success: true,
        message: 'Account approved email sent successfully'
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to send email',
        details: result.error 
      });
    }
  } catch (error) {
    console.error('❌ Error in send-account-approved API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

