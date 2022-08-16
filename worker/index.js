const keys = require("./keys");
const redis = require("redis");

const createApp = async () => {
  const redisClient = redis.createClient({
    url: `redis://redis:${keys.redisPort}`,
  });
  await redisClient.connect();
  const sub = redisClient.duplicate();
  await sub.connect();

  function fib(index) {
    if (index < 2) return 1;
    return fib(index - 1) + fib(index - 2);
  }

  await sub.subscribe("insert", (message) => {
    redisClient.hSet("values", message, fib(parseInt(message)));
  });
};

createApp();
