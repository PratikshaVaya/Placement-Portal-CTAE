# 🎓 Placement Portal - CTAE

A premium, state-of-the-art Campus Placement Management System designed for **CTAE**. This platform streamlines the recruitment lifecycle by connecting students, recruiters, and administrators through a unified, high-performance web interface.

![Aesthetics](https://img.shields.io/badge/UI-Glassmorphism-blueviolet?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-MERN--Docker-blue?style=for-the-badge)
![Security](https://img.shields.io/badge/Auth-JWT--Secure-emerald?style=for-the-badge)

---
## 🎥 Project Demo

[![Watch Demo](https://img.youtube.com/vi/d2XlC6vhExE/0.jpg)](https://youtu.be/d2XlC6vhExE)
## 🚀 Key Features

### 👨‍🎓 For Students
- **Smart Job Matching**: AI-driven skill compatibility scores for every job listing.
- **AI Resume Analyzer**: Instant feedback on resume quality and keyword matching.
- **Professional Resume Builder**: Create high-quality, standardized resumes directly within the portal.
- **Automated Eligibility**: The system automatically checks if you meet a recruiter's academic criteria (CGPA, 10th/12th%, Backlogs).
- **Placement Tracking**: Manage both On-Campus and Off-Campus placement records in a unified dashboard.
- **Targeted Announcements**: Receive real-time notices specifically filtered for your course and batch.
- **Secure Document Viewer**: View uploaded resumes and offer letters securely via blob-based rendering.

### 🏢 For Recruiters
- **Job Lifecycle Management**: Create, edit, and reopen jobs. Expired jobs are automatically handled.
- **Advanced Filtering**: Filter candidates by academic performance, skills, and department.
- **Application Workflow**: Shortlist, hire, or reject candidates with real-time status updates.
- **Smart Ranking**: AI-powered ranking of candidates based on job description fit.
- **Candidate Profiles**: Access detailed public student profiles, including their academic history and portfolios.

### 🛡️ For Administrators
- **Real-time Analytics**: Department-wise placement stats, average/highest package tracking, and hiring trends.
- **Bulk Data Management**: Import hundreds of students via CSV with automatic validation; Export student data for offline records.
- **Targeted Announcement System**: Create and broadcast notices with file attachments to specific Courses, Batches, or Departments.
- **Unique Counting**: Advanced aggregation logic ensures students are never double-counted in placement stats.
- **Admin Settings**: Globally toggle security features like DOB-based passwords and "Force Password Reset" for new batches.
- **Placement Enforcement**: Strict backend rules ensure students cannot apply for multiple on-campus jobs after receiving an offer.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), TailwindCSS, DaisyUI (Glassmorphism design).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB Atlas (NoSQL).
- **State Management**: Redux Toolkit & React Query.
- **Authentication**: JWT (JSON Web Tokens) with HTTP-only cookies.
- **Storage**: Cloudinary (Resumes, Profile Photos, Offer Letters).
- **Deployment**: Docker & Docker-Compose (Nginx for SPA routing).

---

## 📂 Project Structure

```bash
Placement-Portal/
├── index.html          # Static Landing Page (Entry point)
├── ctae-logo.png       # Branding Assets
├── ctaecampus.jpeg     # Hero Assets
├── Frontend/           # Student/Admin Portal (React + Vite)
│   ├── src/
│   │   ├── Components/ # UI elements
│   │   ├── pages/      # Route-based pages
│   │   └── store/      # State management
│   └── Dockerfile      # Frontend Build
├── backend/            # Express.js API (MERN Stack)
│   ├── controllers/    # Business logic
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   └── utils/          # Middleware & Auth
└── docker-compose.yml  # Full-stack Orchestration
```

---

## ⚙️ Local Setup Guide

Follow these steps to run the portal on your local machine:

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- [Node.js](https://nodejs.org/) (Optional, for local development without Docker).

### 2. Environment Configuration
Create a `.env` file in the **root** directory:
```env
# Database & Security
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
NODE_ENV=development
PORT=5001

# API Configuration
VITE_API_URL=http://localhost:5001/api/v1

# Cloudinary (File Uploads)
CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_cloudinary_key
CLOUD_API_SECRET=your_cloudinary_secret

# AI Features (Optional)
GROQ_API_KEY=your_groq_api_key
```

### 3. Run with Docker (Recommended)
From the root directory, run:
```powershell
docker-compose up --build
```
The application will be available at:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api/v1`

### 4. Default Admin Credentials
*Contact the development team for the initial administrator login credentials to access the analytics and management dashboards.*

---

## 🔒 Security & Optimization
- **SPA Routing**: Configured via Nginx `try_files` to prevent 404s on page refresh.
- **Data Integrity**: Automated sync utilities ensure that legacy data matches new placement tracking schemas.
- **Constraint Enforcement**: API-level validation prevents "Double Counting" and "Multiple On-Campus Offer" violations.

---

## 🤝 Contributing
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

**Developed for the CTAE Placement Cell.**
**By Pratiksha Vaya**
