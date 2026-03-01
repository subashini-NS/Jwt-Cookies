import Permission from "../models/Permission.js";
import Role from "../models/Role.js";

const ALL_PERMISSION_KEYS = [
  "CLIENT_READ",
  "CLIENT_CREATE",
  "CLIENT_UPDATE",
  "CLIENT_DELETE",
  "PRODUCT_READ",
  "PRODUCT_CREATE",
  "PRODUCT_UPDATE",
  "PRODUCT_DELETE",
  "ROLE_READ",
  "ROLE_CREATE",
  "ROLE_UPDATE",
  "ROLE_DELETE",
];

const ROLE_PERMISSIONS = {
  "end-user": [
    "CLIENT_READ",
    "CLIENT_CREATE",
    "CLIENT_UPDATE",
    "CLIENT_DELETE",
    "PRODUCT_READ",
    "PRODUCT_CREATE",
    "PRODUCT_UPDATE",
    "PRODUCT_DELETE",
  ],
  admin: [
    "CLIENT_READ",
    "CLIENT_CREATE",
    "CLIENT_UPDATE",
    "CLIENT_DELETE",
    "PRODUCT_READ",
    "PRODUCT_CREATE",
    "PRODUCT_UPDATE",
    "PRODUCT_DELETE",
  ],
  "super-admin": ALL_PERMISSION_KEYS,
};

export const ensureRbac = async () => {
  const permissions = {};

  for (const key of ALL_PERMISSION_KEYS) {
    const permission = await Permission.findOneAndUpdate(
      { key },
      { $setOnInsert: { key } },
      { upsert: true, new: true },
    );
    permissions[key] = permission._id;
  }

  for (const [roleName, keys] of Object.entries(ROLE_PERMISSIONS)) {
    const role =
      (await Role.findOne({ name: roleName })) ||
      new Role({
        name: roleName,
        permissions: [],
      });

    if (roleName === "super-admin") {
      role.isSystemRole = true;
    }

    const targetPermissionIds = keys.map((key) => permissions[key]);
    role.permissions = targetPermissionIds;
    await role.save();
  }
};
