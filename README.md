# TaskFlow - Simple Task Manager

Hey! This is a simple task management dashboard web application. It has a React (Vite) frontend with a beautiful glassmorphic dark-theme UI and a Laravel backend API that handles the task database.

Here is a quick guide on how to clone, install, and run this project on your machine.

---

## 🛠️ Things you need to install first
Before running the app, make sure you have these installed on your device:
* **Node.js** (v18 or higher)
* **PHP** (v8.2 or higher)
* **Composer** (to manage PHP packages)

---

## 🚀 How to get it running

### 1. Clone the project
First, clone the repository and go into the folder:
```bash
git clone https://github.com/yuvinduyy/Task-Dashboard.git
cd Task-Dashboard
```

### 2. Set up the Backend (Laravel API)
Open your terminal and run these commands to set up the backend server:
```bash
# Go to backend folder
cd todo-backend

# Install PHP dependencies
composer install

# Copy env template to create your config file
cp .env.example .env

# Generate a security key for Laravel
php artisan key:generate

# Create an empty database file for SQLite
touch database/database.sqlite

# Run migrations to set up the database tables
php artisan migrate

# Start the PHP server
php artisan serve --port=8000
```
*Keep this terminal window open so the backend stays active!*

### 3. Set up the Frontend (React + Vite)
Open a **new terminal tab/window**, go to the frontend directory, and run:
```bash
# Go to frontend folder
cd Task-Dashboard/todo-frontend

# Install node modules
npm install

# Start the dev server
npm run dev
```

---

## 💻 Running the App
Once both servers are running, just open your browser and go to:
👉 **`http://localhost:5173`**

You should see the TaskFlow dashboard. You can create tasks on the left card and they will show up in the pending list on the right. Clicking the checkbox of any task will delete it!

---

## ⚠️ Troubleshooting / Quick Tips
* **CORS Errors**: If the frontend cannot communicate with the backend, double-check that your Laravel server is running on port `8000` and the React frontend is running on port `5173`.
* **Database issues**: If `php artisan migrate` fails, make sure the `database/database.sqlite` file was created successfully.
