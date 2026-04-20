const emailQueue = require('../queues/EmailQueue')
const nodemailer = require('nodemailer')

// create a fake email transporter for testing
// this logs emails to console instead of sending real ones
const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 1025,
  ignoreTLS: true
})

// this function runs every time a job is added to the queue
emailQueue.process(async (job) => {
  const { to, subject, body } = job.data

  console.log(`📧 Sending email to ${to}...`)
  console.log(`Subject: ${subject}`)
  console.log(`Body: ${body}`)

  // in production you would use real SMTP here
  // like SendGrid, Mailgun etc
  try {
    await transporter.sendMail({
      from: 'jobboard@app.com',
      to,
      subject,
      text: body
    })
    console.log(`✅ Email sent to ${to}`)
  } catch (err) {
    // even if email fails, log it but don't crash
    console.log(`📧 Email logged (no real SMTP):`, { to, subject })
  }
})

console.log('Email worker running ✅')