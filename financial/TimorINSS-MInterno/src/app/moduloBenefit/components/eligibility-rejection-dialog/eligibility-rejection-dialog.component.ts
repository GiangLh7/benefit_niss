import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface RejectionData {
  reason: 'age' | 'contribution';
  benefitType?: 'old-age' | 'disability' | 'survivor'; // Benefit type for context
  citizenName: string;
  citizenNiss: string;
  currentValue: string;
  requiredValue: string;
  sector?: string;
  suggestions: string[];
}

@Component({
  standalone: false,
  selector: 'app-eligibility-rejection-dialog',
  templateUrl: './eligibility-rejection-dialog.component.html',
  styleUrls: ['./eligibility-rejection-dialog.component.css']
})
export class EligibilityRejectionDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EligibilityRejectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RejectionData
  ) {}

  getTitle(): string {
    return this.data.reason === 'age' 
      ? 'Insufficient Age' 
      : 'Insufficient Contribution Period';
  }

  getBenefitTypeName(): string {
    if (!this.data.benefitType) {
      return 'Old-Age Pension'; // Default for backward compatibility
    }
    
    switch (this.data.benefitType) {
      case 'disability':
        return 'Disability Pension';
      case 'survivor':
        return 'Survivor Pension';
      case 'old-age':
      default:
        return 'Old-Age Pension';
    }
  }

  getIcon(): string {
    return this.data.reason === 'age' ? 'cake' : 'history';
  }

  onBackToSearch(): void {
    this.dialogRef.close('back-to-search');
  }

  onClose(): void {
    this.dialogRef.close();
  }
}

