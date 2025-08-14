import dotenv from 'dotenv';

dotenv.config();

export const config = {
	port: process.env.PORT || 5000,
	jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
	mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_surplus',
	clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
	expiryAlertMinutes: parseInt(process.env.EXPIRY_ALERT_MINUTES || '30', 10),
	carbonKgPerPortion: parseFloat(process.env.CARBON_KG_PER_PORTION || '0.5'),
	waterLitersPerPortion: parseFloat(process.env.WATER_LITERS_PER_PORTION || '500')
};