import { S3Client } from "@aws-sdk/client-s3";
import { awsAccessToken, awsSecretToken, s3BucketRegion } from "./index.js";

export const myS3Client = new S3Client(
  { region: s3BucketRegion },
  {
    credentials: {
      accessKeyId: awsAccessToken,
      secretAccessKey: awsSecretToken,
    },
  }
);
