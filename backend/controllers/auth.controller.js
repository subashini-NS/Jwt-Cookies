import bcrypt from "bcrypt";
import crypto from "crypto";

import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import Role from "../models/Role.js";

import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { cookieOptions } from "../utils/cookies.js";

/* -------------------------------------------------------------------------- */
/*                                  REGISTER                                   */
/* -------------------------------------------------------------------------- */
export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const role = await Role.findOne({ name: "end-user" });
    if (!role) {
      return res.status(500).json({ message: "Default role not found" });
    }

    const user = await User.create({
      email,
      password: passwordHash,
      isActive: true,
      role: role._id,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await RefreshToken.create({
      userId: user._id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res
      .cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        message: "Registration successful",
      });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.password) {
      console.error("Password missing for user:", user.email);
      return res.status(500).json({ message: "Account misconfigured" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await RefreshToken.create({
      userId: user._id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res
      .cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

export const logout = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    await RefreshToken.updateOne({ tokenHash: hash }, { revoked: true });
  }

  res.clearCookie("accessToken").clearCookie("refreshToken").sendStatus(204);
};

export const me = async (req, res) => {
  if (!req.user.role) {
    return res.status(500).json({
      message: "User role not assigned",
    });
  }

  const role = await Role.findById(req.user.role).populate(
    "permissions",
    "key",
  );

  if (!role) {
    return res.status(500).json({
      message: "Role not found. Contact administrator.",
    });
  }

  res.status(200).json({
    user: {
      id: req.user.id,
      email: req.user.email,
      role: role.name,
      permissions: role.permissions.map((p) => p.key),
    },
  });
};
