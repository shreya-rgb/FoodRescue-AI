const express = require('express');
const { getDashboard, getUsers, verifyUser, banUser } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();
router.use(protect, roleCheck('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id/verify', verifyUser);
router.put('/users/:id/ban', banUser);

module.exports = router;
