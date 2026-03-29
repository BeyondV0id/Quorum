import { Router } from "express";
import type { Request, Response } from "express";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { answers, questions, answerUpvotes, notifications } from "../db/schema.js";

const router = Router({ mergeParams: true });

const authorWith = {
  columns: { username: true, bio: true, avatar: true, links: true, posted: true, answered: true },
} as const;

function replyExtras(username: string, questionUid: string) {
  return {
    isUpvoted: sql<boolean>`EXISTS(
      SELECT 1 FROM answer_upvotes au WHERE au.username = ${username} AND au.answer_uid = answers.uid
    )`.as("is_upvoted"),
    isAccepted: sql<boolean>`EXISTS(
      SELECT 1 FROM questions WHERE uid = ${questionUid}::uuid AND accepted_answer_uid = answers.uid
    )`.as("is_accepted"),
  };
}

function mapReply(r: any) {
  return {
    answer: {
      uid: r.uid, content: r.content, timeCreated: r.timeCreated, questionUid: r.questionUid,
      upvotes: r.upvotesCount ?? 0, isUpvoted: r.isUpvoted, authorUsername: r.author, isAccepted: r.isAccepted,
    },
    author: {
      username: r.authorUser?.username ?? r.author,
      bio: r.authorUser?.bio, avatar: r.authorUser?.avatar,
      link: r.authorUser?.links ?? "", posted: r.authorUser?.posted ?? 0, answered: r.authorUser?.answered ?? 0,
    },
  };
}

// GET /questions/:uid/replies
router.get("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const { uid } = req.params;
  const rows = await db.query.answers.findMany({
    with: { authorUser: authorWith },
    extras: replyExtras(username!, uid),
    where: eq(answers.questionUid, uid),
    orderBy: [answers.timeCreated],
  });
  res.json(rows.map(mapReply));
});

// POST /questions/:uid/replies
router.post("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const { uid } = req.params;
  const { content } = req.body as { content: string };
  try {
    const [answer] = await db.insert(answers).values({ content, questionUid: uid, author: username! }).returning();
    const q = await db.query.questions.findFirst({ columns: { author: true }, where: eq(questions.uid, uid) });
    const qAuthor = q?.author;
    if (qAuthor && qAuthor !== username) {
      await db.insert(notifications).values({
        userUsername: qAuthor,
        actorUsername: username!,
        type: "reply_question",
        referenceUid: answer.uid,
      }).onConflictDoNothing();
    }
    res.status(201).json({ uid: answer.uid, content: answer.content, timeCreated: answer.timeCreated, questionUid: answer.questionUid, upvotes: 0, isUpvoted: false, authorUsername: answer.author, isAccepted: false });
  } catch { res.status(400).json({ error: "invalid question uid" }); }
});

// PATCH /questions/:uid/replies/:ruid
router.patch("/:ruid", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const { content } = req.body as { content: string };
  try {
    await db.update(answers).set({ content })
      .where(and(eq(answers.uid, req.params.ruid), eq(answers.author, username!)));
    res.json({ message: "reply updated" });
  } catch { res.status(500).json({ error: "failed to update reply" }); }
});

// DELETE /questions/:uid/replies/:ruid
router.delete("/:ruid", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const { uid, ruid } = req.params;
  await db.delete(answers).where(and(eq(answers.uid, ruid), eq(answers.questionUid, uid), eq(answers.author, username!)));
  res.json({ message: "reply deleted" });
});

// POST /questions/:uid/replies/:ruid/votes — toggle
router.post("/:ruid/votes", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const { ruid } = req.params;
  const existing = await db.query.answerUpvotes.findFirst({
    where: and(eq(answerUpvotes.username, username!), eq(answerUpvotes.answerUid, ruid)),
  });
  if (existing) {
    await db.delete(answerUpvotes).where(and(eq(answerUpvotes.username, username!), eq(answerUpvotes.answerUid, ruid)));
    await db.update(answers).set({ upvotesCount: sql`${answers.upvotesCount} - 1` }).where(eq(answers.uid, ruid));
  } else {
    await db.insert(answerUpvotes).values({ username: username!, answerUid: ruid });
    await db.update(answers).set({ upvotesCount: sql`${answers.upvotesCount} + 1` }).where(eq(answers.uid, ruid));
    const a = await db.query.answers.findFirst({ columns: { author: true }, where: eq(answers.uid, ruid) });
    const author = a?.author;
      if (author && author !== username) {
        await db.insert(notifications).values({
          userUsername: author,
          actorUsername: username!,
          type: "upvote_reply",
          referenceUid: ruid,
        }).onConflictDoNothing();
      }
  }
  res.json({ message: "vote updated" });
});

// POST /questions/:uid/replies/:ruid/accept
router.post("/:ruid/accept", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const { uid, ruid } = req.params;
  const q = await db.query.questions.findFirst({ columns: { author: true }, where: eq(questions.uid, uid) });
  if (!q) { res.status(404).json({ error: "question not found" }); return; }
  if (q.author !== username) { res.status(403).json({ error: "unauthorized" }); return; }
  await db.update(questions).set({ acceptedAnswerUid: ruid }).where(eq(questions.uid, uid));
  res.json({ message: "reply accepted" });
});

// DELETE /questions/:uid/replies/:ruid/accept
router.delete("/:ruid/accept", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const { uid, ruid } = req.params;
  const q = await db.query.questions.findFirst({ columns: { author: true }, where: eq(questions.uid, uid) });
  if (!q) { res.status(404).json({ error: "question not found" }); return; }
  if (q.author !== username) { res.status(403).json({ error: "unauthorized" }); return; }
  await db.update(questions).set({ acceptedAnswerUid: null })
    .where(and(eq(questions.uid, uid), eq(questions.acceptedAnswerUid, ruid)));
  res.json({ message: "reply unaccepted" });
});

export default router;
