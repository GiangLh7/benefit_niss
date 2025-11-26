import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { EligibilityResult } from '../../interfaces/citizen.interface';
import { RetirementOption, RetirementOptionType } from '../../models/benefit.model';
import { HAZARDOUS_INDUSTRIES } from '../../constants/hazardous-industries.constants';

export interface HazardousIndustry {
  id: string;
  name: string;
  description?: string;
}

@Component({
  standalone: false,
  selector: 'app-retirement-options',
  templateUrl: './retirement-options.component.html',
  styleUrls: ['./retirement-options.component.css']
})
export class RetirementOptionsComponent implements OnInit {
  // Expose Math for template
  Math = Math;

  @Input() eligibilityResult: EligibilityResult | null = null;
  @Input() contributionMonths: number = 0;
  @Input() availableRetirementOptions: RetirementOption[] = [];
  @Input() hazardousIndustries: HazardousIndustry[] = [];

  @Output() retirementOptionSelected = new EventEmitter<{
    optionType: RetirementOptionType;
    hazardousIndustry?: string;
  }>();
  
  @Output() validationChanged = new EventEmitter<boolean>();

  // Form controls
  retirementOptionFormControl = new FormControl('', [Validators.required]);
  selectedRetirementOption: RetirementOptionType | null = null;
  selectedHazardousIndustry: string = '';

  ngOnInit(): void {
    // Listen to form control changes
    this.retirementOptionFormControl.valueChanges.subscribe(() => {
      this.emitValidation();
    });
  }

  /**
   * Select retirement option
   */
  selectRetirementOption(optionType: RetirementOptionType): void {
    this.selectedRetirementOption = optionType;
    this.retirementOptionFormControl.setValue(optionType);
    
    // Emit selection
    this.emitSelection();
  }

  /**
   * Handle hazardous industry selection
   */
  onHazardousIndustryChange(): void {
    this.emitSelection();
  }

  /**
   * Emit selection event
   */
  private emitSelection(): void {
    if (this.selectedRetirementOption) {
      this.retirementOptionSelected.emit({
        optionType: this.selectedRetirementOption,
        hazardousIndustry: this.selectedHazardousIndustry || undefined
      });
    }
    this.emitValidation();
  }

  /**
   * Emit validation status
   */
  private emitValidation(): void {
    const isValid = this.retirementOptionFormControl.valid &&
      (this.selectedRetirementOption !== 'HAZARDOUS_INDUSTRY' || !!this.selectedHazardousIndustry);
    this.validationChanged.emit(isValid);
  }

  /**
   * Check if can proceed (for parent validation)
   */
  canProceed(): boolean {
    return !!this.selectedRetirementOption && 
           this.retirementOptionFormControl.valid &&
           (this.selectedRetirementOption !== 'HAZARDOUS_INDUSTRY' || !!this.selectedHazardousIndustry);
  }
}

