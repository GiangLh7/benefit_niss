import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {
  NON_CONTRIBUTORY_BENEFIT_TYPES,
  NonContributoryBenefitType,
  getBenefitAmountDisplay,
  getBenefitAmount,
  checkAgeEligibility
} from '../../constants/non-contributory-benefits.constants';

export interface NonContributoryBenefitSelection {
  benefitType: NonContributoryBenefitType;
  isEligible: boolean;
  ineligibilityReason?: string;
}

@Component({
  standalone: false,
  selector: 'app-non-contributory-benefits',
  templateUrl: './non-contributory-benefits.component.html',
  styleUrls: ['./non-contributory-benefits.component.css']
})
export class NonContributoryBenefitsComponent implements OnInit {
  @Input() citizenAge: number = 0;
  @Input() citizenName: string = '';
  @Output() benefitSelected = new EventEmitter<NonContributoryBenefitSelection>();

  benefitTypeControl = new FormControl('', [Validators.required]);
  
  availableBenefits = NON_CONTRIBUTORY_BENEFIT_TYPES;
  selectedBenefit: NonContributoryBenefitType | null = null;
  isEligible: boolean = false;
  ineligibilityReason: string = '';

  ngOnInit(): void {
    this.benefitTypeControl.valueChanges.subscribe(benefitId => {
      if (benefitId) {
        this.selectBenefit(benefitId);
      }
    });
  }

  /**
   * Select a benefit type
   */
  selectBenefit(benefitId: string): void {
    const benefit = this.availableBenefits.find(b => b.id === benefitId);
    if (!benefit) return;

    this.selectedBenefit = benefit;
    this.checkEligibility();
    this.emitSelection();
  }

  /**
   * Check eligibility for selected benefit
   */
  private checkEligibility(): void {
    if (!this.selectedBenefit) {
      this.isEligible = false;
      return;
    }

    // Check age eligibility
    const ageCheck = checkAgeEligibility(this.selectedBenefit, this.citizenAge);
    
    if (!ageCheck.eligible) {
      this.isEligible = false;
      this.ineligibilityReason = ageCheck.message || 'Age requirement not met';
      return;
    }

    // If age check passes, eligible for non-contributory
    this.isEligible = true;
    this.ineligibilityReason = '';
  }

  /**
   * Emit selection to parent
   */
  private emitSelection(): void {
    if (!this.selectedBenefit) return;

    this.benefitSelected.emit({
      benefitType: this.selectedBenefit,
      isEligible: this.isEligible,
      ineligibilityReason: this.ineligibilityReason
    });
  }

  /**
   * Get benefit amount display (with dynamic calculation based on age)
   */
  getBenefitAmount(benefit: NonContributoryBenefitType): string {
    return getBenefitAmountDisplay(benefit, this.citizenAge);
  }

  /**
   * Get benefit amount value (for calculations)
   */
  getBenefitAmountValue(benefit: NonContributoryBenefitType): number {
    return getBenefitAmount(benefit, this.citizenAge);
  }

  /**
   * Get frequency badge class
   */
  getFrequencyClass(frequency: string): string {
    switch (frequency) {
      case 'monthly':
        return 'frequency-monthly';
      case 'one-time':
        return 'frequency-onetime';
      case 'flexible':
        return 'frequency-flexible';
      default:
        return '';
    }
  }

  /**
   * Get frequency label
   */
  getFrequencyLabel(frequency: string): string {
    switch (frequency) {
      case 'monthly':
        return 'Monthly';
      case 'one-time':
        return 'One-time';
      case 'flexible':
        return 'Flexible';
      default:
        return frequency;
    }
  }
}

