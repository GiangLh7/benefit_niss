import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { TranslateService } from "@ngx-translate/core";
import { Moment } from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import { MyErrorStateMatcher } from "src/app/matcher";
import { ClassificacaoContabilistica } from "src/app/models/pagamentos_executados";
import { FilterRequest, OrderDirectionEnum } from "src/app/request-models/utils-request";
import { ComponenteReceitaRegistoService } from "src/app/services/componenteReceitaRegisto.service";
import { PagamentoExecutadoService } from "src/app/services/pagamentoExecutado.service";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { blobExcelSaveAs, formataCurrency, formatDate, formatDatePT, openErrorsDialog, showExpiredError } from "src/app/utils";

@Component({
  standalone: false,
  selector: 'app-consultas-classificacao-contab',
  templateUrl: './consultas-classificacao-contab.component.html',
  styleUrls: ['./consultas-classificacao-contab.component.css']
})
export class ConsultasClassificacaoContabilisticaComponent implements OnInit {

  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public errors: string[] = [];
  public faTimesCircle = faTimesCircle;
  public totais: any = {};

  public filter: FilterRequest = {
    orderBy: 'data',
    orderDirection: OrderDirectionEnum.ascending,
  };
  public submittedTry: boolean = false;
  public resultsShown: boolean = false;
  public beginDate?: Moment;
  public endDate?: Moment;

  public faseOptions: any[] = [
    {
      id: 0,
      nome: 'classificacaoContabilistica.obrigacao'
    },
    {
      id: 1,
      nome: 'classificacaoContabilistica.execucao'
    }
  ];

  //Region tarefa table
  public movimentosList: ClassificacaoContabilistica[] = [];
  public displayedColumns: string[] = ['data', 'fase', 'credito', 'debito', 'valor', 'numeroPagamento', 'nomeDestinatario', 'niss', 'tin'];
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
    public pagamentoExecutadoService: PagamentoExecutadoService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {

    if (!this.tokenStorage.getToken()) {
      this.router.navigate(['/login'],)
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired()) {

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

  public getMovimentosTable() {

    if (!this.submittedTry) this.submittedTry = true;

    this.showLoader();

    this.filter.index = this.pageIndexTable;
    this.filter.rows = this.pageSizeTable;
    this.filter.dateFilterBegin = this.beginDate?.toDate();
    this.filter.dateFilterEnd = this.endDate?.toDate();

    const request: FilterRequest = {
      filter: this.filter
    };

    if (!this.resultsShown) this.resultsShown = true;

    this.pagamentoExecutadoService.ClassificacaoContabilisticaRelatorio(request).subscribe((movimentos) => {
      this.movimentosList = movimentos.movimentos || [];
      this.totalRowsTable = movimentos.rows;

      this.totais.valor = movimentos.movimentos.reduce((inc: number, despesa: ClassificacaoContabilistica) => inc + despesa.valor, 0);

      this.hideLoader();
    },
      err => {
        this.movimentosList = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }

  // chosenMonthHandler(date: Date, datepicker: MatDatepicker<Moment>, isBeginDate: boolean) {
  //   if (isBeginDate) {
  //     this.beginDate = formatDate(this.datePipe, date);
  //     this.filter.dateFilterBegin = date;
  //   }
  //   else {
  //     this.endDate = formatDate(this.datePipe, date);
  //     this.filter.dateFilterEnd = date;
  //   }
  //   datepicker.close();
  // }

  public clearFilter() {
    this.filter = {};
    this.beginDate = undefined;
    this.endDate = undefined;
    this.submittedTry = false;
  }

  public updateMovimentosTable(event: any) {
    this.pageIndexTable = event.pageIndex;
    this.pageSizeTable = event.pageSize;
    this.showLoader();
    this.getMovimentosTable();
  }

  public formatDate(date: Date)
  {
    return formatDatePT(this.datePipe, date);
  }

  public formataCurrency(amount: number) {
    return formataCurrency(amount);
  }

  public exportExcelRelatorio() {

    this.showLoader();

    const request: FilterRequest = {
      filter: this.filter
    };

    this.pagamentoExecutadoService.ClassificacaoContabilisticaRelatorioExcel(request).subscribe((response) => {
      this.hideLoader();
      const date = this.filter.dateFilterBegin && this.filter.dateFilterEnd ? `_${this.datePipe.transform(this.filter.dateFilterBegin, 'dd-MM-yyyy')}_${this.datePipe.transform(this.filter.dateFilterEnd, 'dd-MM-yyyy')}` : this.filter.dateFilterBegin ? `_${this.datePipe.transform(this.filter.dateFilterBegin, 'dd-MM-yyyy')}` : "";
      blobExcelSaveAs(response.file, `consultation-accounting-classification${date}`);
    },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }

}
