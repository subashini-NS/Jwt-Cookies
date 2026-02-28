import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  console.log("TOKEN:", req.cookies.accessToken);
  console.log("DECODED:", jwt.decode(req.cookies.accessToken));

  const token = req.cookies?.accessToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
