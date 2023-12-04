const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertObj = (obj) => {
  return {
    playerId: obj.playerId,
    playerName: obj.playerName,
    jerseyNumber: obj.jerseyNumber,
    role: obj.role,
  };
};

//API 1

app.all("/players/", (request, response) => {
  const sqQry = `SELECT
    * 
    FROM
    cricket_team`;
  const myArray = app.all(sqQry);
  response.send(myArray.map((i) => convertObj(i)));
});

//API 2

app.post("/players/", async (request, response) => {
  const playersObj = request.body;
  const { playerName, jerseyNumber, role } = playersObj;
  const sqPostQry = `
    INSERT INTO
    cricket_team (playerName,jerseyNumber,role)
    VALUES (
       ' ${playerName}',
       ${jerseyNumber},
       '${role}'
    )
    `;
  const resInts = await app.run(sqPostQry);
  const playerId = resInts.lastId;
  response.send({ playerId: playerId });
});

//API 3

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const sqGetQry = `SELECT *
    FROM 
    cricket_team
    WHERE 
    playerId = ${playerId}
    `;
  const playerDetails = await app.get(sqGetQry);
  response.send(playerDetails);
});

// API 4

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playersArray = request.body;
  const { playerName, jerseyNumber, role } = playersArray;
  const sqPutQry = `
    UPDATE 
    cricket_team
    SET 
    playerName = '${playerName}'
    jerseyNumber = ${jerseyNumber}
    role = '${role}'
    WHERE 
    playerId = ${playerId}
    `;
  const updatedDetails = await app.run(sqPutQry);
  response.send("Player Details Updated");
});

//API 5

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const sqDeleteQry = `
    DELETE 
    FROM
     cricket_team
     WHERE
     playerId = ${playerId}

    `;
  const DeleteReq = await app.run(sqDeleteQry);
  response.send("Player Removed");
});
module.exports = app;
