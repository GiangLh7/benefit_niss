/**
 * Non-Contributory Benefits Configuration
 * Contains all configurable parameters for non-contributory benefits
 */

/**
 * Old-Pension (Pessoa Idosa) Configuration
 */
export interface OldPensionConfig {
  /** Age threshold to determine old age (currently 60 years) */
  ageThreshold: number;
  /** Base payment amount in USD */
  baseAmount: number;
  /** Additional payment for age 70-79 in USD */
  age70to79Additional: number;
  /** Additional payment for age 80+ in USD */
  age80PlusAdditional: number;
}

/**
 * Disability (Pessoa com Deficiência Grave) Configuration
 */
export interface DisabilityConfig {
  /** Minimum age requirement (currently 18 years) */
  minAge: number;
  /** Base allowance amount in USD */
  baseAmount: number;
  /** Additional payment for age 70-79 in USD */
  age70to79Additional: number;
  /** Additional payment for age 80+ in USD */
  age80PlusAdditional: number;
}

/**
 * Non-Contributory Benefits Configuration
 */
export interface NonContributoryBenefitsConfig {
  oldPension: OldPensionConfig;
  disability: DisabilityConfig;
}

/**
 * Default Non-Contributory Benefits Configuration
 */
export const NON_CONTRIBUTORY_BENEFITS_CONFIG: NonContributoryBenefitsConfig = {
  oldPension: {
    ageThreshold: 60, // Age threshold to determine old age
    baseAmount: 60, // Base payment: 60 USD
    age70to79Additional: 20, // Additional for age 70-79: +20 USD
    age80PlusAdditional: 40, // Additional for age 80+: +40 USD
  },
  disability: {
    minAge: 18, // Must be 18 years or older
    baseAmount: 60, // Base allowance: 60 USD
    age70to79Additional: 20, // Additional for age 70-79: +20 USD
    age80PlusAdditional: 40, // Additional for age 80+: +40 USD
  },
};

/**
 * Calculate old-pension payment amount based on age
 * @param age - Current age of the citizen
 * @param config - Old-pension configuration (optional, uses default if not provided)
 * @returns Total payment amount in USD
 */
export function calculateOldPensionAmount(
  age: number,
  config: OldPensionConfig = NON_CONTRIBUTORY_BENEFITS_CONFIG.oldPension
): number {
  let amount = config.baseAmount;

  if (age >= 80) {
    amount += config.age80PlusAdditional;
  } else if (age >= 70) {
    amount += config.age70to79Additional;
  }

  return amount;
}

/**
 * Calculate disability allowance amount based on age
 * @param age - Current age of the citizen
 * @param config - Disability configuration (optional, uses default if not provided)
 * @returns Total allowance amount in USD
 */
export function calculateDisabilityAmount(
  age: number,
  config: DisabilityConfig = NON_CONTRIBUTORY_BENEFITS_CONFIG.disability
): number {
  let amount = config.baseAmount;

  if (age >= 80) {
    amount += config.age80PlusAdditional;
  } else if (age >= 70) {
    amount += config.age70to79Additional;
  }

  return amount;
}

/**
 * Check if citizen is eligible for old-pension based on age threshold
 * @param age - Current age of the citizen
 * @param config - Old-pension configuration (optional, uses default if not provided)
 * @returns true if eligible (age >= threshold)
 */
export function isEligibleForOldPension(
  age: number,
  config: OldPensionConfig = NON_CONTRIBUTORY_BENEFITS_CONFIG.oldPension
): boolean {
  return age >= config.ageThreshold;
}

/**
 * Check if citizen is eligible for disability based on minimum age
 * @param age - Current age of the citizen
 * @param config - Disability configuration (optional, uses default if not provided)
 * @returns true if eligible (age >= minAge)
 */
export function isEligibleForDisability(
  age: number,
  config: DisabilityConfig = NON_CONTRIBUTORY_BENEFITS_CONFIG.disability
): boolean {
  return age >= config.minAge;
}

