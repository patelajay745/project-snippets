import { prisma } from "../client/index.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import bcrypt from "bcryptjs";
import { MailTrap } from "../utils/mail.js";
import crypto from "crypto";
import { logger } from "../winston/winston.logger.js";
import jwt from "jsonwebtoken";
import { generateAccessTokenAndRefreshToken } from "../utils/jwtToken.js";
import geoip from "geoip-lite";
import { BASEURL } from "../config/index.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, lName, password, email } = req.body;

  const foundedUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (foundedUser) throw new ApiError(422, "Email is already registered");

  const encryptedPass = await bcrypt.hash(password, 10);
  const token = await crypto.randomBytes(18).toString("hex");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      lName,
      password: encryptedPass,
    },
  });

  await prisma.verrifyEmailToken.create({
    data: {
      token,
      userId: user.id,
    },
  });

  if (!user)
    throw new ApiError(500, "Something went wrong while creating user");

  const link = `${process.env.BASEURL}/verify.html?id=${user.id}&token=${token}`;
  const mail = new MailTrap(email);
  mail.sendMail(
    `Your Account has been created.Please <a href="${link}">click here</a> to verify email `
  );

  return res.status(201).json(new ApiResponse(200, "user is created"));
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { id, token } = req.body;

  const user = await prisma.verrifyEmailToken.findUnique({
    where: {
      userId: Number(id),
    },
  });

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  const isverified = user.token === token;

  if (!isverified) {
    throw new ApiError(403, "Invalid token");
  }

  const updateUser = await prisma.user.update({
    where: {
      id: Number(id),
    },
    data: {
      isverified,
    },
  });

  await prisma.verrifyEmailToken.delete({
    where: {
      userId: Number(id),
      token,
    },
  });

  const mail = new MailTrap(updateUser.email);
  mail.sendMail("Your email is verified now. You can login now");

  return res.status(200).json(new ApiResponse(200, "You are now verified."));
});

export const getLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) throw new ApiError(404, "user not found");

  if (!user.isverified) throw new ApiError(404, "user is not verified");

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) throw new ApiError(403, "credentials are wrong");

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user.id);

  if (!accessToken || !refreshToken)
    throw new ApiError(500, "Something went wrong while generating tokens ");

  const browser = req.headers["user-agent"];
  const ip = req.ip;

  await prisma.session.create({
    data: {
      accessToken,
      refreshToken,
      userId: user.id,
      browser,
      ip,
    },
  });

  let options = {
    httpOnly: true, // The cookie only accessible by the web server
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User logged in successfuly", {
        profile: {
          name: user.name,
          email: user.email,
          lName: user.lName,
          isverified: user.isverified,
          avatar: user.avatar,
        },
      })
    );
});

export const getUser = asyncHandler(async (req, res) => {
  const { id } = req.user_id;

  const user = await prisma.user.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!user) throw new ApiError(404, "user not found");

  return res.status(200).json(
    new ApiResponse(200, "User is fetched", {
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        lName: user.lName,
        isverified: user.isverified,
        avatar: user.avatar,
      },
    })
  );
});

export const logout = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, "user logged out"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) throw new ApiError(403, "unAuthorized request");

  const user_id = await jwt.verify(refreshToken, process.env.REFRESHTOKEN);

  console.log(user_id.id);

  if (!user_id) throw new ApiError(403, "unAuthorized request");

  const { accessToken } = await generateAccessTokenAndRefreshToken(user_id);

  const browser = req.headers["user-agent"];
  const ip = req.ip;

  await prisma.session.update({
    where: {
      refreshToken,
    },
    data: {
      accessToken,
    },
  });

  let options = {
    httpOnly: true, // The cookie only accessible by the web server
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken)
    .json(new ApiResponse(200, "You are now logged in"));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, lName } = req.body;

  if (!name && !lName)
    throw new ApiError(422, "Please provide field to update");

  console.log(req.user_id);

  const user = await prisma.user.findUnique({
    where: {
      id: Number(req.user_id.id),
    },
  });

  if (name) user.name = name;
  if (lName) user.lName = lName;

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, "Profile is updated", {
      profile: {
        id: req.user_id.id,
        email: user.email,
        name: user.name,
        lName: user.lName,
        isverified: user.isverified,
        avatar: user.avatar,
      },
    })
  );
});

export const forgetPassword = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: Number(req.user_id.id),
    },
  });

  if (!user) throw new ApiError(404, "User not found");

  const token = await crypto.randomBytes(48).toString("hex");

  await prisma.resetPasswordToken.upsert({
    where: {
      userId: Number(req.user_id.id),
    },
    update: { resetPasswordToken: token },
    create: {
      userId: Number(req.user_id.id),
      resetPasswordToken: token,
    },
  });

  const link = `${BASEURL}/reset-password.html?id=${req.user_id.id}&token=${token}`;

  const message = `Please <a href="${link}">click here</a> to reset your password`;

  const mail = new MailTrap(user.email);
  mail.sendMail(message);

  return res
    .status(200)
    .json(new ApiResponse(200, "Reset link has been sent to your inbox."));
});

export const verifyPasswordResetToken = asyncHandler(async (req, res) => {
  const { id, token } = req.body;

  const dbToken = await prisma.resetPasswordToken.findUnique({
    where: {
      resetPasswordToken: token,
      userId: Number(id),
    },
  });

  if (!dbToken) throw new ApiError(403, "Invalid Token");

  return res.status(200).json(
    new ApiResponse(200, "valid", {
      valid: true,
    })
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { id, password, token } = req.body;

  const dbToken = await prisma.resetPasswordToken.findUnique({
    where: {
      userId: Number(id),
      resetPasswordToken: token,
    },
  });

  if (!dbToken) throw new ApiError(403, "Invalid Token");

  const user = await prisma.user.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!user) throw new ApiError(404, "user not found");

  const hashPassword = await bcrypt.hash(password, 10);

  if (!hashPassword)
    throw new ApiError(500, "Something went wrong while saving password");

  await prisma.user.update({
    where: {
      id: Number(id),
    },
    data: {
      password: hashPassword,
    },
  });

  await prisma.resetPasswordToken.delete({
    where: {
      userId: Number(id),
      resetPasswordToken: token,
    },
  });

  await prisma.session.deleteMany({
    where: {
      userId: Number(id),
    },
  });

  const mail = new MailTrap(user.email);
  mail.sendMail("Your password has been reseted. You can use new Paasword.");

  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("resetToken")
    .json(
      new ApiResponse(
        200,
        "Your password has been reseted & your logged out from all devices. You can use new Paasword."
      )
    );
});
