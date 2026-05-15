# Team Task Manager

A full-stack project management application built with Node.js, Express, React, and Prisma. Features include role-based access control (Admin/Member), project and task management, a Kanban-style task board, and a sleek, premium dark-mode UI.

## Features
- **Authentication**: Secure JWT-based Login and Registration.
- **Role-Based Access Control**: Admins can manage projects and assign tasks. Members can view projects they are assigned to and update their tasks.
- **Dashboard**: Real-time overview of task statuses (To Do, In Progress, Done, Overdue).
- **Projects & Tasks**: Kanban board for task management with easy drag-and-drop-like status updates.

## Tech Stack
- **Frontend**: React (Vite), TypeScript, React Router, Axios, Lucide Icons, Vanilla CSS (Premium Dark Theme).
- **Backend**: Node.js, Express, TypeScript, Prisma ORM.
- **Database**: SQLite (Local Development) / PostgreSQL (Production).

## Setup Instructions for Local Development

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the SQLite database and Prisma client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
4. Create a `.env` file in the `backend` directory and add:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your_super_secret_jwt_key_here"
   PORT=5000
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:5173`.

## Deployment to Railway (Mandatory)

To deploy this application to Railway, follow these steps:

### Backend Deployment
1. Push your code to a GitHub Repository.
2. Go to [Railway](https://railway.app/) and create a new project.
3. Select **Provision PostgreSQL** to create a database instance.
4. Click **New** -> **GitHub Repo** and select your repository.
5. Railway will detect the monorepo structure. You may need to specify the `backend` directory in the settings (Root Directory: `/backend`).
6. In the Backend service settings on Railway, add the following **Variables**:
   - `DATABASE_URL`: Add the connection string provided by the Railway Postgres service.
   - `JWT_SECRET`: Any random secure string.
7. Change the Start Command (if needed) to: `npm run build && npm start`.
8. Once deployed, Railway will provide a public URL for your backend API.

### Frontend Deployment
1. Go back to your Railway project dashboard.
2. Click **New** -> **GitHub Repo** and select the same repository again.
3. This time, set the Root Directory to `/frontend`.
4. Railway should automatically detect Vite. The build command is `npm run build`.
5. Before deploying, you must update the `baseURL` in `frontend/src/api/client.ts` to point to the new backend Railway URL instead of `http://localhost:5000/api`.
6. Once deployed, Railway will provide the live URL for your frontend application.

## API Documentation

### Authentication
- `POST /api/auth/signup`: Create a new user (Body: name, email, password, role)
- `POST /api/auth/login`: Authenticate user and receive JWT.

### Projects
- `GET /api/projects`: Get all projects for the authenticated user.
- `POST /api/projects`: Create a new project (Admin only).

### Tasks
- `GET /api/tasks/project/:id`: Get all tasks for a specific project.
- `POST /api/tasks`: Create a new task.
- `PATCH /api/tasks/:id`: Update a task's status, assignee, or due date.
- `DELETE /api/tasks/:id`: Delete a task.

### Dashboard
- `GET /api/dashboard/metrics`: Get overall task metrics.
