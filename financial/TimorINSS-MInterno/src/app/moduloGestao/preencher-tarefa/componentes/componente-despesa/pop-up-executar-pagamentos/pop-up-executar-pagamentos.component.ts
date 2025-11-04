import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from "@ngx-translate/core";
import { MyErrorStateMatcher } from "src/app/matcher";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { blobExcelSaveAs, customCurrencyMaskConfig, JsPdf_centerText, openErrorsDialog, openSnackBar, RegexPatterns, showExpiredError } from "src/app/utils";
import { DespesaCabimentadasParaExecucao, DespesaRegistada } from "src/app/models/despesaRegistada";
import { Destinatario } from "src/app/models/destinatario";
import { PagamentoExecutado, PagamentoExecutadoDestinatario } from "src/app/models/pagamentos_executados";
import { GetDestinatarioRequest, SaveDestinatarioRequest } from "src/app/request-models/destinatario-request";
import { DestinatarioService } from "src/app/services/destinatario.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { PagamentoExecutadoService } from "src/app/services/pagamentoExecutado.service";
import { EditPagamentoExecutadoRequest, GetDestinatarioPagamentoRequest, GetPagamentoExecutadoRequest, SavePagamentoExecutadoRequest } from "src/app/request-models/pagamentoExecutado-request";
import { GetAllDespesaRegistadaRequest } from "src/app/request-models/componenteDespesaRegisto-request";
import { ComponenteDespesaRegistoService } from "src/app/services/componenteDespesaRegisto.service";
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { PopUpWarningComponent } from "src/app/componentes/pop-up-warning/pop-up-warning.component";
import { ComponenteDespesaConfig } from "src/app/models/componenteDespesaConfig";
import jsPDF from "jspdf";
import { environment } from "src/environments/environment";
import { CodigoConta } from "src/app/models/codigoConta";
import { GetComponenteOrcamentoRegistoAprovadoRequest } from "src/app/request-models/componenteOrcamentoRegisto-request";
import { componenteOrcamentoRegistoService } from "src/app/services/componenteOrcamentoRegisto.service";
import { Router } from "@angular/router";


export interface PopUpExecutarPagamentosData {
  listaDespesaAExecutar: DespesaCabimentadasParaExecucao[];
  naoExisteOrcamentoAprovado: boolean;
  numPagamento: string;
  listaPagamentosDestinatario: PagamentoExecutadoDestinatario[];
  tarefaActivoId: number;
  processoId: number;
  totalValorCabimentado: number;
  totalValorExecutado: number;
  totalValorFaltaExecutar: number;
  totalValorDestinatarioExecutado: number;
  componenteDespesaConfig: ComponenteDespesaConfig;
  despesaCabimentada: DespesaRegistada[];
}

@Component({
  standalone: false,
  selector: 'app-pop-up-executar-pagamentos',
  templateUrl: './pop-up-executar-pagamentos.component.html',
  styleUrls: ['./pop-up-executar-pagamentos.component.css']
})
export class PopUpExecutarPagamentosComponent implements OnInit {

  public importerId?: string;
  public selectedDests?: number;
  public totalAmount?: number;

  public ibanIsNacional: boolean = true;

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
  public pagamento = <PagamentoExecutado>{};
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
    public dialogRef: MatDialogRef<PopUpExecutarPagamentosComponent>,
    public pagamentoExecutadoService: PagamentoExecutadoService,
    public componenteDespesaService: ComponenteDespesaRegistoService,
    private orcamentoService: componenteOrcamentoRegistoService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: PopUpExecutarPagamentosData
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

  public submitPagamento() {
    this.submittedTry = true;
  }

  public associarDespesa() {
    if (!this.pagamento.compromissoFk) return;
    this.showLoader();


    let faltaExecutar = this.data.listaDespesaAExecutar.filter(u => u.id == this.pagamento.compromissoFk)[0].faltaExecutar;

    if ((!!this.importerId ? this.totalAmount! : this.pagamento.valorExecutado) > faltaExecutar) {

      this.hideLoader();
      this.errors.push(this.translate.instant('pagamentosExecutados.valorNaoSuperiorError'));
      this.showError();
    }
    else {

      this.pagamento.numeroPagamento = this.data.numPagamento;
      this.pagamento.processoId = this.data.processoId;
      this.pagamento.codigoContaCredito = this.contabilidade.id;
      this.pagamento.codigoContaDebito = this.contabilidadeDebito.id;
      this.pagamento.dataObrigacao = this.dataregisto;
      let request = <SavePagamentoExecutadoRequest>{
        destinatario: this.destinatario,
        pagamento: this.pagamento,
        importId: this.importerId,
      };

      this.pagamentoExecutadoService.SavePagamentoExecutado(request).subscribe(x => {
        this.destinatario = <Destinatario>{};
        this.pagamento = <PagamentoExecutado>{};
        this.submittedTry = false;
        this.importerId = undefined;
        this.selectedDests = undefined;
        this.totalAmount = undefined;
        this.getDespesaCabimentasdasParaExecucao();
        this.getDestinatariosPagamento();
        openSnackBar(this.translate.instant(`snackBar.${!!request.importId ? 'registoDestinatarios' : 'registoDestinatario'}`), this._snackBar);
        this.hideLoader();

      },
        err => {

          this.hideLoader();
          err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.showError();
        });
    }

  }

  public getDespesaCabimentasdasParaExecucao() {
    this.showLoader();
    let request = <GetAllDespesaRegistadaRequest>{
      tarefaAtivoId: this.data.tarefaActivoId
    }
    this.componenteDespesaService.GetAllDespesaCabimentadasParaExecucaoByTarefaAtivoId(request).subscribe(x => {
      this.data.listaDespesaAExecutar = x.despesasParaExecucao;

      this.data.totalValorExecutado = 0;
      this.data.totalValorCabimentado = 0;
      this.data.totalValorFaltaExecutar = 0;
      if (this.data.listaDespesaAExecutar != null && this.data.listaDespesaAExecutar.length > 0) {
        this.data.listaDespesaAExecutar.forEach(element => {
          this.data.totalValorExecutado = Math.round((this.data.totalValorExecutado + element.valorExecutado) * 100) / 100;
          this.data.totalValorCabimentado = Math.round((this.data.totalValorCabimentado + element.valorCabimentado) * 100) / 100;
          this.data.totalValorFaltaExecutar = Math.round((this.data.totalValorFaltaExecutar + element.faltaExecutar) * 100) / 100;
        });
      }
      this.hideLoader();

    },
      err => {
        this.existeDestinatarioBD = false;
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public getDestinatariosPagamento() {
    this.showLoader();
    let request = <GetDestinatarioPagamentoRequest>{
      numPagamento: this.data.numPagamento
    }
    this.pagamentoExecutadoService.GetDestinatariosPagamentoByNumPagamento(request).subscribe(x => {
      this.data.listaPagamentosDestinatario = x.destinatarioPagamentosExecutados;

      this.data.totalValorDestinatarioExecutado = 0;
      if (this.data.listaPagamentosDestinatario != null && this.data.listaPagamentosDestinatario.length > 0) {
        this.data.listaPagamentosDestinatario.forEach(element => {
          this.data.totalValorDestinatarioExecutado = Math.round((this.data.totalValorDestinatarioExecutado + element.valorExecutado) * 100) / 100;
        });
      }
      this.hideLoader();

    },
      err => {
        this.existeDestinatarioBD = false;
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public editarDestinatario(element: PagamentoExecutadoDestinatario) {
    this.importerId = undefined;
    this.selectedDests = undefined;
    this.totalAmount = undefined;

    this.destinatario = element.destinatario;
    this.pagamento.id = element.id;
    this.pagamento.numeroPagamento = element.numeroPagamento;
    this.pagamento.valorExecutado = element.valorExecutado;
    this.pagamento.estado = element.estado;
    if (element.iban)
      this.isIban = true;
    else
      this.isIban = false;
    this.pagamento.numeroConta = element.numeroConta;
    this.pagamento.iban = element.iban;
    this.pagamento.swift = element.swift;
    this.pagamento.processoId = element.processoId;
    this.pagamento.destinatarioFk = element.destinatario.id;
    this.pagamento.compromissoFk = element.compromissoFk;
    this.contabilidade.id = element.codigoContaCredito ?? <number>{};
    this.contabilidadeDebito.id = element.codigoContaDebito ?? <number>{};
    this.dataregisto = element.dataObrigacao ?? <Date>{};
    this.ibanIsNacional = new RegExp(this.availableRegex.IBANPattern).test(this.pagamento.iban || '');
    document.getElementById("telaDestinatario")?.scrollIntoView({ behavior: "smooth" });
    this.updateContabilidadeDebito(element.codigoContaCredito ?? <number>{});
    this.updateContabilidadeCredito(element.codigoContaDebito ?? <number>{});
  }

  public deleteComponente(element: PagamentoExecutadoDestinatario) {
    const dialogRef = this.warningDialog.open(PopUpWarningComponent, {
      id: 'deletePagamento',
      minHeight: '300px',
      width: '40%',
      height: '30%',
      panelClass: 'warningModal',
      data: { function: this.pagamentoExecutadoService.DeletePagamento({ id: element.id }), msg: this.translate.instant('warnings.deletePagamento') }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getDestinatariosPagamento();
        this.getDespesaCabimentasdasParaExecucao();
        openSnackBar(this.translate.instant('snackBar.removePagamento'), this._snackBar);
      }
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

  public emitirOrdemPagamento() {
    var listaIdPagamento: number[] = [];
    this.data.listaPagamentosDestinatario.forEach(element => {
      listaIdPagamento.push(element.id);
    });
    this.showLoader();
    let request = <EditPagamentoExecutadoRequest>{
      listaIdPagamento: listaIdPagamento
    };

    this.pagamentoExecutadoService.EditPagamentoExecutado(request).subscribe(x => {
      openSnackBar(this.translate.instant('snackBar.emitirOrdemPagamento'), this._snackBar);

      this.gerarPDF(this.data.listaPagamentosDestinatario);
      this.closePopUp();
      this.hideLoader();

    },
      err => {

        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public closePopUp(): void {
    this.dialogRef.close(true);
  }

  public onImporterComplete({ id, data }: any) {
    const selected = data.Success + (data.Existing || 0);
    if (!selected) return;

    this.importerId = id;
    this.selectedDests = selected;
    this.totalAmount = data.TotalAmount;

    this.destinatario = <Destinatario>{};
    this.pagamento = <PagamentoExecutado>{};

  }

  public removeSelectedImported() {
    this.importerId = undefined;
    this.selectedDests = undefined;
    this.totalAmount = undefined;
  }

  public gerarPDF(element: PagamentoExecutadoDestinatario[]): void {

    var pdf = new jsPDF();
    // INSS logo
    pdf.addImage(environment.ssIcon, 'JPEG', 90, 5, 25, 20);


    //title
    JsPdf_centerText(pdf, this.translate.instant('general.ordemPagamento'), 35);
    // pdf.text('Ordem de Pagamento', 83, 35);
    pdf.setFontSize(12);
    pdf.setTextColor(99);

    //Número do Documento
    JsPdf_centerText(pdf, this.translate.instant('pagamentosExecutados.numeroOrdemPagamento') + ': ' + element[0].numeroPagamento, 45);
    // pdf.text('Número de OP: ' + element.numeroPagamento, 75, 45);

    //datas
    // pdf.text('Data de Emissão: ' + this.formatDatePT(new Date), 20, 55);
    // pdf.text('Data Limite de Pagamento: ' + this.formatDatePT(this.dataLimitePagamento), 120, 55);

    var rows: string[][] = [];
    element.forEach(row => {
      var temp = [this.data.despesaCabimentada.filter(e => e.compromissos.includes(row.compromissoFk))[0].codigoOrcamento
        + '-' + this.data.despesaCabimentada.filter(e => e.compromissos.includes(row.compromissoFk))[0].descricaoOrcamento,
      row.destinatario.nome, row.destinatario.niss + '/' + row.destinatario.tin,
      row.iban ?? row.numeroConta ?? '', '$' + row.valorExecutado];

      rows.push(temp);

    });


      (pdf as any).autoTable({
        startY: 55,
        columnStyles: { europe: { halign: 'center' } },
        head: [[this.translate.instant('pagamentosExecutados.contaOGE'), this.translate.instant('pagamentosExecutados.destinatario'), "NISS/TIN", `${this.translate.instant('pagamentosExecutados.iban')}/${this.translate.instant('general.NConta')}`, this.translate.instant('general.valor')]],
        body: rows,
        theme: 'grid',
        headStyles: {
          fillColor: [42, 129, 204],
          textColor: [0, 0, 0],
          fontSize: 8,
          padding: 0,
          valign: 'middle',
          halign: 'center',
        },

        bodyStyles: {
          textColor: [0, 0, 0],
          fontSize: 10,
          padding: 0,
          valign: 'middle',
          halign: 'center',
        }
      })

    const img = new Image();

    img.onload = function(){
      const widthCap = 70;
      const height = img.height;
      const width = img.width;

      const { width: pdfWidth, height: pdfHeight } = pdf.internal.pageSize;

      const resolvedHeight = height * widthCap / width;

      // Stamp and Signature
      pdf.addImage(environment.stampImage, 'JPEG', pdfWidth / 2 - widthCap / 2, pdfHeight - resolvedHeight - 30, widthCap, resolvedHeight);

      // Open PDF document in browser's new tab
      window.open(URL.createObjectURL(pdf.output("blob")));
    }

    img.src = environment.stampImage;

    //pdf.output('dataurlnewwindow');

    // Download PDF doc
    //pdf.save('GuiaPagamento.pdf');
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

  // public changeIban(): void {
  //   if (this.isIban)
  //     this.pagamento.numeroConta = undefined;
  //   else {
  //     this.pagamento.iban = undefined;
  //     this.pagamento.swift = undefined;
  //   }
  // }
}
