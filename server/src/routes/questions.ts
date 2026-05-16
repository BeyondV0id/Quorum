import { Router } from "express";
import type { Request, Response } from "express";
import { eq, ilike, and, desc, inArray } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { questions, spaces, spaceMembers, questionUpvotes, notifications, answers, user } from "../db/schema.js";
import { z } from "zod";

const questionSchema = z.object({
  content: z.string().trim().min(1, "content is required").max(5000, "content too long"),
  spaceUid: z.string().min(1, "space uid is required").optional(),
});

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

const spaceWith = {
  columns: { uid: true, name: true },
} as const;

function mapQ(r: any, isUpvoted: boolean) {
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

async function withQuestionUpvotes<T extends { uid: string }>(rows: T[], username: string) {
  if (!rows.length) return rows.map((r) => ({ row: r, isUpvoted: false }));
  const ids = rows.map((r) => r.uid);
  const upvotes = await db.query.questionUpvotes.findMany({
    columns: { questionUid: true },
    where: and(eq(questionUpvotes.username, username), inArray(questionUpvotes.questionUid, ids)),
  });
  const upvotedSet = new Set(upvotes.map((u) => u.questionUid));
  return rows.map((row) => ({ row, isUpvoted: upvotedSet.has(row.uid) }));
}

// GET /questions/search  (before /:uid)
router.get("/search", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const { limit, offset } = parsePagination(req);
  const q = (req.query.q as string) ?? "";
  if (!q) { res.json([]); return; }
  const rows = await db.query.questions.findMany({
    with: { space: spaceWith, authorUser: authorWith },
    where: ilike(questions.content!, `%${q}%`),
    orderBy: [desc(questions.timeCreated)],
    limit,
    offset,
  });
  const enriched = await withQuestionUpvotes(rows, username!);
  res.json(enriched.map(({ row, isUpvoted }) => mapQ(row, isUpvoted)));
});

// GET /questions
router.get("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const { limit, offset } = parsePagination(req);
  const { sort, filter, space_uid, author } = req.query as Record<string, string>;

  const conditions = [];
  if (space_uid) conditions.push(eq(questions.spaceUid, space_uid));
  if (author) conditions.push(eq(questions.author, author));
  if (filter === "joined") {
    const memberships = await db.query.spaceMembers.findMany({
      columns: { spaceUid: true },
      where: eq(spaceMembers.username, username!),
    });
    const joinedSpaceIds = memberships.map((m) => m.spaceUid);
    if (!joinedSpaceIds.length) {
      res.json([]);
      return;
    }
    conditions.push(inArray(questions.spaceUid, joinedSpaceIds));
  }
  const orderBy =
    sort === "votes" || sort === "top" ? [desc(questions.upvotesCount)] :
    sort === "pinned" ? [desc(questions.pinnedAt)] :
    [desc(questions.timeCreated)];

  const rows = await db.query.questions.findMany({
    with: { space: spaceWith, authorUser: authorWith },
    where: conditions.length ? and(...conditions) : undefined,
    orderBy,
    limit,
    offset,
  });
  const enriched = await withQuestionUpvotes(rows, username!);
  res.json(enriched.map(({ row, isUpvoted }) => mapQ(row, isUpvoted)));
});

// POST /questions
router.post("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  
  const parsed = questionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error?.issues?.[0]?.message || "Invalid input" });
    return;
  }
  const { content, spaceUid } = parsed.data;
  if (!spaceUid) { res.status(400).json({ error: "space uid is required" }); return; }
  
  try {
    await db.transaction(async (tx) => {
      await tx.insert(questions).values({ content, author: username!, spaceUid });
      const current = await tx.query.user.findFirst({
        columns: { posted: true },
        where: eq(user.username, username!),
      });
      await tx
        .update(user)
        .set({ posted: (current?.posted ?? 0) + 1 })
        .where(eq(user.username, username!));
    });
    res.status(201).json({ message: "question created" });
  } catch (err) {
    console.error("[POST /questions] DB error:", err);
    res.status(500).json({ error: "failed to create question" });
  }
});

// GET /questions/:uid
router.get("/:uid", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const uid = req.params.uid as string;
  const row = await db.query.questions.findFirst({
    with: { space: spaceWith, authorUser: authorWith },
    where: eq(questions.uid, uid),
  });
  if (!row) { res.status(404).json({ error: "question not found" }); return; }
  const upvote = await db.query.questionUpvotes.findFirst({
    columns: { questionUid: true },
    where: and(eq(questionUpvotes.username, username!), eq(questionUpvotes.questionUid, uid)),
  });
  res.json(mapQ(row, !!upvote));
});

// PATCH /questions/:uid
router.patch("/:uid", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const uid = req.params.uid as string;
  
  const parsed = questionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error?.issues?.[0]?.message || "Invalid input" });
    return;
  }
  const { content } = parsed.data;
  
  try {
    await db.update(questions).set({ content })
      .where(and(eq(questions.uid, uid), eq(questions.author, username!)));
    res.json({ message: "question updated" });
  } catch { res.status(500).json({ error: "failed to update question" }); }
});

// DELETE /questions/:uid
router.delete("/:uid", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const uid = req.params.uid as string;
  const q = await db.query.questions.findFirst({
    columns: { author: true },
    where: eq(questions.uid, uid),
  });
  if (!q) { res.status(404).json({ error: "question not found" }); return; }
  if (q.author !== username) { res.status(403).json({ error: "unauthorized" }); return; }
  await db.transaction(async (tx) => {
    await tx.delete(questions).where(eq(questions.uid, uid));
    const current = await tx.query.user.findFirst({
      columns: { posted: true },
      where: eq(user.username, username!),
    });
    await tx
      .update(user)
      .set({ posted: Math.max((current?.posted ?? 0) - 1, 0) })
      .where(eq(user.username, username!));
  });
  res.json({ message: "question deleted" });
});

// POST /questions/:uid/votes — toggle
router.post("/:questionUid/votes", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const questionUid = req.params.questionUid as string;
  await db.transaction(async (tx) => {
    const existing = await tx.query.questionUpvotes.findFirst({
      where: and(eq(questionUpvotes.username, username!), eq(questionUpvotes.questionUid, questionUid)),
    });
    if (existing) {
      await tx.delete(questionUpvotes)
        .where(and(eq(questionUpvotes.username, username!), eq(questionUpvotes.questionUid, questionUid)));
      const current = await tx.query.questions.findFirst({
        columns: { upvotesCount: true },
        where: eq(questions.uid, questionUid),
      });
      await tx.update(questions)
        .set({ upvotesCount: Math.max((current?.upvotesCount ?? 0) - 1, 0) })
        .where(eq(questions.uid, questionUid));
    } else {
      await tx.insert(questionUpvotes).values({ username: username!, questionUid: questionUid });
      const current = await tx.query.questions.findFirst({
        columns: { upvotesCount: true },
        where: eq(questions.uid, questionUid),
      });
      await tx.update(questions)
        .set({ upvotesCount: (current?.upvotesCount ?? 0) + 1 })
        .where(eq(questions.uid, questionUid));
      const q = await tx.query.questions.findFirst({ columns: { author: true }, where: eq(questions.uid, questionUid) });
      if (q?.author && q.author !== username) {
        const author = q.author;
        await tx.insert(notifications).values({
            userUsername: author,
            actorUsername: username as string,
            type: "upvote_question",
            referenceUid: questionUid,
          }).onConflictDoNothing({ target: [notifications.userUsername, notifications.actorUsername, notifications.type, notifications.referenceUid] });
      }
    }
  });
  res.json({ message: "vote updated" });
});

// POST /questions/:uid/pin
router.post("/:uid/pin", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const uid = req.params.uid as string;
  const q = await db.query.questions.findFirst({
    with: { space: { columns: { creatorUsername: true } } },
    where: eq(questions.uid, uid),
  });
  if (!q) { res.status(404).json({ error: "question not found" }); return; }
  if (q.space?.creatorUsername !== username) { res.status(403).json({ error: "unauthorized" }); return; }
  await db.update(questions).set({ pinnedAt: new Date() }).where(eq(questions.uid, uid));
  res.json({ message: "question pinned" });
});

// DELETE /questions/:uid/pin
router.delete("/:uid/pin", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const uid = req.params.uid as string;
  const q = await db.query.questions.findFirst({
    with: { space: { columns: { creatorUsername: true } } },
    where: eq(questions.uid, uid),
  });
  if (!q) { res.status(404).json({ error: "question not found" }); return; }
  if (q.space?.creatorUsername !== username) { res.status(403).json({ error: "unauthorized" }); return; }
  await db.update(questions).set({ pinnedAt: null }).where(eq(questions.uid, uid));
  res.json({ message: "question unpinned" });
});

export default router;
