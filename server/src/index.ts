import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import usersRouter from "./routes/users.js";
import questionsRouter from "./routes/questions.js";
import repliesRouter from "./routes/replies.js";
import spacesRouter from "./routes/spaces.js";
import searchRouter from "./routes/search.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

// CORS
app.use(
  cors({
    origin: (process.env.CLIENT_URL ?? "http://localhost:5173").replace(/\/$/, ""),
    credentials: true,
  })
);

// Better Auth handles all /api/auth/* routes (email+password, Google OAuth, sessions, etc.)
app.all("/api/auth/*splat", toNodeHandler(auth));

// JSON parsing for all other routes
app.use(express.json());

// Health check
app.get("/ping", (_req, res) => {
  res.json({ status: "ok" });
});

// App routes (matching Go server)
app.use("/users", usersRouter);
app.use("/questions", questionsRouter);
app.use("/questions/:uid/replies", repliesRouter);
app.use("/spaces", spacesRouter);
app.use("/search", searchRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
