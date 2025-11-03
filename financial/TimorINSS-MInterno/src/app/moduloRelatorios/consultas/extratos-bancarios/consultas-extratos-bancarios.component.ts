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
import { MovimentosBancariosData } from "src/app/models/movimentosBancarios";
import { MovimentosListagemRequest } from "src/app/request-models/movimentosBancarios-request";
import { FilterRequest, OrderDirectionEnum } from "src/app/request-models/utils-request";
import { movimentosBancariosService } from "src/app/services/movimentosBancarios.service";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { blobExcelSaveAs, formataCurrency, formatDatePT, openErrorsDialog, showExpiredError } from "src/app/utils";

@Component({
  selector: 'app-consultas-extratos-bancarios',
  templateUrl: './consultas-extratos-bancarios.component.html',
  styleUrls: ['./consultas-extratos-bancarios.component.css']
})
export class ConsultasExtratosBancariosComponent implements OnInit {

  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public errors: string[] = [];
  public faTimesCircle = faTimesCircle;
  public totais: any = {};

  public contasOptions: ContaBancaria[] = [];
  public contaSelected?: ContaBancaria;
  public orderBy: OrderDirectionEnum = OrderDirectionEnum.descending;

  public orderOptions: any[] = [
    {
      id: OrderDirectionEnum.ascending,
      descricao: 'general.asc'
    },
    {
      id: OrderDirectionEnum.descending,
      descricao: 'general.desc'
    }
  ]

  public filter: FilterRequest = {
    orderBy: 'Id'
  };
  public submittedTry: boolean = false;
  public resultsShown: boolean = false;
  public contaId?: number;
  public contaIdFiltrado?: number;
  public beginDate?: Moment;
  public endDate?: Moment;

  //Region tarefa table
  public extratosList: MovimentosBancariosData[] = [];
  public displayedColumns: string[] = ['descricao', 'data', 'credito', 'debito', 'saldo'];
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
    public movimentosBancariosService: movimentosBancariosService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {

    if (!this.tokenStorage.getToken()) {
      this.router.navigate(['/login'], { skipLocationChange: true })
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired()) {
      this.getContasBancariasDropdown();
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

  public getContasBancariasDropdown() {
    this.showLoader();

    this.movimentosBancariosService.ListContasBancarias(true).subscribe((contas) => {
      this.contasOptions = contas.contas;
      this.hideLoader();
    });
  }

  public getExtratosBancariosTable() {

    if (!this.submittedTry) this.submittedTry = true;

    if (this.contaId == null) return;

    this.showLoader();

    this.filter.index = this.pageIndexTable;
    this.filter.rows = this.pageSizeTable;
    this.filter.orderDirection = this.orderBy;
    this.filter.dateFilterBegin = this.beginDate?.toDate();
    this.filter.dateFilterEnd = this.endDate?.toDate();

    const request: MovimentosListagemRequest = {
      filter: this.filter,
      BancoId: this.contaId,
      GetBalance: true
    };

    if (!this.resultsShown) this.resultsShown = true;

    this.movimentosBancariosService.listMovimentosBancarios(request).subscribe((extratos) => {
      this.extratosList = extratos.movimentos || [];
      this.totalRowsTable = extratos.rows;
      this.totais.credito = extratos.movimentos.reduce((inc: number, extrato: MovimentosBancariosData) => inc + (extrato.credito || 0), 0);
      this.totais.debito = extratos.movimentos.reduce((inc: number, extrato: MovimentosBancariosData) => inc + (extrato.debito || 0), 0);
      // this.totais.saldo = extratos.movimentos.reduce((inc: number, extrato: MovimentosBancariosData) => inc + extrato.saldo, 0);
      this.contaIdFiltrado = this.contaId;

      this.hideLoader();
    },
      err => {
        this.extratosList = [];
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
    this.contaId = undefined;
    this.contaSelected = undefined;
    this.filter = {};
    this.beginDate = undefined;
    this.endDate = undefined;
    this.submittedTry = false;
  }

  public updateExtratosBancariosTable(event: any) {
    this.pageIndexTable = event.pageIndex;
    this.pageSizeTable = event.pageSize;
    this.showLoader();
    this.getExtratosBancariosTable();
  }

  public formatDate(date: Date)
  {
    return formatDatePT(this.datePipe, date);
  }

  public formataCurrency(amount: number) {
    return formataCurrency(amount);
  }

  public changedValue(option: any) {
    const conta = this.contasOptions.find(e => e.id == option.value);
    this.contaSelected = conta;
  }

  public exportExcelRelatorio() {

    this.showLoader();

    const request: MovimentosListagemRequest = {
      filter: this.filter,
      BancoId: this.contaId,
      GetBalance: true
    };

    this.movimentosBancariosService.listMovimentosBancariosExcel(request).subscribe((response) => {
      this.hideLoader();
      const date = this.filter.dateFilterBegin && this.filter.dateFilterEnd ? `_${this.datePipe.transform(this.filter.dateFilterBegin, 'dd-MM-yyyy')}_${this.datePipe.transform(this.filter.dateFilterEnd, 'dd-MM-yyyy')}` : this.filter.dateFilterBegin ? `_${this.datePipe.transform(this.filter.dateFilterBegin, 'dd-MM-yyyy')}` : "";
      blobExcelSaveAs(response.file, `consultation-bank-statements${date}`);
    },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }

}
