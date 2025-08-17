import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function signJwt(payload, expiresIn = '7d') {
	return jwt.sign(payload, config.jwtSecret, { expiresIn });
}

export function verifyJwt(token) {
	try {
		return jwt.verify(token, config.jwtSecret);
	} catch (err) {
		return null;
	}
}