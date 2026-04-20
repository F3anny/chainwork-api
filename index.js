const app = require('./app')
const runMigrations = require('./src/db/migrate')

const PORT = process.env.PORT || 3000

const start = async () => {
  await runMigrations()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()