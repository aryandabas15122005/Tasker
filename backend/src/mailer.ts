import { Resend } from 'resend';

export interface MailerStatus {
  lastSuccessAt: Date | null;
  lastFailureAt: Date | null;
  lastFailureMessage: string | null;
  lastFailureCode: string | null;
  successCount: number;
  failureCount: number;
}

const status: MailerStatus = {
  lastSuccessAt: null,
  lastFailureAt: null,
  lastFailureMessage: null,
  lastFailureCode: null,
  successCount: 0,
  failureCount: 0
};

export function getMailerStatus(): MailerStatus {
  return { ...status };
}

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export interface SendOtpEmailArgs {
  to: string;
  otp: string;
}

export function sendOtpEmail({ to, otp }: SendOtpEmailArgs): void {
  void sendWithResend(to, otp).catch((err) => {
    status.lastFailureAt = new Date();
    status.lastFailureMessage = err?.message || String(err);
    status.failureCount += 1;
    console.error(`[mailer] Resend failure for ${to}: ${status.lastFailureMessage}`);
  });
}

async function sendWithResend(to: string, otp: string): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.warn('[mailer] RESEND_API_KEY not configured — skipping email send.');
    return;
  }

  const { error } = await resend.emails.send({
    from: 'Tasker <onboarding@resend.dev>', // Free tier default
    to,
    subject: 'Your Tasker Verification Code',
    html: `<div style="font-family: sans-serif; padding: 40px; background-color: #f0f4f3; text-align: center;">
      <div style="background-color: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); max-width: 400px; margin: 0 auto;">
        <h1 style="color: #0f766e; font-family: 'Space Grotesk', sans-serif; margin-bottom: 20px;">Tasker</h1>
        <p style="color: #5f7a73; font-size: 16px;">Hello! Use the code below to verify your account:</p>
        <div style="background-color: #e8efed; padding: 20px; border-radius: 12px; margin: 30px 0;">
          <span style="color: #0f766e; font-size: 36px; font-weight: 700; letter-spacing: 8px;">${otp}</span>
        </div>
        <p style="color: #5f7a73; font-size: 14px;">This code will expire in 10 minutes.</p>
      </div>
    </div>`
  });

  if (error) {
    throw error;
  }

  status.lastSuccessAt = new Date();
  status.successCount += 1;
  console.log(`[mailer] OTP email sent to ${to} via Resend.`);
}
