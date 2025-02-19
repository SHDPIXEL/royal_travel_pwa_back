const express = require('express');
const {getAllUmrahhWinners } = require('../controllers/umrahwinnerController');

const router = express.Router();

// Routes for phone number and OTP-based login
// Route to get all UmrahhWinners
router.get("/umrahh-winners", getAllUmrahhWinners);


module.exports = router;