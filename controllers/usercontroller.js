require("dotenv").config();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/user");
const PaymentDetails = require("../models/payment-details");
const { or } = require("sequelize");
const twilio = require("twilio");
const puppeteer = require("puppeteer");

// Twilio client for sending WhatsApp messages
const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const generateReceiptId = () => {
  const randomNumbers = crypto.randomBytes(4).toString("hex"); // Generates a random 8-character hex string
  return `receipt_umrahh_${randomNumbers}`;
};

// // Generate PDF Invoice
// const generatePdf = async (invoiceDetails) => {
//   const { name, amount, orderId, transactionId, city,phoneNumber } = invoiceDetails;

//   const htmlContent = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Modern Invoice</title>
//       <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
//       <style>
//           @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

//           :root {
//               --primary: #6366f1;
//               --primary-light: #818cf8;
//               --text-primary: #1f2937;
//               --text-secondary: #6b7280;
//               --background: #f9fafb;
//               --card: #ffffff;
//               --border: #e5e7eb;
//           }

//           * {
//               margin: 0;
//               padding: 0;
//               box-sizing: border-box;
//           }

//           body {
//               font-family: 'Inter', sans-serif;
//               background: var(--background);
//               min-height: 100vh;
//               display: flex;
//               justify-content: center;
//               align-items: center;
//               color: var(--text-primary);
//               padding: 2rem;
//               line-height: 1.5;
//           }

//           .invoice-container {
//               max-width: 800px;
//               width: 100%;
//               background: var(--card);
//               border-radius: 16px;
//               box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
//               padding: 2.5rem;
//           }

//           .header {
//               display: flex;
//               justify-content: space-between;
//               align-items: center;
//               margin-bottom: 2.5rem;
//               padding-bottom: 1.5rem;
//               border-bottom: 2px solid var(--border);
//           }

//           .logo-section {
//               display: flex;
//               align-items: center;
//               gap: 1rem;
//           }

//           .logo-section i {
//               font-size: 2.5rem;
//               color: var(--primary);
//           }

//           .invoice-info {
//               text-align: right;
//               color: var(--text-secondary);
//           }

//           .invoice-info p {
//               margin: 0.25rem 0;
//               font-size: 0.875rem;
//           }

//           .invoice-info strong {
//               color: var(--text-primary);
//               font-weight: 600;
//           }

//           .table-container {
//               margin: 2rem 0;
//               border-radius: 12px;
//               overflow: hidden;
//               border: 1px solid var(--border);
//           }

//           .invoice-table {
//               width: 100%;
//               border-collapse: collapse;
//           }

//           .invoice-table th {
//               background: var(--primary);
//               color: white;
//               font-weight: 500;
//               text-transform: uppercase;
//               font-size: 0.75rem;
//               letter-spacing: 0.05em;
//               padding: 1rem;
//               text-align: left;
//           }

//           .invoice-table td {
//               padding: 1rem;
//               border-bottom: 1px solid var(--border);
//               color: var(--text-secondary);
//               font-size: 0.875rem;
//           }

//           .invoice-table tr:last-child td {
//               border-bottom: none;
//           }

//           .invoice-table tbody tr:hover {
//               background: #f8fafc;
//           }

//           .total-section {
//               margin-top: 2rem;
//               padding-top: 1.5rem;
//               border-top: 2px solid var(--border);
//               text-align: right;
//           }

//           .total-row {
//               display: flex;
//               justify-content: flex-end;
//               align-items: center;
//               gap: 4rem;
//               margin-bottom: 0.5rem;
//               font-size: 0.875rem;
//               color: var(--text-secondary);
//           }

//           .total-row.final {
//               margin-top: 1rem;
//               padding-top: 1rem;
//               border-top: 1px solid var(--border);
//               font-size: 1.25rem;
//               font-weight: 600;
//               color: var(--primary);
//           }

//           .total-label {
//               font-weight: 500;
//               color: var(--text-primary);
//           }

//           .badge {
//               background: #dbeafe;
//               color: #2563eb;
//               padding: 0.25rem 0.75rem;
//               border-radius: 9999px;
//               font-size: 0.75rem;
//               font-weight: 500;
//           }
//       </style>
//   </head>
//   <body>
//       <div class="invoice-container">
//           <div class="header">
//               <div class="logo-section">
//                   <i class="fas fa-building"></i>
//                   <div>
//                       <h2 style="font-weight: 600;">ACME Inc.</h2>
//                       <span style="color: var(--text-secondary); font-size: 0.875rem;">Business Solutions</span>
//                   </div>
//               </div>
//               <div class="invoice-info">
//                   <p><strong>Invoice Date:</strong> ${invoiceDate}</p>
//                   <p><strong>Invoice Time:</strong> ${invoiceTime}</p>
//                   <p><strong>Order ID:</strong> <span class="badge">${orderId}</span></p>
//               </div>
//           </div>

//           <div class="table-container">
//               <table class="invoice-table">
//                   <thead>
//                       <tr>
//                           <th>#</th>
//                           <th>Product Details</th>
//                           <th>Price</th>
//                           <th>Qty.</th>
//                           <th>Tax</th>
//                           <th>Total</th>
//                       </tr>
//                   </thead>
//                   <tbody>
//                       <tr>
//                           <td>1</td>
//                           <td>Monthly Accounting Services</td>
//                           <td>₹${amount}</td>
//                           <td>1</td>
//                           <td>20%</td>
//                           <td>₹${totalAmount}</td>
//                       </tr>
//                   </tbody>
//               </table>
//           </div>

//           <div class="total-section">
//               <div class="total-row">
//                   <span class="total-label">Net Total</span>
//                   <span>₹${amount}</span>
//               </div>
//               <div class="total-row">
//                   <span class="total-label">VAT Total</span>
//                   <span>₹${tax}</span>
//               </div>
//               <div class="total-row final">
//                   <span class="total-label">Total to Pay</span>
//                   <span>₹${totalAmount}</span>
//               </div>
//           </div>
//       </div>
//   </body>
//   </html>
//   `;

//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.setContent(htmlContent);
//   const pdfBuffer = await page.pdf({ format: "A4" });
//   await browser.close();

//   return pdfBuffer;
// };

// // Send WhatsApp message with the invoice PDF
// const sendWhatsAppMessage = async (to, pdfBuffer) => {
//   try {
//     // Save PDF to a server (you can host this on AWS S3 or your own server)
//     const mediaUrl = "https://yourdomain.com/invoice.pdf"; // You should upload this PDF to your server

//     await client.messages.create({
//       body: "Here is your invoice.",
//       from: "whatsapp:+14155238886", // Twilio WhatsApp sandbox number or your own
//       to: `whatsapp:${to}`,
//       mediaUrl: [mediaUrl], // PDF file URL
//     });

//     console.log("Invoice sent successfully via WhatsApp");
//   } catch (error) {
//     console.error("Error sending WhatsApp message:", error);
//   }
// };

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

    // Check if phone number already exists
    const existingUser = await User.findOne({ where: { phoneNumber } });
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
    });

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

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    userData.paymentStatus = "paid";
    userData.status = "confirmed";

    await userData.save();

    // // Generate PDF invoice
    // const invoiceDetails = {
    //   name: userData.name,
    //   amount: amount / 100, // Convert from paise to INR
    //   orderId: razorpayOrderId,
    //   transactionId: razorpayPaymentId,
    // };

    // const pdfBuffer = await generatePdf(invoiceDetails);

    // // Send the invoice to the user via WhatsApp
    // await sendWhatsAppMessage(userData.phoneNumber, pdfBuffer);

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

    res.status(200).json({
      // Respond with success message
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

module.exports = {
  order,
  orderSuccess,
};
