import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MyErrorStateMatcher } from 'src/app/matcher';
import { DespesaRegistada } from 'src/app/models/despesaRegistada';
import { UpdateDespesaCabimentadaRequest } from 'src/app/request-models/componenteDespesaRegisto-request';
import { ComponenteDespesaRegistoService } from 'src/app/services/componenteDespesaRegisto.service';
import { DestinatarioService } from 'src/app/services/destinatario.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { customCurrencyMaskConfig, openErrorsDialog, openSnackBar, showExpiredError } from 'src/app/utils';

export interface PopUpEditDespesasCabimentadasData {
  despesaCabimentada: DespesaRegistada;
  tarefaActivoId: number;
  processoId: number;
}

@Component({
  selector: 'app-pop-up-edit-despesa-cabimentada',
  templateUrl: './pop-up-edit-despesa-cabimentada.component.html',
  styleUrls: ['./pop-up-edit-despesa-cabimentada.component.css']
})
export class PopUpEditDespesaCabimentadaComponent implements OnInit {

  public faTimesCircle = faTimesCircle;
  public errors: string[] = [];
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public submittedTry: boolean = false;
  public currencyOptions = customCurrencyMaskConfig;

  constructor(
    public warningDialog: MatDialog,
    public spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    private tokenStorage: TokenStorageService,
    public _snackBar: MatSnackBar,
    public translate: TranslateService,
    public destinatarioService: DestinatarioService,
    public dialogRef: MatDialogRef<PopUpEditDespesaCabimentadaComponent>,
    public componenteDespesaService: ComponenteDespesaRegistoService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: PopUpEditDespesasCabimentadasData
  ) {
  }

  ngOnInit(): void {
    if (!this.tokenStorage.getToken()) {
      this.router.navigate([''])
    }
    else if (!(this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired())) {

      showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
    }
  }

  public showLoader() {
    this.spinner.show();
  }


  public hideLoader() {
    this.spinner.hide();
  }

  public closePopUp(success: boolean = false): void {
    this.dialogRef.close(success);
  }

  public showError() {
    const dialogRef = openErrorsDialog(this.errors, this.errorDialog);
    this.hideLoader();

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }


  public editarDespesaCabimentada(){
    this.showLoader();
    this.submittedTry = true;

    if(this.data.despesaCabimentada.valorRegistado == 0){
      this.hideLoader();
      return;
    }

    let request = <UpdateDespesaCabimentadaRequest>{
      id: this.data.despesaCabimentada.id,
      valor: this.data.despesaCabimentada.valorRegistado
    };

    this.componenteDespesaService.UpdateDespesaCabimentada(request).subscribe(x => {
      openSnackBar(this.translate.instant('componenteDespesa.descricaoDespesaRegistada'), this._snackBar);

      this.closePopUp(true);
      this.hideLoader();

    },
      err => {

        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }
}
