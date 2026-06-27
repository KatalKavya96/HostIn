import { Router } from "express";
import { authenticateJWT } from "../../../middleware/auth";
import { checkOrgAccess } from "../../../middleware/orgAccess";
import { handleCancelPass } from "./handler";
const router = Router();
router.post("/:id/cancel", authenticateJWT as any, checkOrgAccess(["tenant"]) as any, handleCancelPass as any);
export default router;
