import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { faFilePdf, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { TranslateService } from "@ngx-translate/core";
import { NgxSpinnerService } from "ngx-spinner";
import { MyErrorStateMatcher } from "src/app/matcher";
import { GetGuiasRelatoriosRequest } from "src/app/request-models/guiaPagamento-request";
import { GetProcessosRelatoriosRequest, GetProcessosRelatoriosRequestViewType } from "src/app/request-models/processo-request";
import { FilterRequest } from "src/app/request-models/utils-request";
import { RelatoriosGuiasListagem, RelatoriosGuiasListagemResponse } from "src/app/response-models/guiaPagamento-response";
import { GuiaPagamentoService } from "src/app/services/guiaPagamento.service";
import { DominiosService } from "src/app/services/dominios.service";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { base64ToArrayBuffer, blobExcelSaveAs, formataCurrency, formatDatePT, openErrorsDialog, showExpiredError } from "src/app/utils";

@Component({
  standalone: false,
  selector: 'app-consultas-guias',
  templateUrl: './consultas-guias.component.html',
  styleUrls: ['./consultas-guias.component.css']
})
export class ConsultasGuiasComponent implements OnInit {  

  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public errors: string[] = [];
  public faTimesCircle = faTimesCircle;
  public faFilePdf = faFilePdf;
  
  public niss?: string;
  public estado?: number;
  public numeroGuia?: string;
  public estadoOptions: any[] = [];
  public filter: FilterRequest = {};
  public totais: any = {};
  
  public submittedTry: boolean = false;
  public resultsShown: boolean = false;

  //Region tarefa table
  public guiasList: RelatoriosGuiasListagem[] = [];
  public displayedColumns: string[] = ['numeroGuia', 'empregador', 'periodo', 'estado', 'valorGuia', 'valorCompromisso', 'pdf', 'valorDivida'];
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
    public guiaPagamentoService: GuiaPagamentoService,
    public dominiosService: DominiosService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {

    if (!this.tokenStorage.getToken()) {
      this.router.navigate(['/login'],)
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

  public getGuiasTable() {
    
    if (!this.submittedTry) this.submittedTry = true;

    this.showLoader();

    this.filter.index = this.pageIndexTable;
    this.filter.rows = this.pageSizeTable;

    const request: GetGuiasRelatoriosRequest = {
      filter: this.filter,
      niss: this.niss,
      estado: this.estado,
      numeroGuia: this.numeroGuia
    };

    if (!this.resultsShown) this.resultsShown = true;

    this.guiaPagamentoService.GetGuiasRelatorios(request).subscribe((guias) => {
      this.guiasList = guias.guias || [];
      this.totalRowsTable = guias.rows;

      this.totais.valorGuia = guias.guias.reduce((inc: number, guia: RelatoriosGuiasListagem) => inc + guia.valorGuia, 0);
      this.totais.valorComprovativo = guias.guias.reduce((inc: number, guia: RelatoriosGuiasListagem) => inc + guia.valorComprovativo, 0);
      this.totais.valorDivida = guias.guias.reduce((inc: number, guia: RelatoriosGuiasListagem) => inc + guia.valorDivida, 0);

      this.hideLoader();
    },
      err => {
        this.guiasList = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }

  public clearFilter() {
    this.numeroGuia = undefined;
    this.niss = undefined;
    this.estado = undefined;
    this.filter = {};
    this.submittedTry = false;
  }

  public openPdf(doc: string) {
    // Open PDF document in browser's new tab
    const arrayBuffer = base64ToArrayBuffer(doc);
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    window.open(URL.createObjectURL(blob));
  }

  private fetchDropdownList() {

    this.showLoader();

    this.dominiosService.GetAllTiposPagamento().subscribe(resp => {
      this.estadoOptions = resp.dominios;
      this.hideLoader();
    },
    err => {
      this.hideLoader();
      err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
    });
  }

  public updateGuiasTable(event: any) {
    this.pageIndexTable = event.pageIndex;
    this.pageSizeTable = event.pageSize;
    this.showLoader();
    this.getGuiasTable();
  }
  

  public formatDatePT(date: Date) {
    return formatDatePT(this.datePipe, date);
  }

  public formataCurrency(amount: number) {
    return formataCurrency(amount);
  }
  
}
