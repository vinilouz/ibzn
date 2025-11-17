/**
 * Sistema de Capabilities (Permissões)
 * Define as permissões disponíveis no sistema e quais roles têm acesso a cada uma.
 */

import type { Role } from './middleware/auth';

// ============================================
// Definição de todas as capabilities
// ============================================

export const CAPABILITIES = {
	// Courses (Cursos)
	COURSES_VIEW: 'courses.view',
	COURSES_CREATE: 'courses.create',
	COURSES_UPDATE: 'courses.update',
	COURSES_DELETE: 'courses.delete',
	COURSES_ENROLL: 'courses.enroll',
	COURSES_MANAGE_ENROLLMENTS: 'courses.manage_enrollments',

	// Rooms (Salas)
	ROOMS_VIEW: 'rooms.view',
	ROOMS_CREATE: 'rooms.create',
	ROOMS_UPDATE: 'rooms.update',
	ROOMS_DELETE: 'rooms.delete',

	// Users (Usuários)
	USERS_VIEW: 'users.view',
	USERS_CREATE: 'users.create',
	USERS_UPDATE: 'users.update',
	USERS_DELETE: 'users.delete',
	USERS_MANAGE_ROLES: 'users.manage_roles',

	// System (Sistema)
	SYSTEM_SETTINGS: 'system.settings',
	SYSTEM_LOGS: 'system.logs',
	SYSTEM_BACKUP: 'system.backup'
} as const;

export type Capability = (typeof CAPABILITIES)[keyof typeof CAPABILITIES];

// ============================================
// Mapeamento: Role -> Capabilities
// ============================================

export const ROLE_CAPABILITIES: Record<Role, Capability[]> = {
	/**
	 * Admin: Acesso completo a tudo
	 */
	admin: [
		// Courses
		CAPABILITIES.COURSES_VIEW,
		CAPABILITIES.COURSES_CREATE,
		CAPABILITIES.COURSES_UPDATE,
		CAPABILITIES.COURSES_DELETE,
		CAPABILITIES.COURSES_ENROLL,
		CAPABILITIES.COURSES_MANAGE_ENROLLMENTS,

		// Rooms
		CAPABILITIES.ROOMS_VIEW,
		CAPABILITIES.ROOMS_CREATE,
		CAPABILITIES.ROOMS_UPDATE,
		CAPABILITIES.ROOMS_DELETE,

		// Users
		CAPABILITIES.USERS_VIEW,
		CAPABILITIES.USERS_CREATE,
		CAPABILITIES.USERS_UPDATE,
		CAPABILITIES.USERS_DELETE,
		CAPABILITIES.USERS_MANAGE_ROLES,

		// System
		CAPABILITIES.SYSTEM_SETTINGS,
		CAPABILITIES.SYSTEM_LOGS,
		CAPABILITIES.SYSTEM_BACKUP
	],

	/**
	 * Manager: Pode gerenciar cursos e salas, mas não usuários
	 */
	manager: [
		// Courses - acesso completo
		CAPABILITIES.COURSES_VIEW,
		CAPABILITIES.COURSES_CREATE,
		CAPABILITIES.COURSES_UPDATE,
		CAPABILITIES.COURSES_DELETE,
		CAPABILITIES.COURSES_MANAGE_ENROLLMENTS,

		// Rooms - acesso completo
		CAPABILITIES.ROOMS_VIEW,
		CAPABILITIES.ROOMS_CREATE,
		CAPABILITIES.ROOMS_UPDATE,
		CAPABILITIES.ROOMS_DELETE,

		// Users - apenas visualizar
		CAPABILITIES.USERS_VIEW
	],

	/**
	 * User: Usuário comum, pode visualizar e se inscrever em cursos
	 */
	user: [
		// Courses - visualizar e se inscrever
		CAPABILITIES.COURSES_VIEW,
		CAPABILITIES.COURSES_ENROLL,

		// Rooms - apenas visualizar
		CAPABILITIES.ROOMS_VIEW
	],

	/**
	 * Guest: Visitante, acesso mínimo
	 */
	guest: [
		// Courses - apenas visualizar
		CAPABILITIES.COURSES_VIEW,

		// Rooms - apenas visualizar
		CAPABILITIES.ROOMS_VIEW
	]
};

// ============================================
// Funções auxiliares
// ============================================

/**
 * Verifica se uma role possui uma capability específica
 */
export function roleHasCapability(role: Role, capability: Capability): boolean {
	return ROLE_CAPABILITIES[role].includes(capability);
}

/**
 * Verifica se uma role possui TODAS as capabilities especificadas
 */
export function roleHasAllCapabilities(role: Role, capabilities: Capability[]): boolean {
	const roleCapabilities = ROLE_CAPABILITIES[role];
	return capabilities.every((cap) => roleCapabilities.includes(cap));
}

/**
 * Verifica se uma role possui QUALQUER UMA das capabilities especificadas
 */
export function roleHasAnyCapability(role: Role, capabilities: Capability[]): boolean {
	const roleCapabilities = ROLE_CAPABILITIES[role];
	return capabilities.some((cap) => roleCapabilities.includes(cap));
}

/**
 * Retorna todas as capabilities de uma role
 */
export function getRoleCapabilities(role: Role): Capability[] {
	return ROLE_CAPABILITIES[role];
}

/**
 * Verifica se uma capability é válida
 */
export function isValidCapability(capability: string): capability is Capability {
	return Object.values(CAPABILITIES).includes(capability as Capability);
}
