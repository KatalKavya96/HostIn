import { Router } from "express";
import { authenticateJWT } from "../../../middleware/auth";
import { checkOrgAccess } from "../../../middleware/orgAccess";
import { handleCreateLostFound, handleListLostFound } from "./handler";

const router = Router();
router.get("/", authenticateJWT as any, checkOrgAccess(["owner", "warden", "guard", "staff", "tenant", "parent"]) as any, handleListLostFound as any);
router.post("/", authenticateJWT as any, checkOrgAccess(["owner", "warden", "tenant"]) as any, handleCreateLostFound as any);
export default router;
