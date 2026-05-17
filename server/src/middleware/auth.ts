import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";

export interface AuthRequest extends Request {
  user: { id: string; username: string };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session?.user) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const username = (session.user as any).username as string;
  if (!username) {
    res.status(403).json({ error: "username is required to perform this action. Please set one in your profile." });
    return;
  }

  (req as AuthRequest).user = {
    id: session.user.id,
    username,
  };
  next();
}
