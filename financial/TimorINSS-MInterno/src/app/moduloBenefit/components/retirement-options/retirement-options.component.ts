import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { EligibilityResult } from '../../interfaces/citizen.interface';
import {
  RetirementOption,
  RetirementOptionType,
} from '../../models/benefit.model';
import { HAZARDOUS_INDUSTRIES } from '../../constants/hazardous-industries.constants';
import { BenefitEligibilityEngineService } from '../../services/benefit-eligibility-engine.service';
import { SAII_BASE_AMOUNT } from '../../constants/eligibility.constants';

export interface HazardousIndustry {
  id: string;
  name: string;
  description?: string;
}

@Component({
  standalone: false,
  selector: 'app-retirement-options',
  templateUrl: './retirement-options.component.html',
  styleUrls: ['./retirement-options.component.css'],
})
export class RetirementOptionsComponent implements OnInit, OnChanges {
  @Input() eligibilityResult: EligibilityResult | null = null;
  @Input() contributionMonths: number = 0;
  @Input() referenceRemuneration!: number; // R - Average of 12 highest contribution months (required)
  @Input() saiiAmount: number = SAII_BASE_AMOUNT; // SAII - Subsídio de Apoio a Idosos e Inválidos (Elderly/Disabled Support Subsidy)
  @Input() availableRetirementOptions: RetirementOption[] = [];
  @Input() hazardousIndustries: HazardousIndustry[] = [];

  pensionCalculation: {
    calculatedPension: number;
    minimumGuaranteed: number;
    taxAmount: number;
    finalPension: number;
  } | null = null;

  @Output() retirementOptionSelected = new EventEmitter<{
    optionType: RetirementOptionType;
    hazardousIndustry?: string;
  }>();

  @Output() validationChanged = new EventEmitter<boolean>();

  // Form controls
  retirementOptionFormControl = new FormControl('', [Validators.required]);
  selectedRetirementOption: RetirementOptionType | null = null;
  selectedHazardousIndustry: string = '';

  constructor(private eligibilityEngine: BenefitEligibilityEngineService) {}

  ngOnInit(): void {
    this.retirementOptionFormControl.valueChanges.subscribe(() => {
      this.emitValidation();
    });
    this.calculatePension();
  }

  ngOnChanges(): void {
    this.calculatePension();
  }

  /**
   * Calculate pension using BenefitEligibilityEngineService
   */
  private calculatePension(): void {
    if (this.eligibilityResult?.eligible && this.contributionMonths > 0) {
      const result = this.eligibilityEngine.calculateOldAgePension(
        this.referenceRemuneration,
        this.contributionMonths
      );

      this.pensionCalculation = {
        calculatedPension: result.calculatedPension,
        minimumGuaranteed: result.minimumGuaranteedPension || 0,
        taxAmount: result.taxAmount || 0,
        finalPension: result.finalPension,
      };
    }
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
        hazardousIndustry: this.selectedHazardousIndustry || undefined,
      });
    }
    this.emitValidation();
  }

  /**
   * Emit validation status
   */
  private emitValidation(): void {
    const isValid =
      this.retirementOptionFormControl.valid &&
      (this.selectedRetirementOption !== 'HAZARDOUS_INDUSTRY' ||
        !!this.selectedHazardousIndustry);
    this.validationChanged.emit(isValid);
  }

  /**
   * Check if can proceed (for parent validation)
   */
  canProceed(): boolean {
    return (
      !!this.selectedRetirementOption &&
      this.retirementOptionFormControl.valid &&
      (this.selectedRetirementOption !== 'HAZARDOUS_INDUSTRY' ||
        !!this.selectedHazardousIndustry)
    );
  }
}
