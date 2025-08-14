import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config.js';
import { setIo } from './realtime/io.js';
import authRoutes from './routes/auth.js';
import foodRoutes from './routes/food.js';
import orderRoutes from './routes/orders.js';
import eventRoutes from './routes/events.js';
import analyticsRoutes from './routes/analytics.js';
import { scheduleExpiryWatcher } from './jobs/expiryWatcher.js';

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
	cors: {
		origin: config.clientOrigin,
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		credentials: true
	}
});
setIo(io);

io.on('connection', (socket) => {
	// Optional: authenticate via token in handshake auth
	const { token } = socket.handshake.auth || {};
	if (token) {
		try {
			// Lazy import to avoid cycle
			import('./utils/authSocket.js').then(({ identifySocketUser }) => {
				identifySocketUser(socket, token);
			});
		} catch {
			// no-op
		}
	}
});

app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
	res.json({ ok: true, message: 'Smart Surplus API running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/analytics', analyticsRoutes);

async function start() {
	try {
		await mongoose.connect(config.mongoUri, { autoIndex: true });
		console.log('Connected to MongoDB');
		server.listen(config.port, () => {
			console.log(`Server listening on http://localhost:${config.port}`);
		});
		scheduleExpiryWatcher();
	} catch (err) {
		console.error('Failed to start server:', err);
		process.exit(1);
	}
}

start();