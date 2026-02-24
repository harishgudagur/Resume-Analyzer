import User from "../models/User.js"
import jwt from "jsonwebtoken"

// REGISTER
export const register = async (req, res) => {
  try {
    const user = await User.create(req.body)
    res.json(user)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// LOGIN
export const login = async (req, res) => {
  try {
    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "JWT_SECRET not configured" })
    }

    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )

    res.json({ token })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Login failed" })
  }
}