import { Component, EventEmitter, Inject, Output } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from "ngx-spinner";
import { DialogComponent } from "../dialog/dialog.component";
import { MyErrorStateMatcher } from "../../matcher";

export interface PopUpWarningData {
  function: any;
  msg: string;
  noConfirmation: boolean;
  hideQuestion: boolean;
}

@Component({
  selector: 'app-pop-up-warning',
  templateUrl: 'pop-up-warning.component.html',
  styleUrls: ['./pop-up-warning.component.css']
})
export class PopUpWarningComponent {
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public errors: string[] = [];
  @Output() click = new EventEmitter();
  constructor(
    public dialogRef: MatDialogRef<PopUpWarningComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PopUpWarningData,
    private spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    public translate: TranslateService,
  ) {
  }

  public onNoClick(): void {
    this.dialogRef.close();
  }

  public onSaveClick(): void {
    if(this.data.function)
    {
      this.showLoader();
      this.click.emit(this.data.function.subscribe(() => {
        this.hideLoader();
        this.dialogRef.close(true);
      },
      (err: any) => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
        this.dialogRef.close();
      }));
    }
    else
    {
      this.dialogRef.close(true);
    }
  }

  public showLoader() {
    this.spinner.show();
  }


  public hideLoader() {
    this.spinner.hide();
  }

  public showError() {
    const dialogRef = this.openErrorsDialog(this.errors, this.errorDialog);

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }


  private openErrorsDialog(errors: string[], dialog: MatDialog) {
    return dialog.open(DialogComponent, {
      id: 'dialog',
      minHeight: '300px',
      width: '50%',
      height: '30%',
      panelClass: 'modalWithBorder',
      data: { errors: errors }
    });
  }
}
