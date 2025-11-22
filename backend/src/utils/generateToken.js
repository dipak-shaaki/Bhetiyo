import jwt from "jsonwebtoken";

export default function generateToken(user) {
  const payload = { id: user._id, email: user.email, name: user.name };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}
