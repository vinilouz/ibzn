import { relations } from "drizzle-orm/relations";
import { user, courses, rooms, account, session } from "./schema";

export const coursesRelations = relations(courses, ({one}) => ({
	user: one(user, {
		fields: [courses.teacher],
		references: [user.id]
	}),
	room: one(rooms, {
		fields: [courses.room],
		references: [rooms.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	courses: many(courses),
	accounts: many(account),
	sessions: many(session),
}));

export const roomsRelations = relations(rooms, ({many}) => ({
	courses: many(courses),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));