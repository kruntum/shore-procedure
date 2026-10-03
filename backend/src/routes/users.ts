import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { users } from '../db/schema/users';
import { eq, desc } from 'drizzle-orm';
import { requireAuth, requireAdmin, AuthUser } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/response';

const usersRouter = new Hono();

const userCreateSchema = z.object({
  username: z
    .string()
    .min(3, 'Username ต้องมีอย่างน้อย 3 ตัวอักษร')
    .max(50, 'Username ไม่เกิน 50 ตัวอักษร')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username ต้องเป็นภาษาอังกฤษ ตัวเลข จุด ขีดกลาง หรือขีดล่างเท่านั้น'),
  password: z.string().min(4, 'Password ต้องมีอย่างน้อย 4 ตัวอักษร'),
  displayName: z.string().min(1, 'กรุณาระบุชื่อที่แสดง (Display Name)'),
  fullName: z.string().optional().nullable(),
  role: z.enum(['admin', 'user']).default('user'),
  isActive: z.boolean().default(true),
});

const userUpdateSchema = z.object({
  username: z
    .string()
    .min(3, 'Username ต้องมีอย่างน้อย 3 ตัวอักษร')
    .max(50, 'Username ไม่เกิน 50 ตัวอักษร')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username ต้องเป็นภาษาอังกฤษ ตัวเลข จุด ขีดกลาง หรือขีดล่างเท่านั้น')
    .optional(),
  password: z.string().min(4, 'Password ต้องมีอย่างน้อย 4 ตัวอักษร').optional().or(z.literal('')),
  displayName: z.string().min(1, 'กรุณาระบุชื่อที่แสดง (Display Name)').optional(),
  fullName: z.string().optional().nullable(),
  role: z.enum(['admin', 'user']).optional(),
  isActive: z.boolean().optional(),
});

// All user management routes require Admin authorization
usersRouter.use('*', requireAuth, requireAdmin);

// GET /api/users - List all users
usersRouter.get('/', async (c) => {
  const allUsers = await db.query.users.findMany({
    columns: {
      id: true,
      username: true,
      displayName: true,
      fullName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: (u, { asc }) => [asc(u.id)],
  });

  return successResponse(c, allUsers, 'ดึงข้อมูลผู้ใช้งานสำเร็จ');
});

// GET /api/users/:id - Get user by ID
usersRouter.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) return errorResponse(c, 'รหัสผู้ใช้งานไม่ถูกต้อง', 400);

  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    columns: {
      id: true,
      username: true,
      displayName: true,
      fullName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) return errorResponse(c, 'ไม่พบผู้ใช้งานที่ระบุ', 404);
  return successResponse(c, user);
});

// POST /api/users - Create new user
usersRouter.post('/', zValidator('json', userCreateSchema), async (c) => {
  const body = c.req.valid('json');

  const existing = await db.query.users.findFirst({
    where: eq(users.username, body.username),
  });

  if (existing) {
    return errorResponse(c, `ชื่อผู้ใช้งาน "${body.username}" มีอยู่ในระบบแล้ว`, 409);
  }

  const passwordHash = await Bun.password.hash(body.password);

  const [newUser] = await db
    .insert(users)
    .values({
      username: body.username,
      passwordHash,
      displayName: body.displayName,
      fullName: body.fullName || body.displayName,
      role: body.role,
      isActive: body.isActive,
    })
    .returning({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      fullName: users.fullName,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    });

  return successResponse(c, newUser, 'เพิ่มผู้ใช้งานใหม่สำเร็จ', 201);
});

// PUT /api/users/:id - Update user
usersRouter.put('/:id', zValidator('json', userUpdateSchema), async (c) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) return errorResponse(c, 'รหัสผู้ใช้งานไม่ถูกต้อง', 400);

  const body = c.req.valid('json');

  const existing = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!existing) {
    return errorResponse(c, 'ไม่พบผู้ใช้งานที่ต้องการแก้ไข', 404);
  }

  // Check username uniqueness if changed
  if (body.username && body.username !== existing.username) {
    const duplicate = await db.query.users.findFirst({
      where: eq(users.username, body.username),
    });
    if (duplicate && duplicate.id !== id) {
      return errorResponse(c, `ชื่อผู้ใช้งาน "${body.username}" มีอยู่ในระบบแล้ว`, 409);
    }
  }

  const updateData: Record<string, any> = {};
  if (body.username !== undefined) updateData.username = body.username;
  if (body.displayName !== undefined) updateData.displayName = body.displayName;
  if (body.fullName !== undefined) updateData.fullName = body.fullName;
  if (body.role !== undefined) updateData.role = body.role;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;

  if (body.password && body.password.trim() !== '') {
    updateData.passwordHash = await Bun.password.hash(body.password);
  }

  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      fullName: users.fullName,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    });

  return successResponse(c, updated, 'แก้ไขข้อมูลผู้ใช้งานสำเร็จ');
});

// DELETE /api/users/:id - Delete user
usersRouter.delete('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) return errorResponse(c, 'รหัสผู้ใช้งานไม่ถูกต้อง', 400);

  const currentUser = c.get('user') as AuthUser;
  if (currentUser && currentUser.id === id) {
    return errorResponse(c, 'ไม่สามารถลบบัญชีผู้ใช้ที่กำลังล็อกอินอยู่ได้', 400);
  }

  const [deleted] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
    });

  if (!deleted) {
    return errorResponse(c, 'ไม่พบผู้ใช้งานที่ต้องการลบ', 404);
  }

  return successResponse(c, deleted, 'ลบผู้ใช้งานสำเร็จ');
});

export default usersRouter;
