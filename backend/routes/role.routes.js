import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import * as controller from "../controllers/client.controller.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("ROLE_READ"));

router.post("/", authorize("ROLE_CREATE"), createRole);
router.put("/:id", authorize("ROLE_UPDATE"), updateRole);
router.delete("/:id", authorize("ROLE_DELETE"), deleteRole);
