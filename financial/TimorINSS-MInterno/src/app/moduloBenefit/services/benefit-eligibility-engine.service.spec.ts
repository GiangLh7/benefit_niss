/**
 * Unit Tests for Benefit Eligibility Engine Service
 * 
 * Tests all eligibility rules and calculations for:
 * - Old-Age Pension (normal and early retirement)
 * - Disability Pension
 * - Survivor Pension
 * 
 * Uses mock data test cases to ensure correctness
 */

import { TestBed } from '@angular/core/testing';
import { BenefitEligibilityEngineService, EligibilityInput } from './benefit-eligibility-engine.service';
import { EmploymentSector } from '../constants/eligibility.constants';

describe('BenefitEligibilityEngineService', () => {
  let service: BenefitEligibilityEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BenefitEligibilityEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Old-Age Pension Eligibility', () => {
    const currentYear = 2025;

    describe('Normal Retirement - ELIGIBLE Cases', () => {
      it('should be eligible for normal retirement (TL123456789): 62 years, 308 months, Private', () => {
        const input: EligibilityInput = {
          dateOfBirth: '1963-08-15', // 62 years old
          contributionMonths: 308, // 25 years 8 months
          employmentSector: EmploymentSector.PRIVATE,
          currentYear,
        };

        const result = service.checkOldAgePensionEligibility(input);

        expect(result.eligible).toBe(true);
        expect(result.isEarlyRetirement).toBe(false);
        expect(result.rejectionReason).toBeUndefined();
        expect(result.currentAge).toBe(62);
        expect(result.currentContributionMonths).toBe(308);
      });

      it('should be eligible for normal retirement (TL333333333): 60 years, 180 months, Private', () => {
        const input: EligibilityInput = {
          dateOfBirth: '1965-11-01', // 60 years old
          contributionMonths: 180, // 15 years
          employmentSector: EmploymentSector.PRIVATE,
          currentYear,
        };

        const result = service.checkOldAgePensionEligibility(input);

        expect(result.eligible).toBe(true);
        expect(result.isEarlyRetirement).toBe(false);
      });
    });

    describe('Early Retirement - ELIGIBLE Cases', () => {
      it('should be eligible for early retirement (TL555555555): 57 years, 150 months, Private', () => {
        const input: EligibilityInput = {
          dateOfBirth: '1968-03-10', // 57 years old
          contributionMonths: 150, // 12 years 6 months
          employmentSector: EmploymentSector.PRIVATE,
          currentYear,
        };

        const result = service.checkOldAgePensionEligibility(input);

        expect(result.eligible).toBe(true);
        expect(result.isEarlyRetirement).toBe(true);
        expect(result.currentAge).toBe(57);
        expect(result.currentContributionMonths).toBe(150);
      });

      it('should be eligible for early retirement (TL999999998): 55 years, 78 months, Private', () => {
        const input: EligibilityInput = {
          dateOfBirth: '1970-01-01', // 55 years old (minimum)
          contributionMonths: 78, // 6 years 6 months (exactly minimum for 2025)
          employmentSector: EmploymentSector.PRIVATE,
          currentYear,
        };

        const result = service.checkOldAgePensionEligibility(input);

        expect(result.eligible).toBe(true);
        expect(result.isEarlyRetirement).toBe(true);
      });
    });

    describe('REJECTED Cases - Insufficient Contribution', () => {
      it('should reject (TL444444444): 62 years, 74 months < 78 months required', () => {
        const input: EligibilityInput = {
          dateOfBirth: '1963-01-15', // 62 years old
          contributionMonths: 74, // 6 years 2 months < 78 required
          employmentSector: EmploymentSector.PRIVATE,
          currentYear,
        };

        const result = service.checkOldAgePensionEligibility(input);

        expect(result.eligible).toBe(false);
        expect(result.rejectionReason).toBe('contribution');
        expect(result.currentContributionMonths).toBe(74);
        expect(result.requiredContributionMonths).toBe(78);
      });
    });

    describe('REJECTED Cases - Insufficient Age', () => {
      it('should reject (TL222222222): 58 years, 219 months, Public (needs 65)', () => {
        const input: EligibilityInput = {
          dateOfBirth: '1967-05-10', // 58 years old
          contributionMonths: 219, // 18 years 3 months
          employmentSector: EmploymentSector.PUBLIC,
          currentYear,
        };

        const result = service.checkOldAgePensionEligibility(input);

        expect(result.eligible).toBe(false);
        expect(result.rejectionReason).toBe('age');
        expect(result.currentAge).toBe(58);
        expect(result.requiredAge).toBe(65);
      });

      it('should reject (TL888888888): 52 years, 200 months, Private (too young)', () => {
        const input: EligibilityInput = {
          dateOfBirth: '1973-04-12', // 52 years old
          contributionMonths: 200, // 16 years 8 months
          employmentSector: EmploymentSector.PRIVATE,
          currentYear,
        };

        const result = service.checkOldAgePensionEligibility(input);

        expect(result.eligible).toBe(false);
        expect(result.rejectionReason).toBe('age');
        expect(result.currentAge).toBe(52);
      });
    });

    describe('REJECTED Cases - Public Sector Early Retirement', () => {
      it('should reject (TL777777777): 58 years, 200 months, Public (cannot early retire)', () => {
        const input: EligibilityInput = {
          dateOfBirth: '1967-09-20', // 58 years old
          contributionMonths: 200, // 16 years 8 months
          employmentSector: EmploymentSector.PUBLIC,
          currentYear,
        };

        const result = service.checkOldAgePensionEligibility(input);

        expect(result.eligible).toBe(false);
        expect(result.rejectionReason).toBe('age');
        expect(result.requiredAge).toBe(65);
      });
    });
  });

  describe('Disability Pension Eligibility', () => {
    const currentYear = 2025;

    it('should be eligible (TLD111111111): 45 years, 99 months', () => {
      const input: EligibilityInput = {
        dateOfBirth: '1980-05-15', // 45 years old
        contributionMonths: 99, // 8 years 3 months
        employmentSector: EmploymentSector.PRIVATE,
        currentYear,
      };

      const result = service.checkDisabilityPensionEligibility(input);

      expect(result.eligible).toBe(true);
      expect(result.currentContributionMonths).toBe(99);
      expect(result.requiredContributionMonths).toBe(60);
    });

    it('should be eligible (TLD555555555): 55 years, 60 months (exactly minimum)', () => {
      const input: EligibilityInput = {
        dateOfBirth: '1970-02-20', // 55 years old
        contributionMonths: 60, // Exactly minimum for 2025
        employmentSector: EmploymentSector.PRIVATE,
        currentYear,
      };

      const result = service.checkDisabilityPensionEligibility(input);

      expect(result.eligible).toBe(true);
      expect(result.currentContributionMonths).toBe(60);
    });

    it('should reject (TLD333333333): 42 years, 56 months < 60 required', () => {
      const input: EligibilityInput = {
        dateOfBirth: '1983-03-10', // 42 years old
        contributionMonths: 56, // 4 years 8 months < 60
        employmentSector: EmploymentSector.PRIVATE,
        currentYear,
      };

      const result = service.checkDisabilityPensionEligibility(input);

      expect(result.eligible).toBe(false);
      expect(result.rejectionReason).toBe('contribution');
      expect(result.currentContributionMonths).toBe(56);
      expect(result.requiredContributionMonths).toBe(60);
    });
  });

  describe('Pension Calculations', () => {
    describe('Old-Age Pension Calculation', () => {
      it('should calculate normal retirement pension: P = R × (N / 360)', () => {
        const R = 150.0; // Reference remuneration
        const N = 308; // Contribution months (25 years 8 months)

        const result = service.calculateOldAgePension(R, N, false);

        expect(result.calculatedPension).toBeCloseTo(128.33, 2); // 150 × (308 / 360)
        expect(result.referenceRemuneration).toBe(150.0);
        expect(result.contributionMonths).toBe(308);
        expect(result.minimumGuaranteedPension).toBeUndefined();
        expect(result.finalPension).toBeCloseTo(128.33, 2);
      });

      it('should calculate early retirement with minimum guaranteed pension', () => {
        const R = 125.0; // Reference remuneration
        const N = 126; // Contribution months (10 years 6 months)
        const SAII = 100.0; // SAII amount

        const result = service.calculateOldAgePension(R, N, true, SAII);

        const calculated = (125.0 * 126) / 360; // 43.75
        const minimumGuaranteed = 1.5 * SAII; // 150.0

        expect(result.calculatedPension).toBeCloseTo(43.75, 2);
        expect(result.minimumGuaranteedPension).toBe(150.0);
        expect(result.finalPension).toBe(150.0); // Max of 43.75 and 150.0
      });

      it('should use calculated pension if higher than minimum guaranteed', () => {
        const R = 200.0; // Higher reference remuneration
        const N = 150; // Contribution months
        const SAII = 100.0;

        const result = service.calculateOldAgePension(R, N, true, SAII);

        const calculated = (200.0 * 150) / 360; // 83.33
        const minimumGuaranteed = 1.5 * SAII; // 150.0

        expect(result.calculatedPension).toBeCloseTo(83.33, 2);
        expect(result.minimumGuaranteedPension).toBe(150.0);
        expect(result.finalPension).toBe(150.0); // Max of 83.33 and 150.0
      });
    });

    describe('Disability Pension Calculation', () => {
      it('should calculate disability pension: P = R × (N / 360)', () => {
        const R = 180.0;
        const N = 99; // 8 years 3 months
        const disabilityLevel = 75.0; // 75% disability

        const result = service.calculateDisabilityPension(R, N, disabilityLevel);

        expect(result.calculatedPension).toBeCloseTo(49.5, 2); // 180 × (99 / 360)
        expect(result.finalPension).toBeCloseTo(49.5, 2);
      });
    });

    describe('Survivor Pension Calculations', () => {
      it('should calculate monthly survivor pension: (R × (N / 360)) × percentage', () => {
        const R = 200.0;
        const N = 240; // 20 years
        const percentage = 65; // 65% for spouse only

        const result = service.calculateSurvivorMonthlyPension(R, N, percentage);

        const deceasedPension = (200.0 * 240) / 360; // 133.33
        const survivorPension = (deceasedPension * 65) / 100; // 86.67

        expect(result.calculatedPension).toBeCloseTo(86.67, 2);
        expect(result.finalPension).toBeCloseTo(86.67, 2);
      });

      it('should calculate one-time subsidy: 3 × R', () => {
        const R = 200.0;

        const result = service.calculateSurvivorOneTimeSubsidy(R);

        expect(result).toBe(600.0); // 3 × 200
      });

      it('should calculate funeral reimbursement: min(actual, 3 × R)', () => {
        const R = 200.0;
        const maxReimbursement = 3 * R; // 600

        // Case 1: Actual expenses less than max
        const result1 = service.calculateSurvivorFuneralReimbursement(400, R);
        expect(result1).toBe(400);

        // Case 2: Actual expenses more than max
        const result2 = service.calculateSurvivorFuneralReimbursement(800, R);
        expect(result2).toBe(600); // Capped at 3 × R
      });
    });
  });

  describe('Helper Methods', () => {
    it('should get minimum contribution months for different years', () => {
      expect(service.getMinimumContributionMonths(2017)).toBe(60);
      expect(service.getMinimumContributionMonths(2022)).toBe(60);
      expect(service.getMinimumContributionMonths(2023)).toBe(66);
      expect(service.getMinimumContributionMonths(2024)).toBe(72);
      expect(service.getMinimumContributionMonths(2025)).toBe(78);
      expect(service.getMinimumContributionMonths(2031)).toBe(114);
    });

    it('should get minimum retirement age by sector', () => {
      expect(service.getMinimumRetirementAge(EmploymentSector.PRIVATE)).toBe(60);
      expect(service.getMinimumRetirementAge(EmploymentSector.PUBLIC)).toBe(65);
    });

    it('should check early retirement eligibility', () => {
      const eligibleInput: EligibilityInput = {
        dateOfBirth: '1970-03-20', // 55 years old
        contributionMonths: 126, // 10 years 6 months
        employmentSector: EmploymentSector.PRIVATE,
        currentYear: 2025,
      };

      expect(service.isEligibleForEarlyRetirement(eligibleInput)).toBe(true);

      const notEligibleInput: EligibilityInput = {
        dateOfBirth: '1973-04-12', // 52 years old (too young)
        contributionMonths: 200,
        employmentSector: EmploymentSector.PRIVATE,
        currentYear: 2025,
      };

      expect(service.isEligibleForEarlyRetirement(notEligibleInput)).toBe(false);
    });
  });

  describe('Rejection Data Generation', () => {
    it('should generate rejection data for contribution rejection', () => {
      const input: EligibilityInput = {
        dateOfBirth: '1963-01-15',
        contributionMonths: 74, // Insufficient
        employmentSector: EmploymentSector.PRIVATE,
        currentYear: 2025,
      };

      const rejectionData = service.getRejectionData(
        'old-age',
        input,
        'Teresa Soares',
        'TL444444444'
      );

      expect(rejectionData).not.toBeNull();
      expect(rejectionData?.reason).toBe('contribution');
      expect(rejectionData?.citizenName).toBe('Teresa Soares');
      expect(rejectionData?.citizenNiss).toBe('TL444444444');
      expect(rejectionData?.sector).toBe('Private Sector');
    });

    it('should generate rejection data for age rejection', () => {
      const input: EligibilityInput = {
        dateOfBirth: '1967-05-10', // 58 years old
        contributionMonths: 219, // Sufficient
        employmentSector: EmploymentSector.PUBLIC,
        currentYear: 2025,
      };

      const rejectionData = service.getRejectionData(
        'old-age',
        input,
        'Ana Maria Costa',
        'TL222222222'
      );

      expect(rejectionData).not.toBeNull();
      expect(rejectionData?.reason).toBe('age');
      expect(rejectionData?.sector).toBe('Public Sector');
    });
  });
});

