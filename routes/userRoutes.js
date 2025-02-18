const express = require('express');
const {order, orderSuccess } = require('../controllers/usercontroller');

const router = express.Router();

// Routes for phone number and OTP-based login

router.post('/payment/order',order)
router.post('/payment/success',orderSuccess)


module.exports = router;