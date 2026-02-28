import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  if (!user.role) {
    throw new Error("User has no role assigned");
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role.toString(),
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

export const generateRefreshToken = (user) =>
  jwt.sign(
    { sub: user._id, email: user.email, role: user.role.toString() },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
