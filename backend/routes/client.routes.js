import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import * as controller from "../controllers/client.controller.js";

const router = express.Router();

router.get("/", authenticate, authorize("CLIENT_READ"), controller.getClients);

router.post(
  "/",
  authenticate,
  authorize("CLIENT_CREATE"),
  controller.createClient,
);

router.put(
  "/:id",
  authenticate,
  authorize("CLIENT_UPDATE"),
  controller.updateClient,
);

router.delete(
  "/:id",
  authenticate,
  authorize("CLIENT_DELETE"),
  controller.deleteClient,
);

export default router;
