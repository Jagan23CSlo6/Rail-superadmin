const redis = require("redis");

let redisClient; // global, reused across Lambda invocations

async function getRedisClient() {
  if (!redisClient || !redisClient.isOpen) {
    redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        connectTimeout: 10000
      },
      password: process.env.REDIS_PASSWORD
    });

    redisClient.on("connect", () => console.log("✅ Redis TCP connected"));
    redisClient.on("ready", () => console.log("✅ Redis ready for commands"));
    redisClient.on("error", (err) => console.error("❌ Redis Client Error:", err.message));

    await redisClient.connect();
  }

  return redisClient;
}

module.exports = { getRedisClient };
