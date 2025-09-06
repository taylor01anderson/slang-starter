import express from 'express';
import NFT from '../models/NFT.js';
import User from '../models/User.js';
const router = express.Router();

// GET /api/marketplace/featured - Get featured NFTs
router.get('/featured', async (req, res) => {
  try {
    const featuredNFTs = await NFT.find({
      status: 'listed',
      'pricing.isForSale': true,
    })
      .populate('creator', 'username walletAddress avatar isVerified')
      .populate('owner', 'username walletAddress avatar isVerified')
      .sort({ 'stats.views': -1, createdAt: -1 })
      .limit(6)
      .exec();

    res.json({
      success: true,
      data: featuredNFTs,
    });
  } catch (error) {
    console.error('Get featured NFTs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// GET /api/marketplace/trending - Get trending NFTs
router.get('/trending', async (req, res) => {
  try {
    const trendingNFTs = await NFT.find({
      status: 'listed',
      'pricing.isForSale': true,
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
    })
      .populate('creator', 'username walletAddress avatar isVerified')
      .populate('owner', 'username walletAddress avatar isVerified')
      .sort({ 'stats.plays': -1, 'stats.likes': -1 })
      .limit(8)
      .exec();

    res.json({
      success: true,
      data: trendingNFTs,
    });
  } catch (error) {
    console.error('Get trending NFTs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// GET /api/marketplace/recent - Get recently listed NFTs
router.get('/recent', async (req, res) => {
  try {
    const recentNFTs = await NFT.find({
      status: 'listed',
      'pricing.isForSale': true,
    })
      .populate('creator', 'username walletAddress avatar isVerified')
      .populate('owner', 'username walletAddress avatar isVerified')
      .sort({ updatedAt: -1 })
      .limit(10)
      .exec();

    res.json({
      success: true,
      data: recentNFTs,
    });
  } catch (error) {
    console.error('Get recent NFTs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// GET /api/marketplace/stats - Get marketplace statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalNFTs, totalUsers, totalSales, totalVolume] = await Promise.all([
      NFT.countDocuments({ status: { $in: ['minted', 'listed', 'sold'] } }),
      User.countDocuments(),
      NFT.aggregate([{ $unwind: '$sales' }, { $count: 'totalSales' }]),
      NFT.aggregate([
        { $unwind: '$sales' },
        { $group: { _id: null, totalVolume: { $sum: '$sales.price' } } },
      ]),
    ]);

    const stats = {
      totalNFTs,
      totalUsers,
      totalSales: totalSales[0]?.totalSales || 0,
      totalVolume: totalVolume[0]?.totalVolume || 0,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get marketplace stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// GET /api/marketplace/genres - Get all genres with counts
router.get('/genres', async (req, res) => {
  try {
    const genres = await NFT.aggregate([
      { $match: { status: { $in: ['minted', 'listed'] } } },
      { $group: { _id: '$metadata.genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: genres.map((g) => ({ genre: g._id, count: g.count })),
    });
  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// GET /api/marketplace/search - Search NFTs
router.get('/search', async (req, res) => {
  try {
    const {
      q,
      page = 1,
      limit = 12,
      genre,
      minPrice,
      maxPrice,
      sortBy = 'relevance',
    } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    // Build search filter
    const searchFilter = {
      status: { $in: ['minted', 'listed'] },
      $or: [
        { name: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { artist: new RegExp(q, 'i') },
        { 'metadata.tags': new RegExp(q, 'i') },
      ],
    };

    // Add additional filters
    if (genre) searchFilter['metadata.genre'] = new RegExp(genre, 'i');
    if (minPrice || maxPrice) {
      searchFilter['pricing.currentPrice'] = {};
      if (minPrice)
        searchFilter['pricing.currentPrice'].$gte = parseFloat(minPrice);
      if (maxPrice)
        searchFilter['pricing.currentPrice'].$lte = parseFloat(maxPrice);
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'price_low':
        sort = { 'pricing.currentPrice': 1 };
        break;
      case 'price_high':
        sort = { 'pricing.currentPrice': -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'popular':
        sort = { 'stats.views': -1, 'stats.likes': -1 };
        break;
      default:
        sort = { score: { $meta: 'textScore' } };
    }

    const nfts = await NFT.find(searchFilter)
      .populate('creator', 'username walletAddress avatar isVerified')
      .populate('owner', 'username walletAddress avatar isVerified')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await NFT.countDocuments(searchFilter);

    res.json({
      success: true,
      data: {
        nfts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
        },
        searchQuery: q,
      },
    });
  } catch (error) {
    console.error('Search NFTs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

export default router;
