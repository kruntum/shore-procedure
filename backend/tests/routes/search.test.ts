import { describe, it, expect, beforeAll } from 'bun:test';
import app from '../../src/index';

describe('Search API (Phase 3)', () => {
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

  it('GET /api/search?q=C1C2 should match port and procedure', async () => {
    const res = await app.fetch(new Request('http://localhost/api/search?q=C1C2', {
      headers: { Authorization: `Bearer ${userToken}` },
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.ports.length).toBeGreaterThanOrEqual(1);
    expect(body.data.ports[0].code).toBe('C1C2');
    expect(body.data.procedures.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/search?q=WHL should match agent WHL', async () => {
    const res = await app.fetch(new Request('http://localhost/api/search?q=WHL', {
      headers: { Authorization: `Bearer ${userToken}` },
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.agents.length).toBeGreaterThanOrEqual(1);
    expect(body.data.agents[0].code).toBe('WHL');
  });

  it('GET /api/search?q=EMC should match procedure linked via multi-agent junction', async () => {
    const res = await app.fetch(new Request('http://localhost/api/search?q=EMC', {
      headers: { Authorization: `Bearer ${userToken}` },
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.agents.length).toBeGreaterThanOrEqual(1);
    expect(body.data.procedures.length).toBeGreaterThanOrEqual(1);
    expect(body.data.procedures[0].agents.some((a: any) => a.code === 'EMC')).toBe(true);
  });
});
