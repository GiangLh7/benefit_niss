import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatDatepicker } from "@angular/material/datepicker";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { faFilePdf, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { TranslateService } from "@ngx-translate/core";
import jsPDF from "jspdf";
import { NgxSpinnerService } from "ngx-spinner";
import { MyErrorStateMatcher } from "src/app/matcher";
import { GetOrdensPagamentoRelatoriosRequest } from "src/app/request-models/pagamentoExecutado-request";
import { FilterRequest } from "src/app/request-models/utils-request";
import { RelatoriosOrdensPagamentoListagem } from "src/app/response-models/pagamentosExecutados-response";
import { DominiosService } from "src/app/services/dominios.service";
import { PagamentoExecutadoService } from "src/app/services/pagamentoExecutado.service";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { blobExcelSaveAs, formataCurrency, formatDatePT, JsPdf_centerText, openErrorsDialog, showExpiredError } from "src/app/utils";
import { environment } from "src/environments/environment";

@Component({
  standalone: false,
  selector: 'app-consultas-ordens-pag',
  templateUrl: './consultas-ordens-pag.component.html',
  styleUrls: ['./consultas-ordens-pag.component.css']
})
export class ConsultasOrdensPagamentoComponent implements OnInit {

  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public errors: string[] = [];
  public faTimesCircle = faTimesCircle;

  public estadoOptions: any[] = [];
  public contaOptions: any[] = [];
  public contaOptionsFiltered: any[] = [];

  public filter: FilterRequest = {};
  public submittedTry: boolean = false;
  public resultsShown: boolean = false;
  public estado?: number;
  public search?: string;
  public numeroPagamento?: string;
  public contaOGE?: number;

  public faFilePdf = faFilePdf;

  //Region tarefa table
  public pagamentosList: RelatoriosOrdensPagamentoListagem[] = [];
  public displayedColumns: string[] = ['numeroPagamento', 'destinatario', 'conta', 'dataEmissao', 'estado', 'valor', 'pdf'];
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
      this.getEstadosPagamento();
      this.getContasOGE();
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

    this.showLoader();

    this.filter.index = this.pageIndexTable;
    this.filter.rows = this.pageSizeTable;

    const request: GetOrdensPagamentoRelatoriosRequest = {
      filter: this.filter,
      estado: this.estado,
      numeroPagamento: this.numeroPagamento,
      contaOGE: this.contaOGE,
      search: this.search
    };

    if (!this.resultsShown) this.resultsShown = true;

    this.pagamentosService.GetOrdensPagamentoRelatoriosGrouped(request).subscribe((pagamentos) => {
      this.pagamentosList = pagamentos.pagamentos || [];
      this.totalRowsTable = pagamentos.rows;

      this.hideLoader();
    },
      err => {
        this.pagamentosList = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }

  public getEstadosPagamento() {
    this.dominiosService.getAllEstadosPagamento().subscribe((response) => {
      this.estadoOptions = response.dominios || [];

      this.hideLoader();
    },
      err => {
        this.estadoOptions = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public getContasOGE() {
    this.pagamentosService.GetDropdownContasOGE({}).subscribe((response) => {
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

  public exportExcelRelatorio() {

    this.showLoader();

    const request: GetOrdensPagamentoRelatoriosRequest = {
      filter: this.filter,
      estado: this.estado,
      numeroPagamento: this.numeroPagamento,
      contaOGE: this.contaOGE,
      search: this.search
    };

    this.pagamentosService.ExtractToExcelRelatorios(request).subscribe((response) => {
      this.hideLoader();
      const date = this.filter.dateFilterBegin && this.filter.dateFilterEnd ? `_${this.datePipe.transform(this.filter.dateFilterBegin, 'dd-MM-yyyy')}_${this.datePipe.transform(this.filter.dateFilterEnd, 'dd-MM-yyyy')}` : this.filter.dateFilterBegin ? `_${this.datePipe.transform(this.filter.dateFilterBegin, 'dd-MM-yyyy')}` : "";
      blobExcelSaveAs(response.file, `consultation-payment-orders${date}`);
    },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }

  public onTipoContaSearch(event: any) {
    this.contaOptionsFiltered = this.contaOptions.filter(p => p.nome.toLowerCase().startsWith(event.toLowerCase()));
  }

  public clearFilter() {
    this.search = undefined;
    this.estado = undefined;
    this.filter = {};
    this.numeroPagamento = undefined;
    this.contaOGE = undefined;
    this.submittedTry = false;
  }

  public updateOrdensTable(event: any) {
    this.pageIndexTable = event.pageIndex;
    this.pageSizeTable = event.pageSize;
    this.showLoader();
    this.getOrdensPagamentoTable();
  }

  public formatDatePT(date: Date) {
    return formatDatePT(this.datePipe, date);
  }

  public formataCurrency(amount: number) {
    return formataCurrency(amount);
  }

  public gerarPDF(element: RelatoriosOrdensPagamentoListagem): void {

    var pdf = new jsPDF();
    // INSS logo
    pdf.addImage(environment.ssIcon, 'JPEG', 90, 5, 25, 20);


    //title
    JsPdf_centerText(pdf, this.translate.instant('general.guiaDePagamento'), 35);
    // pdf.text('Ordem de Pagamento', 83, 35);
    pdf.setFontSize(12);
    pdf.setTextColor(99);

    //Número do Documento
    JsPdf_centerText(pdf, this.translate.instant('pagamentosExecutados.numeroOrdemPagamento') + ': ' + element.numeroPagamento, 45);
    // pdf.text('Número de OP: ' + element.numeroPagamento, 75, 45);

    //datas
    // pdf.text('Data de Emissão: ' + this.formatDatePT(new Date), 20, 55);
    // pdf.text('Data Limite de Pagamento: ' + this.formatDatePT(this.dataLimitePagamento), 120, 55);

    const dest = element.countDestinatarios == 1 ? element.destinatario : this.translate.instant('general.varios');
    const cont = element.countContas == 1 ? element.conta : this.translate.instant('general.varios');
    var body = [[dest, cont, this.formatDatePT(element.dataEmissao), element.estado, `${element.valor} $`]];

    (pdf as any).autoTable({
      startY: 55,
      columnStyles: { europe: { halign: 'center' } },
      head: [[this.translate.instant('pagamentosExecutados.destinatario'), this.translate.instant('pagamentosExecutados.contaOGE'), this.translate.instant('pagamentosExecutados.dataEmissao'), this.translate.instant('pagamentosExecutados.estado'), this.translate.instant('pagamentosExecutados.valor')]],
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
  }

}
