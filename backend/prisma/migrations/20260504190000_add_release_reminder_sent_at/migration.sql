-- Add reminder tracking to avoid duplicate emails.
ALTER TABLE "Movie"
ADD COLUMN "releaseReminderSentAt" TIMESTAMP(3);