import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		location: { type: String },
		startTime: { type: Date, required: true },
		endTime: { type: Date, required: true },
		expectedSurplusPortions: { type: Number, default: 0 },
		notes: { type: String }
	},
	{ timestamps: true }
);

export const Event = mongoose.model('Event', eventSchema);