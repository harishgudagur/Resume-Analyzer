📄 Resume Analyzer

A full-stack web application that allows users to register, log in, upload resumes, and analyze resume content using a Node.js backend and React frontend.

The project is deployed on Render with separate frontend and backend services.







🚀 Live Demo




Frontend:

https://resume-analyzer-1-y24e.onrender.com





Backend:

https://resume-analyzer-backend-zico.onrender.com








🛠 Tech Stack
Frontend
React
React Router
JavaScript
CSS
Backend
Node.js
Express.js
MongoDB
Mongoose
JWT Authentication
CORS
Deployment
Render (Frontend + Backend)
MongoDB Atlas


✨ Features
User Registration
User Login with JWT Authentication
Resume Upload
Resume Analysis
Protected Routes
Token-based Authorization
Responsive UI









📂 Project Structure
Resume-Analyzer/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
⚙️ Environment Variables (Backend)







Create a .env file inside the backend folder:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
▶️ Run Locally
1. Clone Repository
git clone https://github.com/harishgudagur/Resume-Analyzer.git
cd Resume-Analyzer
2. Start Backend
cd backend
npm install
node server.js




Backend runs on:

http://localhost:5000
3. Start Frontend
cd frontend
npm install
npm start





Frontend runs on:

http://localhost:3000
🔐 API Endpoints
Register
POST /auth/register
Login
POST /auth/login
📦 Deployment Notes





Frontend deployed as Static Site on Render

Backend deployed as Web Service

CORS configured for frontend domain

Render free tier may cause first request delay (30–50 seconds)






👨‍💻 Author

Harish Gudagur

GitHub:
https://github.com/harishgudagur







⭐ Future Improvements

Resume scoring

AI-based resume suggestions

Admin dashboard

Profile management










📜 License

This project is open source.
