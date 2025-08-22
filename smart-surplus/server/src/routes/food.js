import express from 'express';
import mongoose from 'mongoose';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { FoodItem } from '../models/FoodItem.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { getIo } from '../realtime/io.js';
import { v4 as uuidv4 } from 'uuid';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', async (req, res) => {
	try {
		const { q, owner, status = 'AVAILABLE', tag, page = 1, limit = 20 } = req.query;
		const find = {};
		if (status) find.status = status;
		if (owner && mongoose.isValidObjectId(owner)) find.owner = owner;
		if (tag) find.qualityTag = tag;
		if (q) find.title = { $regex: q, $options: 'i' };
		const skip = (Number(page) - 1) * Number(limit);
		const [items, total] = await Promise.all([
			FoodItem.find(find).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
			FoodItem.countDocuments(find)
		]);
		res.json({ items, total, page: Number(page), limit: Number(limit) });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});
router.post('/:id/decrement', requireAuth, requireRole('canteen', 'organizer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const amount = Math.max(1, Number(req.body.amount) || 1);
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });

    const item = await FoodItem.findById(id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (String(item.owner) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (item.status === 'EXPIRED') return res.status(400).json({ error: 'Item expired' });

    item.quantity = Math.max(0, item.quantity - amount);
    if (item.quantity <= 0) item.status = 'SOLD_OUT';
    await item.save();

    res.json({ item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/mine', requireAuth, async (req, res) => {
	try {
		const items = await FoodItem.find({ owner: req.user._id }).sort({ createdAt: -1 }).lean();
		res.json({ items });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

router.post('/', requireAuth, requireRole('canteen', 'organizer', 'admin'), upload.single('image'), async (req, res) => {
	try {
		const { title, description, quantity, unit, price, qualityTag, bestBefore, location, preorderAllowed, discountPercent } = req.body;
		if (!title || !quantity || !bestBefore) return res.status(400).json({ error: 'Missing required fields' });

		const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

		const item = await FoodItem.create({
			title,
			description,
			owner: req.user._id,
			quantity,
			unit: unit || 'portion',
			price: price || 0,
			qualityTag: qualityTag || 'SAFE',
			bestBefore: new Date(bestBefore),
			location,
			preorderAllowed: preorderAllowed !== false,
			discountPercent: discountPercent || 0,
			imageUrl
		});
		getIo()?.emit('new-listing', { item });
		res.status(201).json({ item });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

router.put('/:id', requireAuth, upload.single('image'), async (req, res) => {
	try {
		const { id } = req.params;
		if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
		const existing = await FoodItem.findById(id);
		if (!existing) return res.status(404).json({ error: 'Not found' });
		if (existing.owner.toString() !== String(req.user._id) && req.user.role !== 'admin') {
			return res.status(403).json({ error: 'Forbidden' });
		}
		const updatable = ['title', 'description', 'quantity', 'unit', 'price', 'qualityTag', 'bestBefore', 'location', 'preorderAllowed', 'discountPercent', 'status'];
		for (const key of updatable) {
			if (key in req.body) existing[key] = req.body[key];
		}
		if (req.file) {
			existing.imageUrl = `/uploads/${req.file.filename}`;
		}
		await existing.save();
		res.json({ item: existing });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

router.post('/:id/reserve', requireAuth, requireRole('student', 'admin'), async (req, res) => {
	try {
		const { id } = req.params;
		if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
		const item = await FoodItem.findById(id);
		if (!item) return res.status(404).json({ error: 'Item not found' });
		if (item.status !== 'AVAILABLE') return res.status(400).json({ error: 'Item not available' });
		if (new Date(item.bestBefore) <= new Date()) return res.status(400).json({ error: 'Item expired' });
		if (item.quantity <= 0) return res.status(400).json({ error: 'Sold out' });

		const requested = Number(req.body.quantity) || 1;
		const quantity = Math.max(1, Math.min(requested, item.quantity));

		const secret = uuidv4();
		const order = await Order.create({
			foodItem: item._id,
			buyer: req.user._id,
			owner: item.owner,
			quantity,
			qrSecret: secret,
			qrPayload: JSON.stringify({ orderId: '', secret: secret })
		});
		// Fill orderId now that it exists
		order.qrPayload = JSON.stringify({ orderId: String(order._id), secret });
		await order.save();
		item.quantity = item.quantity - quantity;
		if (item.quantity <= 0) item.status = 'SOLD_OUT';
		await item.save();
		getIo()?.to(`user:${item.owner}`).emit('new-reservation', { orderId: order._id, itemId: item._id });
		res.status(201).json({ order: { id: order._id, status: order.status, quantity: order.quantity }, qrPayload: order.qrPayload });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

export default router;