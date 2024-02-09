const express = require("express");
const https = require("https");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const app = express();

const user = [
  {
    id: "raj1",
    name: "Rajesh De",
    email: "rajesh@test.com",
  },
  {
    id: "ayush1",
    name: "Ayush",
    email: "ayush@test.com",
  },
  {
    id: "nish1",
    name: "Nishant",
    email: "nishat@test.com",
  },
  {
    id: "arpit1",
    name: "Arpit",
    email: "arpit@test.com",
  },
  {
    id: "atul1",
    name: "Atul",
    email: "atul@test.com",
  },
  {
    key: "abc012xyz4",
    name: "Krishna",
    email: "krishna@test.com",
  },
];

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
const KEY_ID = "raGCpcSodps541NYm0wYdG3wHfQw6OTuxTGYMbc30v3CcKh3";
const SECRET = "raGCpcSodps541NYm0wYdG3wHfQw6OTuxTGYMbc30v3CcKh3";
app.get("/", (req, res) => {
  // res.json({
  //   message: "message from ssl",
  // });
  res.send("welcome!");
});

function genIat() {
  return Math.floor(Date.now() / 1000);
}

app.post("/verifyToken", (req, res, next) => {
  const token = req.body.user_token;
  const verify = jwt.verify(token, SECRET);
  res.json({
    ...verify,
  });
  res.send({
    jwt: token,
  });
  next();
});

app.post("/getUser", (req, res, next) => {
  const receivedID = req.body.user_token;
  const data = user.filter((item) => item.id === receivedID);

  const newJTI = uuidv4();
  const newIAT = genIat();

  const payload = {
    name: data[0].name,
    email: data[0].email,
    jti: newJTI,
    iat: newIAT,
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
        jwt: token,
      });
    }
  });

  // next();
});
app.post("/login", (req, res) => {
  const payload = {
    name: req.body.name,
    email: req.body.email,
    iat: req.body.iat,
    jti: req.body.jti,
  };
  const tokenOptions = {
    header: { kid: KEY_ID },
  };
  jwt.sign(payload, SECRET, tokenOptions, (error, token) => {
    if (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to generate token" });
    } else {
      res.json({
        jwt: token,
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(
    `app is running at secure server on port  https://localhost:${PORT}/`
  );
});
