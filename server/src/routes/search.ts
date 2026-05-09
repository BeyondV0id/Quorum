import { Router } from "express";
import type { Request, Response } from "express";
import { and, ilike, inArray, eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { spaces, spaceMembers, questions, questionUpvotes, answers, answerUpvotes, user } from "../db/schema.js";

const router = Router();

// GET /search?q=
router.get("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { username } = (req as AuthRequest).user;
  const q = (req.query.q as string) ?? "";

  if (!q) {
    res.json({ spaces: [], questions: [], replies: [], users: [] });
    return;
  }

  const [spaceRows, questionRows, replyRows, userRows] = await Promise.all([
    db.query.spaces.findMany({
      where: ilike(spaces.name, `%${q}%`),
      limit: 5,
    }),
    db.query.questions.findMany({
      with: { space: { columns: { uid: true, name: true } } },
      where: ilike(questions.content!, `%${q}%`),
      limit: 5,
    }),
    db.query.answers.findMany({
      where: ilike(answers.content, `%${q}%`),
      limit: 5,
    }),
    db.query.user.findMany({
      columns: { username: true, bio: true, avatar: true, links: true, posted: true, answered: true },
      where: ilike(user.username!, `%${q}%`),
      limit: 5,
    }),
  ]);

  const [spaceMembersRows, questionUpvoteRows, replyUpvoteRows] = await Promise.all([
    spaceRows.length
      ? db.query.spaceMembers.findMany({
          columns: { spaceUid: true, username: true },
          where: inArray(spaceMembers.spaceUid, spaceRows.map((s) => s.uid)),
        })
      : Promise.resolve([]),
    questionRows.length
      ? db.query.questionUpvotes.findMany({
          columns: { questionUid: true },
          where: and(
            eq(questionUpvotes.username, username!),
            inArray(questionUpvotes.questionUid, questionRows.map((qRow) => qRow.uid)),
          ),
        })
      : Promise.resolve([]),
    replyRows.length
      ? db.query.answerUpvotes.findMany({
          columns: { answerUid: true },
          where: and(
            eq(answerUpvotes.username, username!),
            inArray(answerUpvotes.answerUid, replyRows.map((rRow) => rRow.uid)),
          ),
        })
      : Promise.resolve([]),
  ]);

  const memberCountMap = new Map<string, number>();
  const joinedSet = new Set<string>();
  for (const m of spaceMembersRows) {
    memberCountMap.set(m.spaceUid, (memberCountMap.get(m.spaceUid) ?? 0) + 1);
    if (m.username === username) joinedSet.add(m.spaceUid);
  }
  const questionUpvotedSet = new Set(questionUpvoteRows.map((u) => u.questionUid));
  const replyUpvotedSet = new Set(replyUpvoteRows.map((u) => u.answerUid));

  res.json({
    spaces: spaceRows.map((r) => ({
      uid: r.uid, name: r.name, description: r.description, creatorUsername: r.creatorUsername,
      memberCount: memberCountMap.get(r.uid) ?? 0, isJoined: joinedSet.has(r.uid), colorIndex: r.colorIndex ?? 0, timeCreated: r.createdAt,
    })),
    questions: questionRows.map((r) => ({
      question: { uid: r.uid, content: r.content, timeCreated: r.timeCreated, upvotes: r.upvotesCount ?? 0, isUpvoted: questionUpvotedSet.has(r.uid), authorUsername: r.author, spaceUid: r.space?.uid, spaceName: r.space?.name, acceptedAnswerUid: r.acceptedAnswerUid ?? "", isPinned: !!r.pinnedAt },
      author: { username: r.author },
    })),
    replies: replyRows.map((r) => ({
      answer: { uid: r.uid, content: r.content, timeCreated: r.timeCreated, questionUid: r.questionUid, upvotes: r.upvotesCount ?? 0, isUpvoted: replyUpvotedSet.has(r.uid), authorUsername: r.author, isAccepted: false },
      author: { username: r.author },
    })),
    users: userRows.map((r) => ({ username: r.username, bio: r.bio, avatar: r.avatar, link: r.links, posted: r.posted, answered: r.answered })),
  });
});

export default router;
