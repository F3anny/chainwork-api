const redis = require('redis')

const client = redis.createClient({
  url: 'redis://redis:6379',
  port: 6379
})

client.on('error', (err) => {
  console.error('Redis cache error:', err)
})

client.on('connect', () => {
  console.log('Redis cache connected ✅')
})

client.connect()

// save data to cache with expiry time
const setCache = async (key, data, expirySeconds = 60) => {
  try {
    await client.setEx(key, expirySeconds, JSON.stringify(data))
  } catch (err) {
    console.error('Cache set error:', err)
  }
}

// get data from cache
const getCache = async (key) => {
  try {
    const data = await client.get(key)
    return data ? JSON.parse(data) : null
  } catch (err) {
    console.error('Cache get error:', err)
    return null
  }
}

// delete cache when data changes
const deleteCache = async (key) => {
  try {
    await client.del(key)
  } catch (err) {
    console.error('Cache delete error:', err)
  }
}

module.exports = { setCache, getCache, deleteCache }