import { ApiError } from "./apiError.js";

export function asyncHandler(fn) {
  return async function (req, res, next) {
    try {
      await fn(req, res, next);
    } catch (error) {
      // next(error);
      return res.status(error.statusCode || 500).json({ error: error.message });
    }
  };
}
