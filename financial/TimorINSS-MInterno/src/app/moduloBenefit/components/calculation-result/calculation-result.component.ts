import { Component, Input } from '@angular/core';
import { BenefitCalculationResult, CalculationDisplayHelper } from '../../models/calculation.model';

@Component({
  standalone: false,
  selector: 'app-calculation-result',
  templateUrl: './calculation-result.component.html',
  styleUrls: ['./calculation-result.component.css']
})
export class CalculationResultComponent {
  @Input() calculation!: BenefitCalculationResult;
  @Input() showBreakdown: boolean = true;
  @Input() showFormula: boolean = true;
  
  isExpanded: boolean = false;

  get displayHelper() {
    return CalculationDisplayHelper;
  }

  toggleBreakdown(): void {
    this.isExpanded = !this.isExpanded;
  }

  formatCurrency(amount: number): string {
    return CalculationDisplayHelper.formatCurrency(amount);
  }

  getBenefitTypeLabel(type: string): string {
    return CalculationDisplayHelper.getBenefitTypeLabel(type);
  }

  getBreakdownSteps(): any[] {
    if (!this.calculation?.breakdown) {
      return [];
    }
    
    const steps = [];
    const breakdown = this.calculation.breakdown;
    
    if (breakdown.step1) steps.push(breakdown.step1);
    if (breakdown.step2) steps.push(breakdown.step2);
    if (breakdown.step3) steps.push(breakdown.step3);
    if (breakdown.step4) steps.push(breakdown.step4);
    
    return steps;
  }
}

