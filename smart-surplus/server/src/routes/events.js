import express from 'express';
import mongoose from 'mongoose';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Event } from '../models/Event.js';

const router = express.Router();

router.get('/', async (req, res) => {
	try {
		const events = await Event.find({}).sort({ startTime: 1 }).lean();
		res.json({ events });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

router.get('/my', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
	try {
		const events = await Event.find({ organizer: req.user._id }).sort({ startTime: -1 }).lean();
		res.json({ events });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

router.post('/', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
	try {
		const { title, location, startTime, endTime, expectedSurplusPortions, notes } = req.body;
		if (!title || !startTime || !endTime) return res.status(400).json({ error: 'Missing required fields' });
		const event = await Event.create({
			title,
			organizer: req.user._id,
			location,
			startTime: new Date(startTime),
			endTime: new Date(endTime),
			expectedSurplusPortions: expectedSurplusPortions || 0,
			notes
		});
		res.status(201).json({ event });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

export default router;