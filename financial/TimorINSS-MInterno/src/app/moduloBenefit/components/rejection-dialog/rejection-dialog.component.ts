import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface RejectionDialogData {
  title: string;
  citizenName: string;
  citizenNiss: string;
  sector?: string;
  currentValue: string;
  requiredValue: string;
  message: string;
  suggestions: string[];
}

@Component({
  standalone: false,
  selector: 'app-rejection-dialog',
  templateUrl: './rejection-dialog.component.html',
  styleUrls: ['./rejection-dialog.component.css']
})
export class RejectionDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<RejectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RejectionDialogData
  ) {}

  onBackToStart(): void {
    this.dialogRef.close('backToStart');
  }

  onClose(): void {
    this.dialogRef.close();
  }
}

