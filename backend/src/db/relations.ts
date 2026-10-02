import { relations } from 'drizzle-orm';
import { ports } from './schema/ports';
import { agents } from './schema/agents';
import { workTypes } from './schema/workTypes';
import { procedures } from './schema/procedures';
import { procedureVariants } from './schema/procedureVariants';
import { procedureSteps } from './schema/procedureSteps';
import { stepImages } from './schema/stepImages';
import { procedureAgents } from './schema/procedureAgents';

export const portsRelations = relations(ports, ({ many }) => ({
  procedures: many(procedures),
}));

export const agentsRelations = relations(agents, ({ many }) => ({
  procedures: many(procedures),
  procedureAgents: many(procedureAgents),
}));

export const workTypesRelations = relations(workTypes, ({ many }) => ({
  procedures: many(procedures),
}));

export const proceduresRelations = relations(procedures, ({ one, many }) => ({
  port: one(ports, {
    fields: [procedures.portId],
    references: [ports.id],
  }),
  agent: one(agents, {
    fields: [procedures.agentId],
    references: [agents.id],
  }),
  workType: one(workTypes, {
    fields: [procedures.workTypeId],
    references: [workTypes.id],
  }),
  procedureAgents: many(procedureAgents),
  variants: many(procedureVariants),
}));

export const procedureAgentsRelations = relations(procedureAgents, ({ one }) => ({
  procedure: one(procedures, {
    fields: [procedureAgents.procedureId],
    references: [procedures.id],
  }),
  agent: one(agents, {
    fields: [procedureAgents.agentId],
    references: [agents.id],
  }),
}));

export const procedureVariantsRelations = relations(procedureVariants, ({ one, many }) => ({
  procedure: one(procedures, {
    fields: [procedureVariants.procedureId],
    references: [procedures.id],
  }),
  steps: many(procedureSteps),
}));

export const procedureStepsRelations = relations(procedureSteps, ({ one, many }) => ({
  variant: one(procedureVariants, {
    fields: [procedureSteps.variantId],
    references: [procedureVariants.id],
  }),
  images: many(stepImages),
}));

export const stepImagesRelations = relations(stepImages, ({ one }) => ({
  step: one(procedureSteps, {
    fields: [stepImages.stepId],
    references: [procedureSteps.id],
  }),
}));
