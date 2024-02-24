const { Schema, mongoose } = require("mongoose");

const TokenSchema = new Schema({
  vendorID: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Vendor",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 3600,
  },
});

module.exports = mongoose.model("Token", TokenSchema);
