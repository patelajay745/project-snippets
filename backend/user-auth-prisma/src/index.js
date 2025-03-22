import "dotenv/config";
import express from "express";
import { logger } from "./winston/winston.logger.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { createClient } from "redis";

import swaggerUI from "swagger-ui-express"
import swaggeDocument from "./swagger-output.json" with {type:"json"}

//store data to redis
const client = createClient({
  // ... (see https://github.com/redis/node-redis/blob/master/docs/client-configuration.md)

  url: process.env.REDIS_URL,
});

await client.connect();

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("src/public"));
app.use("/api-docs",swaggerUI.serve,swaggerUI.setup(swaggeDocument))

const port = process.env.PORT || 4000;

//for rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  limit: 30, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
  store: new RedisStore({
    sendCommand: (...args) => client.sendCommand(args),
  }),
  message: new ApiError(429, "Too many request"),
});
app.use(limiter);

app.get("/", function (req, res) {
  res.send("Hello World");
});

// import all routes
import { authRouter } from "./routes/auth.route.js";
import { ApiError } from "./utils/apiError.js";

app.use("/api/v1/user", authRouter);

app.listen(port, () => {
  logger.info(`server started on port ${port}`);
});
