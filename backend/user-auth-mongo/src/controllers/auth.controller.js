import { isValidObjectId, set } from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MyMail } from "../utils/sendMail.js";
import crypto from "crypto";
import { VerifyEmailToken } from "../models/verifyEmailToken.model.js";
import { uploader } from "../utils/uploader.js";
import { ForgotPasswordToken } from "../models/forgotPasswordToken.model.js";
import { generatePresignedUrl } from "../utils/S3.js";
import { logger } from "../logger/winston.logger.js";
import { s3BucketName, s3BucketRegion } from "../config/index.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { readFile } from "fs/promises";
import { myS3Client } from "../config/awsBucket.js";

export const addUser = asyncHandler(async (req, res) => {
  const { name, email, password, lastName } = req.body;

  [name, email, password, lastName].forEach((item, index) => {
    if (!item) throw new ApiError(422, `Please provide required fields`);
  });

  const user = await User.findOne({ email });

  if (user) {
    throw new ApiError(422, `user is already registered with same emailId`);
  }

  const createduser = await User.create({
    name,
    email,
    password,
    lastName,
  });

  const token = crypto.randomBytes(32).toString("hex");
  const link = `${process.env.BASEURL}/verify.html?id=${createduser._id}&token=${token}`;

  await VerifyEmailToken.create({ owner: createduser._id, token });

  const mail = new MyMail(email);
  mail.sendEmail(
    `Your Account has been created.Please <a href=${link}>click here</a> to verify email`
  );

  return res.status(201).json(
    new ApiResponse("Please Check your Inbox to verify email.", {
      profile: { id: createduser._id, name, email, lastName },
    })
  );
});

export const getLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  [email, password].forEach((item) => {
    if (!item) throw new ApiError(422, "Please provide email and password");
  });

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const isMatched = await user.comparePassword(password);

  if (!isMatched) throw new ApiError(403, "Password is wrong");

  if (!user.isVerified)
    throw new ApiError(
      403,
      "Your Email is not verified. Please check your email to verify"
    );

  const accessToken = await user.getAccessToken();
  const refreshToken = await user.getRefreshToken();

  if (!accessToken || !refreshToken)
    throw new ApiError(500, "Something went wrong while generating tokens");

  if (user.refreshToken) {
    user.refreshToken = [...user.refreshToken, refreshToken];
  } else {
    user.refreshToken = [refreshToken];
  }

  await user.save();

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse("User logged in successfully", {
        profile: {
          id: user._id,
          email: user.email,
          name: user.name,
          lastName: user.lastName,
          isVerified: user.isVerified,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      })
    );
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) throw new ApiError(401, "user not found");

  res.status(200).json(
    new ApiResponse("user profile fetched", {
      profile: {
        id: user._id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified,
      },
    })
  );
});

export const getLogout = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  if (!userId || !isValidObjectId(userId))
    throw new ApiError(403, "unAuthorized request");

  const user = await User.findOneAndUpdate(
    { _id: userId },
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  );

  if (!user) throw new ApiError(403, "user not found");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse("User logged out successfully"));
});

export const verifyEmailLink = asyncHandler(async (req, res) => {
  const { id, token } = req.body;

  const dbToken = await VerifyEmailToken.findOneAndDelete({ owner: id, token });

  if (!dbToken) throw new ApiError(422, "Invalid Token");

  const user = await User.findOne({ _id: id });
  if (!user) throw new ApiError(404, "user not found");

  if (user.isVerified) throw new ApiError(404, "user already verified");

  user.isVerified = true;
  await user.save();

  const mail = new MyMail(user.email);
  mail.sendEmail("Your email is now verified. Now you can login in.");

  return res
    .status(200)
    .json(new ApiResponse("Email is verified successfully."));
});

export const updateAvatar = asyncHandler(async (req, res) => {
  const { avatar } = req.files;

  if (Array.isArray(avatar))
    throw new ApiError(422, "Multiple Images are not allowed");

  if (!avatar.mimetype.startsWith("image"))
    throw new ApiError(422, "Only image is allowed in avatar");

  const user = await User.findById(req.user.id);

  if (!user) throw new ApiError(404, "user not found");

  //   delete old avatar, if any, from cloud
  if (user.avatar?.id) {
    await uploader.destroy(user.avatar.id);
  }

  //upload file to cloudinary
  const { public_id: id, secure_url: url } = await uploader.upload(
    avatar.filepath,
    {
      width: 300,
      height: 300,
      crop: "thumb",
      gravity: "face",
    }
  );

  if (!id || !url)
    throw new ApiError(500, "Something went wrong, while uploading avatar ");

  user.avatar = { id, url };
  await user.save();

  return res.status(200).json(
    new ApiResponse("Avatar has been updated.", {
      profile: {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        image: user.avatar,
      },
    })
  );
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, lastName } = req.body;

  if (!name && !lastName)
    throw new ApiError(
      422,
      "Please provide either name or last name to update"
    );

  const user = await User.findById(req.user.id);

  if (!user) throw new ApiError(404, "user not found");

  if (name) user.name = name;
  if (lastName) user.lastName = lastName;

  await user.save();

  let message = "";
  if (name && lastName) {
    message = `Your name and last name are updated`;
  } else if (name) {
    message = `Your name is updated`;
  } else if (lastName) {
    message = `Your last name is updated`;
  }

  return res.status(200).json(
    new ApiResponse(message, {
      profile: {
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
      },
    })
  );
});

export const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) throw new ApiError(422, "Please provide emailId");
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "user not found");

  const token = crypto.randomBytes(48).toString("hex");

  const link = `${process.env.BASEURL}/reset-password.html?id=${user._id}&token=${token}`;

  const forgotPasswordToken = await ForgotPasswordToken.findOneAndUpdate(
    { owner: user._id },
    { token },
    { upsert: true, new: true }
  );

  if (!forgotPasswordToken)
    throw new ApiError(505, "Something went wrong while generating token");

  const mail = new MyMail(user.email);
  mail.sendEmail(
    `Please <a href=${link}>click here</a> to reset your Password`
  );

  return res
    .status(200)
    .json(new ApiResponse("Please check your inbox to reset Password"));
});

export const verifyPasswordResetToken = asyncHandler(async (req, res) => {
  const { id, token } = req.body;

  const dbToken = await ForgotPasswordToken.findOne({ owner: id, token });

  if (!dbToken) throw new ApiError(422, "Invalid Token");

  return res.status(200).json(
    new ApiResponse("Token is valid", {
      valid: true,
    })
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { id, token, password } = req.body;

  if (!password) throw new ApiError(422, "Please Provide new password");

  const dbToken = await ForgotPasswordToken.findOne({ owner: id, token });

  if (!dbToken) throw new ApiError(422, "Invalid Token");

  const user = await User.findById(id);

  if (!user) throw new ApiError(404, "user not found");

  user.password = password;

  await user.save();

  const mail = new MyMail(user.email);
  mail.sendEmail(
    "Your password has been changed. Now you can use new password"
  );

  await ForgotPasswordToken.findOneAndDelete({ owner: id, token });

  return res.status(200).json(new ApiResponse("Password has been changed."));
});

export const getAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) throw new ApiError(422, "Please provide  refresh Token");

  const payload = await jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  if (!payload._id) {
    throw new ApiError("UnAuthorized request", 401);
  }

  const user = await User.findOne({ refreshToken, _id: payload._id });

  //   token is compromised so delete all the refresh tokens
  if (!user) {
    await User.findByIdAndUpdate(payload._id, { refreshToken: [] });
    throw new ApiError("UnAuthorized request", 401);
  }

  const newAccessToken = user.generateAccessToken();

  if (!newAccessToken)
    throw new ApiError(
      500,
      "Something went wrong while generating accesstoken"
    );

  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = user.refreshToken.filter((t) => t !== refreshToken);
  user.refreshToken.push(newRefreshToken);
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      "New Access token is generated. Please use new RefreshToken to generate access token next time",
      {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      }
    )
  );
});

export const getS3Url = asyncHandler(async (req, res) => {
  const url = await generatePresignedUrl("a", "ajaypatel-nodejs ");

  const { image } = req.files;

  console.log(url);

  await fetch(url, {
    method: "PUT",
    body: image,
    headers: { "Content-Type": "image/jpeg" },
  });
  logger.info("Upload complete");

  return res.status(200).json(new ApiResponse("url:", { url }));
});

export const uploadToS3 = asyncHandler(async (req, res) => {
  const { image } = req.files;

  const fileextension = image.originalFilename.split(".")[1];
  const filename = `${Date.now()}.${fileextension}`;

  const command = new PutObjectCommand({
    Bucket: s3BucketName,
    Key: `uploads/${filename}`,
    Body: await readFile(`${image.filepath}`),
  });

  const response = await myS3Client.send(command);
  const link = `https://${s3BucketName}.s3-${s3BucketRegion}.amazonaws.com/uploads/${filename}`;
  console.log(response.url);

  res.json({ message: "Upload successful", link });
});
