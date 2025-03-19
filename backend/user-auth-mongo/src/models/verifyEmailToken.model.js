import mongoose from "mongoose";
import { Schema } from "mongoose";

const schema = new Schema({
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  token: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    expires: 86400, //60*60*24
    default: Date.now(),
  },
});

export const VerifyEmailToken = mongoose.model("VerifyEmailToken", schema);
