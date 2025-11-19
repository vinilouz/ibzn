import { relations } from "drizzle-orm/relations";
import { attendanceLists, attendanceRecords, participants, user, session, courses, account, courseEnrollments, rooms, facilitators, payments, appointments } from "./schema";

export const attendanceRecordsRelations = relations(attendanceRecords, ({one}) => ({
	attendanceList: one(attendanceLists, {
		fields: [attendanceRecords.listId],
		references: [attendanceLists.id]
	}),
	participant: one(participants, {
		fields: [attendanceRecords.participantId],
		references: [participants.id]
	}),
}));

export const attendanceListsRelations = relations(attendanceLists, ({one, many}) => ({
	attendanceRecords: many(attendanceRecords),
	course: one(courses, {
		fields: [attendanceLists.courseId],
		references: [courses.id]
	}),
	user: one(user, {
		fields: [attendanceLists.createdBy],
		references: [user.id]
	}),
}));

export const participantsRelations = relations(participants, ({many}) => ({
	attendanceRecords: many(attendanceRecords),
	courseEnrollments: many(courseEnrollments),
	payments: many(payments),
	appointments: many(appointments),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	sessions: many(session),
	attendanceLists: many(attendanceLists),
	accounts: many(account),
	payments: many(payments),
}));

export const coursesRelations = relations(courses, ({one, many}) => ({
	attendanceLists: many(attendanceLists),
	courseEnrollments: many(courseEnrollments),
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

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const courseEnrollmentsRelations = relations(courseEnrollments, ({one}) => ({
	course: one(courses, {
		fields: [courseEnrollments.courseId],
		references: [courses.id]
	}),
	participant: one(participants, {
		fields: [courseEnrollments.participantId],
		references: [participants.id]
	}),
}));

export const roomsRelations = relations(rooms, ({many}) => ({
	courses: many(courses),
	appointments: many(appointments),
}));

export const facilitatorsRelations = relations(facilitators, ({many}) => ({
	courses: many(courses),
	appointments: many(appointments),
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
	participant: one(participants, {
		fields: [payments.participantId],
		references: [participants.id]
	}),
}));

export const appointmentsRelations = relations(appointments, ({one}) => ({
	facilitator: one(facilitators, {
		fields: [appointments.facilitatorId],
		references: [facilitators.id]
	}),
	room: one(rooms, {
		fields: [appointments.roomId],
		references: [rooms.id]
	}),
	participant: one(participants, {
		fields: [appointments.participantId],
		references: [participants.id]
	}),
}));