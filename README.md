# 🧠 Zehnify

**AI-guided mental wellness platform for structured CBT-based treatment, mood analytics, and doctor–patient collaboration.**

Zehnify pairs patients with an AI wellness assistant that runs a clinically-inspired intake and treatment flow, provides doctors with real-time facial-emotion analytics captured during chat sessions, and automatically generates clinical reports—from intake summaries to final treatment reports—as downloadable PDFs.

> **Final Year Project — [University of Management and Technology (UMT), Lahore, Pakistan]**



## 🌐 Live Demo

**https://zehnify-frontend.vercel.app/**



## 🎯 Problem Statement

Many people experience **depression, anxiety, and other mental health challenges**, but they may hesitate to seek professional treatment because of stigma, fear, lack of accessibility, or discomfort with directly visiting a doctor.

To address this problem, **Zehnify provides an AI-guided and accessible mental wellness platform** where users can begin their treatment journey through structured AI conversations. The AI guides users through assessment and treatment sessions, while **qualified doctors can review the user's progress, assign treatment sections, analyze mood insights, and verify the treatment through clinical reports**.

The goal of Zehnify is **not to replace mental health professionals**, but to provide an accessible first step and support the collaboration between AI and doctors, making the treatment process more approachable, structured, and accessible.



## ✨ Key Features

* **AI Intake & Treatment Chat** — Structured, CBT-inspired conversation flow powered by Google Gemini, divided into 6 chat types:

  * Intake Assessment
  * Mood & Emotional Awareness
  * Cognitive Restructuring
  * Behavioral Activation
  * Coping & Stress Management
  * Relapse Prevention & Goals
* **Facial Emotion Recognition (Mood Analytics)** — Webcam frames captured during chat sessions are analyzed using a custom-trained FER model, producing per-session emotion timelines, dominant emotion, and a happiness score.
* **Doctor Dashboard** — Doctors can review patient intake, assign treatment sections, track progress, and generate clinical reports.
* **Automated Clinical Reports** — Initial and final reports are generated from chat history and mood data and exported as PDFs using PDFKit.
* **Role-Based Access Control** — Supports `user` (patient), `doctor`, and `admin` roles with protected routes and JWT authentication.
* **Google OAuth + Local Authentication** — Email/password signup restricted to institutional email addresses, along with Google sign-in.
* **Mood Insights Dashboard** — Aggregated emotion trends for patients across sessions, visualized using charts.
* **Wellness Article Library** — Doctors can publish wellness articles and guides for patients.
* **Background Jobs & Notifications** — Email notifications such as welcome emails are processed asynchronously using BullMQ and Redis.



## 🏗️ Architecture

```text
┌─────────────────┐     HTTPS / Axios      ┌──────────────────┐
│  React Frontend │ ◄────────────────────► │  NestJS Backend  │
│  (Vite + TS)    │      Bearer JWT        │                  │
└────────┬────────┘                        └────────┬─────────┘
         │                                           │
         │ Google OAuth start                        ├── Google Gemini
         └──────────────► Backend /auth/google       │   (chat + reports)
                                                     ├── Hugging Face FER API
                                                     │   (mood analysis)
                                                     ├── PostgreSQL
                                                     │   (TypeORM)
                                                     └── Redis / BullMQ
                                                         (background jobs)
```

**Roles:** `user` (patient) · `doctor` · `admin`

See [`backend/algo.md`](backend/algo.md) for the system algorithms and [`backend/TREATMENT_FLOW.md`](backend/TREATMENT_FLOW.md) for the complete patient/doctor journey and state machines.



## 🛠️ Tech Stack

| Layer                   | Technology                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| **Frontend**            | React 18, TypeScript, Vite, Tailwind CSS, React Router, Recharts, Axios                  |
| **Backend**             | NestJS, TypeScript, TypeORM, PostgreSQL                                                  |
| **AI / LLM**            | Google Gemini API                                                                        |
| **Emotion Recognition** | Custom-trained Facial Emotion Recognition (FER) model, served via Hugging Face Space API |
| **Authentication**      | JWT, Passport, Local Auth, Google OAuth 2.0, bcrypt                                      |
| **Queues / Caching**    | Redis, BullMQ, Upstash                                                                   |
| **PDF Generation**      | PDFKit                                                                                   |
| **Deployment**          | Frontend on Vercel, Backend on Render                                                    |



## 👥 Group Members & Responsibilities

| Group Member              | Responsibility                                    |
| ------------------------- | ------------------------------------------------- |
| **Member 1**              | Frontend Development                              |
| **Member 2**              | Backend Development                               |
| **Member 3**              | Backend Development                               |
| **Member 4 — Saim Azhar** | AI Model Development — Facial Emotion Recognition |



## 📁 Project Structure

```text
Zehnify FYP/
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── context/
│       ├── services/
│       ├── hooks/
│       └── content/
│
├── backend/
│   └── src/
│       ├── auth/
│       ├── user/
│       ├── chat/
│       ├── treatment/
│       ├── report/
│       ├── mood/
│       ├── journal/
│       ├── article/
│       ├── job/
│       ├── notification/
│       ├── ai/
│       └── redis/
│
│   ├── API_DOCUMENTATION.md
│   ├── TREATMENT_FLOW.md
│   ├── TERMS_AND_CONDITIONS.md
│   └── algo.md
│
└── AI_model/
    └── facial_emotion_recognition.ipynb
```



## 🚀 Getting Started

### Prerequisites

* Node.js v18+
* PostgreSQL database
* Redis instance
* Google Gemini API key
* Google OAuth credentials *(optional)*

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/zehnify.git
cd zehnify
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

The API runs on `http://localhost:3000` by default.

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The application runs on `http://localhost:5173` by default.

### 4. AI Model

The facial emotion recognition model used by the mood analytics feature is trained in:

```text
AI_model/facial_emotion_recognition.ipynb
```

The model is served separately through a Hugging Face Space API. Configure `MOOD_API_URL` in the backend `.env` file to point to the deployed inference endpoint.



## 📖 Documentation

* [API Documentation](backend/API_DOCUMENTATION.md) — Full REST API reference.
* [Treatment Flow](backend/TREATMENT_FLOW.md) — Patient/doctor journey and treatment state machines.
* [System Algorithms](backend/algo.md) — System-wide pseudocode overview.
* [Terms & Conditions](backend/TERMS_AND_CONDITIONS.md) — Platform terms and conditions.



## 🧑‍⚕️ How It Works

1. **Patient signs up** and completes a **15-message AI intake assessment**.
2. **Doctor reviews** the intake information and generates an **initial clinical report**.
3. **Doctor assigns 1–5 treatment sections** based on the patient's needs.
4. **Patient completes each treatment section** through guided AI conversations.
5. During sessions, the application periodically captures webcam frames for **facial emotion analysis**.
6. Mood analytics are aggregated to provide emotion trends and session-level insights.
7. Once all assigned sections are completed, the **doctor generates the final treatment report**, combining chat history and mood analytics into a downloadable PDF.



## 👥 User Roles

| Role                  | Capabilities                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| **Patient (`user`)**  | Complete intake and treatment chats, view mood insights, read wellness articles, and maintain a journal. |
| **Doctor (`doctor`)** | Review patients, assign treatment sections, generate/download reports, and publish wellness articles.    |
| **Admin (`admin`)**   | Manage users, promote users to doctor, and oversee the platform.                                         |



## 🔒 Notes

* Signup is currently restricted to `@umt.edu.pk` institutional email addresses.
* `.env` files are excluded through `.gitignore`.
* **Never commit real API keys, database credentials, OAuth secrets, or other sensitive credentials.**
* Use `.env.example` as the configuration template.



## 📄 License

This project was developed as a **Final Year Project**. Add your preferred license, such as MIT, if you intend to open-source the project.



## 🙌 Acknowledgements

* [NestJS](https://nestjs.com/) — Backend framework
* [Google Gemini](https://ai.google.dev/) — Conversational AI and report generation
* [Hugging Face Spaces](https://huggingface.co/spaces) — Hosting the facial emotion recognition inference API
* PostgreSQL — Database management
* Redis & BullMQ — Background job processing
* Vercel — Frontend deployment
* Render — Backend deployment
