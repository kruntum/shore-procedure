export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  displayName: string;
  fullName?: string | null;
  isActive?: boolean;
  createdAt?: string;
}

export interface Category {
  id: number;
  code: string;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
  procedureCount?: number;
  workflowCount?: number;
  createdAt?: string;
}

export interface JobWorkflowStep {
  id: number;
  workflowId: number;
  title: string;
  briefDescription?: string | null;
  procedureId?: number | null;
  procedureTitle?: string | null;
  governmentAgencyId?: number | null;
  agencyName?: string | null;
  agencyShortName?: string | null;
  portId?: number | null;
  portCode?: string | null;
  portName?: string | null;
  sortOrder: number;
  stepType: string;
  outputs?: string[];
  createdAt?: string;
}

export interface JobWorkflowDependency {
  id: number;
  workflowId: number;
  stepId: number;
  dependsOnStepId: number;
  createdAt?: string;
}

export interface JobWorkflow {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  categoryId?: number | null;
  category?: Category | null;
  status: 'active' | 'draft' | 'archived';
  estimatedDuration?: string | null;
  targetAudience?: string | null;
  createdBy?: string | null;
  stepCount?: number;
  sopReadyCount?: number;
  completionRate?: number;
  steps?: JobWorkflowStep[];
  dependencies?: JobWorkflowDependency[];
  createdAt?: string;
  updatedAt?: string;
}


export interface GovernmentAgency {
  id: number;
  code: string;
  name: string;
  shortName?: string;
  contactInfo?: string;
  website?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Port {
  id: number;
  code: string;
  name: string;
  paymentMethod: string;
  operatingHours: string;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Agent {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
}

export interface WorkType {
  id: number;
  code: string;
  name: string;
}

export interface StepImage {
  id: number;
  stepId: number;
  bucketName: string;
  objectKey: string;
  originalFilename: string;
  caption?: string;
  sortOrder: number;
  createdAt?: string;
}

export interface ProcedureStep {
  id: number;
  variantId: number;
  stepNumber: number;
  title: string;
  description?: string;
  responsibleRole?: string;
  sortOrder: number;
  images?: StepImage[];
}

export interface ProcedureVariant {
  id: number;
  procedureId: number;
  conditionName: string;
  executionMethod: string;
  cutoffTime?: string;
  notes?: string;
  sortOrder: number;
  steps: ProcedureStep[];
}

export interface Procedure {
  id: number;
  categoryId?: number | null;
  category?: Category | null;
  portId?: number | null;
  port?: Port | null;
  agentId?: number | null;
  agent?: Agent | null;
  agentIds?: number[];
  agents?: Agent[];
  governmentAgencyId?: number | null;
  governmentAgency?: GovernmentAgency | null;
  governmentAgencyIds?: number[];
  governmentAgencies?: GovernmentAgency[];
  workTypeId: number;
  workType?: WorkType;
  title: string;
  description?: string;
  referenceDocuments?: string;
  contactHotline?: string | null;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  variants?: ProcedureVariant[];
}

export interface ResponsibleRole {
  id: number;
  code: string;
  name: string;
  color?: string;
  icon?: string;
  description?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}
