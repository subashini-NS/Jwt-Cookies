import { Router } from "express";
import { body } from "express-validator";

import { login, logout, register, me } from "../controllers/auth.controller.js";
import { refresh } from "../controllers/refresh.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

/* -------------------------------------------------------------------------- */
/*                               Validations                                   */
/* -------------------------------------------------------------------------- */
const registerValidation = [
  body("email").trim().isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

/* -------------------------------------------------------------------------- */
/*                               Validation Rules                              */
/* -------------------------------------------------------------------------- */
const loginValidation = [
  body("email").trim().isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

/* -------------------------------------------------------------------------- */
/*                                Auth Routes                                  */
/* -------------------------------------------------------------------------- */
router.post("/register", registerValidation, validate, register);
/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
router.post("/login", loginValidation, login);

/**
 * POST /api/auth/refresh
 * Rotate refresh token and issue new access token
 */
router.post("/refresh", refresh);

/**
 * POST /api/auth/logout
 * Revoke refresh token and clear cookies
 */
router.post("/logout", authenticate, logout);

/* -------------------------------------------------------------------------- */
/*                            Session Validation                                */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/auth/me
 * Validate session and return authenticated user context
 */
router.get("/me", authenticate, me);

export default router;
