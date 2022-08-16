const keys = require("./keys");

// Express App Setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool } = require("pg");
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});

pgClient.on("connect", (client) => {
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => console.error(err));
});
pgClient.connect();

// Redis Client Setup
const redis = require("redis");
const redisClient = redis.createClient({
  url: `redis://redis:${keys.redisPort}`,
});
redisClient.connect();
const redisPublisher = redisClient.duplicate();
redisPublisher.connect();

// Express route handlers

app.get("/", (req, res) => {
  res.send("Hi");
});

app.get("/values/all", async (req, res) => {
  try {
    const values = await pgClient.query("SELECT * from values");
    res.json(values.rows);
  } catch (err) {
    console.log("err", err);
  }
});

app.get("/values/current", async (req, res) => {
  const values = await redisClient.hGetAll("values");
  return res.json(values);
});

app.post("/values", async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send("Index too high");
  }

  redisClient.hSet("values", index, "Nothing yet!");
  redisPublisher.publish("insert", index);
  pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);

  res.send({ working: true });
});

const port = 5000;
app.listen(port, () => console.log(`Listening on port ${port}`));
