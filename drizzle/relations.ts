import { relations } from "drizzle-orm/relations";
import { user, courseEnrollments, courses, session, attendanceLists, account, attendanceRecords, rooms, facilitators, payments } from "./schema";

export const courseEnrollmentsRelations = relations(courseEnrollments, ({one}) => ({
	user: one(user, {
		fields: [courseEnrollments.userId],
		references: [user.id]
	}),
	course: one(courses, {
		fields: [courseEnrollments.courseId],
		references: [courses.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	courseEnrollments: many(courseEnrollments),
	sessions: many(session),
	attendanceLists: many(attendanceLists),
	accounts: many(account),
	attendanceRecords: many(attendanceRecords),
	payments: many(payments),
}));

export const coursesRelations = relations(courses, ({one, many}) => ({
	courseEnrollments: many(courseEnrollments),
	attendanceLists: many(attendanceLists),
	room: one(rooms, {
		fields: [courses.room],
		references: [rooms.id]
	}),
	facilitator: one(facilitators, {
		fields: [courses.teacher],
		references: [facilitators.id]
	}),
	payments: many(payments),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const attendanceListsRelations = relations(attendanceLists, ({one, many}) => ({
	course: one(courses, {
		fields: [attendanceLists.courseId],
		references: [courses.id]
	}),
	user: one(user, {
		fields: [attendanceLists.createdBy],
		references: [user.id]
	}),
	attendanceRecords: many(attendanceRecords),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const attendanceRecordsRelations = relations(attendanceRecords, ({one}) => ({
	attendanceList: one(attendanceLists, {
		fields: [attendanceRecords.listId],
		references: [attendanceLists.id]
	}),
	user: one(user, {
		fields: [attendanceRecords.studentId],
		references: [user.id]
	}),
}));

export const roomsRelations = relations(rooms, ({many}) => ({
	courses: many(courses),
}));

export const facilitatorsRelations = relations(facilitators, ({many}) => ({
	courses: many(courses),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	user: one(user, {
		fields: [payments.userId],
		references: [user.id]
	}),
	course: one(courses, {
		fields: [payments.courseId],
		references: [courses.id]
	}),
}));