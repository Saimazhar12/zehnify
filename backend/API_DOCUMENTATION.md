# Zehnify Backend API Documentation

This document serves as a comprehensive guide for integrating the Zehnify Backend with front-end applications. It covers authentication, structured treatment chat, clinical reports, and doctor workflows.

See also: [TREATMENT_FLOW.md](./TREATMENT_FLOW.md) for the full patient/doctor journey and state machines.

## Getting Started

### Base URL
All API requests must be prefixed with the base URL:
`http://localhost:3000`

### Authentication Flow
Zehnify uses a single JWT access token (1-day expiry):
1. **Access Token**: Returned in the response body on signup, signin, and Google OAuth callback. Store it client-side and send it in the `Authorization` header as a Bearer token for protected routes.
2. When the token expires, the client receives `401` and the user must sign in again.

---

## 1. Authentication

### Local Sign Up
Create a new user account.
- **Endpoint:** `POST /auth/local/signup`
- **Body:** `JSON`
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@umt.edu.pk",
    "password": "securePassword123",
    "dateOfBirth": "2000-01-01",
    "acceptedTerms": true
  }
  ```
- **Constraints:**
  - `email`: Must end with `@umt.edu.pk`.
  - `password`: Minimum 8 characters.
  - `dateOfBirth`: ISO Date string.
  - `acceptedTerms`: Must be `true` — records acceptance timestamp on the user.
  - All signups are created with role `user` (patient). Admins promote users to `doctor` via `PATCH /users/:id`.
- **Response:** `201 Created`
  Returns `access_token` and user profile.

### Local Sign In
- **Endpoint:** `POST /auth/local/signin`
- **Body:** `{ "email": "...", "password": "..." }`
- **Response:** `200 OK` with `access_token` and user profile.

### Google Authentication
- **Initiate:** `GET /auth/google`
- **Callback:** `GET /auth/google/callback` — redirects to `{FRONTEND_URL}/auth/google/callback?access_token=...&user=...`

### Logout
- **Endpoint:** `POST /auth/logout`
- **Headers:** `Authorization: Bearer <access_token>`

---

## 2. Structured Treatment System

### Get Treatment Status (User)
- **Endpoint:** `GET /treatment/status`
- **Roles:** `user`
- **Response:**
  ```json
  {
    "hasActivePlan": true,
    "planId": "uuid",
    "status": "intake_in_progress",
    "intakeProgress": {
      "chatId": "uuid",
      "userMessages": 5,
      "required": 15,
      "complete": false
    },
    "assignments": [],
    "completionPercentage": 33,
    "reportGeneratable": false,
    "hasInitialReport": false,
    "finalReportGeneratable": false
  }
  ```

### Get Assigned Sections (User)
- **Endpoint:** `GET /treatment/assignments`
- **Roles:** `user`

### Start Section Chat (User)
- **Endpoint:** `POST /treatment/assignments/:id/start`
- **Roles:** `user`
- **Description:** Creates a chat for an assigned section. Sections unlock sequentially by `sortOrder`.

---

## 3. Chatting System

All chat routes require `Authorization: Bearer <access_token>`.

### Send Message
- **Endpoint:** `POST /chat/message`
- **Body:**
  ```json
  {
    "chatId": "uuid-optional",
    "type": 1,
    "content": "I've been feeling stressed lately."
  }
  ```
- **Chat Types:**

| Type | Name | Limit | Started By |
|------|------|-------|------------|
| 1 | Intake Assessment | 15 user messages | Patient (omit chatId) |
| 2 | Mood & Emotional Awareness | 20 user messages | Doctor assigns |
| 3 | Cognitive Restructuring | 20 user messages | Doctor assigns |
| 4 | Behavioral Activation | 20 user messages | Doctor assigns |
| 5 | Coping & Stress Management | 20 user messages | Doctor assigns |
| 6 | Relapse Prevention & Goals | 20 user messages | Doctor assigns |

- **Rules:**
  - New chats without `chatId` only allowed for type 1 (intake)
  - Section chats (types 2-6) must be started via `POST /treatment/assignments/:id/start`
  - Message limits are enforced; completed chats reject new messages

- **Response:**
  ```json
  {
    "chatId": "uuid",
    "userMessage": { "id": "...", "content": "...", "sender": "user" },
    "aiMessage": { "id": "...", "content": "...", "sender": "ai" },
    "messagesRemaining": 10,
    "userMessageCount": 5,
    "messageLimit": 15,
    "chatStatus": "active",
    "planStatus": "intake_in_progress"
  }
  ```

### Get Chat History
- **Endpoint:** `GET /chat/history`
- **Query Params:** `type` (optional), `treatmentPlanId` (optional)

---

## 4. Doctor Endpoints

All require `Authorization: Bearer <access_token>` and role `doctor` or `admin`.

### List Patients
- **Endpoint:** `GET /doctor/patients`
- **Response:** Array of patients with treatment status flags:
  ```json
  [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@umt.edu.pk",
      "treatmentStatus": "intake_complete",
      "intakeComplete": true,
      "reportGeneratable": true,
      "hasInitialReport": false,
      "sectionsAssigned": 0,
      "sectionsComplete": 0,
      "finalReportGeneratable": false,
      "completionPercentage": 100
    }
  ]
  ```

### Get Patient Treatment Detail
- **Endpoint:** `GET /doctor/patients/:userId/treatment`
- **Response:** Full plan, intake progress, assignments, reports, intake chat with messages.

### Assign Sections
- **Endpoint:** `POST /doctor/patients/:userId/assign-sections`
- **Body:**
  ```json
  {
    "sections": [
      { "sectionType": 2, "sortOrder": 1, "doctorNotes": "Focus on mood patterns" },
      { "sectionType": 3, "sortOrder": 2 },
      { "sectionType": 5, "sortOrder": 3 }
    ]
  }
  ```
- **Rules:**
  - 1-5 sections from types 2-6
  - No duplicate section types
  - Requires intake complete + initial report generated
  - Can only assign once per treatment plan

### Get Patient Reports
- **Endpoint:** `GET /doctor/patients/:userId/reports`

---

## 5. Clinical Reports

Requires `Authorization: Bearer <access_token>` and role `doctor` or `admin`.

### Generate Initial Report
- **Endpoint:** `POST /report/generate`
- **Body:** `{ "userId": "uuid-of-the-patient" }`
- **Requires:** 15 intake user messages
- **Response:**
  ```json
  {
    "report": "## Clinical Summary Report\n\n...",
    "reportId": "uuid"
  }
  ```

### Generate Final Report
- **Endpoint:** `POST /report/generate-final`
- **Body:** `{ "userId": "uuid-of-the-patient" }`
- **Requires:** All assigned sections completed
- **Response:** Same shape as initial report

### Download Initial PDF
- **Endpoint:** `GET /report/download?userId=uuid`
- **Response:** `application/pdf`

### Download Final PDF
- **Endpoint:** `GET /report/download-final?userId=uuid`
- **Response:** `application/pdf`

### Report Generation Workflow

1. **Patient completes intake** (15 messages via type 1 chat)
2. **Doctor checks** `GET /doctor/patients` — look for `reportGeneratable: true`
3. **Doctor generates initial report** — `POST /report/generate`
4. **Doctor assigns sections** — `POST /doctor/patients/:userId/assign-sections`
5. **Patient completes sections** — start via `/treatment/assignments/:id/start`, message via `/chat/message`
6. **Doctor generates final report** when `finalReportGeneratable: true` — `POST /report/generate-final`

---

## 6. Mood Analytics

During active chat sessions, the frontend captures webcam frames every 3 seconds and sends them for facial emotion analysis. Up to **50 accepted snapshots** are stored per `chatId`. Rejected frames (e.g. no face detected) are saved for debugging but do not count toward the cap.

### Analyze Frame
- **Endpoint:** `POST /mood/analyze`
- **Headers:** `Authorization: Bearer <access_token>`
- **Body:** `multipart/form-data`
  - `file` — JPEG or PNG image (max 2MB)
  - `chatId` — UUID of the active chat session
- **Response:**
  ```json
  {
    "capped": false,
    "scansUsed": 12,
    "scansLimit": 50,
    "snapshot": {
      "id": "uuid",
      "chatId": "uuid",
      "accepted": true,
      "reason": "ok",
      "prediction": "happy",
      "confidence": 0.6356,
      "allEmotions": { "happy": 0.63, "neutral": 0.22 },
      "sequenceNumber": 12,
      "createdAt": "2026-07-11T12:00:00.000Z"
    }
  }
  ```
- When the 50 accepted snapshot cap is reached, `capped: true` and `snapshot: null`.

### List Chat Snapshots
- **Endpoint:** `GET /mood/chat/:chatId`
- **Roles:** Doctor, Admin

### Chat Mood Summary
- **Endpoint:** `GET /mood/chat/:chatId/summary`
- **Roles:** Doctor, Admin
- **Response:** `dominantEmotion`, `averageConfidence`, `emotionDistribution`, `averageEmotions`, `acceptedCount`, `totalAttempts`, `scansLimit`, `latestSnapshot`

### Patient Mood Insights Dashboard
- **Endpoint:** `GET /mood/patient/:userId/insights`
- **Roles:** Doctor, Admin
- **Response:**
  ```json
  {
    "overall": {
      "totalScans": 42,
      "totalSessions": 2,
      "dominantEmotion": "neutral",
      "happinessScore": 38,
      "averageConfidence": 62,
      "emotionDistribution": { "happy": 10, "neutral": 20, "sad": 12 }
    },
    "sessions": [
      {
        "chatId": "uuid",
        "chatTitle": "Intake Assessment",
        "chatType": 1,
        "chatStatus": "completed",
        "startedAt": "2026-07-11T12:00:00.000Z",
        "dominantEmotion": "neutral",
        "happinessScore": 35,
        "averageConfidence": 0.58,
        "acceptedCount": 18,
        "emotionDistribution": {},
        "averageEmotions": { "happy": 0.32, "sad": 0.21 },
        "timeline": [
          {
            "scan": 1,
            "label": "Scan 1",
            "prediction": "neutral",
            "confidence": 58,
            "happiness": 22,
            "neutral": 61,
            "sad": 8,
            "angry": 2,
            "createdAt": "2026-07-11T12:00:03.000Z"
          }
        ]
      }
    ]
  }
  ```

### Patient Mood Summaries (Doctor/Admin)
- **Endpoint:** `GET /mood/patient/:userId/summary`
- **Roles:** `doctor`, `admin`
- **Response:** Array of per-chat summaries with `chatTitle`, `chatType`, `chatStatus`, and aggregated mood data.

**Environment:** `MOOD_API_URL` — Hugging Face FER API endpoint (default: `https://mhs1010-fer-emotion-api.hf.space/predict`)

---

## 7. Wellness Articles

### List Published Articles
- **Endpoint:** `GET /articles`
- **Roles:** Any authenticated user (patients read in Wellness Library)
- **Response:** Array with `title`, `excerpt`, `type`, `readTimeMinutes`, `author` (`firstName`, `lastName`)

### Get Article
- **Endpoint:** `GET /articles/:id`
- **Roles:** Any authenticated user
- **Response:** Full article including `content`

### List My Articles
- **Endpoint:** `GET /articles/mine`
- **Roles:** `doctor`, `admin`

### Create Article
- **Endpoint:** `POST /articles`
- **Roles:** `doctor`, `admin`
- **Body:** `{ "title", "excerpt", "content", "type"?: "article"|"guide", "readTimeMinutes"?: number, "published"?: boolean }`

### Update Article
- **Endpoint:** `PATCH /articles/:id`
- **Roles:** `doctor`, `admin` (own articles only)

### Delete Article
- **Endpoint:** `DELETE /articles/:id`
- **Roles:** `doctor`, `admin` (own articles only)

**Seed data:** On first startup (empty table), 4 health articles are auto-seeded and attributed to the first doctor/admin account.

---

## 8. Admin User Management (Admin Only)

### Get All Users
- **Endpoint:** `GET /users`
- **Response:** Users with treatment status fields (`reportGeneratable`, `finalReportGeneratable`, etc.)

### Update User
- **Endpoint:** `PATCH /users/:id`

### Delete User
- **Endpoint:** `DELETE /users/:id`

---

## 9. Background Jobs

### Send Email Job
- **Endpoint:** `POST /jobs/email`
- **Body:** `{ "to": "...", "subject": "...", "body": "..." }`

Welcome emails are sent automatically on signup.

---

## 10. Utility / Health
- **GET `/`**: Returns a simple hello message.
- **GET `/redis-test`**: Verifies Redis connectivity.

---

## Environment Variables

See `.env.example` for all required variables including:
- `DB_*` — PostgreSQL (Aiven)
- `REDIS_URL` — Upstash Redis
- `GEMINI_API_KEY` — Google Gemini API key
- `GEMINI_MODEL` — optional model override (defaults to `gemini-3.5-flash-lite`)
- `MOOD_API_URL` — Hugging Face facial emotion API
- `AT_SECRET` — JWT secret (access token, 1-day expiry)
- `MAIL_*` — SMTP email
- `FRONTEND_URL` — Frontend URL for email links
