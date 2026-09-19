import {
  comparePassword,
  cookieOptions,
  generateToken,
  handleResponse,
  hashPassword,
} from "../helper/helper.js";
import type { Request, Response } from "express";
import {
  createUserService,
  findUserByEmailService,
  findUserByIdService,
} from "../services/auth.service.js";
import { toPublicUser } from "../models/user.model.js";

export const createUserController = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return handleResponse(res, 400, "Missing required fields");
  }

  try {
    // check if user already exists
    const userExists = await findUserByEmailService(email);
    if (userExists) {
      return handleResponse(res, 400, "User already exists");
    }

    // hash password
    const hashedPassword = await hashPassword(password);

    // create user
    const createdUser = await createUserService(name, email, hashedPassword);

    // generate token
    const token = generateToken(createdUser.id);

    // set token in cookie
    res.cookie("token", token, cookieOptions);

    return handleResponse(res, 201, "User created successfully", {
      user: toPublicUser(createdUser),
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return handleResponse(res, 500, "Internal server error");
  }
};

// login user
export const loginUserController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return handleResponse(res, 400, "Missing required fields");
  }

  try {
    // find user by email
    const user = await findUserByEmailService(email);

    // check if user exists
    if (!user) {
      return handleResponse(res, 404, "No user found, please register first!");
    }

    // compare password
    const isPasswordCorrect = await comparePassword(password, user.password);

    if (!isPasswordCorrect) {
      return handleResponse(res, 401, "Please enter correct password!");
    }

    // generate token
    const token = generateToken(user.id);

    // set token in cookie
    res.cookie("token", token, cookieOptions);

    return handleResponse(res, 200, "User logged in successfully!", {
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    return handleResponse(res, 500, "Internal server error");
  }
};

// get user by id
export const getUserController = async (req: Request, res: Response) => {
  if (!req.user) {
    return handleResponse(res, 401, "Not authorized!");
  }
  const userId = req.user.id;

  const userObj = await findUserByIdService(userId);

  if (!userObj) {
    return handleResponse(res, 404, "User not found");
  }

  return handleResponse(res, 200, "User fetched successfully", {
    user: toPublicUser(userObj),
  });
};

// logout user
export const logoutUserController = async (req: Request, res: Response) => {
  res.cookie("token", "", cookieOptions);
  return handleResponse(res, 200, "User logged out successfully");
};
