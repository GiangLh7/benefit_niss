/**
 * Mock Data Constants - CORRECTED VERSION
 * Test data for different citizen eligibility scenarios
 *
 * Based on INSS Benefit Module Presentation (Decreto-Lei 2017/2021)
 * Covers all scenarios for:
 * - Old-Age Pension (RCSS)
 * - Disability Pension (RCSS) - Absolute & Relative
 * - Survivor Pension (RCSS)
 * - Non-Contributory SAII Benefits
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
  referenceRemuneration?: number; // R - Average of BEST 10 years (120 months) in USD
  monthlySalary?: number; // For relative invalidity cases
  category?: 'old-age' | 'disability' | 'survivor' | 'saii'; // Test category
}

/**
 * Mock citizen data for testing different eligibility scenarios
 *
 * Naming Convention:
 * - TL1xxxxx: Old-Age Pension (RCSS)
 * - TL2xxxxx: Disability Pension (RCSS)
 * - TL3xxxxx: Survivor Pension (RCSS)
 * - TL4xxxxx: Non-Contributory SAII
 * - TL9xxxxx: Special/Edge Cases
 */
export const MOCK_CITIZENS: Record<string, MockCitizenData> = {
  // ========================================================================
  // OLD-AGE PENSION (RCSS - CONTRIBUTORY SCHEME)
  // ========================================================================
  // Requirements:
  // - Age: 60 years (both private and public sector)
  // - Contribution: Progressive by year (2025: 78 months, 2032+: 120 months)
  // - Early retirement: NOT APPLY (removed)
  // - Minimum Benefit Levels: 1×SP, 2×SP, 3×SP, 4×SP
  // - Tax: 10% if pension > $500
  // ========================================================================

  // ===== ELIGIBLE CASES =====

  // Case OA-1: ELIGIBLE - Basic Case, Low Contribution, Gets Minimum Guarantee
  // Age 62, Contribution 80 months (6y 8m) - Gets 2×SP minimum
  // Calculated: $300 × (80/360) = $66.67 → Minimum: 2×SP = $120
  TL1000001: {
    niss: 'TL1000001',
    name: 'Maria Fernanda dos Santos',
    dateOfBirth: '1963-08-15', // Age 62
    contributionHistory: [
      {
        startYear: 2018,
        endYear: 2025,
        company: 'Café Timor',
        years: 6,
        months: 8,
      },
    ],
    totalYears: 6,
    totalMonths: 8,
    description:
      'ELIGIBLE: Age 62, 80 months contribution. Calculated $66.67 but gets minimum 2×SP = $120/month',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 300.0, // Best 10 years average
    category: 'old-age',
  },

  // Case OA-2: ELIGIBLE - Medium Contribution, Gets 3×SP Minimum
  // Age 61, Contribution 150 months (12y 6m) - Gets 3×SP minimum
  // Calculated: $350 × (150/360) = $145.83 → Minimum: 3×SP = $180
  TL1000002: {
    niss: 'TL1000002',
    name: 'Pedro Gusmão',
    dateOfBirth: '1964-11-01', // Age 61
    contributionHistory: [
      {
        startYear: 2012,
        endYear: 2025,
        company: 'Timor Telecom',
        years: 12,
        months: 6,
      },
    ],
    totalYears: 12,
    totalMonths: 6,
    description:
      'ELIGIBLE: Age 61, 150 months contribution. Calculated $145.83 but gets minimum 3×SP = $180/month',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 350.0,
    category: 'old-age',
  },

  // Case OA-3: ELIGIBLE - High Contribution, No Tax (< $500)
  // Age 65, Contribution 250 months (20y 10m) - Gets 4×SP minimum
  // Calculated: $650 × (250/360) = $451.39 → Use calculated (> 4×SP)
  // No tax: $451.39 < $500
  TL1000003: {
    niss: 'TL1000003',
    name: 'Ana Maria Costa',
    dateOfBirth: '1960-05-10', // Age 65
    contributionHistory: [
      {
        startYear: 2004,
        endYear: 2025,
        company: 'Bank Nacional Timor',
        years: 20,
        months: 10,
      },
    ],
    totalYears: 20,
    totalMonths: 10,
    description:
      'ELIGIBLE: Age 65, 250 months. Pension $451.39/month, no tax (< $500)',
    employmentSector: EmploymentSector.PUBLIC,
    referenceRemuneration: 650.0,
    category: 'old-age',
  },

  // Case OA-4: ELIGIBLE - High Pension, WITH TAX
  // Age 63, Contribution 300 months (25y) - High salary
  // Calculated: $1000 × (300/360) = $833.33 → Tax: 10% on ($833.33 - $500)
  // Tax: $33.33 → Final: $800
  TL1000004: {
    niss: 'TL1000004',
    name: 'Francisco Amaral',
    dateOfBirth: '1962-03-10', // Age 63
    contributionHistory: [
      {
        startYear: 2000,
        endYear: 2025,
        company: 'Companhia Petróleo Timor',
        years: 25,
        months: 0,
      },
    ],
    totalYears: 25,
    totalMonths: 0,
    description:
      'ELIGIBLE: Age 63, 300 months, high pension $833.33. Tax $33.33 → Final $800/month',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 1000.0,
    category: 'old-age',
  },

  // Case OA-5: ELIGIBLE - Maximum Contribution (30 years)
  // Age 68, Contribution 360 months (30y - maximum) - Very high salary
  // Calculated: $1200 × (360/360) = $1200 → Tax: 10% on $700
  // Tax: $70 → Final: $1130
  TL1000005: {
    niss: 'TL1000005',
    name: 'Manuel Guterres',
    dateOfBirth: '1957-09-20', // Age 68
    contributionHistory: [
      {
        startYear: 1995,
        endYear: 2025,
        company: 'Ministério das Finanças',
        years: 30,
        months: 0,
      },
    ],
    totalYears: 30,
    totalMonths: 0,
    description:
      'ELIGIBLE: Age 68, 360 months (max), pension $1200. Tax $70 → Final $1130/month',
    employmentSector: EmploymentSector.PUBLIC,
    referenceRemuneration: 1200.0,
    category: 'old-age',
  },

  // Case OA-6: ELIGIBLE - Borderline Exact Age 60
  // Age exactly 60, Contribution 100 months (8y 4m)
  // Calculated: $400 × (100/360) = $111.11 → Minimum: 2×SP = $120
  TL1000006: {
    niss: 'TL1000006',
    name: 'Teresa Soares',
    dateOfBirth: '1965-01-01', // Age exactly 60
    contributionHistory: [
      {
        startYear: 2016,
        endYear: 2025,
        company: 'Hotel Timor Plaza',
        years: 8,
        months: 4,
      },
    ],
    totalYears: 8,
    totalMonths: 4,
    description:
      'ELIGIBLE (Borderline): Age exactly 60, 100 months. Pension $120/month (2×SP minimum)',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 400.0,
    category: 'old-age',
  },

  // Case OA-7: ELIGIBLE - Borderline Exact Required Contribution (2025)
  // Age 61, Contribution exactly 78 months (2025 requirement)
  // Calculated: $320 × (78/360) = $69.33 → Minimum: 2×SP = $120
  TL1000007: {
    niss: 'TL1000007',
    name: 'Lucia Belo',
    dateOfBirth: '1964-06-15', // Age 61
    contributionHistory: [
      {
        startYear: 2018,
        endYear: 2025,
        company: 'Construção Civil Timor',
        years: 6,
        months: 6,
      },
    ],
    totalYears: 6,
    totalMonths: 6,
    description:
      'ELIGIBLE (Borderline): Age 61, exactly 78 months (2025 requirement). Pension $120/month',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 320.0,
    category: 'old-age',
  },

  // ===== REJECTED CASES - CONTRIBUTION =====

  // Case OA-R1: REJECTED - Insufficient Contribution (Below 2025 requirement)
  // Age 62, Contribution 74 months - Below 78 months required for 2025
  TL1000101: {
    niss: 'TL1000101',
    name: 'Beatriz Sousa',
    dateOfBirth: '1963-04-12', // Age 62
    contributionHistory: [
      {
        startYear: 2019,
        endYear: 2025,
        company: 'Restaurante Sabores',
        years: 6,
        months: 2,
      },
    ],
    totalYears: 6,
    totalMonths: 2,
    description:
      'REJECTED: Age 62 (✓) but contribution 74 months < 78 required (2025). Need 4 more months.',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 280.0,
    category: 'old-age',
  },

  // Case OA-R2: REJECTED - Very Low Contribution
  // Age 64, Contribution only 40 months
  TL1000102: {
    niss: 'TL1000102',
    name: 'Domingos Reis',
    dateOfBirth: '1961-01-01', // Age 64
    contributionHistory: [
      {
        startYear: 2021,
        endYear: 2025,
        company: 'Timor Gap',
        years: 3,
        months: 4,
      },
    ],
    totalYears: 3,
    totalMonths: 4,
    description:
      'REJECTED: Age 64 (✓) but very low contribution 40 months < 78 required. Need 38 more months.',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 350.0,
    category: 'old-age',
  },

  // ===== REJECTED CASES - AGE =====

  // Case OA-R3: REJECTED - Age 59 (Below 60)
  // Age 59, Sufficient contribution 120 months but age not met
  TL1000103: {
    niss: 'TL1000103',
    name: 'Carlos Silva',
    dateOfBirth: '1966-09-30', // Age 59
    contributionHistory: [
      {
        startYear: 2015,
        endYear: 2025,
        company: 'Timor Port Authority',
        years: 10,
        months: 0,
      },
    ],
    totalYears: 10,
    totalMonths: 0,
    description:
      'REJECTED: Contribution 120 months (✓) but age 59 < 60 required. Wait 1 year.',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 450.0,
    category: 'old-age',
  },

  // Case OA-R4: REJECTED - Age 57 (Early retirement NOT APPLY)
  // Age 57, Sufficient contribution 150 months
  // NOTE: Early retirement removed - must wait until 60
  TL1000104: {
    niss: 'TL1000104',
    name: 'Rosa Martins',
    dateOfBirth: '1968-08-22', // Age 57
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
      'REJECTED: Age 57 < 60. Early retirement NOT APPLY. Must wait until 60.',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 380.0,
    category: 'old-age',
  },

  // ========================================================================
  // DISABILITY PENSION (RCSS - CONTRIBUTORY SCHEME)
  // ========================================================================
  // Requirements:
  // - ABSOLUTE INVALIDITY: Fixed 4×SP = $240/month
  // - RELATIVE INVALIDITY: Salary-based (employer max 1/3, INSS rest)
  // - Contribution: Progressive by year (2025: 60 months, 2026+: 60 months)
  // - Age: No requirement (but auto-converts at 60 to old-age)
  // ========================================================================

  // ===== ABSOLUTE INVALIDITY CASES =====

  // Case DIS-A1: ELIGIBLE - Absolute Invalidity, Gets Fixed $240
  // Age 45, Contribution 99 months - Well above minimum
  // Pension: Fixed 4×SP = $240 (regardless of R or N)
  TL2000001: {
    niss: 'TL2000001',
    name: 'Antonio Belo',
    dateOfBirth: '1980-05-15', // Age 45
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
      'ELIGIBLE (Absolute Invalidity): Age 45, 99 months. Fixed pension $240/month (4×SP)',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 450.0, // Not used for absolute invalidity
    category: 'disability',
  },

  // Case DIS-A2: ELIGIBLE - Absolute, Borderline Contribution
  // Age 42, Contribution exactly 60 months (2025 requirement)
  // Pension: Fixed 4×SP = $240
  TL2000002: {
    niss: 'TL2000002',
    name: 'Isabel Guterres',
    dateOfBirth: '1983-03-10', // Age 42
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
      'ELIGIBLE (Borderline - Absolute): Age 42, exactly 60 months (2025 min). Fixed $240/month',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 380.0,
    category: 'disability',
  },

  // Case DIS-A3: ELIGIBLE - Absolute, Near Retirement Age (Will Auto-Convert)
  // Age 59, Contribution 264 months - Will auto-convert at 60
  // Pension: Fixed $240 now, will recalculate at 60
  TL2000003: {
    niss: 'TL2000003',
    name: 'Paulo Alves',
    dateOfBirth: '1966-02-20', // Age 59
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
      'ELIGIBLE (Absolute): Age 59, 264 months. Fixed $240 now. Will auto-convert to old-age at 60.',
    employmentSector: EmploymentSector.PUBLIC,
    referenceRemuneration: 650.0,
    category: 'disability',
  },

  // ===== RELATIVE INVALIDITY CASES =====

  // Case DIS-R1: ELIGIBLE - Relative Invalidity, Employer Pays 1/3
  // Age 38, Contribution 72 months, Monthly Salary $600
  // Employer pays max: 1/3 × $600 = $200
  // INSS pays: $600 - $200 = $400
  TL2000011: {
    niss: 'TL2000011',
    name: 'Jose Fernandes',
    dateOfBirth: '1987-03-20', // Age 38
    contributionHistory: [
      {
        startYear: 2019,
        endYear: 2025,
        company: 'Hospital Nacional Guido Valadares',
        years: 6,
        months: 0,
      },
    ],
    totalYears: 6,
    totalMonths: 0,
    description:
      'ELIGIBLE (Relative Invalidity): Salary $600. Employer pays $200 (1/3), INSS pays $400. Valid 3 years.',
    employmentSector: EmploymentSector.PUBLIC,
    referenceRemuneration: 550.0,
    monthlySalary: 600.0, // Current salary for relative invalidity
    category: 'disability',
  },

  // Case DIS-R2: ELIGIBLE - Relative Invalidity, Employer Exceeds 1/3 Limit
  // Age 50, Contribution 90 months, Monthly Salary $900
  // Employer wants to pay $400, but max is 1/3 × $900 = $300
  // INSS pays: $900 - $300 = $600
  TL2000012: {
    niss: 'TL2000012',
    name: 'Maria Santos',
    dateOfBirth: '1975-08-22', // Age 50
    contributionHistory: [
      {
        startYear: 2017,
        endYear: 2025,
        company: 'Banco Nacional Timor',
        years: 7,
        months: 6,
      },
    ],
    totalYears: 7,
    totalMonths: 6,
    description:
      'ELIGIBLE (Relative): Salary $900. Employer max $300 (1/3), INSS pays $600. Valid 3 years.',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 820.0,
    monthlySalary: 900.0,
    category: 'disability',
  },

  // ===== REJECTED CASES - DISABILITY =====

  // Case DIS-R3: REJECTED - Insufficient Contribution
  // Age 35, Contribution 56 months - Below 60 required for 2025
  TL2000101: {
    niss: 'TL2000101',
    name: 'Fernando Costa',
    dateOfBirth: '1990-07-15', // Age 35
    contributionHistory: [
      {
        startYear: 2020,
        endYear: 2025,
        company: 'Restaurante Timor',
        years: 4,
        months: 8,
      },
    ],
    totalYears: 4,
    totalMonths: 8,
    description:
      'REJECTED (Disability): Contribution 56 months < 60 required (2025). Need 4 more months.',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 320.0,
    category: 'disability',
  },

  // Case DIS-R4: REJECTED - Very Low Contribution
  // Age 28, Contribution 42 months
  TL2000102: {
    niss: 'TL2000102',
    name: 'Joana Silva',
    dateOfBirth: '1997-03-20', // Age 28
    contributionHistory: [
      {
        startYear: 2021,
        endYear: 2025,
        company: 'Café Timor',
        years: 3,
        months: 6,
      },
    ],
    totalYears: 3,
    totalMonths: 6,
    description:
      'REJECTED (Disability): Very low contribution 42 months < 60. Need 18 more months.',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 280.0,
    category: 'disability',
  },

  // ========================================================================
  // SURVIVOR PENSION (RCSS - CONTRIBUTORY SCHEME)
  // ========================================================================
  // Requirements:
  // - Same as Disability: Progressive (2025: 60 months)
  // - One-Time Subsidy: 3 × R
  // - Monthly Payment:
  //   - No spouse + children: 100% to children
  //   - Spouse only: 65% to spouse
  //   - Spouse + children: 100% to 1 contact (family decides)
  // ========================================================================

  // ===== ELIGIBLE CASES - DIFFERENT FAMILY SCENARIOS =====

  // Case SUR-1: ELIGIBLE - Spouse Only (No Children)
  // Deceased: Age 50, Contribution 120 months
  // Pension: 65% to spouse
  // Calculated: $800 × (120/360) = $266.67 → Minimum: 2×SP = $120
  // Use $266.67 × 65% = $173.33
  TL3000001: {
    niss: 'TL3000001',
    name: 'Fernando da Costa (Deceased)',
    dateOfBirth: '1975-03-15', // Age 50
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
      'ELIGIBLE (Survivor): Spouse only, no children. Pension $266.67 × 65% = $173.33/month to spouse',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 800.0,
    category: 'survivor',
  },

  // Case SUR-2: ELIGIBLE - Children Only (No Spouse)
  // Deceased: Age 45, Contribution 180 months, 3 Children
  // Pension: 100% to children (until 18, or 24 if education)
  // Calculated: $750 × (180/360) = $375 → Use $375 × 100% = $375
  TL3000002: {
    niss: 'TL3000002',
    name: 'Maria Soares (Deceased)',
    dateOfBirth: '1980-06-20', // Age 45
    contributionHistory: [
      {
        startYear: 2010,
        endYear: 2025,
        company: 'Hospital Nacional',
        years: 15,
        months: 0,
      },
    ],
    totalYears: 15,
    totalMonths: 0,
    description:
      'ELIGIBLE (Survivor): No spouse, 3 children. Pension $375 × 100% = $375/month to children (split)',
    employmentSector: EmploymentSector.PUBLIC,
    referenceRemuneration: 750.0,
    category: 'survivor',
  },

  // Case SUR-3: ELIGIBLE - Spouse + Children (Complex)
  // Deceased: Age 52, Contribution 200 months, Spouse + 2 Children
  // Pension: 100% to 1 contact (family decides internally)
  // Calculated: $850 × (200/360) = $472.22 → Use $472.22 × 100% = $472.22
  TL3000003: {
    niss: 'TL3000003',
    name: 'João Pereira (Deceased)',
    dateOfBirth: '1973-11-10', // Age 52
    contributionHistory: [
      {
        startYear: 2008,
        endYear: 2025,
        company: 'Timor Telecom',
        years: 16,
        months: 8,
      },
    ],
    totalYears: 16,
    totalMonths: 8,
    description:
      'ELIGIBLE (Survivor): Spouse + 2 children. Pension $472.22 × 100% = $472.22 to 1 contact. Family decides split.',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 850.0,
    category: 'survivor',
  },

  // Case SUR-4: ELIGIBLE - One-Time Subsidy (Funeral)
  // Deceased: Age 48, Contribution 90 months
  // One-time subsidy: 3 × R = 3 × $600 = $1,800
  TL3000004: {
    niss: 'TL3000004',
    name: 'Pedro Guterres (Deceased)',
    dateOfBirth: '1977-04-15', // Age 48
    contributionHistory: [
      {
        startYear: 2017,
        endYear: 2025,
        company: 'Construção Civil',
        years: 7,
        months: 6,
      },
    ],
    totalYears: 7,
    totalMonths: 6,
    description:
      'ELIGIBLE (Survivor): One-time subsidy 3 × $600 = $1,800 (funeral/invasion payment)',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 600.0,
    category: 'survivor',
  },

  // Case SUR-5: ELIGIBLE - Borderline Contribution (Exactly 60 months)
  // Deceased: Age 40, Contribution exactly 60 months
  // Calculated: $500 × (60/360) = $83.33 → Minimum: 2×SP = $120
  // Spouse only: $120 × 65% = $78
  TL3000005: {
    niss: 'TL3000005',
    name: 'Ana Belo (Deceased)',
    dateOfBirth: '1985-09-01', // Age 40
    contributionHistory: [
      {
        startYear: 2020,
        endYear: 2025,
        company: 'Café Timor',
        years: 5,
        months: 0,
      },
    ],
    totalYears: 5,
    totalMonths: 0,
    description:
      'ELIGIBLE (Borderline): Exactly 60 months. Pension $120 (min) × 65% = $78/month to spouse',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 500.0,
    category: 'survivor',
  },

  // ===== REJECTED CASES - SURVIVOR =====

  // Case SUR-R1: REJECTED - Insufficient Contribution (Below 60)
  // Deceased: Age 35, Contribution 48 months - Below minimum
  TL3000101: {
    niss: 'TL3000101',
    name: 'Carlos Reis (Deceased)',
    dateOfBirth: '1990-02-15', // Age 35
    contributionHistory: [
      {
        startYear: 2021,
        endYear: 2025,
        company: 'Restaurante Sabores',
        years: 4,
        months: 0,
      },
    ],
    totalYears: 4,
    totalMonths: 0,
    description:
      'REJECTED (Survivor): Contribution 48 months < 60 required. Need 12 more months.',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 400.0,
    category: 'survivor',
  },

  // Case SUR-R2: REJECTED - Very Low Contribution
  // Deceased: Age 28, Contribution 30 months
  TL3000102: {
    niss: 'TL3000102',
    name: 'Rosa Lima (Deceased)',
    dateOfBirth: '1997-07-15', // Age 28
    contributionHistory: [
      {
        startYear: 2022,
        endYear: 2025,
        company: 'Hotel Timor',
        years: 2,
        months: 6,
      },
    ],
    totalYears: 2,
    totalMonths: 6,
    description:
      'REJECTED (Survivor): Very low contribution 30 months < 60. Need 30 more months.',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 350.0,
    category: 'survivor',
  },

  // ========================================================================
  // NON-CONTRIBUTORY SAII (SOCIAL WELFARE)
  // ========================================================================
  // OLD-AGE SAII:
  // - 60-69 years: $60/month
  // - 70-79 years: $80/month
  // - 80+ years: $100/month
  // - No contribution required (citizenship-based)
  //
  // INVALIDITY SAII:
  // - 15+ years old, permanently incapacitated
  // - $60/month
  // - No contribution required
  // ========================================================================

  // ===== OLD-AGE SAII CASES =====

  // Case SAII-OA1: ELIGIBLE - Age 65 (60-69 group)
  // No contribution history, $60/month
  TL4000001: {
    niss: 'TL4000001',
    name: 'Lucia Martins',
    dateOfBirth: '1960-05-20', // Age 65
    contributionHistory: [],
    totalYears: 0,
    totalMonths: 0,
    description:
      'ELIGIBLE (SAII Old-Age): Age 65, no contribution. Age group 60-69 → $60/month',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 0,
    category: 'saii',
  },

  // Case SAII-OA2: ELIGIBLE - Age 75 (70-79 group)
  // No contribution history, $80/month
  TL4000002: {
    niss: 'TL4000002',
    name: 'Manuel Alves',
    dateOfBirth: '1950-08-15', // Age 75
    contributionHistory: [],
    totalYears: 0,
    totalMonths: 0,
    description:
      'ELIGIBLE (SAII Old-Age): Age 75, no contribution. Age group 70-79 → $80/month',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 0,
    category: 'saii',
  },

  // Case SAII-OA3: ELIGIBLE - Age 85 (80+ group)
  // No contribution history, $100/month
  TL4000003: {
    niss: 'TL4000003',
    name: 'Teresa Amaral',
    dateOfBirth: '1940-12-10', // Age 85
    contributionHistory: [],
    totalYears: 0,
    totalMonths: 0,
    description:
      'ELIGIBLE (SAII Old-Age): Age 85, no contribution. Age group 80+ → $100/month',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 0,
    category: 'saii',
  },

  // Case SAII-OA4: ELIGIBLE - Borderline Age 60
  // Exactly 60 years old, $60/month
  TL4000004: {
    niss: 'TL4000004',
    name: 'Francisco Silva',
    dateOfBirth: '1965-01-01', // Age exactly 60
    contributionHistory: [],
    totalYears: 0,
    totalMonths: 0,
    description:
      'ELIGIBLE (Borderline SAII): Age exactly 60, no contribution → $60/month',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 0,
    category: 'saii',
  },

  // Case SAII-OA5: ELIGIBLE - Borderline Age 70
  // Exactly 70 years old, $80/month
  TL4000005: {
    niss: 'TL4000005',
    name: 'Isabel Costa',
    dateOfBirth: '1955-01-01', // Age exactly 70
    contributionHistory: [],
    totalYears: 0,
    totalMonths: 0,
    description: 'ELIGIBLE (Borderline SAII): Age exactly 70 → $80/month',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 0,
    category: 'saii',
  },

  // Case SAII-OA6: NOT ELIGIBLE - Age 59 (Below 60)
  // Too young for SAII
  TL4000106: {
    niss: 'TL4000106',
    name: 'Paulo Soares',
    dateOfBirth: '1966-03-15', // Age 59
    contributionHistory: [],
    totalYears: 0,
    totalMonths: 0,
    description: 'NOT ELIGIBLE (SAII): Age 59 < 60 required. Wait 1 year.',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 0,
    category: 'saii',
  },

  // ===== INVALIDITY SAII CASES =====

  // Case SAII-INV1: ELIGIBLE - Age 25, Permanently Incapacitated
  // No contribution, $60/month
  TL4000011: {
    niss: 'TL4000011',
    name: 'Antonio Reis',
    dateOfBirth: '2000-06-20', // Age 25
    contributionHistory: [],
    totalYears: 0,
    totalMonths: 0,
    description:
      'ELIGIBLE (SAII Invalidity): Age 25, permanently incapacitated, no contribution → $60/month',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 0,
    category: 'saii',
  },

  // Case SAII-INV2: ELIGIBLE - Age 18 (Young Adult)
  // Permanently incapacitated since youth, $60/month
  TL4000012: {
    niss: 'TL4000012',
    name: 'Maria Fernandes',
    dateOfBirth: '2007-09-15', // Age 18
    contributionHistory: [],
    totalYears: 0,
    totalMonths: 0,
    description:
      'ELIGIBLE (SAII Invalidity): Age 18, permanently incapacitated → $60/month',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 0,
    category: 'saii',
  },

  // Case SAII-INV3: ELIGIBLE - Borderline Age 15
  // Exactly 15 years old (minimum), $60/month
  TL4000013: {
    niss: 'TL4000013',
    name: 'João Santos',
    dateOfBirth: '2010-01-01', // Age exactly 15
    contributionHistory: [],
    totalYears: 0,
    totalMonths: 0,
    description:
      'ELIGIBLE (Borderline SAII Invalidity): Age exactly 15 (minimum) → $60/month',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 0,
    category: 'saii',
  },

  // Case SAII-INV4: NOT ELIGIBLE - Age 14 (Below 15)
  // Too young for SAII Invalidity
  TL4000114: {
    niss: 'TL4000114',
    name: 'Rosa Guterres',
    dateOfBirth: '2011-06-20', // Age 14
    contributionHistory: [],
    totalYears: 0,
    totalMonths: 0,
    description: 'NOT ELIGIBLE (SAII Invalidity): Age 14 < 15 required.',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 0,
    category: 'saii',
  },

  // ========================================================================
  // SPECIAL / EDGE CASES
  // ========================================================================

  // Case EDGE-1: Contribution Exceeds Max (360 months)
  // Age 70, Contribution 400 months - Should cap at 360
  // Calculated: $900 × (360/360) = $900 → Tax: $40 → Final: $860
  TL9000001: {
    niss: 'TL9000001',
    name: 'Domingos Amaral',
    dateOfBirth: '1955-03-15', // Age 70
    contributionHistory: [
      {
        startYear: 1992,
        endYear: 2025,
        company: 'Ministério da Justiça',
        years: 33,
        months: 4,
      },
    ],
    totalYears: 33,
    totalMonths: 4, // 400 months total
    description:
      'EDGE CASE: Contribution 400 months → Capped at 360. Pension $900, tax $40 → Final $860',
    employmentSector: EmploymentSector.PUBLIC,
    referenceRemuneration: 900.0,
    category: 'old-age',
  },

  // Case EDGE-2: Pension Exactly $500 (No Tax Threshold)
  // Age 63, Contribution 220 months
  // Calculated: $818.18 × (220/360) = $500 → No tax
  TL9000002: {
    niss: 'TL9000002',
    name: 'Beatriz Lima',
    dateOfBirth: '1962-06-20', // Age 63
    contributionHistory: [
      {
        startYear: 2006,
        endYear: 2025,
        company: 'Timor Port Authority',
        years: 18,
        months: 4,
      },
    ],
    totalYears: 18,
    totalMonths: 4,
    description: 'EDGE CASE: Pension exactly $500 (threshold). No tax applied.',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 818.18,
    category: 'old-age',
  },

  // Case EDGE-3: Very High Pension (Tax Scenario)
  // Age 66, Contribution 360 months
  // Calculated: $2000 × (360/360) = $2000 → Tax: $150 → Final: $1850
  TL9000003: {
    niss: 'TL9000003',
    name: 'Fernando Gusmão',
    dateOfBirth: '1959-09-10', // Age 66
    contributionHistory: [
      {
        startYear: 1995,
        endYear: 2025,
        company: 'Companhia Petróleo Timor',
        years: 30,
        months: 0,
      },
    ],
    totalYears: 30,
    totalMonths: 0,
    description:
      'EDGE CASE: Very high pension $2000. Tax $150 (10% on $1500) → Final $1850',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 2000.0,
    category: 'old-age',
  },

  // Case EDGE-4: Borderline Between Minimum Levels
  // Age 61, Contribution exactly 120 months (border between 2×SP and 3×SP)
  // Calculated: $380 × (120/360) = $126.67 → Minimum: 2×SP = $120
  // Use calculated $126.67 (just above minimum)
  TL9000004: {
    niss: 'TL9000004',
    name: 'Carlos Pereira',
    dateOfBirth: '1964-04-15', // Age 61
    contributionHistory: [
      {
        startYear: 2015,
        endYear: 2025,
        company: 'Hotel Timor Plaza',
        years: 10,
        months: 0,
      },
    ],
    totalYears: 10,
    totalMonths: 0,
    description:
      'EDGE CASE: Exactly 120 months (border). Calculated $126.67 > 2×SP, use calculated',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 380.0,
    category: 'old-age',
  },

  // Case EDGE-5: Zero Reference Remuneration (Invalid)
  // Age 62, Contribution 100 months, R = $0 (error case)
  TL9000005: {
    niss: 'TL9000005',
    name: 'Invalid Data Test',
    dateOfBirth: '1963-11-20', // Age 62
    contributionHistory: [
      {
        startYear: 2017,
        endYear: 2025,
        company: 'Test Company',
        years: 8,
        months: 4,
      },
    ],
    totalYears: 8,
    totalMonths: 4,
    description: 'EDGE CASE (Invalid): R = $0. Should get minimum 2×SP = $120',
    employmentSector: EmploymentSector.PRIVATE,
    referenceRemuneration: 0,
    category: 'old-age',
  },
};

/**
 * Get mock citizen data by NISS
 * Supports both exact match and partial match
 */
export function getMockCitizenByNISS(niss: string): MockCitizenData | null {
  const normalizedNiss = niss.toUpperCase();

  // Try exact match first
  if (MOCK_CITIZENS[normalizedNiss]) {
    return MOCK_CITIZENS[normalizedNiss];
  }

  // Try partial match (at least 5 characters)
  if (niss.length >= 5) {
    const key = Object.keys(MOCK_CITIZENS).find(
      (k) =>
        k.toLowerCase().includes(niss.toLowerCase()) ||
        niss.toLowerCase().includes(k.toLowerCase().substring(0, 5))
    );
    return key ? MOCK_CITIZENS[key] : null;
  }

  return null;
}

/**
 * Get all mock citizens by category
 */
export function getMockCitizensByCategory(
  category: 'old-age' | 'disability' | 'survivor' | 'saii'
): MockCitizenData[] {
  return Object.values(MOCK_CITIZENS).filter((c) => c.category === category);
}

/**
 * Get summary statistics
 */
export function getMockDataSummary() {
  const citizens = Object.values(MOCK_CITIZENS);
  return {
    total: citizens.length,
    oldAge: citizens.filter((c) => c.category === 'old-age').length,
    disability: citizens.filter((c) => c.category === 'disability').length,
    survivor: citizens.filter((c) => c.category === 'survivor').length,
    saii: citizens.filter((c) => c.category === 'saii').length,
  };
}

/**
 * Test case categories for documentation
 */
export const TEST_CASE_CATEGORIES = {
  OLD_AGE_ELIGIBLE: 'TL1000001 - TL1000007',
  OLD_AGE_REJECTED_CONTRIBUTION: 'TL1000101 - TL1000102',
  OLD_AGE_REJECTED_AGE: 'TL1000103 - TL1000104',
  DISABILITY_ABSOLUTE: 'TL2000001 - TL2000003',
  DISABILITY_RELATIVE: 'TL2000011 - TL2000012',
  DISABILITY_REJECTED: 'TL2000101 - TL2000102',
  SURVIVOR_ELIGIBLE: 'TL3000001 - TL3000005',
  SURVIVOR_REJECTED: 'TL3000101 - TL3000102',
  SAII_OLD_AGE: 'TL4000001 - TL4000006, TL4000106',
  SAII_INVALIDITY: 'TL4000011 - TL4000014, TL4000114',
  EDGE_CASES: 'TL9000001 - TL9000005',
};

/**
 * Check if NISS is already assigned to a benefit scheme
 */
export function isNISSAlreadyAssigned(niss: string): boolean {
  return niss === 'TL999999999';
}
