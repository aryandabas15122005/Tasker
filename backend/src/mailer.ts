import nodemailer, { Transporter } from 'nodemailer';

let cachedTransporter: Transporter | null = null;
let cachedSignature = '';

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

function buildTransporter(): Transporter | null {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.replace(/\s/g, '');
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user, pass },
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 25000,
    // Force IPv4 — Railway's IPv6 path to smtp.gmail.com frequently hangs.
    family: 4,
    // EHLO hostname. Gmail tolerates generic ones, but a stable identifier
    // reduces the chance of rate-limit / spam-score weirdness on Railway.
    name: process.env.MAILER_EHLO_NAME || 'tasker.production',
    tls: {
      servername: 'smtp.gmail.com',
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true
    }
  } as any);
}

function getTransporter(): Transporter | null {
  const signature = `${process.env.EMAIL_USER || ''}|${process.env.EMAIL_PASS || ''}`;
  if (!cachedTransporter || signature !== cachedSignature) {
    cachedTransporter = buildTransporter();
    cachedSignature = signature;
  }
  return cachedTransporter;
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export interface SendOtpEmailArgs {
  to: string;
  otp: string;
}

export function sendOtpEmail({ to, otp }: SendOtpEmailArgs): void {
  // Fire-and-forget so HTTP responses never block on SMTP.
  void sendWithRetry(to, otp).catch((err) => {
    const code = err?.code || err?.responseCode || 'UNKNOWN';
    status.lastFailureAt = new Date();
    status.lastFailureCode = String(code);
    status.lastFailureMessage = err?.message ? String(err.message) : String(err);
    status.failureCount += 1;
    console.error(
      `[mailer] EMAIL_TRANSPORT_DOWN: gave up sending OTP to ${to} (code=${code}): ${status.lastFailureMessage}`
    );
  });
}

async function sendWithRetry(to: string, otp: string, attempts = 3): Promise<void> {
  const from = process.env.EMAIL_FROM?.trim() || process.env.EMAIL_USER?.trim();
  if (!from) {
    console.warn('[mailer] EMAIL_USER not configured — skipping email send.');
    return;
  }

  const mail = {
    from: `Tasker <${from}>`,
    to,
    subject: 'Your Tasker Verification Code',
    text: `Your Tasker verification code is: ${otp}. It will expire in 10 minutes.`,
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
  };

  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn('[mailer] no transporter (missing EMAIL_USER/EMAIL_PASS).');
      return;
    }
    try {
      const info = await transporter.sendMail(mail);
      status.lastSuccessAt = new Date();
      status.successCount += 1;
      console.log(`[mailer] OTP email sent to ${to} (id=${info.messageId}, attempt=${attempt}).`);
      return;
    } catch (err: any) {
      lastError = err;
      const code = err?.code || err?.responseCode;
      console.warn(`[mailer] attempt ${attempt}/${attempts} failed for ${to} (code=${code}): ${err?.message || err}`);

      // Auth failures will never succeed on retry — abort early.
      if (code === 'EAUTH' || err?.responseCode === 535) break;

      // Reset transporter on socket-level failures so the next attempt rebuilds the pool.
      if (['ETIMEDOUT', 'ECONNECTION', 'ESOCKET', 'ECONNRESET'].includes(code)) {
        try { cachedTransporter?.close(); } catch { /* ignore */ }
        cachedTransporter = null;
      }

      if (attempt < attempts) await sleep(500 * attempt);
    }
  }
  throw lastError;
}
