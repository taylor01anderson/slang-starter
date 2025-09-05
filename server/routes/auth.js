const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Middleware to verify wallet signature (simplified for demo)
const verifyWalletSignature = async (req, res, next) => {
  try {
    const { walletAddress, signature, message } = req.body;

    // In a real implementation, you would verify the signature here
    // using web3.eth.personal.ecRecover or similar

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required',
      });
    }

    req.walletAddress = walletAddress.toLowerCase();
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid signature',
    });
  }
};

// Auth middleware
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
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret'
    );
    req.user = await User.findById(decoded.userId);
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

// POST /api/auth/login
router.post('/login', verifyWalletSignature, async (req, res) => {
  try {
    const { walletAddress } = req;

    // Find or create user
    let user = await User.findOne({ walletAddress });

    if (!user) {
      user = new User({
        walletAddress,
        username: `User${walletAddress.slice(-6)}`,
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        isVerified: user.isVerified,
        stats: user.stats,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        isVerified: user.isVerified,
        socialLinks: user.socialLinks,
        stats: user.stats,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email, bio, socialLinks } = req.body;
    const user = req.user;

    // Update user profile
    if (username) user.username = username;
    if (email) user.email = email;
    if (bio) user.bio = bio;
    if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        isVerified: user.isVerified,
        socialLinks: user.socialLinks,
        stats: user.stats,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;
