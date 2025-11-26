/**
 * Survivor Benefit Models
 * Models for survivor's pension (trợ cấp tử tuất)
 */

/**
 * Relationship Type for Dependents
 */
export enum DependentRelationship {
  SPOUSE = 'SPOUSE',         // Vợ/Chồng - 60%
  CHILD = 'CHILD',           // Con cái - 20%
  PARENT = 'PARENT'          // Cha/Mẹ - 10%
}

/**
 * Dependent Information
 */
export interface Dependent {
  id?: string;
  relationship: DependentRelationship;
  fullName: string;
  dateOfBirth: string;
  identificationNumber: string;
  percentage: number;           // Tỷ lệ hưởng (%)
  adjustedPercentage?: number;  // Tỷ lệ sau khi điều chỉnh (nếu tổng > 100%)
}

/**
 * Survivor Benefit Configuration
 */
export interface SurvivorBenefitConfig {
  minimumContributionMonths: number;  // Tối thiểu 12 tháng
  funeralAllowance: number;           // Trợ cấp mai táng
  basePercentages: {
    spouse: number;    // 60%
    child: number;     // 20%
    parent: number;    // 10%
  };
}

/**
 * Default Configuration
 */
export const SURVIVOR_BENEFIT_CONFIG: SurvivorBenefitConfig = {
  minimumContributionMonths: 12,
  funeralAllowance: 0,  // Will be calculated based on base salary
  basePercentages: {
    spouse: 60,
    child: 20,
    parent: 10
  }
};

/**
 * Get default percentage by relationship
 */
export function getDefaultPercentage(relationship: DependentRelationship): number {
  switch (relationship) {
    case DependentRelationship.SPOUSE:
      return SURVIVOR_BENEFIT_CONFIG.basePercentages.spouse;
    case DependentRelationship.CHILD:
      return SURVIVOR_BENEFIT_CONFIG.basePercentages.child;
    case DependentRelationship.PARENT:
      return SURVIVOR_BENEFIT_CONFIG.basePercentages.parent;
    default:
      return 0;
  }
}

/**
 * Calculate adjusted percentages when total exceeds 100%
 */
export function calculateAdjustedPercentages(dependents: Dependent[]): Dependent[] {
  const totalPercentage = dependents.reduce((sum, dep) => sum + dep.percentage, 0);
  
  if (totalPercentage <= 100) {
    return dependents.map(dep => ({
      ...dep,
      adjustedPercentage: dep.percentage
    }));
  }
  
  // Adjust proportionally to ensure total = 100%
  const adjustmentFactor = 100 / totalPercentage;
  return dependents.map(dep => ({
    ...dep,
    adjustedPercentage: Math.round(dep.percentage * adjustmentFactor * 100) / 100
  }));
}

/**
 * Relationship Labels (English)
 */
export const RELATIONSHIP_LABELS: Record<DependentRelationship, string> = {
  [DependentRelationship.SPOUSE]: 'Spouse',
  [DependentRelationship.CHILD]: 'Child',
  [DependentRelationship.PARENT]: 'Parent'
};

