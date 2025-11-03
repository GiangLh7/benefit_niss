import { Component, Inject } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import { faFilePdf, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from "@ngx-translate/core";
import { openErrorsDialog, formatDatePT, focusCurrency, showExpiredError, base64ToArrayBuffer } from "src/app/utils";
import { DesfazerConciliacaoRequest, FiltroConciliado, MovimentosAConciliarConciliacaoFilterRequest, MovimentosAConciliarFilterRequest, MovimentosAConciliarListagemRequest, MovimentosBancariosConciliacaoFilterRequest, MovimentosDespesaReceitaUpsertRequest } from "src/app/request-models/movimentosBancarios-request";
import { movimentosBancariosService } from "src/app/services/movimentosBancarios.service";
import { MyErrorStateMatcher, MyNumberDifferentStateMatcher } from "src/app/matcher";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { Router } from "@angular/router";
import { DatePipe, NgIf } from "@angular/common";
import { FilterRequest } from "src/app/request-models/utils-request";
import { MovimentosDespesaReceita, MovimentosPorConciliarListagemType } from "src/app/models/movimentosDespesaReceita";
import { ThrowStmt } from "@angular/compiler";
import { environment } from "src/environments/environment";
import jsPDF from "jspdf";

export interface PopUpMovimentosDesfazerConciliacaoComponentData {
  tarefaAtivoId: number;
}

export function gerarPDF(element: MovimentosDespesaReceita, translate: TranslateService) {
  var pdf = new jsPDF();
  // INSS logo
  pdf.addImage(environment.ssIcon, 'JPEG', 90, 5, 25, 20);

  //title
  pdf.text(translate.instant('general.guiaDePagamento'), 83, 35);
  pdf.setFontSize(12);
  pdf.setTextColor(99);

  //Número do Documento
  pdf.text(translate.instant('guiasPagamento.numeroGuia') + ': ' + element.numeroDocumento, 75, 45);

  //datas
  // pdf.text('Data de Emissão: ' + this.formatDatePT(new Date), 20, 55);
  // pdf.text('Data Limite de Pagamento: ' + this.formatDatePT(this.dataLimitePagamento), 120, 55);

  var body = [[element.descricao.descricao, `${element.valor}$`]];

  (pdf as any).autoTable({
    startY: 55,
    columnStyles: { europe: { halign: 'center' } },
    head: [[translate.instant('general.descricao'), translate.instant('general.valor')]],
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

@Component({
  selector: 'app-pop-up-movimentos-desfazer-conciliacao',
  templateUrl: './index.html',
  styleUrls: ['./styles.css']
})
export class PopUpMovimentosDesfazerConciliacaoComponent {

  public faTimesCircle = faTimesCircle;
  public errors: string[] = [];
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public submittedTry: boolean = false;
  public faFilePdf = faFilePdf;

  public fromTable: number = 0;
  public selectedItem?: number = undefined;
  public selectedItemType?: MovimentosPorConciliarListagemType = undefined;
  public filter: FilterRequest = {};

  // tabela movimentos bancários
  // public filterMB: FilterRequest = {};
  public movimentosBancarios: any[] = [];
  public displayedColumnsMB: string[] = ['descricao', 'dataValor', 'credito', 'debito', 'acoes'];
  public totalRowsTableMB: number = 0;
  public pageSizeTableMB = 20;
  public pageIndexTableMB = 0;

  // tabela movimentos a conciliar
  // public filterMC: FilterRequest = {};
  public movimentosPorConciliar: any[] = [];
  public displayedColumnsMC: string[] = ['descricao', 'documento', 'comprovativo', 'numeroPagamento', 'valor', 'acoes'];
  public totalRowsTableMC: number = 0;
  public pageSizeTableMC = 20;
  public pageIndexTableMC = 0;


  constructor(
    private router: Router,
    public movimentosBancariosService: movimentosBancariosService,
    public spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    private tokenStorage: TokenStorageService,
    public translate: TranslateService,
    public dialogRef: MatDialogRef<PopUpMovimentosDesfazerConciliacaoComponent>,
    private datepipe: DatePipe,

    @Inject(MAT_DIALOG_DATA) public data: PopUpMovimentosDesfazerConciliacaoComponentData
  ) {
    if (!this.tokenStorage.getToken()) {
      this.router.navigate([''])
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired()) {

    }
    else {
      showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
    }
  }

  public gerarPDF(element: MovimentosDespesaReceita): void {
    gerarPDF(element, this.translate);
  }

  public closePopUp(): void {
    this.dialogRef.close();
  }

  public saveConciliacao() {

    if (!this.selectedItem) return;

    let request : DesfazerConciliacaoRequest = {
      id: this.selectedItem!,
      tarefaAtivoId: this.data.tarefaAtivoId
    };

    if (this.selectedItemType) request.type = this.selectedItemType;

    this.movimentosBancariosService.DesfazerConciliacao(request).subscribe(x => {
      this.dialogRef.close(true);
      this.hideLoader();
    },
    err => {
      this.hideLoader();
      err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
    });

  }

  private getMovimentosBancarios() {

    this.filter.index = this.pageIndexTableMB;
    this.filter.rows = this.pageSizeTableMB;

    const request: MovimentosBancariosConciliacaoFilterRequest = {
      filter: this.filter,
      tarefaAtivoId: this.data.tarefaAtivoId,
      conciliadoCom: this.fromTable == 2 && this.selectedItem ? this.selectedItem : undefined,
      conciliadoComType: this.fromTable == 2 && this.selectedItem ? this.selectedItemType : undefined
    };

    var processos = this.movimentosBancariosService.ListMovimentosBancariosConciliacao(request);

    this.movimentosBancarios = [];

    processos.subscribe((processos) => {
      this.totalRowsTableMB = processos.rows || 0;
      this.movimentosBancarios = processos.movimentos || [];
    },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      }, () => {
        this.hideLoader();
      });

  }

  private getMovimentosAConciliar() {

    this.filter.index = this.pageIndexTableMC;
    this.filter.rows = this.pageSizeTableMC;

    const request: MovimentosAConciliarConciliacaoFilterRequest = {
      filter: this.filter,
      tarefaAtivoId: this.data.tarefaAtivoId,
      conciliadoCom: this.fromTable == 1 && this.selectedItem ? this.selectedItem : undefined
    };

    var processos = this.movimentosBancariosService.ListMovimentoDespesaReceitaConciliacao(request);

    this.movimentosPorConciliar = [];

    processos.subscribe((processos) => {
      this.totalRowsTableMC = processos.rows || 0;
      this.movimentosPorConciliar = processos.movimentos || [];
    },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      }, () => {
        this.hideLoader();
      });

  }

  public openPdf(doc: string) {
    // Open PDF document in browser's new tab
    const arrayBuffer = base64ToArrayBuffer(doc);
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    window.open(URL.createObjectURL(blob));
  }


  public submitConciliacao()
  {
    this.submittedTry = true;
  }

  public showLoader() {
    this.spinner.show();
  }


  public hideLoader() {
    this.spinner.hide();
  }

  public showError()
  {
    const dialogRef = openErrorsDialog(this.errors, this.errorDialog);
    this.hideLoader();

    dialogRef.afterClosed().subscribe((result: any) => {
      this.errors = [];
    });
  }

  public formatDatePT(date: Date): string {
    return formatDatePT(this.datepipe, date);
  }

  public updateMovimentosBancariosTable(event: any) {
    this.pageIndexTableMB = event.pageIndex;
    this.pageSizeTableMB = event.pageSize;
    this.showLoader();
    this.getMovimentosBancarios();
  }

  public updateMovimentosPorConciliarTable(event: any) {
    this.pageIndexTableMB = event.pageIndex;
    this.pageSizeTableMB = event.pageSize;
    this.showLoader();
    this.getMovimentosAConciliar();
  }

  public updateSelected(element: any) {

    this.selectedItem = element.id == this.selectedItem ? undefined : element.id;

    this.selectedItemType = !this.selectedItem || this.fromTable == 1 ? undefined : element.type;

    if (!this.selectedItem) return;

    if (this.fromTable == 1) {
      this.showLoader();
      this.getMovimentosAConciliar();
    }
    else {
      this.showLoader();
      this.getMovimentosBancarios();
    }
  }

  public search(event: Event) {
    event.preventDefault();
    this.showLoader();
    if (this.fromTable == 1) this.getMovimentosBancarios();
    else this.getMovimentosAConciliar();
  }

  public alterarDirection(fromTable: number) {
    if (this.fromTable == fromTable) return;

    this.selectedItem = undefined;
    this.fromTable = fromTable;

    this.clearFilter();
    // if (fromTable == 1) this.getMovimentosBancarios();
    // else this.getMovimentosAConciliar();
  }

  public clearFilter(): void {
    if (this.fromTable == 1) {
      this.pageSizeTableMC = 20;
      this.pageIndexTableMC = 0;
    }
    else {
      this.pageSizeTableMB = 20;
      this.pageIndexTableMB = 0;
    }
    this.filter = {};

    this.showLoader();
    if (this.fromTable == 1) this.getMovimentosBancarios();
    else this.getMovimentosAConciliar();
  }

}
