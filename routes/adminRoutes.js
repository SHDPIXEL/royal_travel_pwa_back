const express = require("express");
const { verifyAdminToken } = require("../controllers/authControllerAdmin");
const router = express.Router();
const {
  createUmrahhWinner,//{UmrahhWinner}
  getAllUmrahhWinners,
  getUmrahhWinnerById,
  updateUmrahhWinner,
  deleteUmrahhWinner,
  getAllPayments,//{paymentDetails}
  getPaymentsGraph,
  getAllUsers,//{users}
  updateUserStatus,
  getUsersGraph,
  generateInvoice,//{invoice}
  selectRandomWinner,//{winner's}
  sendMessageToWinner,
} = require("../controllers/adminController"); // Import the controller

router.use(verifyAdminToken);

//{UmrahhWinner}
// Route to create a new UmrahhWinner
router.post("/umrahh-winner", createUmrahhWinner);

// Route to get all UmrahhWinners
router.get("/umrahh-winners", getAllUmrahhWinners);

// Route to get a single UmrahhWinner by ID
router.get("/umrahh-winner/:id", getUmrahhWinnerById);

// Route to update a winner by ID
router.put("/umrahh-winner/:id", updateUmrahhWinner);

// Route to delete a winner by ID
router.delete("/umrahh-winner/:id", deleteUmrahhWinner);


//{paymentDetails}
// Route to get all paymentDetails
router.get("/payments", getAllPayments);
router.get("/payment-details/graph", getPaymentsGraph);

//{users}
// Route to get all paymentDetails
router.get("/users", getAllUsers);
router.put("/updateuserstatus/:id", updateUserStatus);
router.get("/user-details/graph", getUsersGraph);

//{invoice}
//download invoice
router.get("/invoice/:orderId", generateInvoice); // New invoice API

//{winner's}
// Route to select a random winner
router.post("/select-winner", selectRandomWinner);
// Route to send a WhatsApp message to the winner
router.post("/send-whatsapp", sendMessageToWinner);


module.exports = router;
