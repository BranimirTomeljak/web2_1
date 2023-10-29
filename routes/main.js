var express = require("express");
var router = express.Router();

router.get("/", function (req, res) {
  let user;

  if (req.oidc.isAuthenticated()) {
    user = JSON.stringify(req.oidc.user);
  }

  res.render("main", { user });
});

//router.post("/", (req, res) => {});

module.exports = router;
