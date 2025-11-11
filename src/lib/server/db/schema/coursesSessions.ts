import { pgTable, text, timestamp, date } from 'drizzle-orm/pg-core';
import { courses } from './courses';

export const courseSessions = pgTable('course_sessions', {
    id: text('id').primaryKey(),
    courseId: text('course_id')
        .notNull()
        .references(() => courses.id, { onDelete: 'cascade' }),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    startTime: timestamp('start_time'),
    endTime: timestamp('end_time'),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().$onUpdate(() => new Date()),
});

