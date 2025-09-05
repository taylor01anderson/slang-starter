const express = require('express');
const multer = require('multer');
const { create } = require('ipfs-http-client');
const NFT = require('../models/NFT');
const User = require('../models/User');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50000000, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (
      process.env.ALLOWED_FILE_TYPES ||
      'audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/flac'
    ).split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  },
});

// IPFS client configuration
const ipfsClient = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization:
      process.env.IPFS_PROJECT_ID && process.env.IPFS_PROJECT_SECRET
        ? `Basic ${Buffer.from(
            `${process.env.IPFS_PROJECT_ID}:${process.env.IPFS_PROJECT_SECRET}`
          ).toString('base64')}`
        : undefined,
  },
});

// Auth middleware (simplified)
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
    });
  }

  try {
    // In a real implementation, verify JWT token here
    req.user = { _id: 'mock_user_id' }; // Mock user for demo
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

// POST /api/upload/audio
router.post(
  '/audio',
  authenticateToken,
  upload.single('audio'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No audio file provided',
        });
      }

      // Upload to IPFS
      const fileBuffer = req.file.buffer;
      const ipfsResult = await ipfsClient.add(fileBuffer);
      const ipfsHash = ipfsResult.path;

      res.json({
        success: true,
        message: 'Audio file uploaded successfully',
        data: {
          ipfsHash,
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype,
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload audio file',
      });
    }
  }
);

// POST /api/upload/cover
router.post(
  '/cover',
  authenticateToken,
  upload.single('cover'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No cover image provided',
        });
      }

      // Validate image file
      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          message: 'Only image files are allowed for cover art',
        });
      }

      // Upload to IPFS
      const fileBuffer = req.file.buffer;
      const ipfsResult = await ipfsClient.add(fileBuffer);
      const ipfsHash = ipfsResult.path;

      res.json({
        success: true,
        message: 'Cover image uploaded successfully',
        data: {
          ipfsHash,
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype,
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload cover image',
      });
    }
  }
);

// POST /api/upload/metadata
router.post('/metadata', authenticateToken, async (req, res) => {
  try {
    const metadata = req.body;

    // Upload metadata to IPFS
    const metadataBuffer = Buffer.from(JSON.stringify(metadata));
    const ipfsResult = await ipfsClient.add(metadataBuffer);
    const ipfsHash = ipfsResult.path;

    res.json({
      success: true,
      message: 'Metadata uploaded successfully',
      data: {
        ipfsHash,
        metadata,
      },
    });
  } catch (error) {
    console.error('Metadata upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload metadata',
    });
  }
});

module.exports = router;
