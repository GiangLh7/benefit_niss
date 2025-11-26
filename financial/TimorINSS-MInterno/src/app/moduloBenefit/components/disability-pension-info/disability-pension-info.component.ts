import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

export interface DisabilityInfo {
  disabilityLevel: number;
  disabilityType: 'relative' | 'absolute' | null;
  isEligible: boolean;
  estimatedPension: number;
  referenceRemuneration: number;
}

@Component({
  standalone: false,
  selector: 'app-disability-pension-info',
  templateUrl: './disability-pension-info.component.html',
  styleUrls: ['./disability-pension-info.component.css']
})
export class DisabilityPensionInfoComponent implements OnInit, OnChanges {
  @Input() contributionMonths: number = 0;
  @Input() currentAge: number = 0;
  @Input() sector: 'private' | 'public' = 'private';
  @Output() disabilityInfoChanged = new EventEmitter<DisabilityInfo>();

  disabilityLevelControl = new FormControl('', [
    Validators.required,
    Validators.min(0),
    Validators.max(100)
  ]);

  disabilityLevel: number = 0;
  disabilityType: 'relative' | 'absolute' | null = null;
  isEligible: boolean = false;
  estimatedPension: number = 0;
  referenceRemuneration: number = 115; // Mock value - base salary USD
  ineligibilityReason: string = '';

  // Minimum requirements
  readonly MINIMUM_DISABILITY_LEVEL = 66.67;
  readonly MINIMUM_CONTRIBUTION_MONTHS = 60; // For 2025

  ngOnInit(): void {
    this.disabilityLevelControl.valueChanges.subscribe(value => {
      if (value !== null && value !== '') {
        this.disabilityLevel = parseFloat(value);
        this.calculateDisabilityInfo();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contributionMonths'] || changes['currentAge'] || changes['sector']) {
      if (this.disabilityLevel > 0) {
        this.calculateDisabilityInfo();
      }
    }
  }

  /**
   * Calculate disability pension information
   */
  private calculateDisabilityInfo(): void {
    // Reset
    this.isEligible = false;
    this.disabilityType = null;
    this.estimatedPension = 0;
    this.ineligibilityReason = '';

    // Validate disability level
    if (this.disabilityLevel < this.MINIMUM_DISABILITY_LEVEL) {
      this.ineligibilityReason = `Disability level must be at least ${this.MINIMUM_DISABILITY_LEVEL}%`;
      this.emitChange();
      return;
    }

    // Validate contribution
    if (this.contributionMonths < this.MINIMUM_CONTRIBUTION_MONTHS) {
      this.ineligibilityReason = `Insufficient contribution. Need ${this.MINIMUM_CONTRIBUTION_MONTHS} months, have ${this.contributionMonths} months.`;
      this.emitChange();
      return;
    }

    // Determine disability type
    if (this.disabilityLevel === 100) {
      this.disabilityType = 'absolute';
    } else if (this.disabilityLevel >= this.MINIMUM_DISABILITY_LEVEL) {
      this.disabilityType = 'relative';
    }

    // Calculate pension: P = R × (N / 360)
    this.estimatedPension = this.referenceRemuneration * (this.contributionMonths / 360);
    this.isEligible = true;

    this.emitChange();
  }

  /**
   * Emit disability info change
   */
  private emitChange(): void {
    const info: DisabilityInfo = {
      disabilityLevel: this.disabilityLevel,
      disabilityType: this.disabilityType,
      isEligible: this.isEligible,
      estimatedPension: this.estimatedPension,
      referenceRemuneration: this.referenceRemuneration
    };
    this.disabilityInfoChanged.emit(info);
  }

  /**
   * Get disability type label
   */
  getDisabilityTypeLabel(): string {
    if (!this.disabilityType) return '';
    return this.disabilityType === 'absolute' 
      ? 'Absolute Disability (Invalidez Absoluta)' 
      : 'Relative Disability (Invalidez Relativa)';
  }

  /**
   * Get disability type description
   */
  getDisabilityTypeDescription(): string {
    if (!this.disabilityType) return '';
    if (this.disabilityType === 'absolute') {
      return 'Cannot perform any work. Pension may be received until age 60, then auto-converts to Old-Age Pension.';
    } else {
      return 'Can perform limited work with income restrictions. Total income (pension + salary) must not exceed 200% of reference remuneration.';
    }
  }

  /**
   * Get work permission status
   */
  canWork(): boolean {
    return this.disabilityType === 'relative';
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  /**
   * Get years until auto-conversion
   */
  getYearsUntilConversion(): number {
    if (this.currentAge >= 60) return 0;
    return 60 - this.currentAge;
  }
}

