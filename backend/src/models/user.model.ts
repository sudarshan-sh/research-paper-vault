import type { User } from "../types/user.types.js";

// user model
export const toPublicUser = (user: User) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};
