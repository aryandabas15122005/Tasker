import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { sendOtpEmail, getMailerStatus } from '../mailer';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const IS_PROD = process.env.NODE_ENV === 'production';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

router.post('/send-otp', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otpVerification.upsert({
      where: { email: normalizedEmail },
      update: { otp, expiresAt },
      create: { email: normalizedEmail, otp, expiresAt }
    });

    if (!IS_PROD) {
      console.log(`[auth] DEV OTP for ${normalizedEmail}: ${otp}`);
    }

    // Fire-and-forget: never make the HTTP response wait on SMTP.
    sendOtpEmail({ to: normalizedEmail, otp });

    const payload: Record<string, unknown> = {
      message: 'If the email is valid, a verification code has been sent. It expires in 10 minutes.'
    };
    if (!IS_PROD) payload.devOtp = otp;

    return res.json(payload);
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/signup', async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, role, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: 'Missing required fields including OTP' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otpRecord = await prisma.otpVerification.findUnique({ where: { email: normalizedEmail } });
    if (!otpRecord) {
      return res.status(400).json({ message: 'No OTP found for this email. Please request a new one.' });
    }

    if (otpRecord.otp !== String(otp).trim()) {
      return res.status(400).json({ message: 'Invalid OTP code.' });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
      },
    });

    await prisma.otpVerification.delete({ where: { email: normalizedEmail } });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    return res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin escape hatch: returns the most recent un-expired OTP for a given email
// plus mailer health, gated by ADMIN_SECRET. Only enabled if the env var is set.
// Useful when Gmail SMTP fails and you need to read the OTP without digging logs.
router.get('/admin/peek-otp', async (req: Request, res: Response): Promise<any> => {
  const required = process.env.ADMIN_SECRET;
  if (!required) {
    return res.status(404).json({ message: 'Not found' });
  }
  const provided = req.header('x-admin-secret');
  if (provided !== required) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const email = String(req.query.email || '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ message: 'email query parameter is required' });
  }

  const record = await prisma.otpVerification.findUnique({ where: { email } });
  return res.json({
    email,
    otp: record?.otp || null,
    expiresAt: record?.expiresAt || null,
    expired: record ? record.expiresAt < new Date() : null,
    mailer: getMailerStatus()
  });
});

// Debug route to check mailer status easily
router.get('/mailer-status', (req: Request, res: Response) => {
  const secret = process.env.ADMIN_SECRET;
  if (req.query.secret !== secret) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  return res.json(getMailerStatus());
});

router.post('/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
