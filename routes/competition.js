var express = require("express");
var router = express.Router();
const db = require("../db/db");

router.get("/:competitionid", async function (req, res) {
  const competitionid = req.params.competitionid;
  const user = JSON.stringify(req.oidc.user);

  const sql = `SELECT * FROM competition WHERE competitionid = '${competitionid}'`;
  const competition = (await db.query(sql, []))[0];

  const sql2 = `SELECT * FROM match WHERE competitionid = '${competitionid}' order by roundnumber asc, matchid asc`;
  const matches = await db.query(sql2, []);

  const winpointsValue = parseFloat(competition.winpoints);
  const drawpointsValue = parseFloat(competition.drawpoints);
  const losepointsValue = parseFloat(competition.losepoints);
  let standings = {};

  matches.forEach((match) => {
    if (!standings[match.team1])
      standings[match.team1] = {
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
      };
    if (!standings[match.team2])
      standings[match.team2] = {
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
      };

    if (match.team1goals !== null && match.team2goals !== null) {
      if (match.team1goals > match.team2goals) {
        standings[match.team1].points += winpointsValue;
        standings[match.team2].points += losepointsValue;
        standings[match.team1].wins += 1;
        standings[match.team2].losses += 1;
      } else if (match.team1goals === match.team2goals) {
        standings[match.team1].points += drawpointsValue;
        standings[match.team1].draws += 1;
        standings[match.team2].points += drawpointsValue;
        standings[match.team2].draws += 1;
      } else {
        standings[match.team2].points += winpointsValue;
        standings[match.team1].points += losepointsValue;
        standings[match.team2].wins += 1;
        standings[match.team1].losses += 1;
      }
    }
  });

  const sortedStandings = Object.entries(standings).sort(
    (a, b) => b[1].points - a[1].points
  );

  console.log(sortedStandings);

  res.render("competition", {
    user,
    competition,
    matches,
    standings: sortedStandings,
  });
});

router.post("/:competitionid/:matchid", async function (req, res) {
  const { matchid } = req.params;
  const { team1goals, team2goals } = req.body;

  const sql = `UPDATE match SET team1goals = ${team1goals}, team2goals = ${team2goals} WHERE matchid = ${matchid}`;
  const result = await db.query(sql, []);

  res.send(200);
  //res.redirect("/competition/" + competitionid);
});

module.exports = router;
