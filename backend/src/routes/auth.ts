import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';
import { generateToken, requireAuth, AuthUser } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/response';

const authRouter = new Hono();

const loginSchema = z.object({
  username: z.string().min(1, 'กรุณาระบุ Username'),
  password: z.string().min(1, 'กรุณาระบุ Password'),
});

// POST /api/auth/login
authRouter.post('/login', zValidator('json', loginSchema), async (c) => {
  const { username, password } = c.req.valid('json');

  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!user || !user.isActive) {
    return errorResponse(c, 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 401);
  }

  const isPasswordValid = await Bun.password.verify(password, user.passwordHash);
  if (!isPasswordValid) {
    return errorResponse(c, 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 401);
  }

  const authUser: AuthUser = {
    id: user.id,
    username: user.username,
    role: user.role as 'admin' | 'user',
    displayName: user.displayName,
    fullName: user.fullName || user.displayName,
  };

  const token = generateToken(authUser);

  return successResponse(c, {
    token,
    user: authUser,
  }, 'เข้าสู่ระบบสำเร็จ');
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (c) => {
  const user = c.get('user') as AuthUser;
  return successResponse(c, user, 'ดึงข้อมูลโปรไฟล์สำเร็จ');
});

export default authRouter;
