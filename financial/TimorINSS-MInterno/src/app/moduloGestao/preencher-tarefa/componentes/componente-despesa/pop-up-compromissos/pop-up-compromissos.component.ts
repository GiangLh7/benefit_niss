import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MyErrorStateMatcher } from 'src/app/matcher';
import { Compromisso } from 'src/app/models/compromisso';
import { DespesaCabimentadasParaExecucao } from 'src/app/models/despesaRegistada';
import { CompromissoUpsertRequest } from 'src/app/request-models/componenteDespesaRegisto-request';
import { ComponenteDespesaRegistoService } from 'src/app/services/componenteDespesaRegisto.service';
import { componenteOrcamentoRegistoService } from 'src/app/services/componenteOrcamentoRegisto.service';
import { DestinatarioService } from 'src/app/services/destinatario.service';
import { PagamentoExecutadoService } from 'src/app/services/pagamentoExecutado.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { customCurrencyMaskConfig, openErrorsDialog, openSnackBar, showExpiredError } from 'src/app/utils';
import { PopUpExecutarPagamentosComponent } from '../pop-up-executar-pagamentos/pop-up-executar-pagamentos.component';

export interface PopUpCompromissosData {
  listaDespesaAExecutar: DespesaCabimentadasParaExecucao[];
  naoExisteOrcamentoAprovado: boolean;
  tarefaActivoId: number;
  processoId: number;
  compromisso: Compromisso;
}

@Component({
  selector: 'app-pop-up-compromissos',
  templateUrl: './pop-up-compromissos.component.html',
  styleUrls: ['./pop-up-compromissos.component.css']
})
export class PopUpCompromissosComponent implements OnInit {

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
    public dialogRef: MatDialogRef<PopUpCompromissosComponent>,
    public pagamentoExecutadoService: PagamentoExecutadoService,
    public componenteDespesaService: ComponenteDespesaRegistoService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: PopUpCompromissosData
  ) {
  }

  ngOnInit(): void {
    if (!this.tokenStorage.getToken()) {
      this.router.navigate([''])
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired()) {

      if (!this.data.compromisso){
        this.data.compromisso = <Compromisso>{valorCompromisso: 0, dataCompromisso: new Date};
      }
    }
    else {
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

  public registarCompromisso(){
    this.showLoader();
    this.submittedTry = true;

    if(this.data.compromisso.valorCompromisso == 0 || !this.data.compromisso.despesaRegistadaFk || !this.data.compromisso.nomeCompromisso){
      this.hideLoader();
      return;
    }

    let request = <CompromissoUpsertRequest>{
      compromisso: this.data.compromisso,
      tarefaAtivoId: this.data.tarefaActivoId
    };

    this.componenteDespesaService.upsertCompromisso(request).subscribe(x => {
      openSnackBar(this.translate.instant('snackBar.registoCompromisso'), this._snackBar);

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
