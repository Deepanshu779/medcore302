# 🏥 MedCore 302 — Indian Healthcare Portal

> A full-stack healthcare web application prototype designed around a patient dashboard: doctor scheduling, health analytics, medical record vault, facilities map, and emergency workflows.

---

> [!WARNING]
> **Prototype & Educational Disclaimer**: MedCore 302 is an experimental prototype application. Biomarkers, ECG waveforms, triage recommendations, disease risk predictions, and drug interaction evaluations are simulated/rules-based and **must not** be used as clinical medical advice or a substitute for professional healthcare consultations.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Local Development Setup](#local-development-setup)
- [Production Deployment](#production-deployment)
- [Security Considerations](#security-considerations)

---

## 🔎 Overview

MedCore 302 provides a unified healthcare interface for Indian patients, healthcare providers, and emergency services:
- **Patient Dashboard**: Real-time simulated telemetry (BPM, Blood Pressure, SpO2, and interactive canvas ECG lead waveform).
- **Specialist Directory & Scheduling**: Active weekday filtering, appointment collision prevention, and time slot reservations.
- **Rules-Based Clinical Triage**: Symptom evaluation, preliminary health score matrix, and specialist routing.
- **Drug Interaction Checker**: Heuristic contraindication analysis for concurrent medications.
- **Medical Vault**: Client-encrypted digital document records and digital prescription logs.
- **Emergency SOS & Mapping**: Leaflet-powered facility locator with distance calculation and simulated ambulance dispatch.

---

## 🛠️ Architecture & Tech Stack

```text
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Vite)                       │
│     Alpine.js • Tailwind CSS • Leaflet.js • FontAwesome     │
│       Modular ES Modules (/src: auth, map, triage, etc.)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express.js)                     │
│    Modular REST Routes • Async PBKDF2 Password Hashing      │
│          Promisified SQLite3 Helper Layer                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     SQLite Database                         │
│   Users • Appointments • Prescriptions • Vault • Donors     │
└─────────────────────────────────────────────────────────────┘
```

- **Frontend**: Alpine.js v3, Tailwind CSS v3, Vite v5, Leaflet.js v1.9, PostCSS, Autoprefixer.
- **Backend**: Node.js, Express.js v5, SQLite3, Native Crypto (`pbkdf2` async).

---

## ✨ Key Features

| Module | Description |
| --- | --- |
| 👤 **Authentication** | Salted PBKDF2 password hashing, registration, and login state management. |
| 📅 **Appointments** | Doctor directory with specialization filtering, active day validation, and conflict checks. |
| 🗺️ **Hospital Radar** | Interactive Leaflet map with Indian facility coordinates, GPS distance calculation, and emergency dial shortcuts. |
| 🩺 **Triage Assistant** | Rules-based symptom analyzer and automated specialist recommendation. |
| 💊 **Drug Interactions** | Heuristic contraindication flags for co-administered medications (e.g. Telmisartan + NSAIDs). |
| 📊 **Health Score** | Multi-factor wellness rating derived from sleep, physical activity, BPM, and blood pressure. |
| 🗄️ **Medical Vault** | Secure patient document metadata and prescription storage. |
| 🚑 **Emergency SOS** | Geolocation-tagged emergency trigger with animated ambulance routing simulation. |
| 🩸 **Blood Network** | Voluntary blood donor directory with city and blood group query filtering. |
| 🎙️ **Voice Navigation** | Web Speech API integration for hands-free voice commands. |

---

## 📁 Project Structure

```text
medcore-302/
├── backend/
│   ├── src/
│   │   ├── config/             # Environment, port, and storage settings
│   │   ├── data/               # Static datasets (doctors.json, hospitals.json)
│   │   ├── routes/             # Modular REST route handlers
│   │   │   ├── auth.routes.js
│   │   │   ├── doctors.routes.js
│   │   │   ├── appointments.routes.js
│   │   │   ├── hospitals.routes.js
│   │   │   ├── health.routes.js
│   │   │   ├── emergency.routes.js
│   │   │   ├── blood.routes.js
│   │   │   ├── lab.routes.js
│   │   │   ├── vault.routes.js
│   │   │   ├── prescriptions.routes.js
│   │   │   ├── activity.routes.js
│   │   │   └── family.routes.js
│   │   ├── services/           # Password hashing & health analytics services
│   │   │   ├── password.service.js
│   │   │   └── health.service.js
│   │   └── db.js               # Promisified SQLite3 wrapper and schema initializer
│   ├── database.js             # Backward-compatible database export
│   ├── server.js               # Express application entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js          # Unified API client
│   │   ├── modules/            # Domain-specific Alpine modules
│   │   │   ├── auth.js
│   │   │   ├── doctors.js
│   │   │   ├── map.js
│   │   │   ├── telemetry.js
│   │   │   ├── triage.js
│   │   │   ├── emergency.js
│   │   │   ├── services.js
│   │   │   ├── prescriptions.js
│   │   │   ├── vault.js
│   │   │   ├── activity.js
│   │   │   └── voice.js
│   │   ├── app.js              # Alpine docManager component state assembler
│   │   └── main.js             # Vite module entry point
│   ├── index.html              # Clean single-page application markup
│   ├── index.css               # Tailwind CSS directives & custom animations
│   ├── vite.config.js          # Vite config with /api reverse proxy
│   ├── tailwind.config.js
│   └── package.json
├── package.json                # Root orchestration scripts
└── README.md
```

---

## 📡 API Reference

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate user credentials |
| `PUT` | `/api/profile/:id` | Update profile details |
| `GET` | `/api/doctors` | List all specialists |
| `GET` | `/api/hospitals` | List all hospital hubs |
| `GET` | `/api/appointments/:userId` | Get user appointments |
| `POST` | `/api/appointments` | Book a consultation appointment |
| `POST` | `/api/predict-disease` | Run rules-based symptom triage |
| `POST` | `/api/health-score` | Calculate composite wellness index |
| `POST` | `/api/ai/scan-report` | Extract parameters from diagnostic report |
| `POST` | `/api/ai/check-interactions` | Check drug contraindications |
| `POST` | `/api/emergency/sos` | Dispatch emergency SOS alert |
| `GET` | `/api/blood-network` | Search blood donor registry |
| `POST` | `/api/blood-network/register` | Register as a blood donor |
| `POST` | `/api/vault/upload` | Upload document to medical vault |
| `GET` | `/api/vault/files/:userId` | List documents in user vault |
| `GET` | `/api/activity-logs/:userId` | Retrieve recent audit activity |

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18 or newer)
- npm (v9 or newer)

### 1. Install Dependencies
```bash
# Install root orchestrator dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Start Development Servers
From the repository root:
```bash
npm run dev
```
- **Frontend (Vite)**: `http://localhost:5173`
- **Backend (Express)**: `http://localhost:3000`

Vite automatically proxies all `/api` requests to `http://localhost:3000`.

---

## 🌐 Production Deployment

### Frontend (e.g. Vercel / Netlify / Cloudflare Pages)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Backend (e.g. Render / Railway / Fly.io)
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Persistent Volume**: Attach a persistent volume to preserve `medcore.sqlite` across redeployments. Set `DB_PATH=/path/to/volume/medcore.sqlite`.

---

## 🔒 Security Considerations

- Passwords are encrypted using salted PBKDF2 (100,000 iterations, 64-byte key length, SHA-512) executed asynchronously to prevent event loop blocking.
- File uploads in the medical vault have strict payload size limits (10MB max).
- Before deploying to a production clinical environment, integrate signed JWT/session tokens, rate limiting, and HIPAA/DISHA compliance audits.
