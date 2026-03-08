import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            user_id,
            amount,
            payment_method,
        } = await req.json();

        // Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
        }

        // Store in Supabase
        const { data, error } = await supabase
            .from('payments')
            .insert([
                {
                    user_id,
                    amount,
                    payment_method: payment_method || 'razorpay',
                    payment_status: 'paid',
                    razorpay_payment_id,
                    razorpay_order_id,
                    created_at: new Date().toISOString(),
                },
            ]);

        if (error) {
            console.error('Supabase Payment Error:', error);
            // We don't fail the request here because the payment was actually successful in Razorpay
        }

        return NextResponse.json({ success: true, message: 'Payment verified and stored' });
    } catch (error: any) {
        console.error('Verification Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to verify payment' }, { status: 500 });
    }
}
