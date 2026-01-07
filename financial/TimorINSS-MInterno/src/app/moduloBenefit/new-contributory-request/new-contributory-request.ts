import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  generateContributionPDF,
  ContributionPDFData,
} from '../utils/pdf.utils';

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
import { BenefitEligibilityEngineService } from '../services/benefit-eligibility-engine.service';
import {
  EligibilityRejectionDialogComponent,
  RejectionData,
} from '../components/eligibility-rejection-dialog/eligibility-rejection-dialog.component';
import {
  SubmissionSuccessDialogComponent,
  SubmissionSuccessData,
} from '../components/submission-success-dialog/submission-success-dialog.component';
import {
  BenefitType,
  CONTRIBUTORY_BENEFIT_TYPES,
} from '../constants/benefit-types.constants';
import {
  NonContributoryBenefitType,
  NON_CONTRIBUTORY_BENEFIT_TYPES,
} from '../constants/non-contributory-benefits.constants';
import { HAZARDOUS_INDUSTRIES } from '../constants/hazardous-industries.constants';
import {
  DEFAULT_HEALTH_STATUS,
  EmploymentSector,
  SAII_BASE_AMOUNT,
} from '../constants/eligibility.constants';
// Removed direct mock data imports - now using HTTP requests
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
import { getBenefitAmount } from '../constants/non-contributory-benefits.constants';
import {
  calculateOldPensionAmount,
  calculateDisabilityAmount,
  NON_CONTRIBUTORY_BENEFITS_CONFIG,
} from '../constants/non-contributory-benefits.config';

@Component({
  standalone: false,
  selector: 'app-new-contributory-request',
  templateUrl: './new-contributory-request.html',
  styleUrls: ['./new-contributory-request.css'],
})
export class NewContributoryRequestComponent implements OnInit, OnDestroy {
  // Expose Math, parseInt, and calculateAge for template
  Math = Math;
  parseInt = parseInt;
  calculateAge = calculateAge;

  // Step 1: Benefit Type Selection (Contributory vs Non-Contributory)
  benefitTypeFormControl = new FormControl('', [Validators.required]);
  selectedSchemeType: 'contributory' | 'non-contributory' | null = null;

  // Step 2: Citizen Search (NISS for contributory, ID number for non-contributory)
  nissFormControl = new FormControl('', [Validators.required]);
  idNumberFormControl = new FormControl('', [Validators.required]);

  // Non-contributory form fields
  nonContributoryForm = new FormGroup({
    idNumber: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    dateOfBirth: new FormControl('', [Validators.required]),
    gender: new FormControl('', [Validators.required]),
  });

  citizenInfo: CitizenInfo | null = null;
  isSearching = false;
  searchError: string | null = null;
  citizenFound = false;

  // Calculated age and benefit amount for non-contributory
  calculatedAge: number = 0;
  calculatedBenefitAmount: number = 0;
  ageValidationError: string | null = null;
  benefitEligibilityError: string | null = null; // Error when benefit type not eligible for current age

  // Debounce subject for ID number check
  private idNumberCheckSubject = new Subject<string>();
  private subscriptions: any[] = [];

  /**
   * Get formatted benefit amount for display
   */
  get formattedBenefitAmount(): string {
    if (this.calculatedBenefitAmount > 0) {
      return this.calculatedBenefitAmount.toFixed(2);
    }
    return '0.00';
  }

  /**
   * Get base amount for breakdown display
   */
  getBaseAmount(): string {
    if (this.selectedBenefitType === 'elderly-assistance') {
      return NON_CONTRIBUTORY_BENEFITS_CONFIG.oldPension.baseAmount.toFixed(2);
    } else if (this.selectedBenefitType === 'severe-disability') {
      return NON_CONTRIBUTORY_BENEFITS_CONFIG.disability.baseAmount.toFixed(2);
    }
    return '0.00';
  }

  /**
   * Get age 70-79 additional amount
   */
  getAge70to79Additional(): string {
    if (this.selectedBenefitType === 'elderly-assistance') {
      return NON_CONTRIBUTORY_BENEFITS_CONFIG.oldPension.age70to79Additional.toFixed(
        2
      );
    } else if (this.selectedBenefitType === 'severe-disability') {
      return NON_CONTRIBUTORY_BENEFITS_CONFIG.disability.age70to79Additional.toFixed(
        2
      );
    }
    return '0.00';
  }

  /**
   * Get age 80+ additional amount
   */
  getAge80PlusAdditional(): string {
    if (this.selectedBenefitType === 'elderly-assistance') {
      return NON_CONTRIBUTORY_BENEFITS_CONFIG.oldPension.age80PlusAdditional.toFixed(
        2
      );
    } else if (this.selectedBenefitType === 'severe-disability') {
      return NON_CONTRIBUTORY_BENEFITS_CONFIG.disability.age80PlusAdditional.toFixed(
        2
      );
    }
    return '0.00';
  }

  /**
   * Get benefit amount for a specific benefit type and age
   * Used to display amount next to each option
   */
  getBenefitAmountForType(benefitId: string, age: number): string {
    if (benefitId === 'elderly-assistance') {
      return calculateOldPensionAmount(age).toFixed(2);
    } else if (benefitId === 'severe-disability') {
      return calculateDisabilityAmount(age).toFixed(2);
    }
    // For other benefit types, return base amount from the benefit definition
    const benefit = this.nonContributoryBenefitTypes.find(
      (b) => b.id === benefitId
    );
    return benefit ? benefit.amount.toFixed(2) : '0.00';
  }

  // Step 3: Specific Benefit Type Selection
  schemeTypeFormControl = new FormControl('', [Validators.required]);
  selectedBenefitType: string = '';

  // Benefit types (loaded from constants)
  readonly contributoryBenefitTypes: BenefitType[] = CONTRIBUTORY_BENEFIT_TYPES;
  readonly nonContributoryBenefitTypes: NonContributoryBenefitType[] =
    NON_CONTRIBUTORY_BENEFIT_TYPES;

  // Non-Contributory Benefit Selection
  nonContributoryBenefitSelection: NonContributoryBenefitSelection | null =
    null;

  // Survivor Benefit Type Selection
  survivorBenefitSelection: SurvivorBenefitSelection | null = null;

  // Step 2: Contribution History
  contributionHistory: ContributionPeriod[] = [];
  totalContributionYears: number = 0;
  totalContributionMonths: number = 0;
  currentAge: string = '';
  healthStatus: HealthStatus = { status: DEFAULT_HEALTH_STATUS };
  cachedReferenceRemuneration: number | null = null; // Cache reference remuneration

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
    private dialog: MatDialog,
    private eligibilityEngine: BenefitEligibilityEngineService
  ) {}

  ngOnInit(): void {
    this.addDocumentRow();

    // Setup debounced ID number check for non-contributory
    const idCheckSubscription = this.idNumberCheckSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((idNumber) => {
        if (idNumber && idNumber.trim().length > 0) {
          this.checkIdNumberRegistration(idNumber.trim());
        }
      });
    this.subscriptions.push(idCheckSubscription);

    // Watch for date of birth changes to calculate age and benefit amount
    const dobSubscription = this.nonContributoryForm
      .get('dateOfBirth')
      ?.valueChanges.subscribe((dateOfBirth) => {
        if (dateOfBirth) {
          this.calculateAgeAndBenefitAmount();
        }
      });
    if (dobSubscription) {
      this.subscriptions.push(dobSubscription);
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.idNumberCheckSubject.complete();
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

    // Cache reference remuneration from contribution history
    if (this.citizenInfo?.niss) {
      this.benefitService.getContributionHistoryByNiss(this.citizenInfo.niss).subscribe({
        next: (historyData) => {
          if (historyData?.referenceRemuneration) {
            this.cachedReferenceRemuneration = historyData.referenceRemuneration;
          }
        }
      });
    }

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
   * Step 1: Select Benefit Type (Contributory or Non-Contributory)
   */
  selectBenefitType(type: 'contributory' | 'non-contributory'): void {
    this.selectedSchemeType = type;
    this.benefitTypeFormControl.setValue(type);
    // Mark as touched and update validity to enable Next button
    this.benefitTypeFormControl.markAsTouched();
    this.benefitTypeFormControl.updateValueAndValidity();

    // Reset citizen search when changing benefit type
    this.nissFormControl.reset();
    this.idNumberFormControl.reset();
    this.citizenInfo = null;
    this.citizenFound = false;
    this.searchError = null;

    // Reset all subsequent steps
    this.resetAllStepsData();
  }

  /**
   * Step 2: Search Citizen by NISS (for contributory) or ID Number (for non-contributory)
   */
  searchCitizen(): void {
    if (this.selectedSchemeType === 'contributory') {
      if (!this.nissFormControl.valid) {
        this.nissFormControl.markAsTouched();
        return;
      }
      const niss = this.nissFormControl.value?.trim();
      if (!niss) {
        return;
      }
      this.searchCitizenByNISS(niss);
    } else if (this.selectedSchemeType === 'non-contributory') {
      // For non-contributory, validation is done automatically via form
      this.validateNonContributoryForm();
    }
  }

  /**
   * Search citizen by NISS (for contributory benefits)
   */
  private searchCitizenByNISS(niss: string): void {
    // Reset rejection flag when searching new citizen
    this.hasRejection = false;

    this.isSearching = true;
    this.searchError = null;
    this.citizenInfo = null;
    this.citizenFound = false;

    const trimmedNiss = niss.trim();

    // First, check if NISS is already assigned to a beneficiary
    this.benefitService.getBeneficiaries().subscribe({
      next: (beneficiaries) => {
        // Normalize NISS for comparison (trim and uppercase)
        const normalizedNiss = trimmedNiss.toUpperCase().trim();
        const isAssigned = beneficiaries.some((b: any) => {
          const beneficiaryNiss = (b.niss || '').toUpperCase().trim();
          return beneficiaryNiss === normalizedNiss;
        });
        
        if (isAssigned) {
          this.searchError = 'This citizen is already assigned to a beneficiary scheme.';
          this.citizenInfo = null;
          this.citizenFound = false;
          this.isSearching = false;
          console.log('NISS already in beneficiaries:', normalizedNiss);
          return;
        }
        
        console.log('NISS not in beneficiaries, proceeding to search:', normalizedNiss);

        // If not assigned, proceed to search citizen
        this.benefitService.searchCitizen(trimmedNiss).subscribe({
          next: (citizen) => {
            if (citizen && citizen.found) {
              // Get contribution history to get employment sector
              this.benefitService.getContributionHistoryByNiss(trimmedNiss).subscribe({
                next: (history) => {
                  this.citizenInfo = {
                    niss: citizen.niss,
                    name: citizen.name,
                    dateOfBirth: citizen.dateOfBirth,
                    employmentSector: history?.employmentSector || EmploymentSector.PRIVATE,
                  };
                  this.citizenFound = true;
                  this.searchError = null;
                  this.isSearching = false;

                  // Only reset subsequent steps data after successful search
                  if (this.citizenFound) {
                    this.resetSubsequentStepsData();
                  }
                },
                error: () => {
                  // If contribution history not found, use default
                  this.citizenInfo = {
                    niss: citizen.niss,
                    name: citizen.name,
                    dateOfBirth: citizen.dateOfBirth,
                    employmentSector: EmploymentSector.PRIVATE,
                  };
                  this.citizenFound = true;
                  this.searchError = null;
                  this.isSearching = false;

                  if (this.citizenFound) {
                    this.resetSubsequentStepsData();
                  }
                }
              });
            } else {
              this.searchError = 'Citizen not found. Please verify the NISS number.';
              this.citizenInfo = null;
              this.citizenFound = false;
              this.isSearching = false;
            }
          },
          error: (error) => {
            console.error('Error searching citizen:', error);
            this.searchError = 'Citizen not found. Please verify the NISS number.';
            this.citizenInfo = null;
            this.citizenFound = false;
            this.isSearching = false;
          }
        });
      },
      error: (error) => {
        console.error('Error checking beneficiaries:', error);
        // If check fails, show error and don't proceed
        this.searchError = 'Error checking beneficiary status. Please try again.';
        this.citizenInfo = null;
        this.citizenFound = false;
        this.isSearching = false;
      }
    });
  }

  /**
   * Search citizen by ID Number (for non-contributory benefits)
   */
  private searchCitizenByIdNumber(idNumber: string): void {
    // Reset all form data when searching for a new citizen
    this.resetAllStepsData();
    this.hasRejection = false;

    this.isSearching = true;
    this.searchError = null;
    this.citizenInfo = null;
    this.citizenFound = false;

    // Mock API call - for non-contributory, we don't need NISS
    // In production, this would search by ID number instead
    setTimeout(() => {
      this.handleMockCitizenSearchByIdNumber(idNumber);
      this.isSearching = false;
    }, 1000);
  }

  // Removed handleMockCitizenSearch - now using HTTP requests in searchCitizenByNISS

  /**
   * Handle mock citizen search by ID Number (for non-contributory benefits)
   * This method is no longer used - replaced by validateNonContributoryForm
   * Kept for backward compatibility
   */
  private handleMockCitizenSearchByIdNumber(idNumber: string): void {
    // This method is deprecated - use validateNonContributoryForm instead
  }

  /**
   * Check if ID number is already registered for benefits
   */
  private checkIdNumberRegistration(idNumber: string): void {
    // Mock: Check if ID is already registered
    // In production, this would call API to check registration status
    const registeredIds = ['TL789012', 'TL545678', 'TL123456'];

    if (registeredIds.includes(idNumber.toUpperCase())) {
      this.searchError = 'This ID number is already registered for benefits.';
      this.citizenFound = false;
      this.citizenInfo = null;
      return;
    }

    // ID is not registered, clear error
    if (this.searchError && this.searchError.includes('already registered')) {
      this.searchError = null;
    }
  }

  /**
   * Calculate age and benefit amount from date of birth
   */
  calculateAgeAndBenefitAmount(): void {
    const dateOfBirth = this.nonContributoryForm.get('dateOfBirth')?.value;
    if (!dateOfBirth) {
      this.calculatedAge = 0;
      this.calculatedBenefitAmount = 0;
      this.benefitEligibilityError = null;
      return;
    }

    // Convert Date object to string format if needed
    let dateStr: string;
    if (
      dateOfBirth &&
      typeof dateOfBirth === 'object' &&
      'toISOString' in dateOfBirth
    ) {
      // It's a Date object
      dateStr = (dateOfBirth as Date).toISOString().split('T')[0];
    } else {
      // It's already a string
      dateStr = String(dateOfBirth);
    }

    const age = calculateAge(dateStr);
    this.calculatedAge = age.years;

    // Validate age: must be at least 18 years old
    if (age.years < 18) {
      this.ageValidationError =
        'Age must be at least 18 years old to be eligible for non-contributory benefits.';
      this.calculatedBenefitAmount = 0;
      this.benefitEligibilityError = null;
      this.selectedBenefitType = '';
      this.schemeTypeFormControl.setValue('');
      return;
    }

    // Clear age validation error if age is valid
    this.ageValidationError = null;

    // Don't automatically select benefit type - let user choose in step 3
    // Only calculate amount if benefit type is already selected
    if (this.selectedBenefitType) {
      // Check eligibility for the selected benefit type
      if (this.selectedBenefitType === 'elderly-assistance') {
        if (age.years >= 60) {
          this.calculatedBenefitAmount = calculateOldPensionAmount(age.years);
          this.benefitEligibilityError = null;
        } else {
          this.calculatedBenefitAmount = 0;
          this.benefitEligibilityError = `Old Age Social Pension requires age 60 or above. Current age: ${age.years} years.`;
        }
      } else if (this.selectedBenefitType === 'severe-disability') {
        if (age.years >= 18) {
          this.calculatedBenefitAmount = calculateDisabilityAmount(age.years);
          this.benefitEligibilityError = null;
        } else {
          this.calculatedBenefitAmount = 0;
          this.benefitEligibilityError = `Severe Disability Assistance requires age 18 or above. Current age: ${age.years} years.`;
        }
      }
    } else {
      // Clear eligibility error if no benefit type is selected
      this.benefitEligibilityError = null;
    }

    // Update required documents based on selected benefit type (if selected)
    if (this.selectedBenefitType) {
      const selectedBenefit = this.nonContributoryBenefitTypes.find(
        (bt) => bt.id === this.selectedBenefitType
      );
      if (selectedBenefit) {
        this.requiredDocuments = selectedBenefit.requiredDocuments;
      }
    }

    // Update currentAge for display
    this.currentAge = `${age.years} years ${age.months} months`;
  }

  /**
   * Handle ID number input change (with debounce)
   */
  onIdNumberChange(idNumber: string): void {
    this.idNumberCheckSubject.next(idNumber);
  }

  /**
   * Validate non-contributory form and create citizen info
   */
  validateNonContributoryForm(): void {
    if (this.nonContributoryForm.valid) {
      const formValue = this.nonContributoryForm.value;

      // Check ID registration
      const idNumber = formValue.idNumber || '';
      if (idNumber) {
        this.checkIdNumberRegistration(idNumber);
      }

      // If ID is valid, create citizen info
      if (
        !this.searchError ||
        !this.searchError.includes('already registered')
      ) {
        // Convert Date object to string format if needed
        let dateOfBirthStr: string;
        const dobValue = formValue.dateOfBirth;
        if (
          dobValue &&
          typeof dobValue === 'object' &&
          'toISOString' in dobValue
        ) {
          // It's a Date object
          dateOfBirthStr = (dobValue as Date).toISOString().split('T')[0];
        } else {
          // It's already a string
          dateOfBirthStr = String(dobValue || '');
        }

        this.citizenInfo = {
          niss: '', // No NISS for non-contributory
          name: formValue.name || '',
          dateOfBirth: dateOfBirthStr,
          employmentSector: EmploymentSector.PRIVATE,
        };

        // Calculate age
        this.calculateAgeAndBenefitAmount();

        this.citizenFound = true;
        this.searchError = null;
      }
    } else {
      this.nonContributoryForm.markAllAsTouched();
    }
  }

  /**
   * Handle Step 2 Next button click
   */
  handleStep2Next(): void {
    if (this.selectedSchemeType === 'non-contributory') {
      this.validateNonContributoryForm();
      if (this.citizenFound && !this.searchError) {
        this.nextStep();
      }
    } else {
      this.nextStep();
    }
  }

  /**
   * Step 3: Select Specific Benefit Type
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

    // For non-contributory, calculate benefit amount when type is selected
    if (type === 'non-contributory' && this.calculatedAge > 0) {
      if (benefitType === 'elderly-assistance') {
        this.calculatedBenefitAmount = calculateOldPensionAmount(
          this.calculatedAge
        );
      } else if (benefitType === 'severe-disability') {
        this.calculatedBenefitAmount = calculateDisabilityAmount(
          this.calculatedAge
        );
      }

      // Update required documents
      const selectedBenefit = this.nonContributoryBenefitTypes.find(
        (bt) => bt.id === benefitType
      );
      if (selectedBenefit) {
        this.requiredDocuments = selectedBenefit.requiredDocuments;
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
    if (type === 'contributory') {
      const selectedBenefit = this.contributoryBenefitTypes.find(
        (bt) => bt.value === benefitType
      );
      this.requiredDocuments = selectedBenefit?.requiredDocuments || [];
    } else if (type === 'non-contributory') {
      const selectedBenefit = this.nonContributoryBenefitTypes.find(
        (bt) => bt.id === benefitType
      );
      this.requiredDocuments = selectedBenefit?.requiredDocuments || [];
    }
    this.uploadedDocuments.clear();

    // Handle survivor's pension selection
    if (benefitType === 'survivor-pension') {
      this.handleSurvivorPensionSelection();
    }

    // For non-contributory: Recalculate benefit amount when benefit type is selected
    if (type === 'non-contributory' && this.calculatedAge > 0) {
      this.calculateAgeAndBenefitAmount();
    }
  }

  /**
   * Check Old-Age Pension Eligibility before allowing selection
   * Uses BenefitEligibilityEngineService for centralized logic
   */
  private checkOldAgePensionEligibility(): boolean {
    if (!this.citizenInfo) {
      alert('Please search for a citizen first.');
      return false;
    }

    const input = {
      dateOfBirth: this.citizenInfo.dateOfBirth,
      contributionMonths: this.contributionMonths,
      employmentSector:
        this.citizenInfo.employmentSector || EmploymentSector.PRIVATE,
      currentYear: new Date().getFullYear(),
      referenceRemuneration: this.getReferenceRemuneration(),
    };

    const result = this.eligibilityEngine.checkOldAgePensionEligibility(input);

    if (!result.eligible) {
      const rejectionData = this.eligibilityEngine.getRejectionData(
        'old-age',
        input,
        this.citizenInfo.name,
        this.citizenInfo.niss
      );

      if (rejectionData) {
        this.showRejectionDialog(rejectionData);
      }
      this.schemeTypeFormControl.setValue('');
      return false;
    }

    return true;
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
   * Uses BenefitEligibilityEngineService for centralized logic
   * Detailed disability level check will be done in the component
   */
  private checkDisabilityPensionBasicEligibility(): boolean {
    if (!this.citizenInfo) {
      alert('Please search for a citizen first.');
      return false;
    }

    const input = {
      dateOfBirth: this.citizenInfo.dateOfBirth,
      contributionMonths: this.contributionMonths,
      employmentSector:
        this.citizenInfo.employmentSector || EmploymentSector.PRIVATE,
      currentYear: new Date().getFullYear(),
      referenceRemuneration: this.getReferenceRemuneration(),
    };

    const result =
      this.eligibilityEngine.checkDisabilityPensionEligibility(input);

    if (!result.eligible) {
      const rejectionData = this.eligibilityEngine.getRejectionData(
        'disability',
        input,
        this.citizenInfo.name,
        this.citizenInfo.niss
      );

      if (rejectionData) {
        this.showRejectionDialog(rejectionData);
      }
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

    // For survivor pension: sync dependent bank accounts to parent's Map
    if (
      this.selectedBenefitType === 'survivor-pension' &&
      data.type === 'multiple' &&
      data.accounts
    ) {
      data.accounts.forEach((account: any) => {
        if (account.dependentId) {
          let form = this.dependentBankAccountForms.get(account.dependentId);
          if (!form) {
            form = this.createDependentBankAccountForm(account.dependentId);
          }
          // Update form values
          form?.patchValue(
            {
              bankName: account.bankName || '',
              accountNumber: account.accountNumber || '',
              accountHolderName: account.accountHolderName || '',
            },
            { emitEvent: false }
          );
        }
      });
    }
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
  onNonContributoryBenefitSelected(
    selection: NonContributoryBenefitSelection
  ): void {
    this.nonContributoryBenefitSelection = selection;

    // Update required documents based on benefit type
    if (selection.isEligible) {
      this.requiredDocuments = selection.benefitType.requiredDocuments;
    }
  }

  /**
   * Get reference remuneration (R) - average of 12 highest contribution months
   *
   * Definition: R = Average of 12 highest monthly salaries from contribution history
   *
   * In production, this should:
   * 1. Fetch salary history from backend API
   * 2. Select the 12 highest monthly salaries
   * 3. Calculate average: R = (Sum of 12 highest) / 12
   *
   * Currently using mock data for testing. All test cases now have referenceRemuneration
   * defined in mock-data.constants.ts. Fallback to $115 only if mock data is missing.
   */
  getReferenceRemuneration(): number {
    // Use cached value if available
    if (this.cachedReferenceRemuneration !== null) {
      return this.cachedReferenceRemuneration;
    }

    // Fallback value if not cached yet
    // Note: In production, this should be loaded before this method is called
    return 115.0;
  }

  /**
   * Calculate deceased's estimated pension: P = R * (N / 360)
   * Uses BenefitEligibilityEngineService for calculation
   */
  calculateDeceasedEstimatedPension(): number {
    const R = this.getReferenceRemuneration();
    const result = this.eligibilityEngine.calculateOldAgePension(
      R,
      this.contributionMonths
    );
    return result.calculatedPension;
  }

  /**
   * Handle survivor benefit type selection
   */
  onSurvivorBenefitTypeSelected(selection: SurvivorBenefitSelection): void {
    this.survivorBenefitSelection = selection;

    // Update funeral allowance (always 3 * R for eligible cases)
    this.funeralAllowanceAmount = selection.referenceRemuneration * 3;
  }

  /**
   * Reset subsequent steps data (from step 3 onwards)
   * This is used when searching for a new citizen to clear data from later steps
   * without resetting the stepper position
   */
  private resetSubsequentStepsData(): void {
    // Step 3: Specific Benefit Type Selection
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

    // Non-contributory specific
    this.calculatedAge = 0;
    this.calculatedBenefitAmount = 0;
    this.ageValidationError = null;
    this.benefitEligibilityError = null;
  }

  /**
   * Reset all steps data (when searching for a new citizen)
   */
  private resetAllStepsData(): void {
    // Reset rejection flag
    this.hasRejection = false;

    // Step 1: Benefit Type Selection
    // Note: selectedSchemeType is not reset here as it's set in Step 1

    // Step 3: Specific Benefit Type Selection
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

    // Non-contributory specific
    this.calculatedAge = 0;
    this.calculatedBenefitAmount = 0;
    this.ageValidationError = null;
    this.benefitEligibilityError = null;

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
    this.benefitTypeFormControl.reset();
    this.selectedSchemeType = null;
    this.nissFormControl.reset();
    this.idNumberFormControl.reset();
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
    // Check contributory benefits first (use 'value' property)
    const contributoryBenefit = this.contributoryBenefitTypes.find(
      (bt) => bt.value === this.selectedBenefitType
    );
    if (contributoryBenefit) {
      return contributoryBenefit.label;
    }

    // Check non-contributory benefits (use 'id' property)
    const nonContributoryBenefit = this.nonContributoryBenefitTypes.find(
      (bt) => bt.id === this.selectedBenefitType
    );
    if (nonContributoryBenefit) {
      return nonContributoryBenefit.label;
    }

    return '';
  }

  /**
   * Step 3: Check Eligibility (Contributory Scheme)
   */
  checkEligibility(): void {
    if (!this.citizenInfo) {
      return;
    }

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
      // Prepare rejection data for dialog
      const actualYears = Math.floor(this.contributionMonths / 12);
      const actualMonths = this.contributionMonths % 12;
      const requiredYears = Math.floor(
        this.survivorConfig.minimumContributionMonths / 12
      );
      const requiredMonths = this.survivorConfig.minimumContributionMonths % 12;

      let currentValue = '';
      if (actualYears > 0 && actualMonths > 0) {
        currentValue = `${actualYears} years ${actualMonths} months (${this.contributionMonths} months)`;
      } else if (actualYears > 0) {
        currentValue = `${actualYears} years (${this.contributionMonths} months)`;
      } else {
        currentValue = `${actualMonths} months`;
      }

      let requiredValue = '';
      if (requiredYears > 0 && requiredMonths > 0) {
        requiredValue = `${requiredYears} years ${requiredMonths} months (${this.survivorConfig.minimumContributionMonths} months)`;
      } else if (requiredYears > 0) {
        requiredValue = `${requiredYears} years (${this.survivorConfig.minimumContributionMonths} months)`;
      } else {
        requiredValue = `${requiredMonths} months`;
      }

      const rejectionData: RejectionData = {
        reason: 'contribution',
        benefitType: 'survivor',
        citizenName: this.citizenInfo?.name || 'Unknown',
        citizenNiss: this.citizenInfo?.niss || '',
        sector:
          this.citizenInfo?.employmentSector === EmploymentSector.PUBLIC
            ? 'Public Sector'
            : 'Private Sector',
        currentValue: currentValue,
        requiredValue: requiredValue,
        suggestions: [
          `Continue contributing until reaching ${this.survivorConfig.minimumContributionMonths} months`,
          'Apply for non-contributory benefits (if eligible)',
        ],
      };

      this.showSurvivorRejectionDialog(rejectionData);
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
   * Show rejection dialog for survivor pension
   */
  private showSurvivorRejectionDialog(data: RejectionData): void {
    const dialogRef = this.dialog.open(EligibilityRejectionDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: data,
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(() => {
      // Dialog closed, user can try selecting a different benefit type
    });
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
  private createDependentBankAccountForm(dependentId: string) {
    const formGroup = new FormGroup({
      bankName: new FormControl('', [Validators.required]),
      accountNumber: new FormControl('', [Validators.required]),
      accountHolderName: new FormControl('', [Validators.required]),
    });
    this.dependentBankAccountForms.set(dependentId, formGroup);
    return formGroup;
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
      case 0: // Step 1: Benefit Type Selection (Contributory vs Non-Contributory)
        return !!this.selectedSchemeType;

      case 1: // Step 2: Citizen Search (NISS or ID Number)
        if (this.selectedSchemeType === 'contributory') {
          return this.citizenFound && !!this.citizenInfo;
        } else if (this.selectedSchemeType === 'non-contributory') {
          return (
            this.nonContributoryForm.valid &&
            this.citizenFound &&
            !!this.citizenInfo &&
            !this.searchError
          );
        }
        return false;

      case 2: // Step 3: Specific Benefit Type Selection
        if (!this.schemeTypeFormControl.valid) {
          return false;
        }
        // For non-contributory: must have selected benefit type and calculated amount
        if (this.selectedSchemeType === 'non-contributory') {
          return (
            !!this.selectedBenefitType &&
            (this.selectedBenefitType === 'elderly-assistance' ||
              this.selectedBenefitType === 'severe-disability') &&
            this.calculatedBenefitAmount > 0 &&
            !this.ageValidationError &&
            !this.benefitEligibilityError
          );
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

      case 3: // Step 4: Survivor Benefit Type Selection OR Non-Contributory Benefit Amount Display OR Contributory Eligibility/Options
        // For survivor's pension: validate benefit type selection
        if (
          this.selectedBenefitType === 'survivor-pension' &&
          this.dependents.length > 0
        ) {
          return this.survivorBenefitSelection !== null;
        }

        // For non-contributory: validate that age is calculated, >= 18, and benefit amount is set
        if (this.selectedSchemeType === 'non-contributory') {
          return (
            this.calculatedAge >= 18 &&
            !this.ageValidationError &&
            !this.benefitEligibilityError &&
            this.calculatedBenefitAmount > 0 &&
            !!this.selectedBenefitType
          );
        }

        // For contributory benefits (non-survivor):
        // For disability pension, step 4 is disability info
        if (this.selectedBenefitType === 'disability-pension') {
          return this.disabilityInfo !== null && this.disabilityInfo.isEligible;
        }
        // For old-age pension, step 4 is retirement options
        if (this.selectedBenefitType === 'old-age-pension') {
          return (
            !!this.selectedRetirementOption &&
            this.retirementOptionFormControl.valid
          );
        }
        return false;

      case 4: // Step 5: Documents step
        // For all benefits, step 5 is documents
        // Allow user to upload any documents they want (at least one document)
        return this.hasAtLeastOneDocument();

      case 5: // Step 6: Bank Account (final step with submit button)
        // Use bankValidation from child component (works for both survivor and non-survivor)
        // bankValidation is set by onBankValidationChanged() from bank-account component
        return this.bankValidation === true;

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
        request.referenceRemuneration =
          this.survivorBenefitSelection.referenceRemuneration;
        request.survivorMonthlyPensionAmount =
          this.survivorBenefitSelection.monthlyPensionAmount;
        request.survivorOneTimeSubsidyAmount =
          this.survivorBenefitSelection.oneTimeSubsidyAmount;
        request.survivorFuneralReimbursementAmount =
          this.survivorBenefitSelection.funeralReimbursementAmount;
      }

      // Collect bank accounts for each dependent
      // Use bankAccountData from child component if available
      if (
        this.bankAccountData &&
        this.bankAccountData.type === 'multiple' &&
        this.bankAccountData.accounts
      ) {
        request.dependentBankAccounts = this.bankAccountData.accounts.map(
          (account: any) => ({
            dependentId: account.dependentId,
            percentage:
              this.dependents.find((d) => d.id === account.dependentId)
                ?.adjustedPercentage ||
              this.dependents.find((d) => d.id === account.dependentId)
                ?.percentage ||
              0,
            bankName: account.bankName || '',
            accountNumber: account.accountNumber || '',
            accountHolderName: account.accountHolderName || '',
          })
        );
      } else {
        // Fallback: use parent's Map (should be synced by onBankAccountChanged)
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
    }

    // Non-contributory specific data
    if (this.selectedSchemeType === 'non-contributory') {
      // Add non-contributory benefit details
      if (this.selectedBenefitType && this.calculatedBenefitAmount > 0) {
        // Get benefit type info
        const benefitType = this.nonContributoryBenefitTypes.find(
          (bt) => bt.id === this.selectedBenefitType
        );

        if (benefitType) {
          request.nonContributoryBenefitType = benefitType.id;
          request.nonContributoryBenefitLabel = benefitType.label;
          request.nonContributoryBenefitAmount = this.calculatedBenefitAmount;
          request.nonContributoryBenefitFrequency = benefitType.frequency;
        }
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
        
        // Check if this is a contributory request with contribution history
        const hasContributionHistory =
          this.selectedSchemeType === 'contributory' &&
          this.contributionHistory.length > 0;

        // Open success modal
        const dialogData: SubmissionSuccessData = {
          requestId: response.requestId,
          hasContributionHistory: hasContributionHistory,
          onDownloadClick: () => {
            try {
              this.generateContributionPDF();
            } catch (error) {
              console.error('Error generating PDF:', error);
              alert('Error generating PDF. Please try again.');
            }
          },
        };

        const dialogRef = this.dialog.open(SubmissionSuccessDialogComponent, {
          width: '500px',
          data: dialogData,
        });

        dialogRef.afterClosed().subscribe(() => {
          this.router.navigate(['/benefit/pending-requests']);
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error submitting request:', error);
        
        // Check if error is due to duplicate NISS (400 status)
        const errorMessage = error?.error?.error || error?.message || 'Error submitting request. Please try again.';
        alert(errorMessage);
      },
    });
  }

  /**
   * Generate PDF document listing contribution months
   * Uses utility function from pdf.utils.ts
   * Limited to 3-5 years of data
   */
  generateContributionPDF(): void {
    if (!this.citizenInfo || this.contributionHistory.length === 0) {
      console.warn(
        'Cannot generate PDF: Missing citizen info or contribution history'
      );
      return;
    }

    // Calculate pension value based on benefit type
    let pensionValue = 0;
    if (
      this.selectedBenefitType === 'old-age-pension' ||
      this.selectedBenefitType === 'survivor-pension'
    ) {
      pensionValue = this.calculateDeceasedEstimatedPension();
    } else if (
      this.selectedBenefitType === 'disability-pension' &&
      this.disabilityInfo
    ) {
      pensionValue = this.disabilityInfo.estimatedPension;
    }

    // Prepare PDF data
    const pdfData: ContributionPDFData = {
      citizenInfo: this.citizenInfo,
      contributionHistory: this.contributionHistory,
      contributionMonths: this.contributionMonths,
      referenceRemuneration: this.getReferenceRemuneration(),
      benefitTypeLabel: this.getSelectedBenefitLabel(),
      gender: this.nonContributoryForm.get('gender')?.value || undefined,
      employmentSector: this.citizenInfo.employmentSector,
      pensionValue: pensionValue,
    };

    // Generate PDF using utility function
    generateContributionPDF(pdfData);
  }

  /**
   * Cancel request and navigate back
   */
  cancel(): void {
    this.router.navigate(['/benefit/contribution-scheme']);
  }
}
