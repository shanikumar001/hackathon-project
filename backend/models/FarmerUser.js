const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * FarmerUser Schema
 * Stores basic account information for farmers and buyers.
 * Links to ProfileInfo via profileId for extended profile details.
 */
const FarmerUserSchema = new mongoose.Schema(
  {
    firebase_uid: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      index: true,
    },
    password: {
      type: String,
      required: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    role: {
      type: String,
      enum: ["farmer", "buyer"],
      default: "farmer",
    },
    language: {
      type: String,
      default: "en",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProfileInfo",
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
FarmerUserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
FarmerUserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("FarmerUser", FarmerUserSchema);
