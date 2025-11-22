import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Create thumbnails directory
const thumbnailsDir = path.resolve("uploads/thumbnails");
if (!fs.existsSync(thumbnailsDir)) fs.mkdirSync(thumbnailsDir);

// File filter for image uploads
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  }
});

// Create multer upload instance with limits and file filter
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware to process uploaded images (create thumbnails)
const processImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const ext = path.extname(req.file.filename);
    const nameWithoutExt = path.basename(req.file.filename, ext);
    const thumbnailName = `${nameWithoutExt}_thumb${ext}`;
    const thumbnailPath = path.join(thumbnailsDir, thumbnailName);

    // Create thumbnail (max 300x300, maintaining aspect ratio)
    await sharp(req.file.path)
      .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    // Add thumbnail info to request
    req.thumbnail = {
      path: `/uploads/thumbnails/${thumbnailName}`,
      filename: thumbnailName
    };

    next();
  } catch (error) {
    console.error('Image processing error:', error);
    next();
  }
};

export default upload;
export { processImage };