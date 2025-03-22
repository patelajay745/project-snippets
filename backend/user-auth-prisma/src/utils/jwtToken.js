import jwt from "jsonwebtoken";
import { ApiError } from "./apiError.js";

export const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const accessToken = await jwt.sign(
      {
        id: userId,
      },
      process.env.ACCESSTOKEN,
      {
        expiresIn: process.env.ACCESSTOKEN_EXPIRE,
      }
    );

    const refreshToken = await jwt.sign(
      {
        id: userId,
      },
      process.env.REFRESHTOKEN,
      {
        expiresIn: process.env.REFRESHTOKEN_EXPIRE,
      }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating tokens ",
      error
    );
  }
};
