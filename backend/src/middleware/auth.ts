import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { errorResponse } from '../utils/response';

export interface AuthUser {
  id: number;
  username: string;
  role: 'admin' | 'user';
  displayName: string;
  fullName?: string | null;
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      fullName: user.fullName || user.displayName,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

export async function requireAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(c, 'กรุณาเข้าสู่ระบบก่อนใช้งาน (Unauthorized)', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret) as AuthUser;
    c.set('user', payload);
    await next();
  } catch (err) {
    return errorResponse(c, 'Session หรือ Token หมดอายุ กรุณาเข้าสู่ระบบใหม่', 401);
  }
}

export async function requireAdmin(c: Context, next: Next) {
  const user = c.get('user') as AuthUser | undefined;
  if (!user) {
    return errorResponse(c, 'ไม่พบข้อมูลสิทธิ์ผู้ใช้งาน', 401);
  }

  if (user.role !== 'admin') {
    return errorResponse(c, 'คุณไม่มีสิทธิ์ในการดำเนินการนี้ (เฉพาะผู้ดูแลระบบ Admin เท่านั้น)', 403);
  }

  await next();
}
