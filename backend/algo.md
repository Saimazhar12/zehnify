# Zehnify — System Algorithms

Pseudocode-style overview of how the web frontend, NestJS backend, AI module, treatment flow, mood pipeline, and supporting features work together.

---

## 0. System Overview

```
┌─────────────────┐     HTTPS / Axios      ┌──────────────────┐
│  React Frontend │ ◄────────────────────► │  NestJS Backend  │
│  (Vercel)       │   Bearer JWT           │  (Render)        │
└────────┬────────┘                        └────────┬─────────┘
         │                                          │
         │ Google OAuth start                       ├── Google Gemini (Flash-Lite)
         └──────────────► Backend /auth/google      ├── Hugging Face Mood API
                                                    ├── Postgres (TypeORM)
                                                    └── Redis / BullMQ (email)
```

**Roles:** `user` (patient) · `doctor` · `admin`

---

## 1. Bootstrap

### Backend

```
BOOTSTRAP:
  load env (ConfigModule)
  connect Postgres (TypeORM, synchronize)
  connect Redis
  mount modules: Auth, User, Chat, Treatment, Report, Mood, Journal, Article, Job, AI
  CORS ← FRONTEND_URL, BACKEND_URL (fallback localhost)
  listen on PORT (default 3000)
```

### Frontend

```
BOOTSTRAP:
  BrowserRouter
  AppProvider  ← hydrate user + token from localStorage
  App routes   ← public + ProtectedRoute by role
```

---

## 2. Authentication

### Local Signup

```
FUNCTION signup(email, password, profile, acceptedTerms):
  REQUIRE email endsWith "@umt.edu.pk"
  REQUIRE acceptedTerms = true
  IF userExists(email): FAIL "already exists"

  hash ← bcrypt(password)
  user ← createUser(role=USER, hash, profile, acceptedTermsAt=now)
  token ← jwt.sign({ sub: user.id, email, role }, AT_SECRET, expires=1d)
  queueWelcomeEmail(user)   // best-effort

  RETURN { access_token: token, user }
```

### Local Signin

```
FUNCTION signin(email, password):
  user ← findByEmail(email)
  IF not user OR bcrypt.compare fails: FAIL 403
  token ← jwt.sign(...)
  RETURN { access_token, user }
```

### Frontend Login / Signup

```
FUNCTION handleLogin(email, password, selectedRole):
  response ← POST /auth/local/signin
  IF response.user.role ≠ selectedRole AND role ≠ admin: FAIL role mismatch
  saveSession(token, user)
  navigate(dashboardForRole(user.role))
    // user → /app | doctor → /doctor | admin → /admin

FUNCTION handleSignUp(...):
  // always creates patient (role=user); admin promotes later
  response ← POST /auth/local/signup
  saveSession + navigate /app
```

### Google OAuth

```
FRONTEND:
  redirect browser → BACKEND_URL/auth/google

BACKEND GET /auth/google:
  Passport → Google consent (email, profile)

BACKEND GET /auth/google/callback:
  email ← Google profile email
  REQUIRE email endsWith "@umt.edu.pk"
  IF user exists: update googleId
  ELSE: create user (no password), queue welcome email
  token ← jwt.sign(...)
  redirectPath ← /app | /doctor | /admin by role
  payload ← base64url({ access_token, user, redirectPath })
  REDIRECT FRONTEND_URL/auth/google/callback#payload

FRONTEND /auth/google/callback:
  payload ← decode(hash) OR query
  IF invalid → /login?error=...
  ELSE saveSession + navigate(redirectPath)
```

### JWT Guard (every protected API)

```
FUNCTION AtGuard(request):
  token ← Authorization Bearer
  payload ← jwt.verify(token, AT_SECRET)
  request.user ← { sub, email, role }
```

---

## 3. Frontend Routing & Guards

```
ROUTES:
  public:  /, /login, /signup, /auth/google/callback, marketing pages
  /app/*   ← roles: user, admin     (PatientApp)
  /doctor* ← roles: doctor, admin
  /admin   ← roles: admin

FUNCTION ProtectedRoute(allowedRoles):
  IF no session → /login
  IF role not in allowedRoles → redirect to that role's home
  ELSE render page
```

**Axios client**

```
baseURL ← VITE_API_URL OR "/api"   // local Vite proxies /api → backend
ON request: attach Bearer token; reject if JWT expired
ON 401: clear session → /login
```

---

## 4. Treatment State Machine

```
Plan statuses:
  intake_in_progress
       ↓  (patient finishes N intake messages)
  intake_complete
       ↓  (doctor generates initial report + assigns sections)
  sections_assigned
       ↓  (patient starts first section)
  sections_in_progress
       ↓  (all assigned sections completed)
  sections_complete
       ↓
  closed   (reserved)

Section assignment statuses:
  assigned → in_progress → completed

Unlock rule:
  section K unlocked IFF all sections with sortOrder < K are completed
```

### Chat types

| Type | Meaning | User message limit (env) |
|------|---------|--------------------------|
| 1 | Intake assessment | `INTAKE_USER_MESSAGE_LIMIT` (default 15) |
| 2–6 | CBT therapeutic sections | `SECTION_USER_MESSAGE_LIMIT` (default 20) |

---

## 5. Chat + AI Module (core algorithm)

```
FUNCTION sendMessage(userId, chatId?, type, content):
  content ← trim(content)
  REQUIRE length(content) ≤ USER_INPUT_MAX_LENGTH   // default 200

  BEGIN TRANSACTION
    IF chatId:
      chat ← load owned chat
    ELSE:
      REQUIRE type = 1 (intake only for new chats)
      plan ← getOrCreateActivePlan(userId)
      chat ← ensureIntakeChat(plan)

    userCount ← count USER messages in chat
    validateMessageAllowed(chat, userCount)
      // not COMPLETED/LOCKED
      // under message limit
      // section: assignment exists, unlocked, not completed

    IF userCount + 1 ≥ limit:
      aiText ← cannedSessionCompleteMessage(type)   // NO Gemini call
    ELSE:
      history ← prior messages as Gemini user/model turns
      response ← Gemini.generateContent(
        model: GEMINI_MODEL,
        systemInstruction: getSystemPrompt(chat.type),
        contents: history + user content,
        maxOutputTokens: 1024
      )
      aiText ← response text
      tokens ← response.usage

    save USER message + AI message
    recordUsage(userId, tokens)                    // accumulate on user.aiUsage
    IF userCount + 1 ≥ limit:
      chat.status ← COMPLETED
      IF intake: plan.status ← intake_complete
      IF section: mark assignment completed;
                  if all done → plan.status ← sections_complete
  COMMIT

  RETURN { chatId, messages, remaining, statuses, aiUsage }
```

### Frontend chat UI

```
FUNCTION ChatInterface.init:
  status ← GET /treatment/status
  IF intake incomplete → load/open intake chat (type 1)
  ELSE IF waiting for doctor → show banner, disable input
  ELSE → open current/unlocked section
         IF no chat yet → show "Start Section"

FUNCTION onSend(text):
  optimistic user bubble
  POST /chat/message { content, type, chatId? }
  replace with server user + AI messages
  IF limit reached → refresh treatment status

FUNCTION startSection(assignmentId):
  POST /treatment/assignments/:id/start
  open new chat with welcome AI message
```

### Start section (backend)

```
FUNCTION startAssignment(userId, assignmentId):
  REQUIRE ownership
  REQUIRE not completed
  REQUIRE prior sortOrders completed
  chat ← existing OR create Chat(type=sectionType)
  assignment.status ← in_progress
  maybe plan.status ← sections_in_progress
  RETURN chat
```

### Doctor assign sections

```
FUNCTION assignSections(doctorId, patientId, sections[1..5]):
  REQUIRE patient role = user
  REQUIRE plan.status = intake_complete
  REQUIRE initial clinical report exists
  REQUIRE no prior assignments
  REQUIRE unique types in {2..6}

  save SectionAssignments (status=assigned, sortOrder)
  plan.doctorId ← doctorId
  plan.status ← sections_assigned
```

---

## 6. AI Usage Tracking

```
Stored on User.aiUsage (JSONB):
  tokens: { input, output }
  costs:  { input, output, total }
  rates:  { inputPerMTok, outputPerMTok }

cost ← (tokens / 1_000_000) * ratePerMTok
  // rates from AI_INPUT_COST_PER_MTOK / AI_OUTPUT_COST_PER_MTOK

FUNCTION recordUsage(userId, inTok, outTok):
  accumulate tokens + costs on user row
```

Used by: chat replies, initial report, final report.

---

## 7. Clinical Reports (AI + PDF)

```
FUNCTION generateInitialReport(doctorId, patientId):
  REQUIRE intake message count ≥ intake limit
  transcript ← format intake chat
  markdown ← Gemini(clinical summary prompt, maxOutputTokens=4096)
  save ClinicalReport(type=initial_intake)
  RETURN markdown

FUNCTION generateFinalReport(...):
  REQUIRE all section assignments completed
  transcript ← intake + all sections + notes
  markdown ← Gemini(comprehensive report prompt)
  save ClinicalReport(type=final_comprehensive)

FUNCTION downloadPDF(report):
  renderMarkdownToPdf(markdown) → PDF bytes
```

**Frontend (DoctorPanel):** generate / download buttons gated by `reportGeneratable`, `hasInitialReport`, `finalReportGeneratable`.

---

## 8. Mood / Emotion Pipeline

```
FRONTEND (inside ChatInterface, while chat active):
  open webcam (getUserMedia)
  EVERY ~3 seconds:
    capture JPEG frame from canvas
    POST /mood/analyze multipart { file, chatId }

BACKEND analyze:
  REQUIRE JWT + chat owned by user
  IF acceptedSnapshots ≥ 50 → return capped
  call HF Mood API (MOOD_API_URL)
  IF cooldown/5xx → return { cooldown, retryAfterMs: 20000 }
  save EmotionSnapshot
  IF role = user: strip prediction/confidence from response
  IF doctor/admin: return full emotion data

DOCTOR insights:
  GET /mood/patient/:userId/insights
  → overall distribution + per-session timelines (charts on frontend)
```

---

## 9. Journal

```
PATIENT:
  GET/POST /journal/notes
  PATCH/DELETE /journal/notes/:id
  title & content ≤ USER_INPUT_MAX_LENGTH (200)
  owner-scoped only
```

---

## 10. Wellness Articles

```
ON backend startup:
  IF articles table empty AND doctor/admin exists → seed 4 articles

PATIENT:  GET /articles, GET /articles/:id   (published)
DOCTOR:   CRUD /articles/mine, POST/PATCH/DELETE
```

---

## 11. Doctor & Admin Workflows

### Doctor portal

```
LOAD patients ← GET /doctor/patients
SELECT patient:
  detail ← GET /doctor/patients/:id/treatment
  mood   ← GET /mood/patient/:id/summary

ACTIONS:
  IF intake done AND no initial report → Generate Initial Report
  IF intake done AND has initial report AND no assignments → Assign Sections
  IF all sections done → Generate Final Report
  Download PDF (initial / final)
  Open Mood Insights page
  Manage Wellness Articles
```

### Admin dashboard

```
LIST users ← GET /users
EDIT name / role (user | doctor | admin)
PROMOTE patient → doctor
DELETE user (not self)
View AI usage on users
Download reports
```

---

## 12. Email Jobs

```
ON signup (local or Google new user):
  JobService.sendWelcomeEmail → BullMQ email-queue → Nodemailer SMTP

Welcome CTA link → FRONTEND_URL/app
```

---

## 13. Production Limits (quick reference)

| Limit | Env | Default |
|-------|-----|---------|
| User input length | `USER_INPUT_MAX_LENGTH` | 200 |
| Intake messages | `INTAKE_USER_MESSAGE_LIMIT` | 15 |
| Section messages | `SECTION_USER_MESSAGE_LIMIT` | 20 |
| Mood scans / chat | constant | 50 |
| AI model | `GEMINI_MODEL` | `gemini-3.5-flash-lite` |

---

## 14. End-to-End Patient Journey

```
1. Signup / Google (@umt.edu.pk) → JWT → /app
2. Dashboard shows intake progress
3. Chat (type 1) until message limit → intake_complete
4. Wait for doctor
5. Doctor: generate initial report → assign ordered sections (2–6)
6. Patient: start unlocked sections one by one (type 2–6 chats)
7. Mood frames captured during active chat sessions
8. All sections done → sections_complete
9. Doctor: generate final report + download PDF
10. Patient: journal, exercises (local), wellness articles anytime
```

---

## 15. Key Entities

```
User
  ├── aiUsage (jsonb)
  ├── Chat[] / JournalNote[] / EmotionSnapshot[]
  ├── TreatmentPlan (as patient)
  └── TreatmentPlan (as doctor)

TreatmentPlan
  ├── intakeChat → Chat
  ├── SectionAssignment[]
  └── ClinicalReport[]

Chat
  ├── type (1–6), status
  ├── Message[] (user | ai)
  └── linked plan / assignment

EmotionSnapshot → user + chat (+ optional plan/assignment)
WellnessArticle → author (doctor/admin)
```

---

## 16. Deploy URL Wiring

```
Frontend (Vercel):
  VITE_API_URL     = https://<backend>
  VITE_BACKEND_URL = https://<backend>
  vercel.json rewrites → index.html for SPA routes

Backend (Render):
  FRONTEND_URL         = https://<frontend>
  BACKEND_URL          = https://<backend>
  GOOGLE_CALLBACK_URL  = https://<backend>/auth/google/callback
```
