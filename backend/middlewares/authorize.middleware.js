import Role from "../models/Role.js";

export const authorize =
  (...requiredPermissions) =>
  async (req, res, next) => {
    const role = await Role.findById(req.user.role).populate(
      "permissions",
      "key",
    );

    if (!role) {
      return res.status(403).json({ message: "Access denied" });
    }

    const permissionKeys = role.permissions.map((p) => p.key);

    const hasAccess = requiredPermissions.every((perm) =>
      permissionKeys.includes(perm),
    );

    if (!hasAccess) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    next();
  };
