import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Benefit, BenefitRequest, BenefitFilter } from '../models/benefit.model';
import { 
  CompleteBenefitRequest, 
  BenefitRequestDetails 
} from '../interfaces/benefit-request.interface';
import {
  ReferenceRemunerationResult,
  BenefitCalculationResult,
  OldAgePensionCalculation,
  SurvivorPensionCalculation,
  InvalidityPensionCalculation,
  ParentalBenefitCalculation,
  DeathBenefitCalculation,
  CalculationRequest,
  OldAgePensionCalculationRequest,
  SurvivorPensionCalculationRequest,
  ParentalBenefitCalculationRequest
} from '../models/calculation.model';

@Injectable({
  providedIn: 'root'
})
export class BenefitService {
  private apiUrl = `${environment.apiUrl}/benefits`;
  private requestsUrl = `${environment.apiUrl}/benefit-requests`;

  constructor(private http: HttpClient) { }

  /**
   * Get all benefits
   */
  getAllBenefits(): Observable<Benefit[]> {
    return this.http.get<Benefit[]>(this.apiUrl);
  }

  /**
   * Get benefit by ID
   */
  getBenefitById(id: number): Observable<Benefit> {
    return this.http.get<Benefit>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get benefits with filters
   */
  getBenefitsFiltered(filter: BenefitFilter): Observable<Benefit[]> {
    let params = new HttpParams();
    
    if (filter.type) {
      params = params.set('type', filter.type);
    }
    if (filter.status) {
      params = params.set('status', filter.status);
    }
    if (filter.beneficiaryId) {
      params = params.set('beneficiaryId', filter.beneficiaryId.toString());
    }
    if (filter.searchTerm) {
      params = params.set('search', filter.searchTerm);
    }
    if (filter.startDate) {
      params = params.set('startDate', filter.startDate.toISOString());
    }
    if (filter.endDate) {
      params = params.set('endDate', filter.endDate.toISOString());
    }

    return this.http.get<Benefit[]>(this.apiUrl, { params });
  }

  /**
   * Get benefits by beneficiary ID
   */
  getBenefitsByBeneficiaryId(beneficiaryId: number): Observable<Benefit[]> {
    return this.http.get<Benefit[]>(`${this.apiUrl}/beneficiary/${beneficiaryId}`);
  }

  /**
   * Create new benefit
   */
  createBenefit(benefit: BenefitRequest): Observable<Benefit> {
    return this.http.post<Benefit>(this.apiUrl, benefit);
  }

  /**
   * Update existing benefit
   */
  updateBenefit(id: number, benefit: Partial<BenefitRequest>): Observable<Benefit> {
    return this.http.put<Benefit>(`${this.apiUrl}/${id}`, benefit);
  }

  /**
   * Delete benefit
   */
  deleteBenefit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Approve benefit
   */
  approveBenefit(id: number): Observable<Benefit> {
    return this.http.patch<Benefit>(`${this.apiUrl}/${id}/approve`, {});
  }

  /**
   * Suspend benefit
   */
  suspendBenefit(id: number, reason?: string): Observable<Benefit> {
    return this.http.patch<Benefit>(`${this.apiUrl}/${id}/suspend`, { reason });
  }

  /**
   * Cancel benefit
   */
  cancelBenefit(id: number, reason?: string): Observable<Benefit> {
    return this.http.patch<Benefit>(`${this.apiUrl}/${id}/cancel`, { reason });
  }

  /**
   * Reactivate benefit
   */
  reactivateBenefit(id: number): Observable<Benefit> {
    return this.http.patch<Benefit>(`${this.apiUrl}/${id}/reactivate`, {});
  }

  /**
   * Submit complete benefit request
   */
  submitBenefitRequest(request: CompleteBenefitRequest): Observable<{ success: boolean; requestId: string }> {
    return this.http.post<{ success: boolean; requestId: string }>(
      `${this.requestsUrl}/submit`, 
      request
    );
  }

  /**
   * Get all pending benefit requests
   */
  getPendingRequests(): Observable<BenefitRequestDetails[]> {
    return this.http.get<BenefitRequestDetails[]>(`${this.requestsUrl}/pending`);
  }

  /**
   * Get benefit request details by ID
   */
  getRequestDetails(requestId: string): Observable<BenefitRequestDetails> {
    // TODO: Replace with actual API call
    // return this.http.get<BenefitRequestDetails>(`${this.requestsUrl}/${requestId}`);
    
    // Mock data for demonstration
    return of(this.getMockRequestDetails(requestId)).pipe(delay(800));
  }

  /**
   * Mock request details for demonstration
   * TODO: Remove when API is available
   */
  private getMockRequestDetails(requestId: string): BenefitRequestDetails {
    const mockDetails: Record<string, BenefitRequestDetails> = {
      '1': {
        id: '1',
        citizenNISS: 'TL123456789',
        citizenName: 'Maria Fernanda dos Santos',
        citizenDateOfBirth: '15/08/1963',
        schemeType: 'contributory',
        benefitType: 'old-age-pension',
        retirementOption: 'NORMAL' as any,
        documents: [
          { type: 'Giấy xác nhận đóng BHXH', fileName: 'confirmation.pdf', fileSize: 1024000, fileType: 'application/pdf', uploadedAt: new Date('2025-01-15') }
        ],
        bankAccount: {
          bankName: 'Banco Nacional Ultramarino',
          accountNumber: '1234567890',
          accountHolderName: 'Maria Fernanda dos Santos'
        },
        contributionMonths: 308,
        currentAge: '58 năm 5 tháng',
        eligibilityMessage: 'Đủ điều kiện hưởng lương hưu',
        submittedDate: new Date('2025-01-15'),
        requestStatus: 'submitted'
      },
      '2': {
        id: '2',
        citizenNISS: 'TL987654321',
        citizenName: 'João Carlos Silva',
        citizenDateOfBirth: '20/05/1960',
        schemeType: 'contributory',
        benefitType: 'disability-pension',
        disabilityPaymentType: 'MONTHLY' as any,
        documents: [
          { type: 'Biên bản giám định mức suy giảm KNLĐ', fileName: 'disability_assessment.pdf', fileSize: 2048000, fileType: 'application/pdf', uploadedAt: new Date('2025-01-18') },
          { type: 'Giấy ra viện', fileName: 'hospital_discharge.pdf', fileSize: 1536000, fileType: 'application/pdf', uploadedAt: new Date('2025-01-18') }
        ],
        bankAccount: {
          bankName: 'Banco Mandiri',
          accountNumber: '9876543210',
          accountHolderName: 'João Carlos Silva'
        },
        contributionMonths: 200,
        currentAge: '64 năm 8 tháng',
        eligibilityMessage: 'Đủ điều kiện nhận trợ cấp khuyết tật',
        submittedDate: new Date('2025-01-18'),
        requestStatus: 'pending_approval'
      },
      '4': {
        id: '4',
        citizenNISS: 'TL111222333',
        citizenName: 'Pedro Alves',
        citizenDateOfBirth: '25/03/1965',
        schemeType: 'contributory',
        benefitType: 'survivor-pension',
        funeralAllowance: 345,
        dependents: [
          {
            id: '1',
            relationship: 'SPOUSE' as any,
            fullName: 'Ana Maria Alves',
            dateOfBirth: '1967-05-10',
            identificationNumber: 'TL444555666',
            percentage: 60,
            adjustedPercentage: 60
          },
          {
            id: '2',
            relationship: 'CHILD' as any,
            fullName: 'Pedro Alves Junior',
            dateOfBirth: '1995-08-15',
            identificationNumber: 'TL777888999',
            percentage: 20,
            adjustedPercentage: 20
          }
        ],
        dependentBankAccounts: [
          {
            dependentId: '1',
            percentage: 60,
            bankName: 'Banco Nacional Ultramarino',
            accountNumber: '1111222233',
            accountHolderName: 'Ana Maria Alves'
          },
          {
            dependentId: '2',
            percentage: 20,
            bankName: 'Banco Mandiri',
            accountNumber: '4444555566',
            accountHolderName: 'Pedro Alves Junior'
          }
        ],
        documents: [
          { type: 'Giấy chứng tử', fileName: 'death_certificate.pdf', fileSize: 512000, fileType: 'application/pdf', uploadedAt: new Date('2025-01-22') }
        ],
        contributionMonths: 120,
        currentAge: '59 năm 10 tháng',
        eligibilityMessage: 'Đủ điều kiện nhận trợ cấp tử tuất',
        submittedDate: new Date('2025-01-22'),
        requestStatus: 'rejected'
      }
    };

    return mockDetails[requestId] || mockDetails['1'];
  }

  /**
   * Send request for approval (Level 2 action)
   */
  sendForApproval(requestId: string, comment?: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.requestsUrl}/${requestId}/send-for-approval`,
      { comment }
    );
  }

  /**
   * Approve request (Level 3 action)
   */
  approveRequest(requestId: string, comment: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.requestsUrl}/${requestId}/approve`,
      { comment }
    );
  }

  /**
   * Reject request
   */
  rejectRequest(requestId: string, reason: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.requestsUrl}/${requestId}/reject`,
      { reason }
    );
  }

  /**
   * Bulk send for approval
   */
  sendMultipleForApproval(requestIds: string[], comment?: string): Observable<{ success: boolean; count: number }> {
    return this.http.post<{ success: boolean; count: number }>(
      `${this.requestsUrl}/bulk/send-for-approval`,
      { requestIds, comment }
    );
  }

  /**
   * Bulk approve
   */
  approveMultiple(requestIds: string[], comment: string): Observable<{ success: boolean; count: number }> {
    return this.http.post<{ success: boolean; count: number }>(
      `${this.requestsUrl}/bulk/approve`,
      { requestIds, comment }
    );
  }

  /**
   * Bulk reject
   */
  rejectMultiple(requestIds: string[], reason: string): Observable<{ success: boolean; count: number }> {
    return this.http.post<{ success: boolean; count: number }>(
      `${this.requestsUrl}/bulk/reject`,
      { requestIds, reason }
    );
  }

  // ========================================
  // CALCULATION METHODS
  // ========================================

  /**
   * Calculate Reference Remuneration (R)
   * R = Average of best 120 months in last 10 years
   */
  calculateReferenceRemuneration(niss: string): Observable<ReferenceRemunerationResult> {
    // TODO: Replace with actual API call
    // return this.http.get<ReferenceRemunerationResult>(`${this.apiUrl}/calculate-r/${niss}`);
    
    // Mock implementation
    return of(this.getMockReferenceRemuneration(niss)).pipe(delay(1000));
  }

  /**
   * Calculate Old-Age Pension
   * Formula: P = (R / N) × Total Months, where N = 360
   */
  calculateOldAgePension(request: OldAgePensionCalculationRequest): Observable<OldAgePensionCalculation> {
    // TODO: Replace with actual API call
    // return this.http.post<OldAgePensionCalculation>(`${this.apiUrl}/calculate/old-age`, request);
    
    // Mock implementation
    return of(this.getMockOldAgePensionCalculation(request)).pipe(delay(1200));
  }

  /**
   * Calculate Survivor Pension
   * Formula: P = (R / N) × Total Months, where N = 360
   * Plus: Funeral Allowance = 3 × R
   */
  calculateSurvivorPension(request: SurvivorPensionCalculationRequest): Observable<SurvivorPensionCalculation> {
    // TODO: Replace with actual API call
    // return this.http.post<SurvivorPensionCalculation>(`${this.apiUrl}/calculate/survivor`, request);
    
    // Mock implementation
    return of(this.getMockSurvivorPensionCalculation(request)).pipe(delay(1200));
  }

  /**
   * Calculate Invalidity (Disability) Pension
   * Formula: P = (R / N) × Total Months for monthly, or one-time calculation
   */
  calculateInvalidityPension(
    request: CalculationRequest & { paymentType: 'ONE_TIME' | 'MONTHLY'; laborCapacityReduction: number }
  ): Observable<InvalidityPensionCalculation> {
    // TODO: Replace with actual API call
    // return this.http.post<InvalidityPensionCalculation>(`${this.apiUrl}/calculate/invalidity`, request);
    
    // Mock implementation
    return of(this.getMockInvalidityPensionCalculation(request)).pipe(delay(1200));
  }

  /**
   * Calculate Parental Benefit
   * Formula: S = R / 180
   */
  calculateParentalBenefit(request: ParentalBenefitCalculationRequest): Observable<ParentalBenefitCalculation> {
    // TODO: Replace with actual API call
    // return this.http.post<ParentalBenefitCalculation>(`${this.apiUrl}/calculate/parental`, request);
    
    // Mock implementation
    return of(this.getMockParentalBenefitCalculation(request)).pipe(delay(1200));
  }

  /**
   * Calculate Death Benefit
   * Formula: S = 3 × R (Article 18, DL 19/2017)
   */
  calculateDeathBenefit(
    request: CalculationRequest & { deceasedNISS: string; recipientType: 'FAMILY' | 'FUNERAL_PAYER' }
  ): Observable<DeathBenefitCalculation> {
    // TODO: Replace with actual API call
    // return this.http.post<DeathBenefitCalculation>(`${this.apiUrl}/calculate/death`, request);
    
    // Mock implementation
    return of(this.getMockDeathBenefitCalculation(request)).pipe(delay(1000));
  }

  // ========================================
  // MOCK DATA FOR CALCULATIONS
  // ========================================

  private getMockReferenceRemuneration(niss: string): ReferenceRemunerationResult {
    // Different R values based on NISS for variety
    const mockRValues: { [key: string]: number } = {
      'TL123456789': 500,   // High earner
      'TL987654321': 350,   // Medium earner
      'TL111222333': 450,   // Medium-high earner
      'TL444444444': 280,   // Lower earner
      'TL111111111': 420    // Medium-high earner
    };

    const R = mockRValues[niss] || 400; // Default to $400

    return {
      niss: niss,
      referenceAmount: R,
      best120Months: this.generateMockSalaryHistory(R),
      calculationDate: new Date(),
      periodCovered: '2014-2024 (Last 10 years)',
      totalMonthsAnalyzed: 120
    };
  }

  private generateMockSalaryHistory(baseAmount: number): any[] {
    const history = [];
    for (let i = 0; i < 120; i++) {
      const variance = (Math.random() - 0.5) * 50; // ±$25 variance
      history.push({
        monthYear: new Date(2024, 11 - i, 1),
        salary: Math.round(baseAmount + variance),
        employer: i < 40 ? 'Current Employer Ltd.' : 'Previous Employer Inc.',
        contributionBase: Math.round(baseAmount + variance)
      });
    }
    return history;
  }

  private getMockOldAgePensionCalculation(request: OldAgePensionCalculationRequest): OldAgePensionCalculation {
    const R = this.getMockReferenceRemuneration(request.niss).referenceAmount;
    const N = 360; // 30 years
    const totalMonths = 308; // Mock value, should come from contribution history
    
    const P = (R / N) * totalMonths;

    return {
      calculationId: 'CALC-' + Date.now(),
      niss: request.niss,
      benefitType: 'old-age-pension',
      benefitAmount: Math.round(P * 100) / 100,
      referenceRemuneration: R,
      formula: 'P = (R / N) × Total Months',
      breakdown: {
        step1: {
          label: 'Reference Remuneration (R)',
          value: R,
          description: 'Average of best 120 months in last 10 years'
        },
        step2: {
          label: 'Career Months (N)',
          value: N,
          description: 'Standard contributory career period (30 years)'
        },
        step3: {
          label: 'Total Contribution Months',
          value: totalMonths,
          description: 'Actual months contributed'
        },
        step4: {
          label: 'Calculation',
          formula: `(${R} / ${N}) × ${totalMonths}`,
          value: P,
          description: 'Monthly pension amount'
        },
        finalResult: Math.round(P * 100) / 100
      },
      calculationDate: new Date(),
      N: N,
      totalContributionMonths: totalMonths,
      monthlyPension: Math.round(P * 100) / 100,
      sector: request.sector || 'private',
      retirementAge: 60
    };
  }

  private getMockSurvivorPensionCalculation(request: SurvivorPensionCalculationRequest): SurvivorPensionCalculation {
    const R = this.getMockReferenceRemuneration(request.deceasedNISS).referenceAmount;
    const N = 360;
    const totalMonths = 120; // Mock value
    
    const P = (R / N) * totalMonths;
    const funeralAllowance = 3 * R;

    // Calculate per-dependent amounts
    const distributions = request.dependents.map((dep, index) => ({
      dependentId: `DEP-${index + 1}`,
      dependentName: `Dependent ${index + 1}`,
      relationship: dep.relationship,
      percentage: dep.percentage,
      adjustedPercentage: dep.percentage,
      monthlyAmount: Math.round((P * dep.percentage / 100) * 100) / 100
    }));

    return {
      calculationId: 'CALC-' + Date.now(),
      niss: request.niss,
      benefitType: 'survivor-pension',
      benefitAmount: Math.round(P * 100) / 100,
      referenceRemuneration: R,
      formula: 'P = (R / N) × Total Months',
      breakdown: {
        step1: {
          label: 'Reference Remuneration (R)',
          value: R,
          description: 'Average of deceased worker\'s best 120 months'
        },
        step2: {
          label: 'Career Months (N)',
          value: N,
          description: 'Standard contributory career period'
        },
        step3: {
          label: 'Total Contribution Months',
          value: totalMonths,
          description: 'Deceased worker\'s contribution period'
        },
        step4: {
          label: 'Total Monthly Pension',
          formula: `(${R} / ${N}) × ${totalMonths}`,
          value: P,
          description: 'To be distributed among dependents'
        },
        finalResult: Math.round(P * 100) / 100
      },
      calculationDate: new Date(),
      N: N,
      totalContributionMonths: totalMonths,
      totalPension: Math.round(P * 100) / 100,
      dependentDistributions: distributions,
      funeralAllowance: funeralAllowance
    };
  }

  private getMockInvalidityPensionCalculation(
    request: CalculationRequest & { paymentType: 'ONE_TIME' | 'MONTHLY'; laborCapacityReduction: number }
  ): InvalidityPensionCalculation {
    const R = this.getMockReferenceRemuneration(request.niss).referenceAmount;
    const N = 360;
    const totalMonths = 200; // Mock value
    
    const P = (R / N) * totalMonths;

    const result: InvalidityPensionCalculation = {
      calculationId: 'CALC-' + Date.now(),
      niss: request.niss,
      benefitType: 'disability-pension',
      benefitAmount: Math.round(P * 100) / 100,
      referenceRemuneration: R,
      formula: request.paymentType === 'MONTHLY' ? 'P = (R / N) × Total Months' : 'Lump sum calculation',
      breakdown: {
        step1: {
          label: 'Reference Remuneration (R)',
          value: R,
          description: 'Average of best 120 months'
        },
        step2: {
          label: request.paymentType === 'MONTHLY' ? 'Career Months (N)' : 'Reduction Percentage',
          value: request.paymentType === 'MONTHLY' ? N : request.laborCapacityReduction,
          description: request.paymentType === 'MONTHLY' ? 'Standard period' : 'Labor capacity reduction'
        },
        step3: {
          label: 'Total Contribution Months',
          value: totalMonths,
          description: 'Actual months contributed'
        },
        finalResult: Math.round(P * 100) / 100
      },
      calculationDate: new Date(),
      N: N,
      totalContributionMonths: totalMonths,
      paymentType: request.paymentType,
      laborCapacityReduction: request.laborCapacityReduction
    };

    if (request.paymentType === 'MONTHLY') {
      result.monthlyPension = Math.round(P * 100) / 100;
    } else {
      // One-time: typically 24 months worth
      result.oneTimeAmount = Math.round(P * 24 * 100) / 100;
      result.benefitAmount = result.oneTimeAmount;
    }

    return result;
  }

  private getMockParentalBenefitCalculation(request: ParentalBenefitCalculationRequest): ParentalBenefitCalculation {
    const R = this.getMockReferenceRemuneration(request.niss).referenceAmount;
    const dailyBenefit = R / 180;
    
    // Duration varies by type
    const durations: { [key: string]: number } = {
      'MATERNITY': 90,
      'PATERNITY': 7,
      'CLINICAL_RISK': 60,
      'PREGNANCY_INTERRUPTION': 30,
      'ADOPTION': 90
    };
    
    const durationDays = request.durationDays || durations[request.parentalType] || 90;
    const totalAmount = dailyBenefit * durationDays;

    return {
      calculationId: 'CALC-' + Date.now(),
      niss: request.niss,
      benefitType: request.parentalType.toLowerCase(),
      benefitAmount: Math.round(totalAmount * 100) / 100,
      referenceRemuneration: R,
      formula: 'S = R / 180',
      breakdown: {
        step1: {
          label: 'Reference Remuneration (R)',
          value: R,
          description: 'Average of best 120 months'
        },
        step2: {
          label: 'Daily Benefit',
          formula: `${R} / 180`,
          value: Math.round(dailyBenefit * 100) / 100,
          description: 'Daily benefit amount'
        },
        step3: {
          label: 'Duration',
          value: durationDays,
          description: `${durationDays} days of benefit`
        },
        finalResult: Math.round(totalAmount * 100) / 100
      },
      calculationDate: new Date(),
      parentalType: request.parentalType,
      dailyBenefit: Math.round(dailyBenefit * 100) / 100,
      durationDays: durationDays,
      totalAmount: Math.round(totalAmount * 100) / 100,
      startDate: request.birthDate || request.expectedDueDate || new Date(),
      endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
    };
  }

  private getMockDeathBenefitCalculation(
    request: CalculationRequest & { deceasedNISS: string; recipientType: 'FAMILY' | 'FUNERAL_PAYER' }
  ): DeathBenefitCalculation {
    const R = this.getMockReferenceRemuneration(request.deceasedNISS).referenceAmount;
    const oneTimeAmount = 3 * R; // Article 18, DL 19/2017

    return {
      calculationId: 'CALC-' + Date.now(),
      niss: request.niss,
      benefitType: 'death-benefit',
      benefitAmount: oneTimeAmount,
      referenceRemuneration: R,
      formula: 'S = 3 × R',
      breakdown: {
        step1: {
          label: 'Reference Remuneration (R)',
          value: R,
          description: 'Average of deceased\'s best 120 months (Article 18, DL 19/2017)'
        },
        step2: {
          label: 'Multiplier',
          value: 3,
          description: 'Three times the reference remuneration'
        },
        step3: {
          label: 'One-Time Death Benefit',
          formula: `3 × ${R}`,
          value: oneTimeAmount,
          description: 'Total benefit amount'
        },
        finalResult: oneTimeAmount
      },
      calculationDate: new Date(),
      oneTimeAmount: oneTimeAmount,
      recipientType: request.recipientType,
      recipientName: 'Beneficiary Name',
      deceasedNISS: request.deceasedNISS,
      deceasedName: 'Deceased Worker Name'
    };
  }
}

