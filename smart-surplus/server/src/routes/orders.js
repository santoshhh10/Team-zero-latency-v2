import express from 'express';
import mongoose from 'mongoose';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Order } from '../models/Order.js';
import { FoodItem } from '../models/FoodItem.js';
import { User } from '../models/User.js';
import { config } from '../config.js';

const router = express.Router();

router.get('/my', requireAuth, async (req, res) => {
	try {
		const orders = await Order.find({ buyer: req.user._id }).populate('foodItem').sort({ createdAt: -1 }).lean();
		res.json({ orders });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

router.get('/owner', requireAuth, requireRole('canteen', 'organizer', 'admin'), async (req, res) => {
	try {
		const orders = await Order.find({ owner: req.user._id }).populate('foodItem buyer').sort({ createdAt: -1 }).lean();
		res.json({ orders });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

router.post('/verify', requireAuth, requireRole('canteen', 'organizer', 'admin'), async (req, res) => {
	try {
		const { qrText, orderId: bodyOrderId, token } = req.body;
		let parsedOrderId = bodyOrderId;
		let parsedToken = token;
		if (!parsedOrderId && !parsedToken && qrText) {
			try {
				const payload = JSON.parse(qrText);
				parsedOrderId = payload.orderId;
				parsedToken = payload.token || payload.secret;
			} catch {
				return res.status(400).json({ error: 'Invalid token payload' });
			}
		}
		let order = null;
		if (parsedOrderId) {
			if (!mongoose.isValidObjectId(parsedOrderId)) return res.status(400).json({ error: 'Invalid token' });
			order = await Order.findById(parsedOrderId);
		} else if (parsedToken) {
			order = await Order.findOne({ owner: req.user._id, status: 'RESERVED', qrSecret: parsedToken });
		}
		if (!order) return res.status(404).json({ error: 'Order not found' });
		if (String(order.owner) !== String(req.user._id)) return res.status(403).json({ error: 'Forbidden' });
		if (order.status !== 'RESERVED') return res.status(400).json({ error: 'Order not in valid state' });
		if (parsedToken && order.qrSecret !== parsedToken) return res.status(400).json({ error: 'Token mismatch' });
		const item = await FoodItem.findById(order.foodItem);
		if (!item) return res.status(404).json({ error: 'Item not found' });
		// Decrement stock now on claim
		if (item.quantity < order.quantity) return res.status(400).json({ error: 'Insufficient stock' });
		item.quantity -= order.quantity;
		if (item.quantity <= 0) item.status = 'SOLD_OUT';
		await item.save();
		order.status = 'COLLECTED';
		await order.save();
		// Reward green points
		const buyer = await User.findById(order.buyer);
		buyer.greenPoints = (buyer.greenPoints || 0) + (order.quantity * 5);
		await buyer.save();
		res.json({ ok: true, orderId: order._id });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

router.post('/:id/cancel', requireAuth, async (req, res) => {
	try {
		const { id } = req.params;
		if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
		const order = await Order.findById(id);
		if (!order) return res.status(404).json({ error: 'Not found' });
		if (String(order.buyer) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
		if (order.status !== 'RESERVED') return res.status(400).json({ error: 'Cannot cancel' });
		order.status = 'CANCELLED';
		await order.save();
		const item = await FoodItem.findById(order.foodItem);
		if (item) {
			item.quantity += order.quantity;
			if (item.status === 'SOLD_OUT' && item.quantity > 0) item.status = 'AVAILABLE';
			await item.save();
		}
		res.json({ ok: true });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

export default router;