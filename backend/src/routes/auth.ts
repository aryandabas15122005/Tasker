import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import prisma from '../prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: process.env.EMAIL_PASS?.replace(/\s/g, '')
  },
  debug: true, // Show SMTP conversation in logs
  logger: true // Log information to console
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to take messages');
  }
});

// Helper to generate 6 digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

router.post('/send-otp', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;
    console.log('Received send-otp request for', email);
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store or update OTP
    console.log('Upserting OTP to DB...');
    await prisma.otpVerification.upsert({
      where: { email },
      update: { otp, expiresAt },
      create: { email, otp, expiresAt }
    });
    console.log('OTP upserted successfully. Sending email...');
    console.log(`\n🚀 DEV OTP FOR ${email}: ${otp}\n`);

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
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

    try {
      console.log('Attempting to connect to SMTP server...');
      const sendMailPromise = transporter.sendMail(mailOptions);
      // Increased timeout to 8s for reliability
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP connection timed out')), 8000));
      await Promise.race([sendMailPromise, timeoutPromise]);
      console.log('Email sent successfully via Nodemailer');
    } catch (mailError) {
      console.warn('!!! EMAIL FAILED BUT CONTINUING !!!', mailError);
    }

    console.log('Returning response');
    res.json({ message: 'OTP generated. If email does not arrive, check server logs.', devOtp: otp });
  } catch (error) {
    console.error('Send OTP outer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/signup', async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, role, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: 'Missing required fields including OTP' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Verify OTP
    const otpRecord = await prisma.otpVerification.findUnique({ where: { email } });
    if (!otpRecord) {
      return res.status(400).json({ message: 'No OTP found for this email. Please request a new one.' });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP code.' });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
      },
    });

    // Cleanup used OTP
    await prisma.otpVerification.delete({ where: { email } });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
