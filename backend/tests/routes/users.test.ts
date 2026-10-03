import { describe, it, expect, beforeAll } from 'bun:test';
import app from '../../src/index';

describe('Users API & Management (Phase 4)', () => {
  let adminToken: string;
  let userToken: string;
  let createdUserId: number;

  beforeAll(async () => {
    // 1. Login as admin
    const adminRes = await app.fetch(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: '123456' }),
      })
    );
    const adminData = await adminRes.json();
    adminToken = adminData.data.token;

    // 2. Login as regular user (kan)
    const userRes = await app.fetch(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'kan', password: '123456' }),
      })
    );
    const userData = await userRes.json();
    userToken = userData.data.token;
  });

  it('GET /api/users should be forbidden for regular user (403)', async () => {
    const res = await app.fetch(
      new Request('http://localhost/api/users', {
        headers: { Authorization: `Bearer ${userToken}` },
      })
    );
    expect(res.status).toBe(403);
  });

  it('GET /api/users should succeed for admin', async () => {
    const res = await app.fetch(
      new Request('http://localhost/api/users', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(2);
    // passwordHash must not be exposed
    expect(body.data[0].passwordHash).toBeUndefined();
  });

  it('POST /api/users should create a new user with displayName and fullName', async () => {
    const testUsername = `user_${Date.now()}`;
    const res = await app.fetch(
      new Request('http://localhost/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          username: testUsername,
          password: 'password123',
          displayName: 'สมศรี มีทรัพย์',
          fullName: 'สมศรี มีทรัพย์ (Operation)',
          role: 'user',
          isActive: true,
        }),
      })
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.displayName).toBe('สมศรี มีทรัพย์');
    expect(body.data.fullName).toBe('สมศรี มีทรัพย์ (Operation)');
    expect(body.data.passwordHash).toBeUndefined();
    createdUserId = body.data.id;
  });

  it('PUT /api/users/:id should update user displayName, fullName, and role', async () => {
    const res = await app.fetch(
      new Request(`http://localhost/api/users/${createdUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          displayName: 'สมศรี เจริญรุ่งเรือง',
          fullName: 'สมศรี เจริญรุ่งเรือง (Supervisor)',
          role: 'admin',
        }),
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.displayName).toBe('สมศรี เจริญรุ่งเรือง');
    expect(body.data.fullName).toBe('สมศรี เจริญรุ่งเรือง (Supervisor)');
    expect(body.data.role).toBe('admin');
  });

  it('DELETE /api/users/:id should delete user and prevent self-deletion', async () => {
    // Attempt self deletion
    const meRes = await app.fetch(
      new Request('http://localhost/api/auth/me', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
    );
    const meData = await meRes.json();
    const adminId = meData.data.id;

    const selfDeleteRes = await app.fetch(
      new Request(`http://localhost/api/users/${adminId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      })
    );
    expect(selfDeleteRes.status).toBe(400);

    // Delete created test user
    const deleteRes = await app.fetch(
      new Request(`http://localhost/api/users/${createdUserId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      })
    );
    expect(deleteRes.status).toBe(200);
  });
});
