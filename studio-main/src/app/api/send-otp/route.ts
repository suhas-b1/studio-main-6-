// src/app/api/send-otp/route.ts
// Sends a 6-digit OTP via:
//   • Email  — Resend API (set RESEND_API_KEY in .env.local)
//   • Phone  — Fast2SMS REST API (set FAST2SMS_API_KEY in .env.local) for Indian numbers
//
// Dev fallback: if credentials are not configured, returns OTP in response
// so the UI can show it on-screen for testing.
//
// POST body: { contact: string, otp: string }
// Returns:  { success: true, method, devMode?, devOtp? } | { error: string }

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// ── helpers ───────────────────────────────────────────────────────────────────
function isEmail(contact: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
}

function isPhone(contact: string) {
    return /^(\+91|91|0)?[6-9]\d{9}$/.test(contact.replace(/[\s-]/g, ''));
}

function normalisePhone(contact: string) {
    return contact.replace(/[\s-]/g, '').replace(/^(\+91|91|0)/, '');
}

// ── email OTP ─────────────────────────────────────────────────────────────────
async function sendEmailOtp(email: string, otp: string): Promise<{ devMode: boolean }> {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
        // Dev mode: no credentials — caller will display OTP on-screen
        console.info(`[OTP-DEV] Email OTP for ${email}: ${otp}`);
        return { devMode: true };
    }

    const resend = new Resend(resendApiKey);

    const { data, error } = await resend.emails.send({
        from: 'Nourish Connect <onboarding@resend.dev>', // Resend sandbox default
        to: email, // Note: In sandbox mode, this must be the email you registered Resend with!
        subject: `Your Nourish Connect OTP: ${otp}`,
        html: `
      <div style="font-family:Inter,sans-serif;max-width:500px;margin:auto;background:#ffffff;border-radius:16px;padding:0;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="background:#f97316;padding:28px 32px;">
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">🔐 Nourish Connect</h1>
          <p style="color:#ffedd5;margin:4px 0 0;font-size:13px;">Password Reset Verification</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#374151;font-size:15px;margin-top:0;">Hi there! Use the one-time code below to reset your password. This code expires in <strong>10 minutes</strong>.</p>
          <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;padding:24px 32px;text-align:center;margin:24px 0;">
            <span style="font-size:42px;font-weight:900;letter-spacing:14px;color:#ea580c;font-family:monospace;">${otp}</span>
          </div>
          <p style="color:#6b7280;font-size:13px;">If you didn't request this, you can safely ignore this email. <strong>Never share this code with anyone.</strong></p>
        </div>
        <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:11px;margin:0;">© 2025 Nourish Connect · Connecting donors with those in need</p>
        </div>
      </div>
    `,
    });

    if (error) {
        throw new Error(error.message || 'Failed to send email via Resend');
    }

    return { devMode: false };
}

// ── SMS OTP ───────────────────────────────────────────────────────────────────
async function sendSmsOtp(phone: string, otp: string): Promise<{ devMode: boolean }> {
    const apiKey = process.env.FAST2SMS_API_KEY;

    if (!apiKey) {
        console.info(`[OTP-DEV] SMS OTP for ${phone}: ${otp}`);
        return { devMode: true };
    }

    const number = normalisePhone(phone);
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: { authorization: apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ route: 'otp', variables_values: otp, numbers: number }),
    });

    const data = await response.json();
    if (!data.return) throw new Error(data.message || 'SMS sending failed');
    return { devMode: false };
}

// ── API handler ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const { contact, otp } = await req.json();
        if (!contact || !otp) {
            return NextResponse.json({ error: 'Missing contact or otp' }, { status: 400 });
        }

        if (isEmail(contact)) {
            const { devMode } = await sendEmailOtp(contact, otp);
            // In dev mode, return the OTP so the UI can show it on-screen
            return NextResponse.json({
                success: true,
                method: 'email',
                devMode,
                ...(devMode ? { devOtp: otp } : {}),
            });
        }

        if (isPhone(contact)) {
            const { devMode } = await sendSmsOtp(contact, otp);
            return NextResponse.json({
                success: true,
                method: 'sms',
                devMode,
                ...(devMode ? { devOtp: otp } : {}),
            });
        }

        return NextResponse.json(
            { error: 'Enter a valid email address or 10-digit Indian mobile number (e.g. 9876543210).' },
            { status: 400 }
        );
    } catch (err: any) {
        console.error('[send-otp]', err);
        return NextResponse.json({ error: err.message || 'Failed to send OTP' }, { status: 500 });
    }
}
