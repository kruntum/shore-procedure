export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  displayName: string;
  fullName?: string | null;
  isActive?: boolean;
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
  portId: number;
  agentId?: number;
  agentIds?: number[];
  workTypeId: number;
  title: string;
  description?: string;
  referenceDocuments?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  port?: Port;
  agent?: Agent;
  agents?: Agent[];
  workType?: WorkType;
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

