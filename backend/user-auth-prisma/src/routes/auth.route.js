import { Router } from "express";
import {
  forgetPassword,
  getLogin,
  getUser,
  logout,
  refreshAccessToken,
  registerUser,
  resetPassword,
  updateProfile,
  verifyEmail,
  verifyPasswordResetToken,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  forgetPasswordSchema,
  loginSchema,
  newuserSchema,
  resetpasswordSchema,
  tokenSchema,
} from "../utils/validationSchema.js";
import { isAuth } from "../middlewares/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/", validate(newuserSchema), registerUser);
authRouter.get("/", isAuth, getUser);
authRouter.post("/verify", validate(tokenSchema), verifyEmail);
authRouter.post("/login", validate(loginSchema), getLogin);
authRouter.post("/logout", isAuth, logout);
authRouter.post("/refresh-token", refreshAccessToken);
authRouter.patch("/update-profile", isAuth, updateProfile);
authRouter.post(
  "/forget-password",
  isAuth,
  validate(forgetPasswordSchema),
  forgetPassword
);
authRouter.post(
  "/verify-password-reset-token",
  validate(tokenSchema),
  verifyPasswordResetToken
);

authRouter.post(
  "/reset-password",
  validate(resetpasswordSchema),
  resetPassword
);
