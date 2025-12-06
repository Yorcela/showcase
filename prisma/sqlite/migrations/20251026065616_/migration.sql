-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "passwordHash" TEXT,
    "emailVerifiedAt" DATETIME,
    "avatar" TEXT,
    "bio" TEXT,
    "website" TEXT,
    "linkedIn" TEXT,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME
);
INSERT INTO "new_users" ("avatar", "bio", "createdAt", "email", "emailVerifiedAt", "firstName", "id", "lastLoginAt", "lastName", "linkedIn", "location", "passwordHash", "phone", "role", "status", "updatedAt", "website") SELECT "avatar", "bio", "createdAt", "email", "emailVerifiedAt", "firstName", "id", "lastLoginAt", "lastName", "linkedIn", "location", "passwordHash", "phone", "role", "status", "updatedAt", "website" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE TABLE "new_system_config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_system_config" ("createdAt", "id", "key", "updatedAt", "value") SELECT "createdAt", "id", "key", "updatedAt", "value" FROM "system_config";
DROP TABLE "system_config";
ALTER TABLE "new_system_config" RENAME TO "system_config";
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
