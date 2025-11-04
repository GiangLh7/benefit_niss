import { Component, Inject } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TokenStorageService } from '../../services/token-storage.service';
import { DialogComponent } from '../../componentes/dialog/dialog.component';
import { base64ArrayBuffer, RegexPatterns, SelectsWDisable } from "../../utils";
import { DocumentoService } from "../../services/documento.service";
import { Documento } from "../../models/documento";
import { FormControl, Validators } from "@angular/forms";
import { MaxSizeValidator } from '../../utils/file-validators';
import { MyErrorStateMatcher } from "../../matcher";
import { TranslateService } from "@ngx-translate/core";

export interface PopUpAdicionarEditarDocumentoData {
  documento: Documento;
  editar: boolean;
  adicionar: boolean;
  tiposDocumento: SelectsWDisable[];
  passPortId: number;
  cartaoEleitoral: number;
}

@Component({
  standalone: false,
  selector: 'app-popUp-adicionar-editar-documento',
  templateUrl: 'pop-up-adicionar-editar-documento.component.html',
  styleUrls: ['./pop-up-adicionar-editar-documento.component.css']
})
export class PopUpAdicionarEditarDocumentoComponent {
  public availableRegex = RegexPatterns;
  public fileControl: FormControl;
  public faTimesCircle = faTimesCircle;
  public errors: string[] = [];
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public submittedTry: boolean = false;
  public accept = ".pdf";
  public isPassaporte = false;
  private maxSize: number = 52428800;
  public documentPlaceholder: string = "general.document";
  public wrongFormat = false;


  constructor(
    public documentoService: DocumentoService,
    public spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    private tokenStorage: TokenStorageService,
    public translate: TranslateService,
    public dialogRef: MatDialogRef<PopUpAdicionarEditarDocumentoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PopUpAdicionarEditarDocumentoData
  ) {
    this.fileControl = new FormControl(this.data.documento.documento, []);
  }

  ngOnInit(): void {
    if(this.data.documento.nomeDocumento)
      this.documentPlaceholder = this.data.documento.nomeDocumento;

    this.fileControl.valueChanges.subscribe((file: any) => {
      if(file)
        if(this.maxSize >= file.size && file.type == 'application/pdf')
        {
          var reader = new FileReader();
          reader.readAsArrayBuffer(file);
          this.data.documento.nomeDocumento = file.name;
          reader.onloadend = (evt) => {
            this.addDocumentoRequired();
            if (evt.target)
              if (evt.target.readyState == FileReader.DONE) {
                var arrayBuffer = evt.target.result;
                if(arrayBuffer instanceof ArrayBuffer)
                  this.data.documento.documento = base64ArrayBuffer(arrayBuffer);
              }
          }
        }
        else {
          this.wrongFormat = true;
          this.data.documento.nomeDocumento = <string>{};
          this.fileControl.setValue(undefined);
        }
    });
    this.updateIsPassaporte();
  }

  public closePopUp(): void {
    this.dialogRef.close();
  }

  public submit(): void {
    this.submittedTry = true;
  }

  public saveDocumento() {
    this.showLoader();

    if(!(this.data.documento.nomeDocumento.length > 0) && this.data.documento.documento)
      this.data.documento.nomeDocumento = this.documentPlaceholder;

    let request = {
      documento: this.data.documento
    }
    if (!request.documento.idDocumento) {
      this.documentoService.saveDocumento(request).subscribe(x => {
        this.dialogRef.close(true);
      },
        err => {
          err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.showError();
        });
    }
    else {
      this.documentoService.updateDocumento(request).subscribe(x => {
        this.dialogRef.close(true);
      },
        err => {
          err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.showError();
        });
    }
  }

  public showLoader() {
    this.spinner.show();
  }


  public hideLoader() {
    this.spinner.hide();
  }

  public showError() {
    this.hideLoader();
    const dialogRef = this.errorDialog.open(DialogComponent, {
      id: 'dialog',
      minHeight: '300px',
      width: '80%',
      height: '60%',
      data: { errors: this.errors }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }

  public clearLocalEmissao() {
    this.data.documento.localEmissao = '';
  }

  public clearDocumentNumber() {
    this.data.documento.numero = '';
  }

  public updateIsPassaporte()
  {
    this.isPassaporte = this.data.documento.tpDocIdentificacao == this.data.passPortId;
  }

  public addDocumentoRequired()
  {
    this.fileControl.get('Documento')?.setValidators([Validators.required, MaxSizeValidator.maxContentSize(this.maxSize)]);
  }
}
