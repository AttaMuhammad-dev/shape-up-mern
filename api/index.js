import app from '../backend/app.js';
import connectDB from '../backend/config/db.js';

export default async function handler(req, res) {
  // Public coaching and health are independent of MongoDB/auth availability.
  if (!['/api/health','/api/ai/chat'].includes(req.url.split('?')[0])) {
    try {
      if (!process.env.JWT_SECRET) throw new Error('Missing authentication configuration');
      await connectDB();
    } catch {
      return res.status(503).json({ message: 'The demo database is not available yet. Please try again later.' });
    }
  }
  return app(req, res);
}
