const express = require('express');
const { body } = require('express-validator');
const { register, login, googleAuth, refreshToken, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['household', 'restaurant', 'ngo']).withMessage('Invalid role'),
], validate, register);

router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], validate, login);

router.post('/google', authLimiter, googleAuth);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);

module.exports = router;
