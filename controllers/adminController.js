const UmrahhWinner = require("../models/umrahhWinners"); // Import the UmrahhWinner model
const { User, PaymentDetails } = require("../models/index"); // Import models properly
const { Op } = require("sequelize");
const moment = require("moment");
const puppeteer = require("puppeteer");
const axios = require("axios");

// // Generate PDF Invoice
const generatePdf = async (invoiceDetails) => {
  const {
    name,
    amount,
    orderId,
    transactionId,
    city,
    phoneNumber,
    invoiceDate,
    invoiceTime,
  } = invoiceDetails;

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Modern Invoice</title>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
      <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

          :root {
              --primary: #f7951f;
              --primary-light: #818cf8;
              --text-primary: #1f2937;
              --text-secondary: #6b7280;
              --background: #f9fafb;
              --card: #ffffff;
              --border: #e5e7eb;
          }

          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }

          body {
              font-family: 'Inter', sans-serif;
              background: var(--background);
              min-height: 100vh;
              display: flex;
              justify-content: center;
              color: var(--text-primary);
              padding: 2rem;
              line-height: 1.5;
          }

          .invoice-container {
              max-width: 800px;
              width: 100%;
              background: var(--card);
              padding: 2.5rem;
          }

          /* Header Layout */
          .header {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              margin-bottom: 2.5rem;
              padding-bottom: 1.5rem;
              border-bottom: 2px solid var(--border);
          }

          .logo-section {
              display: flex;
              align-items: center;
              gap: 1rem;
              margin-bottom: 1rem; /* Space below logo */
          }

          .logo-section i {
              font-size: 2.5rem;
              color: var(--primary);
          }

          /* User Info & Invoice Info Layout */
          .info-container {
              display: flex;
              justify-content: space-between;
              width: 100%;
          }

          .user-info {
              flex: 1;
              color: var(--text-primary);
          }

          .user-info p {
              margin: 0.25rem 0;
              font-size: 0.875rem;
          }

          .user-info strong {
              font-weight: 600;
              color: var(--text-secondary);
          }

          .invoice-info {
              text-align: right;
              color: var(--text-secondary);
          }

          .invoice-info p {
              margin: 0.25rem 0;
              font-size: 0.875rem;
          }

          .invoice-info strong {
              color: var(--text-primary);
              font-weight: 600;
          }

          .table-container {
              margin: 2rem 0;
              border-radius: 12px;
              overflow: hidden;
              border: 1px solid var(--border);
          }

          .invoice-table {
              width: 100%;
              border-collapse: collapse;
          }

          .invoice-table th {
              background: var(--primary);
              color: white;
              font-weight: 500;
              text-transform: uppercase;
              font-size: 0.75rem;
              letter-spacing: 0.05em;
              padding: 1rem;
              text-align: left;
          }

          .invoice-table td {
              padding: 1rem;
              border-bottom: 1px solid var(--border);
              color: var(--text-secondary);
              font-size: 0.875rem;
          }

          .invoice-table tr:last-child td {
              border-bottom: none;
          }

          .total-section {
              margin-top: 2rem;
              padding-top: 1.5rem;
              border-top: 2px solid var(--border);
              text-align: right;
          }

          .total-row {
              display: flex;
              justify-content: flex-end;
              align-items: center;
              gap: 4rem;
              margin-bottom: 0.5rem;
              font-size: 0.875rem;
              color: var(--text-secondary);
          }

          .total-row.final {
              margin-top: 1rem;
              padding-top: 1rem;
              font-size: 1.25rem;
              font-weight: 600;
              color: var(--primary);
          }

          .total-label {
              font-weight: 500;
              color: var(--text-primary);
          }

          .badge {
              color: #f7951f;
              padding: 0.25rem 0.75rem;
              border-radius: 9999px;
              font-size: 0.75rem;
              font-weight: 500;
          }
      </style>
  </head>
  <body>
      <div class="invoice-container">
          <div class="header">
              <!-- Logo Section -->
              <div class="logo-section">
                  <div>
                      <img src="https://demo.shdpixel.com/umrah99/logo.jpg" alt="Umrah99 Logo" style="max-width: 150px; height: auto;">
                  </div>
              </div>

              <!-- User Info & Invoice Info Side by Side -->
              <div class="info-container">
                  <div class="user-info">
                      <p><strong>Name:</strong> ${name}</p>
                      <p><strong>City:</strong> ${city}</p>
                      <p><strong>Phone-Number:</strong> ${phoneNumber}</p>
                  </div>

                  <div class="invoice-info">
                      <p><strong>Invoice Date:</strong> ${invoiceDate} ${invoiceTime}</p>
                      <p><strong>Order ID:</strong> <span class="badge">${orderId}</span></p>
                      <p><strong>Transaction ID:</strong> <span class="badge">${transactionId}</span></p>
                  </div>
              </div>
          </div>

          <div class="table-container">
              <table class="invoice-table">
                  <thead>
                      <tr>
                          <th>#</th>
                          <th>Description</th>
                          <th>Price</th>
                          <th>Qty.</th>
                          <th>Tax</th>
                          <th>Total</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td>1</td>
                          <td>Umrah Premium Package</td>
                          <td>₹${amount}</td>
                          <td>1</td>
                          <td>0%</td>
                          <td>₹${amount}</td>
                      </tr>
                  </tbody>
              </table>
          </div>

          <div class="total-section">
              <div class="total-row final">
                  <span class="total-label">Total Paid Amount</span>
                  <span>₹${amount}</span>
              </div>
          </div>
                    <!-- Terms and Conditions Section -->
          <div class="terms-section" style="margin-top: 15rem; padding-top: 1.5rem; border-top: 2px solid var(--border); font-size: 0.875rem; color: var(--text-secondary);">
              <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.75rem;"><u>Umrah99 Terms and Conditions:</u></h3>
              <ul style="list-style-type: disc; padding-left: 1.5rem;">
                  <li>The number of participants in each Umrah99 lucky draw will depend on the total entries.</li>
                  <li>If you wish to request a refund after making a payment, you must claim it within 24 hours. After this period, no claims will be accepted, and the participant will no longer be part of the Umrah99 competition.</li>
                  <li>Umrah99 reserves all rights.</li>
                  <li>Umrah99 is a part of Royal Groups.</li>
              </ul>
              
              <!-- Contact Information -->
              <div style="margin-top: 1rem; display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem; color: var(--text-primary); font-weight: 500;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <i class="fas fa-phone" style="color: var(--primary);"></i>
                      <a href="tel:+917300500939" style="text-decoration: none; color: var(--text-primary);">+91 73005 00939</a> <!-- Replace with actual phone number -->
                  </div>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <i class="fas fa-envelope" style="color: var(--primary);"></i>
                      <a href="mailto:info@umrah99.in" style="text-decoration: none; color: var(--text-primary);">info@umrah99.in</a> <!-- Replace with actual email -->
                  </div>
              </div>
          </div>
      </div>
  </body>
  </html>
  `;

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    // Set viewport to ensure proper rendering
    await page.setViewport({ width: 800, height: 1000 });

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generate PDF with defined margins to avoid excessive space
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
};

const sendWhatsAppMessage = async (phone, name) => {
  const ACCESS_TOKEN = "YOUR_WHATSAPP_ACCESS_TOKEN";

  const messageData = {
    messaging_product: "whatsapp",
    to: phone,
    type: "template",
    template: {
      name: umrah99_winnermessage,
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: name } // Winner's Name
          ]
        }
      ]
    }
  };

  try {
    const response = await axios.post(
      "https://graph.facebook.com/v22.0/593691093825849/messages",
      messageData,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("WhatsApp message sent successfully:", response.data);
  } catch (error) {
    console.error("Error sending WhatsApp message:", error.response.data);
  }
};

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
      return res.status(200).json({
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

//{paymentGraph}
async function getPaymentsGraph(req, res) {
  try {
    // Get the current date
    const today = moment().startOf("day");
    const sevenDaysAgo = moment(today).subtract(6, "days");

    // Fetch payment records created in the last 7 days, including today
    const payments = await PaymentDetails.findAll({
      where: {
        createdAt: {
          [Op.between]: [sevenDaysAgo.toDate(), today.endOf("day").toDate()],
        },
      },
      attributes: ["createdAt"], // Fetch only the creation date of payments
    });

    // Initialize an array with all the dates for the last 7 days
    const dateCounts = Array.from({ length: 7 }, (_, i) => {
      const date = moment(sevenDaysAgo).add(i, "days");
      return {
        date: date.format("YYYY-MM-DD"), // Format the date as a string
        paymentCount: 0, // Initial payment count is zero
      };
    });

    // Count payments for each day
    payments.forEach((payment) => {
      const paymentDate = moment(payment.createdAt).format("YYYY-MM-DD");
      const dayEntry = dateCounts.find((entry) => entry.date === paymentDate);
      if (dayEntry) {
        dayEntry.paymentCount += 1; // Increment payment count
      }
    });

    // Respond with the data
    res.status(200).json({
      message: "Payments data for the last 7 days",
      data: dateCounts,
    });
  } catch (error) {
    console.error("Error fetching payments graph data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

//{users}
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll(); // This will fetch all users from the User model

    // If there are no users, send a message indicating that
    if (users.length === 0) {
      return res.status(200).json({ message: "No users found." });
    }

    // Send the list of users as a response
    res.status(200).json({
      message: "Users retrieved successfully.",
      users: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while fetching users.",
      error: error.message,
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params; // Get user ID from request parameters
    const { userStatus } = req.body; // Get new status from request body

    console.log("Received ID:", id); // Debugging log
    console.log("Received Status:", userStatus); // Debugging log

    // Ensure the status is valid
    const validStatuses = ["Active", "Inactive"];
    if (!validStatuses.includes(userStatus)) {
      return res.status(400).json({ message: "Invalid user status provided." });
    }

    // Find the user by ID
    const user = await User.findByPk(id);

    if (!user) {
      console.log("User not found in DB"); // Debugging log
      return res.status(404).json({ message: "User not found." });
    }

    // Update user status
    user.userStatus = userStatus;
    await user.save();

    res
      .status(200)
      .json({ message: "User status updated successfully.", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while updating user status.",
      error: error.message,
    });
  }
};

//{usersGraph}
async function getUsersGraph(req, res) {
  try {
    // Get the current date
    const today = moment().startOf("day");
    const sevenDaysAgo = moment(today).subtract(6, "days");

    // Fetch users created in the last 7 days, including today
    const users = await User.findAll({
      where: {
        createdAt: {
          [Op.between]: [sevenDaysAgo.toDate(), today.endOf("day").toDate()],
        },
      },
      attributes: ["createdAt"], // Fetch only the creation date
    });

    // Initialize an array with all the dates for the last 7 days
    const dateCounts = Array.from({ length: 7 }, (_, i) => {
      const date = moment(sevenDaysAgo).add(i, "days");
      return {
        date: date.format("YYYY-MM-DD"), // Format the date as a string
        userCount: 0, // Initial user count is zero
      };
    });

    // Count users for each day
    users.forEach((user) => {
      const userDate = moment(user.createdAt).format("YYYY-MM-DD");
      const dayEntry = dateCounts.find((entry) => entry.date === userDate);
      if (dayEntry) {
        dayEntry.userCount += 1; // Increment user count
      }
    });

    // Respond with the data
    res.status(200).json({
      message: "Users data for the last 7 days",
      data: dateCounts,
    });
  } catch (error) {
    console.error("Error fetching users graph data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

//{invoice}
const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Fetch payment details
    const paymentDetails = await PaymentDetails.findOne({ where: { orderId } });
    if (!paymentDetails) {
      return res.status(404).json({ message: "Payment details not found" });
    }

    // Fetch user details
    const userData = await User.findOne({
      where: { id: paymentDetails.userId },
    });
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate the current date in DD-MM-YYYY format
    const invoiceDate = moment().tz("Asia/Kolkata").format("DD-MM-YYYY"); // IST Date
    const invoiceTime = moment().tz("Asia/Kolkata").format("HH:mm:ss"); // IST Time (24-hour format)

    // Prepare invoice data
    const invoiceDetails = {
      name: userData.name,
      city: userData.city,
      phoneNumber: userData.phoneNumber,
      amount: paymentDetails.amount,
      orderId: paymentDetails.orderId,
      transactionId: paymentDetails.transactionId,
      invoiceDate,
      invoiceTime,
    };

    // Generate PDF invoice
    const pdfBuffer = await generatePdf(invoiceDetails);

    // Check if PDF buffer is valid
    if (!pdfBuffer || pdfBuffer.length === 0) {
      return res.status(500).json({ message: "Error generating PDF" });
    }

    console.log("PDF Size:", pdfBuffer.length); // Debugging

    // Set response headers for PDF download
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice_${orderId}.pdf`,
      "Content-Length": pdfBuffer.length,
    });

    res.end(pdfBuffer); // Send PDF as response
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .send(error.message || "An error occurred while generating the invoice.");
  }
};

//{randomWinnerGeneration}
const selectRandomWinner = async (req, res) => {
  try {
    // Fetch successful payments with user details
    const successfulPayments = await PaymentDetails.findAll({
      where: { status: "success" },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "phoneNumber"],
        },
      ],
    });

    if (successfulPayments.length === 0) {
      return res.status(404).json({ message: "No successful payments found." });
    }

    // Filter out users who have already been selected as winners
    const previousWinners = await UmrahhWinner.findAll({
      attributes: ["name"], // Fetch only winner names
    });

    const previousWinnerNames = previousWinners.map((winner) => winner.name);
    
    // Get eligible users who haven't won before
    const eligiblePayments = successfulPayments.filter(
      (payment) => !previousWinnerNames.includes(payment.user.name)
    );

    if (eligiblePayments.length === 0) {
      return res.status(400).json({ message: "All eligible users have already won." });
    }

    // Randomly select one winner
    const winner = eligiblePayments[Math.floor(Math.random() * eligiblePayments.length)];

    // Save only `name` and `date` in UmrahhWinner
    const savedWinner = await UmrahhWinner.create({
      name: winner.user.name,
      date: new Date(),
    });

    return res.json({
      message: "Winner selected successfully and saved!",
      winner: {
        id: savedWinner.id,
        name: savedWinner.name,
        date: savedWinner.date,
        phone: winner.user.phoneNumber,
      },
    });
  } catch (error) {
    console.error("Error selecting winner:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const sendMessageToWinner = async (req, res) => {
  const { phone, name } = req.body; // Get details from the request

  if (!phone || !name) {
    return res.status(400).json({ message: "Phone number and name are required." });
  }

  try {
    await sendWhatsAppMessage(phone, name);
    return res.json({ message: "WhatsApp message sent successfully!" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send WhatsApp message." });
  }
};

module.exports = {
  createUmrahhWinner, //{UmrahhWinner}
  getAllUmrahhWinners,
  getUmrahhWinnerById,
  updateUmrahhWinner,
  deleteUmrahhWinner,
  getAllPayments, //{paymentDetails}
  getPaymentsGraph,
  getAllUsers, //{users}
  updateUserStatus,
  getUsersGraph,
  generateInvoice, //{invoice}
  selectRandomWinner,//{winner's}
  sendMessageToWinner,
};
