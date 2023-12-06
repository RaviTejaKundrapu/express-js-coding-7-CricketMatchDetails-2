const express = require('express')
const app = express()
app.use(express.json())
module.exports = app

const path = require('path')
const dbPath = path.join(__dirname, 'cricketMatchDetails.db')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

let db = null

const initializeServerAndDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    let port = 3000
    app.listen(port, () => {
      console.log(`Server is Running in ${port} Port...`)
    })
  } catch (error) {
    console.log(`Db Error: ${error.message}`)
    process.exit(1)
  }
}

initializeServerAndDb()

//API 1 : Returns a list of all the players in the player table

const convertToCamelCaseKeysApi1 = eachPlayerObject => {
  return {
    playerId: eachPlayerObject.player_id,
    playerName: eachPlayerObject.player_name,
  }
}

app.get('/players/', async (request, response) => {
  const getAllPlayersQuery = `
  SELECT * FROM player_details`
  const api_1_inDb = await db.all(getAllPlayersQuery)
  response.send(api_1_inDb.map(each => convertToCamelCaseKeysApi1(each)))
})

//API  2 : Returns a specific player based on the player ID

const convertToCamelCaseKeysApi2 = eachPlayerObject => {
  return {
    playerId: eachPlayerObject.player_id,
    playerName: eachPlayerObject.player_name,
  }
}

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getSearchedPlayerQuery = `
  SELECT * FROM player_details WHERE player_id=${playerId};`
  const api_2_inDb = await db.get(getSearchedPlayerQuery)
  response.send(convertToCamelCaseKeysApi2(api_2_inDb))
})

//API  3 : Updates the details of a specific player based on the player ID

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const updateInputs = request.body
  const {playerName} = updateInputs
  const updatePlayerQuery = `UPDATE player_details
  SET player_name='${playerName}'
  WHERE player_id=${playerId};`
  const api_3_inDb = await db.run(updatePlayerQuery)

  const getUpdatedPlayerObjectQuery = `Select player_name from player_details where player_id=${playerId};`
  const playerUpdatedDetails = await db.get(getUpdatedPlayerObjectQuery)
  response.send({playerName: playerUpdatedDetails['player_name']})
})

//API 4 :Returns the match details of a specific match

const convertToCamelCaseKeysApi4 = eachMatchObject => {
  return {
    matchId: eachMatchObject.match_id,
    match: eachMatchObject.match,
    year: eachMatchObject.year,
  }
}

app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getSearchedMatchsQuery = `
  SELECT * FROM match_details WHERE match_id=${matchId};`
  const api_4_inDb = await db.get(getSearchedMatchsQuery)
  response.send(convertToCamelCaseKeysApi4(api_4_inDb))
})

//API 5 :Returns a list of all the matches of a player
//Using 'as' Alias in Db query to get object keys as we want - instead of return function

app.get('/players/:playerId/matches/', async (request, response) => {
  const {playerId} = request.params

  const getmatchesQuery = `SELECT match_details.match_id	as matchId, match_details.match as match, match_details.year as year
  FROM match_details NATURAL JOIN player_match_score 
  WHERE player_match_score.player_id =${playerId};`

  const api_5_inDb = await db.all(getmatchesQuery)
  response.send(api_5_inDb)
})

//API 6 :Returns a list of players of a specific match
//Using 'as' Alias in Db query to get object keys as we want - instead of return function

app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params

  const getplayersQuery = `
  SELECT player_details.player_id as playerId, player_details.player_name as playerName
  FROM player_details NATURAL JOIN player_match_score
  WHERE player_match_score.match_id=${matchId};`

  const api_6_inDb = await db.all(getplayersQuery)
  response.send(api_6_inDb)
})

//API 7 :Returns the statistics of the total score, fours, sixes of a specific player based on the player ID

app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params

  const getplayerScoreQuery = `
SELECT player_details.player_id as playerId, player_details.player_name as playerName,SUM(player_match_score.score) as totalScore, SUM(player_match_score.fours) as totalFours, SUM(player_match_score.sixes) as totalSixes
FROM player_details INNER JOIN player_match_score ON player_details.player_id=player_match_score.player_id
WHERE player_details.player_id=${playerId}`

  const api_7_inDb = await db.get(getplayerScoreQuery)
  response.send(api_7_inDb)
})
