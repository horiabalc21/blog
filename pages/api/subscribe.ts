import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { connectDB } from '@/lib/db';
import { Subscription } from '@/entities/Subscription';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();
    const { email, categories, editors, subscribeAll } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    // Generate verification token
    const token = uuidv4();

    // Save subscription to DB
    const db = await connectDB();
    const subRepo = db.getRepository(Subscription);
    const subscription = subRepo.create({
        email,
        categories,
        editors,
        subscribeAll,
        verified: false,
        token,
    });
    await subRepo.save(subscription);

    // Send verification email with link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verify?token=${token}`;

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: process.env.SMTP_FROM || 'no-reply@myblog.com',
        to: email,
        subject: 'Verify your subscription',
        html: `<p>Thank you for subscribing! Please verify your email by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`
    };
    console.log({mailOptions});
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Nodemailer error:', error);
        return res.status(500).json({ error: 'Failed to send verification email.', details: error });
    }

    return res.status(200).json({ success: true });
}
