const express = require('express');
const { body, validationResult } = require('express-validator');
const NFT = require('../models/NFT');
const User = require('../models/User');
const router = express.Router();

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

// GET /api/nfts - Get all NFTs with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      genre,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      forSale,
    } = req.query;

    // Build filter object
    const filter = { status: 'minted' };

    if (genre) filter['metadata.genre'] = new RegExp(genre, 'i');
    if (forSale === 'true') filter['pricing.isForSale'] = true;
    if (minPrice || maxPrice) {
      filter['pricing.currentPrice'] = {};
      if (minPrice) filter['pricing.currentPrice'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['pricing.currentPrice'].$lte = parseFloat(maxPrice);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const nfts = await NFT.find(filter)
      .populate('creator', 'username walletAddress avatar isVerified')
      .populate('owner', 'username walletAddress avatar isVerified')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await NFT.countDocuments(filter);

    res.json({
      success: true,
      data: {
        nfts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get NFTs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// GET /api/nfts/:id - Get single NFT by ID
router.get('/:id', async (req, res) => {
  try {
    const nft = await NFT.findById(req.params.id)
      .populate(
        'creator',
        'username walletAddress avatar isVerified socialLinks'
      )
      .populate('owner', 'username walletAddress avatar isVerified')
      .populate('sales.from', 'username walletAddress')
      .populate('sales.to', 'username walletAddress');

    if (!nft) {
      return res.status(404).json({
        success: false,
        message: 'NFT not found',
      });
    }

    // Increment view count
    nft.stats.views += 1;
    await nft.save();

    res.json({
      success: true,
      data: nft,
    });
  } catch (error) {
    console.error('Get NFT error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// POST /api/nfts - Create new NFT
router.post(
  '/',
  authenticateToken,
  [
    body('name').notEmpty().trim().isLength({ max: 100 }),
    body('description').notEmpty().trim().isLength({ max: 1000 }),
    body('artist').notEmpty().trim(),
    body('files.audio.ipfsHash').notEmpty(),
    body('blockchain.contractAddress').notEmpty(),
    body('blockchain.tokenId').notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const {
        name,
        description,
        artist,
        metadata,
        files,
        blockchain,
        pricing,
      } = req.body;

      // Create new NFT
      const nft = new NFT({
        tokenId: `${blockchain.contractAddress}-${blockchain.tokenId}`,
        name,
        description,
        artist,
        creator: req.user._id,
        owner: req.user._id,
        metadata,
        files,
        blockchain,
        pricing: pricing || {},
        status: 'minted',
      });

      await nft.save();

      // Update user stats
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'stats.totalMinted': 1 },
      });

      res.status(201).json({
        success: true,
        message: 'NFT created successfully',
        data: nft,
      });
    } catch (error) {
      console.error('Create NFT error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

// PUT /api/nfts/:id/list - List NFT for sale
router.put(
  '/:id/list',
  authenticateToken,
  [
    body('price').isFloat({ min: 0 }),
    body('currency').optional().isIn(['ETH', 'MATIC']),
    body('saleType').optional().isIn(['fixed', 'auction']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const { price, currency = 'ETH', saleType = 'fixed' } = req.body;

      const nft = await NFT.findById(req.params.id);
      if (!nft) {
        return res.status(404).json({
          success: false,
          message: 'NFT not found',
        });
      }

      // Check ownership
      if (nft.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not own this NFT',
        });
      }

      // Update pricing
      nft.pricing = {
        currentPrice: price,
        currency,
        isForSale: true,
        saleType,
      };
      nft.status = 'listed';

      await nft.save();

      res.json({
        success: true,
        message: 'NFT listed for sale successfully',
        data: nft,
      });
    } catch (error) {
      console.error('List NFT error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

// PUT /api/nfts/:id/unlist - Remove NFT from sale
router.put('/:id/unlist', authenticateToken, async (req, res) => {
  try {
    const nft = await NFT.findById(req.params.id);
    if (!nft) {
      return res.status(404).json({
        success: false,
        message: 'NFT not found',
      });
    }

    // Check ownership
    if (nft.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not own this NFT',
      });
    }

    // Update pricing
    nft.pricing.isForSale = false;
    nft.status = 'minted';

    await nft.save();

    res.json({
      success: true,
      message: 'NFT removed from sale successfully',
      data: nft,
    });
  } catch (error) {
    console.error('Unlist NFT error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// GET /api/nfts/user/:userId - Get user's NFTs
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;

    const nfts = await NFT.find({
      $or: [{ creator: req.params.userId }, { owner: req.params.userId }],
    })
      .populate('creator', 'username walletAddress avatar isVerified')
      .populate('owner', 'username walletAddress avatar isVerified')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await NFT.countDocuments({
      $or: [{ creator: req.params.userId }, { owner: req.params.userId }],
    });

    res.json({
      success: true,
      data: {
        nfts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
        },
      },
    });
  } catch (error) {
    console.error('Get user NFTs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;
