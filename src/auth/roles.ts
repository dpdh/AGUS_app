export const agusRoles = {
  super_admin: {
    label: 'Super Admin',
    description: 'Mengelola akses penuh dan menetapkan administrator sistem.',
    permissions: ['*'],
  },
  admin: {
    label: 'Admin',
    description: 'Mengelola workspace, proyek, data operasional, dan laporan.',
    permissions: ['workspace:manage', 'projects:manage', 'records:manage', 'reports:read'],
  },
  project_manager: {
    label: 'Project Manager',
    description: 'Mengelola proyek, catatan lapangan, dan tindak lanjut tim proyek.',
    permissions: ['projects:manage', 'records:manage', 'reports:read'],
  },
  member: {
    label: 'Member',
    description: 'Melihat proyek dan mengelola bukti serta inspeksi yang ditugaskan.',
    permissions: ['projects:read', 'evidence:manage', 'inspections:manage', 'actions:read'],
  },
} as const

export type AgusRole = keyof typeof agusRoles

export function getAgusRoleLabel(role: string | undefined) {
  return role && role in agusRoles ? agusRoles[role as AgusRole].label : 'Pengguna'
}