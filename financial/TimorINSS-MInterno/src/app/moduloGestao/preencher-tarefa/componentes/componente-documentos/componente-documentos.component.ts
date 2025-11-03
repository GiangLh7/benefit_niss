import { MaxSizeValidator } from '@angular-material-components/file-input';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MyErrorStateMatcher } from 'src/app/matcher';
import { Documento } from 'src/app/models/documento';
import { TarefaDocumentoRequest } from 'src/app/request-models/documentos-request';
import { GetTiposDocumentoPorTarefaAtivaRequest } from 'src/app/request-models/dominio-request';
import { DominiosComGrupos } from 'src/app/response-models/dominios-response';
import { DocumentoService } from 'src/app/services/documento.service';
import { DominiosService } from 'src/app/services/dominios.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { base64ArrayBuffer, openErrorSnackBar, openSnackBar, showExpiredError } from 'src/app/utils';

@Component({
  selector: 'app-componente-documentos',
  templateUrl: './componente-documentos.component.html',
  styleUrls: ['./componente-documentos.component.css']
})
export class ComponenteDocumentosComponent implements OnInit {

  @Input() isExpanded: boolean = false;
  @Input() tarefaActivoId: number = 0;
  @Output() refreshDocTable = new EventEmitter<boolean>();
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public wrongFormat: boolean = false;
  public documentosList: DominiosComGrupos = <DominiosComGrupos>{};
  public documento: Documento = <Documento>{};
  public fileControlDocumento: FormControl;
  private maxSize: number = 52428800;
  public accept = ".pdf";
  public faTimesCircle = faTimesCircle;
  private error = '';

  constructor(
    public translate: TranslateService,
    public _snackBar: MatSnackBar,
    private documentoService: DocumentoService,
    private dominiosService: DominiosService,
    private spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    private tokenStorage: TokenStorageService
  ) { 
    this.fileControlDocumento = new FormControl(this.documento.documento, []);
  }

  ngOnInit(): void {
    this.showLoader();
    let request: GetTiposDocumentoPorTarefaAtivaRequest = {
      tarefaAtivoId: this.tarefaActivoId
    };
    this.dominiosService.GetTiposDocumentoPorTarefaAtiva(request).subscribe(x => {
      this.hideLoader();
      this.documentosList = x.dominio;
      },
    err => {
      this.hideLoader();
      err.error?.errors ? err.error.errors.map((x : any) => this.error = x.errorCode) : this.error = '-1';
      openErrorSnackBar(this.translate.instant('error.'+ this.error), this._snackBar);
    });

    // document control
    this.fileControlDocumento.valueChanges.subscribe((file: any) => {
      if (this.maxSize >= file?.size && file.type == 'application/pdf') {
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);
        this.documento.nomeDocumento = file.name;
        reader.onloadend = (evt) => {
          this.addDocumentoRequired();
          if (evt.target)
            if (evt.target.readyState == FileReader.DONE) {
              var arrayBuffer = evt.target.result;
              if (arrayBuffer instanceof ArrayBuffer)
                this.documento.documento = base64ArrayBuffer(arrayBuffer);
            }
        }
        this.wrongFormat = false;
      }
      else if(file){
        this.wrongFormat = true;
        this.documento.nomeDocumento = <string>{};
        this.fileControlDocumento.setValue(undefined);
      }
    });
  }

  public SaveDocument(): void {
    const request: TarefaDocumentoRequest = <TarefaDocumentoRequest>{};
    request.tarefaAtivoId = this.tarefaActivoId;
    request.tipoDocumento = this.documento.tpDocIdentificacao;
    request.documento = this.documento.documento;
    request.nomeDocumento = this.documento.nomeDocumento;

    // valida se está expirado o token antes da chamada
    if (this.tokenStorage.tokenExpired()) 
    {
      showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
    }
    this.showLoader();
    // chama função
    this.documentoService.SaveTarefaDocumento(request).subscribe(() => {
          this.hideLoader();
          openSnackBar(this.translate.instant('snackBar.saveDocumento'), this._snackBar);
          this.clearDocumento();
          this.refreshDocTable.emit(true);
      },
    err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x : any) => this.error = x.errorCode) : this.error = '-1';
        openErrorSnackBar(this.translate.instant('error.'+ this.error), this._snackBar);        
      });
  }

  public changedDocType() : void {
    this.clearDocumento();
    this.clearDocumentoRequired();
    this.wrongFormat = false;
  }

  public clearDocumento() {
    this.documento.documento = "";
    this.documento.nomeDocumento = "";
    this.fileControlDocumento.setValue(undefined);
  }

  public addDocumentoRequired() {
    this.fileControlDocumento.get('Documento')?.setValidators([Validators.required, MaxSizeValidator(this.maxSize)]);
  }

  public clearDocumentoRequired() {
    this.fileControlDocumento.get('Documento')?.setValidators([]);
  }

  public showLoader() {
    this.spinner.show();
  }

  public hideLoader() {
    this.spinner.hide();
  }

  public scroll(e: any)
  {
    e._body.nativeElement.scrollIntoView({behavior: "smooth", block: "center"});
  }
}
