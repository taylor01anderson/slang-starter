import express from 'express';
import multer from 'multer';
import { uploadFile } from '../services/ipfsService.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/audio', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: 'No audio file provided' });
  }
  try {
    const ipfsResult = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );
    res.json({ success: true, ...ipfsResult });
  } catch (e) {
    res.status(500).json({ success: false, message: 'IPFS upload failed.' });
  }
});

export default router;
