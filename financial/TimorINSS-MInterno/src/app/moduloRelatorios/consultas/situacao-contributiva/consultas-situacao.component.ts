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
import { GetDeclaracaoRelatoriosRequest } from "src/app/request-models/declaracao-request";
import { FilterRequest } from "src/app/request-models/utils-request";
import { RelatoriosDeclaracaoListagem } from "src/app/response-models/declaracao-response";
import { DeclaracaoService } from "src/app/services/declaracao.service";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { blobExcelSaveAs, formataCurrency, formatDate, openErrorsDialog, showExpiredError } from "src/app/utils";

@Component({
  selector: 'app-consultas-situacao',
  templateUrl: './consultas-situacao.component.html',
  styleUrls: ['./consultas-situacao.component.css']
})
export class ConsultasSituacoesContributivasComponent implements OnInit {  

  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public errors: string[] = [];
  public faTimesCircle = faTimesCircle;
  public totais: any = {};

  public dropdownOptions: any[] = [{
    id: true,
    nome: 'declaracaoremunerao.trabalhador'
  },
  {
    id: false,
    nome: 'declaracaoremunerao.empregador'
  }];

  public filter: FilterRequest = {};
  public submittedTry: boolean = false;
  public resultsShown: boolean = false;
  public isTrabalhador?: boolean;
  public search?: string;
  public beginDate?: string;
  public endDate?: string;

  //Region tarefa table
  public declaracoesList: RelatoriosDeclaracaoListagem[] = [];
  public displayedColumns: string[] = ['mesReferencia', 'empregador', 'valorRenumeracoes', 'valorContribuicoes', 'valorPago', 'valorDivida'];
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
    public declaracaoService: DeclaracaoService,
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

  public getSituacoesContributivasTable() {
    
    if (!this.submittedTry) this.submittedTry = true;

    if (this.isTrabalhador == null || !this.search) return;

    this.showLoader();

    this.filter.index = this.pageIndexTable;
    this.filter.rows = this.pageSizeTable;

    const request: GetDeclaracaoRelatoriosRequest = {
      filter: this.filter,
      isTrabalhador: this.isTrabalhador!,
      search: this.search!
    };

    if (!this.resultsShown) this.resultsShown = true;

    this.declaracaoService.GetDeclaracaoRelatorios(request).subscribe((declaracoes) => {
      this.declaracoesList = declaracoes.declaracoes || [];
      this.totalRowsTable = declaracoes.rows;
      
      this.totais.valorRenumeracoes = declaracoes.declaracoes.reduce((inc: number, guia: RelatoriosDeclaracaoListagem) => inc + guia.valorRenumeracoes, 0);
      this.totais.valorContribuicoes = declaracoes.declaracoes.reduce((inc: number, guia: RelatoriosDeclaracaoListagem) => inc + guia.valorContribuicoes, 0);
      this.totais.valorPago = declaracoes.declaracoes.reduce((inc: number, guia: RelatoriosDeclaracaoListagem) => inc + guia.valorPago, 0);
      this.totais.valorDivida = declaracoes.declaracoes.reduce((inc: number, guia: RelatoriosDeclaracaoListagem) => inc + guia.valorDivida, 0);

      this.hideLoader();
    },
      err => {
        this.declaracoesList = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }
  
  chosenMonthHandler(date: Date, datepicker: MatDatepicker<Moment>, isBeginDate: boolean) {
    if (isBeginDate) {
      this.beginDate = formatDate(this.datePipe, date);
      this.filter.dateFilterBegin = date;
    }
    else {
      this.endDate = formatDate(this.datePipe, date);
      this.filter.dateFilterEnd = date;
    }
    datepicker.close();
  }

  public exportExcelRelatorio() {

    this.showLoader();

    const request: GetDeclaracaoRelatoriosRequest = {
      filter: this.filter,
      isTrabalhador: this.isTrabalhador!,
      search: this.search!
    };

    this.declaracaoService.ExtractToExcelRelatorios(request).subscribe((response) => {
      this.hideLoader();
      const date = this.filter.dateFilterBegin && this.filter.dateFilterEnd ? `_${this.datePipe.transform(this.filter.dateFilterBegin,'dd-MM-yyyy')}_${this.datePipe.transform(this.filter.dateFilterEnd,'dd-MM-yyyy')}` : this.filter.dateFilterBegin ? `_${this.datePipe.transform(this.filter.dateFilterBegin,'dd-MM-yyyy')}` : "";
      blobExcelSaveAs(response.file, `consultation-contribution-status${date}`);
    },
      err => {
        this.declaracoesList = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }

  public clearFilter() {
    this.search = "";
    this.isTrabalhador = undefined;
    this.filter = {};
    this.beginDate = undefined;
    this.endDate = undefined;
    this.submittedTry = false;
  }

  public updateSituacoesTable(event: any) {
    this.pageIndexTable = event.pageIndex;
    this.pageSizeTable = event.pageSize;
    this.showLoader();
    this.getSituacoesContributivasTable();
  }

  public formatDate(date: Date)
  {
    return formatDate(this.datePipe, date);
  }

  public formataCurrency(amount: number) {
    return formataCurrency(amount);
  }

}
