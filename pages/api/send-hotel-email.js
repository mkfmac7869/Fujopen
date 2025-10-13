import { sendHotelBookingConfirmation, sendHotelStatusUpdate } from '../../lib/emailService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, email, name, bookingData, status } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    let result;

    switch (type) {
      case 'confirmation':
        console.log('📧 Sending hotel booking confirmation to:', email);
        result = await sendHotelBookingConfirmation(email, name, bookingData || {});
        break;

      case 'status':
        console.log('📧 Sending hotel status update to:', email, '- Status:', status);
        result = await sendHotelStatusUpdate(email, name, status, bookingData || {});
        break;

      default:
        return res.status(400).json({ error: 'Invalid email type' });
    }

    if (result.success) {
      console.log('✅ Hotel email sent successfully to:', email);
      return res.status(200).json({ success: true, message: 'Email sent' });
    } else {
      console.error('❌ Failed to send hotel email:', result.error);
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('❌ Error in hotel email API:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

