FROM node:22-alpine AS builder
WORKDIR /app

# Add build argument
ARG MONGODB_URI
ENV MONGODB_URI=${MONGODB_URI}

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

FROM node:22-alpine
WORKDIR /app

# Install curl and setup docker access with ping group GID
RUN apk add --no-cache curl \
    && adduser node ping \
    && chown -R node:ping /app

# Copy runtime environment variable
ENV MONGODB_URI=${MONGODB_URI}

COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/.env ./.env
COPY package.json .

EXPOSE 3000
ENV NODE_ENV=production

USER node
CMD [ "node", "build" ]