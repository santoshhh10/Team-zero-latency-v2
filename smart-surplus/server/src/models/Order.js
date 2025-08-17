import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
	{
		foodItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem', required: true, index: true },
		buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // convenience
		quantity: { type: Number, default: 1 },
		status: { type: String, enum: ['RESERVED', 'COLLECTED', 'CANCELLED', 'EXPIRED'], default: 'RESERVED', index: true },
		qrSecret: { type: String, required: true },
		qrPayload: { type: String, required: true }
	},
	{ timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);