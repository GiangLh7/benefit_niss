import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { faFilePdf, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { Documento } from 'src/app/models/documento';
import { PopUpWarningComponent } from 'src/app/componentes/pop-up-warning/pop-up-warning.component';
import { DocumentosListagemRequest } from 'src/app/request-models/documentos-request';
import { FilterRequest } from 'src/app/request-models/utils-request';
import { TarefaDocumentoListagem } from 'src/app/response-models/documentos-response';
import { DocumentoService } from 'src/app/services/documento.service';
import { base64ToArrayBuffer, formatDatePT, openErrorsDialog, openSnackBar } from 'src/app/utils';

@Component({
  selector: 'app-componente-list-documentos',
  templateUrl: './componente-list-documentos.component.html',
  styleUrls: ['./componente-list-documentos.component.css']
})
export class ComponenteListDocumentosComponent implements OnInit {

  @Input() isExpanded: boolean = false;
  @Input() tarefaActivoId: number = 0;
  @Input() processoId: number = 0;
  @Input() refreshTable: boolean = false;
  @Input() readOnly: boolean = false;
  @Output() tableIsRefreshed = new EventEmitter<boolean>();
  public errors: string[] = [];
  public faTimesCircle = faTimesCircle;
  public faFilePdf = faFilePdf;

  public documentos: TarefaDocumentoListagem[] = [];
  public displayedColumnsDocumento: string[] = ['tipo', 'dataInsert', 'tarefa', 'user', 'pdf'];
  public pageSizeDocumentosTable: number = 20;
  public totalRowsDocumentosTable: number = 0;
  public pageIndexDocumentosTable: number = 0;
  private documentoWarningMsg = 'warnings.warningDeleteDocument';

  constructor(
    public translate: TranslateService,
    public errorDialog: MatDialog,
    public warningDialog: MatDialog,
    private documentoService: DocumentoService,
    private spinner: NgxSpinnerService,
    public snackBar: MatSnackBar,
    private datepipe: DatePipe,
  ) { }

  ngOnInit(): void {
    if (!this.readOnly) this.displayedColumnsDocumento.push('verEditar');
    this.getTableDocumentos().subscribe(x => {
      x.rows == null ? this.totalRowsDocumentosTable = 0 : this.totalRowsDocumentosTable = x.rows;
      x.documentos == null ? this.documentos = [] : this.documentos = x.documentos;
    },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      }
    );
  }

  ngOnChanges(changes: SimpleChanges) {
        
    if(changes.refreshTable.currentValue == true) {
      this.spinner.show();
      this.getTableDocumentos().subscribe(x => {
        x.rows == null ? this.totalRowsDocumentosTable = 0 : this.totalRowsDocumentosTable = x.rows;
        x.documentos == null ? this.documentos = [] : this.documentos = x.documentos;
        this.spinner.hide();
      },
        err => {
          this.spinner.hide();
          err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.showError();
        }
      );
      this.refreshTable = false;
      this.tableIsRefreshed.emit(true);
    }
}

  public getTableDocumentos(): Observable<any> {
    let request: DocumentosListagemRequest;
    let filter: FilterRequest;
    filter = {};
    filter.index = this.pageIndexDocumentosTable;
    filter.rows = this.pageSizeDocumentosTable;
    request = { "id": this.tarefaActivoId || this.processoId, "filter": filter };

    return this.tarefaActivoId ? this.documentoService.getDocumentosByIdTarefaAtivo(request) : this.documentoService.getDocumentosByIdProcessoAtivo(request);
  }

  public updateDocumentosTable(event: any) {
    this.pageIndexDocumentosTable = event.pageIndex;
    this.pageSizeDocumentosTable = event.pageSize;
    this.getTableDocumentos().subscribe(x => {
      x.rows == null ? this.totalRowsDocumentosTable = 0 : this.totalRowsDocumentosTable = x.rows;
      x.documentos == null ? this.documentos = [] : this.documentos = x.documentos;
    },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      }
    );
  }

  public deleteDocumento(doc: Documento) {
    const dialogRef = this.warningDialog.open(PopUpWarningComponent, {
      id: 'deleteDocumentoDialog',
      minHeight: '300px',
      width: '40%',
      height: '30%',
      panelClass: 'warningModal',
      data: { function: this.documentoService.deleteDocumentoComponente({ id: doc.idDocumento }), msg:  this.translate.instant(this.documentoWarningMsg) }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTableDocumentos().subscribe(x => {
          x.rows == null ? this.totalRowsDocumentosTable = 0 : this.totalRowsDocumentosTable = x.rows;
          x.documentos == null ? this.documentos = [] : this.documentos = x.documentos;
          openSnackBar(this.translate.instant('snackBar.deleteDocumento'), this.snackBar);
        },
          err => {
            err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
            this.showError();
          }
        );
      }
    });
  }

  public openPdf(doc: Documento) {
    // Open PDF document in browser's new tab
    const arrayBuffer = base64ToArrayBuffer(doc.documento);
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    window.open(URL.createObjectURL(blob));
  }

  public formatDate(date: Date): string {
    return formatDatePT(this.datepipe, date);
  }

  public showError() {
    const dialogRef = openErrorsDialog(this.errors, this.errorDialog);

    dialogRef.afterClosed().subscribe(() => {
      this.errors = [];
    });
  }

  public scroll(e: any)
  {
    e._body.nativeElement.scrollIntoView({behavior: "smooth", block: "center"});
  }
}
