import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface SubmissionSuccessData {
  requestId: string;
  hasContributionHistory: boolean;
  onDownloadClick: () => void;
}

@Component({
  standalone: false,
  selector: 'app-submission-success-dialog',
  templateUrl: './submission-success-dialog.component.html',
  styleUrls: ['./submission-success-dialog.component.css']
})
export class SubmissionSuccessDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SubmissionSuccessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SubmissionSuccessData
  ) {}

  onDownloadClick(): void {
    if (this.data.onDownloadClick) {
      this.data.onDownloadClick();
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}


