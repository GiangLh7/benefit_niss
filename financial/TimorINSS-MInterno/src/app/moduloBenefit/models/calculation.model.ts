/**
 * Calculation Models
 * Models for benefit calculation results from backend
 */

/**
 * Reference Remuneration Calculation Result
 */
export interface ReferenceRemunerationResult {
  niss: string;
  referenceAmount: number; // R - Average of best 120 months
  best120Months: MonthSalary[];
  calculationDate: Date;
  periodCovered: string; // e.g., "2014-2024 (Last 10 years)"
  totalMonthsAnalyzed: number;
}

/**
 * Monthly Salary Record
 */
export interface MonthSalary {
  monthYear: Date;
  salary: number;
  employer: string;
  contributionBase: number;
}

/**
 * Base Benefit Calculation Result
 */
export interface BenefitCalculationResult {
  calculationId: string;
  niss: string;
  benefitType: string;
  benefitAmount: number;
  referenceRemuneration: number; // R
  formula: string;
  breakdown: CalculationBreakdown;
  calculationDate: Date;
  calculatedBy?: string;
  notes?: string;
}

/**
 * Calculation Breakdown (step-by-step)
 */
export interface CalculationBreakdown {
  step1: CalculationStep;
  step2: CalculationStep;
  step3: CalculationStep;
  step4?: CalculationStep;
  finalResult: number;
}

export interface CalculationStep {
  label: string;
  formula?: string;
  value: number;
  description: string;
}

/**
 * Old-Age Pension Calculation
 * Formula: P = (R / N) × Total Months
 */
export interface OldAgePensionCalculation extends BenefitCalculationResult {
  N: number; // Career months (360)
  totalContributionMonths: number;
  monthlyPension: number;
  sector: 'private' | 'public';
  retirementAge: number;
}

/**
 * Survivor Pension Calculation
 * Formula: P = (R / N) × Total Months
 */
export interface SurvivorPensionCalculation extends BenefitCalculationResult {
  N: number; // 360
  totalContributionMonths: number;
  totalPension: number;
  dependentDistributions: DependentDistribution[];
  funeralAllowance: number; // 3 × R
}

export interface DependentDistribution {
  dependentId: string;
  dependentName: string;
  relationship: string;
  percentage: number;
  adjustedPercentage?: number;
  monthlyAmount: number;
}

/**
 * Invalidity (Disability) Pension Calculation
 * Formula: P = (R / N) × Total Months
 */
export interface InvalidityPensionCalculation extends BenefitCalculationResult {
  N: number; // 360
  totalContributionMonths: number;
  paymentType: 'ONE_TIME' | 'MONTHLY';
  laborCapacityReduction: number; // Percentage
  monthlyPension?: number; // For MONTHLY type
  oneTimeAmount?: number; // For ONE_TIME type
}

/**
 * Parental Benefit Calculation
 * Formula: S = R / 180
 */
export interface ParentalBenefitCalculation extends BenefitCalculationResult {
  parentalType: 'MATERNITY' | 'PATERNITY' | 'CLINICAL_RISK' | 'PREGNANCY_INTERRUPTION' | 'ADOPTION';
  dailyBenefit: number; // R / 180
  durationDays: number;
  totalAmount: number;
  startDate: Date;
  endDate: Date;
}

/**
 * Death Benefit Calculation
 * Formula: S = 3 × R
 * R = Average of best 120 months (Article 18, DL 19/2017)
 */
export interface DeathBenefitCalculation extends BenefitCalculationResult {
  oneTimeAmount: number; // 3 × R
  recipientType: 'FAMILY' | 'FUNERAL_PAYER';
  recipientName: string;
  deceasedNISS: string;
  deceasedName: string;
}

/**
 * Calculation Request (to backend)
 */
export interface CalculationRequest {
  niss: string;
  benefitType: string;
  applicationDate: Date;
  sector?: 'private' | 'public';
  additionalParams?: any;
}

/**
 * Old-Age Pension Calculation Request
 */
export interface OldAgePensionCalculationRequest extends CalculationRequest {
  retirementOption: 'NORMAL' | 'HAZARDOUS_INDUSTRY' | 'LABOR_CAPACITY_REDUCTION';
  hazardousIndustry?: string;
  laborCapacityReduction?: number;
}

/**
 * Survivor Pension Calculation Request
 */
export interface SurvivorPensionCalculationRequest extends CalculationRequest {
  deceasedNISS: string;
  dependents: {
    relationship: string;
    percentage: number;
  }[];
}

/**
 * Parental Benefit Calculation Request
 */
export interface ParentalBenefitCalculationRequest extends CalculationRequest {
  parentalType: 'MATERNITY' | 'PATERNITY' | 'CLINICAL_RISK' | 'PREGNANCY_INTERRUPTION' | 'ADOPTION';
  expectedDueDate?: Date;
  birthDate?: Date;
  durationDays?: number;
}

/**
 * Calculation Display Helpers
 */
export class CalculationDisplayHelper {
  /**
   * Format currency
   */
  static formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  /**
   * Format formula for display
   */
  static formatFormula(formula: string, values: { [key: string]: number }): string {
    let formatted = formula;
    Object.keys(values).forEach(key => {
      formatted = formatted.replace(key, values[key].toString());
    });
    return formatted;
  }

  /**
   * Get benefit type label
   */
  static getBenefitTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'old-age-pension': 'Old Age Pension',
      'survivor-pension': 'Survivor\'s Pension',
      'disability-pension': 'Invalidity Pension',
      'maternity': 'Maternity Benefit',
      'paternity': 'Paternity Benefit',
      'death-benefit': 'Death Benefit'
    };
    return labels[type] || type;
  }

  /**
   * Get calculation summary
   */
  static getCalculationSummary(calc: BenefitCalculationResult): string {
    return `${this.getBenefitTypeLabel(calc.benefitType)}: ${this.formatCurrency(calc.benefitAmount)}/month`;
  }
}

