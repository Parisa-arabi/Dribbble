const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.session.token; // Retrieve token from session

  if (!token) {
    return res.redirect("/admin/login"); // Redirect if no token is found
  }

  try {
    const decoded = jwt.verify(token, "secret_key"); // Verify the token
    req.admin = decoded; // Store admin details in request object
    next(); // Continue to the next middleware or route
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    req.session.destroy(); // Destroy session if token is invalid/expired
    res.redirect("/admin/login"); // Redirect to login page
  }
};
