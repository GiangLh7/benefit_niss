/**
 * Eligibility Utility Functions
 * Helper functions for calculating and determining eligibility
 */

import { RetirementOption, RetirementOptionType } from '../models/benefit.model';
import { 
  BASE_CONTRIBUTION_MONTHS,
  BASE_PERIOD_END_YEAR,
  MONTHLY_INCREASE_PER_YEAR,
  PROGRESSIVE_END_YEAR,
  MAX_CONTRIBUTION_MONTHS,
  MINIMUM_RETIREMENT_AGE,
  MINIMUM_RETIREMENT_AGE_PRIVATE,
  MINIMUM_RETIREMENT_AGE_PUBLIC,
  MINIMUM_LABOR_CAPACITY_REDUCTION,
  EmploymentSector
} from '../constants/eligibility.constants';

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string): { years: number; months: number; totalMonths: number } {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  
  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }
  
  const totalMonths = years * 12 + months;
  
  return { years, months, totalMonths };
}

/**
 * Format age as string
 */
export function formatAge(years: number, months: number): string {
  return `${years} years ${months} months`;
}

/**
 * Format contribution period as string
 */
export function formatContributionPeriod(years: number, months: number): string {
  return `${years} years ${months} months`;
}

/**
 * Calculate minimum contribution months required based on retirement year
 * 
 * Progressive Guarantee Period (Prazu de garantia):
 * - 2017-2022: 60 months (5 years)
 * - 2023-2031: Increases by 6 months each year
 *   - 2023: 66 months
 *   - 2024: 72 months
 *   - 2025: 78 months
 *   - ...
 *   - 2031: 114 months
 * 
 * @param retirementYear - The year when applying for retirement
 * @returns Minimum contribution months required
 */
export function calculateMinimumContributionMonths(retirementYear?: number): number {
  const year = retirementYear || new Date().getFullYear();
  
  // For years 2017-2022: Base period of 60 months
  if (year <= BASE_PERIOD_END_YEAR) {
    return BASE_CONTRIBUTION_MONTHS;
  }
  
  // For years 2023-2031: Progressive increase
  if (year <= PROGRESSIVE_END_YEAR) {
    const yearsAfterBase = year - BASE_PERIOD_END_YEAR;
    const additionalMonths = yearsAfterBase * MONTHLY_INCREASE_PER_YEAR;
    return BASE_CONTRIBUTION_MONTHS + additionalMonths;
  }
  
  // For years after 2031: Maximum period
  return MAX_CONTRIBUTION_MONTHS;
}

/**
 * Get minimum retirement age based on employment sector
 * 
 * @param sector - Employment sector (private or public)
 * @returns Minimum retirement age
 */
export function getMinimumRetirementAge(sector: EmploymentSector = EmploymentSector.PRIVATE): number {
  return sector === EmploymentSector.PUBLIC 
    ? MINIMUM_RETIREMENT_AGE_PUBLIC 
    : MINIMUM_RETIREMENT_AGE_PRIVATE;
}

/**
 * Check if citizen is eligible for normal retirement
 * 
 * @param contributionMonths - Total contribution months
 * @param ageYears - Current age in years
 * @param sector - Employment sector (private or public)
 * @param retirementYear - Year when applying for retirement
 * @returns True if eligible for normal retirement
 */
export function isEligibleForNormalRetirement(
  contributionMonths: number, 
  ageYears: number,
  sector: EmploymentSector = EmploymentSector.PRIVATE,
  retirementYear?: number
): boolean {
  const requiredMonths = calculateMinimumContributionMonths(retirementYear);
  const requiredAge = getMinimumRetirementAge(sector);
  return contributionMonths >= requiredMonths && ageYears >= requiredAge;
}

/**
 * Check if citizen has sufficient contribution time
 * 
 * @param contributionMonths - Total contribution months
 * @param retirementYear - Year when applying for retirement
 * @returns True if has sufficient contribution
 */
export function hasSufficientContribution(contributionMonths: number, retirementYear?: number): boolean {
  const requiredMonths = calculateMinimumContributionMonths(retirementYear);
  return contributionMonths >= requiredMonths;
}

/**
 * Setup available retirement options based on eligibility criteria
 * 
 * @param normalEligible - Whether eligible for normal retirement
 * @param hazardousAllowed - Whether hazardous industry retirement is allowed
 * @param disabilityAllowed - Whether disability retirement is allowed
 * @param sector - Employment sector (private or public)
 * @param retirementYear - Year when applying for retirement
 * @returns Array of available retirement options
 */
export function setupRetirementOptions(
  normalEligible: boolean,
  hazardousAllowed: boolean,
  disabilityAllowed: boolean,
  sector: EmploymentSector = EmploymentSector.PRIVATE,
  retirementYear?: number
): RetirementOption[] {
  const options: RetirementOption[] = [];
  const requiredMonths = calculateMinimumContributionMonths(retirementYear);
  const requiredYears = Math.floor(requiredMonths / 12);
  const remainingMonths = requiredMonths % 12;
  const requiredAge = getMinimumRetirementAge(sector);
  const sectorLabel = sector === EmploymentSector.PUBLIC ? 'Public Sector' : 'Private Sector';
  
  let contributionText = `${requiredYears} years`;
  if (remainingMonths > 0) {
    contributionText += ` ${remainingMonths} months`;
  }
  
  if (normalEligible) {
    options.push({
      type: RetirementOptionType.NORMAL,
      label: 'Normal Retirement',
      description: `${contributionText} of social security contributions and retirement age (${requiredAge} years old for ${sectorLabel})`,
      requiredDocuments: []
    });
  }
  
  if (hazardousAllowed) {
    options.push({
      type: RetirementOptionType.HAZARDOUS_INDUSTRY,
      label: 'Early Retirement - Hazardous Industry',
      description: 'Working in hazardous or dangerous industries',
      requiredDocuments: ['Hazardous industry certification', 'Employment contract']
    });
  }
  
  if (disabilityAllowed) {
    options.push({
      type: RetirementOptionType.LABOR_CAPACITY_REDUCTION,
      label: 'Early Retirement - Labor Capacity Reduction',
      description: `Labor capacity reduction of ${MINIMUM_LABOR_CAPACITY_REDUCTION}% or more`,
      requiredDocuments: ['Medical examination certificate', 'Labor capacity reduction certificate']
    });
  }
  
  return options;
}

/**
 * Generate eligibility message based on criteria
 * 
 * @param contributionMonths - Total contribution months
 * @param ageYears - Current age in years
 * @param sector - Employment sector (private or public)
 * @param retirementYear - Year when applying for retirement
 * @returns Object with eligible flag and message
 */
export function generateEligibilityMessage(
  contributionMonths: number,
  ageYears: number,
  sector: EmploymentSector = EmploymentSector.PRIVATE,
  retirementYear?: number
): { eligible: boolean; message: string; isEarlyRetirement?: boolean } {
  const year = retirementYear || new Date().getFullYear();
  const requiredMonths = calculateMinimumContributionMonths(year);
  const requiredAge = getMinimumRetirementAge(sector);
  const hasContribution = hasSufficientContribution(contributionMonths, year);
  const hasAge = ageYears >= requiredAge;
  
  const requiredYears = Math.floor(requiredMonths / 12);
  const remainingMonths = requiredMonths % 12;
  let contributionText = `${requiredYears} years`;
  if (remainingMonths > 0) {
    contributionText += ` ${remainingMonths} months`;
  }
  
  const sectorLabel = sector === EmploymentSector.PUBLIC ? 'Public Sector' : 'Private Sector';
  
  // Check for normal retirement (age >= required age)
  if (hasContribution && hasAge) {
    return {
      eligible: true,
      message: `Beneficiary is eligible for normal retirement. Age requirement (${requiredAge} years) and contribution requirement (${contributionText}) are both met. ${sectorLabel}, Year ${year}.`,
      isEarlyRetirement: false
    };
  }
  
  // Check for early retirement (private sector, age 55-59, sufficient contribution)
  if (hasContribution && !hasAge && sector === EmploymentSector.PRIVATE && ageYears >= 55 && ageYears < 60) {
    return {
      eligible: true,
      message: `Beneficiary is eligible for early retirement (age ${ageYears} years, range 55-59). Contribution requirement (${contributionText}) is met. Private sector employees with sufficient contribution can retire early before age ${requiredAge}. Year ${year}.`,
      isEarlyRetirement: true
    };
  }
  
  // Has contribution but not eligible for either normal or early retirement
  if (hasContribution && !hasAge) {
    if (sector === EmploymentSector.PUBLIC) {
      return {
        eligible: false,
        message: `Beneficiary does not meet age requirement. Current age: ${ageYears} years, required: ${requiredAge} years. Public sector employees cannot retire early and must wait until age ${requiredAge}. Contribution (${contributionText}) is sufficient.`,
        isEarlyRetirement: false
      };
    } else {
      // Private sector but age < 55
      return {
        eligible: false,
        message: `Beneficiary does not meet age requirement. Current age: ${ageYears} years. For normal retirement: ${requiredAge} years required. For early retirement: minimum 55 years (private sector only). Contribution (${contributionText}) is sufficient.`,
        isEarlyRetirement: false
      };
    }
  }
  
  // Insufficient contribution
  return {
    eligible: false,
    message: `Beneficiary does not meet contribution requirement. Current contribution: ${Math.floor(contributionMonths / 12)} years ${contributionMonths % 12} months. Required: ${contributionText} for year ${year}. Please continue contributing to reach eligibility.`,
    isEarlyRetirement: false
  };
}

