-- Create users table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "age" INTEGER NOT NULL DEFAULT 0,
    "gender" TEXT NOT NULL DEFAULT 'prefer-not-to-say',
    "profilePicture" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Create index on createdAt for performance
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");
