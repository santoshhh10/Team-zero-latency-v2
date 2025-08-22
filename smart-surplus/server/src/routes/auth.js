import express from 'express';
import { User } from '../models/User.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signJwt } from '../utils/jwt.js';
import { requireAuth } from '../middleware/auth.js';
import nodemailer from 'nodemailer';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

const router = express.Router();

router.post('/register', async (req, res) => {
	try {
		const { name, email, password, role, organization, location } = req.body;
		if (!name || !email || !password) {
			return res.status(400).json({ error: 'Missing required fields' });
		}
		const existing = await User.findOne({ email });
		if (existing) return res.status(409).json({ error: 'Email already in use' });
		const passwordHash = await hashPassword(password);
		const user = await User.create({ name, email, passwordHash, role: role || 'student', organization, location });
		const token = signJwt({ userId: user._id, role: user.role });
		res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, greenPoints: user.greenPoints } });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		if (!user) return res.status(401).json({ error: 'Invalid credentials' });
		const ok = await verifyPassword(password, user.passwordHash);
		if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
		const token = signJwt({ userId: user._id, role: user.role });
		res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, greenPoints: user.greenPoints } });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

router.get('/me', requireAuth, async (req, res) => {
	const user = req.user;
	res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, greenPoints: user.greenPoints } });
});

export default router;

// Magic code (email) auth: request code
router.post('/request-code', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email required' });
        let user = await User.findOne({ email });
        if (!user) {
            // minimal signup
            user = await User.create({ name: email.split('@')[0], email, passwordHash: await hashPassword(Math.random().toString(36).slice(2)), role: 'student' });
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.loginCode = code;
        user.loginCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT || 587),
            secure: false,
            auth: process.env.SMTP_USER && process.env.SMTP_PASS ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
        });
        try {
            await transporter.sendMail({
                from: process.env.MAIL_FROM || 'no-reply@smartsurplus.local',
                to: email,
                subject: 'Your SmartSurplus login code',
                text: `Your code is ${code}. It expires in 10 minutes.`
            });
        } catch (e) {
            console.warn('Email send failed, falling back to console code:', code);
        }

        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Verify code and issue JWT
router.post('/verify-code', async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) return res.status(400).json({ error: 'Missing email or code' });
        const user = await User.findOne({ email });
        if (!user || !user.loginCode || !user.loginCodeExpires) return res.status(400).json({ error: 'Invalid code' });
        if (String(user.loginCode) !== String(code)) return res.status(400).json({ error: 'Invalid code' });
        if (new Date(user.loginCodeExpires) < new Date()) return res.status(400).json({ error: 'Code expired' });
        user.loginCode = undefined; user.loginCodeExpires = undefined; await user.save();
        const token = signJwt({ userId: user._id, role: user.role });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, greenPoints: user.greenPoints } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});