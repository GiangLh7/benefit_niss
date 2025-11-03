import { ComponenteOrcamentoValorFull } from './../../../../../models/componenteOrcamentoValor';
import { Component, Inject, OnInit } from '@angular/core';
import { customCurrencyMaskConfig, openErrorsDialog } from 'src/app/utils';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MyErrorStateMatcher } from 'src/app/matcher';
import { NgxSpinnerService } from 'ngx-spinner';
import { componenteOrcamentoValorService } from 'src/app/services/componenteOrcamentoValor.service';

export interface PopUpEditarComponenteOrcamentoValorData {
  componenteOrcamentoValor: ComponenteOrcamentoValorFull;
}

@Component({
  selector: 'app-pop-up-editar-componente-orcamento-valor',
  templateUrl: './pop-up-editar-componente-orcamento-valor.component.html',
  styleUrls: ['./pop-up-editar-componente-orcamento-valor.component.css']
})

export class PopUpEditarComponenteOrcamentoValorComponent {

  public currencyOptions = customCurrencyMaskConfig;
  public orcamentoValorSubmitted: boolean = false;
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public errors: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<PopUpEditarComponenteOrcamentoValorComponent>,
    private orcamentoValorService: componenteOrcamentoValorService,
    @Inject(MAT_DIALOG_DATA) public data: PopUpEditarComponenteOrcamentoValorData,
    private spinner: NgxSpinnerService,
    public errorDialog: MatDialog) { }

  public submit(){
    this.orcamentoValorSubmitted = true;
  }

  public onNoClick(): void {
    this.dialogRef.close();
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

  public edit(): void {
    if(this.data.componenteOrcamentoValor.valor > 0)
    {
      this.showLoader();

      let request = {
        componenteOrcamentoValor: this.data.componenteOrcamentoValor
      }

      this.orcamentoValorService.editarOrcamentoValor(request).subscribe(x => {
        this.hideLoader();
        this.dialogRef.close(true);
      },
      err => {
        err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
    }
  }
}
