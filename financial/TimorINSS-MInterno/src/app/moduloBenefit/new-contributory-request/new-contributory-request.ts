import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { MatDialog } from '@angular/material/dialog';

import {
  ContributionPeriod,
  HealthStatus,
  RetirementOption,
  RetirementOptionType,
  HazardousIndustry,
} from '../models/benefit.model';

import {
  DisabilityPaymentType,
  DISABILITY_OPTIONS,
} from '../models/disability-benefit.model';

import {
  Dependent,
  DependentRelationship,
  getDefaultPercentage,
  calculateAdjustedPercentages,
  RELATIONSHIP_LABELS,
  SURVIVOR_BENEFIT_CONFIG,
} from '../models/survivor-benefit.model';

// Interfaces
import {
  CitizenInfo,
  EligibilityResult,
  UploadedDocument,
} from '../interfaces/citizen.interface';
import {
  CompleteBenefitRequest,
  BankAccount,
  DependentBankAccount,
  DocumentSubmission,
} from '../interfaces/benefit-request.interface';

import { BenefitService } from '../services/benefit.service';
import {
  EligibilityRejectionDialogComponent,
  RejectionData,
} from '../components/eligibility-rejection-dialog/eligibility-rejection-dialog.component';
import {
  BenefitType,
  CONTRIBUTORY_BENEFIT_TYPES,
  NON_CONTRIBUTORY_BENEFIT_TYPES,
} from '../constants/benefit-types.constants';
import { HAZARDOUS_INDUSTRIES } from '../constants/hazardous-industries.constants';
import {
  DEFAULT_HEALTH_STATUS,
  EmploymentSector,
} from '../constants/eligibility.constants';
import {
  getMockCitizenByNISS,
  isNISSAlreadyAssigned,
} from '../constants/mock-data.constants';
import {
  DOCUMENT_TYPES,
  DocumentTypeOption,
} from '../constants/document-types.constants';
import { NonContributoryBenefitSelection } from '../components/non-contributory-benefits/non-contributory-benefits.component';
import { SurvivorBenefitSelection } from '../components/survivor-benefit-type/survivor-benefit-type.component';

import {
  calculateAge,
  formatAge,
  formatContributionPeriod,
  isEligibleForNormalRetirement,
  hasSufficientContribution,
  setupRetirementOptions as createRetirementOptions,
  generateEligibilityMessage,
  getMinimumRetirementAge,
  calculateMinimumContributionMonths,
} from '../utils/eligibility.utils';

@Component({
  standalone: false,
  selector: 'app-new-contributory-request',
  templateUrl: './new-contributory-request.html',
  styleUrls: ['./new-contributory-request.css'],
})
export class NewContributoryRequestComponent implements OnInit {
  // Expose Math, parseInt, and calculateAge for template
  Math = Math;
  parseInt = parseInt;
  calculateAge = calculateAge;

  // Step 1: Citizen Search
  nissFormControl = new FormControl('', [Validators.required]);
  citizenInfo: CitizenInfo | null = null;
  isSearching = false;
  searchError: string | null = null;
  citizenFound = false;

  // Step 2: Scheme Type Selection
  schemeTypeFormControl = new FormControl('', [Validators.required]);
  selectedSchemeType: 'contributory' | 'non-contributory' | null = null;
  selectedBenefitType: string = '';

  // Benefit types (loaded from constants)
  readonly contributoryBenefitTypes: BenefitType[] = CONTRIBUTORY_BENEFIT_TYPES;
  readonly nonContributoryBenefitTypes: BenefitType[] =
    NON_CONTRIBUTORY_BENEFIT_TYPES;
  
  // Non-Contributory Benefit Selection
  nonContributoryBenefitSelection: NonContributoryBenefitSelection | null = null;

  // Survivor Benefit Type Selection
  survivorBenefitSelection: SurvivorBenefitSelection | null = null;

  // Step 2: Contribution History
  contributionHistory: ContributionPeriod[] = [];
  totalContributionYears: number = 0;
  totalContributionMonths: number = 0;
  currentAge: string = '';
  healthStatus: HealthStatus = { status: DEFAULT_HEALTH_STATUS };

  // Step 3: Contributory Scheme - Eligibility
  eligibilityResult: EligibilityResult | null = null;
  contributionMonths: number = 0;
  hasRejection: boolean = false; // Track if there's an eligibility rejection

  // Step 3: Retirement Options
  availableRetirementOptions: RetirementOption[] = [];
  selectedRetirementOption: RetirementOptionType | null = null;
  retirementOptionFormControl = new FormControl('', [Validators.required]);

  // Hazardous Industries (loaded from constants)
  readonly hazardousIndustries: HazardousIndustry[] = HAZARDOUS_INDUSTRIES;
  selectedHazardousIndustry: string = '';

  // Available document types
  readonly availableDocumentTypes: DocumentTypeOption[] = DOCUMENT_TYPES;

  // Step 4: Document Upload
  uploadedDocuments: Map<string, UploadedDocument> = new Map();
  requiredDocuments: string[] = [];

  // Dynamic document rows
  documentRows: Array<{
    id: string;
    documentType: string;
    file: File | null;
    uploadedAt?: Date;
  }> = [];

  // Step 3: Non-Contributory Scheme - Documents & Bank
  documentFormControl = new FormControl(null);
  bankAccountForm = new FormGroup({
    bankName: new FormControl('', [Validators.required]),
    accountNumber: new FormControl('', [Validators.required]),
    accountHolderName: new FormControl('', [Validators.required]),
  });

  // Disability Pension Configuration
  selectedDisabilityPaymentType: DisabilityPaymentType | null = null;
  disabilityPaymentTypeFormControl = new FormControl('', [Validators.required]);
  readonly disabilityOptions = DISABILITY_OPTIONS;
  readonly DisabilityPaymentType = DisabilityPaymentType;

  // Survivor's Pension Configuration
  showSurvivorForm: boolean = false;
  showNonContributory: boolean = true;
  funeralAllowanceAmount: number = 0;
  dependents: Dependent[] = [];
  // dependentFormGroup - moved to SurvivorPensionInfoComponent
  readonly DependentRelationship = DependentRelationship;
  readonly relationshipLabels = RELATIONSHIP_LABELS;
  readonly survivorConfig = SURVIVOR_BENEFIT_CONFIG;

  // Survivor's Pension - Bank Accounts (one per dependent)
  dependentBankAccountForms: Map<string, FormGroup> = new Map();

  // Disability Pension Information
  disabilityInfo: {
    disabilityLevel: number;
    disabilityType: 'relative' | 'absolute' | null;
    isEligible: boolean;
    estimatedPension: number;
    referenceRemuneration: number;
  } | null = null;

  // Stepper
  currentStep = 0;
  isSubmitting = false;
  @ViewChild('stepper') stepper?: MatStepper;

  // Validation flags from child components
  retirementValidation: boolean = false;
  documentValidation: boolean = false;
  bankValidation: boolean = false;
  bankAccountData: any = null;

  constructor(
    private router: Router,
    private benefitService: BenefitService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    console.log('New Contributory Request Component initialized');
    // Add initial document row
    this.addDocumentRow();
  }

  /**
   * Handle stepper selection change
   */
  onStepChange(event: any): void {
    this.currentStep = event.selectedIndex;
  }

  /**
   * Handle contribution data loaded from child component
   */
  onContributionDataLoaded(data: any): void {
    this.contributionHistory = data.contributionHistory;
    this.totalContributionYears = data.totalContributionYears;
    this.totalContributionMonths = data.totalContributionMonths;
    this.contributionMonths = data.contributionMonths;
    this.currentAge = data.currentAge;
    this.healthStatus = data.healthStatus;

    // Hide non-contributory options if citizen has contribution history
    // if (this.contributionMonths > 0) {
    //   this.showNonContributory = false;
    // }
  }

  /**
   * Handle dependents changed from child component
   */
  onDependentsChanged(data: any): void {
    const previousDependentIds = new Set(this.dependents.map((d) => d.id));
    this.dependents = data.dependents;

    // Create bank account forms for new dependents
    this.dependents.forEach((dep) => {
      if (dep.id && !previousDependentIds.has(dep.id)) {
        this.createDependentBankAccountForm(dep.id);
      }
    });

    // Remove bank account forms for removed dependents
    const currentDependentIds = new Set(this.dependents.map((d) => d.id));
    Array.from(this.dependentBankAccountForms.keys()).forEach((id) => {
      if (!currentDependentIds.has(id)) {
        this.dependentBankAccountForms.delete(id);
      }
    });
  }

  /**
   * Step 1: Search Citizen by NISS
   */
  searchCitizen(): void {
    if (!this.nissFormControl.valid) {
      this.nissFormControl.markAsTouched();
      return;
    }

    const niss = this.nissFormControl.value?.trim();
    if (!niss) {
      return;
    }

    // Reset all form data when searching for a new citizen
    this.resetAllStepsData();
    // Reset rejection flag when searching new citizen
    this.hasRejection = false;

    this.isSearching = true;
    this.searchError = null;
    this.citizenInfo = null;
    this.citizenFound = false;

    // TODO: Replace with actual API call
    // this.benefitService.searchCitizenByNISS(niss).subscribe(...)

    // Mock API call
    setTimeout(() => {
      this.handleMockCitizenSearch(niss);
      this.isSearching = false;
    }, 1000);
  }

  /**
   * Handle mock citizen search (remove when integrating with real API)
   */
  private handleMockCitizenSearch(niss: string): void {
    if (isNISSAlreadyAssigned(niss)) {
      this.searchError =
        'This citizen is already assigned to a beneficiary scheme.';
      this.citizenInfo = null;
      this.citizenFound = false;
      return;
    }

    const mockData = getMockCitizenByNISS(niss);
    if (mockData) {
      this.citizenInfo = {
        niss: mockData.niss,
        name: mockData.name,
        dateOfBirth: mockData.dateOfBirth,
        employmentSector: mockData.employmentSector || EmploymentSector.PRIVATE,
      };
      this.citizenFound = true;
      this.searchError = null;

      // Contribution history will be loaded by the contribution-history component
      // when it renders (triggered by citizenInfo being set)
    } else {
      this.searchError = 'Citizen not found. Please verify the NISS number.';
      this.citizenInfo = null;
      this.citizenFound = false;
    }
  }

  /**
   * Step 2: Select Scheme Type
   */
  selectSchemeType(
    type: 'contributory' | 'non-contributory',
    benefitType: string
  ): void {
    // Check eligibility for old-age pension before allowing selection
    if (type === 'contributory' && benefitType === 'old-age-pension') {
      if (!this.checkOldAgePensionEligibility()) {
        return; // Don't proceed with selection
      }
    }

    // Check basic eligibility for disability pension before allowing selection
    if (type === 'contributory' && benefitType === 'disability-pension') {
      if (!this.checkDisabilityPensionBasicEligibility()) {
        return; // Don't proceed with selection
      }
    }

    this.selectedSchemeType = type;
    this.selectedBenefitType = benefitType;
    this.schemeTypeFormControl.setValue(benefitType);

    // Reset rejection flag when selecting a new scheme/benefit type
    // This allows user to try a different benefit type after rejection
    this.hasRejection = false;

    // Reset special configurations
    this.selectedDisabilityPaymentType = null;
    this.showSurvivorForm = false;
    this.dependents = [];
    this.dependentBankAccountForms.clear();
    this.disabilityInfo = null;

    // Set required documents based on benefit type
    const benefitTypes =
      type === 'contributory'
        ? this.contributoryBenefitTypes
        : this.nonContributoryBenefitTypes;
    const selectedBenefit = benefitTypes.find((bt) => bt.value === benefitType);
    this.requiredDocuments = selectedBenefit?.requiredDocuments || [];
    this.uploadedDocuments.clear();

    // Handle survivor's pension selection
    if (benefitType === 'survivor-pension') {
      this.handleSurvivorPensionSelection();
    }
  }

  /**
   * Check Old-Age Pension Eligibility before allowing selection
   * Includes both normal retirement and early retirement validation
   */
  private checkOldAgePensionEligibility(): boolean {
    if (!this.citizenInfo) {
      alert('Please search for a citizen first.');
      return false;
    }

    const currentYear = new Date().getFullYear();
    const requiredMonths = calculateMinimumContributionMonths(currentYear);
    const requiredAge = getMinimumRetirementAge(
      this.citizenInfo.employmentSector
    );
    const age = calculateAge(this.citizenInfo.dateOfBirth);
    const sector = this.citizenInfo.employmentSector;

    const requiredYears = Math.floor(requiredMonths / 12);
    const remainingMonths = requiredMonths % 12;
    let contributionText = `${requiredYears} years`;
    if (remainingMonths > 0) {
      contributionText += ` ${remainingMonths} months`;
    }

    const sectorLabel =
      sector === EmploymentSector.PUBLIC ? 'Public Sector' : 'Private Sector';

    // Check contribution requirement
    if (this.contributionMonths < requiredMonths) {
      const actualYears = Math.floor(this.contributionMonths / 12);
      const actualMonths = this.contributionMonths % 12;

      this.showRejectionDialog({
        reason: 'contribution',
        citizenName: this.citizenInfo.name,
        citizenNiss: this.citizenInfo.niss,
        sector: sectorLabel,
        currentValue: `${actualYears} years ${actualMonths} months`,
        requiredValue: `${contributionText} (for year ${currentYear})`,
        suggestions: [
          `Continue contributing until reaching ${requiredMonths} months`,
          age.years >= 55 &&
          age.years < 60 &&
          sector === EmploymentSector.PRIVATE
            ? 'You may be eligible for early retirement (age 55-59, private sector)'
            : 'Consider early retirement options when eligible',
          'Apply for non-contributory benefits (if eligible)',
        ],
      });
      this.schemeTypeFormControl.setValue('');
      return false;
    }

    // Check if eligible for normal retirement (age >= required age)
    if (age.years >= requiredAge) {
      return true; // Eligible for normal retirement
    }

    // Check if eligible for early retirement (private sector only, age 55-59)
    if (
      sector === EmploymentSector.PRIVATE &&
      age.years >= 55 &&
      age.years < 60
    ) {
      // Already checked contribution above (>= requiredMonths)
      // Private sector, age 55-59, sufficient contribution
      return true; // Eligible for early retirement
    }

    // Not eligible - age too low and not in early retirement range
    const ageErrorMessage =
      sector === EmploymentSector.PRIVATE
        ? `${requiredAge} years (or 55-59 for early retirement)`
        : `${requiredAge} years`;

    this.showRejectionDialog({
      reason: 'age',
      citizenName: this.citizenInfo.name,
      citizenNiss: this.citizenInfo.niss,
      sector: sectorLabel,
      currentValue: `${age.years} years`,
      requiredValue: ageErrorMessage,
      suggestions: [
        `Apply when reaching ${requiredAge} years old`,
        sector === EmploymentSector.PRIVATE && age.years < 55
          ? 'Early retirement available from age 55 (private sector only)'
          : sector === EmploymentSector.PUBLIC
          ? 'Public sector employees cannot retire early'
          : 'Continue working to increase future pension amount',
        'Continue working to increase future pension amount',
      ],
    });
    this.schemeTypeFormControl.setValue('');
    return false;
  }

  /**
   * Show rejection dialog with reason and allow user to go back to start
   */
  /**
   * Show rejection dialog
   */
  private showRejectionDialog(data: RejectionData): void {
    // Set rejection flag to prevent proceeding to next steps
    this.hasRejection = true;
    
    const dialogRef = this.dialog.open(EligibilityRejectionDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: data,
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'back-to-search') {
        // Reset to step 0 and clear form
        if (this.stepper) {
          this.stepper.selectedIndex = 0;
          this.currentStep = 0;
        }
        // Reset citizen info to allow new search
        this.resetForm();
        // Reset rejection flag
        this.hasRejection = false;
      } else {
        // Even if dialog is closed without going back, keep rejection flag
        // This prevents user from proceeding to next steps
        this.hasRejection = true;
      }
    });
  }

  /**
   * Check Disability Pension Basic Eligibility (contribution only)
   * Detailed disability level check will be done in the component
   */
  private checkDisabilityPensionBasicEligibility(): boolean {
    if (!this.citizenInfo) {
      alert('Please search for a citizen first.');
      return false;
    }

    const MINIMUM_CONTRIBUTION_MONTHS = 60; // For 2025
    const currentYear = new Date().getFullYear();

    // Check contribution requirement
    if (this.contributionMonths < MINIMUM_CONTRIBUTION_MONTHS) {
      const actualYears = Math.floor(this.contributionMonths / 12);
      const actualMonths = this.contributionMonths % 12;
      const requiredYears = Math.floor(MINIMUM_CONTRIBUTION_MONTHS / 12);

      this.showRejectionDialog({
        reason: 'contribution',
        citizenName: this.citizenInfo.name,
        citizenNiss: this.citizenInfo.niss,
        sector:
          this.citizenInfo.employmentSector === EmploymentSector.PUBLIC
            ? 'Public Sector'
            : 'Private Sector',
        currentValue: `${actualYears} years ${actualMonths} months (${this.contributionMonths} months)`,
        requiredValue: `${requiredYears} years 0 months (${MINIMUM_CONTRIBUTION_MONTHS} months for ${currentYear})`,
        suggestions: [
          `Continue contributing until reaching ${MINIMUM_CONTRIBUTION_MONTHS} months`,
          'Apply for non-contributory benefits (if eligible)',
          'Note: Disability pension does not have age requirement',
        ],
      });
      this.schemeTypeFormControl.setValue('');
      return false;
    }

    return true;
  }

  /**
   * Handle disability info changed from child component
   */
  onDisabilityInfoChanged(info: any): void {
    this.disabilityInfo = info;
  }

  /**
   * Handle retirement option selection from child component
   */
  onRetirementOptionSelected(event: {
    optionType: any;
    hazardousIndustry?: string;
  }): void {
    this.selectedRetirementOption = event.optionType;
    this.retirementOptionFormControl.setValue(event.optionType);
    if (event.hazardousIndustry) {
      this.selectedHazardousIndustry = event.hazardousIndustry;
    }

    // Update required documents based on selected option
    const option = this.availableRetirementOptions.find(
      (opt) => opt.type === event.optionType
    );
    if (option) {
      const selectedBenefit = this.contributoryBenefitTypes.find(
        (bt) => bt.value === this.selectedBenefitType
      );
      const baseDocuments = selectedBenefit?.requiredDocuments || [];
      this.requiredDocuments = [...baseDocuments, ...option.requiredDocuments];
    }
  }

  /**
   * Handle retirement validation change
   */
  onRetirementValidationChanged(isValid: boolean): void {
    this.retirementValidation = isValid;
  }

  /**
   * Handle documents change from child component
   */
  onDocumentsChanged(documentRows: any[]): void {
    this.documentRows = documentRows;

    // Update uploadedDocuments map for compatibility
    this.uploadedDocuments.clear();
    documentRows.forEach((row) => {
      if (row.documentType && row.file) {
        this.uploadedDocuments.set(row.documentType, {
          type: row.documentType,
          file: row.file,
          uploadedAt: row.uploadedAt || new Date(),
        });
      }
    });
  }

  /**
   * Handle document validation change
   */
  onDocumentValidationChanged(isValid: boolean): void {
    this.documentValidation = isValid;
  }

  /**
   * Handle bank account change from child component
   */
  onBankAccountChanged(data: any): void {
    this.bankAccountData = data;
  }

  /**
   * Handle bank validation change
   */
  onBankValidationChanged(isValid: boolean): void {
    this.bankValidation = isValid;
  }

  /**
   * Handle non-contributory benefit selection
   */
  onNonContributoryBenefitSelected(selection: NonContributoryBenefitSelection): void {
    this.nonContributoryBenefitSelection = selection;
    
    // Update required documents based on benefit type
    if (selection.isEligible) {
      this.requiredDocuments = selection.benefitType.requiredDocuments;
    }
  }

  /**
   * Get reference remuneration (R) - average of 12 highest contribution months
   */
  getReferenceRemuneration(): number {
    // Try to get from mock data first
    if (this.citizenInfo) {
      const mockData = getMockCitizenByNISS(this.citizenInfo.niss);
      if (mockData?.referenceRemuneration) {
        return mockData.referenceRemuneration;
      }
    }
    
    // Default fallback value (can be calculated from contribution history in production)
    return 115.00; // USD - average of 12 highest months
  }

  /**
   * Calculate deceased's estimated pension: P = R * (N / 360)
   */
  calculateDeceasedEstimatedPension(): number {
    const R = this.getReferenceRemuneration();
    const N = this.contributionMonths;
    return (R * N) / 360;
  }

  /**
   * Handle survivor benefit type selection
   */
  onSurvivorBenefitTypeSelected(selection: SurvivorBenefitSelection): void {
    this.survivorBenefitSelection = selection;
    
    // Note: Funeral allowance (3 * R) is separate from benefit type selection
    // It's always calculated as 3 * reference remuneration regardless of benefit type chosen
    // The benefit type selection determines what the dependents will receive:
    // - Monthly pension: percentage of deceased's pension
    // - One-time subsidy: 3 * R (one-time payment)
    // - Funeral reimbursement: actual expenses up to 3 * R (only if no eligible dependents)
    
    // Update funeral allowance (always 3 * R for eligible cases)
    this.funeralAllowanceAmount = selection.referenceRemuneration * 3;
  }

  /**
   * Reset all steps data (when searching for a new citizen)
   */
  private resetAllStepsData(): void {
    // Reset rejection flag
    this.hasRejection = false;
    
    // Step 2: Scheme Selection
    this.selectedSchemeType = null;
    this.selectedBenefitType = '';
    this.schemeTypeFormControl.reset();
    this.showSurvivorForm = false;
    this.showNonContributory = true;
    this.nonContributoryBenefitSelection = null;

    // Contribution History
    this.contributionHistory = [];
    this.totalContributionYears = 0;
    this.totalContributionMonths = 0;
    this.contributionMonths = 0;
    this.currentAge = '';
    this.healthStatus = { status: DEFAULT_HEALTH_STATUS };

    // Step 3A: Disability Pension
    this.disabilityInfo = null;
    this.selectedDisabilityPaymentType = null;
    this.disabilityPaymentTypeFormControl.reset();

    // Step 3B: Retirement Options
    this.eligibilityResult = null;
    this.availableRetirementOptions = [];
    this.selectedRetirementOption = null;
    this.retirementOptionFormControl.reset();
    this.selectedHazardousIndustry = '';
    this.retirementValidation = false;

    // Survivor's Pension
    this.dependents = [];
    this.dependentBankAccountForms.clear();
    this.funeralAllowanceAmount = 0;
    this.survivorBenefitSelection = null;

    // Step 4: Document Upload
    this.uploadedDocuments.clear();
    this.requiredDocuments = [];
    this.documentRows = [];
    this.documentValidation = false;
    // Re-initialize with one empty row
    this.addDocumentRow();

    // Step 5: Bank Account
    this.bankAccountForm.reset();
    this.bankAccountData = null;
    this.bankValidation = false;

    // Submission
    this.isSubmitting = false;

    // Reset stepper to first step
    if (this.stepper) {
      this.stepper.reset();
    }
    this.currentStep = 0;
  }

  /**
   * Reset form to initial state (when canceling or after submission)
   */
  private resetForm(): void {
    this.nissFormControl.reset();
    this.citizenInfo = null;
    this.citizenFound = false;
    this.searchError = null;

    // Reset all other steps
    this.resetAllStepsData();
  }

  /**
   * Get label for selected benefit type
   */
  getSelectedBenefitLabel(): string {
    const allTypes = [
      ...this.contributoryBenefitTypes,
      ...this.nonContributoryBenefitTypes,
    ];
    return (
      allTypes.find((bt) => bt.value === this.selectedBenefitType)?.label || ''
    );
  }

  /**
   * Step 3: Check Eligibility (Contributory Scheme)
   */
  checkEligibility(): void {
    if (!this.citizenInfo) {
      return;
    }

    // TODO: Replace with actual API call
    // this.benefitService.checkEligibility(this.citizenInfo.niss).subscribe(...)

    // Mock eligibility check
    setTimeout(() => {
      this.performEligibilityCheck();
    }, 800);
  }

  /**
   * Perform eligibility check calculation
   */
  private performEligibilityCheck(): void {
    if (!this.citizenInfo) return;

    const age = calculateAge(this.citizenInfo.dateOfBirth);
    const contributoryYears = Math.floor(this.contributionMonths / 12);
    const contributoryMonthsRem = this.contributionMonths % 12;
    const sector = this.citizenInfo.employmentSector;

    const eligibilityMessage = generateEligibilityMessage(
      this.contributionMonths,
      age.years,
      sector
    );

    this.eligibilityResult = {
      eligible: eligibilityMessage.eligible,
      age: formatAge(age.years, age.months),
      ageInYears: age.years,
      ageInMonths: age.months,
      contributoryPeriod: formatContributionPeriod(
        contributoryYears,
        contributoryMonthsRem
      ),
      contributoryYears: contributoryYears,
      contributoryMonths: contributoryMonthsRem,
      message: eligibilityMessage.message,
      isEarlyRetirement: eligibilityMessage.isEarlyRetirement,
    };

    // Setup retirement options based on eligibility
    this.setupRetirementOptionsBasedOnEligibility(age.years, sector);
  }

  /**
   * Setup retirement options based on eligibility criteria
   */
  private setupRetirementOptionsBasedOnEligibility(
    ageYears: number,
    sector?: EmploymentSector
  ): void {
    const normalEligible = isEligibleForNormalRetirement(
      this.contributionMonths,
      ageYears,
      sector
    );
    const hasContribution = hasSufficientContribution(this.contributionMonths);
    const minAge = getMinimumRetirementAge(sector);

    // Check for early retirement (private, age 55-59, sufficient contribution)
    const isEarlyRetirement =
      hasContribution &&
      sector === EmploymentSector.PRIVATE &&
      ageYears >= 55 &&
      ageYears < 60;

    let hazardousAllowed = false;
    let disabilityAllowed = false;

    if (!hasContribution) {
      // Only early retirement options available
      hazardousAllowed = true;
      disabilityAllowed = true;
    } else if (hasContribution && ageYears < minAge && !isEarlyRetirement) {
      // Has contribution but not eligible for normal or early retirement
      hazardousAllowed = false;
      disabilityAllowed = false;
    }

    // For early retirement and normal retirement, create NORMAL option
    const eligibleForRetirement = normalEligible || isEarlyRetirement;

    this.availableRetirementOptions = createRetirementOptions(
      eligibleForRetirement,
      hazardousAllowed,
      disabilityAllowed,
      sector
    );

    // Auto-select NORMAL option if it's the only option available
    if (this.availableRetirementOptions.length === 1) {
      const option = this.availableRetirementOptions[0];
      this.selectRetirementOption(option.type);
    }
  }

  /**
   * Select retirement option
   */
  selectRetirementOption(optionType: RetirementOptionType): void {
    this.selectedRetirementOption = optionType;
    this.retirementOptionFormControl.setValue(optionType);

    // Update required documents based on selected option
    const option = this.availableRetirementOptions.find(
      (opt) => opt.type === optionType
    );
    if (option) {
      const selectedBenefit = this.contributoryBenefitTypes.find(
        (bt) => bt.value === this.selectedBenefitType
      );
      const baseDocuments = selectedBenefit?.requiredDocuments || [];
      this.requiredDocuments = [...baseDocuments, ...option.requiredDocuments];
      this.uploadedDocuments.clear();
    }
  }

  /**
   * Handle file upload (Non-Contributory)
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.documentFormControl.setValue(file);
    }
  }

  /**
   * Handle document upload by type
   */
  onDocumentSelected(event: any, docType: string): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadedDocuments.set(docType, {
        type: docType,
        file: file,
        uploadedAt: new Date(),
      });
    }
  }

  /**
   * Check if document is uploaded
   */
  isDocumentUploaded(docType: string): boolean {
    return this.uploadedDocuments.has(docType);
  }

  /**
   * Get uploaded file name
   */
  getUploadedFileName(docType: string): string {
    return this.uploadedDocuments.get(docType)?.file.name || '';
  }

  /**
   * Remove uploaded document
   */
  removeDocument(docType: string): void {
    this.uploadedDocuments.delete(docType);
  }

  /**
   * Check if all documents are uploaded
   */
  allDocumentsUploaded(): boolean {
    return this.requiredDocuments.every((doc) =>
      this.uploadedDocuments.has(doc)
    );
  }

  /**
   * Add new document row
   */
  addDocumentRow(): void {
    this.documentRows.push({
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      documentType: '',
      file: null,
    });
  }

  /**
   * Remove document row
   */
  removeDocumentRow(rowId: string): void {
    this.documentRows = this.documentRows.filter((row) => row.id !== rowId);
  }

  /**
   * Handle document type selection
   */
  onDocumentTypeSelected(rowId: string, docType: string): void {
    const row = this.documentRows.find((r) => r.id === rowId);
    if (row) {
      row.documentType = docType;
    }
  }

  /**
   * Handle file selection for document row
   */
  onDocumentFileSelected(event: any, rowId: string): void {
    const file = event.target.files[0];
    if (file) {
      const row = this.documentRows.find((r) => r.id === rowId);
      if (row) {
        row.file = file;
        row.uploadedAt = new Date();

        // Also update uploadedDocuments map for compatibility
        if (row.documentType) {
          this.uploadedDocuments.set(row.documentType, {
            type: row.documentType,
            file: file,
            uploadedAt: row.uploadedAt,
          });
        }
      }
    }
  }

  /**
   * Get file name for document row
   */
  getDocumentRowFileName(rowId: string): string {
    const row = this.documentRows.find((r) => r.id === rowId);
    return row?.file?.name || '';
  }

  /**
   * Check if document row is complete (has both type and file)
   */
  isDocumentRowComplete(rowId: string): boolean {
    const row = this.documentRows.find((r) => r.id === rowId);
    return !!(row && row.documentType && row.file);
  }

  /**
   * Check if at least one document is uploaded
   */
  hasAtLeastOneDocument(): boolean {
    return this.documentRows.some((row) => row.documentType && row.file);
  }

  /**
   * Get count of uploaded documents
   */
  getUploadedDocumentCount(): number {
    return this.documentRows.filter((row) => row.documentType && row.file)
      .length;
  }

  /**
   * Handle Survivor's Pension Selection
   */
  private handleSurvivorPensionSelection(): void {
    if (
      this.contributionMonths < this.survivorConfig.minimumContributionMonths
    ) {
      alert(
        `At least ${this.survivorConfig.minimumContributionMonths} months of social security contributions are required to be eligible for survivor's pension.`
      );
      this.selectedBenefitType = '';
      this.schemeTypeFormControl.setValue('');
      return;
    }

    // Calculate funeral allowance (3 * reference remuneration)
    // Reference remuneration (R) is average of 12 highest contribution months
    const referenceRemuneration = this.getReferenceRemuneration();
    this.funeralAllowanceAmount = 3 * referenceRemuneration;
    this.showSurvivorForm = true;
  }

  /**
   * Select Disability Payment Type
   */
  selectDisabilityPaymentType(paymentType: DisabilityPaymentType): void {
    this.selectedDisabilityPaymentType = paymentType;
    this.disabilityPaymentTypeFormControl.setValue(paymentType);

    const option =
      paymentType === DisabilityPaymentType.ONE_TIME
        ? this.disabilityOptions.ONE_TIME
        : this.disabilityOptions.MONTHLY;

    this.requiredDocuments = [...option.requiredDocuments];
    this.uploadedDocuments.clear();
  }

  /**
   * Add Dependent to Survivor's Pension
   * NOTE: This logic is now handled by SurvivorPensionInfoComponent
   * Kept for backward compatibility if needed
   */
  // addDependent() - moved to SurvivorPensionInfoComponent

  /**
   * Remove Dependent from Survivor's Pension
   * NOTE: This logic is now handled by SurvivorPensionInfoComponent
   * Kept for backward compatibility if needed
   */
  // removeDependent() - moved to SurvivorPensionInfoComponent

  /**
   * Get total dependent percentage
   */
  getTotalDependentPercentage(): number {
    return this.dependents.reduce(
      (sum, dep) => sum + (dep.adjustedPercentage || dep.percentage),
      0
    );
  }

  /**
   * Create bank account form for dependent
   */
  private createDependentBankAccountForm(dependentId: string): void {
    const formGroup = new FormGroup({
      bankName: new FormControl('', [Validators.required]),
      accountNumber: new FormControl('', [Validators.required]),
      accountHolderName: new FormControl('', [Validators.required]),
    });
    this.dependentBankAccountForms.set(dependentId, formGroup);
  }

  /**
   * Get bank account form for dependent
   */
  getDependentBankAccountForm(dependentId: string): FormGroup {
    return this.dependentBankAccountForms.get(dependentId) || new FormGroup({});
  }

  /**
   * Check if all dependent bank accounts are filled
   */
  allDependentBankAccountsValid(): boolean {
    if (this.selectedBenefitType !== 'survivor-pension') {
      return true; // Not applicable
    }
    if (this.dependents.length === 0) {
      return false; // Must have at least one dependent
    }
    return Array.from(this.dependentBankAccountForms.values()).every(
      (form) => form.valid
    );
  }

  /**
   * Navigate to next step
   */
  nextStep(): void {
    if (this.stepper) {
      // Check eligibility when moving from step 1 (scheme selection) for non-survivor contributory
      if (
        this.stepper.selectedIndex === 1 &&
        this.selectedSchemeType === 'contributory' &&
        this.selectedBenefitType !== 'survivor-pension' &&
        !this.eligibilityResult
      ) {
        this.checkEligibility();
      }

      // Use stepper's navigation
      this.stepper.next();
      this.currentStep = this.stepper.selectedIndex;
    }
  }

  /**
   * Navigate to previous step
   */
  previousStep(): void {
    if (this.stepper) {
      this.stepper.previous();
      this.currentStep = this.stepper.selectedIndex;
    }
  }

  /**
   * Check if can proceed to next step
   */
  canProceedToNextStep(): boolean {
    // If there's a rejection, cannot proceed to any next step
    if (this.hasRejection) {
      return false;
    }
    
    // Use stepper's selectedIndex if available, otherwise fall back to currentStep
    const currentIndex = this.stepper?.selectedIndex ?? this.currentStep;

    switch (currentIndex) {
      case 0: // Citizen Search
        return this.citizenFound && !!this.citizenInfo;

      case 1: // Scheme Type Selection
        if (!this.schemeTypeFormControl.valid) {
          return false;
        }
        // For survivor's pension, need at least one dependent
        if (this.selectedBenefitType === 'survivor-pension') {
          const totalPercentage = this.getTotalDependentPercentage();
          // Must have dependents and total should not exceed 100%
          return (
            this.dependents.length > 0 &&
            totalPercentage > 0 &&
            totalPercentage <= 100
          );
        }
        return true;
      
      case 2: // Survivor Benefit Type Selection OR Non-Contributory Benefit Selection OR Contributory Eligibility/Options
        // For survivor's pension: validate benefit type selection
        if (this.selectedBenefitType === 'survivor-pension' && this.dependents.length > 0) {
          return this.survivorBenefitSelection !== null;
        }
        
        // For non-contributory: validate benefit selection
        if (this.selectedSchemeType === 'non-contributory') {
          return this.nonContributoryBenefitSelection !== null && 
                 this.nonContributoryBenefitSelection.isEligible;
        }
        
        // For contributory benefits (non-survivor):
        // For disability pension, step 2 is disability info
        if (this.selectedBenefitType === 'disability-pension') {
          return this.disabilityInfo !== null && this.disabilityInfo.isEligible;
        }
        // For old-age pension, step 2 is retirement options
        if (this.selectedBenefitType === 'old-age-pension') {
          return (
            !!this.selectedRetirementOption &&
            this.retirementOptionFormControl.valid
          );
        }
        return false;

      case 3: // Bank Account for survivor, or Documents for others
        // For survivor's pension, step 3 is bank account (eligibility step was hidden)
        if (this.selectedBenefitType === 'survivor-pension') {
          return this.allDependentBankAccountsValid();
        }
        // For other benefits, step 3 is documents
        // Allow user to upload any documents they want (at least one document)
        return this.hasAtLeastOneDocument();

      case 4: // Bank Account for non-survivor
        // This step only exists for non-survivor benefits
        if (this.selectedBenefitType === 'survivor-pension') {
          // This case should ideally not be reached if step 3 handles survivor bank accounts
          return this.allDependentBankAccountsValid(); // Fallback for safety
        }
        return this.bankAccountForm.valid;

      default:
        return false;
    }
  }

  /**
   * Submit benefit request
   */
  submitRequest(): void {
    if (!this.canProceedToNextStep()) {
      return;
    }

    this.isSubmitting = true;

    // Prepare documents from dynamic rows
    const documents: DocumentSubmission[] = this.documentRows
      .filter((row) => row.documentType && row.file)
      .map((row) => ({
        type: row.documentType,
        fileName: row.file!.name,
        fileSize: row.file!.size,
        fileType: row.file!.type,
        uploadedAt: row.uploadedAt || new Date(),
        fileData: row.file!, // In production, convert to base64 or use FormData
      }));

    // Prepare complete request
    const request: CompleteBenefitRequest = {
      // Citizen Information
      citizenNISS: this.citizenInfo?.niss || '',
      citizenName: this.citizenInfo?.name || '',
      citizenDateOfBirth: this.citizenInfo?.dateOfBirth || '',

      // Scheme and Benefit Information
      schemeType: this.selectedSchemeType || 'contributory',
      benefitType: this.selectedBenefitType,

      // Documents
      documents: documents,

      // Eligibility Information
      contributionMonths: this.contributionMonths,
      currentAge: this.currentAge,
      eligibilityMessage: this.eligibilityResult?.message,

      // Metadata
      submittedDate: new Date(),
      requestStatus: 'submitted',
    };

    // Add retirement-specific data
    if (this.selectedBenefitType === 'old-age-pension') {
      request.retirementOption = this.selectedRetirementOption || undefined;
      request.selectedHazardousIndustry =
        this.selectedHazardousIndustry || undefined;
      request.bankAccount = {
        bankName: this.bankAccountForm.value.bankName || '',
        accountNumber: this.bankAccountForm.value.accountNumber || '',
        accountHolderName: this.bankAccountForm.value.accountHolderName || '',
      };
    }

    // Add disability-specific data
    if (this.selectedBenefitType === 'disability-pension') {
      request.disabilityLevel = this.disabilityInfo?.disabilityLevel;
      request.disabilityType = this.disabilityInfo?.disabilityType || undefined;
      request.estimatedPension = this.disabilityInfo?.estimatedPension;
      request.bankAccount = {
        bankName: this.bankAccountForm.value.bankName || '',
        accountNumber: this.bankAccountForm.value.accountNumber || '',
        accountHolderName: this.bankAccountForm.value.accountHolderName || '',
      };
    }

    // Add survivor-specific data
    if (this.selectedBenefitType === 'survivor-pension') {
      request.funeralAllowance = this.funeralAllowanceAmount;
      request.dependents = this.dependents;
      
      // Add survivor benefit type selection
      if (this.survivorBenefitSelection) {
        request.survivorBenefitType = this.survivorBenefitSelection.benefitType;
        request.referenceRemuneration = this.survivorBenefitSelection.referenceRemuneration;
        request.survivorMonthlyPensionAmount = this.survivorBenefitSelection.monthlyPensionAmount;
        request.survivorOneTimeSubsidyAmount = this.survivorBenefitSelection.oneTimeSubsidyAmount;
        request.survivorFuneralReimbursementAmount = this.survivorBenefitSelection.funeralReimbursementAmount;
      }

      // Collect bank accounts for each dependent
      request.dependentBankAccounts = this.dependents.map((dep) => {
        const form = this.dependentBankAccountForms.get(dep.id!);
        return {
          dependentId: dep.id!,
          percentage: dep.adjustedPercentage || dep.percentage,
          bankName: form?.get('bankName')?.value || '',
          accountNumber: form?.get('accountNumber')?.value || '',
          accountHolderName: form?.get('accountHolderName')?.value || '',
        };
      });
    }

    // Non-contributory specific data
    if (this.selectedSchemeType === 'non-contributory') {
      // Add non-contributory benefit details
      if (this.nonContributoryBenefitSelection) {
        request.nonContributoryBenefitType = this.nonContributoryBenefitSelection.benefitType.id;
        request.nonContributoryBenefitLabel = this.nonContributoryBenefitSelection.benefitType.label;
        request.nonContributoryBenefitAmount = this.nonContributoryBenefitSelection.benefitType.amount;
        request.nonContributoryBenefitFrequency = this.nonContributoryBenefitSelection.benefitType.frequency;
      }
      
      // Single bank account for non-contributory (non-survivor)
      if (this.selectedBenefitType !== 'survivor-pension') {
        request.bankAccount = {
          bankName: this.bankAccountForm.value.bankName || '',
          accountNumber: this.bankAccountForm.value.accountNumber || '',
          accountHolderName: this.bankAccountForm.value.accountHolderName || '',
        };
      }
    }

    // Submit request
    this.benefitService.submitBenefitRequest(request).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        alert(
          `Request submitted successfully! Request ID: ${response.requestId}`
        );
        this.router.navigate(['/benefit/pending-requests']);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error submitting request:', error);
        alert('Error submitting request. Please try again.');
      },
    });
  }

  /**
   * Cancel request and navigate back
   */
  cancel(): void {
    this.router.navigate(['/benefit/contribution-scheme']);
  }
}
