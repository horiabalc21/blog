import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { connectDB } from '@/lib/db';
import { Payment } from '@/entities/Payment';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-11-17.clover',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();
    const { amount, email } = req.body;
    if (!amount || isNaN(amount)) return res.status(400).json({ error: 'Invalid amount' });

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur', // Changed from 'usd' to 'eur'
                        product_data: {
                            name: 'Blog Donation',
                        },
                        unit_amount: Math.round(Number(amount) * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/donation-success`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/donation-cancel`,
            customer_email: email || undefined,
        });

        // Save payment intent in DB
        const db = await connectDB();
        const paymentRepo = db.getRepository(Payment);
        await paymentRepo.save(paymentRepo.create({
            email: email || '',
            amount: Number(amount),
            stripeSessionId: session.id,
        }));

        return res.status(200).json({ url: session.url });
    } catch (error) {
        console.error('Stripe error:', error);
        return res.status(500).json({ error: 'Failed to create Stripe session' });
    }
}
