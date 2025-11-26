/**
 * Benefit Types Constants
 * Defines all benefit types with their required documents
 */

export interface BenefitType {
  value: string;
  label: string;
  requiredDocuments: string[];
}

/**
 * Contributory Benefit Types
 * Benefits that require contribution history
 */
export const CONTRIBUTORY_BENEFIT_TYPES: BenefitType[] = [
  {
    value: 'old-age-pension',
    label: 'Old Age Pension',
    requiredDocuments: []
  },
  {
    value: 'disability-pension',
    label: 'Disability Pension',
    requiredDocuments: [
      'Medical Certificate',
      'Disability Assessment Report'
    ]
  },
  {
    value: 'survivor-pension',
    label: 'Survivor\'s Pension',
    requiredDocuments: [
      'Survivor Pension Application Form',
      'Death Certificate of Deceased',
      'Marriage Certificate',
      'Child\'s Birth Certificate/Record Book'
    ]
  }
];

/**
 * Non-Contributory Benefit Types
 * Social benefits that don't require contribution history
 */
export const NON_CONTRIBUTORY_BENEFIT_TYPES: BenefitType[] = [
  {
    value: 'old-age-social',
    label: 'Old Age Social Pension',
    requiredDocuments: [
      'Income Declaration'
    ]
  },
  {
    value: 'disability-social',
    label: 'Disability Social Pension',
    requiredDocuments: [
      'Medical Certificate',
      'Disability Assessment Report',
      'Income Declaration'
    ]
  }
];

