CREATE TYPE "CommunityInteractionKind" AS ENUM ('reaction', 'comment');

CREATE TABLE "community_interactions" (
  "id" UUID NOT NULL,
  "org_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "post_id" UUID NOT NULL,
  "post_type" VARCHAR(32) NOT NULL,
  "kind" "CommunityInteractionKind" NOT NULL,
  "body" TEXT,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "community_interactions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "community_interactions_org_id_post_type_post_id_idx" ON "community_interactions"("org_id", "post_type", "post_id");
CREATE UNIQUE INDEX "community_reaction_once" ON "community_interactions"("user_id", "post_type", "post_id", "kind") WHERE "kind" = 'reaction';
ALTER TABLE "community_interactions" ADD CONSTRAINT "community_interactions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "community_interactions" ADD CONSTRAINT "community_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
