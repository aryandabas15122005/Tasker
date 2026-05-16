# Tasker - Team Management & Collaboration Platform

Tasker is a streamlined project management application designed to help teams organize tasks, track project progress, and visualize performance through a clean, modern interface.

## Core Features

- **Centralized Dashboard**: At-a-glance view of team performance and task distribution.
- **Project Management**: Create and manage multiple projects with specific guidelines and dedicated teams.
- **Task Tracking**: Assign tasks to team members with due dates and status tracking (Todo, In Progress, Done).
- **Data Visualization**: Real-time analytics charts to monitor team productivity.
- **Role-Based Access**: Distinguishes between Admin and Member roles for project ownership and task assignment.

## Tech Stack

- **Frontend**: React (Vite), TypeScript, Lucide Icons, Recharts, Axios.
- **Backend**: Node.js, Express, Prisma ORM.
- **Database**: MongoDB Atlas.
- **Deployment**: Railway.

## Demo Credentials

The database is pre-seeded with the following accounts for demonstration purposes:

**All accounts use the password:** `password123`

| Name | Email | Role |
| :--- | :--- | :--- |
| **Aryan** | `aryan@demo.com` | Admin |
| **Sneha** | `sneha@demo.com` | Member |
| **Ria** | `ria@demo.com` | Member |
| **Jatin** | `jatin@demo.com` | Member |

## Local Setup

### 1. Prerequisites
- Node.js (v20+)
- A MongoDB Atlas connection string

### 2. Backend Configuration
Navigate to the `backend` directory and create a `.env` file:
```env
DATABASE_URL="your_mongodb_connection_string"
JWT_SECRET="your_secret_key"
PORT=5000
```
Run the following commands:
```bash
npm install
npx prisma generate
npm run dev
```

### 3. Frontend Configuration
Navigate to the `frontend` directory:
```bash
npm install
npm run dev
```

## Deployment on Railway

### Backend
1. Connect your repository to Railway.
2. Set the root directory to `backend`.
3. Add the following variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`

### Frontend
1. Connect your repository to Railway.
2. Set the root directory to `frontend`.
3. Add the following variable:
   - `VITE_API_URL`: `https://your-backend-url.up.railway.app/api`

## License
Distributed under the MIT License.
