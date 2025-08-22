import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { FoodItem } from '../models/FoodItem.js';
import { Order } from '../models/Order.js';
import { config } from '../config.js';
import { User } from '../models/User.js';

const router = express.Router();

router.get('/summary', async (req, res) => {
	try {
		const [collectedOrders, activeItems] = await Promise.all([
			Order.find({ status: 'COLLECTED' }).lean(),
			FoodItem.find({ status: 'AVAILABLE' }).lean()
		]);
		const portionsCollected = collectedOrders.reduce((sum, o) => sum + (o.quantity || 1), 0);
		const carbonSavedKg = portionsCollected * config.carbonKgPerPortion;
		const waterSavedLiters = portionsCollected * config.waterLitersPerPortion;
		res.json({ portionsCollected, carbonSavedKg, waterSavedLiters, activeListings: activeItems.length });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
});

export default router;

// Leaderboard (top users by greenPoints)
router.get('/leaderboard', requireAuth, async (req, res) => {
    try {
        const top = await User.find({}).sort({ greenPoints: -1 }).limit(10).select('name greenPoints role').lean();
        res.json({ top });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});