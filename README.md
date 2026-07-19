# AI Resume Analyser — Backend

Production-ready backend for an AI-powered resume analysis platform, built with Node.js, Express, MongoDB, and Google Gemini. Follows an MVC-style architecture with clear separation between routes, controllers, services, and models.

## Features

- **Authentication** — register, login, JWT-protected routes, logout, get/update profile
- **Resume management** — upload PDF/DOCX resumes (validated by type and size), automatic text extraction, upload history, fetch/delete a specific resume
- **AI-powered analysis** — Google Gemini integration that scores a resume for ATS-friendliness, extracts technical/soft skills, flags missing skills, suggests improvements, generates a summary, flags grammar/readability issues, and can match a resume against a job description
- **Persistence** — MongoDB collections for users, resumes, and analyses, supporting multiple resumes and analysis runs per user
- **Security** — bcrypt password hashing, Helmet security headers, CORS, rate limiting, and thorough input validation
- **Robust error handling** — centralized error middleware with consistent JSON error responses and correct HTTP status codes

## Tech Stack

- **Runtime:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcryptjs
- **File uploads:** Multer (PDF/DOCX)
- **Text extraction:** pdf-parse, mammoth
- **AI:** Google Gemini (`@google/generative-ai`)
- **Security:** Helmet, CORS, express-rate-limit, express-validator

## Project Structure

```
backend/
├── config/            # DB + Gemini client setup
├── controllers/        # Request handlers
├── middleware/         # Auth, upload, error, validation
├── models/             # Mongoose schemas
├── routes/             # Express routers
├── services/           # File parsing + Gemini AI logic
├── utils/               # ApiError, asyncHandler, logger, token helpers
├── uploads/             # Uploaded resume files (gitignored)
├── app.js
├── server.js
└── .env.example
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```
   | Variable | Description |
   |---|---|
   | `PORT` | Port the server listens on |
   | `MONGO_URI` | MongoDB connection string |
   | `JWT_SECRET` | Secret used to sign JWTs |
   | `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
   | `GEMINI_API_KEY` | API key from [Google AI Studio](https://aistudio.google.com/) |
   | `GEMINI_MODEL` | Gemini model name (default `gemini-1.5-flash`) |
   | `MAX_FILE_SIZE_MB` | Max resume upload size in MB |
   | `CLIENT_URL` | Allowed CORS origin |
   | `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | Global rate limit config |

3. Run in development (auto-reload):
   ```bash
   npm run dev
   ```
4. Run in production:
   ```bash
   npm start
   ```

## Deployment (Render / Railway)

- Set the environment variables above in the platform's dashboard.
- Build command: `npm install`
- Start command: `npm start`
- Ensure a persistent disk or external storage is attached if you need uploaded files to survive redeploys (Render/Railway's default filesystem is ephemeral) — for a portfolio project, local `uploads/` is fine.
- Use a hosted MongoDB instance (e.g. MongoDB Atlas) for `MONGO_URI`.

## Authentication

All protected routes require an `Authorization: Bearer <token>` header. Tokens are returned from `/api/auth/register` and `/api/auth/login`.

## API Reference

Base URL: `/api`

### Auth

#### `POST /api/auth/register`
Register a new user.

Request:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "StrongP@ss1"
}
```

Response `201`:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "id": "665f1...", "name": "Jane Doe", "email": "jane@example.com", "phone": "", "bio": "" },
    "token": "eyJhbGciOi..."
  }
}
```

#### `POST /api/auth/login`
Request:
```json
{ "email": "jane@example.com", "password": "StrongP@ss1" }
```
Response `200`: same shape as register.

#### `GET /api/auth/profile` *(protected)*
Response `200`:
```json
{ "success": true, "message": "Profile fetched successfully", "data": { "user": { "id": "665f1...", "name": "Jane Doe", "email": "jane@example.com" } } }
```

#### `PUT /api/auth/profile` *(protected)*
Request (all fields optional):
```json
{ "name": "Jane A. Doe", "phone": "+1 555 0100", "bio": "Full-stack engineer", "password": "NewP@ss2" }
```

#### `POST /api/auth/logout` *(protected)*
Response `200`:
```json
{ "success": true, "message": "Logged out successfully", "data": null }
```

### Resume

#### `POST /api/resume/upload` *(protected, multipart/form-data)*
Field name: `resume` (PDF or DOCX, max `MAX_FILE_SIZE_MB`).

```bash
curl -X POST http://localhost:5000/api/resume/upload \
  -H "Authorization: Bearer <token>" \
  -F "resume=@/path/to/resume.pdf"
```

Response `201`:
```json
{
  "success": true,
  "message": "Resume uploaded and parsed successfully",
  "data": {
    "resume": { "id": "665f2...", "originalName": "resume.pdf", "fileType": "pdf", "fileSize": 84213, "createdAt": "2026-07-17T10:00:00.000Z" }
  }
}
```

#### `GET /api/resume/history` *(protected)*
Returns all resumes uploaded by the current user (without extracted text/file path).

#### `GET /api/resume/:id` *(protected)*
Returns full resume details including extracted text.

#### `DELETE /api/resume/:id` *(protected)*
Deletes the resume file, record, and any associated analyses.

### Analysis

#### `POST /api/analysis/analyze` *(protected)*
Request:
```json
{ "resumeId": "665f2...", "jobDescription": "We are looking for a Node.js developer with React experience..." }
```
`jobDescription` is optional — omit it for a general resume analysis.

Response `201`:
```json
{
  "success": true,
  "message": "Resume analyzed successfully",
  "data": {
    "analysis": {
      "id": "665f3...",
      "atsScore": 78,
      "jobMatchScore": 65,
      "summary": "Experienced backend engineer with strong Node.js and database skills...",
      "technicalSkills": ["Node.js", "Express", "MongoDB"],
      "softSkills": ["Communication", "Teamwork"],
      "missingSkills": ["Docker", "Kubernetes"],
      "suggestions": ["Quantify achievements with metrics", "Add a projects section"],
      "grammarIssues": [],
      "resume": "665f2...",
      "user": "665f1...",
      "createdAt": "2026-07-17T10:05:00.000Z"
    }
  }
}
```

#### `GET /api/analysis/:id` *(protected)*
Returns a previously generated analysis, with the linked resume populated.

## Error Response Shape

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "A valid email is required" }]
}
```

## Security Notes

- Passwords are hashed with bcrypt (10 salt rounds) and never returned in API responses.
- Helmet sets secure HTTP headers; CORS is restricted to `CLIENT_URL`.
- Global and auth-specific rate limiting mitigate brute-force/abuse.
- All inputs are validated with `express-validator`; MongoDB `:id` params are validated before querying.
- Uploaded file MIME type and size are enforced by Multer before the file touches disk.
