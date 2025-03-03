const sequelize = require("../connection");
const User = require("./user");
const PaymentDetails = require("./payment-details");

// Associations
User.hasMany(PaymentDetails, { foreignKey: "userId", as: "payments" });
PaymentDetails.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = { sequelize, User, PaymentDetails };
