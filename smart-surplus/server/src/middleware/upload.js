import multer from 'multer';
import fs from 'fs';
import path from 'path';

const uploadsDir = path.resolve(process.cwd(), 'uploads');

function ensureUploadsDir() {
	if (!fs.existsSync(uploadsDir)) {
		fs.mkdirSync(uploadsDir, { recursive: true });
	}
}

ensureUploadsDir();

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadsDir);
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname) || '.jpg';
		const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
		cb(null, name);
	}
});

export const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'));
		cb(null, true);
	}
});