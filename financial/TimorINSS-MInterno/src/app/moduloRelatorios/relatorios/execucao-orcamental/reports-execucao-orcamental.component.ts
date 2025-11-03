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
import { GetExecucaoOrcamentalRelatoriosRequest } from "src/app/request-models/agrupamentoConfig-request";
import { FilterRequest } from "src/app/request-models/utils-request";
import { RelatoriosExecucaoOrcamentalListagem } from "src/app/response-models/agrupamentoConfig-response";
import { ComponenteReceitaRegistoService } from "src/app/services/componenteReceitaRegisto.service";
import { DominiosService } from "src/app/services/dominios.service";
import { PagamentoExecutadoService } from "src/app/services/pagamentoExecutado.service";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { blobExcelSaveAs, formataCurrency, formatDate, formatDatePT, openErrorsDialog, showExpiredError } from "src/app/utils";
import { environment } from "src/environments/environment";

@Component({
  selector: 'app-reports-execucao-orcamental',
  templateUrl: './reports-execucao-orcamental.component.html',
  styleUrls: ['./reports-execucao-orcamental.component.css']
})
export class RelatoriosExecucaoOrcamentalComponent implements OnInit {

  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public errors: string[] = [];
  public faTimesCircle = faTimesCircle;

  public tipoContaOptions: any[] = [];
  public tipoContaText: string = "";

  public filter: FilterRequest = {};
  public submittedTry: boolean = false;
  public resultsShown: boolean = false;
  public tipoConta?: number;
  public year?: number;
  public beginDate?: Date;
  public tipoContaDict: any = {};

  //Region tarefa table
  public contasList: RelatoriosExecucaoOrcamentalListagem[] = [];
  public displayedColumns: string[] = ['conta', 'centroCusto', 'rubrica', 'valorOrcamentoInicial', 'valorOrcamentado', 'valorAnoAnterior', 'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro', 'totalExecucao', 'taxaExecucao', 'variacaoExecucao'];
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
    public receitaRegistoService: ComponenteReceitaRegistoService,
    public dominiosService: DominiosService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {

    if (!this.tokenStorage.getToken()) {
      this.router.navigate(['/login'], { skipLocationChange: true })
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired()) {
      this.getTiposConta();
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

  public getExecucaoOrcamentalTable() {

    if (!this.submittedTry) this.submittedTry = true;

    if (!this.year || !this.tipoConta) return;

    this.showLoader();

    this.filter.index = this.pageIndexTable;
    this.filter.rows = this.pageSizeTable;

    const request: GetExecucaoOrcamentalRelatoriosRequest = {
      filter: this.filter,
      year: this.year!,
      tipoConta: this.tipoConta!,
    };

    if (!this.resultsShown) this.resultsShown = true;

    const isReceita = this.tipoContaDict[this.tipoConta].value == 1;

    (isReceita ? this.receitaRegistoService.GetExecucaoOrcamental(request) : this.pagamentosService.GetExecucaoOrcamental(request)).subscribe((response) => {
      this.contasList = response.lista || [];
      this.totalRowsTable = response.rows;

      this.tipoContaText = this.tipoContaDict[this.tipoConta!].name;

      this.hideLoader();
    },
      err => {
        this.contasList = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }

  public getTiposConta() {
    this.dominiosService.getAllTiposConta().subscribe((response) => {
      this.tipoContaOptions = response.dominios || [];
      response.dominios.forEach(dom => {
        this.tipoContaDict[dom.id] = {
          name: dom.descricao,
          value: dom.value
        }
      });

      this.hideLoader();
    },
      err => {
        this.tipoContaOptions = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  chosenYearHandler(date: Moment, datepicker: MatDatepicker<Moment>) {
    const normalDate = date.toDate();
    this.year = normalDate.getFullYear();
    this.beginDate = normalDate;
    datepicker.close();
  }

  public clearFilter() {
    this.year = undefined;
    this.filter = {};
    this.tipoConta = undefined;
    this.submittedTry = false;
  }

  public exportExcelRelatorio() {

    this.showLoader();

    const request: GetExecucaoOrcamentalRelatoriosRequest = {
      filter: this.filter,
      year: this.year!,
      tipoConta: this.tipoConta!,
    };

    const isReceita = this.tipoContaDict[this.tipoConta!].value == 1;

    (isReceita ? this.receitaRegistoService.GetExecucaoOrcamentalExcel(request) : this.pagamentosService.GetExecucaoOrcamentalExcel(request)).subscribe((response) => {
      this.hideLoader();
      blobExcelSaveAs(response.file, `reports-budget-execution-${this.year}`);
    },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }

  public updateOrdensTable(event: any) {
    this.pageIndexTable = event.pageIndex;
    this.pageSizeTable = event.pageSize;
    this.showLoader();
    this.getExecucaoOrcamentalTable();
  }

  public formatDatePT(date: Date) {
    return formatDatePT(this.datePipe, date);
  }

  public formataCurrency(amount: number) {
    return formataCurrency(amount);
  }

}
