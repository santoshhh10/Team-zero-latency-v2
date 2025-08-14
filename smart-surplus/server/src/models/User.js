import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true, index: true },
		passwordHash: { type: String, required: true },
		role: {
			type: String,
			enum: ['student', 'canteen', 'organizer', 'ngo', 'admin'],
			default: 'student',
			index: true
		},
		greenPoints: { type: Number, default: 0 },
		organization: { type: String },
		location: { type: String }
	},
	{ timestamps: true }
);

export const User = mongoose.model('User', userSchema);