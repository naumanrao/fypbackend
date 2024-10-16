require("dotenv").config();

const port = process.env.PORT;
const dbUrl = process.env.DB_URL;
const secretToken = process.env.TOKEN_SECRET_KEY;

module.exports = {
  port,
  dbUrl,
  secretToken,
};
