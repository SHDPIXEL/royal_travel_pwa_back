const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Name cannot be empty",
        },
      },
    },
    fatherName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "FatherName cannot be empty",
        },
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        // You can add a custom validation to ensure it's a valid phone number format if necessary.
        is: {
          args: /^[1-9][0-9]{9}$/, // Example: Ensures the phone number is exactly 10 digits long
          msg: "Phone number must be a valid 10-digit number.",
        },
      },
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userStatus: {
      type: DataTypes.ENUM("Active", "Inactive"),
      allowNull: false,
      defaultValue:"Active"
    },
    status: {
      type: DataTypes.ENUM("confirmed", "canceled", "pending"),
      allowNull: false,
      defaultValue: "pending",
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: true,
        min: 0,
      },
    },
    paymentStatus: {
      type: DataTypes.ENUM("paid", "pending"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  { timestamps: true }
);

User.sync({ force: false });
console.log("The table for the Admin model was just (re)created!");

module.exports = User;
