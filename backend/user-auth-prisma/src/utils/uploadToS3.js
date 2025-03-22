import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ApiError } from "./apiError.js";
import { asyncHandler } from "./asynchandler.js";
import {
  AWS_ACCESSTOKEN,
  AWS_BUCKETNAME,
  AWS_BUCKETREGION,
  AWS_SECRETKEY,
} from "../config/index.js";
import { readFile } from "fs/promises";
import { log } from "console";

export const uploadToS3 = async (file) => {
  try {
    console.log("file", file);

    const myS3Client = new S3Client(
      { region: AWS_BUCKETREGION },
      {
        credentials: {
          accessKeyId: AWS_ACCESSTOKEN,
          secretAccessKey: AWS_SECRETKEY,
        },
      }
    );

    const fileExtension = file.originalFilename.split(".")[1];
    const fileName = `${Date.now()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: AWS_BUCKETNAME,
      Key: `uploads/${fileName}`,
      Body: await readFile(`${file.filepath}`),
    });

    const response = await myS3Client.send(command);

    const link = `https://${AWS_BUCKETNAME}.s3-${AWS_BUCKETREGION}.amazonaws.com/uploads/${fileName}`;

    console.log(link);

    return link;
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong,while uploading image to s3",
      error
    );
  }
};
