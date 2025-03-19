import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { awsAccessToken, awsSecretToken } from "../config/index.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const generatePresignedUrl = async (fileName, bucketName) => {
  try {
    const client = new S3Client(
      { region: "us-west-1" },
      {
        credentials: {
          accessKeyId: awsAccessToken,
          secretAccessKey: awsSecretToken,
        },
      }
    );

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });

    const url = await getSignedUrl(client, command, { expiresIn: 3600 });

    console.log(url);

    return url;
  } catch (error) {
    return error;
  }
};
