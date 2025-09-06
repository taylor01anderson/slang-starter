import express from 'express';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    res.json({ success: true, message: 'User logged in successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

export default router;
