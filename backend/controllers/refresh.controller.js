// controllers/refresh.controller.js
import jwt from "jsonwebtoken";
import crypto from "crypto";
import RefreshToken from "../models/RefreshToken.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { cookieOptions } from "../utils/cookies.js";
import User from "../models/User.js";

export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  let payload;
  try {
    payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    return res.sendStatus(403);
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const storedToken = await RefreshToken.findOne({
    tokenHash,
    revoked: false,
  });

  if (!storedToken) return res.sendStatus(403);

  // 🔒 Rotate token
  storedToken.revoked = true;
  await storedToken.save();

  // ✅ LOAD USER (CRITICAL)
  const user = await User.findById(payload.sub).select("email isActive");
  if (!user || !user.isActive) return res.sendStatus(403);

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  await RefreshToken.create({
    userId: user._id,
    tokenHash: crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex"),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  res
    .cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", newRefreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .sendStatus(200);
};
