/**
 * Benefit Model
 * Represents a benefit entity in the system
 */
export interface Benefit {
  id?: number;
  name: string;
  description: string;
  type: BenefitType;
  amount: number;
  status: BenefitStatus;
  startDate: Date;
  endDate?: Date;
  beneficiaryId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Benefit Type Enum
 */
export enum BenefitType {
  RETIREMENT = 'RETIREMENT',
  DISABILITY = 'DISABILITY',
  SURVIVOR = 'SURVIVOR',
  MATERNITY = 'MATERNITY',
  SICKNESS = 'SICKNESS',
  UNEMPLOYMENT = 'UNEMPLOYMENT',
  OTHER = 'OTHER'
}

/**
 * Benefit Status Enum
 */
export enum BenefitStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

/**
 * Benefit Request Model
 */
export interface BenefitRequest {
  name: string;
  description: string;
  type: BenefitType;
  amount: number;
  startDate: Date;
  endDate?: Date;
  beneficiaryId: number;
}

/**
 * Benefit Filter Model
 */
export interface BenefitFilter {
  type?: BenefitType;
  status?: BenefitStatus;
  beneficiaryId?: number;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}

/**
 * Contribution History Period Model
 */
export interface ContributionPeriod {
  startYear: number;
  endYear: number;
  company: string;
  years: number;
  months: number;
}

/**
 * Health Status Model
 */
export interface HealthStatus {
  status: string;
  laborCapacityReduction?: number;
}

/**
 * Retirement Option Type
 */
export enum RetirementOptionType {
  NORMAL = 'NORMAL',
  HAZARDOUS_INDUSTRY = 'HAZARDOUS_INDUSTRY',
  LABOR_CAPACITY_REDUCTION = 'LABOR_CAPACITY_REDUCTION'
}

/**
 * Retirement Option Model
 */
export interface RetirementOption {
  type: RetirementOptionType;
  label: string;
  description: string;
  requiredDocuments: string[];
}

/**
 * Hazardous Industry Model
 */
export interface HazardousIndustry {
  id: string;
  name: string;
  description?: string;
}

