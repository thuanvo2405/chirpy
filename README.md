# 🚀 Chirpy API

A simple RESTful backend service for creating and managing short posts ("chirps"), inspired by Twitter. Built with Node.js, Express, TypeScript, and PostgreSQL.

---

## 📌 What this project does

Chirpy is a backend API that allows users to:

- Register and log in with secure authentication (JWT)

- Create, read, and delete short posts ("chirps")

- Filter and sort chirps

- Use refresh tokens for session management

- Upgrade accounts via webhook events (Chirpy Red membership)

---

## 💡 Why this project matters

This project demonstrates core backend engineering skills:

- Authentication & authorization (JWT + refresh tokens)

- Secure password hashing (argon2)

- Database design with PostgreSQL + Drizzle ORM

- REST API design (Express)

- Webhook handling (idempotent logic)

- Error handling & middleware structure

---

## ⚙️ Tech Stack

- Node.js

- Express

- TypeScript

- PostgreSQL

- Drizzle ORM

- Argon2

- JSON Web Tokens (JWT)

---

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/chirpy.git
cd chirpy
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Setup environment variables

Create a `.env` file:

```env
DB_URL=your_database_url
JWT_SECRET=your_secret_key
...
```

---

### 4. Run database migrations

```bash
npx drizzle-kit push
```

---

### 5. Start the server

```bash
npm run dev
```

Server will run at:

```text
http://localhost:8080
```

---

## 📡 API Overview

### Auth

- `POST /api/users` → Register

- `POST /api/login` → Login

- `POST /api/refresh` → Refresh access token

- `POST /api/revoke` → Revoke refresh token

### Chirps

- `POST /api/chirps` → Create chirp

- `GET /api/chirps` → Get all chirps (supports `authorId`, `sort`)

- `GET /api/chirps/:chirpId` → Get single chirp

- `DELETE /api/chirps/:chirpId` → Delete chirp

### Users

- `PUT /api/users` → Update user

### Webhooks

- `POST /api/polka/webhooks` → Upgrade user to Chirpy Red

---

## 🧪 Example Query

```bash
GET /api/chirps?authorId=123&sort=desc
```

---

## 🧠 Key Features

- 🔐 Secure authentication with JWT

- 🔄 Refresh token system with revocation

- 🧼 Profanity filtering for chirps

- ⚡ Webhook integration (Polka)

- 🧩 Modular architecture (controllers, middleware, DB)

---

## 👤 Author

Built by Thuận Võ as part of the Boot.dev backend curriculum.
