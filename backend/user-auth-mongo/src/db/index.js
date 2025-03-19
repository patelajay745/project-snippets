import mongoose from "mongoose";
import { logger } from "../logger/winston.logger.js";

const dbUrl = process.env.MONGODB_URL;
mongoose
  .connect(dbUrl)
  .then(() => logger.info(`db connected`))
  .catch((error) => logger.error("Error", error));
