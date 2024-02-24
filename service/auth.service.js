const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Token = require("../models/token.model");
const Vendor = require("../models/vendor.model");

const requestPasswordReset = async (email) => {
  const vendor = await Vendor.findOne({ vendor_email: email });

  if (!vendor) {
    throw new Error("User does not exist");
  }

  let token = await Token.findOne({ vendorID: vendor._id });

  if (token) {
    await token.deleteOne();
  }

  let resetToken = crypto.randomBytes(32).toString("hex");

  const hash = await bcrypt.hash(resetToken, Number(process.env.BCRYPT_SALT));

  const generateToken = await new Token({
    vendorID: vendor._id,
    token: hash,
    createdAt: Date.now(),
  });

  await generateToken.save()

  const clientURL = process.env.CLIENT_URL;

  const link = `${clientURL}/passwordReset?token=${resetToken}&id=${vendor._id}`;

  sendEmail(
    vendor.vendor_email,
    "Password Reset Request",
    {
      name: vendor.vendor_name,
      link: link,
    },
    "../utils/template/requestResetPassword.handlebars"
  );
};

const resetPassword = async (vendorID, token, password) => {
  let passwordResetToken = await Token.findOne({ vendorID });

  if (!passwordResetToken) {
    throw new Error("Invalid or expired password reset token");
  }

  const isValid = token === passwordResetToken.token;

  if (!isValid) {
    throw new Error("Invalid or expired password reset token");
  }

  const newHashedPassword = await bcrypt.hash(
    password,
    Number(process.env.BCRYPT_SALT)
  );

  await Vendor.updateOne(
    { _id: vendorID },
    { $set: { password: newHashedPassword } },
    { new: true }
  );

  return true;
};

module.exports = { requestPasswordReset, resetPassword };
