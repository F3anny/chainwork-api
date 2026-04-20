const express = require('express')
const app = express()
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const runMigrations = require('./src/db/migrate')

// start background workers
require('./src/workers/emailWorker')

app.use(helmet())
app.use(express.json())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, slow down!' }
})
app.use(limiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts!' }
})
app.use('/users/login', authLimiter)
app.use('/users/register', authLimiter)

app.use('/users', require('./src/routes/users'))
app.use('/jobs', require('./src/routes/jobs'))

app.get('/', (req, res) => {
  res.json({ message: 'Job Board API is running 🚀' })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

const PORT = process.env.PORT || 3000

const start = async () => {
  await runMigrations()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()