import { describe, it, expect, beforeAll } from 'bun:test';
import app from '../../src/index';

describe('Ports API & RBAC (Phase 3)', () => {
  let adminToken: string;
  let userToken: string;
  let createdPortId: number;

  beforeAll(async () => {
    // Login admin
    const resAdmin = await app.fetch(new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '123456' }),
    }));
    const bodyAdmin = await resAdmin.json();
    adminToken = bodyAdmin.data.token;

    // Login user (kan)
    const resUser = await app.fetch(new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'kan', password: '123456' }),
    }));
    const bodyUser = await resUser.json();
    userToken = bodyUser.data.token;
  });

  it('GET /api/ports should return ports list with token', async () => {
    const res = await app.fetch(new Request('http://localhost/api/ports', {
      headers: { Authorization: `Bearer ${userToken}` },
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.length).toBeGreaterThanOrEqual(12);
  });

  it('POST /api/ports by role "user" should succeed (user can add)', async () => {
    const res = await app.fetch(new Request('http://localhost/api/ports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        code: 'TEST-PORT-USER',
        name: 'ท่าเรือทดสอบโดย User',
        paymentMethod: 'ออนไลน์',
      }),
    }));

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.code).toBe('TEST-PORT-USER');
    createdPortId = body.data.id;
  });

  it('PUT /api/ports/:id by role "user" should succeed (user can edit)', async () => {
    const res = await app.fetch(new Request(`http://localhost/api/ports/${createdPortId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name: 'ท่าเรือทดสอบแก้ไขโดย User',
      }),
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBe('ท่าเรือทดสอบแก้ไขโดย User');
  });

  it('DELETE /api/ports/:id by role "user" should be FORBIDDEN (403)', async () => {
    const res = await app.fetch(new Request(`http://localhost/api/ports/${createdPortId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }));

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('DELETE /api/ports/:id by role "admin" should SUCCEED (200)', async () => {
    const res = await app.fetch(new Request(`http://localhost/api/ports/${createdPortId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
