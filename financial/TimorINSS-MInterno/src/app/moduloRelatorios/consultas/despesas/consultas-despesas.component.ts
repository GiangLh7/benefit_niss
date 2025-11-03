import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatDatepicker } from "@angular/material/datepicker";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { TranslateService } from "@ngx-translate/core";
import { Moment } from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import { MyErrorStateMatcher } from "src/app/matcher";
import { ContaBancaria } from "src/app/models/contaBancaria";
import { DespesaRelatorio } from "src/app/models/despesaRegistada";
import { MovimentosBancariosData } from "src/app/models/movimentosBancarios";
import { DespesasRelatorioRequest } from "src/app/request-models/componenteDespesaRegisto-request";
import { MovimentosListagemRequest } from "src/app/request-models/movimentosBancarios-request";
import { FilterRequest, OrderDirectionEnum } from "src/app/request-models/utils-request";
import { ComponenteDespesaRegistoService } from "src/app/services/componenteDespesaRegisto.service";
import { movimentosBancariosService } from "src/app/services/movimentosBancarios.service";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { blobExcelSaveAs, formataCurrency, formatDate, formatDatePT, openErrorsDialog, showExpiredError } from "src/app/utils";

@Component({
  selector: 'app-consultas-despesas',
  templateUrl: './consultas-despesas.component.html',
  styleUrls: ['./consultas-despesas.component.css']
})
export class ConsultasDespesasComponent implements OnInit {

  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public errors: string[] = [];
  public faTimesCircle = faTimesCircle;
  public totais: any = {};

  public estadosOptions: any[] = [
    {
      id: 1,
      nome: 'despesas.autorizada'
    },
    {
      id: 2,
      nome: 'despesas.cabimentada'
    },
    {
      id: 3,
      nome: 'despesas.compromisso'
    },
    {
      id: 4,
      nome: 'despesas.obrigacao'
    },
    {
      id: 5,
      nome: 'despesas.executada'
    },
  ];

  public filter: FilterRequest = {
    orderBy: 'Data',
    orderDirection: OrderDirectionEnum.ascending
  };
  public submittedTry: boolean = false;
  public resultsShown: boolean = false;
  public estado?: number;
  public estadoFiltrado?: number;
  public beginDate?: Moment;
  public endDate?: Moment;

  //Region tarefa table
  public despesasList: DespesaRelatorio[] = [];
  public displayedColumns: string[] = ['departamento', 'centroCusto', 'tipoConta', 'contaOSS', 'descricao', 'valor', 'data', 'numeroProcesso', 'utilizador'];
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
    public componenteDespesaRegistoService: ComponenteDespesaRegistoService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {

    if (!this.tokenStorage.getToken()) {
      this.router.navigate(['/login'], { skipLocationChange: true })
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

  public getDespesasTable() {

    if (!this.submittedTry) this.submittedTry = true;

    if (this.estado == null) return;

    this.showLoader();

    this.filter.index = this.pageIndexTable;
    this.filter.rows = this.pageSizeTable;
    this.filter.dateFilterBegin = this.beginDate?.toDate();
    this.filter.dateFilterEnd = this.endDate?.toDate();

    const request: DespesasRelatorioRequest = {
      filter: this.filter,
      EstadoDespesa: this.estado
    };

    if (!this.resultsShown) this.resultsShown = true;

    this.componenteDespesaRegistoService.GetDespesasRelatorio(request).subscribe((despesas) => {
      this.despesasList = despesas.despesas || [];
      this.totalRowsTable = despesas.rows;

      this.totais.valor = despesas.despesas.reduce((inc: number, despesa: DespesaRelatorio) => inc + despesa.valor, 0);
      this.estadoFiltrado = this.estado;

      this.hideLoader();
    },
      err => {
        this.despesasList = [];
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
    this.estado = undefined;
    this.filter = {};
    this.beginDate = undefined;
    this.endDate = undefined;
    this.submittedTry = false;
  }

  public updateDespesasTable(event: any) {
    this.pageIndexTable = event.pageIndex;
    this.pageSizeTable = event.pageSize;
    this.showLoader();
    this.getDespesasTable();
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

    const request: DespesasRelatorioRequest = {
      filter: this.filter,
      EstadoDespesa: this.estado
    };

    this.componenteDespesaRegistoService.GetDespesasRelatorioExcel(request).subscribe((response) => {
      this.hideLoader();
      const date = this.filter.dateFilterBegin && this.filter.dateFilterEnd ? `_${this.datePipe.transform(this.filter.dateFilterBegin, 'dd-MM-yyyy')}_${this.datePipe.transform(this.filter.dateFilterEnd, 'dd-MM-yyyy')}` : this.filter.dateFilterBegin ? `_${this.datePipe.transform(this.filter.dateFilterBegin, 'dd-MM-yyyy')}` : "";
      blobExcelSaveAs(response.file, `consultation-expenses${date}`);
    },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }

}
