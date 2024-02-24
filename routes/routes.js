const Service = require("../models/service.model");
const Vendor = require("../models/vendor.model");
const requestPasswordReset = require("../service/auth.service");
const bcrypt = require("bcrypt");
const Authenticate = require("../middleware/auth.middleware");

module.exports = async function (fastify, opts) {
  fastify.register(
    function (fastify, opts, done) {
      // --------------- VENDOR --------------- //

      fastify.post("/vendor-register", async (req, reply) => {
        const {
          vendor_name,
          vendor_email,
          password,
          vendor_contact,
          instagram_account,
        } = req.body;

        if (!vendor_name || !vendor_email || !password || !vendor_contact) {
          return reply.code(400).send({ message: "Fields are required" });
        }

        try {
          const vendorExist = await Vendor.findOne({
            vendor_email: vendor_email,
          });

          if (vendorExist) {
            return reply.code(403).send({
              message: "Email already exists",
            });
          }

          const vendor = await new Vendor({
            vendor_name,
            vendor_email,
            password,
            vendor_contact,
            instagram_account,
          });

          await vendor.save();

          reply
            .code(201)
            .send({ message: "Vendor Account created successfully" });
        } catch (error) {
          console.log(error);
        }
      });

      fastify.post("/vendor-login", async (req, reply) => {
        const { vendor_email, password } = req.body;

        if (!vendor_email || !password) {
          return reply.code(400).send({ message: "Fill required data" });
        }

        try {
          const vendor = await Vendor.findOne({ vendor_email });

          if (vendor) {
            const isPasswordMatch = await bcrypt.compare(
              password,
              vendor.password
            );

            if (!isPasswordMatch) {
              return reply.code(400).send({ message: "Invalid Credentials" });
            }

            let jwtoken = await vendor.generateAuthToken();

            reply.header("jwtoken", jwtoken);

            return reply
              .code(200)
              .send({ jwtoken, message: "Vendor login success" });
          } else {
            return reply.code(422).send({ message: "Vendor not exist" });
          }
        } catch (error) {
          return reply.code(400).send({ err: error });
        }
      });

      fastify.get("/all-vendors", async (req, reply) => {
        try {
          const allVendors = await Vendor.find({});

          if (!allVendors) {
            return reply.code(400).send({ message: "No vendors available" });
          }

          reply.code(201).send({ allVendors, message: "All Vendors received" });
        } catch (error) {
          console.log(error);
        }
      });

      fastify.get("/vendor/:id", async (req, reply) => {
        try {
          const vendorID = req.params.id;

          if (!vendorID) {
            return reply.code(400).send({ message: `Unexpected param` });
          }

          const vendor = await Vendor.findById(vendorID);

          if (!vendor) {
            return reply
              .code(400)
              .send({ message: `Vendor not found with id: ${vendorID}` });
          }

          reply.code(201).send({ vendor, message: "Vendor found" });
        } catch (error) {
          console.log(error);
          reply.code(400).send({ err: error });
        }
      });

      fastify.delete("/vendor/:id", async (req, reply) => {
        try {
          const vendorID = req.params.id;

          if (!vendorID) {
            return reply.code(400).send({ message: `Unexpected param` });
          }

          const vendor = await Vendor.findByIdAndDelete(vendorID);

          if (!vendor) {
            return reply
              .code(400)
              .send({ message: `Vendor not found with id: ${vendorID}` });
          }

          reply
            .code(201)
            .send({ vendor, message: "Vendor Removed successfully" });
        } catch (error) {
          console.log(error);
          reply.code(400).send({ err: error });
        }
      });

      // --------------- ADMIN --------------- //

      fastify.post("/approve-vendor/:id", async (req, reply) => {
        try {
          const vendorID = req.params.id;

          if (!vendorID) {
            return reply.code(400).send({ message: `Unexpected param` });
          }

          const updateVendor = await Vendor.findByIdAndUpdate(
            { _id: vendorID },
            {
              is_approved: true,
            }
          );

          if (!updateVendor) {
            return reply.code(400).send({
              message: `Unable to approve Vendor with id: ${vendorID}`,
            });
          }

          reply.code(201).send({ message: "Vendor approved successfully" });
        } catch (error) {
          reply.code(400).send({ err: error });
        }
      });

      fastify.post("/request-password-reset", async (req, reply) => {
        const email = req.body.email;

        const requestPasswordResetService =
          await requestPasswordReset.requestPasswordReset(email);

        reply.send(requestPasswordResetService);
      });

      fastify.post("/reset-password", async (req, reply) => {
        const { vendorID, token, password } = req.body;

        const resetPasswordService = await requestPasswordReset.resetPassword(
          vendorID,
          token,
          password
        );

        reply.send({
          resetPasswordService,
          message: "Password has been reset",
        });
      });

      // --------------- SERVICE --------------- //

      fastify.post(
        "/add-service",
        { preHandler: Authenticate },
        async (req, reply) => {
          const {
            service_name,
            service_description,
            service_type,
            service_status,
            availability,
            cost_per_seat,
            category,
          } = req.body;

          if (
            !service_name ||
            !service_description ||
            !service_type ||
            !service_status ||
            !availability ||
            !cost_per_seat ||
            !category
          ) {
            return reply.code(400).send({ message: "Fields are required" });
          }

          const generateServiceCode = () => {
            const min = 100000000000;
            const max = 999999999999;
            return Math.floor(Math.random() * (max - min + 1)) + min;
          };

          const service_code = generateServiceCode();

          try {
            const serviceExist = await Service.findOne({
              service_name: service_name,
            });

            if (serviceExist) {
              return reply.code(403).send({
                message: "Service is already exist",
              });
            }

            const serviceData = {
              service_name,
              service_description,
              service_type,
              service_status,
              service_code,
              availability,
              category,
            };

            if (service_type === "BK" || service_type === "I") {
              delete serviceData.cost_per_seat;
            } else {
              serviceData.cost_per_seat = cost_per_seat;
            }

            const service = await new Service(serviceData);

            await service.save();

            const currentVendorID = req.vendorID;
            const vendor = await Vendor.findById(currentVendorID);

            vendor.services.push(service._id);

            await vendor.save();

            reply.code(201).send({ message: "Service added successfully" });
          } catch (error) {
            console.log(error);
          }
        }
      );

      fastify.get("/all-services", async (req, reply) => {
        try {
          const allServices = await Service.find({});

          if (!allServices) {
            return reply.code(400).send({ message: "No service available" });
          }

          reply.send({ allServices, message: "All Services received" });
        } catch (error) {
          reply.code(400).send({ err: error });
        }
      });

      fastify.get("/service/:id", async (req, reply) => {
        const serviceID = req.params.id;

        if (!serviceID) {
          return reply.code(400).send({ message: "Provide proper service id" });
        }

        try {
          const service = await Service.findById(serviceID);

          if (!service) {
            return reply
              .code(422)
              .send({ message: `Service not found with id: ${serviceID}` });
          }

          reply.code(200).send({ service, message: "Service found" });
        } catch (error) {
          reply.code(400).send({ err: error });
        }
      });

      fastify.put("/edit-service/:id", async (req, reply) => {
        try {
          const data = req.body;
          const id = req.params.id;

          const serviceExist = await Service.findById(id);

          if (!serviceExist) {
            return reply.code(422).send({ message: "Service not exist" });
          }

          const updatedService = await Service.findByIdAndUpdate(
            { _id: id },
            data
          );

          if (!updatedService) {
            return reply.code(422).send({ message: "Can not update service" });
          }

          reply
            .code(200)
            .send({ updatedService, message: "Service updated successfully" });
        } catch (error) {
          reply.code(400).send({ err: error });
        }
      });

      fastify.delete("/service/:id", async (req, reply) => {
        try {
          const serviceID = req.params.id;

          if (!serviceID) {
            return reply.code(400).send({ message: `Unexpected param` });
          }

          const service = await Service.findByIdAndDelete(serviceID);

          if (!service) {
            return reply
              .code(400)
              .send({ message: `Service not found with id: ${serviceID}` });
          }

          reply
            .code(201)
            .send({ service, message: "Service Removed successfully" });
        } catch (error) {
          console.log(error);
          reply.code(400).send({ err: error });
        }
      });

      done();
    },
    { prefix: "/api/v1" }
  );
};
