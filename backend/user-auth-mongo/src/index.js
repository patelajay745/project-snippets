import "dotenv/config";
import "./db/index.js";
import express from "express";
import cookieParser from "cookie-parser";

import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger-output.json" with { type: "json" };

const app = express();

app.use(express.static("src/public"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//all routes
import { authRouter } from "./routes/auth.route.js";
import { logger } from "./logger/winston.logger.js";
app.use("/api/v1/user", authRouter);

app.listen(port, () => {
  logger.info(`server is running on ${port}`)
});
