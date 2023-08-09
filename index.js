const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("the server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`error is: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertSnakeToCamelCase = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (req, res) => {
  const getPlayersQuery = `SELECT * FROM cricket_team;`;
  const resultIs = await db.all(getPlayersQuery);
  res.send(resultIs.map((eachItem) => convertSnakeToCamelCase(eachItem)));
});

// Add API
app.post("/players/", async (request, res) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postPlayersQuery = `INSERT INTO cricket_team
  (player_name, jersey_number, role) VALUES('${playerName}',${jerseyNumber},'${role}');`;
  const resDb = await db.run(postPlayersQuery);
  res.send("Player Added to Team");
});

//GET API

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const resultIs = await db.get(getPlayersQuery);
  response.send(convertSnakeToCamelCase(resultIs));
});

//PUT API
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;

  const updateQuery = `UPDATE cricket_team SET 
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}' WHERE player_id = ${playerId};`;

  await db.run(updateQuery);
  response.send("Player Details Updated");
});

//DELETE API
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  await db.get(getPlayersQuery);
  response.send("Player Removed");
});

module.exports = app;
