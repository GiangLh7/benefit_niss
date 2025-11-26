/**
 * Eligibility Constants
 * Defines eligibility criteria and thresholds for benefits
 */

/**
 * Base contribution period for retirement (2017-2022)
 * 5 years = 60 months
 */
export const BASE_CONTRIBUTION_MONTHS = 60;

/**
 * Starting year for progressive guarantee period
 */
export const PROGRESSIVE_START_YEAR = 2017;

/**
 * End year for base period (no increase)
 */
export const BASE_PERIOD_END_YEAR = 2022;

/**
 * Monthly increase per year after base period
 */
export const MONTHLY_INCREASE_PER_YEAR = 6;

/**
 * End year for progressive increase
 */
export const PROGRESSIVE_END_YEAR = 2031;

/**
 * Maximum contribution period after progressive increase
 * 60 months + (9 years × 6 months) = 114 months
 */
export const MAX_CONTRIBUTION_MONTHS = 114;

/**
 * Minimum age required for normal retirement (Private Sector)
 */
export const MINIMUM_RETIREMENT_AGE_PRIVATE = 60;

/**
 * Minimum age required for normal retirement (Public Sector)
 */
export const MINIMUM_RETIREMENT_AGE_PUBLIC = 65;

/**
 * Default minimum age (Private Sector)
 */
export const MINIMUM_RETIREMENT_AGE = MINIMUM_RETIREMENT_AGE_PRIVATE;

/**
 * Minimum labor capacity reduction percentage for early retirement
 */
export const MINIMUM_LABOR_CAPACITY_REDUCTION = 61;

/**
 * Default health status
 */
export const DEFAULT_HEALTH_STATUS = 'Bình thường';

/**
 * Employment Sector Types
 */
export enum EmploymentSector {
  PRIVATE = 'private',
  PUBLIC = 'public'
}

