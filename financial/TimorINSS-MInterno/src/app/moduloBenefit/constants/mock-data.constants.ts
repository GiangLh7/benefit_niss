/**
 * Mock Data Constants
 * Test data for different citizen eligibility scenarios
 * TODO: Remove this file when integrating with real API
 */

import { ContributionPeriod } from '../models/benefit.model';
import { EmploymentSector } from './eligibility.constants';

export interface MockCitizenData {
  niss: string;
  name: string;
  dateOfBirth: string;
  contributionHistory: ContributionPeriod[];
  totalYears: number;
  totalMonths: number;
  description: string;
  employmentSector?: EmploymentSector;
  referenceRemuneration?: number; // R - Average of 12 highest contribution months (USD)
}

/**
 * Mock citizen data for testing different eligibility scenarios
 */
export const MOCK_CITIZENS: Record<string, MockCitizenData> = {
  // Case 1: Full eligibility - 25 years 8 months, 62 years old (Private Sector)
  'TL123456789': {
    niss: 'TL123456789',
    name: 'Maria Fernanda dos Santos',
    dateOfBirth: '1963-08-15',
    contributionHistory: [
      {
        startYear: 2000,
        endYear: 2010,
        company: 'Công ty ABC',
        years: 10,
        months: 0
      },
      {
        startYear: 2010,
        endYear: 2025,
        company: 'Công ty XYZ',
        years: 15,
        months: 8
      }
    ],
    totalYears: 25,
    totalMonths: 8,
    description: 'Full eligibility - sufficient contribution and age (Private Sector)',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 150.00 // Average of 12 highest months
  },

  // Case 2: Early retirement eligible - 55 years old, 10 years 6 months (126 months), Private Sector
  // Age exactly 55, contribution 126 > 78 months - ELIGIBLE for early retirement
  'TL111111111': {
    niss: 'TL111111111',
    name: 'João Silva Santos',
    dateOfBirth: '1970-03-20',
    contributionHistory: [
      {
        startYear: 2014,
        endYear: 2025,
        company: 'Empresa Timor Coffee',
        years: 10,
        months: 6
      }
    ],
    totalYears: 10,
    totalMonths: 6,
    description: 'Early retirement eligible - age 55 (minimum), sufficient contribution (126 months)',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 125.00 // Average of 12 highest months
  },

  // Case 3: Enough contribution but not enough age - 18 years 3 months, 58 years old (Public Sector - needs 65)
  'TL222222222': {
    niss: 'TL222222222',
    name: 'Ana Maria Costa',
    dateOfBirth: '1967-05-10',
    contributionHistory: [
      {
        startYear: 2007,
        endYear: 2015,
        company: 'Bank Nacional Timor',
        years: 8,
        months: 0
      },
      {
        startYear: 2015,
        endYear: 2025,
        company: 'Ministério das Finanças',
        years: 10,
        months: 3
      }
    ],
    totalYears: 18,
    totalMonths: 3,
    description: 'Sufficient contribution but below retirement age (Public Sector requires 65)',
    employmentSector: EmploymentSector.PUBLIC
  },

  // Case 4: Borderline normal retirement - exactly 15 years (180 months), 60 years old, Private Sector
  'TL333333333': {
    niss: 'TL333333333',
    name: 'Pedro Gusmão',
    dateOfBirth: '1965-11-01',
    contributionHistory: [
      {
        startYear: 2010,
        endYear: 2025,
        company: 'Companhia Petróleo Timor',
        years: 15,
        months: 0
      }
    ],
    totalYears: 15,
    totalMonths: 0,
    description: 'Normal retirement borderline - exactly age 60, sufficient contribution (180 months)',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 140.00 // Average of 12 highest months
  },

  // Case 5: Very low contribution - 6 years 2 months (74 months), 62 years old
  // For year 2025: needs 78 months, has only 74 months - INSUFFICIENT
  'TL444444444': {
    niss: 'TL444444444',
    name: 'Teresa Soares',
    dateOfBirth: '1963-01-15',
    contributionHistory: [
      {
        startYear: 2015,
        endYear: 2019,
        company: 'Hotel Timor Plaza',
        years: 4,
        months: 0
      },
      {
        startYear: 2020,
        endYear: 2022,
        company: 'Restaurante Sabores',
        years: 2,
        months: 2
      }
    ],
    totalYears: 6,
    totalMonths: 2,
    description: 'Sufficient age but insufficient contribution - cannot apply for normal retirement',
    employmentSector: EmploymentSector.PRIVATE
  },

  // ===== EARLY RETIREMENT TEST CASES =====

  // Case 6: Early Retirement ELIGIBLE - 57 years old, 12 years 6 months (150 months), Private Sector
  // Age 55-59 (Private), sufficient contribution for 2025 (needs 78 months)
  'TL555555555': {
    niss: 'TL555555555',
    name: 'Francisco Amaral',
    dateOfBirth: '1968-03-10',
    contributionHistory: [
      {
        startYear: 2012,
        endYear: 2025,
        company: 'Banco Nacional Ultramarino',
        years: 12,
        months: 6
      }
    ],
    totalYears: 12,
    totalMonths: 6,
    description: 'Early retirement eligible - Private sector, age 57, sufficient contribution',
    employmentSector: EmploymentSector.PRIVATE
  },

  // Case 7: Early Retirement NOT ELIGIBLE - 56 years old, 5 years 0 months (60 months), Private Sector
  // Age 55-59 but INSUFFICIENT contribution (needs 78 months for 2025)
  'TL666666666': {
    niss: 'TL666666666',
    name: 'Lucia Belo',
    dateOfBirth: '1969-06-15',
    contributionHistory: [
      {
        startYear: 2020,
        endYear: 2025,
        company: 'Timor Telecom',
        years: 5,
        months: 0
      }
    ],
    totalYears: 5,
    totalMonths: 0,
    description: 'Early retirement NOT eligible - age 56 but insufficient contribution (60 < 78 months)',
    employmentSector: EmploymentSector.PRIVATE
  },

  // Case 8: Early Retirement NOT ALLOWED - 58 years old, 16 years 8 months (200 months), Public Sector
  // Age 55-59, sufficient contribution, but PUBLIC SECTOR cannot early retire
  'TL777777777': {
    niss: 'TL777777777',
    name: 'Manuel Guterres',
    dateOfBirth: '1967-09-20',
    contributionHistory: [
      {
        startYear: 2009,
        endYear: 2025,
        company: 'Ministério da Saúde',
        years: 16,
        months: 8
      }
    ],
    totalYears: 16,
    totalMonths: 8,
    description: 'Early retirement NOT allowed - Public sector employees must wait until age 65',
    employmentSector: EmploymentSector.PUBLIC
  },

  // Case 9: TOO YOUNG for Early Retirement - 52 years old, 16 years 8 months (200 months), Private Sector
  // Sufficient contribution but age < 55 (minimum for early retirement)
  'TL888888888': {
    niss: 'TL888888888',
    name: 'Beatriz Sousa',
    dateOfBirth: '1973-04-12',
    contributionHistory: [
      {
        startYear: 2009,
        endYear: 2025,
        company: 'Timor Gap',
        years: 16,
        months: 8
      }
    ],
    totalYears: 16,
    totalMonths: 8,
    description: 'Too young for early retirement - age 52, minimum age is 55 for private sector',
    employmentSector: EmploymentSector.PRIVATE
  },

  // Case 10: BORDERLINE Early Retirement - 55 years old (minimum), 6 years 6 months (78 months), Private
  // Exactly minimum age (55) and exactly minimum contribution (78 months for 2025)
  'TL999999998': {
    niss: 'TL999999998',
    name: 'Domingos Reis',
    dateOfBirth: '1970-01-01',
    contributionHistory: [
      {
        startYear: 2018,
        endYear: 2025,
        company: 'Café Timor',
        years: 6,
        months: 6
      }
    ],
    totalYears: 6,
    totalMonths: 6,
    description: 'Borderline early retirement - exactly age 55 and exactly 78 months contribution',
    employmentSector: EmploymentSector.PRIVATE
  },

  // ===== DISABILITY PENSION TEST CASES =====

  // Case 11: Absolute Disability ELIGIBLE - 45 years old, 8 years 3 months (99 months), 100% disability
  // Sufficient contribution (99 > 60 for 2025), permanent absolute disability
  'TLD111111111': {
    niss: 'TLD111111111',
    name: 'Carlos Silva',
    dateOfBirth: '1980-05-15',
    contributionHistory: [
      {
        startYear: 2017,
        endYear: 2025,
        company: 'Construção Civil Timor',
        years: 8,
        months: 3
      }
    ],
    totalYears: 8,
    totalMonths: 3,
    description: 'Absolute disability eligible - 100% disability, sufficient contribution (99 months)',
    employmentSector: EmploymentSector.PRIVATE
  },

  // Case 12: Relative Disability ELIGIBLE - 50 years old, 7 years 6 months (90 months), 75% disability
  // Sufficient contribution (90 > 60 for 2025), permanent relative disability
  'TLD222222222': {
    niss: 'TLD222222222',
    name: 'Rosa Martins',
    dateOfBirth: '1975-08-22',
    contributionHistory: [
      {
        startYear: 2017,
        endYear: 2025,
        company: 'Hospital Nacional Guido Valadares',
        years: 7,
        months: 6
      }
    ],
    totalYears: 7,
    totalMonths: 6,
    description: 'Relative disability eligible - 75% disability, sufficient contribution (90 months)',
    employmentSector: EmploymentSector.PUBLIC
  },

  // Case 13: Disability REJECTED - Insufficient Contribution - 42 years old, 4 years 8 months (56 months)
  // Has 70% disability but insufficient contribution (56 < 60 for 2025)
  'TLD333333333': {
    niss: 'TLD333333333',
    name: 'Antonio Belo',
    dateOfBirth: '1983-03-10',
    contributionHistory: [
      {
        startYear: 2020,
        endYear: 2025,
        company: 'Timor Telecom',
        years: 4,
        months: 8
      }
    ],
    totalYears: 4,
    totalMonths: 8,
    description: 'Disability rejected - insufficient contribution (56 < 60 months for 2025)',
    employmentSector: EmploymentSector.PRIVATE
  },

  // Case 14: Disability REJECTED - Insufficient Disability Level - 38 years old, 10 years (120 months)
  // Sufficient contribution but disability level only 50% (< 66.67% required)
  'TLD444444444': {
    niss: 'TLD444444444',
    name: 'Mariana Soares',
    dateOfBirth: '1987-11-05',
    contributionHistory: [
      {
        startYear: 2015,
        endYear: 2025,
        company: 'Banco Nacional Comercio',
        years: 10,
        months: 0
      }
    ],
    totalYears: 10,
    totalMonths: 0,
    description: 'Disability rejected - disability level insufficient (50% < 66.67% required)',
    employmentSector: EmploymentSector.PRIVATE
  },

  // Case 15: Borderline Disability - 55 years old, 5 years 0 months (60 months), 66.67% disability
  // EXACTLY minimum contribution (60 months for 2025) and EXACTLY minimum disability (66.67%)
  'TLD555555555': {
    niss: 'TLD555555555',
    name: 'Paulo Alves',
    dateOfBirth: '1970-02-20',
    contributionHistory: [
      {
        startYear: 2020,
        endYear: 2025,
        company: 'Timor Port Authority',
        years: 5,
        months: 0
      }
    ],
    totalYears: 5,
    totalMonths: 0,
    description: 'Borderline disability - exactly 60 months contribution and exactly 66.67% disability',
    employmentSector: EmploymentSector.PRIVATE
  },

  // Case 16: Young Worker with Absolute Disability - 28 years old, 6 years 3 months (75 months), 100%
  // Young worker with work accident, absolute disability, sufficient contribution
  'TLD666666666': {
    niss: 'TLD666666666',
    name: 'Miguel Costa',
    dateOfBirth: '1997-07-15',
    contributionHistory: [
      {
        startYear: 2019,
        endYear: 2025,
        company: 'Timor Gap E.P.',
        years: 6,
        months: 3
      }
    ],
    totalYears: 6,
    totalMonths: 3,
    description: 'Young worker absolute disability - age 28, 100% disability from work accident',
    employmentSector: EmploymentSector.PRIVATE
  },

  // Case 17: Near Retirement Age with Disability - 59 years old, 22 years (264 months), 80% disability
  // Will auto-convert to Old-Age Pension at age 60
  'TLD777777777': {
    niss: 'TLD777777777',
    name: 'Isabel Guterres',
    dateOfBirth: '1966-09-30',
    contributionHistory: [
      {
        startYear: 2003,
        endYear: 2025,
        company: 'Ministério da Educação',
        years: 22,
        months: 0
      }
    ],
    totalYears: 22,
    totalMonths: 0,
    description: 'Near retirement with disability - age 59, will auto-convert to Old-Age at 60',
    employmentSector: EmploymentSector.PUBLIC
  }
};

/**
 * Get mock citizen data by NISS
 * Supports both exact match and partial match (e.g., 'tl123' matches 'TL123456789')
 */
export function getMockCitizenByNISS(niss: string): MockCitizenData | null {
  const normalizedNiss = niss.toUpperCase();
  
  // Try exact match first
  if (MOCK_CITIZENS[normalizedNiss]) {
    return MOCK_CITIZENS[normalizedNiss];
  }
  
  // Try partial match
  const key = Object.keys(MOCK_CITIZENS).find(k => 
    k.toLowerCase().includes(niss.toLowerCase()) ||
    niss.toLowerCase().includes(k.toLowerCase().substring(0, 5))
  );
  
  return key ? MOCK_CITIZENS[key] : null;
}

/**
 * Check if NISS is already assigned to a benefit scheme
 */
export function isNISSAlreadyAssigned(niss: string): boolean {
  return niss === 'TL999999999';
}

