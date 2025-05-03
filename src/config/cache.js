const redis = require("redis");
const { cache } = require("./index");

// Create a Redis client
const redisClient = redis.createClient({
  url: cache.redisURL,
});

redisClient.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

// Function to set a value in cache
const setCache = async (key, value, expiration = 3600) => {
  try {
    await redisClient.setEx(key, expiration, JSON.stringify(value));
  } catch (err) {
    console.error("❌ Error setting cache:", err);
  }
};

// Function to get a value from cache
const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("❌ Error getting cache:", err);
    return null;
  }
};

// Function to delete a key from cache
const delCache = async (key) => {
  try {
    await redisClient.del(key);
  } catch (err) {
    console.error("❌ Error deleting cache:", err);
  }
};

// Connect to Redis on startup
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("❌ Failed to connect to Redis:", err);
  }
})();

module.exports = {
  redisClient,
  setCache,
  getCache,
  delCache,
};
