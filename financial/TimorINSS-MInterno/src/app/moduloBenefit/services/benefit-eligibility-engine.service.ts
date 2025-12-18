/**
 * Benefit Eligibility Engine Service - CORRECTED VERSION
 *
 * Centralized service for determining eligibility and calculating benefits
 * for all benefit types (Old-Age, Disability, Survivor, etc.)
 *
 * This service implements the rules from INSS Benefit Module Presentation
 * Based on Decreto-Lei year 2017 and 2021
 *
 * Key Changes from Original:
 * 1. Removed early retirement (NOT APPLY per presentation)
 * 2. Added Minimum Benefit Level Rules (SP multipliers)
 * 3. Added 10% tax for pensions > $500
 * 4. Added Absolute vs Relative Invalidity distinction
 * 5. Added Non-Contributory Scheme (SAII) calculations
 * 6. Corrected disability pension calculation (4*SP for absolute)
 * 7. Enhanced survivor pension rules
 */

import { Injectable } from '@angular/core';
import { EmploymentSector } from '../constants/eligibility.constants';
import {
  calculateAge,
  calculateMinimumContributionMonths,
  getMinimumRetirementAge,
} from '../utils/eligibility.utils';

// Constants
const SOCIAL_PENSION_BASE = 60; // SP = $60 USD
const TAX_THRESHOLD = 500; // Tax 10% if pension > $500
const TAX_RATE = 0.1; // 10% tax rate

/**
 * Input data for eligibility check
 */
export interface EligibilityInput {
  dateOfBirth: string;
  contributionMonths: number;
  employmentSector: EmploymentSector;
  currentYear?: number;
  referenceRemuneration?: number; // R - Average of best 10 years (120 months)
}

/**
 * Old-Age Pension Eligibility Result
 */
export interface OldAgePensionEligibilityResult {
  eligible: boolean;
  rejectionReason?: 'contribution' | 'age' | null;
  requiredContributionMonths: number;
  requiredAge: number;
  currentAge: number;
  currentContributionMonths: number;
  message: string;
  suggestions: string[];
}

/**
 * Disability Pension Eligibility Result
 */
export interface DisabilityPensionEligibilityResult {
  eligible: boolean;
  disabilityType?: 'absolute' | 'relative' | null;
  rejectionReason?: 'contribution' | null;
  requiredContributionMonths: number;
  currentContributionMonths: number;
  message: string;
  suggestions: string[];
}

/**
 * Survivor Pension Eligibility Result
 */
export interface SurvivorPensionEligibilityResult {
  eligible: boolean;
  rejectionReason?: 'contribution' | null;
  requiredContributionMonths: number;
  currentContributionMonths: number;
  message: string;
  suggestions: string[];
}

/**
 * Pension Calculation Result
 */
export interface PensionCalculationResult {
  calculatedPension: number; // P = R × (N / 360)
  referenceRemuneration: number; // R
  contributionMonths: number; // N
  minimumGuaranteedPension?: number; // Minimum based on contribution period
  taxAmount?: number; // 10% tax if pension > $500
  finalPension: number; // After applying minimum guarantee and tax
  formula: string;
  details?: string; // Additional calculation details
}

/**
 * Non-Contributory SAII Benefit Result
 */
export interface NonContributorySAIIResult {
  eligible: boolean;
  benefitType: 'old-age' | 'invalidity';
  monthlyAmount: number;
  ageGroup?: string; // For old-age: "60-69", "70-79", "80+"
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class BenefitEligibilityEngineService {
  /**
   * Check Old-Age Pension Eligibility (RCSS - Contributory Scheme)
   * 
   * Rules:
   * - Age: 60 years for both private and public sector
   * - Contribution: Progressive from 2017-2032
   *   - 2017-2022: 60 months (5 years)
   *   - 2023-2031: +6 months each year
   *   - 2031: 108 months (9 years)
   *   - 2032+: 10 years (120 months)
   * - Early retirement: NOT APPLY (removed per presentation)
   */
  checkOldAgePensionEligibility(
    input: EligibilityInput
  ): OldAgePensionEligibilityResult {
    const currentYear = input.currentYear || new Date().getFullYear();
    const requiredMonths = this.calculateOldAgeMinimumContribution(currentYear);
    const requiredAge = 60; // Both sectors
    const age = calculateAge(input.dateOfBirth);

    const requiredYears = Math.floor(requiredMonths / 12);
    const remainingMonths = requiredMonths % 12;
    let contributionText = `${requiredYears} years`;
    if (remainingMonths > 0) {
      contributionText += ` ${remainingMonths} months`;
    }

    // Check contribution requirement
    if (input.contributionMonths < requiredMonths) {
      return {
        eligible: false,
        rejectionReason: 'contribution',
        requiredContributionMonths: requiredMonths,
        requiredAge,
        currentAge: age.years,
        currentContributionMonths: input.contributionMonths,
        message: `This citizen does NOT meet the minimum contribution requirement for Old-Age Pension.`,
        suggestions: [
          `Continue contributing until reaching ${contributionText} (${requiredMonths} months)`,
          'Apply for non-contributory SAII benefits if aged 60+ (Social Pension)',
        ],
      };
    }

    // Check age requirement (60 years for both sectors)
    if (age.years < requiredAge) {
      return {
        eligible: false,
        rejectionReason: 'age',
        requiredContributionMonths: requiredMonths,
        requiredAge,
        currentAge: age.years,
        currentContributionMonths: input.contributionMonths,
        message: `This citizen does NOT meet the age requirement for Old-Age Pension.`,
        suggestions: [
          `Apply when reaching ${requiredAge} years old`,
          'Continue working to increase future pension amount',
        ],
      };
    }

    // Eligible for normal retirement
    return {
      eligible: true,
      requiredContributionMonths: requiredMonths,
      requiredAge,
      currentAge: age.years,
      currentContributionMonths: input.contributionMonths,
      message: `Eligible for Old-Age Pension. Age requirement (${requiredAge} years) and contribution requirement (${contributionText}) are both met.`,
      suggestions: [],
    };
  }

  /**
   * Calculate minimum contribution for Old-Age Pension
   * 
   * Rules:
   * - 2017-2022: 60 months (5 years)
   * - 2023: 66 months; 2024: 72 months; ... (add 6 months each year)
   * - 2031: 108 months (9 years)
   * - 2032+: 120 months (10 years)
   */
  private calculateOldAgeMinimumContribution(year: number): number {
    if (year <= 2022) {
      return 60; // 5 years
    } else if (year >= 2023 && year <= 2031) {
      return 60 + (year - 2022) * 6;
    } else {
      return 120; // 10 years from 2032 onwards
    }
  }

  /**
   * Check Disability Pension Eligibility (RCSS - Contributory Scheme)
   * 
   * Rules for ABSOLUTE INVALIDITY:
   * - 2017: 12 months (1 year)
   * - 2018-2025: +6 months each year
   *   - 2018: 18 months; 2019: 24 months; 2020: 30 months; 2021: 36 months
   * - 2026+: 60 months (5 years)
   * - If contribution >= minimum: Apply 4*SP ($240)
   * - If contribution < minimum: Apply Non-Contributory Scheme (SAII)
   * 
   * RELATIVE INVALIDITY (3 years):
   * - Employer pays max 1/3 of salary
   * - INSS pays the remaining amount based on monthly salary
   * - System checks latest salary
   */
  checkDisabilityPensionEligibility(
    input: EligibilityInput,
    disabilityType: 'absolute' | 'relative' = 'absolute'
  ): DisabilityPensionEligibilityResult {
    const currentYear = input.currentYear || new Date().getFullYear();
    const requiredMonths = this.calculateDisabilityMinimumContribution(currentYear);

    // Check contribution requirement
    if (input.contributionMonths < requiredMonths) {
      return {
        eligible: false,
        disabilityType,
        rejectionReason: 'contribution',
        requiredContributionMonths: requiredMonths,
        currentContributionMonths: input.contributionMonths,
        message: `This citizen does NOT meet the minimum contribution requirement for Disability Pension (${disabilityType}).`,
        suggestions: [
          `Continue contributing until reaching ${requiredMonths} months`,
          'Apply for non-contributory SAII Invalidity Pension (if aged 15+ and permanently incapacitated)',
        ],
      };
    }

    return {
      eligible: true,
      disabilityType,
      requiredContributionMonths: requiredMonths,
      currentContributionMonths: input.contributionMonths,
      message: `Eligible for ${disabilityType === 'absolute' ? 'Absolute' : 'Relative'} Invalidity Pension (contribution requirement met).`,
      suggestions: [],
    };
  }

  /**
   * Calculate minimum contribution for Disability Pension
   * 
   * Rules:
   * - 2017: 12 months
   * - 2018-2025: 12 + (year - 2017) * 6 months
   * - 2026+: 60 months (5 years)
   */
  private calculateDisabilityMinimumContribution(year: number): number {
    if (year === 2017) {
      return 12; // 1 year
    } else if (year >= 2018 && year <= 2025) {
      return 12 + (year - 2017) * 6;
    } else {
      return 60; // 5 years from 2026 onwards
    }
  }

  /**
   * Check Survivor Pension Eligibility (RCSS - Contributory Scheme)
   * 
   * Rules:
   * - Same as Disability Pension
   * - 2017: 12 months
   * - 2018-2025: +6 months each year
   * - 2026+: 60 months (5 years)
   */
  checkSurvivorPensionEligibility(
    input: EligibilityInput
  ): SurvivorPensionEligibilityResult {
    const currentYear = input.currentYear || new Date().getFullYear();
    const requiredMonths = this.calculateDisabilityMinimumContribution(currentYear);

    if (input.contributionMonths < requiredMonths) {
      return {
        eligible: false,
        rejectionReason: 'contribution',
        requiredContributionMonths: requiredMonths,
        currentContributionMonths: input.contributionMonths,
        message: `The deceased does NOT meet the minimum contribution requirement for Survivor Pension.`,
        suggestions: [
          `Deceased needed ${requiredMonths} months of contribution`,
          'No non-contributory survivor benefits available',
        ],
      };
    }

    return {
      eligible: true,
      requiredContributionMonths: requiredMonths,
      currentContributionMonths: input.contributionMonths,
      message: `Eligible for Survivor Pension (deceased's contribution requirement met).`,
      suggestions: [],
    };
  }

  /**
   * Calculate Old-Age Pension (RCSS - Contributory Scheme)
   * 
   * Formula: P = R × (N / 360)
   * Where:
   * - P = Monthly Pension Value
   * - R = Reference Remuneration (average of BEST 10 years = 120 months)
   * - N = Number of months of contribution (max 360 months = 30 years)
   * 
   * Minimum Benefit Level Rules:
   * - < 60 months (5 years): 1 × SP = $60
   * - 60-120 months (5-10 years): 2 × SP = $120
   * - 121-240 months (10-20 years): 3 × SP = $180
   * - 241-360 months (20-30 years): 4 × SP = $240
   * 
   * Tax Rule:
   * - If P > $500: Tax 10% on the amount above $500
   * - Example: P = $600 → Tax = 10% of $100 = $10 → Final = $590
   */
  calculateOldAgePension(
    referenceRemuneration: number, // R - Average of best 10 years (120 months)
    contributionMonths: number // N (max 360)
  ): PensionCalculationResult {
    // Ensure N doesn't exceed 360 months (30 years)
    const effectiveMonths = Math.min(contributionMonths, 360);

    // Calculate pension: P = R × (N / 360)
    const calculatedPension = (referenceRemuneration * effectiveMonths) / 360;

    // Apply Minimum Benefit Level Rules
    const minimumGuaranteedPension = this.calculateMinimumBenefitLevel(effectiveMonths);
    
    // Take the higher of calculated or minimum guaranteed
    let pensionBeforeTax = Math.max(calculatedPension, minimumGuaranteedPension);

    // Apply 10% tax if pension > $500
    let taxAmount = 0;
    let finalPension = pensionBeforeTax;
    
    if (pensionBeforeTax > TAX_THRESHOLD) {
      const taxableAmount = pensionBeforeTax - TAX_THRESHOLD;
      taxAmount = taxableAmount * TAX_RATE;
      finalPension = pensionBeforeTax - taxAmount;
    }

    let details = `Calculated: $${calculatedPension.toFixed(2)}`;
    if (pensionBeforeTax > calculatedPension) {
      details += ` → Minimum Guaranteed: $${minimumGuaranteedPension.toFixed(2)} (${this.getMinimumMultiplierText(effectiveMonths)})`;
    }
    if (taxAmount > 0) {
      details += ` → Tax: -$${taxAmount.toFixed(2)} (10% on amount above $500)`;
    }

    return {
      calculatedPension,
      referenceRemuneration,
      contributionMonths: effectiveMonths,
      minimumGuaranteedPension,
      taxAmount,
      finalPension,
      formula: `P = R × (N / 360) = $${referenceRemuneration.toFixed(2)} × (${effectiveMonths} / 360) = $${calculatedPension.toFixed(2)}/month`,
      details,
    };
  }

  /**
   * Calculate Minimum Benefit Level based on contribution months
   * 
   * Rules:
   * - < 60 months: 1 × SP = $60
   * - 60-120 months: 2 × SP = $120
   * - 121-240 months: 3 × SP = $180
   * - 241-360 months: 4 × SP = $240
   */
  private calculateMinimumBenefitLevel(contributionMonths: number): number {
    if (contributionMonths < 60) {
      return 1 * SOCIAL_PENSION_BASE; // $60
    } else if (contributionMonths >= 60 && contributionMonths <= 120) {
      return 2 * SOCIAL_PENSION_BASE; // $120
    } else if (contributionMonths >= 121 && contributionMonths <= 240) {
      return 3 * SOCIAL_PENSION_BASE; // $180
    } else {
      return 4 * SOCIAL_PENSION_BASE; // $240
    }
  }

  /**
   * Get text description of minimum multiplier
   */
  private getMinimumMultiplierText(contributionMonths: number): string {
    if (contributionMonths < 60) {
      return '1 × SP';
    } else if (contributionMonths >= 60 && contributionMonths <= 120) {
      return '2 × SP';
    } else if (contributionMonths >= 121 && contributionMonths <= 240) {
      return '3 × SP';
    } else {
      return '4 × SP';
    }
  }

  /**
   * Calculate Disability Pension (RCSS - Contributory Scheme)
   * 
   * For ABSOLUTE INVALIDITY:
   * - Fixed amount: 4 × SP = $240 USD/month
   * - No formula calculation needed
   * 
   * For RELATIVE INVALIDITY (3 years):
   * - Based on monthly salary from employer
   * - Employer pays max 1/3 of salary
   * - INSS pays the rest
   * - Example: Salary $600/month
   *   - Employer pays: max 1/3 × $600 = $200
   *   - INSS pays: $600 - $200 = $400
   */
  calculateDisabilityPension(
    disabilityType: 'absolute' | 'relative',
    monthlySalary?: number, // Required for relative invalidity
    employerPayment?: number // Required for relative invalidity
  ): PensionCalculationResult {
    if (disabilityType === 'absolute') {
      // Absolute invalidity: 4 × SP = $240
      const finalPension = 4 * SOCIAL_PENSION_BASE;
      
      return {
        calculatedPension: finalPension,
        referenceRemuneration: 0,
        contributionMonths: 0,
        finalPension,
        formula: `Absolute Invalidity Pension = 4 × SP = 4 × $${SOCIAL_PENSION_BASE} = $${finalPension}/month`,
        details: 'Fixed benefit for absolute invalidity, regardless of contribution amount',
      };
    } else {
      // Relative invalidity: Based on salary
      if (!monthlySalary || !employerPayment) {
        throw new Error('Monthly salary and employer payment are required for relative invalidity');
      }

      const maxEmployerPayment = monthlySalary / 3;
      const actualEmployerPayment = Math.min(employerPayment, maxEmployerPayment);
      const inssPayment = monthlySalary - actualEmployerPayment;

      return {
        calculatedPension: inssPayment,
        referenceRemuneration: monthlySalary,
        contributionMonths: 0,
        finalPension: inssPayment,
        formula: `INSS Payment = Monthly Salary - Employer Payment = $${monthlySalary.toFixed(2)} - $${actualEmployerPayment.toFixed(2)} = $${inssPayment.toFixed(2)}/month`,
        details: `Employer pays max 1/3 of salary ($${maxEmployerPayment.toFixed(2)}). INSS pays the rest. Valid for 3 years with periodic verification.`,
      };
    }
  }

  /**
   * Calculate Survivor Pension - ONE TIME PAYMENT (Lump Sum)
   * 
   * Formula: Subsidy = 3 × R
   * Where R = Reference Remuneration (average of best 10 years)
   * 
   * Rules:
   * - If worker has spouse → spouse gets it
   * - If no spouse → Uncle, father, etc. can get it
   * - Amount depends on contribution
   */
  calculateSurvivorOneTimeSubsidy(referenceRemuneration: number): number {
    return 3 * referenceRemuneration;
  }

  /**
   * Calculate Survivor Pension - MONTHLY PAYMENT
   * 
   * Only applies if they DON'T get the one-time payment
   * 
   * Rules:
   * - Law says: half for spouse, half for children
   * - If no children: spouse gets 65%
   * - If having children: spouse 50%, total children 50%
   *   - BUT INSS doesn't care, only pays to 1 contact point 100%
   *   - The family makes agreement among themselves
   * - If no spouse → children get 100%
   *   - Valid until 18 years old (24 if in education)
   *   - Continues until the last one reaches 24 years old
   * - If 4 children and father dies, all children can receive to their accounts
   * 
   * Formula: Uses deceased's pension = R × (N / 360)
   * Then applies percentage based on family situation
   */
  calculateSurvivorMonthlyPension(
    referenceRemuneration: number,
    contributionMonths: number,
    hasSpouse: boolean,
    hasChildren: boolean
  ): PensionCalculationResult {
    // Calculate deceased's pension: P = R × (N / 360)
    const effectiveMonths = Math.min(contributionMonths, 360);
    const deceasedPension = (referenceRemuneration * effectiveMonths) / 360;

    // Apply minimum benefit level
    const minimumPension = this.calculateMinimumBenefitLevel(effectiveMonths);
    const deceasedPensionWithMinimum = Math.max(deceasedPension, minimumPension);

    // Determine percentage based on family situation
    let percentage: number;
    let description: string;

    if (!hasSpouse && hasChildren) {
      // No spouse, has children: 100% to children
      percentage = 100;
      description = 'Children get 100% (until 18 years old, or 24 if in education)';
    } else if (hasSpouse && !hasChildren) {
      // Has spouse, no children: 65% to spouse
      percentage = 65;
      description = 'Spouse gets 65%';
    } else if (hasSpouse && hasChildren) {
      // Has both: 100% paid to 1 contact point (family decides internally)
      percentage = 100;
      description = 'Spouse 50% + Children 50% = 100% paid to 1 contact point (family agreement)';
    } else {
      // No spouse, no children: Not applicable
      percentage = 0;
      description = 'No eligible survivors';
    }

    const finalPension = (deceasedPensionWithMinimum * percentage) / 100;

    return {
      calculatedPension: deceasedPension,
      referenceRemuneration,
      contributionMonths: effectiveMonths,
      minimumGuaranteedPension: minimumPension,
      finalPension,
      formula: `Survivor Pension = (R × (N / 360)) × ${percentage}% = ($${referenceRemuneration.toFixed(2)} × (${effectiveMonths} / 360)) × ${percentage}%`,
      details: description,
    };
  }

  /**
   * Calculate Non-Contributory SAII Benefit (Social Welfare)
   * 
   * OLD-AGE PENSION (SAII):
   * - Principle: Based on citizenship and need, NOT on contribution history
   * - Eligibility: Citizens aged 60 years and over
   * - Monthly Subsidy:
   *   - 60-69 years old: $60 USD (Basic Rate)
   *   - 70-79 years old: $60 + $20 = $80 USD
   *   - 80 years and over: $60 + $40 = $100 USD
   * 
   * INVALIDITY PENSION (SAII):
   * - Eligibility: Permanently incapacitated citizens aged 15 years and over
   *   with no other stable income
   * - Monthly amount: $60 USD
   */
  calculateNonContributorySAII(
    benefitType: 'old-age' | 'invalidity',
    age?: number // Required for old-age
  ): NonContributorySAIIResult {
    if (benefitType === 'old-age') {
      if (age === undefined) {
        throw new Error('Age is required for old-age SAII calculation');
      }

      if (age < 60) {
        return {
          eligible: false,
          benefitType,
          monthlyAmount: 0,
          message: 'Not eligible for SAII Old-Age Pension. Must be aged 60 years or over.',
        };
      }

      let monthlyAmount: number;
      let ageGroup: string;

      if (age >= 60 && age <= 69) {
        monthlyAmount = 60;
        ageGroup = '60-69';
      } else if (age >= 70 && age <= 79) {
        monthlyAmount = 80;
        ageGroup = '70-79';
      } else {
        // 80+
        monthlyAmount = 100;
        ageGroup = '80+';
      }

      return {
        eligible: true,
        benefitType,
        monthlyAmount,
        ageGroup,
        message: `Eligible for SAII Old-Age Pension. Age group: ${ageGroup} years. Monthly benefit: $${monthlyAmount} USD.`,
      };
    } else {
      // Invalidity
      return {
        eligible: true,
        benefitType,
        monthlyAmount: 60,
        message: 'Eligible for SAII Invalidity Pension. Monthly benefit: $60 USD (for permanently incapacitated citizens aged 15+ with no stable income).',
      };
    }
  }

  /**
   * Get minimum contribution months for a specific year
   */
  getMinimumContributionMonths(
    benefitType: 'old-age' | 'disability' | 'survivor',
    year?: number
  ): number {
    const currentYear = year || new Date().getFullYear();
    
    if (benefitType === 'old-age') {
      return this.calculateOldAgeMinimumContribution(currentYear);
    } else {
      // Disability and Survivor use the same progression
      return this.calculateDisabilityMinimumContribution(currentYear);
    }
  }

  /**
   * Get minimum retirement age
   */
  getMinimumRetirementAge(): number {
    return 60; // Both sectors
  }

  /**
   * Get rejection data for UI display
   */
  getRejectionData(
    benefitType: 'old-age' | 'disability' | 'survivor',
    input: EligibilityInput,
    citizenName: string,
    citizenNiss: string
  ): {
    reason: 'contribution' | 'age';
    benefitType: 'old-age' | 'disability' | 'survivor';
    citizenName: string;
    citizenNiss: string;
    sector: string;
    currentValue: string;
    requiredValue: string;
    suggestions: string[];
  } | null {
    let result:
      | OldAgePensionEligibilityResult
      | DisabilityPensionEligibilityResult
      | SurvivorPensionEligibilityResult
      | null = null;

    if (benefitType === 'old-age') {
      result = this.checkOldAgePensionEligibility(input);
    } else if (benefitType === 'disability') {
      result = this.checkDisabilityPensionEligibility(input);
    } else if (benefitType === 'survivor') {
      result = this.checkSurvivorPensionEligibility(input);
    }

    if (!result || result.eligible) {
      return null;
    }

    const sectorLabel =
      input.employmentSector === EmploymentSector.PUBLIC
        ? 'Public Sector'
        : 'Private Sector';

    if (benefitType === 'old-age') {
      const oldAgeResult = result as OldAgePensionEligibilityResult;
      if (oldAgeResult.rejectionReason === 'contribution') {
        const actualYears = Math.floor(
          oldAgeResult.currentContributionMonths / 12
        );
        const actualMonths = oldAgeResult.currentContributionMonths % 12;
        const requiredYears = Math.floor(
          oldAgeResult.requiredContributionMonths / 12
        );
        const requiredMonths = oldAgeResult.requiredContributionMonths % 12;
        let requiredText = `${requiredYears} years`;
        if (requiredMonths > 0) {
          requiredText += ` ${requiredMonths} months`;
        }

        return {
          reason: 'contribution',
          benefitType,
          citizenName,
          citizenNiss,
          sector: sectorLabel,
          currentValue: `${actualYears} years ${actualMonths} months (${oldAgeResult.currentContributionMonths} months)`,
          requiredValue: `${requiredText} (for year ${
            input.currentYear || new Date().getFullYear()
          })`,
          suggestions: oldAgeResult.suggestions,
        };
      } else if (oldAgeResult.rejectionReason === 'age') {
        return {
          reason: 'age',
          benefitType,
          citizenName,
          citizenNiss,
          sector: sectorLabel,
          currentValue: `${oldAgeResult.currentAge} years`,
          requiredValue: `${oldAgeResult.requiredAge} years`,
          suggestions: oldAgeResult.suggestions,
        };
      }
    } else {
      // Disability or Survivor
      const otherResult = result as
        | DisabilityPensionEligibilityResult
        | SurvivorPensionEligibilityResult;
      if (otherResult.rejectionReason === 'contribution') {
        const actualYears = Math.floor(
          otherResult.currentContributionMonths / 12
        );
        const actualMonths = otherResult.currentContributionMonths % 12;
        const requiredYears = Math.floor(
          otherResult.requiredContributionMonths / 12
        );

        return {
          reason: 'contribution',
          benefitType,
          citizenName,
          citizenNiss,
          sector: sectorLabel,
          currentValue: `${actualYears} years ${actualMonths} months (${otherResult.currentContributionMonths} months)`,
          requiredValue: `${requiredYears} years 0 months (${
            otherResult.requiredContributionMonths
          } months for ${input.currentYear || new Date().getFullYear()})`,
          suggestions: otherResult.suggestions,
        };
      }
    }

    return null;
  }
}