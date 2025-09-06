// routes/videoRoutes.js
import express from 'express';
import { uploadVideo, getVideoStream } from '../controllers/videoController.js';
import multer from 'multer';


const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload-video', upload.single('video'), uploadVideo);
router.get('/:id', getVideoStream);

export default router;