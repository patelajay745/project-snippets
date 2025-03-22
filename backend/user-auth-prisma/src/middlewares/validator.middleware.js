import * as yup from "yup";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js";

export const validate = function (schema) {
  return asyncHandler(async (req, res, next) => {
    await schema.validate({ ...req.body }, { strict: true, abortEarly: true });
    next();
  });
};
