import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Subscription } from '@/entities/Subscription';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Token required' });
    }

    const db = await connectDB();
    const subRepo = db.getRepository(Subscription);
    const sub = await subRepo.findOne({ where: { token } });
    if (!sub) {
        return res.status(404).json({ error: 'Invalid or expired token' });
    }

    if (sub.verified) {
        return res.status(200).json({ message: 'Already verified.' });
    }

    sub.verified = true;
    await subRepo.save(sub);
    return res.status(200).json({ message: 'Email verified! Thank you.' });
}
