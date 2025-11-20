import { pgTable, text } from 'drizzle-orm/pg-core';

export const systemSettings = pgTable('system_settings', {
    key: text('key').primaryKey(),
    value: text('value').notNull()
});
