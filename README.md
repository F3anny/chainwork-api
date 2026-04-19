# ⚡ Chainwork API

> Production-grade Job Board REST API built with Node.js, PostgreSQL, Redis, and Bull message queues.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)

## 🚀 Features

- **JWT Authentication** — secure login and protected routes
- **Input Validation** — all endpoints validated with express-validator
- **Rate Limiting** — protection against spam and brute force attacks
- **Security Headers** — helmet.js protecting against common attacks
- **Redis Caching** — 100x faster responses with intelligent cache invalidation
- **Message Queues** — Bull + Redis for non-blocking background email jobs
- **Pagination** — efficient handling of large datasets
- **Database Indexes** — optimized PostgreSQL queries

## 🏗️ Architecture
Client Request
↓
Rate Limiter + Security Headers (helmet)
↓
JWT Auth Middleware
↓
Input Validation
↓
Redis Cache Check → hit? return instantly ⚡
↓
PostgreSQL Database
↓
Bull Queue → Email Worker (background) 📧
↓
Response

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | REST API framework |
| PostgreSQL | Primary database |
| Redis | Caching + message queue backend |
| Bull | Job queue management |
| JWT | Authentication tokens |
| bcrypt | Password hashing |
| helmet | Security headers |
| express-rate-limit | Rate limiting |
| express-validator | Input validation |
| nodemailer | Email notifications |

## 📁 Project Structure
chainwork-api/
src/
cache/
index.js        ← Redis cache helpers
db/
index.js        ← PostgreSQL connection
middleware/
auth.js         ← JWT verification
queues/
emailQueue.js   ← Bull email queue
routes/
users.js        ← auth endpoints
jobs.js         ← job endpoints
workers/
emailWorker.js  ← background email processor
.env.example
index.js
README.md

## ⚙️ Setup

**1. Clone the repo**
```bash
git clone https://github.com/YOURUSERNAME/chainwork-api.git
cd chainwork-api
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**
```bash
cp .env.example .env
```

Fill in your `.env`:
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/jobboard
JWT_SECRET=yoursecretkey
PORT=3000

**4. Set up the database**
```bash
psql -U postgres
```
```sql
CREATE DATABASE jobboard;
\c jobboard

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  company VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(100),
  salary VARCHAR(100),
  posted_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id),
  user_id INTEGER REFERENCES users(id),
  cover_letter TEXT,
  applied_at TIMESTAMP DEFAULT NOW()
);
```

**5. Start Redis**

Make sure Redis is running locally on port 6379.

**6. Run the server**
```bash
npm run dev
```

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/users/register` | Register new user | ❌ |
| POST | `/users/login` | Login and get token | ❌ |

### Jobs
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/jobs` | Get all jobs (paginated + cached) | ❌ |
| GET | `/jobs/:id` | Get single job (cached) | ❌ |
| POST | `/jobs` | Post a new job | ✅ |
| POST | `/jobs/:id/apply` | Apply to a job | ✅ |
| DELETE | `/jobs/:id` | Delete a job | ✅ |

### Pagination
GET /jobs?page=1&limit=10
GET /jobs?page=2&limit=5

## 🔒 Security

- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens expire in 7 days
- Rate limited to 100 requests per 15 minutes
- Auth endpoints limited to 10 requests per 15 minutes
- All inputs validated and sanitized
- Security headers via helmet.js

## 📧 Background Jobs

Job applications trigger an automatic email confirmation sent via Bull message queue — the API responds instantly without waiting for the email to send.
POST /jobs/:id/apply
↓
Application saved ✅
↓
Email job added to Bull queue (1ms)
↓
API responds instantly
↓
[Background] Worker sends confirmation email 📧

## 🚀 Coming Soon

- [ ] Blockchain credential verification (MintCert integration)
- [ ] On-chain job contract escrow
- [ ] Web3 wallet authentication
- [ ] IPFS job posting storage

## 📄 License

MIT