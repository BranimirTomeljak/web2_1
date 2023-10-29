const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const fs = require("fs");
const https = require("https");
const { auth } = require("express-openid-connect");
require("dotenv").config();

const port = process.env.PORT || 3000;

const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: `https://localhost:${port}`,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  secret: process.env.SECRET,
};

app.use(auth(config));

var mainRouter = require("./routes/main");
var createRouter = require("./routes/create");
var profileRouter = require("./routes/profile");
var competitionRouter = require("./routes/competition");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(cors());

app.use("/", mainRouter);
app.use("/create", createRouter);
app.use("/profile", profileRouter);
app.use("/competition", competitionRouter);

https
  .createServer(
    {
      key: fs.readFileSync("server.key"),
      cert: fs.readFileSync("server.cert"),
    },
    app
  )
  .listen(port, function () {
    console.log(`Server running at https://localhost:${port}/`);
  });