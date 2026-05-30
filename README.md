# MedCore 302 | Indian Healthcare Portal

An interactive, high-end digital healthcare ecosystem tailored for patient care, real-time vital tracking, and clinical scheduling in India.

---

## Table of Contents
1. [About the Project](#about-the-project)
2. [Technology Stack](#technology-stack)
3. [Key Features](#key-features)
4. [Project Structure](#project-structure)
5. [Local Development Setup](#local-development-setup)
6. [Deployment Guide](#deployment-guide)
   - [Frontend on Vercel](#frontend-on-vercel)
   - [Backend on Render](#backend-on-render)

---

## About the Project

**MedCore 302** is a modular, single-page application (SPA) designed to streamline healthcare access across India. It bridges the gap between patients, healthcare providers, and emergency services. It features real-time biometric tracking, smart scheduling, medical vault storage, and intelligent symptom checking in an accessible, premium-styled dashboard interface.

---

## Technology Stack

### Frontend
- **Alpine.js**: Lightweight JavaScript framework driving the interactive reactive state machine and client-side logic.
- **Tailwind CSS**: Utility-first CSS framework compiled locally via **PostCSS** and **Autoprefixer** for styling.
- **Vite**: Ultra-fast build tool and local dev server driving compilation, bundling, and hot-module replacement.
- **Leaflet.js**: Open-source mapping framework plotting dynamic clinical markers on the Indian satellite grid.
- **FontAwesome**: Scalable vector icons providing micro-visual cues throughout the portal.

### Backend
- **Express.js (Node.js)**: RESTful API server driving secure client authentication, vault uploads, diagnostic analysis, and scheduling engines.
- **SQLite3**: Lightweight, relational database storing user records, appointments, prescription logs, and telemetry profiles locally.
- **Node.js Crypto**: Built-in cryptographic functions implementing salted PBKDF2 password hashing.

---

## Key Features

- **Live Biometric Telemetry HUD**: Generates a procedural real-time ECG Lead II sweep and simulates heart rate (BPM), blood pressure (mmHg), and blood oxygen (SpO2) vitals.
- **Quick Appointment Scheduler**: Restricts timing selections dynamically based on specific doctor active weekdays, checks for scheduling collisions, and offers calendar deck date suggestions.
- **Dynamic AI Disease Predictor**: Assesses age, symptoms, and active biomarkers (glucose, blood pressure) to output risk profiles, clinician recommendations, and suggest the ideal specialist.
- **AI Medicine Interaction Checker**: Evaluates co-administered drug lists for severe clinical conflicts (e.g., Telmisartan + NSAIDs, Metformin + Alcohol) using structured heuristics.
- **Secure Medical Vault**: Digitally encrypts and records prescriptions, diagnostic laboratory reports, and uploaded medical documentation.
- **Emergency SOS Dispatch**: Procedurally maps user geolocation, registers medical coordinates, and logs emergency ambulance routing.
- **Interactive Facilities Map**: Calculates distances dynamically from simulated Indian healthcare hubs (Delhi, Mumbai, Bengaluru, Chennai) and highlights nearest facilities.
- **AI Voice Assistant**: Supports dynamic voice commanding to navigate sections and consult metrics hands-free.

---

## Project Structure

```text
medcore-302/
├── backend/                   # Express.js REST API server & database
│   ├── database.js            # SQLite database initializer and tables schema
│   ├── medcore.sqlite         # SQLite database file
│   ├── server.js              # Express routing, auth middleware, and API endpoints
│   └── package.json           # Backend server dependencies
├── frontend/                  # Vite-powered static web portal
│   ├── dist/                  # Compiled production-ready web assets
│   ├── postcss.config.js      # PostCSS stylesheet processing configuration
│   ├── tailwind.config.js     # Tailwind CSS utility compilation rules
│   ├── index.css              # Main CSS containing tailwind directives and animations
│   ├── index.html             # Single Page Application HTML markup
│   ├── vite.config.js         # Vite dev-server port mapping and configurations
│   └── package.json           # Frontend packages and scripts
├── package.json               # Root launcher coordinating backend and frontend
└── README.md                  # System documentation
```

---

## Local Development Setup

### 1. Install Root Dependencies
Install the developer environment coordinator concurrently:
```powershell
npm install
```

### 2. Install Project Sub-Dependencies
Configure dependencies inside both project environments:
```powershell
# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../frontend
npm install
```

### 3. Run the Development Ecosystem
From the root directory, start the servers concurrently:
```powershell
npm run dev
```
- **Vite Development Frontend**: `http://localhost:5173`
- **Nodemon Backend API**: `http://localhost:3000`

---

## Deployment Guide

### Frontend on Vercel

Vercel is optimized for hosting static Vite SPA applications.

1. **Push to GitHub**: Initialize your repository and push the project files to a remote repository.
2. **Import Project**: Log into Vercel, select **Add New**, and click **Project**. Import your repository.
3. **Configure Project Settings**:
   - **Framework Preset**: Select `Vite` (Vercel will auto-detect the Vite configuration).
   - **Root Directory**: Set this to `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**:
   - Set up your production API base URL dynamically. In `frontend/index.html` (or your JS config), ensure your `API_BASE` points to your deployed backend URL on Render instead of `http://localhost:3000`.
   - Example: `API_BASE = 'https://medcore-backend.onrender.com'`
5. **Deploy**: Click **Deploy**. Vercel will bundle the Tailwind CSS stylesheet, compile index.html, and host it on a secure `https` subdomain.

### Backend on Render

Render is suited for hosting Express.js applications with active databases.

1. **Create Web Service**: Log into Render, select **New**, and click **Web Service**. Connect your repository.
2. **Configure Settings**:
   - **Name**: `medcore-backend`
   - **Environment**: `Node`
   - **Region**: Select the region closest to your target audience.
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
3. **Persistent SQLite Storage (Important)**:
   Render Web Services have ephemeral filesystems by default. To preserve user registrations and appointments across service redeployments:
   - Go to your Render Web Service dashboard, click **Volumes**, and select **Add Volume**.
   - **Name**: `medcore-db-vol`
   - **Mount Path**: `/etc/data`
   - **Size**: `1 GiB` is more than sufficient.
   - **Environment Variables**: Set `DATABASE_URL` (or update `backend/database.js`) to target the SQLite file on the persistent volume path `/etc/data/medcore.sqlite` instead of local project root.
4. **Deploy**: Render will build the Node environment, launch your server, and output a secure API URL.

---

## Security & Prototype Notes

- **Prototype Scope**: This system implements salted cryptographic password hashing, but is intended for prototype evaluation and does not feature OAuth or JWT session state validation.
- **Cross-Origin Requests**: The backend is configured with `cors()` enabled to process cross-origin requests dispatched from the Vercel-hosted frontend.
