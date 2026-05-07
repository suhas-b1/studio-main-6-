const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
// Note: In production, use service account JSON. For now, we'll assume the environment is set.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
    console.log('Firebase Admin initialized');
  } catch (e) {
    console.error('Firebase Admin init error (placeholder used):', e.message);
    // Fallback for local dev if applicationDefault is not set
    admin.initializeApp({
      projectId: 'nourish-connect-placeholder'
    });
  }
}

const db = admin.firestore();

// 1. ALERT CREATION API
app.post('/api/alerts/create', async (req, res) => {
  try {
    const { 
      receiverId, receiverName, description, priority, 
      location, latitude, longitude, foodType, quantity 
    } = req.body;

    const maxRetriesMap = { low: 2, medium: 3, high: 5 };
    const maxRetries = maxRetriesMap[priority] || 2;

    const alertData = {
      receiverId,
      receiverName,
      description,
      priority,
      location,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      foodType: foodType || 'Any',
      quantity: quantity || 'Not specified',
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastNotificationSent: admin.firestore.FieldValue.serverTimestamp(),
      retryCount: 0,
      maxRetries,
      responders: [],
      acceptedBy: null,
      acceptedAt: null
    };

    const docRef = await db.collection('emergency_alerts').add(alertData);
    
    res.status(201).json({ 
      success: true, 
      alertId: docRef.id, 
      message: 'Emergency alert broadcasted to nearby donors.' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. ACCEPT ALERT API
app.post('/api/alerts/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const { donorId, donorName } = req.body;

    const alertRef = db.collection('emergency_alerts').doc(id);
    
    // Run transaction to prevent multiple accepts
    const result = await db.runTransaction(async (t) => {
      const doc = await t.get(alertRef);
      if (!doc.exists) throw new Error('Alert not found');
      
      const data = doc.data();
      if (data.status !== 'active') throw new Error('Alert already claimed or expired');

      t.update(alertRef, {
        status: 'accepted',
        acceptedBy: donorId,
        acceptedByName: donorName,
        acceptedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true };
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 3. AUTO-RETRY CRON SYSTEM (Every 5 minutes)
// In a real app, this would check if donors responded.
cron.schedule('*/5 * * * *', async () => {
  console.log('Running Auto-Retry System...');
  const now = admin.firestore.Timestamp.now();
  const fiveMinutesAgo = new Date(now.toDate().getTime() - 5 * 60 * 1000);

  const activeAlerts = await db.collection('emergency_alerts')
    .where('status', '==', 'active')
    .where('lastNotificationSent', '<=', fiveMinutesAgo)
    .get();

  const batch = db.batch();
  
  activeAlerts.forEach(doc => {
    const data = doc.data();
    if (data.retryCount < data.maxRetries) {
      // Resend notification by updating the timestamp (triggers frontend listeners)
      batch.update(doc.ref, {
        retryCount: data.retryCount + 1,
        lastNotificationSent: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Retrying alert ${doc.id} (Retry ${data.retryCount + 1}/${data.maxRetries})`);
    } else {
      // Max retries reached, expire the alert
      batch.update(doc.ref, { status: 'expired' });
      console.log(`Expiring alert ${doc.id} - No donor responded.`);
    }
  });

  await batch.commit();
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Emergency Backend running on port ${PORT}`);
});
