FROM node:22-slim AS base

WORKDIR /app
COPY package.json ./
RUN npm install

FROM node:22-slim AS runner
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Command to run the application
CMD ["npm", "start"]
