import { Router } from "express";
import type { Request, Response } from "express";
import { eq, ilike, and, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { spaces, spaceMembers } from "../db/schema.js";

const router = Router();

function spaceExtras(username: string) {
  return {
    memberCount: sql<number>`(SELECT COUNT(*) FROM space_members WHERE space_uid = spaces.uid)`.as("member_count"),
    isJoined: sql<boolean>`EXISTS(SELECT 1 FROM space_members WHERE space_uid = spaces.uid AND username = ${username})`.as("is_joined"),
  };
}

function mapSpace(r: any) {
  return {
    uid: r.uid, name: r.name, description: r.description,
    creatorUsername: r.creatorUsername, memberCount: r.memberCount ?? 0,
    isJoined: r.isJoined, colorIndex: r.colorIndex ?? 0, timeCreated: r.createdAt,
  };
}

// GET /spaces?q=
router.get("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const q = (req.query.q as string) ?? "";
  const rows = await db.query.spaces.findMany({
    extras: spaceExtras(username!),
    where: q ? ilike(spaces.name, `%${q}%`) : undefined,
    orderBy: [spaces.name],
  });
  res.json(rows.map(mapSpace));
});

// POST /spaces
router.post("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const { name, description, colorIndex } = req.body as { name: string; description?: string; colorIndex?: number };
  try {
    const [space] = await db.insert(spaces).values({ name, description, creatorUsername: username, colorIndex: colorIndex ?? 0 }).returning();
    await db.insert(spaceMembers).values({ spaceUid: space.uid, username: username! });
    res.status(201).json({ uid: space.uid, name: space.name, description: space.description, creatorUsername: space.creatorUsername, memberCount: 1, isJoined: true, colorIndex: space.colorIndex ?? 0, timeCreated: space.createdAt });
  } catch { res.status(500).json({ error: "failed to create space" }); }
});

// DELETE /spaces — body: { name }
router.delete("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const { name } = req.body as { name: string };
  await db.delete(spaces).where(and(eq(spaces.name, name), eq(spaces.creatorUsername!, username!)));
  res.json({ message: "space deleted" });
});

// PATCH /spaces/:uid
router.patch("/:uid", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const { name, description, colorIndex } = req.body as { name?: string; description?: string; colorIndex?: number };
  if (!name || !description) { res.status(400).json({ error: "name and description are required" }); return; }
  try {
    const c = await db.query.spaces.findFirst({ columns: { creatorUsername: true }, where: eq(spaces.uid, req.params.uid) });
    if (!c) { res.status(404).json({ error: "space not found" }); return; }
    if (c.creatorUsername !== username) { res.status(403).json({ error: "unauthorized" }); return; }
    await db.update(spaces).set({ name, description, colorIndex: colorIndex ?? 0 }).where(eq(spaces.uid, req.params.uid));
    res.json({ message: "space updated" });
  } catch (err: any) {
    if (err?.code === "23505") { res.status(409).json({ error: "space name already exists" }); return; }
    res.status(500).json({ error: "failed to update space" });
  }
});

// POST /spaces/:uid/join
router.post("/:uid/join", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  try {
    await db.insert(spaceMembers).values({ spaceUid: req.params.uid, username: username! }).onConflictDoNothing();
    res.json({ message: "joined space" });
  } catch { res.status(400).json({ error: "invalid uid" }); }
});

// POST /spaces/:uid/leave
router.post("/:uid/leave", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  await db.delete(spaceMembers).where(and(eq(spaceMembers.spaceUid, req.params.uid), eq(spaceMembers.username, username!)));
  res.json({ message: "left space" });
});

export default router;
