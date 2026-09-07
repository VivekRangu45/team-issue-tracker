# Team Issue Tracker

A complete, functional, and deployable web application for tracking software issues. It features a simplified role-based workflow and an integrated Machine Learning (NLP) system to suggest issue categories and priorities based on user descriptions.

## Overview

The application is designed to be simple, robust, and easy to explain. 
It uses a strictly controlled workflow and atomic database operations to prevent race conditions (e.g., two technicians taking the same issue).

### User Workflow (USER)
1. User logs in.
2. User reports an issue. The AI analyzes the description and suggests a Category and Priority.
3. User confirms or edits the suggestions and submits.
4. Issue becomes `ACTIVE`.
5. User tracks the issue until it is marked `RESOLVED`.

### Tech Workflow (TECH_MEMBER)
1. Tech member logs in.
2. Views `ACTIVE` available issues.
3. Clicks "Take Issue". The status atomically changes to `WORKING`.
4. Tech member adds comments, works on the fix, and marks the issue as `RESOLVED`.

## Architecture

- **Frontend:** React.js, Vite, React Router, Axios, plain CSS.
- **Backend:** Node.js, Express.js.
- **Database:** SQLite (Single Source of Truth).
- **Authentication:** JWT & bcrypt.
- **Machine Learning:** Python, scikit-learn, joblib, TF-IDF Vectorization, Logistic Regression.

### Machine Learning Explanation
This app uses a lightweight Natural Language Processing (NLP) pipeline.
1. The user types an `Issue Description`.
2. Node.js (`backend/src/controllers/mlController.js`) resolves `ml/prediction/predict.py` relative to the controller (`../../../ml/prediction/predict.py`), checks that the file exists, then spawns a `child_process`.
3. **TF-IDF**: The text is converted into a matrix of token counts.
4. **Logistic Regression**: Two pre-trained models predict the `Category` and `Priority`.
5. The JSON predictions (and confidence scores) are returned to the frontend.

*Note: The dataset used for training (`ml/data/issues.csv`) is synthetic and generated for demonstration purposes. In a production environment, this should be replaced with real labeled issue data.*

## Project Structure

```
team-issue-tracker/
├── frontend/             # React Application
├── backend/              # Node.js / Express API
├── ml/                   # Python ML Utilities
│   ├── data/             # Synthetic CSV dataset
│   ├── models/           # Pre-trained joblib models
│   ├── training/         # Data generation and training script
│   └── prediction/       # predict.py script called by Node.js
├── Dockerfile            # Container definition
├── docker-compose.yml    # Docker Compose setup
├── .gitignore
├── .env.example          # Backend/server env template (no secrets)
└── README.md
```

## Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- pip

Copy `.env.example` to `.env` in this directory (and optionally `backend/.env`) for local secrets. Do **not** commit `.env` files or SQLite database files; they are listed in `.gitignore`.

### 1. ML Setup & Training
```bash
cd ml
pip install -r requirements.txt
python training/train.py
```
*This generates the synthetic dataset and trains the models in `ml/models`.*

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed  # Initializes SQLite DB and inserts demo users/issues
npm run dev   # Starts backend on http://localhost:5000
```

SQLite path is `DATABASE_PATH` (local default `./database/database.sqlite`). The app creates the file and parent directory if they do not exist.

### 3. Frontend Setup
Open a new terminal.
```bash
cd frontend
npm install
```

Copy `frontend/.env.example` to `frontend/.env` if you want the frontend to call the API directly:

```
VITE_API_URL=http://localhost:5000/api
```

If `VITE_API_URL` is unset, the frontend uses `/api` and the Vite dev proxy forwards to `http://localhost:5000`. For production builds, set `VITE_API_URL` to your backend origin (for example `https://YOUR-BACKEND-DOMAIN/api`). Do not hard-code a domain that does not exist.

```bash
npm run dev   # Starts Vite React app on http://localhost:5173
```

## Demo Credentials

**USER Account:**
- Email: `user@example.com`
- Password: `User@123`

**TECH MEMBER Account:**
- Email: `tech@example.com`
- Password: `Tech@123`

## Docker Instructions

To run the entire backend and ML pipeline using Docker (ensuring Python and Node are in the same environment):

```bash
docker-compose up --build
```

The compose file sets `DATABASE_PATH=/app/data/database.sqlite` and mounts a named volume `sqlite_data` at `/app/data` so the SQLite file persists across container restarts. Local `database.sqlite` files are not copied into the image (see `.dockerignore`).

*Note: The frontend should be built and served statically (e.g., via Nginx, Vercel, Netlify) or run locally using `npm run dev` while pointing to the Docker backend via `VITE_API_URL`.*

## Database and Data Security

- SQLite is stored as a file (`DATABASE_PATH`).
- Local `.env` files and `*.sqlite` / `*.sqlite3` / `*.db` files are gitignored and must not be pushed to GitHub. Keep `.env.example` files.
- GitHub contains only schema/initialization/seed code.
- The application creates the database at runtime if it does not exist.
- Production must mount persistent private storage for the SQLite directory (Docker: `/app/data`).
- Passwords are stored only as bcrypt hashes.
- Demo users are created using the seed/setup process.

### Developer Tools
On the Developer Tools page, simulate an API error, then click **Create Issue From Error**. That navigates to Report Issue with Title and Description pre-filled (editable). The issue is **not** created until the user runs AI prediction (optional), confirms category/priority, and submits.

### Local Database
In local development, the database defaults to:
`DATABASE_PATH=./database/database.sqlite`

### Production Database
In production, you should set this environment variable to a persistent volume:
`DATABASE_PATH=/app/data/database.sqlite`

*Note: `/app/data` must be backed by persistent private storage in production (like a VPS or Render Disks).*

## Deployment Architecture & Limitations

Because the Express backend relies on Python's `child_process` to execute the ML prediction, **the backend must be deployed to a host that supports both Node.js and Python**.

**Compatible Deployment Options:**
- VPS (DigitalOcean Droplet, AWS EC2, Linode)
- Render (using a Docker environment or a custom build script)
- Heroku (using multiple buildpacks: Node.js + Python)

## API Endpoints

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Authenticate & get JWT
- `GET /api/auth/me` - Get current user info
- `POST /api/issues` - Report issue (USER)
- `GET /api/issues/my` - View reported issues (USER)
- `GET /api/issues/available` - View active issues (TECH)
- `POST /api/issues/:id/take` - Atomically take an issue (TECH)
- `PATCH /api/issues/:id/resolve` - Resolve issue (TECH)
- `POST /api/ml/predict` - Get AI suggestions for category/priority

## Future Improvements
- Replace synthetic ML training data with real user issue logs.
- Add pagination for Issue Lists.
- Add email notifications when issues transition states.
