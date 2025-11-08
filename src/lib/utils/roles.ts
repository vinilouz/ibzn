// Constants for roles
export const ROLES = ['admin', 'collaborator', 'facilitator', 'student'] as const;
export type Roles = typeof ROLES[number];

// Utils for manipulating roles
export const isValidRole = (role: string): role is Roles => ROLES.includes(role as Roles);

export const getRoleDisplayName = (role: Roles): string => {
	switch (role) {
		case 'admin': return 'Administrator';
		case 'collaborator': return 'Colaborator';
		case 'facilitator': return 'Facilitator';
		case 'student': return 'Estudante';
		default: return role;
	}
};

export const hasRole = (userRole: string | null | undefined, requiredRole: Roles): boolean => {
	if (!userRole || !isValidRole(userRole)) return false;
	const roleHierarchy: Roles[] = ['student', 'facilitator', 'collaborator', 'admin'];
	const userIndex = roleHierarchy.indexOf(userRole);
	const requiredIndex = roleHierarchy.indexOf(requiredRole);
	return userIndex >= requiredIndex;
};