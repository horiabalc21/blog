import nodemailer from 'nodemailer';
import { connectDB } from '@/lib/db';
import { Subscription } from '@/entities/Subscription';

interface Article {
    id: number;
    title: string;
    content: string;
    category: string;
    author: string;
    url: string;
}

export async function sendArticleNotification(article: Article) {
    const db = await connectDB();
    const subRepo = db.getRepository(Subscription);
    const allSubs = await subRepo.find({ where: { verified: true } });

    // Filter subscriptions
    const recipients = allSubs.filter(sub =>
        sub.subscribeAll ||
        (sub.categories && sub.categories.includes(article.category)) ||
        (sub.editors && sub.editors.includes(article.author))
    );

    if (recipients.length === 0) return;

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

    // Send email to each recipient
    for (const sub of recipients) {
        const mailOptions = {
            from: process.env.SMTP_FROM || 'no-reply@myblog.com',
            to: sub.email,
            subject: `New Article Published: ${article.title}`,
            html: `<h2>${article.title}</h2><p>Category: ${article.category}</p><p>Author: ${article.author}</p><p>${article.content.slice(0, 200)}...</p><p><a href="${article.url}">Read more</a></p>`
        };
        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error(`Failed to send email to ${sub.email}:`, error);
        }
    }
}

