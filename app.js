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

//API  : Returns a specific player based on the player ID

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
