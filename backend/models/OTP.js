// Member 4 - OTP Model (Email & Transaction Verification)
// Member 1 - Also used for payment/transaction OTP verification
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    
  },
  { timestamps: true }
);



module.exports = mongoose.model("OTP", otpSchema);
