import { verifyJwt } from '../utils/jwt.js';
import { User } from '../models/User.js';

export async function requireAuth(req, res, next) {
	const authHeader = req.headers.authorization || '';
	const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
	if (!token) return res.status(401).json({ error: 'Missing token' });
	const decoded = verifyJwt(token);
	if (!decoded) return res.status(401).json({ error: 'Invalid token' });
	const user = await User.findById(decoded.userId).lean();
	if (!user) return res.status(401).json({ error: 'User not found' });
	req.user = user;
	next();
}

export function requireRole(...roles) {
	return (req, res, next) => {
		if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({ error: 'Forbidden' });
		}
		next();
	};
}