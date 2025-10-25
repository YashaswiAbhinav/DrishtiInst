import { Request, Response, NextFunction } from 'express';
import { admin } from '../firebaseAdmin';

export interface AuthedRequest extends Request {
  user?: any;
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = (req.headers.authorization || '') as string;
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) return res.status(401).json({ error: 'Missing Authorization Bearer token' });

    const idToken = match[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    return next();
  } catch (err) {
    console.error('Firebase token verification failed', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
