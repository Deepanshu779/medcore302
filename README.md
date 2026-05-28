# MedCore 302

Indian Healthcare Portal starter project.

## Project Structure

- `package.json` - root launcher for backend and frontend concurrently
- `backend/` - Express.js API server and SQLite database
- `frontend/` - Vite-powered static web application with Alpine.js

## Setup

1. Install root dependencies:
   ```powershell
   cd d:\PROJECTS\medcore-302
   npm install
   ```

2. Install backend dependencies:
   ```powershell
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```powershell
   cd frontend
   npm install
   ```

## Run

From the project root:
```powershell
npm start
```

- Application and API: `http://localhost:3000`

Open `http://localhost:3000` in the browser after starting the application. Do not open
`frontend/index.html` as a `file://` URL, because account and clinical features require
the running API server.

For frontend development with Vite and backend auto-reload:
```powershell
npm run dev
```

- Development frontend: `http://localhost:5173`
- Development backend: `http://localhost:3000`

## Backend

- `backend/server.js` contains API routes
- `backend/database.js` initializes SQLite tables
- Passwords are hashed using Node.js `crypto`

## Frontend

- `frontend/index.html` contains the SPA UI with Alpine.js and Tailwind CSS
- API base URL is currently hardcoded to `http://localhost:3000`

## Notes

- This project is currently a prototype and does not include production-grade authentication or authorization beyond password hashing.
- Sensitive data like passwords should never be stored in plaintext in a real application.
- The frontend uses the same origin when served by the backend and targets `http://localhost:3000` during Vite development.
