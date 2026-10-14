import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { Request } from 'express';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '-').substring(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `scooter-${cleanBase}-${uniqueSuffix}${ext}`);
  }
});

// File filter (images only, supporting all mobile browsers and formats)
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.heic', '.heif', '.bmp', '.svg'];
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  const isImageMime = mime.startsWith('image/');
  const isImageExt = allowedExts.includes(ext);
  const isOctetStreamWithImageExt = (mime === 'application/octet-stream' || mime === 'binary/octet-stream') && isImageExt;

  if (isImageMime || isImageExt || isOctetStreamWithImageExt) {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo inválido. Por favor envie uma imagem (JPG, PNG, WEBP, GIF ou HEIC).'));
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25 MB limit
  }
});
