CREATE TABLE "lost_found_posts" (
  "id" UUID NOT NULL,
  "org_id" UUID NOT NULL,
  "author_id" UUID NOT NULL,
  "caption" TEXT NOT NULL,
  "image_urls" TEXT[] NOT NULL,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lost_found_posts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "lost_found_posts_org_id_created_at_idx" ON "lost_found_posts"("org_id", "created_at");
ALTER TABLE "lost_found_posts" ADD CONSTRAINT "lost_found_posts_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lost_found_posts" ADD CONSTRAINT "lost_found_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
