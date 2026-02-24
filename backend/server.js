import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import cors from "cors"

import authRoutes from "./routes/authRoutes.js"
import resumeRoutes from "./routes/resumeRoutes.js"

dotenv.config()

const app = express()

// Middleware
app.use(express.json())

// CORS (FIXED)
app.use(
  cors({
    origin: ["https://resume-analyzer-1-y24e.onrender.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

// Handle preflight
app.options("*", cors())

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err.message))

// Routes
app.use("/auth", authRoutes)
app.use("/resume", resumeRoutes)

// Test Route
app.get("/", (req, res) => {
  res.send("Resume Analyzer API Running")
})

// Port
const PORT = process.env.PORT || 10000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})