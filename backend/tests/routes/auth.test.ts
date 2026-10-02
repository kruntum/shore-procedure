import { describe, it, expect } from 'bun:test';
import app from '../../src/index';

describe('Auth API Routes (Phase 3)', () => {
  it('POST /api/auth/login should fail with invalid credentials', async () => {
    const res = await app.fetch(new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'wrongpassword' }),
    }));

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('POST /api/auth/login should succeed for admin and return token', async () => {
    const res = await app.fetch(new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '123456' }),
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.token).toBeDefined();
    expect(body.data.user.role).toBe('admin');
  });

  it('POST /api/auth/login should succeed for kan (user role)', async () => {
    const res = await app.fetch(new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'kan', password: '123456' }),
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.user.role).toBe('user');
  });

  it('GET /api/auth/me should return 401 without token', async () => {
    const res = await app.fetch(new Request('http://localhost/api/auth/me'));
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me should return profile with valid token', async () => {
    // 1. Login
    const loginRes = await app.fetch(new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'kan', password: '123456' }),
    }));
    const { data } = await loginRes.json();

    // 2. Fetch profile
    const meRes = await app.fetch(new Request('http://localhost/api/auth/me', {
      headers: { Authorization: `Bearer ${data.token}` },
    }));

    expect(meRes.status).toBe(200);
    const meBody = await meRes.json();
    expect(meBody.data.username).toBe('kan');
  });
});
