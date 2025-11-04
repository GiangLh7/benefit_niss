import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { TranslateService } from "@ngx-translate/core";
import { NgxSpinnerService } from "ngx-spinner";
import { ProcessosListagemRequest } from "src/app/request-models/processo-request";
import { FilterRequest } from "src/app/request-models/utils-request";
import { ProcessosArquivadosListagem } from "src/app/response-models/processo-response";
import { ProcessoService } from "src/app/services/processos.service";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { formatDate, formatDatePT, openErrorsDialog, showExpiredError } from "src/app/utils";

@Component({
  standalone: false,
  selector: 'app-processos-arquivados',
  templateUrl: './processos-arquivados.component.html',
  styleUrls: ['./processos-arquivados.component.css']
})
export class ProcessosArquivadosComponent implements OnInit {

  public errors: string[] = [];
  public faTimesCircle = faTimesCircle;
  public filterBy = '';
  public errorMessage = "";

  //Region processo table
  public processosList: ProcessosArquivadosListagem[] = [];
  public displayedColumns: string[] = ['numero', 'nome', 'date', 'acoes'];
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
    private datepipe: DatePipe,
  ) { }

  ngOnInit(): void {
    if (!this.tokenStorage.getToken()) {
      this.router.navigate([''])
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired()) {
      this.showLoader();
      this.getProcessosArquivadosTable();
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

  public getProcessosArquivadosTable() {
    let filter: FilterRequest;
    filter = {};
    filter.index = this.pageIndexTable;
    filter.rows = this.pageSizeTable;

    filter.filterBy = this.filterBy;

    let request: ProcessosListagemRequest;

    request = { "filter": filter };

    var processos = this.processoService.GetAllProcessosArquivados(request);

    processos.subscribe((processos) => {
      this.totalRowsTable = processos.rows || 0;
      this.processosList = processos.processos || [];
    },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      }, () => {
        this.hideLoader();
      });

  }

  public pesquisarProcessos() {
    this.getProcessosArquivadosTable();
  }

  public clearPesquisarProcessos() {
    this.filterBy = '';
    this.getProcessosArquivadosTable();
  }

  public updateProcessosTable(event: any) {
    this.pageIndexTable = event.pageIndex;
    this.pageSizeTable = event.pageSize;
    this.showLoader();
    this.getProcessosArquivadosTable();
  }

  public formatDate(date: Date): string {
    return formatDate(this.datepipe, date);
  }


  public formatDatePT(date: Date): string {
    return formatDatePT(this.datepipe, date);
  }

  public consultarProcesso(id: number): void {
    this.router.navigate([`./processoDetalhe/${id}`],);
  }

}
