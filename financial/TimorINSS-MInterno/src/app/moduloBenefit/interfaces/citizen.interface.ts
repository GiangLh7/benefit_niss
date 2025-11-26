/**
 * Citizen Interfaces
 * Defines citizen-related data structures
 */

import { EmploymentSector } from '../constants/eligibility.constants';

/**
 * Basic citizen information
 */
export interface CitizenInfo {
  niss: string;
  name: string;
  dateOfBirth: string;
  photo?: string;
  employmentSector?: EmploymentSector; // Private or Public sector
}

/**
 * Eligibility check result
 */
export interface EligibilityResult {
  eligible: boolean;
  age: string;
  ageInYears: number;
  ageInMonths: number;
  contributoryPeriod: string;
  contributoryYears: number;
  contributoryMonths: number;
  message: string;
  isEarlyRetirement?: boolean; // True if eligible for early retirement (age 55-59, private sector)
}

/**
 * Uploaded document information
 */
export interface UploadedDocument {
  type: string;
  file: File;
  uploadedAt: Date;
}

