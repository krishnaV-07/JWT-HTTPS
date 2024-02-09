const express = require("express");
const https = require("https");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3000;

// const sslServer = https.createServer(
//   {
//     key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
//     cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
//   },
//   app
// );
const KEY_ID = "AnMWG3wu6M1J3hPYYqSaZZSM33kPpeLg6VxEK2PM9bWXO8lF";
const SECRET = "AnMWG3wu6M1J3hPYYqSaZZSM33kPpeLg6VxEK2PM9bWXO8lF";
app.get("/", (req, res) => {
  // res.json({
  //   message: "message from ssl",
  // });
  res.send("welcome!");
});
app.post("/login", (req, res) => {
  const payload = {
    name: req.body.name,
    email: req.body.email,
  };
  const tokenOptions = {
    expiresIn: "300s",
    header: { kid: KEY_ID },
  };
  jwt.sign(payload, SECRET, tokenOptions, (error, token) => {
    if (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to generate token" });
    } else {
      res.json({
        token: token,
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(
    `app is running at secure server on port  https://localhost:${PORT}/`
  );
});
