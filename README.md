# 🏥 Prime Health: Multi-Tenant Hospital Management System (HMS)

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%2347A248.svg?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

> **Project Status: Complete (v1.0.0) | 🌐 [Live Demo](https://prime-health-one.vercel.app/)**

Prime Health is a comprehensive, scalable Software as a Service (SaaS) platform built on the MERN stack. Its primary objective is to allow multiple hospitals (tenants) to manage their operations using a single system while guaranteeing **Strict Data Isolation** for every tenant.

---

## ✨ Key Features

| Feature | Description | Implementation |
|---------|-------------|----------------|
| 🔐 **Multi-Tenancy** | Schema-per-Tenant Architecture with strict data isolation | Dedicated MongoDB database per hospital |
| 🏢 **Self-Registration** | Public registration for new hospitals with automated admin credentials | Auto-generated tenantId and email delivery |
| 🛡️ **Authentication** | Secure JWT authentication with RBAC | Role-based access for Admin, Doctor, Nurse, Receptionist |
| 👥 **User Management** | Hospital Admins can onboard new staff members | Email credentials delivery system |
| 🧑‍⚕️ **Patient Management** | Full CRUD operations with tenant-scoped data | Search, filter, and management capabilities |
| 💊 **Prescription System** | Dynamic form for prescription creation | Tenant-secure data storage |
| 📄 **PDF Reporting** | Instant prescription PDF generation | PDFKit integration for download |
| 📅 **Appointment System** | Booking with conflict prevention | Double-booking protection logic |
| 📊 **Dashboard Metrics** | Real-time analytics and visualization | Recharts integration with tenant-scoped stats |

---

## 🌐 Live Deployment

- **Frontend (Vercel):** https://prime-health-one.vercel.app/
- **Backend (Render):** https://prime-health.onrender.com/

---

## 💻 Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Backend** | Node.js, Express.js | RESTful APIs, Business Logic, Middleware |
| **Database** | MongoDB (Mongoose) | Tenant-specific data persistence |
| **Frontend** | React.js (Vite) | Dashboard UI, Component Logic |
| **State Management** | Redux Toolkit | Centralized state for Auth and App data |
| **Styling** | Tailwind CSS | Professional, responsive design |
| **Security** | JWT, Bcryptjs | Token generation and password hashing |
| **Utilities** | Nodemailer, Axios, Recharts | Email, HTTP requests, Data Visualization |

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- MongoDB Atlas account
- Gmail account (for email notifications)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend root:

```env
# SERVER CONFIG
PORT=3000
NODE_ENV=development

# DATABASE (Global DB for Tenant/User lookup)
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/hms_global?retryWrites=true&w=majority

# AUTHENTICATION
JWT_SECRET=YOUR_SUPER_SECURE_SECRET_KEY
JWT_EXPIRE=30d

# EMAIL CONFIG (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password 
FROM_NAME="Prime Health"

# CLOUDINARY (Optional - for profile pictures)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend server:
```bash
npm start
# or for development
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Start the frontend:
```bash
npm run dev
```

Open your browser at `http://localhost:5173`

---

## 🔑 Testing Instructions

### A. Hospital Self-Registration
1. Go to the app and click **"Register Here"**
2. Fill in all details (Hospital Name, Admin Email, License Number)
3. Check the Admin Email for auto-generated credentials

### B. Core Operations
1. **Login** using the Admin Email and Temporary Password
2. **Dashboard:** Verify statistics loading from API
3. **Patients:** Add a new patient using the modal
4. **Prescriptions:** Create prescription and test PDF download
5. **Appointments:** Book appointments with conflict checking

---

## 📁 Project Structure

```
Prime-Health/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Custom middlewares
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
│   ├── .env                # Environment variables
│   └── package.json
├── frontend/               # React.js application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── api/           # API configurations
│   │   ├── redux/         # Redux store
│   │   └── assets/        # Static assets
│   └── package.json
└── README.md
```

---

## 🔐 Security Features

- **JWT Authentication:** Secure token-based authentication
- **Role-Based Access Control:** Granular permissions per role
- **Multi-Tenant Data Isolation:** Separate database per hospital
- **Password Hashing:** Bcryptjs for secure password storage
- **Input Validation:** Comprehensive validation on all inputs
- **CORS Protection:** Configured for production domains

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/hospitals/register` - Hospital registration

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/chart` - Chart data

### Patients
- `GET /api/patients` - List patients
- `POST /api/patients` - Create patient
- `GET /api/patients/:id` - Get patient details

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments/book` - Book appointment

### Prescriptions
- `GET /api/prescriptions` - List prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions/:id/pdf` - Download PDF

---

## 🎨 UI/UX Features

- **Responsive Design:** Mobile-first approach with Tailwind CSS
- **Real-time Updates:** Live dashboard metrics
- **Interactive Charts:** Data visualization with Recharts
- **Modern Components:** Clean, professional interface
- **Error Handling:** Comprehensive error states and messages
- **Loading States:** Smooth loading indicators

---

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Configure build settings: `npm run build`
3. Set environment variables for API URL

### Backend (Render)
1. Connect GitHub repository to Render
2. Configure start command: `npm start`
3. Add all environment variables from `.env`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **MongoDB Atlas** for database hosting
- **Vercel** for frontend deployment
- **Render** for backend hosting
- **Tailwind CSS** for styling framework
- **Recharts** for data visualization

---

## 📞 Support

For support, please email at [your-email@example.com] or create an issue in the GitHub repository.

---

> **Built with ❤️ for Healthcare Management**
