await Permission.insertMany([
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

const permissions = await Permission.find();

const map = (keys) =>
  permissions.filter((p) => keys.includes(p.key)).map((p) => p._id);

await Role.insertMany([
  {
    name: "end-user",
    permissions: map([
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
    name: "admin",
    permissions: map([
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
    permissions: map(
      permissions.map((p) => p.key), // ALL
    ),
    isSystemRole: true,
  },
]);
