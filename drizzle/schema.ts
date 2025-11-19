import { pgTable, text, timestamp, foreignKey, integer, unique, date, boolean, serial, doublePrecision, time, varchar, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const attendanceStatus = pgEnum("attendance_status", ['present', 'absent', 'late', 'excused'])
export const paymentMethod = pgEnum("payment_method", ['pix', 'credit_card', 'debit_card', 'bank_transfer', 'boleto', 'cash'])
export const paymentStatus = pgEnum("payment_status", ['pending', 'paid', 'cancelled', 'refunded'])
export const role = pgEnum("role", ['admin', 'manager', 'user', 'guest'])
export const weekday = pgEnum("weekday", ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])


export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const courseEnrollments = pgTable("course_enrollments", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "course_enrollments_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	courseId: integer("course_id").notNull(),
	enrolledAt: timestamp("enrolled_at", { mode: 'string' }).defaultNow().notNull(),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "course_enrollments_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "course_enrollments_course_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const attendanceLists = pgTable("attendance_lists", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "attendance_lists_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	courseId: integer("course_id").notNull(),
	date: date().notNull(),
	notes: text(),
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "attendance_lists_course_id_fkey"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "attendance_lists_created_by_fkey"
		}),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const attendanceRecords = pgTable("attendance_records", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "attendance_records_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	listId: integer("list_id").notNull(),
	studentId: text("student_id").notNull(),
	status: attendanceStatus().default('present').notNull(),
	notes: text(),
	markedAt: timestamp("marked_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.listId],
			foreignColumns: [attendanceLists.id],
			name: "attendance_records_list_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [user.id],
			name: "attendance_records_student_id_fkey"
		}),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	role: role().default('user').notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const facilitators = pgTable("facilitators", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	email: text(),
	phone: text().notNull(),
	role: text(),
	birthdate: date(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow(),
	lastSessionAt: timestamp("last_session_at", { mode: 'string' }),
});

export const courses = pgTable("courses", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "courses_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	courseName: text().notNull(),
	description: text(),
	price: doublePrecision().notNull(),
	capacity: integer().notNull(),
	isFull: boolean().default(false).notNull(),
	duration: integer().notNull(),
	weekdays: weekday(),
	startDate: date(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	room: integer().notNull(),
	sessionsInfo: text(),
	startTime: time(),
	endTime: time(),
	teacher: integer().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.room],
			foreignColumns: [rooms.id],
			name: "room"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.teacher],
			foreignColumns: [facilitators.id],
			name: "teacher"
		}).onDelete("cascade"),
]);

export const payments = pgTable("payments", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	courseId: integer("course_id").notNull(),
	enrollmentId: integer("enrollment_id"),
	amount: doublePrecision().notNull(),
	discount: doublePrecision().default(0),
	finalAmount: doublePrecision("final_amount").notNull(),
	status: paymentStatus().default('pending').notNull(),
	paymentMethod: paymentMethod("payment_method"),
	transactionId: text("transaction_id"),
	paymentProof: text("payment_proof"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	paidAt: timestamp("paid_at", { mode: 'string' }),
	cancelledAt: timestamp("cancelled_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "payments_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "payments_course_id_fk"
		}).onDelete("cascade"),
]);

export const participants = pgTable("participants", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	phone: text().notNull(),
	address: text(),
	role: text(),
	birthdate: date(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow(),
	lastSessionAt: timestamp("last_session_at", { mode: 'string' }),
});

export const rooms = pgTable("rooms", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	number: integer().notNull(),
	description: text(),
	imageUrl: varchar("image_url", { length: 500 }),
	capacity: integer(),
	status: boolean().default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});
