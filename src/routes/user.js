const { Router } = require("express");
const router = Router();
const User = require("../models/User");
require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
router.get("/", (req, res, next) => {
  res.status(200).json({
    numberOfUsers: 5,
    Users: "Ayush",
  });
});

router.post("/signup", async (req, res) => {
  try {
    console.log(req.body);
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(422).json({ error: "Please fill all the fields" });
    }

    const savedUser = await User.findOne({ email: email });
    if (savedUser) {
      console.log({ savedUser });
      return res.status(422).send({ error: "Invalid credentials" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    const payload = {
      name: req.body.name,
      email: req.body.email,
      jti: uuidv4(),
      iat: Math.floor(Date.now() / 1000),
    };

    const tokenOptions = {
      expiresIn: "300s",
      header: { kid: process.env.KEY_ID },
    };

    await user.save();
    const token = await jwt.sign(payload, process.env.JWT_SECRET, tokenOptions);

    res.status(200).json({
      ...payload,
      jwt: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log({ email, password });

    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const payload = {
      name: user.name,
      email: user.email,
      jti: uuidv4(),
      iat: Math.floor(Date.now() / 1000),
    };
    const tokenOptions = {
      expiresIn: "300s",
      header: { kid: process.env.KEY_ID },
    };

    const token = await jwt.sign(payload, process.env.JWT_SECRET, tokenOptions);

    res.status(200).json({
      ...payload,
      jwt: token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/zendesk", async (req, res) => {
  try {
    const { user_token } = req.body;
    const user = await User.findOne({ email: user_token }).exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const payload = {
      name: user.name,
      email: user.email,
      jti: uuidv4(),
      iat: Math.floor(Date.now() / 1000),
    };
    const tokenOptions = {
      expiresIn: "300s",
      header: { kid: process.env.KEY_ID },
    };
    const token = await jwt.sign(payload, process.env.JWT_SECRET, tokenOptions);
    res.status(200).json({
      jwt: token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const token = req.body.user_token;
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      ...verify,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
