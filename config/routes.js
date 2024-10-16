const bodyParser = require("body-parser");

const userRouter = require("../routes/User");
const locationRouter = require("../routes/Locations");
const productRouter = require("../routes/Products");
const conversationRouter = require("../routes/Conversations");

module.exports = function (app) {
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use("/api/user", userRouter);
  app.use("/api/locations", locationRouter);
  app.use("/api/products", productRouter);
  app.use("/api/conversation", conversationRouter);
};
