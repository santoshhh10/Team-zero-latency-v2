import { FoodItem } from '../models/FoodItem.js';
import { getIo } from '../realtime/io.js';
import { config } from '../config.js';

let intervalHandle = null;

export function scheduleExpiryWatcher() {
	if (intervalHandle) return;
	intervalHandle = setInterval(async () => {
		try {
			const now = new Date();
			// Mark expired
			await FoodItem.updateMany({ bestBefore: { $lte: now }, status: { $ne: 'EXPIRED' } }, { $set: { status: 'EXPIRED' } });
			// Find items nearing expiry
			const threshold = new Date(now.getTime() + config.expiryAlertMinutes * 60 * 1000);
			const nearExpiry = await FoodItem.find({ bestBefore: { $lte: threshold, $gt: now }, status: 'AVAILABLE', expiryAlertSent: { $ne: true } }).lean();
			if (nearExpiry.length) {
				for (const item of nearExpiry) {
					getIo()?.emit('expiry-alert', { itemId: item._id, title: item.title, bestBefore: item.bestBefore, location: item.location });
				}
				await FoodItem.updateMany({ _id: { $in: nearExpiry.map(i => i._id) } }, { $set: { expiryAlertSent: true } });
			}
		} catch (err) {
			console.error('expiryWatcher error', err);
		}
	}, 15000);
}