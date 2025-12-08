/**
 * Mock Data Constants
 * Test data for different citizen eligibility scenarios
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
  TL123456789: {
    niss: 'TL123456789',
    name: 'Maria Fernanda dos Santos',
    dateOfBirth: '1963-08-15',
    contributionHistory: [
      {
        startYear: 2000,
        endYear: 2010,
        company: 'Công ty ABC',
        years: 10,
        months: 0,
      },
      {
        startYear: 2010,
        endYear: 2025,
        company: 'Công ty XYZ',
        years: 15,
        months: 8,
      },
    ],
    totalYears: 25,
    totalMonths: 8,
    description:
      'Full eligibility - sufficient contribution and age (Private Sector)',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 150.0, // Average of 12 highest months
  },

  // Case 2: Enough contribution but not enough age - 18 years 3 months, 58 years old (Public Sector - needs 65)
  TL222222222: {
    niss: 'TL222222222',
    name: 'Ana Maria Costa',
    dateOfBirth: '1967-05-10',
    contributionHistory: [
      {
        startYear: 2007,
        endYear: 2015,
        company: 'Bank Nacional Timor',
        years: 8,
        months: 0,
      },
      {
        startYear: 2015,
        endYear: 2025,
        company: 'Ministério das Finanças',
        years: 10,
        months: 3,
      },
    ],
    totalYears: 18,
    totalMonths: 3,
    description:
      'Sufficient contribution but below retirement age (Public Sector requires 65)',
    employmentSector: EmploymentSector.PUBLIC,
    referenceRemuneration: 210.0, // Average of 12 highest months
  },

  // Case 3: Borderline normal retirement - exactly 15 years (180 months), 60 years old, Private Sector
  TL333333333: {
    niss: 'TL333333333',
    name: 'Pedro Gusmão',
    dateOfBirth: '1965-11-01',
    contributionHistory: [
      {
        startYear: 2010,
        endYear: 2025,
        company: 'Companhia Petróleo Timor',
        years: 15,
        months: 0,
      },
    ],
    totalYears: 15,
    totalMonths: 0,
    description:
      'Normal retirement borderline - exactly age 60, sufficient contribution (180 months)',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 140.0, // Average of 12 highest months
  },

  // Case 4: Very low contribution - 6 years 2 months (74 months), 62 years old
  // For year 2025: needs 78 months, has only 74 months - INSUFFICIENT
  TL444444444: {
    niss: 'TL444444444',
    name: 'Teresa Soares',
    dateOfBirth: '1963-01-15',
    contributionHistory: [
      {
        startYear: 2015,
        endYear: 2019,
        company: 'Hotel Timor Plaza',
        years: 4,
        months: 0,
      },
      {
        startYear: 2020,
        endYear: 2022,
        company: 'Restaurante Sabores',
        years: 2,
        months: 2,
      },
    ],
    totalYears: 6,
    totalMonths: 2,
    description:
      'Sufficient age but insufficient contribution - cannot apply for normal retirement',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 200.0, // Average of 12 highest months
  },

  // ===== EARLY RETIREMENT TEST CASES =====

  // Case 5: Early Retirement ELIGIBLE - 57 years old, 12 years 6 months (150 months), Private Sector
  // Age 55-59 (Private), sufficient contribution for 2025 (needs 78 months)
  TL555555555: {
    niss: 'TL555555555',
    name: 'Francisco Amaral',
    dateOfBirth: '1968-03-10',
    contributionHistory: [
      {
        startYear: 2012,
        endYear: 2025,
        company: 'Banco Nacional Ultramarino',
        years: 12,
        months: 6,
      },
    ],
    totalYears: 12,
    totalMonths: 6,
    description:
      'Early retirement eligible - Private sector, age 57, sufficient contribution',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 165.0, // Average of 12 highest months
  },

  // Case 6: Early Retirement NOT ELIGIBLE - 56 years old, 5 years 0 months (60 months), Private Sector
  // Age 55-59 but INSUFFICIENT contribution (needs 78 months for 2025)
  TL666666666: {
    niss: 'TL666666666',
    name: 'Lucia Belo',
    dateOfBirth: '1969-06-15',
    contributionHistory: [
      {
        startYear: 2020,
        endYear: 2025,
        company: 'Timor Telecom',
        years: 5,
        months: 0,
      },
    ],
    totalYears: 5,
    totalMonths: 0,
    description:
      'Early retirement NOT eligible - age 56 but insufficient contribution (60 < 78 months)',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 130.0, // Average of 12 highest months
  },

  // Case 7: Early Retirement NOT ALLOWED - 58 years old, 16 years 8 months (200 months), Public Sector
  // Age 55-59, sufficient contribution, but PUBLIC SECTOR cannot early retire
  TL777777777: {
    niss: 'TL777777777',
    name: 'Manuel Guterres',
    dateOfBirth: '1967-09-20',
    contributionHistory: [
      {
        startYear: 2009,
        endYear: 2025,
        company: 'Ministério da Saúde',
        years: 16,
        months: 8,
      },
    ],
    totalYears: 16,
    totalMonths: 8,
    description:
      'Early retirement NOT allowed - Public sector employees must wait until age 65',
    employmentSector: EmploymentSector.PUBLIC,
    referenceRemuneration: 240.0, // Average of 12 highest months
  },

  // Case 8: TOO YOUNG for Early Retirement - 52 years old, 16 years 8 months (200 months), Private Sector
  // Sufficient contribution but age < 55 (minimum for early retirement)
  TL888888888: {
    niss: 'TL888888888',
    name: 'Beatriz Sousa',
    dateOfBirth: '1973-04-12',
    contributionHistory: [
      {
        startYear: 2009,
        endYear: 2025,
        company: 'Timor Gap',
        years: 16,
        months: 8,
      },
    ],
    totalYears: 16,
    totalMonths: 8,
    description:
      'Too young for early retirement - age 52, minimum age is 55 for private sector',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 190.0, // Average of 12 highest months
  },

  // Case 9: BORDERLINE Early Retirement - 55 years old (minimum), 6 years 6 months (78 months), Private
  // Exactly minimum age (55) and exactly minimum contribution (78 months for 2025)
  TL999999998: {
    niss: 'TL999999998',
    name: 'Domingos Reis',
    dateOfBirth: '1970-01-01',
    contributionHistory: [
      {
        startYear: 2018,
        endYear: 2025,
        company: 'Café Timor',
        years: 6,
        months: 6,
      },
    ],
    totalYears: 6,
    totalMonths: 6,
    description:
      'Borderline early retirement - exactly age 55 and exactly 78 months contribution',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 120.0, // Average of 12 highest months
  },

  // ===== DISABILITY PENSION TEST CASES =====
  // Note: Disability level (66.67% - 100%) is now user input, so test cases focus on:
  // - Contribution period (minimum 66 months for 2025)
  // - Age (any age allowed, but auto-converts at 60)
  // - Sector (private/public)
  // - Reference remuneration for pension calculation

  // Case 10: ELIGIBLE - Sufficient Contribution, Middle Age, Private Sector
  // 45 years old, 8 years 3 months (99 months) - Well above minimum (66 months for 2025)
  // User can input any disability level ≥ 66.67%
  TLD111111111: {
    niss: 'TLD111111111',
    name: 'Carlos Silva',
    dateOfBirth: '1980-05-15',
    contributionHistory: [
      {
        startYear: 2017,
        endYear: 2025,
        company: 'Construção Civil Timor',
        years: 8,
        months: 3,
      },
    ],
    totalYears: 8,
    totalMonths: 3,
    description:
      'Disability eligible - sufficient contribution (99 months), age 45, private sector. User inputs disability level.',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 180.0, // For pension calculation: P = R × (N / 360)
  },

  // Case 11: ELIGIBLE - Sufficient Contribution, Public Sector
  // 50 years old, 7 years 6 months (90 months) - Above minimum
  // Public sector employees can receive disability pension before age 65
  TLD222222222: {
    niss: 'TLD222222222',
    name: 'Rosa Martins',
    dateOfBirth: '1975-08-22',
    contributionHistory: [
      {
        startYear: 2017,
        endYear: 2025,
        company: 'Hospital Nacional Guido Valadares',
        years: 7,
        months: 6,
      },
    ],
    totalYears: 7,
    totalMonths: 6,
    description:
      'Disability eligible - sufficient contribution (90 months), age 50, public sector. Can receive before age 65.',
    employmentSector: EmploymentSector.PUBLIC,
    referenceRemuneration: 220.0,
  },

  // Case 12: REJECTED - Insufficient Contribution Period
  // 42 years old, 4 years 8 months (56 months) - Below minimum (66 months for 2025)
  // Even with high disability level, cannot apply due to insufficient contribution
  TLD333333333: {
    niss: 'TLD333333333',
    name: 'Antonio Belo',
    dateOfBirth: '1983-03-10',
    contributionHistory: [
      {
        startYear: 2020,
        endYear: 2025,
        company: 'Timor Telecom',
        years: 4,
        months: 8,
      },
    ],
    totalYears: 4,
    totalMonths: 8,
    description:
      'Disability rejected - insufficient contribution (56 < 66 months for 2025). Must continue contributing.',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 160.0, // Average of 12 highest months
  },

  // Case 13: BORDERLINE - Exactly Minimum Contribution
  // 55 years old, 5 years 6 months (66 months) - EXACTLY minimum for 2025
  // Edge case: exactly meets requirement
  TLD555555555: {
    niss: 'TLD555555555',
    name: 'Paulo Alves',
    dateOfBirth: '1970-02-20',
    contributionHistory: [
      {
        startYear: 2020,
        endYear: 2025,
        company: 'Timor Port Authority',
        years: 5,
        months: 6,
      },
    ],
    totalYears: 5,
    totalMonths: 6,
    description:
      'Disability eligible (borderline) - exactly 66 months contribution (minimum for 2025), age 55.',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 175.0,
  },

  // Case 14: ELIGIBLE - Near Retirement Age, Will Auto-Convert
  // 59 years old, 22 years (264 months) - High contribution
  // Will auto-convert to Old-Age Pension at age 60
  TLD777777777: {
    niss: 'TLD777777777',
    name: 'Isabel Guterres',
    dateOfBirth: '1966-09-30',
    contributionHistory: [
      {
        startYear: 2003,
        endYear: 2025,
        company: 'Ministério da Educação',
        years: 22,
        months: 0,
      },
    ],
    totalYears: 22,
    totalMonths: 0,
    description:
      'Disability eligible - age 59, high contribution (264 months), public sector. Will auto-convert to Old-Age at 60.',
    employmentSector: EmploymentSector.PUBLIC,
    referenceRemuneration: 250.0,
  },

  // Case 15: REJECTED - Very Low Contribution
  // 35 years old, 3 years 6 months (42 months) - Far below minimum
  // Needs 18 more months to reach minimum
  TLD888888888: {
    niss: 'TLD888888888',
    name: 'Jose Fernandes',
    dateOfBirth: '1990-03-20',
    contributionHistory: [
      {
        startYear: 2021,
        endYear: 2025,
        company: 'Restaurante Timor',
        years: 3,
        months: 6,
      },
    ],
    totalYears: 3,
    totalMonths: 6,
    description:
      'Disability rejected - very low contribution (42 < 66 months). Needs 24 more months for 2025.',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 150.0, // Average of 12 highest months
  },

  // ===== SURVIVOR PENSION TEST CASES =====
  // Note: Survivor pension requires minimum 60 months contribution for 2025
  // Age is not a requirement for survivor pension (deceased person's contribution matters)

  // Case 16: ELIGIBLE - Sufficient Contribution for Survivor Pension
  // 50 years old (deceased), 10 years (120 months) - Well above minimum (60 months for 2025)
  TLS111111111: {
    niss: 'TLS111111111',
    name: 'Fernando da Costa',
    dateOfBirth: '1975-03-15',
    contributionHistory: [
      {
        startYear: 2015,
        endYear: 2025,
        company: 'Timor Gap',
        years: 10,
        months: 0,
      },
    ],
    totalYears: 10,
    totalMonths: 0,
    description:
      'Survivor pension eligible - sufficient contribution (120 months), age 50, private sector. Dependents can apply.',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 200.0, // Average of 12 highest months
  },

  // Case 23: REJECTED - Contribution Below 12 Months
  // 28 years old (deceased), 6 months - Below 12 months minimum
  // Very minimal contribution, cannot apply for any survivor benefits
  TLS888888888: {
    niss: 'TLS888888888',
    name: 'João Pereira',
    dateOfBirth: '1997-07-15',
    contributionHistory: [
      {
        startYear: 2024,
        endYear: 2025,
        company: 'Restaurante Sabores',
        years: 0,
        months: 6,
      },
    ],
    totalYears: 0,
    totalMonths: 6,
    description:
      'Survivor pension rejected - contribution below 12 months (6 < 12 months minimum). Cannot apply for survivor pension. Dependents may only be eligible for funeral reimbursement if no eligible dependents.',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 140.0,
  },

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
  const key = Object.keys(MOCK_CITIZENS).find(
    (k) =>
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
