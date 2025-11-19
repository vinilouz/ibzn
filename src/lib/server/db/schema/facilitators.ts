
import { pgTable, serial, text, date, timestamp } from 'drizzle-orm/pg-core';

export const facilitators = pgTable('facilitators', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone').notNull(),
  role: text('role'),
  birthdate: date('birthdate'),
  createdAt: timestamp('created_at').defaultNow(),
  joinedAt: timestamp('joined_at').defaultNow(),
  lastSessionAt: timestamp('last_session_at')
});
