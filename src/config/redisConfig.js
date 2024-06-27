const IORedis = require("ioredis");

const connection = new IORedis({
  maxRetriesPerRequest: null,
  // Add other options as needed
});

module.exports = { redisOptions: connection };
