import { ACCESSTOKEN, REFRESHTOKEN } from "../config/index.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { generateAccessTokenAndRefreshToken } from "../utils/jwtToken.js";
import { prisma } from "../client/index.js";

export const isAuth = asyncHandler(async (req, res, next) => {
  let { accessToken, refreshToken: userRefreshToken } = req.cookies;

  if (!accessToken) {
    accessToken = req.headers.authorization?.split("Bearer ")[1];

    userRefreshToken = req.headers["x-refreshtoken"];
  }

  // const decoded = await jwt.verify(accessToken, process.env.ACCESSTOKEN);

  let payload;
  await jwt.verify(accessToken, ACCESSTOKEN, async (err, decoded) => {
    if (err && err.name === "TokenExpiredError") {
      payload = jwt.decode(userRefreshToken, REFRESHTOKEN);

      if (!payload)
        throw new ApiError(403, "Token is expired,Please login again");

      const { accessToken, refreshToken } = generateAccessTokenAndRefreshToken(
        payload.id
      );

      await prisma.session.update({
        where: { refreshToken: userRefreshToken },
        data: {
          accessToken,
          refreshToken,
        },
      });

      req.accessToken = accessToken;
      req.refreshToken = refreshToken;

      req.user_id = payload.id;

      return;
    }

    if (decoded) {
      req.user_id = decoded.id;
      req.accessToken = accessToken;
      req.refreshToken = userRefreshToken;
    }
  });

  next();
});
