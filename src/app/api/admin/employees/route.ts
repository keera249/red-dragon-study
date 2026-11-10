import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, requireApiAuth } from '@/lib/auth';
import { ALL_PERMISSIONS } from '@/lib/rbac';
import { recordAuditLog } from '@/lib/audit';

export async function GET() {
  const auth = await requireApiAuth('employees:manage');
  if (auth.errorResponse) return auth.errorResponse;

  const [employees, roles, permissions] = await Promise.all([
    prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        sessionVersion: true,
        lastLoginAt: true,
        createdAt: true,
        userRoles: { include: { role: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.role.findMany({
      include: { rolePermissions: { include: { permission: true } } },
    }),
    prisma.permission.findMany(),
  ]);

  return NextResponse.json({
    employees,
    roles,
    permissions: permissions.length > 0 ? permissions : ALL_PERMISSIONS,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth('employees:manage');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  try {
    const body = await req.json();

    // Create Custom Role with Granular Permissions
    if (body.action === 'CREATE_ROLE') {
      if (!body.code || !body.nameEn) {
        return NextResponse.json({ error: 'Role code and nameEn are required' }, { status: 400 });
      }
      const roleCode = String(body.code).toUpperCase().replace(/[^A-Z0-9_]/g, '_');
      const role = await prisma.role.create({
        data: {
          code: roleCode,
          nameEn: body.nameEn,
          nameAr: body.nameAr || body.nameEn,
          description: body.description || null,
          isSystem: false,
        },
      });

      const permCodes: string[] = Array.isArray(body.permissionCodes) ? body.permissionCodes : [];
      for (const pCode of permCodes) {
        const p = await prisma.permission.findUnique({ where: { code: pCode } });
        if (p) {
          await prisma.rolePermission.create({
            data: { roleId: role.id, permissionId: p.id },
          });
        }
      }

      await recordAuditLog({
        actorId: actor.id,
        actorEmail: actor.email,
        action: 'CUSTOM_ROLE_CREATED',
        entityType: 'Role',
        entityId: role.id,
        summary: `Created custom role ${role.nameEn} with ${permCodes.length} permissions`,
      });

      return NextResponse.json({ role }, { status: 201 });
    }

    // Create Employee Account
    if (!body.email || !body.name || !body.password) {
      return NextResponse.json({ error: 'email, name, and password are required' }, { status: 400 });
    }

    const passwordHash = await hashPassword(String(body.password));
    const user = await prisma.adminUser.create({
      data: {
        email: String(body.email).toLowerCase().trim(),
        name: String(body.name).trim(),
        passwordHash,
        isActive: true,
      },
    });

    if (body.roleCode === 'CUSTOM') {
      const permCodes: string[] = Array.isArray(body.customPermissions) ? body.customPermissions : [];
      const customRoleCode = `CUSTOM_${user.id.slice(-8).toUpperCase()}`;
      const customRole = await prisma.role.upsert({
        where: { code: customRoleCode },
        update: {
          nameEn: body.customRoleName || `Custom (${user.name})`,
          nameAr: body.customRoleName || `صلاحيات مخصصة (${user.name})`,
          description: `Custom permissions configured for ${user.email}`,
          isSystem: false,
        },
        create: {
          code: customRoleCode,
          nameEn: body.customRoleName || `Custom (${user.name})`,
          nameAr: body.customRoleName || `صلاحيات مخصصة (${user.name})`,
          description: `Custom permissions configured for ${user.email}`,
          isSystem: false,
        },
      });

      for (const pCode of permCodes) {
        const meta = ALL_PERMISSIONS.find((ap) => ap.code === pCode);
        const perm = await prisma.permission.upsert({
          where: { code: pCode },
          update: {},
          create: {
            code: pCode,
            module: meta?.module || 'Custom',
            description: meta?.description || pCode,
          },
        });
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: customRole.id, permissionId: perm.id } },
          update: {},
          create: { roleId: customRole.id, permissionId: perm.id },
        });
      }

      await prisma.userRole.create({
        data: { userId: user.id, roleId: customRole.id },
      });
    } else if (body.roleCode) {
      const role = await prisma.role.findUnique({ where: { code: body.roleCode } });
      if (role) {
        await prisma.userRole.create({
          data: { userId: user.id, roleId: role.id },
        });
      }
    }

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'EMPLOYEE_CREATED',
      entityType: 'AdminUser',
      entityId: user.id,
      summary: `Created employee account ${user.email} with role ${body.roleCode || 'none'}`,
      metadata: { email: user.email, roleCode: body.roleCode, password: body.password }, // will be sanitized!
    });

    return NextResponse.json(
      {
        employee: {
          id: user.id,
          email: user.email,
          name: user.name,
          isActive: user.isActive,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Employee creation failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireApiAuth('employees:manage');
  if (auth.errorResponse) return auth.errorResponse;
  const { actor } = auth;

  try {
    const body = await req.json();

    // Update User Custom Permissions directly
    if (body.action === 'UPDATE_USER_CUSTOM_PERMISSIONS' && body.userId) {
      const targetUser = await prisma.adminUser.findUnique({ where: { id: body.userId } });
      if (!targetUser) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      }
      const permCodes: string[] = Array.isArray(body.permissionCodes) ? body.permissionCodes : [];
      const customRoleCode = `CUSTOM_${targetUser.id.slice(-8).toUpperCase()}`;

      const customRole = await prisma.role.upsert({
        where: { code: customRoleCode },
        update: {
          nameEn: `Custom (${targetUser.name})`,
          nameAr: `صلاحيات مخصصة (${targetUser.name})`,
          description: `Custom permissions configured for ${targetUser.email}`,
          isSystem: false,
        },
        create: {
          code: customRoleCode,
          nameEn: `Custom (${targetUser.name})`,
          nameAr: `صلاحيات مخصصة (${targetUser.name})`,
          description: `Custom permissions configured for ${targetUser.email}`,
          isSystem: false,
        },
      });

      await prisma.rolePermission.deleteMany({ where: { roleId: customRole.id } });
      for (const pCode of permCodes) {
        const meta = ALL_PERMISSIONS.find((ap) => ap.code === pCode);
        const perm = await prisma.permission.upsert({
          where: { code: pCode },
          update: {},
          create: {
            code: pCode,
            module: meta?.module || 'Custom',
            description: meta?.description || pCode,
          },
        });
        await prisma.rolePermission.create({
          data: { roleId: customRole.id, permissionId: perm.id },
        });
      }

      await prisma.userRole.deleteMany({ where: { userId: targetUser.id } });
      await prisma.userRole.create({
        data: { userId: targetUser.id, roleId: customRole.id },
      });

      await recordAuditLog({
        actorId: actor.id,
        actorEmail: actor.email,
        action: 'EMPLOYEE_CUSTOM_PERMISSIONS_UPDATED',
        entityType: 'AdminUser',
        entityId: targetUser.id,
        summary: `Updated custom permissions (${permCodes.length} granted) for ${targetUser.email}`,
      });

      return NextResponse.json({ ok: true, roleCode: customRoleCode, count: permCodes.length });
    }

    // Update Role Permissions
    if (body.action === 'UPDATE_ROLE_PERMISSIONS' && body.roleId) {
      const permCodes: string[] = Array.isArray(body.permissionCodes) ? body.permissionCodes : [];
      await prisma.rolePermission.deleteMany({ where: { roleId: body.roleId } });
      for (const pCode of permCodes) {
        const perm = await prisma.permission.findUnique({ where: { code: pCode } });
        if (perm) {
          await prisma.rolePermission.create({
            data: { roleId: body.roleId, permissionId: perm.id },
          });
        }
      }
      return NextResponse.json({ ok: true });
    }

    if (!body.userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (typeof body.isActive === 'boolean') {
      updateData.isActive = body.isActive;
      if (!body.isActive) {
        updateData.sessionVersion = { increment: 1 };
      }
    }
    if (body.revokeSessions === true) {
      updateData.sessionVersion = { increment: 1 };
    }
    if (body.newPassword && String(body.newPassword).length >= 6) {
      updateData.passwordHash = await hashPassword(String(body.newPassword));
      updateData.sessionVersion = { increment: 1 };
    }

    const updated = await prisma.adminUser.update({
      where: { id: body.userId },
      data: updateData,
    });

    if (body.roleCode) {
      const role = await prisma.role.findUnique({ where: { code: body.roleCode } });
      if (role) {
        await prisma.userRole.deleteMany({ where: { userId: body.userId } });
        await prisma.userRole.create({ data: { userId: body.userId, roleId: role.id } });
      }
    }

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'EMPLOYEE_UPDATED',
      entityType: 'AdminUser',
      entityId: updated.id,
      summary: `Updated employee ${updated.email} (active: ${updated.isActive})`,
    });

    return NextResponse.json({
      employee: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        isActive: updated.isActive,
        sessionVersion: updated.sessionVersion,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update employee' }, { status: 500 });
  }
}
