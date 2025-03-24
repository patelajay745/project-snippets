# Stage 1: Build
FROM node:23-alpine3.20 AS build
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm i
COPY prisma ./prisma/
COPY . .
RUN npx prisma generate

# Stage 2: Production
FROM node:23-alpine3.20
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/ ./

EXPOSE 8080
CMD ["node", "src/index.js"]