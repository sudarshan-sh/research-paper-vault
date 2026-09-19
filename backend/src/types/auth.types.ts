import type { JwtPayload } from "jsonwebtoken";

export interface AuthTokenPayload extends JwtPayload {
  id: number;
}

export interface AuthUser {
  id: number;
}
