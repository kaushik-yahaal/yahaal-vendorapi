const fastify = require("fastify")({ logger: false });
const ConnectDatabase = require("./db/ConnectDB");

require("dotenv").config();

fastify.register(require("./routes/routes"));

const server = async () => {
  try {
    await ConnectDatabase(fastify);
    await fastify.listen({ port: 8000 });
    console.log(`Server running`);
  } catch (error) {
    console.log(error);
  }
};

server();
