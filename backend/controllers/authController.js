const jwt = require("jsonwebtoken");
const { getDB } = require("../config/db");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt with:", { email, password });

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return res.status(500).json({
        success: false,
        message: "خطای پیکربندی سرور",
      });
    }

    const db = getDB();
    const collection = db.collection("designers");

    const designer = await collection.findOne({ email });
    console.log("Designer found:", {
      id: designer?._id,
      email: designer?.email,
    });

    if (!designer) {
      console.log("No designer found with email:", email);
      return res.status(401).json({
        success: false,
        message: "wrong email or password",
        error: "INVALID_CREDENTIALS",
      });
    }
    console.log("Password comparison:", {
      provided: password,
      stored: designer.password,
      matches: designer.password === password,
    });

    if (designer.password !== password) {
      console.log("Password mismatch for email:", email);
      return res.status(401).json({
        success: false,
        message:"wrong email or password",
        error: "INVALID_CREDENTIALS",
      });
    }

    const token = jwt.sign(
      { id: designer._id, email: designer.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("token", token, {
      httpOnly: false,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 20000,
    });

    return res.status(200).json({
      success: true,
      token,
      designer: {
        id: designer._id,
        name: designer.name,
        email: designer.email,
      },
    });
  } catch (error) {
    console.error("Login error details:", error);
    res.status(500).json({
      success: false,
      message: "connection error",
      error: error.message,
    });
  }
};
