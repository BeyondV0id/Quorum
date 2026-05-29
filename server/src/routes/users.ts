import { Router } from "express";
import type { Request, Response } from "express";
import { eq, ilike, inArray, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { user, questions, questionUpvotes, notifications } from "../db/schema.js";
import { z } from "zod";

const updateUserSchema = z.object({
  username: z.string().regex(/^[^\s]+$/, "username cannot contain spaces").optional(),
  bio: z.string().max(500, "bio too long").optional(),
  avatar: z.string().optional(),
  link: z.string().optional(),
});

const router = Router();

const authorColumns = {
  username: true,
  bio: true,
  avatar: true,
  links: true,
  posted: true,
  answered: true,
} as const;

// GET /users/search?q=  (before /:username)
router.get("/search", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const q = (req.query.q as string) ?? "";
  if (!q) { res.json([]); return; }
  const rows = await db.query.user.findMany({
    columns: authorColumns,
    where: ilike(user.username!, `%${q}%`),
    limit: 20,
  });
  res.json(rows.map((r) => ({ username: r.username, bio: r.bio, avatar: r.avatar, link: r.links, posted: r.posted, answered: r.answered })));
});

// POST /users/resolve
router.post("/resolve", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { usernames } = req.body as { usernames?: string[] };
  if (!usernames?.length) { res.json({ existing: [] }); return; }
  const rows = await db.query.user.findMany({
    columns: { username: true },
    where: inArray(user.username!, usernames),
  });
  res.json({ existing: rows.map((r) => r.username) });
});

// GET /users/me
router.get("/me", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { id } = (req as AuthRequest).user;
  const row = await db.query.user.findFirst({
    columns: { ...authorColumns, email: true },
    where: eq(user.id, id),
  });
  if (!row) { res.status(404).json({ error: "user not found" }); return; }
  res.json({ username: row.username, email: row.email, bio: row.bio, avatar: row.avatar, link: row.links, posted: row.posted, answered: row.answered });
});

// PATCH /users/me
router.patch("/me", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { id } = (req as AuthRequest).user;
  
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error?.issues?.[0]?.message || "Invalid input" });
    return;
  }
  const { username: newUsername, bio, avatar, link } = parsed.data;

  try {
    if (newUsername) {
      // Get current username from DB (not session — session may be stale)
      const current = await db.query.user.findFirst({ columns: { username: true }, where: eq(user.id, id) });
      if (current?.username !== newUsername) {
        const existing = await db.query.user.findFirst({ columns: { id: true }, where: eq(user.username!, newUsername) });
        if (existing) { res.status(409).json({ error: "username already taken" }); return; }
      }
    }
    await db.update(user).set({
      ...(newUsername ? { username: newUsername, displayUsername: newUsername, name: newUsername } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(avatar !== undefined ? { avatar } : {}),
      ...(link !== undefined ? { links: link } : {}),
    }).where(eq(user.id, id));

    res.json({ message: "profile updated" });
  } catch { res.status(500).json({ error: "failed to update profile" }); }
});

// DELETE /users/me
router.delete("/me", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { id } = (req as AuthRequest).user;
  await db.delete(user).where(eq(user.id, id));
  res.json({ message: "Account deleted successfully" });
});

// GET /users/me/questions
router.get("/me/questions", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Number(req.query.offset) || 0;
  const rows = await db.query.questions.findMany({
    with: {
      space: { columns: { uid: true, name: true } },
      authorUser: { columns: authorColumns },
    },
    where: eq(questions.author, username!),
    orderBy: [desc(questions.timeCreated)],
    limit,
    offset,
  });
  const upvotes = rows.length
    ? await db.query.questionUpvotes.findMany({
        columns: { questionUid: true },
        where: and(eq(questionUpvotes.username, username!), inArray(questionUpvotes.questionUid, rows.map((r) => r.uid))),
      })
    : [];
  const upvotedSet = new Set(upvotes.map((u) => u.questionUid));
  res.json(rows.map((r) => mapQuestionRow(r, upvotedSet.has(r.uid))));
});

// GET /users/me/notifications
router.get("/me/notifications", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Number(req.query.offset) || 0;
  const rows = await db.query.notifications.findMany({
    with: { actorUser: { columns: { avatar: true } } },
    where: eq(notifications.userUsername, username!),
    orderBy: [desc(notifications.createdAt)],
    limit,
    offset,
  });
  res.json(rows.map((r) => ({
    uid: r.uid,
    user_username: r.userUsername,
    actor_username: r.actorUsername,
    actor_avatar: r.actorUser?.avatar ?? "",
    type: r.type,
    reference_uid: r.referenceUid,
    content: "",
    question_content: "",
    is_read: r.isRead,
    created_at: r.createdAt,
  })));
});

// GET /users/:username — public profile (last)
router.get("/:username", async (req: Request, res: Response): Promise<void> => {
  const username = req.params.username as string;
  const row = await db.query.user.findFirst({
    columns: authorColumns,
    where: eq(user.username!, username),
  });
  if (!row) { res.status(404).json({ error: "profile not found" }); return; }
  res.json({ username: row.username, bio: row.bio, avatar: row.avatar, link: row.links, posted: row.posted, answered: row.answered });
});

function mapQuestionRow(r: any, isUpvoted: boolean) {
  return {
    question: {
      uid: r.uid,
      content: r.content,
      timeCreated: r.timeCreated,
      upvotes: r.upvotesCount ?? 0,
      isUpvoted,
      authorUsername: r.author,
      spaceUid: r.space?.uid,
      spaceName: r.space?.name,
      acceptedAnswerUid: r.acceptedAnswerUid ?? "",
      isPinned: !!r.pinnedAt,
    },
    author: {
      username: r.authorUser?.username ?? r.author,
      bio: r.authorUser?.bio,
      avatar: r.authorUser?.avatar,
      link: r.authorUser?.links ?? "",
      posted: r.authorUser?.posted ?? 0,
      answered: r.authorUser?.answered ?? 0,
    },
  };
}

export default router;
