🏥 Prime Health: Multi-Tenant Hospital Management System (HMS)

Project Status: Complete (v1.0.0)

Prime Health is a comprehensive, scalable Software as a Service (SaaS) platform built on the MERN stack. Its primary objective is to allow multiple hospitals (tenants) to manage their operations using a single system while guaranteeing Strict Data Isolation for every tenant.

🌐 Live Deployment

Frontend (Vercel): https://prime-health-one.vercel.app/

✨ Key Features and Implementation (Core Implementation)

Feature

BRD Reference

Implementation Details

Multi-Tenancy

FR-2

Schema-per-Tenant Architecture: A dedicated MongoDB database is created for each hospital, ensuring strict data isolation.

Self-Registration

FR-1, FR-6

Public registration for new hospitals. The system generates tenantId and sends Admin Login Credentials via Nodemailer.

Authentication

FR-3, FR-4

Secure JWT authentication and RBAC (Role-Based Access Control) for Admin, Doctor, Nurse, and Receptionist roles.

User Management

FR-6

Hospital Admins can onboard new staff (Doctors, Nurses), with credentials sent directly to their email.

Patient Management

FR-8, FR-9

Full CRUD for Patients, including listing and searching, all scoped by the user's tenantId.

Prescription System

FR-10

Doctors can create prescriptions using a Dynamic Form. Data is stored securely in the tenant's database.

PDF Reporting



pdfkit is used on the backend to generate and instantly stream prescription PDFs for download.

Appointment System



Appointment Booking with conflict checking (to prevent double-booking a Doctor's time slot).

Dashboard Metrics



Real-time aggregation of Tenant-scoped stats (Total Patients, Appointments, Doctors) and visualization using recharts.

💻 Tech Stack Summary

Component

Technology

Role / Purpose

Backend (API)

Node.js, Express.js

RESTful APIs, Business Logic, Middleware

Database (Data)

MongoDB (Mongoose)

Tenant-specific data persistence.

Frontend (UI)

React.js (Vite)

Dashboard UI, Component Logic

State Mgt

Redux Toolkit

Centralized state for Auth and Application data.

Styling

Tailwind CSS

Utility-first CSS for professional, responsive design.

Security

JWT, Bcryptjs

Token generation and password hashing.

Utilities

Nodemailer, Axios, Recharts

Email notifications, HTTP requests, Data Visualization.

🚀 Local Setup and Running Guide

This project is separated into two folders: hms-backend and hms-frontend. Both must be running concurrently.

1. Backend Setup (hms-backend)

Navigate to the hms-backend folder:

cd hms-backend


Install required dependencies:

npm install


Create a .env file in the project root and set the following variables:

# SERVER CONFIG
PORT=5000
NODE_ENV=development

# DATABASE (Global DB for Tenant/User lookup)
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/hms_global?retryWrites=true&w=majority

# AUTHENTICATION
JWT_SECRET=YOUR_SUPER_SECURE_SECRET_KEY
JWT_EXPIRE=30d

# EMAIL CONFIG (Nodemailer - Use Gmail App Password or Mailtrap/SendGrid)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password 
FROM_NAME="Prime Health"


Start the server:

npm start # or npm run dev


(Ensure the server is running on http://localhost:5000.)

2. Frontend Setup (hms-frontend)

Navigate to the hms-frontend folder:

cd hms-frontend


Install required dependencies:

npm install


Start the client:

npm run dev


Open your browser at http://localhost:5173 (or the URL provided by Vite).

🔑 Testing Instructions

A. Hospital Self-Registration (FR-1)

Go to the app and click "Register Here".

Fill in all details (Hospital Name, Admin Email, License Number).

Upon submission, check the Admin Email for the automatically generated credentials (Email and Temporary Password).

B. Core Operations

Log in using the Admin Email and Temporary Password received in the email.

Dashboard: Verify that statistics (Total Patients, Doctors, etc.) are loading from the API.

Patients: Use the Add New Patient modal to register a patient.

Prescriptions: Go to New Prescription, select the patient you just registered, add medications, and click Download to test the PDF generation feature.
