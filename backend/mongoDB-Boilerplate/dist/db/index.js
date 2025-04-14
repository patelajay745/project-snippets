"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("@/env");
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.connect(env_1.env.MONGO_URI)
    .then(() => console.log("DB is connected"))
    .catch(() => {
    console.log("DB connection failed");
    process.exit(1);
});
