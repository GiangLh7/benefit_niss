import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { TranslateService } from "@ngx-translate/core";
import { NgxSpinnerService } from "ngx-spinner";
import { MyErrorStateMatcher } from "src/app/matcher";
import { GetProcessosRelatoriosRequest, GetProcessosRelatoriosRequestViewType } from "src/app/request-models/processo-request";
import { FilterRequest } from "src/app/request-models/utils-request";
import { RelatoriosProcessosListagem, TipoProcessosRelatorios } from "src/app/response-models/processo-response";
import { ProcessoService } from "src/app/services/processos.service";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { blobExcelSaveAs, openErrorsDialog, showExpiredError } from "src/app/utils";

@Component({
  selector: 'app-consultas-processos',
  templateUrl: './consultas-processos.component.html',
  styleUrls: ['./consultas-processos.component.css']
})
export class ConsultasProcessosComponent implements OnInit {

  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public errors: string[] = [];
  public faTimesCircle = faTimesCircle;
  public viewType?: GetProcessosRelatoriosRequestViewType;
  public processoConfigId?: number;
  public viewTypeOptions: any[] = [{
    id: GetProcessosRelatoriosRequestViewType.All,
    nome: 'processo.todos'
  },
  {
    id: GetProcessosRelatoriosRequestViewType.NotArchived,
    nome: 'processo.emTramitacao'
  },
  {
    id: GetProcessosRelatoriosRequestViewType.Archived,
    nome: 'processo.arquivado'
  }];
  public filter: FilterRequest = {};
  public datepickerTooltip: string = "";
  public submittedTry: boolean = false;
  public resultsShown: boolean = false;
  public tipoProcessos: TipoProcessosRelatorios[] = [];

  //Region tarefa table
  public processosList: RelatoriosProcessosListagem[] = [];
  public displayedColumns: string[] = ['tipoProcesso', 'estado', 'ultimaTarefa', 'perfis', 'acoes'];
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
    public processoService: ProcessoService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {

    if (!this.tokenStorage.getToken()) {
      this.router.navigate(['/login'], { skipLocationChange: true })
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired()) {
      this.fetchDropdownList();
    }
    else {
      showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
    }
  }

  public showLoader() {
    this.spinner.show();
  }



  public processoArquivadoNavigation(id: number) {
    this.router.navigate([`./processoDetalhe/${id}`], { skipLocationChange: true, state: { from: './consultasProcessos' } });
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

  public getProcessosTable() {

    if (!this.submittedTry) this.submittedTry = true;

    if (this.viewType == undefined) return;

    this.showLoader();

    this.filter.index = this.pageIndexTable;
    this.filter.rows = this.pageSizeTable;

    const request: GetProcessosRelatoriosRequest = {
      filter: this.filter,
      viewType: this.viewType!,
      processoConfigId: this.processoConfigId
    };

    if (!this.resultsShown) this.resultsShown = true;

    this.processoService.GetProcessosRelatorios(request).subscribe((processos) => {
      this.processosList = processos.processos || [];
      this.totalRowsTable = processos.rows;

      this.hideLoader();
    },
      err => {
        this.processosList = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }

  public exportExcelRelatorio() {

    this.showLoader();

    const request: GetProcessosRelatoriosRequest = {
      filter: this.filter,
      viewType: this.viewType!,
      processoConfigId: this.processoConfigId
    };

    this.processoService.ExtractToExcelRelatorios(request).subscribe((response) => {
      this.hideLoader();
      blobExcelSaveAs(response.file, `consultation-processes_${this.datePipe.transform(this.filter.dateFilterBegin,'dd-MM-yyyy')}_${this.datePipe.transform(this.filter.dateFilterEnd,'dd-MM-yyyy')}`);
    },
      err => {
        this.processosList = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }

  public clearFilter() {
    this.viewType = undefined;
    this.processoConfigId = undefined;
    this.filter = {};
    this.submittedTry = false;
  }

  private fetchDropdownList() {

    this.showLoader();

    this.processoService.GetTipoProcessosRelatorios({}).subscribe(resp => {
      this.tipoProcessos = resp.tipoProcessos;
      this.hideLoader();
    },
    err => {
      this.hideLoader();
      err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
    });
  }

  public updateProcessosTable(event: any) {
    this.pageIndexTable = event.pageIndex;
    this.pageSizeTable = event.pageSize;
    this.showLoader();
    this.getProcessosTable();
  }

  public viewTypeChange() {
    switch (this.viewType) {
      case GetProcessosRelatoriosRequestViewType.All:
        this.datepickerTooltip = 'processo.datepicker_creacao';
        break;
      case GetProcessosRelatoriosRequestViewType.NotArchived:
        this.datepickerTooltip = 'processo.datepicker_emtramitacao';
        break;
      case GetProcessosRelatoriosRequestViewType.Archived:
        this.datepickerTooltip = 'processo.datepicker_arquivado';
        break;
      default:
        break;
    }
  }
}
