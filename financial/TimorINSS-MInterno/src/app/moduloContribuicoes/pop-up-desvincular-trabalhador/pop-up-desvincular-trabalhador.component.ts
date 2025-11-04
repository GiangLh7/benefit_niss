import { Component, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from "ngx-spinner";
import { MyErrorStateMatcher } from "../../matcher";
import { RelEntidadeTrabalhadorService } from "../../services/relEntidadeTrabalhador.service";
import { openErrorsDialog } from "../../utils";

export interface PopUpDesvincularTrabalhadorData {
  IdRel: number;
}

@Component({
  standalone: false,
  selector: 'app-pop-up-desvincular-trabalhador',
  templateUrl: 'pop-up-desvincular-trabalhador.component.html',
  styleUrls: ['./pop-up-desvincular-trabalhador.component.css']
})
export class PopUpDesvincularTrabalhadorComponent {
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public dtIniFimTrabalhador: Date | undefined;
  public submittedTry: boolean = false;
  public errors: string[] = [];
  constructor(
    public dialogRef: MatDialogRef<PopUpDesvincularTrabalhadorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PopUpDesvincularTrabalhadorData,
    private relEntidadeTrabalhadorService: RelEntidadeTrabalhadorService,
    private spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    public translate: TranslateService,
    ) {
    }


  public onNoClick(): void {
    this.dialogRef.close();
  }

  public submit() {
    this.submittedTry = true;
  }

  public onSaveClick(): void {
    if(this.dtIniFimTrabalhador)
    {
      this.showLoader();

      let request = {
        idRelEntidadeTrabalhador: this.data.IdRel,
        dataFimdeVinculo: this.dtIniFimTrabalhador
      }

      this.relEntidadeTrabalhadorService.desvincularTrabalhador(request).subscribe(x => {
        this.hideLoader();
        this.dialogRef.close(true);
      },
      err => {
        err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
    }
  }

  public showLoader()
  {
    this.spinner.show();
  }


  public hideLoader()
  {
    this.spinner.hide();
  }

  public showError()
  {
    const dialogRef = openErrorsDialog(this.errors, this.errorDialog);
    this.hideLoader();

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }
}
