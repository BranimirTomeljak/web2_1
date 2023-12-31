var express = require("express");
var router = express.Router();
const { requiresAuth } = require("express-openid-connect");
const db = require("../db/db");

router.get("/", requiresAuth(), async function (req, res) {
  const user = JSON.stringify(req.oidc.user);

  const sql = `SELECT * FROM competition WHERE createdBy = '${req.oidc.user.sub}' ORDER BY competitionid ASC`;
  const result = await db.query(sql, []);

  res.render("profile", { user, result });
});

module.exports = router;
