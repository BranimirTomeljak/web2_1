var express = require("express");
var router = express.Router();
const { requiresAuth } = require("express-openid-connect");
const db = require("../db/db");

router.get("/", requiresAuth(), function (req, res) {
  const user = JSON.stringify(req.oidc.user);
  console.log(user);
  res.render("create", { user });
});

router.post("/", requiresAuth(), async function (req, res) {
  const competitionName = req.body.competitionName;
  const competitorsList = req.body.competitorsList;
  const winPoints = parseFloat(req.body.winPoints);
  const drawPoints = parseFloat(req.body.drawPoints);
  const losePoints = parseFloat(req.body.losePoints);

  const competitorsArrayString = `{${competitorsList
    .split(/[\n\r;]+/)
    .map((item) => `"${item}"`)
    .join(", ")}}`;

  console.log(
    competitionName,
    competitorsArrayString,
    winPoints,
    drawPoints,
    losePoints
  );
  const sql = `INSERT INTO competition(competitionName, createdBy, sharingEnabled, competitorsList, winPoints, drawPoints, losePoints) VALUES(\'${competitionName}\', \'${req.oidc.user.sub}\', false, \'${competitorsArrayString}\', ${winPoints}, ${drawPoints}, ${losePoints}) RETURNING competitionId`;
  const result = await db.query(sql, []);
  console.log(result[0].competitionid);

  let rounds = generateRoundRobinSchedule(competitorsList.split(/[\n\r;]+/));
  console.log(rounds);
  // rounds[0][0][0] //prva runda, prvi meč, prvi tim
  for(let i = 0; i < rounds.length; i++){
    for(let j = 0; j < rounds[i].length; j++){
      const sql = `INSERT INTO match(competitionId, roundNumber, team1, team2, team1Goals, team2Goals) VALUES(\'${result[0].competitionid}\', ${i+1}, \'${rounds[i][j][0]}\', \'${rounds[i][j][1]}\', null, null)`;
      const result2 = await db.query(sql, []);
    }
  }

  res.redirect("/profile");
});

function generateRoundRobinSchedule(teams) {
  if (teams.length % 2 !== 0) teams.push(" ");
  let n = teams.length;

  const rounds = [];
  for (let i = 1; i < n; i++) {
    const round = [];
    for (let j = 0; j < n / 2; j++) {
      const team1 = teams[j];
      const team2 = teams[n - 1 - j];

      if (team1 != " " && team2 != " ") round.push([team1, team2]);
    }

    rounds.push(round);
    teams.splice(1, 0, teams.pop()); // Rotiranje timova za iduci round
  }

  return rounds;
}


module.exports = router;
