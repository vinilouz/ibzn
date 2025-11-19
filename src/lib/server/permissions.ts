export type Role = 'admin' | 'manager' | 'user' | 'guest';

export interface Permissions {
  canViewUsers: boolean;
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;

  // Cursos
  canViewCourses: boolean;
  canCreateCourses: boolean;
  canEditCourses: boolean;
  canDeleteCourses: boolean;

  // Salas
  canViewRooms: boolean;
  canCreateRooms: boolean;
  canEditRooms: boolean;
  canDeleteRooms: boolean;

  // Pagamentos
  canViewPayments: boolean;
  canCreatePayments: boolean;
  canEditPayments: boolean;
  canDeletePayments: boolean;
  canRefundPayments: boolean;

  // Matrículas
  canViewEnrollments: boolean;
  canCreateEnrollments: boolean;
  canEditEnrollments: boolean;
  canDeleteEnrollments: boolean;

  // Facilitadores/Professores
  canViewFacilitators: boolean;
  canCreateFacilitators: boolean;
  canEditFacilitators: boolean;
  canDeleteFacilitators: boolean;

  // Participantes
  canViewParticipants: boolean;
  canCreateParticipants: boolean;
  canEditParticipants: boolean;
  canDeleteParticipants: boolean;

  // Financeiro
  canViewFinancialReports: boolean;
  canExportData: boolean;

  // Configurações do Sistema
  canAccessSettings: boolean;
  canManageRoles: boolean;
}

/**
 * Permissões por Role
 */
const rolePermissions: Record<Role, Permissions> = {
  // ADMIN - Chefe/Dono (Acesso Total)
  admin: {
    canViewUsers: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,

    canViewCourses: true,
    canCreateCourses: true,
    canEditCourses: true,
    canDeleteCourses: true,

    canViewRooms: true,
    canCreateRooms: true,
    canEditRooms: true,
    canDeleteRooms: true,

    canViewPayments: true,
    canCreatePayments: true,
    canEditPayments: true,
    canDeletePayments: true,
    canRefundPayments: true,

    canViewEnrollments: true,
    canCreateEnrollments: true,
    canEditEnrollments: true,
    canDeleteEnrollments: true,

    canViewFacilitators: true,
    canCreateFacilitators: true,
    canEditFacilitators: true,
    canDeleteFacilitators: true,

    canViewParticipants: true,
    canCreateParticipants: true,
    canEditParticipants: true,
    canDeleteParticipants: true,

    canViewFinancialReports: true,
    canExportData: true,

    canAccessSettings: true,
    canManageRoles: true,
  },

  manager: {
    canViewUsers: true,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,

    canViewCourses: true,
    canCreateCourses: true,
    canEditCourses: true,
    canDeleteCourses: true,

    canViewRooms: true,
    canCreateRooms: true,
    canEditRooms: true,
    canDeleteRooms: true,

    canViewPayments: true,
    canCreatePayments: true,
    canEditPayments: true,
    canDeletePayments: true,
    canRefundPayments: true,

    canViewEnrollments: true,
    canCreateEnrollments: true,
    canEditEnrollments: true,
    canDeleteEnrollments: true,

    canViewFacilitators: true,
    canCreateFacilitators: true,
    canEditFacilitators: true,
    canDeleteFacilitators: true,

    canViewParticipants: true,
    canCreateParticipants: true,
    canEditParticipants: true,
    canDeleteParticipants: true,

    canViewFinancialReports: true,
    canExportData: true,

    canAccessSettings: false,
    canManageRoles: false,
  },

  user: {
    canViewUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,

    canViewCourses: true,
    canCreateCourses: false,
    canEditCourses: false,
    canDeleteCourses: false,

    canViewRooms: false,
    canCreateRooms: false,
    canEditRooms: false,
    canDeleteRooms: false,

    canViewPayments: false,
    canCreatePayments: false,
    canEditPayments: false,
    canDeletePayments: false,
    canRefundPayments: false,

    canViewEnrollments: false,
    canCreateEnrollments: false,
    canEditEnrollments: false,
    canDeleteEnrollments: false,

    canViewFacilitators: false,
    canCreateFacilitators: false,
    canEditFacilitators: false,
    canDeleteFacilitators: false,

    canViewParticipants: false,
    canCreateParticipants: false,
    canEditParticipants: false,
    canDeleteParticipants: false,

    canViewFinancialReports: false,
    canExportData: false,

    canAccessSettings: false,
    canManageRoles: false,
  },

  // GUEST - Visitante (Sem Acesso)
  guest: {
    canViewUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,

    canViewCourses: false,
    canCreateCourses: false,
    canEditCourses: false,
    canDeleteCourses: false,

    canViewRooms: false,
    canCreateRooms: false,
    canEditRooms: false,
    canDeleteRooms: false,

    canViewPayments: false,
    canCreatePayments: false,
    canEditPayments: false,
    canDeletePayments: false,
    canRefundPayments: false,

    canViewEnrollments: false,
    canCreateEnrollments: false,
    canEditEnrollments: false,
    canDeleteEnrollments: false,

    canViewFacilitators: false,
    canCreateFacilitators: false,
    canEditFacilitators: false,
    canDeleteFacilitators: false,

    canViewParticipants: false,
    canCreateParticipants: false,
    canEditParticipants: false,
    canDeleteParticipants: false,

    canViewFinancialReports: false,
    canExportData: false,

    canAccessSettings: false,
    canManageRoles: false,
  },
};

/**
 * Obter permissões de um role
 */
export function getPermissions(role: Role): Permissions {
  return rolePermissions[role];
}

/**
 * Verificar se um role tem uma permissão específica
 */
export function hasPermission(role: Role, permission: keyof Permissions): boolean {
  return rolePermissions[role][permission];
}

/**
 * Verificar se usuário pode executar uma ação
 */
export function can(userRole: Role, action: keyof Permissions): boolean {
  return hasPermission(userRole, action);
}

/**
 * Helper para lançar erro se usuário não tiver permissão
 */
export function requirePermission(userRole: Role, action: keyof Permissions): void {
  if (!can(userRole, action)) {
    throw new Error(`Permissão negada: ${userRole} não pode executar '${action}'`);
  }
}
