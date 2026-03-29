import { Router } from "express";
import type { Request, Response } from "express";
import { eq, ilike, and, sql, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { questions, chambers, questionUpvotes, notifications, answers } from "../db/schema.js";

const router = Router();

function parsePagination(req: Request) {
  return {
    limit: Math.min(Number(req.query.limit) || 20, 100),
    offset: Number(req.query.offset) || 0,
  };
}

const authorWith = {
  columns: { username: true, bio: true, avatar: true, links: true, posted: true, answered: true },
} as const;

const chamberWith = {
  columns: { uid: true, name: true },
} as const;

function questionExtras(username: string) {
  return {
    isUpvoted: sql<boolean>`EXISTS(
      SELECT 1 FROM question_upvotes qu WHERE qu.username = ${username} AND qu.question_uid = questions.uid
    )`.as("is_upvoted"),
  };
}

function mapQ(r: any) {
  return {
    question: {
      uid: r.uid,
      content: r.content,
      timeCreated: r.timeCreated,
      upvotes: r.upvotesCount ?? 0,
      isUpvoted: r.isUpvoted,
      authorUsername: r.author,
      chamberUid: r.chamber?.uid,
      chamberName: r.chamber?.name,
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

// GET /questions/search  (before /:uid)
router.get("/search", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const { limit, offset } = parsePagination(req);
  const q = (req.query.q as string) ?? "";
  if (!q) { res.json([]); return; }
  const rows = await db.query.questions.findMany({
    with: { chamber: chamberWith, authorUser: authorWith },
    extras: questionExtras(username!),
    where: ilike(questions.content!, `%${q}%`),
    orderBy: [desc(questions.timeCreated)],
    limit,
    offset,
  });
  res.json(rows.map(mapQ));
});

// GET /questions
router.get("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const { limit, offset } = parsePagination(req);
  const { sort, filter, chamber_uid, author } = req.query as Record<string, string>;

  const conditions = [];
  if (chamber_uid) conditions.push(eq(questions.chamberUid, chamber_uid));
  if (author) conditions.push(eq(questions.author, author));
  if (filter === "joined") {
    conditions.push(sql`EXISTS(
      SELECT 1 FROM chamber_members cm WHERE cm.chamber_uid = questions.chamber_uid AND cm.username = ${username}
    )`);
  }
  const orderBy =
    sort === "top" ? [desc(questions.upvotesCount)] :
    sort === "pinned" ? [desc(questions.pinnedAt)] :
    [desc(questions.timeCreated)];

  const rows = await db.query.questions.findMany({
    with: { chamber: chamberWith, authorUser: authorWith },
    extras: questionExtras(username!),
    where: conditions.length ? and(...conditions) : undefined,
    orderBy,
    limit,
    offset,
  });
  res.json(rows.map(mapQ));
});

// POST /questions
router.post("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const { content, chamberUid } = req.body as { content: string; chamberUid: string };
  if (!chamberUid) { res.status(400).json({ error: "chamber uid is required" }); return; }
  try {
    await db.insert(questions).values({ content, author: username!, chamberUid });
    res.status(201).json({ message: "question created" });
  } catch { res.status(500).json({ error: "failed to create question" }); }
});

// GET /questions/:uid
router.get("/:uid", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const row = await db.query.questions.findFirst({
    with: { chamber: chamberWith, authorUser: authorWith },
    extras: questionExtras(username!),
    where: eq(questions.uid, req.params.uid),
  });
  if (!row) { res.status(404).json({ error: "question not found" }); return; }
  res.json(mapQ(row));
});

// PATCH /questions/:uid
router.patch("/:uid", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const { content } = req.body as { content: string };
  try {
    await db.update(questions).set({ content })
      .where(and(eq(questions.uid, req.params.uid), eq(questions.author, username!)));
    res.json({ message: "question updated" });
  } catch { res.status(500).json({ error: "failed to update question" }); }
});

// DELETE /questions/:uid
router.delete("/:uid", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const q = await db.query.questions.findFirst({
    columns: { author: true },
    where: eq(questions.uid, req.params.uid),
  });
  if (!q) { res.status(404).json({ error: "question not found" }); return; }
  if (q.author !== username) { res.status(403).json({ error: "unauthorized" }); return; }
  await db.delete(questions).where(eq(questions.uid, req.params.uid));
  res.json({ message: "question deleted" });
});

// POST /questions/:uid/votes — toggle
router.post("/:uid/votes", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const uid = req.params.uid;
  const existing = await db.query.questionUpvotes.findFirst({
    where: and(eq(questionUpvotes.username, username!), eq(questionUpvotes.questionUid, uid)),
  });
  if (existing) {
    await db.delete(questionUpvotes)
      .where(and(eq(questionUpvotes.username, username!), eq(questionUpvotes.questionUid, uid)));
    await db.update(questions)
      .set({ upvotesCount: sql`${questions.upvotesCount} - 1` })
      .where(eq(questions.uid, uid));
  } else {
    await db.insert(questionUpvotes).values({ username: username!, questionUid: uid });
    await db.update(questions)
      .set({ upvotesCount: sql`${questions.upvotesCount} + 1` })
      .where(eq(questions.uid, uid));
    const q = await db.query.questions.findFirst({ columns: { author: true }, where: eq(questions.uid, uid) });
    if (q?.author && q.author !== username) {
      const author = q.author;
      await db.insert(notifications).values({
          userUsername: author,
          actorUsername: username!,
          type: "upvote_question",
          referenceUid: uid,
        }).onConflictDoNothing();
    }
  }
  res.json({ message: "vote updated" });
});

// POST /questions/:uid/pin
router.post("/:uid/pin", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const q = await db.query.questions.findFirst({
    with: { chamber: { columns: { creatorUsername: true } } },
    where: eq(questions.uid, req.params.uid),
  });
  if (!q) { res.status(404).json({ error: "question not found" }); return; }
  if (q.chamber?.creatorUsername !== username) { res.status(403).json({ error: "unauthorized" }); return; }
  await db.update(questions).set({ pinnedAt: new Date() }).where(eq(questions.uid, req.params.uid));
  res.json({ message: "question pinned" });
});

// DELETE /questions/:uid/pin
router.delete("/:uid/pin", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const q = await db.query.questions.findFirst({
    with: { chamber: { columns: { creatorUsername: true } } },
    where: eq(questions.uid, req.params.uid),
  });
  if (!q) { res.status(404).json({ error: "question not found" }); return; }
  if (q.chamber?.creatorUsername !== username) { res.status(403).json({ error: "unauthorized" }); return; }
  await db.update(questions).set({ pinnedAt: null }).where(eq(questions.uid, req.params.uid));
  res.json({ message: "question unpinned" });
});

export default router;
