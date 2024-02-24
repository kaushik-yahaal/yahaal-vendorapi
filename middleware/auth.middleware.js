const jwt = require("jsonwebtoken");
const Vendor = require("../models/vendor.model");

const Authenticate = async (req, reply) => {
  const token = req.headers["jwtoken"];

  if (!token) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

  const currentVendor = await Vendor.findOne({
    _id: verifyToken._id,
    token: token,
  });

  if (!currentVendor) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  req.token = token;
  req.vendorID = currentVendor._id;

  return;
};

module.exports = Authenticate;
