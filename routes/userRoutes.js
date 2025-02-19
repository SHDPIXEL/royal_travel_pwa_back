const express = require('express');
const {order, orderSuccess,generateInvoice } = require('../controllers/usercontroller');
// add generateInvoice above before running api 

const router = express.Router();

// Routes for phone number and OTP-based login

router.post('/payment/order',order)
router.post('/payment/success',orderSuccess)
router.get("/invoice/:orderId", generateInvoice); // New invoice API


module.exports = router;