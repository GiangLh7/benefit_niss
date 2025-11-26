/**
 * Disability Benefit Models
 * Models for disability pension configurations
 */

/**
 * Disability Payment Type
 */
export enum DisabilityPaymentType {
  ONE_TIME = 'ONE_TIME',        // Trợ cấp 1 lần (suy giảm 5%)
  MONTHLY = 'MONTHLY'           // Trợ cấp hàng tháng (suy giảm > 31%)
}

/**
 * Disability Configuration
 */
export interface DisabilityConfiguration {
  paymentType: DisabilityPaymentType;
  laborCapacityReduction: number;  // Mức suy giảm khả năng lao động (%)
  requiredDocuments: string[];
}

/**
 * Disability Options
 */
export const DISABILITY_OPTIONS = {
  ONE_TIME: {
    paymentType: DisabilityPaymentType.ONE_TIME,
    label: 'Trợ cấp một lần',
    description: 'Dành cho người suy giảm khả năng lao động từ 5% đến 30%',
    minReduction: 5,
    maxReduction: 30,
    requiredDocuments: [
      'Biên bản giám định mức suy giảm KNLĐ',
      'Giấy ra viện'
    ]
  },
  MONTHLY: {
    paymentType: DisabilityPaymentType.MONTHLY,
    label: 'Trợ cấp hàng tháng',
    description: 'Dành cho người suy giảm khả năng lao động trên 31%',
    minReduction: 31,
    maxReduction: 100,
    requiredDocuments: [
      'Biên bản giám định mức suy giảm KNLĐ',
      'Giấy ra viện'
    ]
  }
};

