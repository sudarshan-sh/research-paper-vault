import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../repositories/auth.repository.js";

export const createUserService = async (
  name: string,
  email: string,
  password: string,
) => {
  try {
    const user = await createUser(name, email, password);
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const findUserByEmailService = async (email: string) => {
  try {
    const user = await findUserByEmail(email);
    return user;
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw error;
  }
};

export const findUserByIdService = async (id: number) => {
  try {
    const user = await findUserById(id);
    return user;
  } catch (error) {
    console.error("Error finding user by id:", error);
    throw error;
  }
};
