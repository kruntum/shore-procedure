import { describe, it, expect, beforeAll } from 'bun:test';
import app from '../../src/index';

describe('Procedures API (Phase 3)', () => {
  let userToken: string;

  beforeAll(async () => {
    const res = await app.fetch(new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'kan', password: '123456' }),
    }));
    const body = await res.json();
    userToken = body.data.token;
  });

  it('GET /api/procedures should return list with nested relations', async () => {
    const res = await app.fetch(new Request('http://localhost/api/procedures', {
      headers: { Authorization: `Bearer ${userToken}` },
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.length).toBeGreaterThanOrEqual(1);

    const proc = body.data.find((p: any) => p.variants && p.variants.length > 0) || body.data[0];
    expect(proc.port).toBeDefined();
    expect(proc.agent).toBeDefined();
    expect(proc.variants).toBeDefined();
    if (proc.variants.length > 0) {
      expect(proc.variants[0].steps).toBeDefined();
    }
  });

  it('POST /api/procedures should allow creating multiple procedures for the same port', async () => {
    // C1C2 is id 3 (or we fetch it from GET /api/procedures)
    const listRes = await app.fetch(new Request('http://localhost/api/procedures', {
      headers: { Authorization: `Bearer ${userToken}` },
    }));
    const listBody = await listRes.json();
    const existing = listBody.data[0];

    const secondProcRes = await app.fetch(new Request('http://localhost/api/procedures', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        portId: existing.portId,
        agentId: existing.agentId,
        workTypeId: existing.workTypeId,
        title: 'คู่มือฉบับที่สองสำหรับท่าเรือเดียวกัน',
      }),
    }));

    expect(secondProcRes.status).toBe(201);
    const body = await secondProcRes.json();
    expect(body.success).toBe(true);
    expect(body.data.portId).toBe(existing.portId);

    // Clean up created procedure
    const adminRes = await app.fetch(new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '123456' }),
    }));
    const adminToken = (await adminRes.json()).data.token;
    await app.fetch(new Request(`http://localhost/api/procedures/${body.data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    }));
  });

  it('PUT /api/procedures/:id should update procedure title and synchronize variants/steps', async () => {
    // Create a temporary procedure
    const createRes = await app.fetch(new Request('http://localhost/api/procedures', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        portId: 1,
        agentId: 2,
        workTypeId: 1,
        title: 'คู่มือทดสอบการแก้ไข',
        description: 'ก่อนแก้ไข',
        variants: [
          {
            conditionName: 'เงื่อนไขทดสอบ',
            executionMethod: 'Web Portal',
            steps: [
              {
                stepNumber: 1,
                title: 'ขั้นตอนที่ 1 เดิม',
                description: 'รายละเอียดเดิม',
              },
            ],
          },
        ],
      }),
    }));

    const createBody = await createRes.json();
    const createdProc = createBody.data;

    const updateRes = await app.fetch(new Request(`http://localhost/api/procedures/${createdProc.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        title: 'คู่มือทดสอบการแก้ไข (อัปเดตแล้ว)',
        description: 'คำอธิบายที่อัปเดตผ่านการทดสอบ',
        variants: [
          {
            id: createdProc.variants[0]?.id,
            conditionName: 'เงื่อนไขทดสอบ (แก้ไข)',
            executionMethod: 'Web Portal',
            cutoffTime: 'ก่อน 16:00 น.',
            steps: [
              {
                id: createdProc.variants[0]?.steps[0]?.id,
                stepNumber: 1,
                title: 'ขั้นตอนที่ 1 (อัปเดตชื่อ)',
                description: 'รายละเอียดขั้นตอน',
                sortOrder: 1,
              },
              {
                stepNumber: 2,
                title: 'ขั้นตอนที่ 2 (เพิ่มใหม่)',
                description: 'รายละเอียดขั้นตอนใหม่',
                sortOrder: 2,
              },
            ],
          },
        ],
      }),
    }));

    expect(updateRes.status).toBe(200);
    const updateBody = await updateRes.json();
    expect(updateBody.success).toBe(true);
    expect(updateBody.data.title).toContain('(อัปเดตแล้ว)');
    expect(updateBody.data.variants[0].steps.length).toBe(2);

    // Clean up created procedure
    const adminRes = await app.fetch(new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '123456' }),
    }));
    const adminToken = (await adminRes.json()).data.token;
    await app.fetch(new Request(`http://localhost/api/procedures/${createdProc.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    }));
  });

  it('GET /api/procedures/meta/roles should return available roles list', async () => {
    const res = await app.fetch(new Request('http://localhost/api/procedures/meta/roles', {
      headers: { Authorization: `Bearer ${userToken}` },
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toContain('พนักงานหน้างาน / ชิปปิ้ง');
    expect(body.data).toContain('เจ้าหน้าที่ท่าเรือ');
  });

  it('Step responsibleRole should be created and updated via CRUD endpoints', async () => {
    const createRes = await app.fetch(new Request('http://localhost/api/procedures', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        portId: 2,
        agentId: 3,
        workTypeId: 1,
        title: 'คู่มือทดสอบ Role',
        variants: [
          {
            conditionName: 'เงื่อนไข Role',
            executionMethod: 'Web Portal',
            steps: [
              {
                stepNumber: 1,
                title: 'ยื่นเอกสาร',
                responsibleRole: 'พนักงานหน้างาน / ชิปปิ้ง',
              },
              {
                stepNumber: 2,
                title: 'ตรวจสอบระบบและลงตรา',
                responsibleRole: 'เจ้าหน้าที่ท่าเรือ',
              },
            ],
          },
        ],
      }),
    }));

    expect(createRes.status).toBe(201);
    const createBody = await createRes.json();
    const proc = createBody.data;
    expect(proc.variants[0].steps[0].responsibleRole).toBe('พนักงานหน้างาน / ชิปปิ้ง');
    expect(proc.variants[0].steps[1].responsibleRole).toBe('เจ้าหน้าที่ท่าเรือ');

    const step2Id = proc.variants[0].steps[1].id;

    // Update step role directly via PUT /api/procedures/steps/:stepId
    const stepUpdateRes = await app.fetch(new Request(`http://localhost/api/procedures/steps/${step2Id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        responsibleRole: 'เจ้าหน้าที่สายเรือ / เอเย่นต์',
      }),
    }));
    expect(stepUpdateRes.status).toBe(200);
    const stepUpdateBody = await stepUpdateRes.json();
    expect(stepUpdateBody.data.responsibleRole).toBe('เจ้าหน้าที่สายเรือ / เอเย่นต์');

    // Clean up
    const adminRes = await app.fetch(new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '123456' }),
    }));
    const adminToken = (await adminRes.json()).data.token;
    await app.fetch(new Request(`http://localhost/api/procedures/${proc.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    }));
  });

  it('POST /api/procedures/:id/duplicate should duplicate procedure with variants and steps', async () => {
    // 1. Get existing procedure 1 (or any existing)
    const listRes = await app.fetch(new Request('http://localhost/api/procedures'));
    expect(listRes.status).toBe(200); // Public access test
    const listBody = await listRes.json();
    const origProc = listBody.data[0];

    // 2. Duplicate it
    const dupRes = await app.fetch(new Request(`http://localhost/api/procedures/${origProc.id}/duplicate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
    }));

    expect(dupRes.status).toBe(201);
    const dupBody = await dupRes.json();
    expect(dupBody.success).toBe(true);
    expect(dupBody.data.title).toContain('(สำเนา)');
    expect(dupBody.data.id).not.toBe(origProc.id);
    expect(dupBody.data.portId).toBe(origProc.portId);

    // 3. Clean up duplicated procedure
    const adminRes = await app.fetch(new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '123456' }),
    }));
    const adminToken = (await adminRes.json()).data.token;
    await app.fetch(new Request(`http://localhost/api/procedures/${dupBody.data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    }));
  });
});

