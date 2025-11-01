import { pgTable, serial, text,	date} from 'drizzle-orm/pg-core';


export const customers = pgTable('customers', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	phone: text('phone').notNull(),
	address: text('address').notNull(),
	birthdate: date('birthdate').notNull(),
	role: text('role').notNull(),
});
export const teachers = pgTable('teachers', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    phone: text('phone').notNull(),
    email: text('email'),
    birthdate: date('birthdate'),
    role: text('role')
});
