import bcrypt from "bcrypt";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const SALT_ROUNDS = 10;

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, passwordHash });

    try {
      const token = generateToken(user);
      res.status(201).json({ user: { id: user._id, name: user.name, email: user.email }, token });
    } catch (tokenErr) {
      console.error("Token generation error", tokenErr);
      res.status(500).json({ error: "Could not create authentication token" });
    }
  } catch (err) {
    console.error("register error", err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    try {
      const token = generateToken(user);
      res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
    } catch (tokenErr) {
      console.error("Token generation error", tokenErr);
      res.status(500).json({ error: "Could not create authentication token" });
    }
  } catch (err) {
    console.error("login error", err);
    res.status(500).json({ error: "Server error" });
  }
}

// Logout function - client-side logout by discarding the token
export async function logout(req, res) {
  try {
    // For JWT, logout is handled client-side by discarding the token
    // We can add token blacklisting here in the future if needed
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("logout error", err);
    res.status(500).json({ error: "Server error" });
  }
}