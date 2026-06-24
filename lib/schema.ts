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
  fileUrl: text('file_url').notNull().default(''),
  status: text('status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
  targetLibraryEntryId: varchar('target_library_entry_id'), // set when driver is editing an existing entry
  reviewedBy: varchar('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const libraryEntries = pgTable('library_entries', {
  id: varchar('id').primaryKey().default('gen_random_uuid()'),
  postcode: text('postcode').notNull(),
  companyName: text('company_name').notNull().default(''),
  what3words: text('what3words').notNull().default(''),
  notes: text('notes').notNull().default(''),
  image1Url: text('image1_url').notNull().default(''),
  image2Url: text('image2_url').notNull().default(''),
  source: text('source').notNull().default('library'), // 'library' | 'driver-submission'
  sourceNoteId: varchar('source_note_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: varchar('id').primaryKey().default('gen_random_uuid()'),
  userId: varchar('user_id'),
  action: text('action').notNull(),
  details: jsonb('details'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow(),
});
