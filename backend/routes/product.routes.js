import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import * as controller from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", authenticate, authorize("PRODUCT_READ"), controller.getProducts);

router.post(
  "/",
  authenticate,
  authorize("PRODUCT_CREATE"),
  controller.createProduct,
);

router.put(
  "/:id",
  authenticate,
  authorize("PRODUCT_UPDATE"),
  controller.updateProduct,
);

router.delete(
  "/:id",
  authenticate,
  authorize("PRODUCT_DELETE"),
  controller.deleteProduct,
);

export default router;
