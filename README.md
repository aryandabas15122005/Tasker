# Tasker - Team Management & Collaboration Platform

Tasker is a streamlined project management application designed to help teams organize tasks, track project progress, and visualize performance through a clean, modern interface.

## Core Features

- **Centralized Dashboard**: At-a-glance view of team performance and task distribution.
- **Project Management**: Create and manage multiple projects with specific guidelines and dedicated teams.
- **Task Tracking**: Assign tasks to team members with due dates and status tracking (Todo, In Progress, Done).
- **Data Visualization**: Real-time analytics charts to monitor team productivity.
- **Role-Based Access**: Distinguishes between Admin and Member roles for project ownership and task assignment.

## Tech Stack (Simplified)

- **Frontend**: Built with **React** for a responsive user interface and **TypeScript** for reliable code. We use **Lucide Icons** for a premium look and **Recharts** to handle all the data visualizations on the dashboard.
- **Backend**: A robust **Node.js** and **Express** server that handles all API requests, authentication, and logic.
- **Database**: **MongoDB Atlas** is used for flexible, cloud-based data storage, connected via **Prisma ORM** which ensures the database schema stays organized and fast.
- **Deployment**: Hosted on **Railway** for seamless cloud performance and automatic deployments from GitHub.

## Demo Credentials

The database is pre-seeded with the following accounts for demonstration purposes:

**All accounts use the password:** `password123`

| Name | Email | Role |
| :--- | :--- | :--- |
| **Aryan** | `aryan@demo.com` | Admin |
| **Sneha** | `sneha@demo.com` | Member |
| **Ria** | `ria@demo.com` | Member |
| **Jatin** | `jatin@demo.com` | Member |

## Environment Configuration

To run this project locally or on a server, the following environment variables are required:

### Backend (`/backend/.env`)
```env
# MongoDB Connection String
DATABASE_URL="mongodb+srv://admin:Randi%400909@cluster0.7qzkjt1.mongodb.net/TaskManager?retryWrites=true&w=majority"

# Security
JWT_SECRET="your-super-secret-key-for-tasker-2024"

# Server Port
PORT=5000

# Email Config (Optional since switch to simple signup)
EMAIL_USER="aaryan.singh2971@gmail.com"
EMAIL_PASS="dono lpsr jlut foxb"
```

### Frontend
```env
# API URL (Point this to your backend)
VITE_API_URL="http://localhost:5000/api"
```

## Local Setup

### 1. Backend
Navigate to the `backend` directory:
```bash
npm install
npx prisma generate
npm run dev
```

### 2. Frontend
Navigate to the `frontend` directory:
```bash
npm install
npm run dev
```
