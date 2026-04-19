const express = require('express')
const router = express.Router()
const db = require('../db')
const auth = require('../middleware/auth')
const { body, validationResult } = require('express-validator')
const emailQueue = require('../queues/emailQueue')
const { setCache, getCache, deleteCache } = require('../cache')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}

const jobRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
]

// GET ALL JOBS with caching + pagination
router.get('/', async (req, res) => {
  try {
    // pagination — default page 1, 10 jobs per page
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    // create a unique cache key for this page
    const cacheKey = `jobs:page:${page}:limit:${limit}`

    // check cache first
    const cached = await getCache(cacheKey)
    if (cached) {
      console.log('✅ Serving from cache')
      return res.json(cached)
    }

    console.log('🔍 Fetching from database')

    // get total count for pagination info
    const countResult = await db.query('SELECT COUNT(*) FROM jobs')
    const total = parseInt(countResult.rows[0].count)

    // get jobs for this page
    const result = await db.query(
      `SELECT jobs.*, users.name as poster_name 
       FROM jobs JOIN users ON jobs.posted_by = users.id 
       ORDER BY jobs.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    const response = {
      jobs: result.rows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }

    // save to cache for 60 seconds
    await setCache(cacheKey, response, 60)

    res.json(response)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET ONE JOB with caching
router.get('/:id', async (req, res) => {
  try {
    const cacheKey = `job:${req.params.id}`

    // check cache first
    const cached = await getCache(cacheKey)
    if (cached) {
      console.log('✅ Serving from cache')
      return res.json(cached)
    }

    const result = await db.query('SELECT * FROM jobs WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' })
    }

    // cache for 5 minutes
    await setCache(cacheKey, result.rows[0], 300)

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST A JOB
router.post('/', auth, jobRules, validate, async (req, res) => {
  try {
    const { title, company, description, location, salary } = req.body
    const result = await db.query(
      `INSERT INTO jobs (title, company, description, location, salary, posted_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, company, description, location, salary, req.userId]
    )

    // clear jobs cache since new job was added
    await deleteCache(`jobs:page:1:limit:10`)

    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// APPLY TO A JOB
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const { cover_letter } = req.body
    const job = await db.query('SELECT * FROM jobs WHERE id = $1', [req.params.id])
    if (job.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' })
    }

    const user = await db.query('SELECT * FROM users WHERE id = $1', [req.userId])
    const result = await db.query(
      `INSERT INTO applications (job_id, user_id, cover_letter)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.params.id, req.userId, cover_letter]
    )

    await emailQueue.add({
      to: user.rows[0].email,
      subject: `Application received — ${job.rows[0].title}`,
      body: `Hi ${user.rows[0].name}, your application to ${job.rows[0].title} at ${job.rows[0].company} was received!`
    })

    res.status(201).json({
      message: 'Application submitted!',
      application: result.rows[0]
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE A JOB
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM jobs WHERE id = $1 AND posted_by = $2 RETURNING *',
      [req.params.id, req.userId]
    )
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Not allowed' })
    }

    // clear cache for this job
    await deleteCache(`job:${req.params.id}`)
    await deleteCache(`jobs:page:1:limit:10`)

    res.json({ message: 'Job deleted!' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router