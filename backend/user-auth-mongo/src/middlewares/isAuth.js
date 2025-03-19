import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const isAuth = asyncHandler(async (req, _res, next) => {
  let accessToken = req.cookies.accessToken;

  if (!accessToken) {
    accessToken = req.headers.authorization?.split("Bearer ")[1];
  }

  if (!accessToken)
    throw new ApiError(403, "Please provide AccessToken to get profile");

  const decoded = await jwt.verify(accessToken, process.env.ACCESSTOKEN_SECRET);

  if (!decoded) throw new ApiError(401, "Invalid Token");

  const user = {
    id: decoded.id,
    email: decoded.id,
  };

  req.user = user;

  next();
});
