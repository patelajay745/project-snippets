"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const env_1 = require("./env");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("It is up and running...");
});
const PORT = (_a = env_1.env.PORT) !== null && _a !== void 0 ? _a : 8000;
app.listen(PORT, () => {
    console.log(`server running on ${env_1.env.BASEURL}:${PORT}`);
});
exports.default = app;
