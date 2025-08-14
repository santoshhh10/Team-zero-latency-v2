import express from 'express';
import { User } from '../models/User.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signJwt } from '../utils/jwt.js';
import { requireAuth } from '../middleware/auth.js';

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