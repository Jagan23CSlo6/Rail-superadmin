const redis = require('redis');

let redisClient;

if (!redisClient) {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });
}

// 🔑 Connect only if not already connected
async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Connected to Redis');
  }
}

connectRedis();

module.exports = redisClient;
