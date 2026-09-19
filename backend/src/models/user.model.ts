import type { User } from "../types/user.types.js";

// user model
export const toPublicUser = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
};
