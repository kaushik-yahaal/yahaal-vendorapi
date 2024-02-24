const { Schema, mongoose } = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const VendorSchema = new Schema({
  vendor_name: {
    type: String,
    required: true,
  },
  vendor_email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  vendor_contact: {
    type: Number,
    required: true,
  },
  instagram_account: {
    type: String,
  },
  is_approved: {
    type: Boolean,
    default: false,
  },
  services: [
    {
      type: Schema.Types.ObjectId,
      ref: "Service",
    },
  ],
  token: {
    type: String,
  },
});

VendorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const hashedPassword = await bcrypt.hash(
    this.password,
    Number(process.env.BCRYPT_SALT)
  );

  this.password = hashedPassword;
  next();
});

VendorSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
    this.token = token;
    await this.save();

    return token;
  } catch (error) {
    console.log(error);
  }
};

module.exports = mongoose.model("Vendor", VendorSchema);
