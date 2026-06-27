import { Router } from "express";
import { authenticateJWT } from "../../../middleware/auth";
import { checkOrgAccess } from "../../../middleware/orgAccess";
import { handleCommunityInteraction } from "./handler";

const router = Router();
router.post("/", authenticateJWT as any, checkOrgAccess(["owner", "warden", "guard", "staff", "tenant", "parent"]) as any, handleCommunityInteraction as any);
export default router;
