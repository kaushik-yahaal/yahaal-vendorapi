const mongoose = require("mongoose");

const ConnectDatabase = async (fastify, options) => {
  try {
    mongoose.connection.on("connected", () => {
      fastify.log.info({ actor: "MongoDB" }, "connected");
    });

    mongoose.connection.on("disconnected", () => {
      fastify.log.error({ actor: "MongoDB" }, "disconnected");
    });

    mongoose.connection.on("error", (err) => {
      fastify.log.error({ actor: "MongoDB" }, err);
    });

    const db = await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.log(error);
  }
};

module.exports = ConnectDatabase;
