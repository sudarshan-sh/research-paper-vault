import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { handleResponse } from "../helper/helper.js";
import type { AuthTokenPayload } from "../types/auth.types.js";

export const protectedRoute = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return handleResponse(res, 401, "Not authorized!");
    }

    // checks and verifies the signature of the token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not set");
    }
    const decoded = jwt.verify(token, secret || "") as AuthTokenPayload;

    if (!decoded) {
      return handleResponse(res, 401, "Not authorized!");
    }

    req.user = { id: decoded.id };
    next(); // pass the request to the next middleware
  } catch (error) {
    console.error("Error verifying token:", error);
    return handleResponse(res, 500, "Internal server error");
  }
};
