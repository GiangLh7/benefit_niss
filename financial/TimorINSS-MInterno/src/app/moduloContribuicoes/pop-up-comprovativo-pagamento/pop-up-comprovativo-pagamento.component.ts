import { Component, Inject } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { DialogComponent } from '../../componentes/dialog/dialog.component';
import { base64ArrayBuffer, base64ToArrayBuffer, blobToSaveAs, customCurrencyMaskConfig, focusCurrency, RegexPatterns, SelectsWDisable } from "../../utils";
import { FormControl, Validators } from "@angular/forms";
import { MaxSizeValidator } from '../../utils/file-validators';
import { MyErrorStateMatcher } from "../../matcher";
import { TranslateService } from "@ngx-translate/core";
import { GuiaPagamentoService } from "../../services/guiaPagamento.service";
import { insertComprovativoPagamentoRequest, useCreditInGuiaPagamentoRequest,GetGuiasDetailsRequest ,approveComprovativoPagamentoRequest} from "../../request-models/guiaPagamento-request";
import { FilterRequest } from "../../request-models/utils-request";
import { GuiaListagem } from "../../response-models/guiaPagamento-response";

export interface PopUpComprovativoPagamentoData {
  data: { valor: number, data: Date, file: string, guiaId: number, entidadeId: number, bankCode: string };
  view: boolean;
  adicionar: boolean;
  avaliableCredit?: number;
}



@Component({
  standalone: false,
  selector: 'app-pop-up-comprovativo-pagamento',
  templateUrl: 'pop-up-comprovativo-pagamento.component.html',
  styleUrls: ['./pop-up-comprovativo-pagamento.component.css']
})
export class PopUpComprovativoPagamentoComponent {
  private filter: FilterRequest = {};
  public fileControl: FormControl;
  public faTimesCircle = faTimesCircle;
  public guiaDetail?: GuiaListagem;
  public errors: string[] = [];
  public selectedBanco: string = '';
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public bankOptions: { key: string; label: string }[] = [];
  public submittedTry: boolean = false;
  public wrongFormat: boolean = false;
  public accept = ".pdf";
  private maxSize: number = 52428800;
  public documentPlaceholder: string = "general.document";
  public creditRequest: useCreditInGuiaPagamentoRequest = {
    idEntidade: this.data.data.entidadeId,
    idGuia: this.data.data.guiaId
  };
   public approvePaymentRequest: approveComprovativoPagamentoRequest = {
    idEntidade: this.data.data.entidadeId,
    idGuia: this.data.data.guiaId,
    dataComprovativoPag: this.data.data.data,
    valorComprovativoPag: this.data.data.valor,
    comprovativoPag: <string>{},
    rejectReason: <string>{},
    rejectStatus: <string>{},
  }
  public insertPaymentRequest: insertComprovativoPagamentoRequest = {
    idEntidade: this.data.data.entidadeId,
    idGuia: this.data.data.guiaId,
    dataComprovativoPag: this.data.data.data,
    valorComprovativoPag: this.data.data.valor,
    comprovativoPag: <string>{},
    bankCode: this.data.data.bankCode
  }
  public pdfSrc?: any;
  public fileName = '';
  private downloadFileName = '';
  public currencyOptions = customCurrencyMaskConfig;
  public now: Date = new Date();

  constructor(
    public spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<PopUpComprovativoPagamentoComponent>,
    public guiaPagamentoService: GuiaPagamentoService,
    @Inject(MAT_DIALOG_DATA) public data: PopUpComprovativoPagamentoData
  ) {
    this.fileControl = new FormControl(this.data.data.file, []);
  }

  onBancoChange(event: any) {
  // alert('Bank selected:'+ this.selectedBanco);
  // alert('Bank selected:'+ event);
  this.data.data.bankCode = event;
  this.selectedBanco = event;
  this.insertPaymentRequest.bankCode = event;
}

ngOnInit(): void {

    let request: GetGuiasDetailsRequest;

    request = {"idGuiaPagamento": this.data.data.guiaId, filter: this.filter};
    this.showLoader();
    this.guiaPagamentoService.getGuiasDetailByEntidade(request).subscribe(x => {
        console.log(x);
        this.approvePaymentRequest.comprovativoPag = x.guias[0].comprovativoPagamento ?? '';
        this.guiaDetail = x.guias[0];
        this.pdfSrc = base64ToArrayBuffer(this.approvePaymentRequest.comprovativoPag);
        this.hideLoader();
      },
      err => {
        this.spinner.hide();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

    this.translate.get('comprovativoPagamento.comprovativo').subscribe((translated: string) => {
      this.downloadFileName = translated;
    });
    this.selectedBanco = this.data?.data?.bankCode ?? null;
    this.translate.get('guiaPagamentoListagem.lstBankCode').subscribe((res: any) => {
        this.bankOptions = Object.keys(res).map((key) => ({
          key,
          label: res[key],
        }));
      });
      
    if (this.data.data.file)
      this.pdfSrc = base64ToArrayBuffer(this.data.data.file);

    this.fileControl.valueChanges.subscribe((file: any) => {
      if (file){
        if (file.type != 'application/pdf'){
          this.wrongFormat = true;
          this.pdfSrc = undefined;
          this.fileControl.setValue(undefined);
        }
        else if (this.maxSize >= file.size) {
          var reader = new FileReader();
          reader.readAsArrayBuffer(file);
          this.fileName = file.name;
          reader.onloadend = (evt) => {
            this.addDocumentoRequired();
            if (evt.target)
              if (evt.target.readyState == FileReader.DONE) {
                var arrayBuffer = evt.target.result;
                this.pdfSrc = arrayBuffer;
                if (arrayBuffer instanceof ArrayBuffer)
                  this.insertPaymentRequest.comprovativoPag = base64ArrayBuffer(arrayBuffer);
              }
          }
        }
      }
    });
  }
  
  // ngOnInit(): void {

  //   this.translate.get('comprovativoPagamento.comprovativo').subscribe((translated: string) => {
  //     this.downloadFileName = translated;
  //   });
  //   if (this.data.data.file)
  //     this.pdfSrc = base64ToArrayBuffer(this.data.data.file);

  //   this.fileControl.valueChanges.subscribe((file: any) => {
  //     if (file){
  //       if (file.type != 'application/pdf'){
  //         this.wrongFormat = true;
  //         this.pdfSrc = undefined;
  //         this.fileControl.setValue(undefined);
  //       }
  //       else if (this.maxSize >= file.size) {
  //         var reader = new FileReader();
  //         reader.readAsArrayBuffer(file);
  //         this.fileName = file.name;
  //         reader.onloadend = (evt) => {
  //           this.addDocumentoRequired();
  //           if (evt.target)
  //             if (evt.target.readyState == FileReader.DONE) {
  //               var arrayBuffer = evt.target.result;
  //               this.pdfSrc = arrayBuffer;
  //               if (arrayBuffer instanceof ArrayBuffer)
  //                 this.insertPaymentRequest.comprovativoPag = base64ArrayBuffer(arrayBuffer);
  //             }
  //         }
  //       }
  //     }
  //   });
  // }

  public closePopUp(value: boolean = false): void {
    this.dialogRef.close(value);
  }

  public submit(): void {
    this.submittedTry = true;
    return;
  }

  public saveComprovativo(): void {
    this.showLoader();
    this.guiaPagamentoService.insertComprovativoPagamento(this.insertPaymentRequest)
      .subscribe(x => {
        this.hideLoader();
        this.closePopUp(true);
      },
        err => {
          this.hideLoader();
          err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.showError();
        });

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

  public clearValor() {
    this.data.data.valor = <number>{};
  }

  public addDocumentoRequired() {
    this.fileControl.get('Documento')?.setValidators([Validators.required, MaxSizeValidator.maxContentSize(this.maxSize)]);
  }

  public useCredit(): void {
    this.showLoader();
    this.guiaPagamentoService.useCreditInGuiaPagamento(this.creditRequest)
      .subscribe(x => {
        this.hideLoader();
        this.closePopUp(true);
      },
        err => {
          this.hideLoader();
          err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.showError();
        });
  }

  public proceedUpload(): void {
    this.data.avaliableCredit = undefined;
  }

  public downloadDocument(): void {
    // blobToSaveAs(this.data.data.file, this.downloadFileName);
    blobToSaveAs(this.approvePaymentRequest.comprovativoPag, this.downloadFileName);
  }

  public focusCurrency(event: any)
  {
    focusCurrency(event);
  }
}
