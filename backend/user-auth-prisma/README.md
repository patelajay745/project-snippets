# Complete User-Auth Using Nodejs & Prisma(Postgres)

This appliction is built using NodeJs and postgres(as db)

## Techstack

- Nodejs
- Postgres
- Redis
- Docker

## Key features

- Authentication System: Secure user login with access tokens and refresh tokens (using jsonwebtoken), supporting both cookie-based and header-based authentication.

- Multi-device login support with refresh tokens stored in an table, enabling seamless session management across devices.

- Password hashing with bcrypt for enhanced security.

- User Profile: Avatar upload and storage (via AWS S3 bucket), allowing users to personalize their profiles with images.

- Email Functionality: Email verification and password reset flows using Nodemailer, with simple HTML pages for user interaction.

- API Design: Standardized API responses and error handling throughout the project for consistency and reliability.

- API documentation generated with Swagger Autogen and served via Swagger UI Express for easy exploration and testing.

- Cookie parsing with cookie-parser for managing authentication tokens in cookies.

- Rate Limiting using `express-rate-limit` for purticle IP.

- Used Radis to store ratelimit data



### How To run project.

1. Clone the Project `git clone https://github.com/patelajay745/project-snippets.git`

2. Go to backend/user-auth-prisma

3. ```javascript
    npm i
   ```

4. Create .env with following values.

    ```
    PORT
    DATABASE_URL

    MAILTRAP_USERNAME
    MAILTRAP_PASSWORD

    BASEURL

    ACCESSTOKEN
    ACCESSTOKEN_EXPIRE
    REFRESHTOKEN
    REFRESHTOKEN_EXPIRE

    REDIS_URL

    AWS_ACCESSTOKEN
    AWS_SECRETKEY
    AWS_BUCKETNAME
    AWS_BUCKETREGION
    ```

5. Run
    ```
    npx prisma migrate dev
    npx prisma migrate deploy
    npm install @prisma/client
    npx prisma generate
    ```

6. Start the server
    ```
    npm start
    ```    


