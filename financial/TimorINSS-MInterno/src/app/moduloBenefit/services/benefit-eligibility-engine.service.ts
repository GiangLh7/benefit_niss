/**
 * Benefit Eligibility Engine Service
 *
 * Centralized service for determining eligibility and calculating benefits
 * for all benefit types (Old-Age, Disability, Survivor, etc.)
 *
 * This service ensures:
 * - Consistent eligibility rules across the application
 * - Easy testing of business logic
 * - Separation of concerns (business logic vs UI)
 */

import { Injectable } from '@angular/core';
import { EmploymentSector } from '../constants/eligibility.constants';
import {
  calculateAge,
  calculateMinimumContributionMonths,
  getMinimumRetirementAge,
  hasSufficientContribution,
  isEligibleForNormalRetirement,
} from '../utils/eligibility.utils';

/**
 * Input data for eligibility check
 */
export interface EligibilityInput {
  dateOfBirth: string;
  contributionMonths: number;
  employmentSector: EmploymentSector;
  currentYear?: number;
  referenceRemuneration?: number; // R - Average of 12 highest months
}

/**
 * Old-Age Pension Eligibility Result
 */
export interface OldAgePensionEligibilityResult {
  eligible: boolean;
  isEarlyRetirement: boolean;
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
  minimumGuaranteedPension?: number; // For early retirement (1.5 × SAII)
  finalPension: number; // Max of calculated and minimum guaranteed
  formula: string;
}

@Injectable({
  providedIn: 'root',
})
export class BenefitEligibilityEngineService {
  /**
   * Check Old-Age Pension Eligibility
   * Includes both normal retirement and early retirement validation
   */
  checkOldAgePensionEligibility(
    input: EligibilityInput
  ): OldAgePensionEligibilityResult {
    const currentYear = input.currentYear || new Date().getFullYear();
    const requiredMonths = calculateMinimumContributionMonths(currentYear);
    const requiredAge = getMinimumRetirementAge(input.employmentSector);
    const age = calculateAge(input.dateOfBirth);
    const sector = input.employmentSector;

    const requiredYears = Math.floor(requiredMonths / 12);
    const remainingMonths = requiredMonths % 12;
    let contributionText = `${requiredYears} years`;
    if (remainingMonths > 0) {
      contributionText += ` ${remainingMonths} months`;
    }

    const sectorLabel =
      sector === EmploymentSector.PUBLIC ? 'Public Sector' : 'Private Sector';

    // Check contribution requirement
    if (input.contributionMonths < requiredMonths) {
      const actualYears = Math.floor(input.contributionMonths / 12);
      const actualMonths = input.contributionMonths % 12;

      return {
        eligible: false,
        isEarlyRetirement: false,
        rejectionReason: 'contribution',
        requiredContributionMonths: requiredMonths,
        requiredAge,
        currentAge: age.years,
        currentContributionMonths: input.contributionMonths,
        message: `This citizen does NOT meet the minimum contribution requirement for Old-Age Pension.`,
        suggestions: [
          `Continue contributing until reaching ${requiredMonths} months`,
          age.years >= 55 &&
          age.years < 60 &&
          sector === EmploymentSector.PRIVATE
            ? 'You may be eligible for early retirement (age 55-59, private sector)'
            : 'Consider early retirement options when eligible',
          'Apply for non-contributory benefits (if eligible)',
        ],
      };
    }

    // Check if eligible for normal retirement (age >= required age)
    if (age.years >= requiredAge) {
      return {
        eligible: true,
        isEarlyRetirement: false,
        requiredContributionMonths: requiredMonths,
        requiredAge,
        currentAge: age.years,
        currentContributionMonths: input.contributionMonths,
        message: `Eligible for normal retirement. Age requirement (${requiredAge} years) and contribution requirement (${contributionText}) are both met.`,
        suggestions: [],
      };
    }

    // Check if eligible for early retirement (private sector only, age 55-59)
    if (
      sector === EmploymentSector.PRIVATE &&
      age.years >= 55 &&
      age.years < 60
    ) {
      return {
        eligible: true,
        isEarlyRetirement: true,
        requiredContributionMonths: requiredMonths,
        requiredAge,
        currentAge: age.years,
        currentContributionMonths: input.contributionMonths,
        message: `Eligible for early retirement (age ${age.years} years, range 55-59). Contribution requirement (${contributionText}) is met.`,
        suggestions: [],
      };
    }

    // Not eligible - age too low and not in early retirement range
    const ageErrorMessage =
      sector === EmploymentSector.PRIVATE
        ? `${requiredAge} years (or 55-59 for early retirement)`
        : `${requiredAge} years`;

    return {
      eligible: false,
      isEarlyRetirement: false,
      rejectionReason: 'age',
      requiredContributionMonths: requiredMonths,
      requiredAge,
      currentAge: age.years,
      currentContributionMonths: input.contributionMonths,
      message: `This citizen does NOT meet the age requirement for Old-Age Pension.`,
      suggestions: [
        `Apply when reaching ${requiredAge} years old`,
        sector === EmploymentSector.PRIVATE && age.years < 55
          ? 'Early retirement available from age 55 (private sector only)'
          : sector === EmploymentSector.PUBLIC
          ? 'Public sector employees cannot retire early'
          : 'Continue working to increase future pension amount',
        'Continue working to increase future pension amount',
      ],
    };
  }

  /**
   * Check Disability Pension Eligibility (contribution only)
   * Disability level validation is done in the UI component
   */
  checkDisabilityPensionEligibility(
    input: EligibilityInput
  ): DisabilityPensionEligibilityResult {
    const currentYear = input.currentYear || new Date().getFullYear();

    // Calculate minimum contribution based on year for disability pension
    // 2017: 12 months, 2018-2024: +6 months each year, 2025: 66 months, 2026+: +6 months each year
    let requiredMonths = 60; // Default for 2025+
    if (currentYear === 2017) {
      requiredMonths = 12;
    } else if (currentYear >= 2018 && currentYear < 2025) {
      requiredMonths = 12 + (currentYear - 2017) * 6;
    } else if (currentYear === 2025) {
      requiredMonths = 78; // 2025: 78 months
    } else if (currentYear > 2025) {
      // 2026+: Continue increasing by 6 months per year from 2025 base
      requiredMonths = 78 + (currentYear - 2025) * 6;
    }

    // Check contribution requirement
    if (input.contributionMonths < requiredMonths) {
      const actualYears = Math.floor(input.contributionMonths / 12);
      const actualMonths = input.contributionMonths % 12;
      const requiredYears = Math.floor(requiredMonths / 12);

      return {
        eligible: false,
        rejectionReason: 'contribution',
        requiredContributionMonths: requiredMonths,
        currentContributionMonths: input.contributionMonths,
        message: `This citizen does NOT meet the minimum contribution requirement for Disability Pension.`,
        suggestions: [
          `Continue contributing until reaching ${requiredMonths} months`,
          'Apply for non-contributory benefits (if eligible)',
          'Note: Disability pension does not have age requirement',
        ],
      };
    }

    return {
      eligible: true,
      requiredContributionMonths: requiredMonths,
      currentContributionMonths: input.contributionMonths,
      message: `Eligible for Disability Pension (contribution requirement met). Disability level will be assessed separately.`,
      suggestions: [],
    };
  }

  /**
   * Check Survivor Pension Eligibility (contribution only)
   */
  checkSurvivorPensionEligibility(
    input: EligibilityInput
  ): SurvivorPensionEligibilityResult {
    const MINIMUM_CONTRIBUTION_MONTHS = 60; // For 2025
    const currentYear = input.currentYear || new Date().getFullYear();

    // Calculate minimum contribution based on year
    // 2017: 12 months, 2018-2024: +6 months each year, 2025+: 60 months
    let requiredMonths = MINIMUM_CONTRIBUTION_MONTHS;
    if (currentYear === 2017) {
      requiredMonths = 12;
    } else if (currentYear >= 2018 && currentYear < 2025) {
      requiredMonths = 12 + (currentYear - 2017) * 6;
    }

    // Check contribution requirement
    if (input.contributionMonths < requiredMonths) {
      const actualYears = Math.floor(input.contributionMonths / 12);
      const actualMonths = input.contributionMonths % 12;
      const requiredYears = Math.floor(requiredMonths / 12);

      return {
        eligible: false,
        rejectionReason: 'contribution',
        requiredContributionMonths: requiredMonths,
        currentContributionMonths: input.contributionMonths,
        message: `This citizen does NOT meet the minimum contribution requirement for Survivor Pension.`,
        suggestions: [
          `Continue contributing until reaching ${requiredMonths} months`,
          'Apply for non-contributory benefits (if eligible)',
        ],
      };
    }

    return {
      eligible: true,
      requiredContributionMonths: requiredMonths,
      currentContributionMonths: input.contributionMonths,
      message: `Eligible for Survivor Pension (contribution requirement met).`,
      suggestions: [],
    };
  }

  /**
   * Calculate Old-Age Pension
   * Formula: P = R × (N / 360)
   *
   * For early retirement: Minimum guaranteed = 1.5 × SAII
   * Final pension = Max(calculated, minimum guaranteed)
   */
  calculateOldAgePension(
    referenceRemuneration: number, // R - Average of 12 highest months
    contributionMonths: number, // N
    isEarlyRetirement: boolean = false,
    saiiAmount: number = 100 // SAII - Subsídio de Apoio a Idosos e Inválidos (default $100)
  ): PensionCalculationResult {
    // Calculate pension: P = R × (N / 360)
    const calculatedPension =
      (referenceRemuneration * contributionMonths) / 360;

    let minimumGuaranteedPension: number | undefined;
    let finalPension = calculatedPension;

    // For early retirement, apply minimum guaranteed pension
    if (isEarlyRetirement) {
      minimumGuaranteedPension = 1.5 * saiiAmount;
      finalPension = Math.max(calculatedPension, minimumGuaranteedPension);
    }

    return {
      calculatedPension,
      referenceRemuneration,
      contributionMonths,
      minimumGuaranteedPension,
      finalPension,
      formula: `P = R × (N / 360) = $${referenceRemuneration.toFixed(
        2
      )} × (${contributionMonths} / 360) = $${calculatedPension.toFixed(
        2
      )}/month${
        isEarlyRetirement &&
        minimumGuaranteedPension &&
        finalPension > calculatedPension
          ? ` (guaranteed minimum: $${minimumGuaranteedPension.toFixed(2)})`
          : ''
      }`,
    };
  }

  /**
   * Calculate Disability Pension
   * Formula: P = R × (N / 360)
   * Same formula as Old-Age Pension
   */
  calculateDisabilityPension(
    referenceRemuneration: number, // R - Average of 12 highest months
    contributionMonths: number, // N
    disabilityLevel: number // 66.67% - 100%
  ): PensionCalculationResult {
    // Calculate pension: P = R × (N / 360)
    const calculatedPension =
      (referenceRemuneration * contributionMonths) / 360;

    return {
      calculatedPension,
      referenceRemuneration,
      contributionMonths,
      finalPension: calculatedPension,
      formula: `P = R × (N / 360) = $${referenceRemuneration.toFixed(
        2
      )} × (${contributionMonths} / 360) = $${calculatedPension.toFixed(
        2
      )}/month`,
    };
  }

  /**
   * Calculate Survivor Pension (Monthly)
   * Formula: Monthly Pension = Deceased's Pension × Percentage
   * Where Deceased's Pension = R × (N / 360)
   * Percentage: 65% (spouse only) or 100% (with children under 24)
   */
  calculateSurvivorMonthlyPension(
    referenceRemuneration: number, // R - Average of 12 highest months
    contributionMonths: number, // N
    percentage: number // 65% or 100%
  ): PensionCalculationResult {
    // Calculate deceased's pension: P = R × (N / 360)
    const deceasedPension = (referenceRemuneration * contributionMonths) / 360;

    // Calculate survivor pension: Monthly Pension = Deceased's Pension × Percentage
    const calculatedPension = (deceasedPension * percentage) / 100;

    return {
      calculatedPension,
      referenceRemuneration,
      contributionMonths,
      finalPension: calculatedPension,
      formula: `Monthly Pension = (R × (N / 360)) × ${percentage}% = ($${referenceRemuneration.toFixed(
        2
      )} × (${contributionMonths} / 360)) × ${percentage}% = $${calculatedPension.toFixed(
        2
      )}/month`,
    };
  }

  /**
   * Calculate Survivor One-Time Subsidy
   * Formula: 3 × R
   */
  calculateSurvivorOneTimeSubsidy(referenceRemuneration: number): number {
    return 3 * referenceRemuneration;
  }

  /**
   * Calculate Survivor Funeral Reimbursement
   * Formula: Actual expenses (max 3 × R)
   */
  calculateSurvivorFuneralReimbursement(
    actualExpenses: number,
    referenceRemuneration: number
  ): number {
    const maxReimbursement = 3 * referenceRemuneration;
    return Math.min(actualExpenses, maxReimbursement);
  }

  /**
   * Get minimum contribution months for a specific year
   */
  getMinimumContributionMonths(year?: number): number {
    return calculateMinimumContributionMonths(year);
  }

  /**
   * Get minimum retirement age for a sector
   */
  getMinimumRetirementAge(sector: EmploymentSector): number {
    return getMinimumRetirementAge(sector);
  }

  /**
   * Check if eligible for early retirement
   */
  isEligibleForEarlyRetirement(input: EligibilityInput): boolean {
    const age = calculateAge(input.dateOfBirth);
    const requiredMonths = this.getMinimumContributionMonths(input.currentYear);

    return (
      input.employmentSector === EmploymentSector.PRIVATE &&
      age.years >= 55 &&
      age.years < 60 &&
      input.contributionMonths >= requiredMonths
    );
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
        const ageErrorMessage =
          input.employmentSector === EmploymentSector.PRIVATE
            ? `${oldAgeResult.requiredAge} years (or 55-59 for early retirement)`
            : `${oldAgeResult.requiredAge} years`;

        return {
          reason: 'age',
          benefitType,
          citizenName,
          citizenNiss,
          sector: sectorLabel,
          currentValue: `${oldAgeResult.currentAge} years`,
          requiredValue: ageErrorMessage,
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
