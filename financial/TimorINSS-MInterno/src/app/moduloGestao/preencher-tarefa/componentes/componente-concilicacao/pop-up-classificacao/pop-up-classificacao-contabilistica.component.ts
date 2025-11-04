import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from "@ngx-translate/core";
import { MyErrorStateMatcher } from "src/app/matcher";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { blobExcelSaveAs, customCurrencyMaskConfig, openErrorsDialog, openSnackBar, RegexPatterns, showExpiredError } from "src/app/utils";
import { Destinatario } from "src/app/models/destinatario";
import { ClassificacaoContabilisticaExecucao, PagamentoExecutadoDestinatario } from "src/app/models/pagamentos_executados";
import { GetDestinatarioRequest, SaveDestinatarioRequest } from "src/app/request-models/destinatario-request";
import { DestinatarioService } from "src/app/services/destinatario.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { PagamentoExecutadoService } from "src/app/services/pagamentoExecutado.service";
import { GetPagamentoExecutadoRequest, SaveClassificacaoContabilisticaExecucaoRequest } from "src/app/request-models/pagamentoExecutado-request";
import { ComponenteDespesaRegistoService } from "src/app/services/componenteDespesaRegisto.service";
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { CodigoConta } from "src/app/models/codigoConta";
import { GetComponenteOrcamentoRegistoAprovadoRequest } from "src/app/request-models/componenteOrcamentoRegisto-request";
import { componenteOrcamentoRegistoService } from "src/app/services/componenteOrcamentoRegisto.service";
import { Router } from "@angular/router";




export interface PopUpClassificacaoContabilisticaData {
  listaDespesaAExecutar: number[];
  tarefaActivoId: number;
}

@Component({
  standalone: false,
  selector: 'app-pop-up-classificacao-contabilistica',
  templateUrl: './pop-up-classificacao-contabilistica.component.html',
  styleUrls: ['./pop-up-classificacao-contabilistica.component.css']
})
export class PopUpClassificacaoContabilisticaComponent implements OnInit {
  public faTimesCircle = faTimesCircle;
  public errors: string[] = [];
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public submittedTry: boolean = false;
  public currencyOptions = customCurrencyMaskConfig;
  public faFileExcel = faFileExcel;
  public availableRegex = RegexPatterns;
  public isIban = true;
  public dataregisto: Date = new Date();

  public destinatario = <Destinatario>{};
  public classificacao = <ClassificacaoContabilisticaExecucao>{};
  public listaPagamentosExecutadosDestinatario: PagamentoExecutadoDestinatario[] = [];
  public totalPagamentoDestinatario: number = 0;


  public displayedColumnsDespesasAExecutar: string[] = ['descricao', 'valor', 'valorExecutado', 'faltaExecutar'];
  public displayedColumnsDestinatarios: string[] = ['destinatario', 'valorExecutado', 'accoes', 'exportToExcel'];
  public displayedColumnsExcel: string[] = ['destinatario', 'tin', 'niss', 'numPagamento', 'estado', 'descricaoDespesa', 'valorExecutado'];
  public existeDestinatarioBD: boolean = true;

  //Contabilidade
  public contabilidade = <CodigoConta>{};
  public contabilidadeDebito = <CodigoConta>{};
  public contabilidadeListagem: CodigoConta[] = [];
  public filtersContabilidade: number[] = [];
  public filtersContabilidadeFilteredCredito: CodigoConta[] = [];
  public filtersContabilidadeFilteredDebito: CodigoConta[] = [];

  constructor(
    public warningDialog: MatDialog,
    public spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    private tokenStorage: TokenStorageService,
    public _snackBar: MatSnackBar,
    public translate: TranslateService,
    public destinatarioService: DestinatarioService,
    public dialogRef: MatDialogRef<PopUpClassificacaoContabilisticaComponent>,
    public pagamentoExecutadoService: PagamentoExecutadoService,
    public componenteDespesaService: ComponenteDespesaRegistoService,
    private orcamentoService: componenteOrcamentoRegistoService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: PopUpClassificacaoContabilisticaData
  ) {
  }

  ngOnInit(): void {

    if (!this.tokenStorage.getToken()) {
      this.router.navigate([''])
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired()) {

      //obter configuração codigos
      this.getOrcamentoAprovado(this.data.tarefaActivoId);
    }
    else {
      showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
    }

  }

  public novoDestinatario() {
    this.showLoader();
    let request = <SaveDestinatarioRequest>{
      destinatario: this.destinatario
    };

    this.destinatarioService.SaveDestinatario(request).subscribe(x => {
      openSnackBar(this.translate.instant('snackBar.registoDestinatario'), this._snackBar);
      this.hideLoader();

    },
      err => {

        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public pesquisarDestinatario() {
    this.showLoader();
    let request = <GetDestinatarioRequest>{
      niss: this.destinatario.niss,
      tin: this.destinatario.tin,
      nome: this.destinatario.nome
    };

    this.destinatarioService.GetDestinatarioByNissTin(request).subscribe(x => {
      this.destinatario = x.destinatario;
      this.existeDestinatarioBD = true;
      this.hideLoader();

    },
      err => {
        this.existeDestinatarioBD = false;
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public associarDespesa() {
    this.submittedTry = true;
    this.showLoader();

    this.classificacao.codigoContaCredito = this.contabilidade.id;
    this.classificacao.codigoContaDebito = this.contabilidadeDebito.id;
    this.classificacao.dataExecucao = this.dataregisto;

    let request = <SaveClassificacaoContabilisticaExecucaoRequest>{
      despesasIds: this.data.listaDespesaAExecutar,
      tarefaAtivoId: this.data.tarefaActivoId,
      classificacao: this.classificacao,

    };

    this.pagamentoExecutadoService.SaveClassificacaoExecucao(request).subscribe(x => {
      this.submittedTry = false;
      this.hideLoader();
      this.closePopUp(true);
    },
      err => {

        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }

  public getPagamentosDestinatario(pagamentosDestinatario: PagamentoExecutadoDestinatario) {
    this.showLoader();
    let request = <GetPagamentoExecutadoRequest>{
      idDestinatario: pagamentosDestinatario.destinatario.id
    }
    this.pagamentoExecutadoService.GetPagamentosExecutadosByIdDestinatario(request).subscribe(x => {

      this.hideLoader();
      blobExcelSaveAs(x.excelExtraido, this.translate.instant('pagamentosExecutados.pagamentosExecutados').replace(' ', '_') + '_' + x.destinatarioPagamentosExecutados[0].destinatario.nome);

    },
      err => {
        this.existeDestinatarioBD = false;
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public closePopUp(success: boolean = false): void {
    this.dialogRef.close(success);
  }

  public showLoader() {
    this.spinner.show();
  }


  public hideLoader() {
    this.spinner.hide();
  }


  public showError() {
    const dialogRef = openErrorsDialog(this.errors, this.errorDialog);
    this.hideLoader();

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }

  public scroll(e: any) {
    e._body.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  public keyPressNumbers(event: any) {
    var charCode = (event.which) ? event.which : event.keyCode;
    // Only Numbers 0-9
    if ((charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

  public getOrcamentoAprovado(idTarefaActivo: number) {
    this.showLoader();
    let request = <GetComponenteOrcamentoRegistoAprovadoRequest>{
        idTarefaActivo: idTarefaActivo,
    };
    this.orcamentoService.GetOrcamentoAprovadoReceitaByIdTarefaActivo(request).subscribe(x => {
        if (x != null && x.existeOrcamentoAprovado) {
            this.contabilidadeListagem = x.codigoConta;
            this.filtersContabilidadeFilteredCredito = x.codigoConta;
            this.filtersContabilidadeFilteredDebito = x.codigoConta;
        }
        this.hideLoader();

    },
        err => {

            this.hideLoader();
            err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
            this.showError();
        });

  }
  public filterCustomOptionsContabilidadeCredito(event: any) {
    this.filtersContabilidadeFilteredCredito = this.contabilidadeListagem.filter(p => p.designacao.toLowerCase().startsWith(event.toLowerCase()));
  }

  public filterCustomOptionsContabilidadeDebito(event: any) {
      this.filtersContabilidadeFilteredDebito = this.contabilidadeListagem.filter(p => p.designacao.toLowerCase().startsWith(event.toLowerCase()));
  }

  public updateContabilidadeDebito(contabilidadeId: number){
    this.filtersContabilidadeFilteredDebito = this.contabilidadeListagem.filter(p => p.id != contabilidadeId);
  }

  public updateContabilidadeCredito(contabilidadeId: number){
      this.filtersContabilidadeFilteredCredito = this.contabilidadeListagem.filter(p => p.id != contabilidadeId);
  }
}
