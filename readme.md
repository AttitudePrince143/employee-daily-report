Employee Report & Attendance Management System
Overview

A full-stack MERN application for managing employee attendance, leave requests, and generating analytical reports.

The system provides a role-based dashboard for employees and administrators, including attendance tracking, leave approval workflow, data visualization, and exportable reports (PDF/Excel).

Tech Stack
Frontend

React 18

Vite

React Router DOM v6

Axios

Tailwind CSS

React Calendar

Chart.js & React-Chartjs-2

Recharts

jsPDF & jsPDF-AutoTable

XLSX

File-Saver

JWT Decode

Backend

Node.js

Express.js

MongoDB

Mongoose

JWT Authentication

bcryptjs (Password hashing)

express-validator

express-rate-limit

Helmet (Security headers)

CORS

dotenv

Core Features
Authentication & Security

JWT-based authentication

Password hashing with bcrypt

Role-based authorization (Admin / Employee)

Protected API routes

Request rate limiting

Secure HTTP headers via Helmet

Input validation using express-validator

Employee Features

Daily Check-In

Daily Check-Out

Automatic working-hours calculation

View today's attendance

Monthly calendar view

Leave application (date range)

View leave status

Export attendance report (PDF / Excel)

Admin Features

View all employees attendance

Approve / Reject leave requests

Analytics dashboard with charts

Attendance statistics visualization

Export reports (PDF / Excel)

Role-based access restriction

Attendance System Logic

Only one check-in per day allowed

Checkout calculates total working hours

Monthly attendance aggregation:

Full Days

Short Days

Leave Days

Absent Days

Approved leave overrides absence

Calendar dynamically renders daily status

Reporting & Analytics

Bar and Line charts using Chart.js and Recharts

Attendance distribution analysis

Export attendance data:

PDF (jsPDF + AutoTable)

Excel (XLSX)

Download functionality using FileSaver

API Structure
Authentication
Method	Endpoint	Description
POST	/auth/register	Register user
POST	/auth/login	Login user
Attendance
Method	Endpoint	Access
POST	/attendance/checkin	Employee
POST	/attendance/checkout	Employee
GET	/attendance/my	Employee
GET	/attendance/myall	Employee
GET	/attendance/all	Admin
Leave
Method	Endpoint	Access
POST	/leave/apply	Employee
GET	/leave/my	Employee
GET	/leave/all	Admin
PUT	/leave/:id	Admin
Installation Guide
1. Clone Repository
git clone <your-repo-url>
cd employee-report

Backend Setup
cd employee-report-backend
npm install


Create .env file:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret


Run backend:

npm run dev

Frontend Setup
cd employee-report-frontend
npm install
npm run dev

Folder Structure
employee-report-backend/
  controllers/
  models/
  routes/
  middleware/
  server.js

employee-report-frontend/
  src/
    components/
    pages/
    services/
    utils/

Architectural Highlights

RESTful API design

Modular backend architecture

Middleware-based authentication & authorization

Client-side protected routing

Optimized state-driven UI rendering

Concurrent API fetching using Promise.all

Dynamic calendar computation logic

Data export & reporting system