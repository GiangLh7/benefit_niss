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
import { ReceitaRelatorio } from "src/app/models/componenteReceitaRegisto";
import { ContaBancaria } from "src/app/models/contaBancaria";
import { MovimentosBancariosData } from "src/app/models/movimentosBancarios";
import { MovimentosListagemRequest } from "src/app/request-models/movimentosBancarios-request";
import { FilterRequest, OrderDirectionEnum } from "src/app/request-models/utils-request";
import { ComponenteReceitaRegistoService } from "src/app/services/componenteReceitaRegisto.service";
import { movimentosBancariosService } from "src/app/services/movimentosBancarios.service";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { blobExcelSaveAs, formataCurrency, formatDate, formatDatePT, openErrorsDialog, showExpiredError } from "src/app/utils";

@Component({
  standalone: false,
  selector: 'app-consultas-receitas',
  templateUrl: './consultas-receitas.component.html',
  styleUrls: ['./consultas-receitas.component.css']
})
export class ConsultasReceitasComponent implements OnInit {

  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public errors: string[] = [];
  public faTimesCircle = faTimesCircle;
  public totais: any = {};

  public filter: FilterRequest = {
    orderBy: 'Data',
    orderDirection: OrderDirectionEnum.ascending
  };
  public submittedTry: boolean = false;
  public resultsShown: boolean = false;
  public beginDate?: Moment;
  public endDate?: Moment;

  //Region tarefa table
  public receitasList: ReceitaRelatorio[] = [];
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
    public componenteReceitaRegistoService: ComponenteReceitaRegistoService,
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

  public getReceitasTable() {

    if (!this.submittedTry) this.submittedTry = true;

    this.showLoader();

    this.filter.index = this.pageIndexTable;
    this.filter.rows = this.pageSizeTable;
    this.filter.dateFilterBegin = this.beginDate?.toDate();
    this.filter.dateFilterEnd = this.endDate?.toDate();

    const request: FilterRequest = {
      filter: this.filter,
    };

    if (!this.resultsShown) this.resultsShown = true;

    this.componenteReceitaRegistoService.GetReceitasRelatorio(request).subscribe((receitas) => {
      this.receitasList = receitas.despesas || [];
      this.totalRowsTable = receitas.rows;

      this.totais.valor = receitas.despesas.reduce((inc: number, receita: ReceitaRelatorio) => inc + receita.valor, 0);

      this.hideLoader();
    },
      err => {
        this.receitasList = [];
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

  public updateReceitasTable(event: any) {
    this.pageIndexTable = event.pageIndex;
    this.pageSizeTable = event.pageSize;
    this.showLoader();
    this.getReceitasTable();
  }

  public formatDate(date: Date) {
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

    this.componenteReceitaRegistoService.GetReceitasRelatorioExcel(request).subscribe((response) => {
      this.hideLoader();
      const date = this.filter.dateFilterBegin && this.filter.dateFilterEnd ? `_${this.datePipe.transform(this.filter.dateFilterBegin, 'dd-MM-yyyy')}_${this.datePipe.transform(this.filter.dateFilterEnd, 'dd-MM-yyyy')}` : this.filter.dateFilterBegin ? `_${this.datePipe.transform(this.filter.dateFilterBegin, 'dd-MM-yyyy')}` : "";
      blobExcelSaveAs(response.file, `consultation-revenues${date}`);
    },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }

}
