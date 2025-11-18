import { pgTable, serial, text, date, timestamp } from 'drizzle-orm/pg-core';

export const participants = pgTable('participants', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  address: text('address'),
  role: text('role'),
  birthdate: date('birthdate'),
  createdAt: timestamp('created_at').defaultNow(),
  joinedAt: timestamp('joined_at').defaultNow(),
  lastSessionAt: timestamp('last_session_at')
});
