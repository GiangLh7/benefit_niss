import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface RejectionData {
  reason: 'age' | 'contribution';
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

