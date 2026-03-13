# AI Resume Analyzer - Backend

Express.js API for resume upload, AI analysis, and user authentication.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Auth:** JWT + bcrypt
- **File Upload:** Multer (PDF, DOCX)
- **AI:** OpenAI API (gpt-4o-mini)
- **Parsers:** pdf-parse, mammoth

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. PostgreSQL Database

Create a PostgreSQL database:

```bash
createdb ai_resume_analyzer
```

Or use psql:
```sql
CREATE DATABASE ai_resume_analyzer;
```

### 3. Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | Token expiry (e.g., 7d) |
| `OPENAI_API_KEY` | OpenAI API key for AI analysis |
| `MAX_FILE_SIZE` | Max upload size in bytes (default: 5242880 = 5MB) |

Example `DATABASE_URL`:
```
postgresql://username:password@localhost:5432/ai_resume_analyzer
```

### 4. Run the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server runs at `http://localhost:5000`. Tables are auto-created on startup.

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### Resume (requires `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resume/upload` | Upload & analyze resume (form-data, field: `resume`) |
| GET | `/api/resume/history` | Get user's resume history |
| GET | `/api/resume/:id` | Get single resume analysis |

## Project Structure

```
backend/
├── controllers/
│   ├── authController.js
│   └── resumeController.js
├── routes/
│   ├── authRoutes.js
│   └── resumeRoutes.js
├── middleware/
│   └── authMiddleware.js
├── services/
│   ├── aiService.js
│   └── resumeParser.js
├── db/
│   ├── db.js
│   └── schema.sql
├── uploads/           (auto-created)
├── server.js
├── package.json
└── .env
```
