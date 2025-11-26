import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Dependent, DependentRelationship } from '../../models/survivor-benefit.model';

export type SurvivorBenefitType = 'monthly-pension' | 'one-time-subsidy' | 'funeral-reimbursement';

export interface SurvivorBenefitSelection {
  benefitType: SurvivorBenefitType;
  referenceRemuneration: number; // R - average of 12 highest months
  monthlyPensionAmount?: number; // For monthly pension
  oneTimeSubsidyAmount?: number; // For one-time subsidy (3 * R)
  funeralReimbursementAmount?: number; // For funeral reimbursement (max 3 * R)
  eligibility: {
    hasEligibleDependents: boolean;
    canReceiveMonthlyPension: boolean;
    canReceiveOneTimeSubsidy: boolean;
    canReceiveFuneralReimbursement: boolean;
  };
}

@Component({
  standalone: false,
  selector: 'app-survivor-benefit-type',
  templateUrl: './survivor-benefit-type.component.html',
  styleUrls: ['./survivor-benefit-type.component.css']
})
export class SurvivorBenefitTypeComponent implements OnInit {
  @Input() dependents: Dependent[] = [];
  @Input() referenceRemuneration: number = 115; // R - average of 12 highest months
  @Input() contributionMonths: number = 0;
  @Input() deceasedAge: number = 0;
  @Input() deceasedEstimatedPension?: number; // Estimated pension of deceased (P = R * (N / 360))
  
  @Output() benefitTypeSelected = new EventEmitter<SurvivorBenefitSelection>();

  benefitTypeControl = new FormControl('', [Validators.required]);
  selectedBenefitType: SurvivorBenefitType | null = null;

  // Constants (exposed for template)
  readonly ONE_TIME_SUBSIDY_MULTIPLIER = 3; // 3 * R
  readonly FUNERAL_REIMBURSEMENT_MAX_MULTIPLIER = 3; // Max 3 * R
  readonly MINIMUM_CONTRIBUTION_MONTHS_2025 = 60; // For 2025 onwards

  ngOnInit(): void {
    this.benefitTypeControl.valueChanges.subscribe(value => {
      if (value) {
        this.selectBenefitType(value as SurvivorBenefitType);
      }
    });
  }

  /**
   * Select benefit type
   */
  selectBenefitType(type: SurvivorBenefitType): void {
    this.selectedBenefitType = type;
    this.emitSelection();
  }

  /**
   * Check eligibility for each benefit type
   */
  private checkEligibility(): {
    hasEligibleDependents: boolean;
    canReceiveMonthlyPension: boolean;
    canReceiveOneTimeSubsidy: boolean;
    canReceiveFuneralReimbursement: boolean;
  } {
    const hasEligibleDependents = this.dependents.length > 0;
    const hasSufficientContribution = this.contributionMonths >= this.MINIMUM_CONTRIBUTION_MONTHS_2025;
    
    // Monthly Pension: Requires contribution period
    const canReceiveMonthlyPension = hasEligibleDependents && hasSufficientContribution;
    
    // One-time Subsidy: No contribution requirement, but needs eligible dependents
    const canReceiveOneTimeSubsidy = hasEligibleDependents;
    
    // Funeral Reimbursement: Only if NO eligible dependents
    const canReceiveFuneralReimbursement = !hasEligibleDependents;
    
    return {
      hasEligibleDependents,
      canReceiveMonthlyPension,
      canReceiveOneTimeSubsidy,
      canReceiveFuneralReimbursement
    };
  }

  /**
   * Calculate deceased's estimated pension: P = R * (N / 360)
   * Exposed for template
   */
  calculateDeceasedPension(): number {
    if (this.deceasedEstimatedPension !== undefined) {
      return this.deceasedEstimatedPension;
    }
    // Calculate: P = R * (N / 360)
    const R = this.referenceRemuneration;
    const N = this.contributionMonths;
    return (R * N) / 360;
  }

  /**
   * Check if dependent is a child
   */
  private isChild(dep: Dependent): boolean {
    return dep.relationship === DependentRelationship.CHILD;
  }

  /**
   * Check if dependent is a spouse/partner
   */
  private isSpouse(dep: Dependent): boolean {
    return dep.relationship === DependentRelationship.SPOUSE;
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Check if child is under 24 (still eligible)
   */
  private isChildUnder24(dep: Dependent): boolean {
    if (!this.isChild(dep)) {
      return false;
    }
    const age = this.calculateAge(dep.dateOfBirth);
    return age < 24; // Children under 24 (and still in school)
  }

  /**
   * Calculate monthly pension percentage based on dependents
   * Returns: 65% or 100% based on rules
   * Exposed for template
   */
  calculateMonthlyPensionPercentage(): number {
    if (this.dependents.length === 0) {
      return 0;
    }

    // Check if there are children under 24
    const hasChildrenUnder24 = this.dependents.some(dep => this.isChildUnder24(dep));

    // Check if there's a spouse/partner
    const hasSpouse = this.dependents.some(dep => this.isSpouse(dep));

    // Check if spouse is >= 60 years old (retirement age)
    const spouseAge = this.dependents
      .filter(dep => this.isSpouse(dep))
      .map(dep => this.calculateAge(dep.dateOfBirth))[0] || 0;
    const spouseIsRetired = hasSpouse && spouseAge >= 60;

    // Rules from requirements:
    // 1. Vợ/Chồng không có con nhỏ: 65% (1 năm nếu <45t, 2 năm nếu >45t, suốt đời nếu >=60t)
    // 2. Vợ/Chồng có con nhỏ: 100% (chia đều) cho đến khi con út tròn 24t
    // 3. Con không còn vợ/chồng: 100% (chia đều) cho đến khi tròn 24t
    // 4. Con & Vợ/Chồng: 100% (chia đều) cho đến khi con tròn 24t

    if (hasChildrenUnder24) {
      // Has children under 24: 100% (divided among all)
      return 100;
    }

    if (hasSpouse && !hasChildrenUnder24) {
      // Only spouse, no children under 24: 65%
      return 65;
    }

    // Only children (all >= 24): 100% (but they're not eligible anymore, so this shouldn't happen)
    // Default: 100%
    return 100;
  }

  /**
   * Calculate benefit amounts
   */
  private calculateAmounts(type: SurvivorBenefitType): {
    monthlyPensionAmount?: number;
    oneTimeSubsidyAmount?: number;
    funeralReimbursementAmount?: number;
  } {
    const amounts: any = {};
    
    switch (type) {
      case 'monthly-pension':
        // Monthly pension = deceased's pension * percentage
        const deceasedPension = this.calculateDeceasedPension();
        const percentage = this.calculateMonthlyPensionPercentage();
        amounts.monthlyPensionAmount = (deceasedPension * percentage) / 100;
        break;
        
      case 'one-time-subsidy':
        amounts.oneTimeSubsidyAmount = this.referenceRemuneration * this.ONE_TIME_SUBSIDY_MULTIPLIER;
        break;
        
      case 'funeral-reimbursement':
        // Actual amount depends on actual funeral expenses, but max is 3 * R
        amounts.funeralReimbursementAmount = this.referenceRemuneration * this.FUNERAL_REIMBURSEMENT_MAX_MULTIPLIER;
        break;
    }
    
    return amounts;
  }

  /**
   * Emit selection to parent
   */
  private emitSelection(): void {
    if (!this.selectedBenefitType) return;

    const eligibility = this.checkEligibility();
    const amounts = this.calculateAmounts(this.selectedBenefitType);

    const selection: SurvivorBenefitSelection = {
      benefitType: this.selectedBenefitType,
      referenceRemuneration: this.referenceRemuneration,
      ...amounts,
      eligibility
    };

    this.benefitTypeSelected.emit(selection);
  }

  /**
   * Get eligibility message
   */
  getEligibilityMessage(): string {
    const eligibility = this.checkEligibility();
    
    if (!eligibility.hasEligibleDependents) {
      return 'No eligible dependents found. Only funeral reimbursement is available.';
    }
    
    if (!eligibility.canReceiveMonthlyPension && eligibility.canReceiveOneTimeSubsidy) {
      return 'Insufficient contribution period for monthly pension. One-time subsidy is available.';
    }
    
    if (eligibility.canReceiveMonthlyPension) {
      return 'Eligible for both monthly pension and one-time subsidy. Please choose one.';
    }
    
    return 'Please check eligibility requirements.';
  }

  /**
   * Check if benefit type is available
   */
  isBenefitTypeAvailable(type: SurvivorBenefitType): boolean {
    const eligibility = this.checkEligibility();
    
    switch (type) {
      case 'monthly-pension':
        return eligibility.canReceiveMonthlyPension;
      case 'one-time-subsidy':
        return eligibility.canReceiveOneTimeSubsidy;
      case 'funeral-reimbursement':
        return eligibility.canReceiveFuneralReimbursement;
      default:
        return false;
    }
  }

  /**
   * Get monthly pension amount (exposed for template)
   */
  getMonthlyPensionAmount(): number {
    if (this.selectedBenefitType !== 'monthly-pension') {
      return 0;
    }
    const deceasedPension = this.calculateDeceasedPension();
    const percentage = this.calculateMonthlyPensionPercentage();
    return (deceasedPension * percentage) / 100;
  }

  /**
   * Check if has both spouse and children
   */
  hasSpouseAndChildren(): boolean {
    const hasSpouse = this.dependents.some(dep => this.isSpouse(dep));
    const hasChildren = this.dependents.some(dep => this.isChild(dep));
    return hasSpouse && hasChildren;
  }
}

