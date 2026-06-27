import { Response } from "express";
import { AuthorizedRequest } from "../../../middleware/orgAccess";
import { prisma } from "../../../lib/prisma";

export const handleCommunityInteraction = async (req: AuthorizedRequest, res: Response) => {
  const orgId = req.headers["x-org-id"] as string;
  const userId = req.user?.userId as string;
  const { postId, postType, kind, body } = req.body;
  if (!postId || !["announcements", "complaints", "lost"].includes(postType) || !["reaction", "comment"].includes(kind)) return res.status(400).json({ error: "Invalid interaction" });
  if (req.userOrgRole === "tenant" && postType !== "announcements") return res.status(403).json({ error: "Tenants can interact with announcements only" });
  if (kind === "comment" && !String(body ?? "").trim()) return res.status(400).json({ error: "Comment is required" });
  try {
    if (kind === "reaction") {
      const existing = await prisma.communityInteraction.findFirst({ where: { org_id: orgId, user_id: userId, post_id: postId, post_type: postType, kind: "reaction" } });
      if (existing) { await prisma.communityInteraction.delete({ where: { id: existing.id } }); return res.status(200).json({ reacted: false }); }
    }
    const interaction = await prisma.communityInteraction.create({ data: { org_id: orgId, user_id: userId, post_id: postId, post_type: postType, kind, body: kind === "comment" ? String(body).trim() : null } });
    return res.status(201).json({ interaction, reacted: true });
  } catch (error) {
    console.error("Community interaction error:", error);
    return res.status(500).json({ error: "Could not save interaction" });
  }
};
