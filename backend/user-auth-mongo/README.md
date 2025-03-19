# Complete User Auth backend

## Techstack

- Mongodb
- Nodejs

### Key features

- Authentication System: Secure user login with access tokens and refresh tokens (using jsonwebtoken), supporting both cookie-based and header-based authentication. 

- Multi-device login support with refresh tokens stored in an array, enabling seamless session management across devices. 

- Password hashing with bcrypt for enhanced security. 

- User Profile: Avatar upload and storage (via cloudinary), allowing users to personalize their profiles with images. 

- Email Functionality: Email verification and password reset flows using Nodemailer, with simple HTML pages for user interaction. 

- API Design: Standardized API responses and error handling throughout the project for consistency and reliability. 

- API documentation generated with Swagger Autogen and served via Swagger UI Express for easy exploration and testing. 

- File Handling: Support for file uploads (e.g., avatars) using Formidable. 

- Cookie parsing with cookie-parser for managing authentication tokens in cookies.

