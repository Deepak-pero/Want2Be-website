// server/cron/offlineCleanup.js
import cron from 'node-cron';
import User from '../models/User.js';

// ✅ Run every minute
cron.schedule('* * * * *', async () => {
    try {
        const FIVE_MINUTES_AGO = new Date(Date.now() - 5 * 60 * 1000);
        
        const result = await User.updateMany(
            {
                lastActive: { $lt: FIVE_MINUTES_AGO },
                isOnline: true
            },
            {
                isOnline: false
            }
        );
        
        if (result.modifiedCount > 0) {
            console.log(`🟢 Offline cleanup: ${result.modifiedCount} users set to offline`);
        }
    } catch (error) {
        console.error('❌ Offline cleanup error:', error);
    }
});