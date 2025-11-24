import type { Role } from './middleware/auth';

export const CAPABILITIES = {
	COURSES_VIEW: 'courses.view',
	COURSES_CREATE: 'courses.create',
	COURSES_UPDATE: 'courses.update',
	COURSES_DELETE: 'courses.delete',
	COURSES_ENROLL: 'courses.enroll',
	COURSES_MANAGE_ENROLLMENTS: 'courses.manage_enrollments',

	ROOMS_VIEW: 'rooms.view',
	ROOMS_CREATE: 'rooms.create',
	ROOMS_UPDATE: 'rooms.update',
	ROOMS_DELETE: 'rooms.delete',

	USERS_VIEW: 'users.view',
	USERS_CREATE: 'users.create',
	USERS_UPDATE: 'users.update',
	USERS_DELETE: 'users.delete',
	USERS_MANAGE_ROLES: 'users.manage_roles',

	SYSTEM_SETTINGS: 'system.settings',
	SYSTEM_LOGS: 'system.logs',
	SYSTEM_BACKUP: 'system.backup'
} as const;

export type Capability = (typeof CAPABILITIES)[keyof typeof CAPABILITIES];

export const ROLE_CAPABILITIES: Record<Role, Capability[]> = {
	admin: [
		CAPABILITIES.COURSES_VIEW,
		CAPABILITIES.COURSES_CREATE,
		CAPABILITIES.COURSES_UPDATE,
		CAPABILITIES.COURSES_DELETE,
		CAPABILITIES.COURSES_ENROLL,
		CAPABILITIES.COURSES_MANAGE_ENROLLMENTS,

		CAPABILITIES.ROOMS_VIEW,
		CAPABILITIES.ROOMS_CREATE,
		CAPABILITIES.ROOMS_UPDATE,
		CAPABILITIES.ROOMS_DELETE,

		CAPABILITIES.USERS_VIEW,
		CAPABILITIES.USERS_CREATE,
		CAPABILITIES.USERS_UPDATE,
		CAPABILITIES.USERS_DELETE,
		CAPABILITIES.USERS_MANAGE_ROLES,

		CAPABILITIES.SYSTEM_SETTINGS,
		CAPABILITIES.SYSTEM_LOGS,
		CAPABILITIES.SYSTEM_BACKUP
	],

	manager: [
		CAPABILITIES.COURSES_VIEW,
		CAPABILITIES.COURSES_CREATE,
		CAPABILITIES.COURSES_UPDATE,
		CAPABILITIES.COURSES_DELETE,
		CAPABILITIES.COURSES_MANAGE_ENROLLMENTS,

		CAPABILITIES.ROOMS_VIEW,
		CAPABILITIES.ROOMS_CREATE,
		CAPABILITIES.ROOMS_UPDATE,
		CAPABILITIES.ROOMS_DELETE,

		CAPABILITIES.USERS_VIEW
	],

	user: [
		CAPABILITIES.COURSES_VIEW,
		CAPABILITIES.COURSES_ENROLL,

		CAPABILITIES.ROOMS_VIEW
	],

	guest: [
		CAPABILITIES.COURSES_VIEW,

		CAPABILITIES.ROOMS_VIEW
	]
};

export function roleHasCapability(role: Role, capability: Capability): boolean {
	return ROLE_CAPABILITIES[role].includes(capability);
}

export function roleHasAllCapabilities(role: Role, capabilities: Capability[]): boolean {
	const roleCapabilities = ROLE_CAPABILITIES[role];
	return capabilities.every((cap) => roleCapabilities.includes(cap));
}

export function roleHasAnyCapability(role: Role, capabilities: Capability[]): boolean {
	const roleCapabilities = ROLE_CAPABILITIES[role];
	return capabilities.some((cap) => roleCapabilities.includes(cap));
}

export function getRoleCapabilities(role: Role): Capability[] {
	return ROLE_CAPABILITIES[role];
}

export function isValidCapability(capability: string): capability is Capability {
	return Object.values(CAPABILITIES).includes(capability as Capability);
}
