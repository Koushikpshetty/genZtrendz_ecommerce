import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    cart: [
      {
        quantity: Number,
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        size: String,
      },
    ],
    avatar: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
