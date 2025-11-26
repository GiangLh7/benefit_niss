import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  Dependent,
  DependentRelationship,
  getDefaultPercentage,
  calculateAdjustedPercentages,
  RELATIONSHIP_LABELS,
  SURVIVOR_BENEFIT_CONFIG
} from '../../models/survivor-benefit.model';

export interface DependentsData {
  dependents: Dependent[];
}

@Component({
  standalone: false,
  selector: 'app-survivor-pension-info',
  templateUrl: './survivor-pension-info.component.html',
  styleUrls: ['./survivor-pension-info.component.css']
})
export class SurvivorPensionInfoComponent implements OnInit {
  @Input() funeralAllowanceAmount: number = 0;
  @Input() contributionMonths: number = 0;
  @Output() dependentsChanged = new EventEmitter<DependentsData>();

  dependents: Dependent[] = [];
  dependentFormGroup = new FormGroup({
    relationship: new FormControl('', [Validators.required]),
    fullName: new FormControl('', [Validators.required]),
    dateOfBirth: new FormControl('', [Validators.required]),
    identificationNumber: new FormControl('', [Validators.required])
  });

  readonly DependentRelationship = DependentRelationship;
  readonly relationshipLabels = RELATIONSHIP_LABELS;
  readonly survivorConfig = SURVIVOR_BENEFIT_CONFIG;

  ngOnInit(): void {
    // Initial check for minimum contribution
    if (this.contributionMonths < this.survivorConfig.minimumContributionMonths) {
      console.warn(
        `Insufficient contribution months (${this.contributionMonths}/${this.survivorConfig.minimumContributionMonths})`
      );
    }
  }

  /**
   * Add new dependent to the list
   */
  addDependent(): void {
    if (!this.dependentFormGroup.valid) {
      this.dependentFormGroup.markAllAsTouched();
      return;
    }

    const relationship = this.dependentFormGroup.value.relationship as DependentRelationship;
    const defaultPercentage = getDefaultPercentage(relationship);

    const newDependent: Dependent = {
      id: `dep-${Date.now()}`,
      relationship: relationship,
      fullName: this.dependentFormGroup.value.fullName || '',
      dateOfBirth: this.dependentFormGroup.value.dateOfBirth || '',
      identificationNumber: this.dependentFormGroup.value.identificationNumber || '',
      percentage: defaultPercentage,
      adjustedPercentage: defaultPercentage
    };

    this.dependents.push(newDependent);
    this.recalculateDependentPercentages();

    // Reset form
    this.dependentFormGroup.reset();

    // Emit change
    this.emitDependentsChange();
  }

  /**
   * Remove dependent from the list
   */
  removeDependent(id: string): void {
    this.dependents = this.dependents.filter(d => d.id !== id);
    this.recalculateDependentPercentages();
    this.emitDependentsChange();
  }

  /**
   * Recalculate dependent percentages to ensure total <= 100%
   */
  private recalculateDependentPercentages(): void {
    this.dependents = calculateAdjustedPercentages(this.dependents);
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
   * Emit dependents change event
   */
  private emitDependentsChange(): void {
    const data: DependentsData = {
      dependents: this.dependents
    };
    this.dependentsChanged.emit(data);
  }

  /**
   * Check if total percentage exceeds 100%
   */
  isTotalPercentageExceeded(): boolean {
    return this.getTotalDependentPercentage() > 100;
  }
}
