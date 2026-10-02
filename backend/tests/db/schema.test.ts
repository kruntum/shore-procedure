import { describe, it, expect } from 'bun:test';
import * as schema from '../../src/db/schema';

describe('Database Schema Definitions (Phase 2)', () => {
  it('should export all 8 table schemas', () => {
    expect(schema.users).toBeDefined();
    expect(schema.ports).toBeDefined();
    expect(schema.agents).toBeDefined();
    expect(schema.workTypes).toBeDefined();
    expect(schema.procedures).toBeDefined();
    expect(schema.procedureVariants).toBeDefined();
    expect(schema.procedureSteps).toBeDefined();
    expect(schema.stepImages).toBeDefined();
  });

  it('users table should have username, passwordHash, and role columns', () => {
    expect(schema.users.username).toBeDefined();
    expect(schema.users.passwordHash).toBeDefined();
    expect(schema.users.role).toBeDefined();
  });

  it('ports table should have paymentMethod and operatingHours columns', () => {
    expect(schema.ports.code).toBeDefined();
    expect(schema.ports.paymentMethod).toBeDefined();
    expect(schema.ports.operatingHours).toBeDefined();
  });
});
