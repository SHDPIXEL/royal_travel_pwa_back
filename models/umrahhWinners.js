const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const UmrahhWinner = sequelize.define(
  "UmrahhWinner",
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
    // Custom date field
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      get() {
        const date = this.getDataValue("date");
        return date ? date.toLocaleDateString("en-GB") : null; // Formats as dd-mm-yyyy
      },
      set(value) {
        // Ensure the date is saved in the correct format
        this.setDataValue("date", value ? new Date(value) : null);
      },
    },
  },
  {
    timestamps: true, // Ensures `createdAt` and `updatedAt` are automatically managed by Sequelize
  }
);

UmrahhWinner.sync({ force: false });
console.log("The table for the Admin model was just (re)created!");

module.exports = UmrahhWinner;
