import { Hono } from 'hono';
import { db } from '../db';
import { ports } from '../db/schema/ports';
import { agents } from '../db/schema/agents';
import { procedures } from '../db/schema/procedures';
import { ilike, or, inArray } from 'drizzle-orm';
import { procedureAgents } from '../db/schema/procedureAgents';
import { requireAuth } from '../middleware/auth';
import { successResponse } from '../utils/response';

const searchRouter = new Hono();

// GET /api/search?q=...
searchRouter.get('/', async (c) => {
  const query = c.req.query('q')?.trim();
  if (!query) {
    return successResponse(c, {
      ports: [],
      agents: [],
      procedures: [],
    });
  }

  const [matchedPorts, matchedAgents] = await Promise.all([
    db.query.ports.findMany({
      where: or(ilike(ports.code, `%${query}%`), ilike(ports.name, `%${query}%`)),
      limit: 10,
    }),
    db.query.agents.findMany({
      where: or(ilike(agents.code, `%${query}%`), ilike(agents.name, `%${query}%`)),
      limit: 10,
    }),
  ]);

  const matchedPortIds = matchedPorts.map((p) => p.id);
  const matchedAgentIds = matchedAgents.map((a) => a.id);

  let agentProcedureIds: number[] = [];
  if (matchedAgentIds.length > 0) {
    const linked = await db.query.procedureAgents.findMany({
      where: inArray(procedureAgents.agentId, matchedAgentIds),
      columns: { procedureId: true },
    });
    agentProcedureIds = linked.map((l) => l.procedureId);
  }

  const procedureConditions: any[] = [
    ilike(procedures.title, `%${query}%`),
    ilike(procedures.description, `%${query}%`),
  ];
  if (matchedPortIds.length > 0) {
    procedureConditions.push(inArray(procedures.portId, matchedPortIds));
  }
  if (matchedAgentIds.length > 0) {
    procedureConditions.push(inArray(procedures.agentId, matchedAgentIds));
  }
  if (agentProcedureIds.length > 0) {
    procedureConditions.push(inArray(procedures.id, agentProcedureIds));
  }

  const matchedProcedures = await db.query.procedures.findMany({
    where: or(...procedureConditions),
    with: {
      port: true,
      agent: true,
      procedureAgents: {
        with: {
          agent: true,
        },
      },
      workType: true,
    },
    limit: 10,
  });

  const formattedProcedures = matchedProcedures.map((p: any) => {
    const directAgents = p.procedureAgents?.map((pa: any) => pa.agent).filter(Boolean) || [];
    if (directAgents.length === 0 && p.agent) {
      directAgents.push(p.agent);
    }
    return {
      ...p,
      agents: directAgents,
    };
  });

  return successResponse(c, {
    ports: matchedPorts,
    agents: matchedAgents,
    procedures: formattedProcedures,
  }, 'ผลการค้นหาข้อมูล');
});

export default searchRouter;
