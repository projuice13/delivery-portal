import { pgTable, varchar, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const driverNotes = pgTable('driver_notes', {
  id: varchar('id').primaryKey().default('gen_random_uuid()'),
  driverId: varchar('driver_id'),
  driverName: text('driver_name').notNull(),
  postcode: text('postcode').notNull(),
  what3words: text('what3words').notNull().default(''),
  notes: text('notes').notNull(),
  fileName: text('file_name').notNull().default(''),
  fileContent: text('file_content').notNull().default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: varchar('id').primaryKey().default('gen_random_uuid()'),
  userId: varchar('user_id'),
  action: text('action').notNull(),
  details: jsonb('details'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow(),
});
