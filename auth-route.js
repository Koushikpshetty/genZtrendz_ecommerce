import express from "express";
import { z } from "zod";
import * as AuthController from "../controller/auth-controller.js";
import { isAuth } from "../middleware/auth.js";
const router = express.Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

// Validation middleware
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: error.errors || error.message,
    });
  }
};

router.post("/login", validate(loginSchema), AuthController.login);

router.post("/sign-in", validate(signupSchema), AuthController.signUp);

router.get("/me", isAuth, AuthController.me);

export { router as authRouter };
