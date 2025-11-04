import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { TokenStorageService } from '../../services/token-storage.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ContaCorrenteListagem, ResumoContaListagem } from "../../response-models/contaCorrente-response";
import { DatePipe, getLocaleDateTimeFormat } from "@angular/common";
import { formatDate, formatDatePT, openSnackBar, formatDecimal, openErrorsDialog } from "../../utils";
import { FilterRequest } from "../../request-models/utils-request";
import { ContaCorrenteListagemRequest, ResumoContaCorrenteListagemRequest } from "../../request-models/contaCorrente-request";
import { ContaCorrenteService } from "../../services/contaCorrente.service";
import { MatDialog } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { environment } from "src/environments/environment";
import { PopUpWarningComponent } from "../../componentes/pop-up-warning/pop-up-warning.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { GuiaPagamentoService } from "../../services/guiaPagamento.service";
import { GuiaPagamento } from "../../request-models/guiaPagamento-request";
import moment from "moment";
import { DecimalPipe } from '@angular/common';
import { ReservaCreditoListagem } from "../../response-models/reservaCredito-response";
import { ReservaCreditoListagemRequest } from "../../request-models/reservaCredito-request";
import { ReservaCreditoService } from "../../services/reservaCredito.service";


@Component({
  standalone: false,
  selector: 'contaCorrente',
  templateUrl: 'conta_corrente.component.html',
  styleUrls: ['./conta_corrente.component.css']
})
export class ContaCorrenteComponent {
  public date?: Date;
  public filterBy = '';
  public errors: string[] = [];
  public errorMessage = "";

  public totaisResumoContaCorrente: any = {};

  //Region Conta Corrente table
  public dataSourceContaCorrente: ContaCorrenteListagem[] = [];
  public displayedColumnsContaCorrente: string[] = ['select', 'tipoDivida', 'mesAno', 'dataVencimento', 'valorEntidade', 'valorTrabalhador', 'totalJuros', 'valorTotal', 'situacaoPagamento', 'valorPago', 'pagoEm', 'totalDivida'];
  public selected: number = 0;
  public totalRowsContaCorrenteTable: number = 0;
  public pageSizeContaCorrenteTable = 20;
  public pageIndexContaCorrenteTable = 0;


  //Region Resumo Conta Corrente
  public dataSourceResumoConta: ResumoContaListagem[] = [];
  public displayedColumnsResumoConta: string[] = ['ano', 'somatorioContribuicoes', 'somatorioQuotizacoes', 'totalPagar', 'totalJuros', 'totalPago', 'totalDivida'];

  // Region Reserva Crédito
  public dataSourceReservaCredito: ReservaCreditoListagem[] = [];
  public displayedColumnsReservaCredito: string[] = ['reservaCredito', 'reservaCreditoAtivo'];

  public isLoggedIn = false;
  public isLoginFailed = false;
  public entidadeId: number = 0;

  //Region PDF
  public dataSourceGuiaPagamento: ContaCorrenteListagem[] = [];
  public enabledGerarGuia: boolean = false;
  public rows: any[][] = [];
  public total: number = 0;
  public dataLimitePagamento: Date = new Date();
  public numDocumento: string = '';
  public niss: string = '';
  public idContaCorrente: number = 0;
  public isGerarPDF: boolean = false;


  constructor(
    private tokenStorage: TokenStorageService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private datepipe: DatePipe,
    public errorDialog: MatDialog,
    public translate: TranslateService,
    private contaCorrenteService: ContaCorrenteService,
    private reservaCreditoService: ReservaCreditoService,
    public gerarGuiaDialog: MatDialog,
    public guiaPagamentoService: GuiaPagamentoService,
    public _snackBar: MatSnackBar,
    public decimalPipe: DecimalPipe
  ) {
  }

  ngOnInit(): void {
    if (!this.tokenStorage.getToken()) {
      this.router.navigate([''],);
    }
    else if (this.tokenStorage.getToken() && this.tokenStorage.tokenExpired()) {
      this.translate.get('error.expired').subscribe((translated: string) => {
        const dialogRef = this.errorDialog.open(PopUpWarningComponent, {
          id: 'desvinclarDialog',
          minHeight: '300px',
          width: '40%',
          height: '30%',
          panelClass: 'warningModal',
          data: { msg: translated, noConfirmation: true }
        });
        dialogRef.afterClosed().subscribe(() => {
          this.tokenStorage.signOut();
          window.location.reload();
        });
      });
    }
    else {
      this.showLoader();
      if (this.tokenStorage.getToken()) {
        this.isLoggedIn = true;
        let idEntidade = this.tokenStorage.getUser()?.idEntidade;

        if (idEntidade != null) {
          this.entidadeId = idEntidade;
          this.getTableContaCorrente();
          this.getTableResumoContaCorrente();
          this.getTableReservaCredito();
        }
      }
    }
  }


  public getTableContaCorrente() {
    this.showLoader();
    this.enabledGerarGuia = false;
    this.dataSourceGuiaPagamento = [];
    this.dataSourceResumoConta = [];
    this.selected = 0;
    this.dataSourceContaCorrente = [];
    let filter: FilterRequest;
    filter = {};
    filter.index = this.pageIndexContaCorrenteTable;
    filter.rows = this.pageSizeContaCorrenteTable;

    if (this.date != null) {
      filter.dateFilterBegin = this.date;
      filter.dateFilterEnd = new Date(moment(this.date).year(), moment(this.date).month() + 1, 0);
    }
    filter.filterBy = this.filterBy;

    let request: ContaCorrenteListagemRequest;

    request = { "idEntidade": this.entidadeId, "filter": filter };

    this.contaCorrenteService.getContaCorrenteByIdEntidade(request).subscribe(x => {
      x.rows == null ? this.totalRowsContaCorrenteTable = 0 : this.totalRowsContaCorrenteTable = x.rows;
      x.contaCorrente == null ? this.dataSourceContaCorrente = [] : this.dataSourceContaCorrente = x.contaCorrente;

      if (this.dataSourceContaCorrente.length > 0) {
        // this.preencherResumoConta();

        if (this.isGerarPDF) {
          const itm = this.dataSourceContaCorrente.filter((c: { idContaCorrente: number; }) => c.idContaCorrente === this.idContaCorrente)[0];
          this.numDocumento = itm.numDocumento;
          this.niss = itm.niss;
          this.gerarPDF();
          this.dataSourceGuiaPagamento = [];
          this.rows = [];
        }
      }
      this.hideLoader();
    },
      err => {
        this.dataSourceContaCorrente = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public getTableResumoContaCorrente() {
    this.dataSourceResumoConta = [];

    let request: ResumoContaCorrenteListagemRequest;

    request = { "idEntidade": this.entidadeId };

    this.contaCorrenteService.getResumoContaCorrenteByIdEntidade(request).subscribe(x => {
      this.totaisResumoContaCorrente = {
        somatorioContribuicoes: 0,
        somatorioQuotizacoes: 0,
        totalPagar: 0,
        totalJuros: 0,
        totalPago: 0,
        totalDivida: 0,
      };

      const resolvedData = x.data.map(e => {

        this.totaisResumoContaCorrente.somatorioContribuicoes += e.contribuicoes;
        this.totaisResumoContaCorrente.somatorioQuotizacoes += e.quotizacoes;
        this.totaisResumoContaCorrente.totalPagar += e.valorAPagar;
        this.totaisResumoContaCorrente.totalJuros += e.totalJuros;
        this.totaisResumoContaCorrente.totalPago += e.totalPago;
        this.totaisResumoContaCorrente.totalDivida += e.valorAPagar - e.totalPago;

        return {
          ano: e.ano,
          somatorioContribuicoes: formatDecimal(this.decimalPipe, e.contribuicoes),
          somatorioQuotizacoes: formatDecimal(this.decimalPipe, e.quotizacoes),
          totalPagar: formatDecimal(this.decimalPipe, e.valorAPagar),
          totalJuros: formatDecimal(this.decimalPipe, e.totalJuros),
          totalPago: formatDecimal(this.decimalPipe, e.totalPago),
          totalDivida: formatDecimal(this.decimalPipe, e.valorAPagar - e.totalPago),
        }
      });

      this.totaisResumoContaCorrente.somatorioContribuicoes = formatDecimal(this.decimalPipe, this.totaisResumoContaCorrente.somatorioContribuicoes);
      this.totaisResumoContaCorrente.somatorioQuotizacoes = formatDecimal(this.decimalPipe, this.totaisResumoContaCorrente.somatorioQuotizacoes);
      this.totaisResumoContaCorrente.totalPagar = formatDecimal(this.decimalPipe, this.totaisResumoContaCorrente.totalPagar);
      this.totaisResumoContaCorrente.totalJuros = formatDecimal(this.decimalPipe, this.totaisResumoContaCorrente.totalJuros);
      this.totaisResumoContaCorrente.totalPago = formatDecimal(this.decimalPipe, this.totaisResumoContaCorrente.totalPago);
      this.totaisResumoContaCorrente.totalDivida = formatDecimal(this.decimalPipe, this.totaisResumoContaCorrente.totalDivida);
      // var resumoConta: ResumoContaListagem = {
      //   ano: ano,
      //   somatorioContribuicoes: formatDecimal(this.decimalPipe, somatorioContribuicoes),
      //   somatorioQuotizacoes: formatDecimal(this.decimalPipe, somatorioQuotizacoes),
      //   totalPagar: formatDecimal(this.decimalPipe, totalPagar),
      //   totalJuros: formatDecimal(this.decimalPipe, totalJuros),
      //   totalPago: formatDecimal(this.decimalPipe, totalPago),
      //   totalDivida: formatDecimal(this.decimalPipe, totalPagar - totalPago)
      // };
      this.dataSourceResumoConta = resolvedData;
    },
      err => {
        this.dataSourceContaCorrente = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }


  public getTableReservaCredito() {

    this.dataSourceReservaCredito = [];
    this.selected = 0;
    let filter: FilterRequest;
    filter = {};

    let request: ReservaCreditoListagemRequest;

    request = { "idEntidade": this.entidadeId, "filter": filter };

    this.reservaCreditoService.getReservaCreditoByIdEntidade(request).subscribe(x => {
      x.reservaCredito == null ? this.dataSourceReservaCredito = [] : this.dataSourceReservaCredito = x.reservaCredito;

    },
      err => {
        this.dataSourceReservaCredito = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public dateUpdated() {
    this.filterBy = '';
    this.isGerarPDF = false;
    this.getTableContaCorrente();
    this.getTableResumoContaCorrente();
  }

  public updateSelect(event: any, element: ContaCorrenteListagem, id: number) {
    if (this.selected === id) {
      this.dataSourceGuiaPagamento = [];
      this.selected = 0;
    }
    else {
      this.selected = id;
      this.dataSourceGuiaPagamento = [element];
    }
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

  public formatDate(date: Date): string {
    return formatDate(this.datepipe, date);
  }


  public formatDatePT(date: Date): string {
    return formatDatePT(this.datepipe, date);
  }

  public gerarGuiaPagamento() {
    const dialogRef = this.gerarGuiaDialog.open(PopUpWarningComponent, {
      id: 'gerarGuiaPag',
      minHeight: '300px',
      width: '40%',
      height: '35%',
      panelClass: 'warningModal',
      data: { msg: this.translate.instant('warnings.gerarGuia') }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.gerarDadosGuia();
      }
    });
  }

  public gerarDadosGuia() {
    this.showLoader();

    //descricao do Guia
    var descricao = '';
    var juros = 0;
    var valorTotalsemJuros = 0;
    var valorPago = 0;

    if (this.dataSourceGuiaPagamento[0].valorPago != null) {
      valorPago = this.dataSourceGuiaPagamento[0].valorPago;
    }
    this.total = this.dataSourceGuiaPagamento[0].valorTotal - valorPago;
    this.dataLimitePagamento = this.dataSourceGuiaPagamento[0].dataVencimento;

    var temp = [this.dataSourceGuiaPagamento[0].tipoDivida, this.formatDate(this.dataSourceGuiaPagamento[0].mesAno),
    this.formatDatePT(this.dataSourceGuiaPagamento[0].dataVencimento),
    '$' + this.formatDecimal(this.dataSourceGuiaPagamento[0].valorEntidade),
    '$' + this.formatDecimal(this.dataSourceGuiaPagamento[0].valorTrabalhador),
    '$' + this.dataSourceGuiaPagamento[0].juroApurado != null ?
      this.formatDecimal(this.dataSourceGuiaPagamento[0].juroApurado) : this.formatDecimal(0),
    '$' + this.formatDecimal(this.dataSourceGuiaPagamento[0].valorTotal - valorPago)];
    this.rows.push(temp);
    valorTotalsemJuros = this.dataSourceGuiaPagamento[0].valorEntidade +
      this.dataSourceGuiaPagamento[0].valorTrabalhador;
    descricao = this.dataSourceGuiaPagamento[0].tipoDivida;

    if (this.dataSourceGuiaPagamento[0].juroApurado) {
      juros = this.dataSourceGuiaPagamento[0].juroApurado;

    }
    this.idContaCorrente = this.dataSourceGuiaPagamento[0].idContaCorrente;



    let guiaPagamento = {
      idGuia: 0,
      guiaEntidadeFk: this.entidadeId,
      valorApagar: this.dataSourceGuiaPagamento[0].valorTotal - valorPago,
      descricao: descricao,
      valor: this.dataSourceGuiaPagamento[0].valorTotal - valorPago,
      total: this.dataSourceGuiaPagamento[0].valorTotal - valorPago,
      juros: this.dataSourceGuiaPagamento[0].juroApurado,
      indPago: 0,
      dtEmissao: new Date(),
      dtValidade: this.dataSourceGuiaPagamento[0].dataVencimento,
      tipoGuia: 1,
      mesAno: this.dataSourceGuiaPagamento[0].mesAno,
      guiaPagamentoPai: this.dataSourceGuiaPagamento[0].situacaoPagamento == 2 ||
        this.dataSourceGuiaPagamento[0].situacaoPagamento == 5 ||
        this.dataSourceGuiaPagamento[0].situacaoPagamento == 6 ? this.dataSourceGuiaPagamento[0].guiaPagamentoFK : undefined
    };
    this.saveGuia(guiaPagamento);
  }

  public saveGuia(guiaPagamento: GuiaPagamento) {
    let request = {
      guiaPagamento: guiaPagamento,
      idContaCorrente: this.idContaCorrente
    }
    this.guiaPagamentoService.saveGuiaPagamento(request).subscribe(x => {
      this.isGerarPDF = true;
      this.getTableContaCorrente();
      this.getTableResumoContaCorrente();
      openSnackBar(this.translate.instant('conta_corrente.guiaPagamentoGeradoComSucesso'), this._snackBar);
      this.hideLoader();
    },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }


  // public preencherResumoConta() {
  //   var ano: string = new Date().getFullYear().toString();
  //   if (this.date) {
  //     ano = this.formatDate(this.date);
  //   }
  //   var somatorioContribuicoes = 0;
  //   var somatorioQuotizacoes = 0;
  //   var totalPagar = 0;
  //   var totalJuros = 0;
  //   var totalPago = 0;

  //   this.dataSourceContaCorrente.forEach(element => {
  //     somatorioContribuicoes = somatorioContribuicoes + element.valorEntidade;
  //     somatorioQuotizacoes = somatorioQuotizacoes + element.valorTrabalhador;
  //     totalPagar = totalPagar + element.valorTotal;

  //     if (element.valorPago)
  //       totalPago = totalPago + element.valorPago;

  //     if (element.juroApurado) {
  //       totalJuros = totalJuros + element.juroApurado;
  //     }

  //   });

  //   var resumoConta: ResumoContaListagem = {
  //     ano: ano,
  //     somatorioContribuicoes: formatDecimal(this.decimalPipe, somatorioContribuicoes),
  //     somatorioQuotizacoes: formatDecimal(this.decimalPipe, somatorioQuotizacoes),
  //     totalPagar: formatDecimal(this.decimalPipe, totalPagar),
  //     totalJuros: formatDecimal(this.decimalPipe, totalJuros),
  //     totalPago: formatDecimal(this.decimalPipe, totalPago),
  //     totalDivida: formatDecimal(this.decimalPipe, totalPagar - totalPago)
  //   };
  //   this.dataSourceResumoConta = [resumoConta];
  // }


  public gerarPDF() {
    var pdf = new jsPDF();
    // INSS logo
    pdf.addImage(environment.ssIcon, 'JPEG', 90, 5, 25, 20);

    //title
    pdf.text(this.translate.instant('general.guiaDePagamento'), 83, 35);
    pdf.setFontSize(12);
    pdf.setTextColor(99);

    //NISS
    pdf.text(this.translate.instant('general.niss') + ': ' + this.niss, 20, 45);

    //Número do Documento
    pdf.text(this.translate.instant('guiaPagamentoListagem.numDocumento') + ': ' + this.numDocumento, 75, 45);

    //datas
    pdf.text(this.translate.instant('pagamentosExecutados.dataEmissao') + ': ' + this.formatDatePT(new Date), 20, 55);
    pdf.text(this.translate.instant('conta_corrente.dataLimitePagamento') + ': ' + this.formatDatePT(this.dataLimitePagamento), 120, 55);

    var body = [...this.rows,
    [{
      content: `${this.translate.instant('general.total').toUpperCase()}: ${this.formatDecimal(this.total)}`, colSpan: 8,
      styles: { fillColor: [42, 129, 204] }
    }]]

    {
      (pdf as any).autoTable({
        startY: 60,
        columnStyles: { europe: { halign: 'center' } },
        head: [[this.translate.instant('conta_corrente.tipoDivida'), this.translate.instant('conta_corrente.mesAno'), this.translate.instant('conta_corrente.dtVencimento'), this.translate.instant('conta_corrente.valorEntidade'), this.translate.instant('conta_corrente.valorTrabalhador'), this.translate.instant('conta_corrente.juros'), this.translate.instant('conta_corrente.valorTotal')]],
        body: body,
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
        },
        didDrawCell: (data: { column: { index: any; }; }) => {
          console.log(data.column.index)
        }

      })
    }

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


    // Download PDF doc
    //pdf.save('GuiaPagamento.pdf');
  }

  public formatDecimal(number?: number) {
    return formatDecimal(this.decimalPipe, number);
  }

  public updateContaCorrenteTable(event: any) {
    this.pageIndexContaCorrenteTable = event.pageIndex;
    this.pageSizeContaCorrenteTable = event.pageSize;
    this.getTableContaCorrente();
  }

  public return(): void {
    this.router.navigate(['/contribHomePage/'],);
  }
}
