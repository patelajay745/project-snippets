import { Router } from "express";
import {
  addUser,
  forgetPassword,
  getAccessToken,
  getLogin,
  getLogout,
  getProfile,
  getS3Url,
  resetPassword,
  updateAvatar,
  updateProfile,
  uploadToS3,
  verifyEmailLink,
  verifyPasswordResetToken,
} from "../controllers/auth.controller.js";
import { isAuth } from "../middlewares/isAuth.js";
import { fileParser } from "../utils/fileParser.js";

export const authRouter = Router();

authRouter.post("/", addUser);
authRouter.post("/login", getLogin);
authRouter.post("/logout", isAuth, getLogout);
authRouter.get("/", isAuth, getProfile);
authRouter.post("/verify", verifyEmailLink);
authRouter.patch("/update-avatar", isAuth, fileParser, updateAvatar);
authRouter.patch("/update-profile", isAuth, updateProfile);
authRouter.post("/forget-pass", forgetPassword); //to generate forget-password link
authRouter.post("/verify-password-reset-token", verifyPasswordResetToken);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/refresh-token", getAccessToken);

authRouter.get("/test", fileParser, uploadToS3);
