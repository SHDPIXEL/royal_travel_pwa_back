const UmrahhWinner = require("../models/umrahhWinners"); // Import the UmrahhWinner model
const PaymentDetails = require("../models/payment-details"); // Adjust the path to your model
const User = require("../models/user");

//{UmrahhWinner}
const createUmrahhWinner = async (req, res) => {
  try {
    const { name, date } = req.body; // Get name from request body

    // Create a new UmrahhWinner entry
    const newWinner = await UmrahhWinner.create({
      name,
      date: date || undefined, // If date is provided, use it, otherwise default to current date/time
    });

    // Respond with the created winner
    res.status(201).json({
      message: "Winner created successfully!",
      winner: newWinner,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating winner.",
      error: error.message,
    });
  }
};

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

const getUmrahhWinnerById = async (req, res) => {
  try {
    const { id } = req.params; // Get ID from request params
    const winner = await UmrahhWinner.findByPk(id); // Find winner by primary key (ID)

    if (!winner) {
      return res.status(404).json({
        message: "Winner not found",
      });
    }

    // Respond with the found winner
    res.status(200).json({
      winner,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching winner.",
      error: error.message,
    });
  }
};

const updateUmrahhWinner = async (req, res) => {
  try {
    const { id } = req.params; // Get ID from request params
    const { name, date } = req.body; // Get name and date from request body

    const winner = await UmrahhWinner.findByPk(id); // Find the winner by ID

    if (!winner) {
      return res.status(404).json({
        message: "Winner not found",
      });
    }

    // Update the winner details
    winner.name = name || winner.name; // Update name if provided
    winner.date = date || winner.date; // Update date if provided, otherwise keep the existing date

    await winner.save(); // Save updated winner

    // Respond with the updated winner
    res.status(200).json({
      message: "Winner updated successfully!",
      winner,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error updating winner.",
      error: error.message,
    });
  }
};

const deleteUmrahhWinner = async (req, res) => {
  try {
    const { id } = req.params; // Get ID from request params

    const winner = await UmrahhWinner.findByPk(id); // Find winner by ID

    if (!winner) {
      return res.status(404).json({
        message: "Winner not found",
      });
    }

    // Delete the winner
    await winner.destroy();

    // Respond with success message
    res.status(200).json({
      message: "Winner deleted successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error deleting winner.",
      error: error.message,
    });
  }
};

//{paymentDetails}
const getAllPayments = async (req, res) => {
  try {
    // Fetch all payment details from the database
    const paymentDetails = await PaymentDetails.findAll();

    // If no payment details found, return an appropriate message
    if (paymentDetails.length === 0) {
      return res.status(404).json({
        message: "No payment details found.",
      });
    }

    // Respond with the fetched payment details
    res.status(200).json({
      message: "Payment details retrieved successfully.",
      data: paymentDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error retrieving payment details.",
      error: error.message,
    });
  }
};

//{users}
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll(); // This will fetch all users from the User model
    
    // If there are no users, send a message indicating that
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }

    // Send the list of users as a response
    res.status(200).json({
      message: "Users retrieved successfully.",
      users: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching users.", error: error.message });
  }
};
module.exports = {
  createUmrahhWinner,//{UmrahhWinner}
  getAllUmrahhWinners,
  getUmrahhWinnerById,
  updateUmrahhWinner,
  deleteUmrahhWinner,
  getAllPayments,//{paymentDetails}
  getAllUsers,//{users}
};
