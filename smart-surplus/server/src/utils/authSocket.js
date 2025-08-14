import { verifyJwt } from './jwt.js';

export function identifySocketUser(socket, token) {
	const decoded = verifyJwt(token);
	if (decoded?.userId) {
		socket.join(`user:${decoded.userId}`);
	}
}