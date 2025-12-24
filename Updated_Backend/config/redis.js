const redis = require('redis');

// Create Redis client
const redisClient = redis.createClient({
    url: process.env.REDIS_URL
});

// Error handling
redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

// Connect to Redis
redisClient.connect().then(() => {
    console.log('Connected to Redis');
}).catch((err) => {
    console.error('Failed to connect to Redis:', err);
});

module.exports = redisClient;
