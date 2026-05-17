import "dotenv/config";
import express from "express";
import cors from "cors";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import usersRouter from "./routes/users.js";
import questionsRouter from "./routes/questions.js";
import repliesRouter from "./routes/replies.js";
import spacesRouter from "./routes/spaces.js";
import searchRouter from "./routes/search.js";

const app = express();
const PORT = process.env.PORT ?? 3001;
const clientURL = (process.env.CLIENT_URL ?? "https://quorum-io.vercel.app").replace(/\/$/, "");
const authBaseURL = (process.env.BETTER_AUTH_URL ?? "https://echo-server-iji0.onrender.com").replace(/\/$/, "");

// CORS must run before Better Auth routes so cookies work cross-origin.
app.use(
  cors({
    origin: clientURL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Better Auth handles all /api/auth/* routes before express.json().
app.all("/api/auth/*", toNodeHandler(auth));

// JSON parsing for all other routes
app.use(express.json());

// Health check
app.get("/ping", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", origin: req.headers.origin });
});

app.get("/api/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.json(session);
});

// App routes (matching Go server)
app.use("/users", usersRouter);
app.use("/questions", questionsRouter);
app.use("/questions/:uid/replies", repliesRouter);
app.use("/spaces", spacesRouter);
app.use("/search", searchRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Auth endpoint: ${authBaseURL}/api/auth`);
});
