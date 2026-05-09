import { Router } from "express";
import type { Request, Response } from "express";
import { eq, and, inArray } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { answers, questions, answerUpvotes, notifications, user } from "../db/schema.js";
import { z } from "zod";

const replySchema = z.object({
  content: z.string().trim().min(1, "content is required").max(5000, "content too long"),
});

const router = Router({ mergeParams: true });

const authorWith = {
  columns: { username: true, bio: true, avatar: true, links: true, posted: true, answered: true },
} as const;

function mapReply(r: any, isUpvoted: boolean, isAccepted: boolean) {
  return {
    answer: {
      uid: r.uid, content: r.content, timeCreated: r.timeCreated, questionUid: r.questionUid,
      upvotes: r.upvotesCount ?? 0, isUpvoted, authorUsername: r.author, isAccepted,
    },
    author: {
      username: r.authorUser?.username ?? r.author,
      bio: r.authorUser?.bio, avatar: r.authorUser?.avatar,
      link: r.authorUser?.links ?? "", posted: r.authorUser?.posted ?? 0, answered: r.authorUser?.answered ?? 0,
    },
  };
}

// GET /questions/:uid/replies
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const username = (req as AuthRequest).user?.username;
  const uid = req.params.uid as string;
  const rows = await db.query.answers.findMany({
    with: { authorUser: authorWith },
    where: eq(answers.questionUid, uid),
    orderBy: [answers.timeCreated],
  });

  const answerIds = rows.map((r) => r.uid);
  const [question, userVotes] = await Promise.all([
    db.query.questions.findFirst({
      columns: { acceptedAnswerUid: true },
      where: eq(questions.uid, uid),
    }),
    username && answerIds.length
      ? db.query.answerUpvotes.findMany({
          columns: { answerUid: true },
          where: and(eq(answerUpvotes.username, username), inArray(answerUpvotes.answerUid, answerIds)),
        })
      : Promise.resolve([]),
  ]);

  const upvotedSet = new Set(userVotes.map((v) => v.answerUid));
  const acceptedUid = question?.acceptedAnswerUid ?? null;
  res.json(rows.map((r) => mapReply(r, upvotedSet.has(r.uid), acceptedUid === r.uid)));
});

// POST /questions/:uid/replies
router.post("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const uid = req.params.uid as string;
  
  const parsed = replySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error?.issues?.[0]?.message || "Invalid input" });
    return;
  }
  const { content } = parsed.data;

  try {
    const answer = await db.transaction(async (tx) => {
      const [ans] = await tx.insert(answers).values({ content, questionUid: uid, author: username! }).returning();
      if (!ans) throw new Error("failed to insert answer");
      const current = await tx.query.user.findFirst({
        columns: { answered: true },
        where: eq(user.username, username!),
      });
      await tx
        .update(user)
        .set({ answered: (current?.answered ?? 0) + 1 })
        .where(eq(user.username, username!));
      const q = await tx.query.questions.findFirst({ columns: { author: true }, where: eq(questions.uid, uid) });
      const qAuthor = q?.author;
      if (qAuthor && qAuthor !== username) {
        await tx.insert(notifications).values({
          userUsername: qAuthor,
          actorUsername: username!,
          type: "reply_question",
          referenceUid: ans.uid,
        }).onConflictDoNothing({ target: [notifications.userUsername, notifications.actorUsername, notifications.type, notifications.referenceUid] });
      }
      return ans;
    });
    res.status(201).json({ uid: answer.uid, content: answer.content, timeCreated: answer.timeCreated, questionUid: answer.questionUid, upvotes: 0, isUpvoted: false, authorUsername: answer.author, isAccepted: false });
  } catch { res.status(400).json({ error: "invalid question uid" }); }
});

// PATCH /questions/:uid/replies/:ruid
router.patch("/:ruid", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const ruid = req.params.ruid as string;
  
  const parsed = replySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error?.issues?.[0]?.message || "Invalid input" });
    return;
  }
  const { content } = parsed.data;

  try {
    await db.update(answers).set({ content })
      .where(and(eq(answers.uid, ruid), eq(answers.author, username!)));
    res.json({ message: "reply updated" });
  } catch { res.status(500).json({ error: "failed to update reply" }); }
});

// DELETE /questions/:uid/replies/:ruid
router.delete("/:ruid", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const { uid, ruid } = req.params as { uid: string, ruid: string };
  await db.transaction(async (tx) => {
    const [deleted] = await tx.delete(answers).where(and(eq(answers.uid, ruid), eq(answers.questionUid, uid), eq(answers.author, username!))).returning({ uid: answers.uid });
    if (deleted) {
      const current = await tx.query.user.findFirst({
        columns: { answered: true },
        where: eq(user.username, username!),
      });
      await tx
        .update(user)
        .set({ answered: Math.max((current?.answered ?? 0) - 1, 0) })
        .where(eq(user.username, username!));
    }
  });
  res.json({ message: "reply deleted" });
});

// POST /questions/:uid/replies/:ruid/votes — toggle
router.post("/:ruid/votes", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const ruid = req.params.ruid as string;
  await db.transaction(async (tx) => {
    const existing = await tx.query.answerUpvotes.findFirst({
      where: and(eq(answerUpvotes.username, username!), eq(answerUpvotes.answerUid, ruid)),
    });
    if (existing) {
      await tx.delete(answerUpvotes).where(and(eq(answerUpvotes.username, username!), eq(answerUpvotes.answerUid, ruid)));
      const current = await tx.query.answers.findFirst({
        columns: { upvotesCount: true },
        where: eq(answers.uid, ruid),
      });
      await tx
        .update(answers)
        .set({ upvotesCount: Math.max((current?.upvotesCount ?? 0) - 1, 0) })
        .where(eq(answers.uid, ruid));
    } else {
      await tx.insert(answerUpvotes).values({ username: username!, answerUid: ruid });
      const current = await tx.query.answers.findFirst({
        columns: { upvotesCount: true },
        where: eq(answers.uid, ruid),
      });
      await tx
        .update(answers)
        .set({ upvotesCount: (current?.upvotesCount ?? 0) + 1 })
        .where(eq(answers.uid, ruid));
      const a = await tx.query.answers.findFirst({ columns: { author: true }, where: eq(answers.uid, ruid) });
      const author = a?.author;
      if (author && author !== username) {
        await tx.insert(notifications).values({
          userUsername: author,
          actorUsername: username!,
          type: "upvote_reply",
          referenceUid: ruid,
        }).onConflictDoNothing({ target: [notifications.userUsername, notifications.actorUsername, notifications.type, notifications.referenceUid] });
      }
    }
  });
  res.json({ message: "vote updated" });
});

// POST /questions/:uid/replies/:ruid/accept
router.post("/:ruid/accept", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const { uid, ruid } = req.params as { uid: string, ruid: string };
  const q = await db.query.questions.findFirst({ columns: { author: true }, where: eq(questions.uid, uid) });
  if (!q) { res.status(404).json({ error: "question not found" }); return; }
  if (q.author !== username) { res.status(403).json({ error: "unauthorized" }); return; }
  await db.update(questions).set({ acceptedAnswerUid: ruid }).where(eq(questions.uid, uid));
  res.json({ message: "reply accepted" });
});

// DELETE /questions/:uid/replies/:ruid/accept
router.delete("/:ruid/accept", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const { uid, ruid } = req.params as { uid: string, ruid: string };
  const q = await db.query.questions.findFirst({ columns: { author: true }, where: eq(questions.uid, uid) });
  if (!q) { res.status(404).json({ error: "question not found" }); return; }
  if (q.author !== username) { res.status(403).json({ error: "unauthorized" }); return; }
  await db.update(questions).set({ acceptedAnswerUid: null })
    .where(and(eq(questions.uid, uid), eq(questions.acceptedAnswerUid, ruid)));
  res.json({ message: "reply unaccepted" });
});

export default router;
