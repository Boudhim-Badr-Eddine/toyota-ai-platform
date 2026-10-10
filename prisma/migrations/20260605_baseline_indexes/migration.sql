-- Baseline migration (apply with `npx prisma migrate deploy` in production)
-- Indexes and SavedConfiguration were added incrementally; run `npm run db:setup` for local dev.

CREATE INDEX IF NOT EXISTS "Lead_status_idx" ON "Lead"("status");
CREATE INDEX IF NOT EXISTS "Lead_createdAt_idx" ON "Lead"("createdAt");
CREATE INDEX IF NOT EXISTS "Lead_userId_idx" ON "Lead"("userId");
CREATE INDEX IF NOT EXISTS "Reservation_date_idx" ON "Reservation"("date");
CREATE INDEX IF NOT EXISTS "Reservation_status_idx" ON "Reservation"("status");
