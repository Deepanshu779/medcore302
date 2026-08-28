# 🏥 MedCore 302

> **A modern Indian healthcare portal for patient care, appointments, medical records, health insights, and emergency assistance.**

MedCore 302 is a full-stack healthcare web application designed around a centralized patient dashboard. It combines appointment scheduling, medical-document management, biometric-style telemetry, symptom/risk assessment, medicine-interaction checks, healthcare-facility mapping, and emergency workflows in a single interface.

> ⚠️ **Prototype notice:** MedCore 302 is a software prototype for demonstration and learning. Health scores, vital signs, AI-style recommendations, medicine interaction checks, and emergency workflows should not be treated as clinical diagnosis, medical advice, or a production emergency-response system.

---

## 🖼️ Project Preview

### Patient Login & Registration
![MedCore Login Interface](https://raw.githubusercontent.com/Deepanshu779/medcore302/main/frontend/index.html)

### Portal Dashboard
![MedCore 302 Dashboard](https://raw.githubusercontent.com/Deepanshu779/medcore302/main/frontend/index.html)

> **Visual note:** The repository does not currently contain standalone PNG/JPG screenshots of the dashboard. The README therefore keeps the preview section ready for repository-hosted screenshots rather than inventing image files.

---

## ✨ Key Features

| Module | What it does |
| --- | --- |
| 👤 Authentication | User registration and login with password hashing using Node.js crypto |
| 📊 Health Dashboard | Centralized patient overview with appointments, reports, health metrics, and activity |
| ❤️ Live Telemetry HUD | Procedurally renders ECG-style Lead II data and displays simulated BPM, blood pressure, and SpO2 values |
| 🩺 Symptom & Risk Analysis | Uses patient inputs and biomarkers to produce a prototype health-risk profile and specialist suggestion |
| 💊 Medicine Interaction Checker | Applies structured heuristic rules to flag selected medication combinations |
| 📅 Appointment Scheduler | Handles doctor selection, weekday availability, time slots, and booking records |
| 🗂️ Medical Vault | Stores medical-document metadata and demonstrates a secure-vault workflow |
| 🚑 Emergency SOS | Uses browser geolocation and records emergency coordinates for the prototype workflow |
| 🗺️ Healthcare Map | Uses Leaflet.js to visualize healthcare locations and distance-oriented discovery |
| 💻 Digital Prescriptions | Supports prescription creation/verification flows in the portal |
| 🎙️ Voice Assistant | Browser-based voice commands for hands-free navigation and feedback |
| 🔐 Security Activity | Records security/activity events associated with portal actions |

---

## 🧠 System Overview

```text
                ┌─────────────────────────────┐
                │       MedCore 302 UI        │
                │  HTML • Tailwind • Alpine   │
                │  Leaflet • Font Awesome     │
                └──────────────┬──────────────┘
                               │
                         REST / JSON
                               │
                ┌──────────────▼──────────────┐
                │     Express / Node.js       │
                │  Auth • Appointments • Vault│
                │  Prescriptions • Activity   │
                └──────────────┬──────────────┘
                               │
                         SQLite3 Database
                               │
                ┌──────────────▼──────────────┐
                │       medcore.sqlite        │
                │ Users • Appointments • Logs │
                │ Medical / Portal Records    │
                └─────────────────────────────┘
```

### Request flow

```text
Patient
  ↓
MedCore 302 Frontend
  ├── Authentication
  ├── Dashboard
  ├── Appointments
  ├── Medical Vault
  ├── Health analysis
  └── Emergency / Maps
          ↓
      REST API
          ↓
   Express + SQLite
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Role |
| --- | --- |
| HTML5 | Application structure and SPA markup |
| Alpine.js 3 | Reactive UI state and client-side interactions |
| Tailwind CSS | Utility-first styling |
| PostCSS + Autoprefixer | CSS processing |
| Vite | Development server and production build |
| Leaflet.js | Interactive healthcare/location maps |
| Font Awesome | Interface icons |

### Backend
| Technology | Role |
| --- | --- |
| Node.js | Runtime |
| Express 5 | REST API and static-file server |
| SQLite3 | Relational persistence |
| Node.js Crypto | PBKDF2 password hashing and verification |
| CORS | Cross-origin API access |

---

## 📂 Project Structure

```text
medcore302/
├── backend/
│   ├── database.js          # SQLite initialization and schema
│   ├── medcore.sqlite       # Local SQLite database
│   ├── server.js            # Express server and API routes
│   └── package.json         # Backend dependencies/scripts
│
├── frontend/
│   ├── dist/                # Built production assets
│   ├── index.html            # Main single-page application
│   ├── index.css             # Frontend styles
│   ├── vite.config.js        # Vite configuration
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── postcss.config.js     # PostCSS configuration
│   └── package.json          # Frontend dependencies/scripts
│
├── package.json              # Root development runner
├── package-lock.json
└── README.md
```

---

## 🔌 API Surface

### Authentication & Profile
| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create a patient account |
| POST | `/api/auth/login` | Authenticate a patient |
| PUT | `/api/profile/:id` | Update profile information |

### Appointments
| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/appointments` | Create an appointment |
| GET | `/api/appointments/:userId` | Get appointments for a user |
| GET | `/api/all-appointments` | Retrieve all appointments |

### Healthcare & Portal Services
The Express backend also exposes API groups for doctors, prescriptions, medical-vault records, activity logs, and other portal workflows implemented in `backend/server.js`.

---

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Deepanshu779/medcore302.git
cd medcore302
```

### 2. Install root dependencies

```bash
npm install
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 5. Start frontend + backend

From the project root:

```bash
npm run dev
```

Default development endpoints:

- **Frontend:** `http://localhost:5173`
- **Backend:** `http://localhost:3000`

To run only the backend:

```bash
npm start
```

---

## 🌐 Deployment

### Frontend — Vercel

Set the Vercel project root to:

`frontend`

Build command:

```bash
npm run build
```

Output directory:

`dist`

### Backend — Render

Set the Render service root to:

`backend`

Build command:

```bash
npm install
```

Start command:

```bash
node server.js
```

> **SQLite persistence:** Render's default filesystem is ephemeral. A persistent volume should be used when the SQLite database must survive redeployments.

---

## 🔐 Security & Prototype Considerations

MedCore 302 includes PBKDF2-based password hashing using Node.js's built-in crypto APIs. However, it remains a prototype and does not implement a complete production identity/session architecture.

Before production use, the system should add:

- Signed session/JWT handling with expiry and refresh strategy
- Server-side authorization for sensitive patient resources
- Input validation and rate limiting
- Secure secret/configuration management
- Audit controls and stronger access policies
- Proper encrypted medical-file storage
- Production-grade logging and monitoring
- Formal clinical validation for any decision-support features

---

## 🧪 Prototype Modules

Some features intentionally simulate real-world healthcare systems for demonstration:

- ECG/vital streams are procedurally generated rather than connected to medical sensors
- Health scoring and symptom analysis are application logic rather than validated clinical models
- Medicine interaction checks use heuristic rules
- Biometric/Face ID actions are simulated UI flows
- Emergency dispatch is a prototype workflow, not a connection to an ambulance network

---

## 🔭 Future Roadmap

- Connect to validated healthcare and telemedicine APIs
- Replace heuristic health scoring with clinically validated models
- Add FHIR-compatible medical records
- Add real-time wearable/device integrations
- Introduce secure cloud object storage for medical files
- Add doctor/admin role management
- Implement real teleconsultation and notification workflows
- Add automated unit/integration tests and CI/CD

---

## 👨‍💻 Author

**Deepanshu Kumar Pandit**

GitHub: [@Deepanshu779](https://github.com/Deepanshu779)

---

## ⭐ Support

If you find MedCore 302 useful as a healthcare-tech project, consider starring the repository and sharing feedback.

**Repository:** https://github.com/Deepanshu779/medcore302