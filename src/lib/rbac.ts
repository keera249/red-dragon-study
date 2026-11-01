export type PermissionCode =
  | 'universities:read'
  | 'universities:write'
  | 'universities:publish'
  | 'universities:delete'
  | 'programs:read'
  | 'programs:write'
  | 'scholarships:read'
  | 'scholarships:write'
  | 'scholarships:delete'
  | 'requirements:read'
  | 'requirements:write'
  | 'media:read'
  | 'media:write'
  | 'deadlines:read'
  | 'deadlines:write'
  | 'verification:read'
  | 'verification:write'
  | 'content:read'
  | 'content:write'
  | 'contact:manage'
  | 'inquiries:read_assigned'
  | 'inquiries:read_all'
  | 'inquiries:write'
  | 'inquiries:assign'
  | 'inquiries:export'
  | 'employees:manage'
  | 'settings:manage'
  | 'audit:read';

export const ALL_PERMISSIONS: Array<{
  code: PermissionCode;
  module: string;
  description: string;
}> = [
  { code: 'universities:read', module: 'Universities', description: 'View university records' },
  { code: 'universities:write', module: 'Universities', description: 'Create and edit universities' },
  { code: 'universities:publish', module: 'Universities', description: 'Publish or unpublish universities' },
  { code: 'universities:delete', module: 'Universities', description: 'Delete university records' },
  { code: 'programs:read', module: 'Programs', description: 'View academic programs and fees' },
  { code: 'programs:write', module: 'Programs', description: 'Create and edit academic programs and fees' },
  { code: 'scholarships:read', module: 'Scholarships', description: 'View scholarships' },
  { code: 'scholarships:write', module: 'Scholarships', description: 'Create and edit scholarships' },
  { code: 'scholarships:delete', module: 'Scholarships', description: 'Delete scholarships' },
  { code: 'requirements:read', module: 'Requirements', description: 'View shared and specific requirements' },
  { code: 'requirements:write', module: 'Requirements', description: 'Modify shared requirements and overrides' },
  { code: 'media:read', module: 'Media', description: 'View media library and galleries' },
  { code: 'media:write', module: 'Media', description: 'Upload images and manage galleries' },
  { code: 'deadlines:read', module: 'Deadlines', description: 'View application deadlines' },
  { code: 'deadlines:write', module: 'Deadlines', description: 'Manage application deadlines' },
  { code: 'verification:read', module: 'Verification', description: 'View verification records' },
  { code: 'verification:write', module: 'Verification', description: 'Update verification status and review records' },
  { code: 'content:read', module: 'Content', description: 'View homepage sections, navigation, and pages' },
  { code: 'content:write', module: 'Content', description: 'Edit homepage sections, navigation, and pages' },
  { code: 'contact:manage', module: 'Contact', description: 'Configure WhatsApp settings and templates' },
  { code: 'inquiries:read_assigned', module: 'Inquiries', description: 'View inquiries assigned to this employee' },
  { code: 'inquiries:read_all', module: 'Inquiries', description: 'View all student inquiries across the consultancy' },
  { code: 'inquiries:write', module: 'Inquiries', description: 'Update inquiry status, notes, and follow-ups' },
  { code: 'inquiries:assign', module: 'Inquiries', description: 'Assign inquiries to employees' },
  { code: 'inquiries:export', module: 'Inquiries', description: 'Export authorized student inquiry data' },
  { code: 'employees:manage', module: 'Employees', description: 'Manage employee accounts, roles, and permissions' },
  { code: 'settings:manage', module: 'Settings', description: 'Manage system and SEO settings' },
  { code: 'audit:read', module: 'Audit', description: 'View administrative audit logs' },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionCode[]> = {
  ADMINISTRATOR: ALL_PERMISSIONS.map((p) => p.code),
  CONTENT_EDITOR: [
    'universities:read',
    'universities:write',
    'programs:read',
    'programs:write',
    'scholarships:read',
    'scholarships:write',
    'requirements:read',
    'requirements:write',
    'media:read',
    'media:write',
    'deadlines:read',
    'deadlines:write',
    'verification:read',
    'verification:write',
    'content:read',
    'content:write',
  ],
  INQUIRY_OFFICER: [
    'universities:read',
    'programs:read',
    'scholarships:read',
    'requirements:read',
    'deadlines:read',
    'inquiries:read_assigned',
    'inquiries:write',
  ],
};

export interface AuthenticatedActor {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
}

export function hasPermission(actor: AuthenticatedActor | null | undefined, requiredPermission: PermissionCode): boolean {
  if (!actor || !actor.isActive) return false;
  if (actor.roles.includes('ADMINISTRATOR')) return true;
  return actor.permissions.includes(requiredPermission);
}

export function hasAnyPermission(actor: AuthenticatedActor | null | undefined, requiredPermissions: PermissionCode[]): boolean {
  if (!actor || !actor.isActive) return false;
  if (actor.roles.includes('ADMINISTRATOR')) return true;
  return requiredPermissions.some((p) => actor.permissions.includes(p));
}

/**
 * Checks whether an employee is allowed to access a specific student inquiry record.
 * Enforces Section 14.5 & Section 16:
 * - Administrators or employees with `inquiries:read_all` may access all inquiries.
 * - Inquiry Officers with only `inquiries:read_assigned` may only access inquiries assigned to them.
 * - Content Editors without inquiry permissions cannot access any student inquiry.
 */
export function canAccessInquiryRecord(
  actor: AuthenticatedActor | null | undefined,
  inquiry: { assignedEmployeeId?: string | null }
): boolean {
  if (!actor || !actor.isActive) return false;
  if (hasPermission(actor, 'inquiries:read_all')) return true;
  if (hasPermission(actor, 'inquiries:read_assigned')) {
    return Boolean(inquiry.assignedEmployeeId && inquiry.assignedEmployeeId === actor.id);
  }
  return false;
}
