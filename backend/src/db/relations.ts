import { relations } from 'drizzle-orm';
import { ports } from './schema/ports';
import { agents } from './schema/agents';
import { categories } from './schema/categories';
import { governmentAgencies } from './schema/governmentAgencies';
import { workTypes } from './schema/workTypes';
import { procedures } from './schema/procedures';
import { procedureVariants } from './schema/procedureVariants';
import { procedureSteps } from './schema/procedureSteps';
import { stepImages } from './schema/stepImages';
import { procedureAgents } from './schema/procedureAgents';
import { procedureGovAgencies } from './schema/procedureGovAgencies';

export const categoriesRelations = relations(categories, ({ many }) => ({
  procedures: many(procedures),
}));

export const governmentAgenciesRelations = relations(governmentAgencies, ({ many }) => ({
  procedures: many(procedures),
  procedureGovAgencies: many(procedureGovAgencies),
}));

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
  category: one(categories, {
    fields: [procedures.categoryId],
    references: [categories.id],
  }),
  port: one(ports, {
    fields: [procedures.portId],
    references: [ports.id],
  }),
  agent: one(agents, {
    fields: [procedures.agentId],
    references: [agents.id],
  }),
  governmentAgency: one(governmentAgencies, {
    fields: [procedures.governmentAgencyId],
    references: [governmentAgencies.id],
  }),
  workType: one(workTypes, {
    fields: [procedures.workTypeId],
    references: [workTypes.id],
  }),
  procedureAgents: many(procedureAgents),
  procedureGovAgencies: many(procedureGovAgencies),
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

export const procedureGovAgenciesRelations = relations(procedureGovAgencies, ({ one }) => ({
  procedure: one(procedures, {
    fields: [procedureGovAgencies.procedureId],
    references: [procedures.id],
  }),
  governmentAgency: one(governmentAgencies, {
    fields: [procedureGovAgencies.governmentAgencyId],
    references: [governmentAgencies.id],
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
