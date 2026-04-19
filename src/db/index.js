const { Pool } = require('pg')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false  // ← this fixes the SSL error for local development
})

pool.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err)
  } else {
    console.log('Connected to Postgres ✅')
  }
})

module.exports = pool