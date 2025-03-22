npx prisma init --datasource-provider postgresql

write database schema

set url into .env

npx prisma migrate dev
npx prisma migrate deploy

npm install @prisma/client

<!-- Every time you update schema -->

npx prisma migrate dev
npx prisma migrate deploy
npx prisma generate
