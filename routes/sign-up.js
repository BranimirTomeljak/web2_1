var express = require("express");
var router = express.Router();

router.get("/", (req, res) => {
  res.oidc.login({
    returnTo: "/profile",
    authorizationParams: {
      screen_hint: "signup",
    },
  });
});

module.exports = router;
