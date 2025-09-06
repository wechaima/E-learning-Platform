// middlewares/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/videos/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadVideo = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /mp4|mov|avi|wmv/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Seules les vidéos (MP4, MOV, AVI, WMV) sont autorisées'));
  }
}).single('video');

exports.uploadVideoMiddleware = (req, res, next) => {
  uploadVideo(req, res, function (err) {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};