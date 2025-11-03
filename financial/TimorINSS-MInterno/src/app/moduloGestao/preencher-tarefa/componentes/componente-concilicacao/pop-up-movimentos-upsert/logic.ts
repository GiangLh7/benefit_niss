import { Component, Inject } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
// import { TokenStorageService } from '../../services/token-storage.service';
import { MyErrorStateMatcher, MyNumberDifferentStateMatcher } from "src/app/matcher";
import { TranslateService } from "@ngx-translate/core";
import { openErrorsDialog, focusCurrency, customCurrencyMaskConfig, customPositiveCurrencyMaskConfig, customNegativeCurrencyMaskConfig } from "src/app/utils";
import { MovimentosUpsertDataRequest, MovimentosUpsertRequest } from "src/app/request-models/movimentosBancarios-request";
import { movimentosBancariosService } from "src/app/services/movimentosBancarios.service";



@Component({
  selector: 'app-pop-up-movimentos-upsert',
  templateUrl: './index.html',
  styleUrls: ['./styles.css']
})
export class PopUpMovimentosUpsertComponent {

  public faTimesCircle = faTimesCircle;
  public errors: string[] = [];
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public diffNumberMatcher: MyNumberDifferentStateMatcher = new MyNumberDifferentStateMatcher(0);
  public submittedTry: boolean = false;
  public submitMore: boolean = false;
  public hasSubmitted: boolean = false;
  public currencyOptions = customPositiveCurrencyMaskConfig;
  public now = new Date();
  public isDebit = false;
  public importerVisible = false;

  constructor(
    public movimentosBancariosService: movimentosBancariosService,
    public spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    // private tokenStorage: TokenStorageService,
    public translate: TranslateService,
    public dialogRef: MatDialogRef<PopUpMovimentosUpsertComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MovimentosUpsertDataRequest
  ) {
    this.data = {
      ...{
        descricao: "",
        valor: 0
      }, ...(this.data || {})
    };

    if(this.data.valor < 0) {
      this.isDebit = true;
      this.currencyOptions = customNegativeCurrencyMaskConfig;
    }

    this.dialogRef.disableClose = true;
    this.dialogRef.backdropClick().subscribe(() => {
      this.dialogRef.close(this.hasSubmitted);
    });
    this.dialogRef.keydownEvents().subscribe(event => {
      if (event.key === "Escape") {
        this.dialogRef.close(this.hasSubmitted);
      }
    });
    setTimeout(() => {
      this.importerVisible = true;
    }, 100);
  }

  public closePopUp(): void {
    this.dialogRef.close(this.hasSubmitted);
  }

  public saveMovimento() {

    if (!this.data.tarefaAtivoId) {
      this.errors.push('-1');
      this.showError();
      return;
    }

    let request: MovimentosUpsertRequest = {
      data: { ...this.data }
    }

    if (this.data.id) {
      request.data.bancoId = undefined;
      request.data.caixaId = undefined;
    }

    if (this.isDebit)
      request.data.valor = -Math.abs(request.data.valor);
    else
      request.data.valor = Math.abs(request.data.valor);

    const apiCall = this.data.id ? this.movimentosBancariosService.updateMovimentoBancario(request) : this.movimentosBancariosService.saveMovimentoBancario(request);

    apiCall.subscribe(x => {

      if (this.submitMore) {
        this.submittedTry = false;
        this.diffNumberMatcher = new MyNumberDifferentStateMatcher(0);
        this.data = {
          ...this.data, ...{
            descricao: "",
            valor: 0,
            data: undefined
          }
        };
        this.hasSubmitted = true;
      }
      else this.dialogRef.close(true);
      this.hideLoader();
    },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }


  public submitMovimento(submitMore: boolean) {
    this.submittedTry = true;
    this.submitMore = submitMore;
    this.diffNumberMatcher = new MyNumberDifferentStateMatcher(0, true);
  }

  public changeMask(isDebit: boolean): void {
    if (isDebit){
      this.currencyOptions = customNegativeCurrencyMaskConfig;
    }
    else {
      this.currencyOptions = customPositiveCurrencyMaskConfig;
    }

  }

  public showLoader() {
    this.spinner.show();
  }


  public hideLoader() {
    this.spinner.hide();
  }

  public clearValor() {
    this.data.valor = <number>{};
  }

  public focusCurrency(event: any) {
    focusCurrency(event);
  }

  public onImporterComplete(data: any) {
    this.dialogRef.close(true);
  }


  public showError() {
    const dialogRef = openErrorsDialog(this.errors, this.errorDialog);
    this.hideLoader();

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }

}
