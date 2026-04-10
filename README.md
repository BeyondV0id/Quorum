# Echo

Echo is a discussion platform where users can join spaces, ask questions, and reply to each other. It resembles Quora or Reddit but features a clean, responsive interface powered by React and a robust Node.js/Express backend.

## Architecture

- **Frontend:** React, Vite, Tailwind CSS, Shadcn UI, Framer Motion
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL, Drizzle ORM
- **Authentication:** Better Auth (GitHub OAuth)

## Project Structure

```
├── client/          # Frontend application
│   ├── src/
│   │   ├── api/     # API utilities
│   │   ├── hooks/   # Custom React hooks (useAuth, etc.)
│   │   ├── pages/   # Page components
│   │   └── lib/     # Utilities and Better Auth client
├── server/          # Backend application
│   ├── src/
│   │   ├── db/      # Drizzle schema and connection
│   │   ├── middleware/ # Express middlewares (requireAuth)
│   │   └── routes/  # API routes (users, spaces, questions, replies)
```

## Setup

1. Copy `.env.example` in both `client/` and `server/` to `.env` and fill the variables.
2. In the DB, you need a running PostgreSQL server.
3. Install dependencies and start:

```bash
# In one terminal context
cd server
npm install
npm run db:push
npm run dev

# In another terminal context
cd client
npm install
npm run dev
```

## Features

- Dynamic nested routing for spaces, questions, and replies.
- Upvote system and accepted answers to surface quality content.
- Profile and user statistics tracked seamlessly with transactions.
- Fully type-safe frontend/backend requests using Better Auth `inferAdditionalFields`.
