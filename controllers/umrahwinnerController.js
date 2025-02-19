const UmrahhWinner = require("../models/umrahhWinners"); // Import the UmrahhWinner model

const getAllUmrahhWinners = async (req, res) => {
    try {
      const winners = await UmrahhWinner.findAll(); // Get all winners
  
      // Respond with all winners
      res.status(200).json({
        winners,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error fetching winners.",
        error: error.message,
      });
    }
  };

  module.exports = {
    getAllUmrahhWinners
  }