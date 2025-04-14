"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().optional(),
    BASEURL: zod_1.z.string().min(1, { message: "Base is required" }),
    DB_TYPE: zod_1.z.string().min(1, { message: "DB_TYPE is required" }),
    MONGO_URI: zod_1.z.string().min(1, { message: "MONGO_URI is required" })
});
function createENV(env) {
    const validationResult = envSchema.safeParse(env);
    if (!validationResult.success) {
        throw new Error(validationResult.error.message);
    }
    return validationResult.data;
}
exports.env = createENV(process.env);
