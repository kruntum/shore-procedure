import { describe, it, expect } from 'bun:test';
import { db } from '../../src/db';
import { ports } from '../../src/db/schema/ports';
import { agents } from '../../src/db/schema/agents';
import { users } from '../../src/db/schema/users';
import { workTypes } from '../../src/db/schema/workTypes';
import { procedures } from '../../src/db/schema/procedures';
import { eq } from 'drizzle-orm';

describe('Database Seed Data Verification (Phase 2)', () => {
  it('should have exactly 20 agents', async () => {
    const allAgents = await db.select().from(agents);
    expect(allAgents.length).toBe(20);
  });

  it('should have exactly 12 ports (with A2 and A3 separated)', async () => {
    const allPorts = await db.select().from(ports);
    expect(allPorts.length).toBe(12);

    const portA2 = allPorts.find((p) => p.code === 'A2');
    const portA3 = allPorts.find((p) => p.code === 'A3');

    expect(portA2).toBeDefined();
    expect(portA3).toBeDefined();
    expect(portA2?.id).not.toBe(portA3?.id);
  });

  it('should have admin and kan users with correct roles', async () => {
    const adminUser = await db.query.users.findFirst({ where: eq(users.username, 'admin') });
    const kanUser = await db.query.users.findFirst({ where: eq(users.username, 'kan') });

    expect(adminUser).toBeDefined();
    expect(adminUser?.role).toBe('admin');

    expect(kanUser).toBeDefined();
    expect(kanUser?.role).toBe('user');

    // Test password verification for 123456
    const isPasswordValid = await Bun.password.verify('123456', kanUser!.passwordHash);
    expect(isPasswordValid).toBe(true);
  });

  it('should have 2 work types', async () => {
    const allTypes = await db.select().from(workTypes);
    expect(allTypes.length).toBe(2);
  });

  it('should have the example procedure for C1C2 + WHL with variants and steps', async () => {
    const example = await db.query.procedures.findFirst({
      where: (p, { ilike }) => ilike(p.title, '%C1C2%'),
      with: {
        variants: {
          with: {
            steps: true,
          },
        },
      },
    });

    expect(example).toBeDefined();
    expect(example?.variants.length).toBe(2);
    expect(example?.variants[0].steps.length).toBe(3);
    expect(example?.variants[1].steps.length).toBe(2);
  });
});
