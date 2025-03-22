import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";

export const isAuth = asyncHandler(async (req, res, next) => {
  let { accessToken } = req.cookies;

  if (!accessToken) {
    accessToken = req.headers.authorization?.split("Bearer ")[1];
  }

  if (!accessToken) {
    throw new ApiError(403, "unAuthorized Token");
  }

  const decoded = await jwt.verify(accessToken, process.env.ACCESSTOKEN);

  if (!decoded) throw new ApiError(401, "Invalid Token");

  req.user_id = decoded.id;

  next();
});
