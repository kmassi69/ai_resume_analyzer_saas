# AI Resume Analyzer

SaaS application that allows users to upload resumes and receive ATS scores plus AI-generated feedback.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **AI:** OpenAI API (gpt-4o-mini)

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: DATABASE_URL, JWT_SECRET, OPENAI_API_KEY
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Database

Create a PostgreSQL database and set `DATABASE_URL`:

```
postgresql://username:password@localhost:5432/ai_resume_analyzer
```

Tables are created automatically on backend startup.

## API Base URL

The frontend proxies `/api` to `http://localhost:5000` (see `frontend/vite.config.js`), so the backend must run on port 5000 for the frontend to work.

## Project Structure

```
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── db/
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── context/
└── README.md
```
