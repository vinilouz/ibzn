/**
 * Sistema de Permissões por Role
 *
 * Define o que cada tipo de usuário pode fazer no sistema
 */

export type Role = 'admin' | 'manager' | 'user' | 'guest';

export interface Permissions {
  // Usuários
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

  // MANAGER - Secretária/Gerente (Acesso Operacional Completo)
  manager: {
    canViewUsers: true,
    canCreateUsers: false,      // ❌ Não pode criar usuários do SISTEMA (admin/manager)
    canEditUsers: false,        // ❌ Não pode editar usuários do SISTEMA
    canDeleteUsers: false,      // ❌ Não pode deletar usuários do SISTEMA

    canViewCourses: true,
    canCreateCourses: true,     // ✅ Pode criar cursos
    canEditCourses: true,       // ✅ Pode editar cursos
    canDeleteCourses: true,     // ✅ PODE deletar cursos

    canViewRooms: true,
    canCreateRooms: true,       // ✅ Pode criar salas
    canEditRooms: true,         // ✅ Pode editar salas
    canDeleteRooms: true,       // ✅ PODE deletar salas

    canViewPayments: true,
    canCreatePayments: true,    // ✅ Pode registrar pagamentos
    canEditPayments: true,      // ✅ Pode alterar status de pagamentos
    canDeletePayments: true,    // ✅ PODE deletar pagamentos
    canRefundPayments: true,    // ✅ PODE fazer reembolsos

    canViewEnrollments: true,
    canCreateEnrollments: true, // ✅ Pode matricular participantes
    canEditEnrollments: true,   // ✅ Pode editar matrículas
    canDeleteEnrollments: true, // ✅ PODE deletar matrículas

    canViewFacilitators: true,
    canCreateFacilitators: true,// ✅ Pode cadastrar professores
    canEditFacilitators: true,  // ✅ Pode editar professores
    canDeleteFacilitators: true,// ✅ PODE deletar professores

    canViewParticipants: true,
    canCreateParticipants: true,// ✅ Pode cadastrar participantes
    canEditParticipants: true,  // ✅ Pode editar participantes
    canDeleteParticipants: true,// ✅ PODE deletar participantes

    canViewFinancialReports: true, // ✅ Pode ver relatórios
    canExportData: true,           // ✅ Pode exportar dados

    canAccessSettings: false,      // ❌ NÃO pode acessar configurações do sistema
    canManageRoles: false,         // ❌ NÃO pode gerenciar permissões/roles
  },

  // USER - Participante (Acesso Muito Limitado - Caso seja implementado portal do aluno)
  user: {
    canViewUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,

    canViewCourses: true,        // Pode ver cursos disponíveis
    canCreateCourses: false,
    canEditCourses: false,
    canDeleteCourses: false,

    canViewRooms: false,
    canCreateRooms: false,
    canEditRooms: false,
    canDeleteRooms: false,

    canViewPayments: false,      // Vê apenas seus próprios pagamentos
    canCreatePayments: false,
    canEditPayments: false,
    canDeletePayments: false,
    canRefundPayments: false,

    canViewEnrollments: false,   // Vê apenas suas próprias matrículas
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
