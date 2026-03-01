import mongoose from "mongoose";
import Permission from "../models/Permission.js";
import Role from "../models/Role.js";
import dotenv from "dotenv";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

await Permission.deleteMany({});
await Role.deleteMany({});

const permissions = await Permission.insertMany([
  { key: "CLIENT_READ" },
  { key: "CLIENT_CREATE" },
  { key: "CLIENT_UPDATE" },
  { key: "CLIENT_DELETE" },
  { key: "PRODUCT_READ" },
  { key: "PRODUCT_CREATE" },
  { key: "PRODUCT_UPDATE" },
  { key: "PRODUCT_DELETE" },
  { key: "ROLE_READ" },
  { key: "ROLE_CREATE" },
  { key: "ROLE_UPDATE" },
  { key: "ROLE_DELETE" },
]);

const byKey = (keys) =>
  permissions.filter((p) => keys.includes(p.key)).map((p) => p._id);

await Role.insertMany([
  {
    name: "end-user",
    permissions: byKey(["CLIENT_READ", "PRODUCT_READ"]),
  },
  {
    name: "admin",
    permissions: byKey([
      "CLIENT_READ",
      "CLIENT_CREATE",
      "CLIENT_UPDATE",
      "CLIENT_DELETE",
      "PRODUCT_READ",
      "PRODUCT_CREATE",
      "PRODUCT_UPDATE",
      "PRODUCT_DELETE",
    ]),
  },
  {
    name: "super-admin",
    permissions: permissions.map((p) => p._id),
    isSystemRole: true,
  },
]);

console.log("✅ Roles & permissions seeded");
process.exit();
