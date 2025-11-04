import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatDatepicker } from "@angular/material/datepicker";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { faFilePdf, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { TranslateService } from "@ngx-translate/core";
import jsPDF from "jspdf";
import { Moment } from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import { MyErrorStateMatcher } from "src/app/matcher";
import { GetOrdensPagamentoRelatoriosRequest, ReportsDropdownContasOGERequest } from "src/app/request-models/pagamentoExecutado-request";
import { FilterRequest } from "src/app/request-models/utils-request";
import { RelatoriosOrdensPagamentoListagem } from "src/app/response-models/pagamentosExecutados-response";
import { DominiosService } from "src/app/services/dominios.service";
import { PagamentoExecutadoService } from "src/app/services/pagamentoExecutado.service";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { blobExcelSaveAs, formataCurrency, formatDate, formatDatePT, JsPdf_centerText, openErrorsDialog, showExpiredError } from "src/app/utils";
import { environment } from "src/environments/environment";

@Component({
  standalone: false,
  selector: 'app-reports-pag-emitidos',
  templateUrl: './reports-pag-emitidos.component.html',
  styleUrls: ['./reports-pag-emitidos.component.css']
})
export class RelatoriosPagamentosEmiditosComponent implements OnInit {

  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public errors: string[] = [];
  public faTimesCircle = faTimesCircle;
  public totais: any = {};

  public centroCustoOptions: any[] = [];
  public contaOptions: any[] = [];
  public contaOptionsFiltered: any[] = [];

  public filter: FilterRequest = {};
  public submittedTry: boolean = false;
  public resultsShown: boolean = false;
  public centroCusto?: number;
  public contaOGE?: number;
  public beginDate?: string;

  public faFilePdf = faFilePdf;

  //Region tarefa table
  public pagamentosList: RelatoriosOrdensPagamentoListagem[] = [];
  public displayedColumns: string[] = ['numeroPagamento', 'conta', 'destinatario', 'iban', 'valor'];
  public totalRowsTable: number = 0;
  public pageSizeTable = 20;
  public pageIndexTable = 0;

  constructor(
    private router: Router,
    private tokenStorage: TokenStorageService,
    private spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    public warningDialog: MatDialog,
    public translate: TranslateService,
    public pagamentosService: PagamentoExecutadoService,
    public dominiosService: DominiosService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {

    if (!this.tokenStorage.getToken()) {
      this.router.navigate(['/login'],)
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired()) {
      // this.getCentrosCusto();
      // this.getContasOGE();
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

  public showError() {
    const dialogRef = openErrorsDialog(this.errors, this.errorDialog);
    this.hideLoader();

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }

  public getOrdensPagamentoTable() {

    if (!this.submittedTry) this.submittedTry = true;

    if (!this.centroCusto || !this.contaOGE || !this.beginDate) return;

    this.showLoader();

    this.filter.index = this.pageIndexTable;
    this.filter.rows = this.pageSizeTable;

    const request: GetOrdensPagamentoRelatoriosRequest = {
      filter: this.filter,
      centroCusto: this.centroCusto,
      contaOGE: this.contaOGE,
    };

    if (!this.resultsShown) this.resultsShown = true;

    this.pagamentosService.GetOrdensPagamentoRelatorios(request).subscribe((pagamentos) => {
      this.pagamentosList = pagamentos.pagamentos || [];
      this.totalRowsTable = pagamentos.rows;

      this.totais.valor = pagamentos.pagamentos.reduce((inc: number, pagamento: RelatoriosOrdensPagamentoListagem) => inc + pagamento.valor, 0);

      this.hideLoader();
    },
      err => {
        this.pagamentosList = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }


  public onTipoContaSearch(event: any) {
    this.contaOptionsFiltered = this.contaOptions.filter(p => p.nome.toLowerCase().startsWith(event.toLowerCase()));
  }

  public getCentrosCusto() {

    const filter: FilterRequest = {
      dateFilterBegin: this.filter.dateFilterBegin
    }

    const request: any = {
      filter
    }

    this.pagamentosService.GetCentrosCusto(request).subscribe((response) => {
      this.centroCustoOptions = response.selects || [];

      this.hideLoader();
    },
      err => {
        this.centroCustoOptions = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public getContasOGE() {

    const request: ReportsDropdownContasOGERequest = {
      centroCusto: this.centroCusto!
    }

    this.pagamentosService.GetDropdownContasOGE(request).subscribe((response) => {
      this.contaOptions = this.contaOptionsFiltered = response.selects || [];

      this.hideLoader();
    },
      err => {
        this.contaOptions = this.contaOptionsFiltered = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  centroCustoChange() {
    this.getContasOGE();
  }

  chosenMonthHandler(date: Moment, datepicker: MatDatepicker<Moment>) {
    const normalDate = date.toDate();
    this.beginDate = formatDate(this.datePipe, normalDate);
    this.filter.dateFilterBegin = normalDate;
    this.filter.dateFilterEnd = new Date(normalDate.getFullYear(), normalDate.getMonth() + 1, 0);
    datepicker.close();
    this.getCentrosCusto();
  }

  public clearFilter() {
    this.centroCusto = undefined;
    this.filter = {};
    this.beginDate = undefined;
    this.contaOGE = undefined;
    this.submittedTry = false;
  }

  public updateOrdensTable(event: any) {
    this.pageIndexTable = event.pageIndex;
    this.pageSizeTable = event.pageSize;
    this.showLoader();
    this.getOrdensPagamentoTable();
  }

  public formatDate(date: Date) {
    return formatDate(this.datePipe, date);
  }

  public formataCurrency(amount: number) {
    return formataCurrency(amount);
  }


  public gerarPDF(): void {


    if (!this.centroCusto || !this.contaOGE || !this.beginDate) return;

    this.showLoader();

    this.filter.index = 0;
    this.filter.rows = 999999;

    const request: GetOrdensPagamentoRelatoriosRequest = {
      filter: this.filter,
      centroCusto: this.centroCusto,
      contaOGE: this.contaOGE,
    };

    this.pagamentosService.GetOrdensPagamentoRelatorios(request).subscribe((pagamentos) => {

      var pdf = new jsPDF();
      // INSS logo
      pdf.addImage(environment.ssIcon, 'JPEG', 90, 5, 25, 20);


      //title
      JsPdf_centerText(pdf, this.translate.instant('general.pagamentosEmitidos'), 35);
      // pdf.text('Ordem de Pagamento', 83, 35);
      pdf.setFontSize(12);
      pdf.setTextColor(99);

      JsPdf_centerText(pdf, this.formatDate(this.filter.dateFilterBegin!), 45);

      JsPdf_centerText(pdf, this.translate.instant('pagamentosExecutados.centroCusto') + ': ' + this.centroCustoOptions.find(e => e.id == this.centroCusto).nome, 55);

      JsPdf_centerText(pdf, this.translate.instant('pagamentosExecutados.contaOGE') + ': ' + this.contaOptions.find(e => e.id == this.contaOGE).nome, 65);

      JsPdf_centerText(pdf, this.translate.instant('guiaPagamentoListagem.total') + ': ' + this.formataCurrency(pagamentos.pagamentos.reduce((inc: number, pag: RelatoriosOrdensPagamentoListagem) => inc + (pag.valor || 0), 0)), 75);
      // pdf.text('Número de OP: ' + element.numeroPagamento, 75, 45);

      //datas
      // pdf.text('Data de Emissão: ' + this.formatDatePT(new Date), 20, 55);
      // pdf.text('Data Limite de Pagamento: ' + this.formatDatePT(this.dataLimitePagamento), 120, 55);

      var body = pagamentos.pagamentos.map(pagamento => [
          pagamento.numeroPagamento,
          pagamento.conta,
          pagamento.destinatario,
          pagamento.iban,
          this.formataCurrency(pagamento.valor)
        ]);

      (pdf as any).autoTable({
        startY: 85,
        columnStyles: { europe: { halign: 'center' } },
        head: [[this.translate.instant('pagamentosExecutados.numeroOrdemPagamento'), this.translate.instant('numeroOrdemPagamento.contaOGE'), this.translate.instant('numeroOrdemPagamento.destinatario'), this.translate.instant('numeroOrdemPagamento.iban'), this.translate.instant('numeroOrdemPagamento.valor')]],
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

      // Open PDF document in browser's new tab
      window.open(URL.createObjectURL(pdf.output("blob")));
      //pdf.output('dataurlnewwindow');

      // Download PDF doc
      //pdf.save('GuiaPagamento.pdf');

      this.hideLoader();

    },
    err => {
      this.hideLoader();
      err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
    });
  }

}
