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

router.post("/signup", (req, res) => {
  console.log(req.body);
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(422).json({ error: "plz fill all the fields" });
  }
  User.findOne({ email: email }).then(async (savedUser) => {
    if (savedUser) {
      console.log({ savedUser });
      return res.status(422).send({ error: "Invalid crenentials" });
    }
    bcrypt.hash(req.body.password, 10, (error, hash) => {
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        email: req.body.email,
        password: hash,
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
      if (error) return res.status(500).json({ error });
      user
        .save()
        .then((result) => {
          jwt.sign(
            payload,
            process.env.JWT_SECRET,
            tokenOptions,
            (error, token) => {
              if (error) {
                console.log(error);
                res.status(500).json({ error: "Failed to generate token" });
              } else {
                res.status(200).json({
                  ...payload,
                  jwt: token,
                });
              }
            }
          );
          // res.status(200).json({ ...result });
        })
        .catch((error) => {
          res.status(500).json({ error });
        });
    });
  });
});

router.post("/login", (req, res, next) => {
  const { email, password } = req.body;
  console.log({ email, password });
  User.find({ email })
    .exec()
    .then((user) => {
      if (!user.length) return res.status(500).json({ err: "user not exist" });
      const payload = {
        name: user[0].name,
        email: user[0].email,
        jti: uuidv4(),
        iat: Math.floor(Date.now() / 1000),
      };
      const tokenOptions = {
        expiresIn: "300s",
        header: { kid: process.env.KEY_ID },
      };
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        console.log({ result });
        if (!result) return res.status(401).json({ msg: "wrong password" });
        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          tokenOptions,
          (error, token) => {
            if (error) {
              console.log(error);
              res.status(500).json({ error: "Failed to generate token" });
            } else {
              res.status(200).json({
                ...payload,
                jwt: token,
              });
            }
          }
        );
        // res.status(200).json({
        //   name: user[0].name,
        //   email: user[0].email,
        //   token: token,
        //   userId: user[0]._id,
        // });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ err });
    });
});

module.exports = router;
