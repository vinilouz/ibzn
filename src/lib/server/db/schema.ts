import { pgTable, serial, integer, boolean, text, date, timestamp } from 'drizzle-orm/pg-core';
import { join } from 'path';

export const customers = pgTable('customers', {
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
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').notNull(),
  facilitatorId: integer('user_id').notNull(),
  roomId: integer('room_id').notNull(),
  sessionDate: date('session_date').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow()
});
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
export const rooms = pgTable('rooms', {
  id: serial('id').primaryKey(),
  number: integer('number').notNull(),
  capacity: integer('capacity'),
  status: boolean('status').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  age: integer('age')
});