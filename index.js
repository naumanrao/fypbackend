const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const helmet = require("helmet");
const cors = require("cors");

require("dotenv").config();

const { port } = require("./Env");
require("./config/db")();
require("./config/morgan")(app);

app.use(cors());

require("./config/routes")(app);

if (!fs.existsSync(path.join(__dirname, "/uploads"))) {
  fs.mkdirSync(path.join(__dirname, "/uploads"));
}

const corsConfig = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.get("/", (req, res) => {
  res.send(" working");
});

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

const server = app.listen(port || 3000, "0.0.0.0", () =>
  console.log(`listening on port ${port}`)
);

const { Server } = require("socket.io");
io = new Server(server, {
  cors: corsConfig,
});

app.set("socketio", io);
io.on("connection", () => console.log("Hello from client"));
