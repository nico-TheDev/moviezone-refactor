FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV CLIENT_DIR=build/client
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --legacy-peer-deps && npm install tsx --no-save
COPY --from=build /app/build ./build
COPY --from=build /app/server ./server
EXPOSE 3001
CMD ["npx", "tsx", "server/index.ts"]
