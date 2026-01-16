import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSecurityFields1719772958000 implements MigrationInterface {
  name = 'AddSecurityFields1719772958000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add columns for tracking failed login attempts and lockout
    await queryRunner.query(
      `ALTER TABLE "user" 
       ADD COLUMN IF NOT EXISTS "failedLoginAttempts" integer NOT NULL DEFAULT 0,
       ADD COLUMN IF NOT EXISTS "accountLockedUntil" TIMESTAMP WITH TIME ZONE,
       ADD COLUMN IF NOT EXISTS "lastFailedLogin" TIMESTAMP WITH TIME ZONE,
       ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP WITH TIME ZONE,
       ADD COLUMN IF NOT EXISTS "passwordChangedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       ADD COLUMN IF NOT EXISTS "mustChangePassword" boolean NOT NULL DEFAULT false;`
    );

    // Create an index for faster lookups on locked accounts
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_account_locked" ON "user" ("accountLockedUntil") WHERE "accountLockedUntil" IS NOT NULL;`
    );

    // Update existing users to have the default values
    await queryRunner.query(
      `UPDATE "user" SET 
       "failedLoginAttempts" = 0,
       "mustChangePassword" = false;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the index
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_account_locked";`);
    
    // Remove the columns
    await queryRunner.query(
      `ALTER TABLE "user" 
       DROP COLUMN IF EXISTS "failedLoginAttempts",
       DROP COLUMN IF EXISTS "accountLockedUntil",
       DROP COLUMN IF EXISTS "lastFailedLogin",
       DROP COLUMN IF EXISTS "lastLogin",
       DROP COLUMN IF EXISTS "passwordChangedAt",
       DROP COLUMN IF EXISTS "mustChangePassword";`
    );
  }
}
