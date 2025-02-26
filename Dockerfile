FROM node:22-alpine AS builder
WORKDIR /app

# Set a dummy MONGODB_URI for build time
ENV MONGODB_URI="mongodb://dummy-build-value:27017/uptime"

COPY package*.json ./
RUN npm ci
COPY . .

# Skip MongoDB connection during build
ENV NODE_ENV=production
RUN npm run build
RUN npm prune --production

FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache curl \
    && adduser node ping \
    && chown -R node:ping /app

COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .

EXPOSE 3000
ENV NODE_ENV=production

USER node
CMD [ "node", "build" ]