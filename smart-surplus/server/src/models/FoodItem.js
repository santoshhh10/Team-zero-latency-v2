import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		description: { type: String },
		owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // canteen or organizer
		quantity: { type: Number, required: true },
		unit: { type: String, default: 'portion' },
		price: { type: Number, default: 0 },
		qualityTag: { type: String, enum: ['HOT', 'FRESH', 'CHILLED', 'LEFTOVER', 'SAFE'], default: 'SAFE' },
		bestBefore: { type: Date, required: true, index: true },
		status: { type: String, enum: ['AVAILABLE', 'SOLD_OUT', 'EXPIRED', 'ARCHIVED'], default: 'AVAILABLE', index: true },
		location: { type: String },
		preorderAllowed: { type: Boolean, default: true },
		discountPercent: { type: Number, default: 0 },
		expiryAlertSent: { type: Boolean, default: false },
		imageUrl: { type: String }
	},
	{ timestamps: true }
);

export const FoodItem = mongoose.model('FoodItem', foodItemSchema);