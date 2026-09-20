import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { CookieOptions, Response } from "express";

// hashed password
export const hashPassword = async (password: string) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// compare password
export const comparePassword = async (
  password: string,
  userPassword: string,
) => {
  return bcrypt.compare(password, userPassword);
};

// it signs the token with the user id
export const generateToken = (id: number) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  return jwt.sign({ id }, secret, {
    expiresIn: "1h", // token expires in 1 hour
  });
};

// cookie options for setting the token in the client's browser
export const cookieOptions: CookieOptions = {
  httpOnly: true, // avoid cookie access by JS and travel only from server to browser and vice-versa
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax", // to prevent CSRF attacks
  maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
} as const;

// reads a positive integer from a query string value, uses the fallback when it is missing or
// invalid and caps it at max
export const parsePositiveInt = (
  value: unknown,
  fallback: number,
  max = Number.MAX_SAFE_INTEGER,
) => {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  return parsed >= 1 ? Math.min(parsed, max) : fallback;
};

// standardize response function
export const handleResponse = (
  res: Response,
  status: number,
  message: string,
  data?: any,
) => {
  res.status(status).json({
    status,
    message,
    ...data,
  });
};
