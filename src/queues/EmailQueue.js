const Bull = require('bull')

// create a queue called 'emails'
// Bull automatically connects to Redis
const emailQueue = new Bull('emails', {
  redis: {
    host: 'localhost',
    port: 6379
  }
})

console.log('Email queue ready ✅')

module.exports = emailQueue