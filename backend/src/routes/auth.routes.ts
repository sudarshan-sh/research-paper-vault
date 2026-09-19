import express from "express";
import {
  createUserController,
  getUserController,
  loginUserController,
  logoutUserController,
} from "../controllers/auth.controller.js";
import { protectedRoute } from "../middleware/auth.js";

const router = express.Router();

// signup
router.post("/signup", createUserController);

// login
router.post("/login", loginUserController);

// user info
router.get("/user", protectedRoute, getUserController);

// logout
router.post("/logout", logoutUserController);

export default router;
