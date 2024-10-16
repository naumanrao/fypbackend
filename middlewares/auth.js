const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from header
  const bearerToken = req.header("Authorization");
  const token = bearerToken.split(" ")[1];
  // Check if not token
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Verify token
  try {
    jwt.verify(token, process.env.TOKEN_SECRET_KEY, (error, decodedUser) => {
      if (error) {
        return res.status(401).json({
          message: "Your Session has been Expired.Please login again.",
        });
      } else {
        req.user = decodedUser;
        next();
      }
    });
  } catch (err) {
    console.error("something wrong with auth middleware");
    res.status(500).json({ message: "Server Error" });
  }
};
