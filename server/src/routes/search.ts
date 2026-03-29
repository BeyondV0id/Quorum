import { Router } from "express";
import type { Request, Response } from "express";
import { ilike, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { chambers, questions, answers, user } from "../db/schema.js";

const router = Router();

// GET /search?q=
router.get("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const q = (req.query.q as string) ?? "";

  if (!q) {
    res.json({ chambers: [], questions: [], replies: [], users: [] });
    return;
  }

  const [chamberRows, questionRows, replyRows, userRows] = await Promise.all([
    db.query.chambers.findMany({
      extras: {
        memberCount: sql<number>`(SELECT COUNT(*) FROM chamber_members WHERE chamber_uid = chambers.uid)`.as("member_count"),
        isJoined: sql<boolean>`EXISTS(SELECT 1 FROM chamber_members WHERE chamber_uid = chambers.uid AND username = ${username})`.as("is_joined"),
      },
      where: ilike(chambers.name, `%${q}%`),
      limit: 5,
    }),
    db.query.questions.findMany({
      with: { chamber: { columns: { uid: true, name: true } } },
      extras: {
        isUpvoted: sql<boolean>`EXISTS(SELECT 1 FROM question_upvotes WHERE username = ${username} AND question_uid = questions.uid)`.as("is_upvoted"),
      },
      where: ilike(questions.content!, `%${q}%`),
      limit: 5,
    }),
    db.query.answers.findMany({
      extras: {
        isUpvoted: sql<boolean>`EXISTS(SELECT 1 FROM answer_upvotes WHERE username = ${username} AND answer_uid = answers.uid)`.as("is_upvoted"),
      },
      where: ilike(answers.content, `%${q}%`),
      limit: 5,
    }),
    db.query.user.findMany({
      columns: { username: true, bio: true, avatar: true, links: true, posted: true, answered: true },
      where: ilike(user.username!, `%${q}%`),
      limit: 5,
    }),
  ]);

  res.json({
    chambers: chamberRows.map((r) => ({
      uid: r.uid, name: r.name, description: r.description, creatorUsername: r.creatorUsername,
      memberCount: r.memberCount, isJoined: r.isJoined, colorIndex: r.colorIndex ?? 0, timeCreated: r.createdAt,
    })),
    questions: questionRows.map((r) => ({
      question: { uid: r.uid, content: r.content, timeCreated: r.timeCreated, upvotes: r.upvotesCount ?? 0, isUpvoted: r.isUpvoted, authorUsername: r.author, chamberUid: r.chamber?.uid, chamberName: r.chamber?.name, acceptedAnswerUid: r.acceptedAnswerUid ?? "", isPinned: !!r.pinnedAt },
      author: { username: r.author },
    })),
    replies: replyRows.map((r) => ({
      answer: { uid: r.uid, content: r.content, timeCreated: r.timeCreated, questionUid: r.questionUid, upvotes: r.upvotesCount ?? 0, isUpvoted: r.isUpvoted, authorUsername: r.author, isAccepted: false },
      author: { username: r.author },
    })),
    users: userRows.map((r) => ({ username: r.username, bio: r.bio, avatar: r.avatar, link: r.links, posted: r.posted, answered: r.answered })),
  });
});

export default router;
