import pool from "../config/db.js";
import { User } from "../types/user.types.js";

// create a new user
export const createUser = async (
  name: string,
  email: string,
  hashedPassword: string,
) => {
  const query = `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`;
  const values = [name, email, hashedPassword];
  try {
    const result = await pool.query(query, values);
    return result.rows[0]; // return the created user object
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// find a user by email
export const findUserByEmail = async (email: string) => {
  const query = `SELECT * from users WHERE email = $1`;
  const values = [email];
  try {
    const result = await pool.query(query, values);
    return result.rows[0]; // return the user object
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw error;
  }
};

// find a user by id
export const findUserById = async (id: number) => {
  const query = `SELECT * from users WHERE id = $1`;
  const values = [id];
  try {
    const result = await pool.query(query, values);
    return result.rows[0]; // return the user object
  } catch (error) {
    console.error("Error finding user by id:", error);
    throw error;
  }
};
