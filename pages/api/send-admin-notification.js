import { sendAdminNewUserNotification } from '../../lib/emailService';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { newUser } = req.body;

    if (!newUser || !newUser.email) {
      return res.status(400).json({ error: 'Missing new user data' });
    }

    // Fetch all admin users from Firestore
    const adminsQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
    const adminsSnapshot = await getDocs(adminsQuery);
    
    if (adminsSnapshot.empty) {
      console.warn('⚠️ No admin users found in database');
      return res.status(200).json({ 
        success: true, 
        message: 'No admins to notify',
        adminCount: 0 
      });
    }

    const adminEmails = adminsSnapshot.docs.map(doc => doc.data().email).filter(Boolean);
    
    if (adminEmails.length === 0) {
      console.warn('⚠️ No admin emails found');
      return res.status(200).json({ 
        success: true, 
        message: 'No admin emails available',
        adminCount: 0 
      });
    }

    console.log(`📧 Sending admin notifications to ${adminEmails.length} admins`);

    // Send notification to all admins
    const emailPromises = adminEmails.map(adminEmail => 
      sendAdminNewUserNotification(adminEmail, newUser)
    );

    const results = await Promise.allSettled(emailPromises);
    
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
    const failureCount = results.length - successCount;

    console.log(`✅ Admin notifications sent: ${successCount} succeeded, ${failureCount} failed`);

    return res.status(200).json({ 
      success: true, 
      message: `Admin notifications sent to ${successCount} admins`,
      adminCount: adminEmails.length,
      successCount,
      failureCount
    });

  } catch (error) {
    console.error('❌ Error sending admin notifications:', error);
    return res.status(500).json({ 
      error: 'Failed to send admin notifications',
      details: error.message 
    });
  }
}

