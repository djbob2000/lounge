-- Database indexes for performance optimization
-- This migration adds indexes to frequently queried columns

-- Indexes for Photos table
CREATE INDEX IF NOT EXISTS "idx_photos_album_id" ON "Photo"("albumId");
CREATE INDEX IF NOT EXISTS "idx_photos_display_order" ON "Photo"("displayOrder");
CREATE INDEX IF NOT EXISTS "idx_photos_is_slider" ON "Photo"("isSliderImage");
CREATE INDEX IF NOT EXISTS "idx_photos_created_at" ON "Photo"("createdAt" DESC);

-- Indexes for Albums table  
CREATE INDEX IF NOT EXISTS "idx_albums_category_id" ON "Album"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_albums_slug" ON "Album"("slug");
CREATE INDEX IF NOT EXISTS "idx_albums_is_hidden" ON "Album"("isHidden");
CREATE INDEX IF NOT EXISTS "idx_albums_created_at" ON "Album"("createdAt" DESC);

-- Indexes for Categories table
CREATE INDEX IF NOT EXISTS "idx_categories_slug" ON "Category"("slug");
CREATE INDEX IF NOT EXISTS "idx_categories_show_in_menu" ON "Category"("showInMenu");
CREATE INDEX IF NOT EXISTS "idx_categories_created_at" ON "Category"("createdAt" DESC);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS "idx_photos_album_slider_order" ON "Photo"("albumId", "isSliderImage", "displayOrder");
CREATE INDEX IF NOT EXISTS "idx_albums_category_hidden" ON "Album"("categoryId", "isHidden", "createdAt" DESC);

-- Full text search indexes (if needed for search functionality)
-- CREATE INDEX IF NOT EXISTS "idx_photos_description_fts" ON "photos" USING gin(to_tsvector('english', "description"));
-- CREATE INDEX IF NOT EXISTS "idx_albums_description_fts" ON "albums" USING gin(to_tsvector('english', "description"));
-- CREATE INDEX IF NOT EXISTS "idx_categories_name_fts" ON "categories" USING gin(to_tsvector('english', "name"));
