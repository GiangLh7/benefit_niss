/**
 * Non-Contributory Benefits Constants
 * SAII (Subsídio de Apoio a Idosos e Inválidos) and other social assistance
 */

import {
  NON_CONTRIBUTORY_BENEFITS_CONFIG,
  calculateOldPensionAmount,
  calculateDisabilityAmount,
} from './non-contributory-benefits.config';

export interface NonContributoryBenefitType {
  id: string;
  label: string;
  description: string;
  amount: number; // Base amount (will be calculated dynamically for old-pension and disability)
  frequency: 'monthly' | 'one-time' | 'flexible';
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  ageRequirement?: {
    min?: number;
    max?: number;
  };
  /** If true, amount is calculated dynamically based on age */
  isDynamicAmount?: boolean;
}

/**
 * Non-Contributory Benefit Types (Social Assistance)
 */
export const NON_CONTRIBUTORY_BENEFIT_TYPES: NonContributoryBenefitType[] = [
  {
    id: 'elderly-assistance',
    label: 'Elderly Assistance (Pessoa Idosa)',
    description: 'Citizens aged 60+ with no or low income',
    amount: NON_CONTRIBUTORY_BENEFITS_CONFIG.oldPension.baseAmount, // Base amount, calculated dynamically
    frequency: 'monthly',
    eligibilityCriteria: [
      'Age 60 or above',
      'No income or low income',
      'No social security contribution history'
    ],
    requiredDocuments: [
      'Identity Card',
      'Birth Certificate',
      'Proof of Income (or declaration of no income)',
      'Proof of Residence'
    ],
    ageRequirement: {
      min: NON_CONTRIBUTORY_BENEFITS_CONFIG.oldPension.ageThreshold
    },
    isDynamicAmount: true // Amount calculated based on age
  },
  {
    id: 'severe-disability',
    label: 'Severe Disability (Pessoa com Deficiência Grave)',
    description: 'Persons aged 18+ with severe disability, unable to work',
    amount: NON_CONTRIBUTORY_BENEFITS_CONFIG.disability.baseAmount, // Base amount, calculated dynamically
    frequency: 'monthly',
    eligibilityCriteria: [
      'Age 18 or above',
      'Severe disability',
      'Complete loss of working capacity',
      'Disability certificate required'
    ],
    requiredDocuments: [
      'Identity Card',
      'Disability Certificate',
      'Medical Report',
      'Proof of Residence'
    ],
    ageRequirement: {
      min: NON_CONTRIBUTORY_BENEFITS_CONFIG.disability.minAge
    },
    isDynamicAmount: true // Amount calculated based on age
  },
  {
    id: 'special-disability',
    label: 'Special Disability (Deficiência Especial)',
    description: 'Severely disabled persons unable to care for themselves',
    amount: 50,
    frequency: 'monthly',
    eligibilityCriteria: [
      'Severe disability',
      'Unable to care for self',
      'Requires special care',
      'Medical certification required'
    ],
    requiredDocuments: [
      'Identity Card',
      'Disability Certificate',
      'Medical Report (special care assessment)',
      'Caregiver Information',
      'Proof of Residence'
    ]
  },
  {
    id: 'pregnant-women',
    label: 'Pregnant Women (Mulher Grávida)',
    description: 'Pregnant women in poor households',
    amount: 60,
    frequency: 'one-time',
    eligibilityCriteria: [
      'Pregnant',
      'From poor household',
      'One-time support for nutrition and pre-birth expenses'
    ],
    requiredDocuments: [
      'Identity Card',
      'Medical Certificate (pregnancy confirmation)',
      'Proof of Household Income',
      'Proof of Residence'
    ]
  },
  {
    id: 'children-under-3',
    label: 'Children Under 3 Years (Criança Menor de 3 Anos)',
    description: 'Children aged 0-3 in poor households',
    amount: 15,
    frequency: 'monthly',
    eligibilityCriteria: [
      'Age 0-3 years',
      'From poor household',
      'Support for nutrition and development'
    ],
    requiredDocuments: [
      'Birth Certificate',
      'Parents Identity Cards',
      'Proof of Household Income',
      'Proof of Residence'
    ],
    ageRequirement: {
      min: 0,
      max: 3
    }
  },
  {
    id: 'orphan-children',
    label: 'Orphan Children (Criança Órfã)',
    description: 'Children who lost both parents, no means of support',
    amount: 25,
    frequency: 'monthly',
    eligibilityCriteria: [
      'Lost both parents',
      'No means of support',
      'Support until age 18'
    ],
    requiredDocuments: [
      'Birth Certificate',
      'Death Certificates (both parents)',
      'Guardian Information (if applicable)',
      'Proof of Residence'
    ],
    ageRequirement: {
      max: 18
    }
  },
  {
    id: 'disabled-children',
    label: 'Disabled Children (Criança com Deficiência)',
    description: 'Children under 18 with disability',
    amount: 25,
    frequency: 'monthly',
    eligibilityCriteria: [
      'Age under 18',
      'Has disability',
      'Support for care and rehabilitation costs'
    ],
    requiredDocuments: [
      'Birth Certificate',
      'Disability Certificate',
      'Medical Report',
      'Parents/Guardian Identity Cards',
      'Proof of Residence'
    ],
    ageRequirement: {
      max: 18
    }
  },
  {
    id: 'emergency-cases',
    label: 'Emergency Cases (Casos de Emergência)',
    description: 'Natural disasters, fires, elderly without support needing urgent care',
    amount: 0, // Flexible based on situation
    frequency: 'flexible',
    eligibilityCriteria: [
      'Emergency situation (natural disaster, fire, etc.)',
      'Elderly without support needing urgent care',
      'Amount determined case by case',
      'One-time or periodic support'
    ],
    requiredDocuments: [
      'Identity Card',
      'Evidence of Emergency Situation',
      'Assessment Report from Social Services',
      'Supporting Documents'
    ]
  }
];

/**
 * Get non-contributory benefit by ID
 */
export function getNonContributoryBenefit(id: string): NonContributoryBenefitType | undefined {
  return NON_CONTRIBUTORY_BENEFIT_TYPES.find(benefit => benefit.id === id);
}

/**
 * Get benefit amount display
 * @param benefit - The benefit type
 * @param age - Optional age for dynamic amount calculation
 */
export function getBenefitAmountDisplay(benefit: NonContributoryBenefitType, age?: number): string {
  if (benefit.amount === 0) {
    return 'As per case assessment';
  }
  
  let amount = benefit.amount;
  
  // Calculate dynamic amount for old-pension and disability based on age
  if (benefit.isDynamicAmount && age !== undefined) {
    if (benefit.id === 'elderly-assistance') {
      amount = calculateOldPensionAmount(age);
    } else if (benefit.id === 'severe-disability') {
      amount = calculateDisabilityAmount(age);
    }
  }
  
  const amountStr = `$${amount.toFixed(2)}`;
  
  switch (benefit.frequency) {
    case 'monthly':
      return `${amountStr}/month`;
    case 'one-time':
      return `${amountStr} (one-time)`;
    case 'flexible':
      return 'Flexible amount';
    default:
      return amountStr;
  }
}

/**
 * Get benefit amount (calculated dynamically if needed)
 * @param benefit - The benefit type
 * @param age - Optional age for dynamic amount calculation
 */
export function getBenefitAmount(benefit: NonContributoryBenefitType, age?: number): number {
  if (benefit.isDynamicAmount && age !== undefined) {
    if (benefit.id === 'elderly-assistance') {
      return calculateOldPensionAmount(age);
    } else if (benefit.id === 'severe-disability') {
      return calculateDisabilityAmount(age);
    }
  }
  return benefit.amount;
}

/**
 * Check age eligibility for benefit
 */
export function checkAgeEligibility(benefit: NonContributoryBenefitType, age: number): {
  eligible: boolean;
  message?: string;
} {
  if (!benefit.ageRequirement) {
    return { eligible: true };
  }

  const { min, max } = benefit.ageRequirement;

  if (min !== undefined && age < min) {
    return {
      eligible: false,
      message: `Minimum age required: ${min} years`
    };
  }

  if (max !== undefined && age > max) {
    return {
      eligible: false,
      message: `Maximum age: ${max} years`
    };
  }

  return { eligible: true };
}

