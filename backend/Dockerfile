FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --chown=node:node db ./db
COPY --chown=node:node src ./src

USER node

EXPOSE 4000

CMD ["sh", "-c", "npm run db:migrate && node db/seed-if-empty.js && npm start"]
