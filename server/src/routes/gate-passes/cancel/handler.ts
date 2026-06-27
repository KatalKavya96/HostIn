import { Response } from "express";
import { AuthorizedRequest } from "../../../middleware/orgAccess";
import { prisma } from "../../../lib/prisma";
export const handleCancelPass = async (req: AuthorizedRequest, res: Response) => {
  const pass = await prisma.gatePass.findFirst({ where: { id: req.params.id as string, org_id: req.headers["x-org-id"] as string, tenant_id: req.user?.userId, status: "pending" } });
  if (!pass) return res.status(404).json({ error: "Only your pending gate pass can be cancelled" });
  const gatePass = await prisma.gatePass.update({ where: { id: pass.id }, data: { status: "cancelled" } });
  return res.json({ gatePass });
};
