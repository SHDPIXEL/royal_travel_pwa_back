require("dotenv").config();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/user");
const PaymentDetails = require("../models/payment-details");
const axios = require("axios"); // For API requests
const FormData = require("form-data"); // For file upload
const { Readable } = require("stream");
const puppeteer = require("puppeteer");
const moment = require("moment");

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN; // Replace with your actual access token
const WHATSAPP_PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

const generateReceiptId = () => {
  const randomNumbers = crypto.randomBytes(4).toString("hex"); // Generates a random 8-character hex string
  return `receipt_umrahh_${randomNumbers}`;
};

const sendWhatsAppPdf = async (phoneNumber, pdfBuffer) => {
  try {
    if (!(pdfBuffer instanceof Buffer)) {
      console.log("Converting Uint8Array to Buffer...");
      pdfBuffer = Buffer.from(pdfBuffer);
    }

    // Convert Buffer to a Readable Stream
    const pdfStream = Readable.from(pdfBuffer);

    const formData = new FormData();
    formData.append("file", pdfStream, {
      filename: "invoice.pdf",
      contentType: "application/pdf",
    });
    formData.append("messaging_product", "whatsapp");
    formData.append("type", "application/pdf");

    // **Fix: Explicitly set headers**
    const headers = {
      Authorization: `Bearer ${META_ACCESS_TOKEN}`,
      ...formData.getHeaders(),
    };

    // Upload the PDF first to WhatsApp
    const uploadResponse = await axios.post(
      `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/media`,
      formData,
      { headers } // Make sure headers are passed correctly
    );

    const mediaId = uploadResponse.data.id;
    console.log("Media ID:", mediaId);

    // Send template message with the mediaId as part of the header
    const messagePayload = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "template",
      template: {
        name: "umrah99_invoice",
        language: {
          code: "en",
        },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "document",
                document: {
                  id: mediaId,
                  filename: "Invoice.pdf",
                },
              },
            ],
          },
        ],
      },
    };

    // Send the template message
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      messagePayload,
      {
        headers: {
          Authorization: `Bearer ${META_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("WhatsApp Template Sent:", response.data);
  } catch (error) {
    console.error(
      "Error sending PDF via WhatsApp:",
      error.response?.data || error.message
    );
    throw new Error("Failed to send PDF via WhatsApp.");
  }
};

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

const order = async (req, res) => {
  try {
    const { amt, name, phoneNumber, fatherName, pincode, city } = req.body;

    // Validate required fields
    if (!name || !phoneNumber || !amt || !city) {
      return res.status(400).json({
        message: "Missing required fields",
        name,
        phoneNumber,
        fatherName,
        pincode,
        amt,
        city,
      });
    }

    // Validate pincode (must be exactly 6 digits)
    const pincodeRegex = /^\d{6}$/;
    if (pincode && !pincodeRegex.test(pincode)) {
      return res.status(400).json({
        message: "Invalid pincode. It should be exactly 6 digits.",
      });
    }

    // Check if phone number already exists with "paid" and "confirmed" status
    const existingUser = await User.findOne({
      where: {
        phoneNumber,
        paymentStatus: "paid",
        status: "confirmed",
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "This phone number has already been submitted.",
      });
    }

    // Razorpay instance setup
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const receiptId = generateReceiptId();

    const options = {
      amount: amt * 100, // amount in smallest currency unit (Paise for INR)
      currency: "INR",
      receipt: receiptId,
    };

    const razorpayOrder = await instance.orders.create(options);

    if (!razorpayOrder) {
      return res
        .status(500)
        .send("Some error occurred while creating the order.");
    }

    // Create booking details
    const newUser = await User.create({
      name,
      phoneNumber,
      fatherName,
      pincode,
      city,
      amount: JSON.parse(amt),
      paymentStatus: "pending", // Default to pending
      status: "pending", // Default to pending
      userStatus: "Active",
    });

    // Check if paymentStatus and status are still pending, then destroy the user
    setTimeout(async () => {
      const checkUser = await User.findByPk(newUser.id);
      if (
        checkUser &&
        checkUser.paymentStatus === "pending" &&
        checkUser.status === "pending"
      ) {
        await checkUser.destroy();
        console.log(
          `User with ID ${newUser.id} was removed due to pending status.`
        );
      }
    }, 10 * 60 * 1000); // 10-minute delay before checking status

    res.status(201).json({
      message: "Order created successfully",
      razorpayOrder,
      userDetails: newUser, // Or the saved booking data
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message || "An error occurred.");
  }
};

const orderSuccess = async (req, res) => {
  try {
    const {
      orderCreationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      user,
      amount,
    } = req.body;

    // Creating our own digest for verification
    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
    const digest = shasum.digest("hex");

    // Verifying the signature
    if (digest !== razorpaySignature) {
      return res.status(400).json({ msg: "Transaction not legit!" });
    }

    // Update the booking status and payment status in the database
    const userData = await User.findOne({
      where: { id: user },
    });

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    userData.paymentStatus = "paid";
    userData.status = "confirmed";

    await userData.save();

    // Create a new entry in the PaymentDetails table
    const newPayment = await PaymentDetails.create({
      userId: userData.id, // Foreign key to the BookingDetails table
      orderId: razorpayOrderId,
      transactionId: razorpayPaymentId,
      amount: amount / 100,
      status: "success", // Payment status after successful verification
      paymentDate: new Date(),
      remarks: "Payment verified successfully",
    });

    // Generate PDF Invoice
    const invoiceDetails = {
      name: userData.name,
      city: userData.city,
      phoneNumber: userData.phoneNumber,
      amount: amount / 100,
      orderId: razorpayOrderId,
      transactionId: razorpayPaymentId,
      invoiceDate: new Date()
        .toISOString()
        .split("T")[0]
        .split("-")
        .reverse()
        .join("-"), // DD-MM-YYYY
      invoiceTime: new Date().toLocaleTimeString("en-GB", {
        timeZone: "Asia/Kolkata", // Change to your desired timezone
        hour12: false,
      }),
    };

    const pdfBuffer = await generatePdf(invoiceDetails);
    console.log("Type of pdfBuffer", typeof pdfBuffer);
    console.log("IsBuffer", Buffer.isBuffer(pdfBuffer));
    console.log("pdfBuffer Value", pdfBuffer);
    const pdfBufferFixed = Buffer.from(pdfBuffer); // Convert Uint8Array to Buffer
    // Send PDF to WhatsApp
    // Run sendWhatsAppPdf in the background without awaiting it
    sendWhatsAppPdf(userData.phoneNumber, pdfBufferFixed)
      .then(() => console.log("WhatsApp PDF sent successfully"))
      .catch((err) => console.error("Error sending WhatsApp PDF:", err));

    res.status(200).json({
      msg: "Payment success",
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      userId: userData.userId,
      paymentDetails: newPayment,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send(error.message || "An error occurred during the success callback.");
  }
};

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

module.exports = {
  order,
  orderSuccess,
  generateInvoice,
};
