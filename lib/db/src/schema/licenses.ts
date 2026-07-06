import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const licensesTable = pgTable('licenses', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull(),
  activationKey: text('activation_key').notNull(),
  licenseToken: text('license_token').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  revokedReason: text('revoked_reason'),
});

export type License = typeof licensesTable.$inferSelect;
