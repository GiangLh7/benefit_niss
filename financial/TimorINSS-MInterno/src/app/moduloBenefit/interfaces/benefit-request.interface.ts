/**
 * Comprehensive Benefit Request Interfaces
 * Defines the complete data structure for benefit request submission
 */

import { RetirementOptionType } from '../models/benefit.model';
import { DisabilityPaymentType } from '../models/disability-benefit.model';
import { Dependent } from '../models/survivor-benefit.model';

/**
 * Bank Account Information
 */
export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
}

/**
 * Bank Account with Dependent Link (for Survivor's Pension)
 */
export interface DependentBankAccount extends BankAccount {
  dependentId: string; // Links to Dependent.id
  percentage: number; // Percentage of benefit this account receives
}

/**
 * Document Submission
 */
export interface DocumentSubmission {
  type: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
  fileData?: any; // Base64 or File object
}

/**
 * Complete Benefit Request Submission
 */
export interface CompleteBenefitRequest {
  // Citizen Information
  citizenNISS: string;
  citizenName: string;
  citizenDateOfBirth: string;

  // Scheme and Benefit Information
  schemeType: 'contributory' | 'non-contributory';
  benefitType: string; // 'old-age-pension', 'disability-pension', 'survivor-pension', etc.

  // Retirement-specific (if benefitType = old-age-pension)
  retirementOption?: RetirementOptionType;
  selectedHazardousIndustry?: string; // If HAZARDOUS_INDUSTRY option

  // Disability-specific (if benefitType = disability-pension)
  disabilityPaymentType?: DisabilityPaymentType;
  disabilityLevel?: number; // Disability percentage (66.67-100%)
  disabilityType?: 'relative' | 'absolute'; // Type of disability
  estimatedPension?: number; // Calculated pension amount

  // Survivor-specific (if benefitType = survivor-pension)
  funeralAllowance?: number;
  dependents?: Dependent[];
  dependentBankAccounts?: DependentBankAccount[]; // Multiple accounts for dependents
  survivorBenefitType?: 'monthly-pension' | 'one-time-subsidy' | 'funeral-reimbursement';
  referenceRemuneration?: number; // R - Average of 12 highest contribution months
  survivorMonthlyPensionAmount?: number; // For monthly pension
  survivorOneTimeSubsidyAmount?: number; // For one-time subsidy (3 * R)
  survivorFuneralReimbursementAmount?: number; // For funeral reimbursement (max 3 * R)

  // Non-Contributory specific (if schemeType = non-contributory)
  nonContributoryBenefitType?: string; // Benefit type ID (e.g., 'elderly-assistance')
  nonContributoryBenefitLabel?: string; // Benefit type label (e.g., 'Elderly Assistance')
  nonContributoryBenefitAmount?: number; // Benefit amount in USD
  nonContributoryBenefitFrequency?: 'monthly' | 'one-time' | 'flexible'; // Payment frequency

  // Documents
  documents: DocumentSubmission[];

  // Bank Account (for retirement and disability - single account)
  bankAccount?: BankAccount;

  // Eligibility Information (from the check)
  contributionMonths?: number;
  currentAge?: string;
  eligibilityMessage?: string;

  // Metadata
  submittedDate: Date;
  requestStatus: 'submitted' | 'pending_approval' | 'approved' | 'rejected' | 'expired';
}

/**
 * Request Details (Extended version for display)
 */
export interface BenefitRequestDetails extends CompleteBenefitRequest {
  id: string;
  reviewHistory?: ReviewHistoryEntry[];
}

/**
 * Review History Entry
 */
export interface ReviewHistoryEntry {
  action: 'submitted' | 'sent_for_approval' | 'approved' | 'rejected';
  performedBy: string;
  performedAt: Date;
  comment?: string;
  userLevel: number;
}

