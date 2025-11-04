import { DatePipe, DecimalPipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { NgxSpinnerService } from "ngx-spinner";
import { PopUpWarningComponent } from "../../componentes/pop-up-warning/pop-up-warning.component";
import { GetAllGuiasStatesApproveRequest } from "../../request-models/guiaPagamento-request";
import { FilterRequest } from "../../request-models/utils-request";
import { DominioDescricaoString } from "../../response-models/dominios-response";
import { GuiaListagem } from "../../response-models/guiaPagamento-response";
import { DominiosService } from "../../services/dominios.service";
import { GuiaPagamentoService } from "../../services/guiaPagamento.service";
import { TokenStorageService } from "../../services/token-storage.service";
import { formatDate, formatDatePT, formatDecimal, openErrorsDialog } from "../../utils";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
import { environment } from "src/environments/environment";
import { ReservaCreditoListagemRequest } from "../../request-models/reservaCredito-request";
import { ReservaCreditoService } from "../../services/reservaCredito.service";
// import * as QRCode from 'qrcode';
import { MatSelectChange } from "@angular/material/select";
import { PopUpHandleInvoiceComponent } from "../pop-up-handle-invoice/pop-up-handle-invoice.component";
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-modulo-contrib-validator',
  templateUrl: './modulo-contribuicoes-validation-main-search.html',
  styleUrls: ['./modulo-contribuicoes-validation-main-search.css'],
  standalone: false
})
export class ContribValidationHomeSearchComponent implements OnInit {

  public isLoggedIn = false;
  public faTimesCircle = faTimesCircle;
  public entidadeId: number = 0;
  public fromDate?: Date;
  public toDate?: Date;
  public bankCode?: string = '';
  public filterBy = '';
  public niss = '';
  public paymentRef = '';
  public filterField?: string = undefined;
  public errors: string[] = [];
  public errorMessage = "";
  private filter: FilterRequest = {};
  //Region Guia Pagamento table
  public dataSourceGuiaPagamento: GuiaListagem[] = [];
  public displayedColumnsGuiaPagamento: string[] = ['niss', 'invNo', 'bankCode', 'mesAno', 'dataCriacao','descricao', 'total', 'dtValidade', 'tipo', 'valorPago', 'estadoPagamento', 'actions'];
  public totalRows: number = 0;
  public pageSize = 10;
  public pageIndex = 0;
  public guiaTipoOptions: DominioDescricaoString[] = [];
  public pagamentoTipoOptions: { key: string; label: string }[] = [];
  public bankOptions: { key: string; label: string }[] = [];
  public tipoOption?: number = undefined;
  public situacaoOption?: number = undefined;
  public credit?: number;

  constructor(
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private datepipe: DatePipe,
    public errorDialog: MatDialog,
    public translate: TranslateService,
    public comprovativoDialog: MatDialog,
    public guiaPagamentoService: GuiaPagamentoService,
    public _snackBar: MatSnackBar,
    public decimalPipe: DecimalPipe,
    public dominiosService: DominiosService,
    private reservaCreditoService: ReservaCreditoService,
  ) {
  }

  public ngOnInit(): void {

    if (!this.tokenStorageService.getToken()) {
      this.router.navigate(['']);
    } else if (this.tokenStorageService.getToken() && this.tokenStorageService.tokenExpired()) {
      this.translate.get('error.expired').subscribe((translated: string) => {
        const dialogRef = this.errorDialog.open(PopUpWarningComponent, {
          id: 'desvincularDialog',
          minHeight: '300px',
          width: '40%',
          height: '30%',
          panelClass: 'warningModal',
          data: { msg: translated, noGenericMsg: true }
        });
        dialogRef.afterClosed().subscribe(() => {
          this.tokenStorageService.signOut();
          window.location.reload();
        });
      });
    } else {
      this.spinner.show();
      this.isLoggedIn = true;
      let idEntidade = this.tokenStorageService.getUser()?.idEntidade;
      this.translate.get('dropdownDominio.INDPAGO').subscribe((res: any) => {
        this.pagamentoTipoOptions = Object.keys(res).map((key) => ({
          key,
          label: res[key],
        }));
      });
      this.translate.get('guiaPagamentoListagem.bankCode').subscribe((res: any) => {
        this.bankOptions = Object.keys(res).map((key) => ({
          key,
          label: res[key],
        }));
      });

      if (idEntidade != null) {
        this.entidadeId = idEntidade;
        this.getTableGuiaPagamento();
      }
    }
  }

  public getTableGuiaPagamento(filterType?: string, isDate?: boolean) {
    this.spinner.show();
    this.dataSourceGuiaPagamento = [];

    if (this.fromDate != null) {
      this.filter.dateFilterBegin = this.fromDate;
    }
    if (this.toDate != null) {
      this.filter.dateFilterEnd = this.toDate;
    }
    if (this.bankCode != null) {
      this.filter.bankCode = this.bankCode;
    }


    if (this.niss != null) {
      this.filter.niss = this.niss;
    }

    if (this.paymentRef != null) {
      this.filter.paymentRef = this.paymentRef;
    }

    if (!isDate) {
      if (this.filter.filterField != null && this.filterField != filterType) {
        this.filter.filter = {
          filterBy: this.filterBy,
          filterField: this.filterField
        }
      } else {
        this.filter.filterBy = this.filterBy;
        this.filter.filterField = this.filterField;
      }
    }

    this.filter.index = this.pageIndex;
    this.filter.rows = this.pageSize;

    let request: GetAllGuiasStatesApproveRequest;

    request = {
      "idEntidade": this.entidadeId,
      "niss": this.niss, "paymentRef": this.paymentRef, "bankCode": this.bankCode?? '', "filter": this.filter,

    };

    this.guiaPagamentoService.getAllGuiasByEntidade(request).subscribe(x => {
      x.rows == null ? this.totalRows = 0 : this.totalRows = x.rows;
      x.guias == null ? this.dataSourceGuiaPagamento = [] : this.dataSourceGuiaPagamento = x.guias;
      this.spinner.hide();
    },
      err => {
        this.dataSourceGuiaPagamento = [];
        this.spinner.hide();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public showError() {
    const dialogRef = openErrorsDialog(this.errors, this.errorDialog);

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }

  public formatDecimal(number: number) {
    return formatDecimal(this.decimalPipe, number);
  }

  public formatDate(date: Date): string {
    return formatDate(this.datepipe, date);
  }

  public formatDatePT(date: Date): string {
    return formatDatePT(this.datepipe, date);
  }

  public dateUpdated() {
    console.log('dateUpdated');
    this.getTableGuiaPagamento(undefined, true);
  }

  public onBancoSelected(event: MatSelectChange) {
    //filter by bankcode
    // alert("bank selected:"+ event.value);
    this.bankCode = event.value;
    this.getTableGuiaPagamento();
  }

  public updateTable(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getTableGuiaPagamento();
  }

  public applyTipoFilter(filter: string) {
    this.filterField = 'Tipo';
    this.filterBy = filter;
    this.pageSize = 10;
    this.pageIndex = 0;
    this.getTableGuiaPagamento('Tipo');
  }

  public applyPagamentoFilter(filter: string) {
    this.filterField = 'Estado';
    this.filterBy = filter;
    this.pageSize = 10;
    this.pageIndex = 0;
    this.getTableGuiaPagamento('Estado');
  }

  public clearFilterPagamento() {
    this.filter = {};
    this.filterBy = '';
    this.filterField = undefined;
    this.pageSize = 10;
    this.pageIndex = 0;
    this.tipoOption = undefined;
    this.situacaoOption = undefined;
    this.fromDate = undefined;
    this.toDate = undefined;
    this.bankCode = undefined;
    this.getTableGuiaPagamento();
  }

  public gerarPDF(element: any) {
        var pdf = new jsPDF();
        // INSS logo
        pdf.addImage(environment.ssIcon, 'JPEG', 90, 5, 25, 20);

        const pageWidth = 210; // Chiều rộng trang A4 tính bằng mm

        //title
        pdf.setFontSize(13);
        pdf.setTextColor(80);
        pdf.text(this.translate.instant('general.invoiceTitleDoc'), 60, 35);
        pdf.setFontSize(11);
        pdf.setTextColor(10);
        //Número do Documento
        pdf.text(this.translate.instant('general.invoicePaymentRef') + ': ' + element.paymentRef, 20, 45);
        pdf.text(this.translate.instant('general.period') + ': ' + this.formatDate(element.mesAno), 160, 45);
        pdf.text(this.translate.instant('general.invoiceEm'), 20, 52);
        pdf.text(this.translate.instant('general.invoiceName') + ': ' + element.userName, 20, 59);
        pdf.text(this.translate.instant('general.invoiceDate') + ': ' + this.formatDatePT(element.dataCriacao), 160, 59);
        pdf.text(this.translate.instant('general.invoiceNISS') + ': ' + element.niss, 20, 66);
        pdf.text(this.translate.instant('general.invoiceTIN') + ': ' + element.tin, 20, 73);
        pdf.text(this.translate.instant('general.invoicePM') + ':', 20, 80);
        pdf.addImage(environment.checkBoxIcon, 'JPEG', 20, 83, 5, 5);
        pdf.text(this.translate.instant('general.invoiceCash'), 30, 87);
        pdf.addImage(environment.checkBoxIcon, 'JPEG', 20, 90, 5, 5);
        pdf.text(this.translate.instant('general.invoiceBT'), 30, 94);

        pdf.text(this.translate.instant('general.invoiceIP'), 20, 101);
        pdf.text(this.translate.instant('general.invoiceBank') + ':', 20, 108);
        pdf.text(this.translate.instant('general.invoiceNOT'), 20, 115);
        pdf.text(this.translate.instant('general.invoiceCCATP'), 20, 122);

        var text1 = this.translate.instant('general.invoiceCFT') + ':';
        var text2 = (element.total).toFixed(2);
        var text3 = this.translate.instant('general.invoiceUSD');
        // Tính toán chiều rộng của văn bản
        var textWidth1 = pdf.getTextWidth(text1);
        var textWidth2 = pdf.getTextWidth(text2);
        var textWidth3 = pdf.getTextWidth(text3);

        // Tính toán vị trí căn lề phải
        var rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái

        var rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
        var rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái

        pdf.text(this.translate.instant('general.invoiceCFT') + ':', rightAlignX1, 129);
        pdf.text((element.valor).toFixed(2), rightAlignX2, 129);
        pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 129);

        text1 = this.translate.instant('general.invoiceEEC') + ':';
        text2 = (element.valor - (element.total * 0.4)).toFixed(2);

        // Tính toán chiều rộng của văn bản
        textWidth1 = pdf.getTextWidth(text1);
        textWidth2 = pdf.getTextWidth(text2);
        // Tính toán vị trí căn lề phải
        rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
        rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
        rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái

        pdf.text(this.translate.instant('general.invoiceEEC') + ':', rightAlignX1, 136);
        pdf.text((element.valor - (element.total * 0.4)).toFixed(2), rightAlignX2, 136);
        pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 136);


        text1 = this.translate.instant('general.invoiceTCO') + ':';
        text2 = (element.total * 0.4).toFixed(2);

        // Tính toán chiều rộng của văn bản
        textWidth1 = pdf.getTextWidth(text1);
        textWidth2 = pdf.getTextWidth(text2);
        // Tính toán vị trí căn lề phải
        rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
        rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
        rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái

        pdf.text(this.translate.instant('general.invoiceTCO') + ':', rightAlignX1, 143);
        pdf.text((element.total * 0.4).toFixed(2), rightAlignX2, 143);
        pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 143);


        text1 = this.translate.instant('general.invoiceOPA') + ':';
        text2 = '0';

        // Tính toán chiều rộng của văn bản
        textWidth1 = pdf.getTextWidth(text1);
        textWidth2 = pdf.getTextWidth(text2);
        // Tính toán vị trí căn lề phải
        rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
        rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
        rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái

        pdf.text(this.translate.instant('general.invoiceOPA') + ':', rightAlignX1 - 7.5, 150);
        pdf.text('0', rightAlignX2, 150);
        pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 150);

        text1 = this.translate.instant('general.invoiceINCLUDING')
        textWidth1 = pdf.getTextWidth(text1);
        rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
        pdf.text(this.translate.instant('general.invoiceINCLUDING'), rightAlignX1 - 7.5, 157);

        text1 = this.translate.instant('general.invoiceLPI') + ':';
        text2 = '0';

        // Tính toán chiều rộng của văn bản
        textWidth1 = pdf.getTextWidth(text1);
        textWidth2 = pdf.getTextWidth(text2);
        // Tính toán vị trí căn lề phải
        rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
        rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
        rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái


        pdf.text(this.translate.instant('general.invoiceLPI') + ':', rightAlignX1 - 7.5, 164);
        pdf.text('0', rightAlignX2, 164);
        pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 164);


        text1 = this.translate.instant('general.invoiceFines') + ':';
        text2 = (element.juros).toFixed(2);

        // Tính toán chiều rộng của văn bản
        textWidth1 = pdf.getTextWidth(text1);
        textWidth2 = pdf.getTextWidth(text2);
        // Tính toán vị trí căn lề phải
        rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
        rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
        
        rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái



        pdf.text(this.translate.instant('general.invoiceFines') + ':', rightAlignX1 - 7.5, 171);
        pdf.text((element.juros).toFixed(2), rightAlignX2, 171);
        pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 171);


        text1 = this.translate.instant('general.invoiceOthers') + ':';
        text2 = '0';

        // Tính toán chiều rộng của văn bản
        textWidth1 = pdf.getTextWidth(text1);
        textWidth2 = pdf.getTextWidth(text2);
        // Tính toán vị trí căn lề phải
        rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
        rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
        rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái

        pdf.text(this.translate.instant('general.invoiceOthers') + ':', rightAlignX1 - 7.5, 178);
        pdf.text('0', rightAlignX2, 178);
        pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 178);

        text1 = this.translate.instant('general.invoiceTotal') + ':';
        text2 = (element.total).toFixed(2);

        // Tính toán chiều rộng của văn bản
        textWidth1 = pdf.getTextWidth(text1);
        textWidth2 = pdf.getTextWidth(text2);
        // Tính toán vị trí căn lề phải
        rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
        rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
        rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái

        pdf.text(this.translate.instant('general.invoiceTotal') + ':', rightAlignX1, 185);
        pdf.text((element.total ).toFixed(2), rightAlignX2, 185);
        pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 185);


        text1 = this.translate.instant('general.invoiceROP') + ':';
        text2 = '0';

        // Tính toán chiều rộng của văn bản
        textWidth1 = pdf.getTextWidth(text1);
        textWidth2 = pdf.getTextWidth(text2);
        // Tính toán vị trí căn lề phải
        rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
        rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
        rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái

        pdf.text(this.translate.instant('general.invoiceROP') + ':', rightAlignX1 - 7.5, 192);
        pdf.text('0', rightAlignX2, 192);
        pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 192);

        text1 = this.translate.instant('general.invoiceCCON') + ':';
        text2 = '0';

        // Tính toán chiều rộng của văn bản
        textWidth1 = pdf.getTextWidth(text1);
        textWidth2 = pdf.getTextWidth(text2);
        // Tính toán vị trí căn lề phải
        rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
        rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
        rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái

        pdf.text(this.translate.instant('general.invoiceCCON') + ':', rightAlignX1 - 7.5, 199);
        pdf.text('0', rightAlignX2, 199);
        pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 199);


        text1 = this.translate.instant('general.invoiceTTA') + ':';
        
        text2 = (element.total).toFixed(2);

        // Tính toán chiều rộng của văn bản
        textWidth1 = pdf.getTextWidth(text1);
        textWidth2 = pdf.getTextWidth(text2);
        // Tính toán vị trí căn lề phải
        rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
        rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
        rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái

        pdf.text(this.translate.instant('general.invoiceTTA') + ':', rightAlignX1 - 7.5, 206);
        // pdf.text('0', rightAlignX2, 206);
        pdf.text((element.total ).toFixed(2), rightAlignX2, 206);
        pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 206);

        text1 = this.translate.instant('general.invoiceAPEE') + ':';
        text2 = (element.total * 0.6).toFixed(2);

        // Tính toán chiều rộng của văn bản
        textWidth1 = pdf.getTextWidth(text1);
        textWidth2 = pdf.getTextWidth(text2);
        // Tính toán vị trí căn lề phải
        rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
        rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
        rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái

        pdf.text(this.translate.instant('general.invoiceAPEE') + ':', rightAlignX1, 213);
        pdf.text((element.total * 0.6).toFixed(2), rightAlignX2, 213);
        pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 213);


        text1 = this.translate.instant('general.invoiceATCO') + ':';
        text2 = (element.total * 0.4).toFixed(2);

        // Tính toán chiều rộng của văn bản
        textWidth1 = pdf.getTextWidth(text1);
        textWidth2 = pdf.getTextWidth(text2);
        // Tính toán vị trí căn lề phải
        rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
        rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
        rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái


        pdf.text(this.translate.instant('general.invoiceATCO') + ':', rightAlignX1, 220);
        pdf.text((element.total * 0.4).toFixed(2), rightAlignX2, 220);
        pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 220);

        pdf.text(this.translate.instant('general.invoiceSSS'), 83, 230);

       

        pdf.text(this.formatDatePT(element.dataCriacao), 25, 265);
         pdf.text(this.translate.instant('general.invoiceDate'), 30, 270);
         
        pdf.addImage(environment.signatureIcon, 'JPEG',  165, 245,25, 20);
        pdf.text(this.translate.instant('general.invoiceSAS'), 160, 270);

        QRCode.toDataURL(element.qrInvoice)
            .then((url:string) => {
                // Chèn mã QR vào file PDF

                pdf.addImage(url, 'JPEG', 95, 275, 20, 20);

            })
            .catch((err:any) => {
                console.error(err);
            });

        // Download PDF doc
        // pdf.save(this.formatDatePT(new Date) + '_invoice.pdf');

        // Download PDF doc
        // const fileName = this.formatDatePT(new Date()) + '_invoice.pdf';
        // pdf.save(fileName);

        // // Mở file PDF sau khi lưu
        // setTimeout(() => {
        //     window.open(fileName, '_blank');
        // }, 1000);

        pdf.save(this.formatDatePT(new Date()) + '_invoice.pdf');

        setTimeout(() => {
            // Xuất file PDF dưới dạng Blob
            const blob = pdf.output('blob');

            // Tạo URL từ Blob
            const url = URL.createObjectURL(blob);

            // Mở PDF trong tab mới
            window.open(url, '_blank');
        }, 1000);





    }

  // public gerarPDF(element: any) {
  //   var pdf = new jsPDF();
  //   // INSS logo
  //   pdf.addImage(environment.ssIcon, 'JPEG', 90, 5, 25, 20);

  //   const pageWidth = 210; // Chiều rộng trang A4 tính bằng mm

  //   //title
  //   pdf.setFontSize(13);
  //   pdf.setTextColor(80);
  //   pdf.text(this.translate.instant('general.invoiceTitleDoc'), 60, 35);
  //   pdf.setFontSize(11);
  //   pdf.setTextColor(10);
  //   //Número do Documento
  //   pdf.text(this.translate.instant('general.invoicePaymentRef') + ': ' + element.paymentRef, 20, 45);
  //   pdf.text(this.translate.instant('general.invoiceEm'), 20, 52);
  //   pdf.text(this.translate.instant('general.invoiceName') + ': ' + element.userName, 20, 59);
  //   pdf.text(this.translate.instant('general.invoiceDate') + ': ' + this.formatDatePT(element.mesAno), 120, 59);
  //   pdf.text(this.translate.instant('general.invoiceNISS') + ': ' + element.niss, 20, 66);
  //   pdf.text(this.translate.instant('general.invoiceTIN') + ': ' + element.tin, 20, 73);
  //   pdf.text(this.translate.instant('general.invoicePM') + ':', 20, 80);
  //   // pdf.addImage(environment.checkBoxIcon, 'JPEG', 20, 83, 5, 5);
  //   pdf.text(this.translate.instant('general.invoiceCash'), 30, 87);
  //   // pdf.addImage(environment.checkBoxIcon, 'JPEG', 20, 90, 5, 5);
  //   pdf.text(this.translate.instant('general.invoiceBT'), 30, 94);

  //   pdf.text(this.translate.instant('general.invoiceIP'), 20, 101);
  //   pdf.text(this.translate.instant('general.invoiceBank') + ':', 20, 108);
  //   pdf.text(this.translate.instant('general.invoiceNOT'), 20, 115);
  //   pdf.text(this.translate.instant('general.invoiceCCATP'), 20, 122);

  //   var text1 = this.translate.instant('general.invoiceCFT') + ':';
  //   var text2 = (element.total * 0.1).toFixed(2);
  //   var text3 = this.translate.instant('general.invoiceUSD');
  //   // Tính toán chiều rộng của văn bản
  //   var textWidth1 = pdf.getTextWidth(text1);
  //   var textWidth2 = pdf.getTextWidth(text2);
  //   var textWidth3 = pdf.getTextWidth(text3);

  //   // Tính toán vị trí căn lề phải
  //   var rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái

  //   var rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
  //   var rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái

  //   pdf.text(this.translate.instant('general.invoiceCFT') + ':', rightAlignX1, 129);
  //   pdf.text((element.total * 0.1).toFixed(2), rightAlignX2, 129);
  //   pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 129);

  //   text1 = this.translate.instant('general.invoiceEEC') + ':';
  //   text2 = (element.total * 0.06).toFixed(2);

  //   // Tính toán chiều rộng của văn bản
  //   textWidth1 = pdf.getTextWidth(text1);
  //   textWidth2 = pdf.getTextWidth(text2);
  //   // Tính toán vị trí căn lề phải
  //   rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
  //   rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
  //   rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái

  //   pdf.text(this.translate.instant('general.invoiceEEC') + ':', rightAlignX1, 136);
  //   pdf.text((element.total * 0.06).toFixed(2), rightAlignX2, 136);
  //   pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 136);


  //   text1 = this.translate.instant('general.invoiceTCO') + ':';
  //   text2 = (element.total * 0.04).toFixed(2);

  //   // Tính toán chiều rộng của văn bản
  //   textWidth1 = pdf.getTextWidth(text1);
  //   textWidth2 = pdf.getTextWidth(text2);
  //   // Tính toán vị trí căn lề phải
  //   rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
  //   rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
  //   rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái

  //   pdf.text(this.translate.instant('general.invoiceTCO') + ':', rightAlignX1, 143);
  //   pdf.text((element.total * 0.04).toFixed(2), rightAlignX2, 143);
  //   pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 143);


  //   text1 = this.translate.instant('general.invoiceOPA') + ':';
  //   text2 = '0';

  //   // Tính toán chiều rộng của văn bản
  //   textWidth1 = pdf.getTextWidth(text1);
  //   textWidth2 = pdf.getTextWidth(text2);
  //   // Tính toán vị trí căn lề phải
  //   rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
  //   rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
  //   rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái

  //   pdf.text(this.translate.instant('general.invoiceOPA') + ':', rightAlignX1 - 7.5, 150);
  //   pdf.text('0', rightAlignX2, 150);
  //   pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 150);

  //   text1 = this.translate.instant('general.invoiceINCLUDING')
  //   textWidth1 = pdf.getTextWidth(text1);
  //   rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
  //   pdf.text(this.translate.instant('general.invoiceINCLUDING'), rightAlignX1 - 7.5, 157);

  //   text1 = this.translate.instant('general.invoiceLPI') + ':';
  //   text2 = '0';

  //   // Tính toán chiều rộng của văn bản
  //   textWidth1 = pdf.getTextWidth(text1);
  //   textWidth2 = pdf.getTextWidth(text2);
  //   // Tính toán vị trí căn lề phải
  //   rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
  //   rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
  //   rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái


  //   pdf.text(this.translate.instant('general.invoiceLPI') + ':', rightAlignX1 - 7.5, 164);
  //   pdf.text('0', rightAlignX2, 164);
  //   pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 164);


  //   text1 = this.translate.instant('general.invoiceFines') + ':';
  //   text2 = '0';

  //   // Tính toán chiều rộng của văn bản
  //   textWidth1 = pdf.getTextWidth(text1);
  //   textWidth2 = pdf.getTextWidth(text2);
  //   // Tính toán vị trí căn lề phải
  //   rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
  //   rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
  //   rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái


  //   pdf.text(this.translate.instant('general.invoiceFines') + ':', rightAlignX1 - 7.5, 171);
  //   pdf.text('0', rightAlignX2, 171);
  //   pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 171);


  //   text1 = this.translate.instant('general.invoiceOthers') + ':';
  //   text2 = '0';

  //   // Tính toán chiều rộng của văn bản
  //   textWidth1 = pdf.getTextWidth(text1);
  //   textWidth2 = pdf.getTextWidth(text2);
  //   // Tính toán vị trí căn lề phải
  //   rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
  //   rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
  //   rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái

  //   pdf.text(this.translate.instant('general.invoiceOthers') + ':', rightAlignX1 - 7.5, 178);
  //   pdf.text('0', rightAlignX2, 178);
  //   pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 178);

  //   text1 = this.translate.instant('general.invoiceTotal') + ':';
  //   text2 = (element.total * 0.1).toFixed(2);

  //   // Tính toán chiều rộng của văn bản
  //   textWidth1 = pdf.getTextWidth(text1);
  //   textWidth2 = pdf.getTextWidth(text2);
  //   // Tính toán vị trí căn lề phải
  //   rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
  //   rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
  //   rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái

  //   pdf.text(this.translate.instant('general.invoiceTotal') + ':', rightAlignX1, 185);
  //   pdf.text((element.total * 0.1).toFixed(2), rightAlignX2, 185);
  //   pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 185);


  //   text1 = this.translate.instant('general.invoiceROP') + ':';
  //   text2 = '0';

  //   // Tính toán chiều rộng của văn bản
  //   textWidth1 = pdf.getTextWidth(text1);
  //   textWidth2 = pdf.getTextWidth(text2);
  //   // Tính toán vị trí căn lề phải
  //   rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
  //   rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
  //   rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái

  //   pdf.text(this.translate.instant('general.invoiceROP') + ':', rightAlignX1 - 7.5, 192);
  //   pdf.text('0', rightAlignX2, 192);
  //   pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 192);

  //   text1 = this.translate.instant('general.invoiceCCON') + ':';
  //   text2 = '0';

  //   // Tính toán chiều rộng của văn bản
  //   textWidth1 = pdf.getTextWidth(text1);
  //   textWidth2 = pdf.getTextWidth(text2);
  //   // Tính toán vị trí căn lề phải
  //   rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
  //   rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
  //   rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái

  //   pdf.text(this.translate.instant('general.invoiceCCON') + ':', rightAlignX1 - 7.5, 199);
  //   pdf.text('0', rightAlignX2, 199);
  //   pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 199);


  //   text1 = this.translate.instant('general.invoiceTTA') + ':';
  //   text2 = '0';

  //   // Tính toán chiều rộng của văn bản
  //   textWidth1 = pdf.getTextWidth(text1);
  //   textWidth2 = pdf.getTextWidth(text2);
  //   // Tính toán vị trí căn lề phải
  //   rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
  //   rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
  //   rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái

  //   pdf.text(this.translate.instant('general.invoiceTTA') + ':', rightAlignX1 - 7.5, 206);
  //   pdf.text('0', rightAlignX2, 206);
  //   pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 206);

  //   text1 = this.translate.instant('general.invoiceAPEE') + ':';
  //   text2 = (element.total * 0.06).toFixed(2);

  //   // Tính toán chiều rộng của văn bản
  //   textWidth1 = pdf.getTextWidth(text1);
  //   textWidth2 = pdf.getTextWidth(text2);
  //   // Tính toán vị trí căn lề phải
  //   rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
  //   rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
  //   rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái

  //   pdf.text(this.translate.instant('general.invoiceAPEE') + ':', rightAlignX1, 213);
  //   pdf.text((element.total * 0.06).toFixed(2), rightAlignX2, 213);
  //   pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 213);


  //   text1 = this.translate.instant('general.invoiceATCO') + ':';
  //   text2 = (element.total * 0.04).toFixed(2);

  //   // Tính toán chiều rộng của văn bản
  //   textWidth1 = pdf.getTextWidth(text1);
  //   textWidth2 = pdf.getTextWidth(text2);
  //   // Tính toán vị trí căn lề phải
  //   rightAlignX1 = pageWidth - textWidth1 - textWidth2 - textWidth3 - 70; // 20 là khoảng cách lề trái
  //   rightAlignX2 = pageWidth - textWidth2 - textWidth3 - 42; // 20 là khoảng cách lề trái
  //   rightAlignX3 = pageWidth - textWidth3 - 40; // 20 là khoảng cách lề trái


  //   pdf.text(this.translate.instant('general.invoiceATCO') + ':', rightAlignX1, 220);
  //   pdf.text((element.total * 0.04).toFixed(2), rightAlignX2, 220);
  //   pdf.text(this.translate.instant('general.invoiceUSD'), rightAlignX3, 220);

  //   pdf.text(this.translate.instant('general.invoiceSSS'), 83, 230);

  //   pdf.text(this.translate.instant('general.invoiceDate'), 30, 270);

  //   pdf.text(this.translate.instant('general.invoiceSAS'), 160, 270);

  //   // QRCode.toDataURL(element.qrInvoice)
  //   //   .then(url => {
  //   //     // Chèn mã QR vào file PDF
  //   //
  //   //     pdf.addImage(url, 'JPEG', 95, 275, 20, 20);
  //   //
  //   //   })
  //   //   .catch(err => {
  //   //     console.error(err);
  //   //   });

  //   // Download PDF doc
  //   // pdf.save(this.formatDatePT(new Date) + '_invoice.pdf');

  //   // Download PDF doc
  //   // const fileName = this.formatDatePT(new Date()) + '_invoice.pdf';
  //   // pdf.save(fileName);

  //   // // Mở file PDF sau khi lưu
  //   // setTimeout(() => {
  //   //     window.open(fileName, '_blank');
  //   // }, 1000);

  //   pdf.save(this.formatDatePT(new Date()) + '_invoice.pdf');

  //   setTimeout(() => {
  //     // Xuất file PDF dưới dạng Blob
  //     const blob = pdf.output('blob');

  //     // Tạo URL từ Blob
  //     const url = URL.createObjectURL(blob);

  //     // Mở PDF trong tab mới
  //     window.open(url, '_blank');
  //   }, 1000);


  // }


  // public gerarPDF(element: any) {
  //     var pdf = new jsPDF();
  //     // INSS logo
  //     pdf.addImage(environment.ssIcon, 'JPEG', 90, 5, 25, 20);

  //     //title
  //     pdf.text(this.translate.instant('general.guiaDePagamento'), 83, 35);
  //     pdf.setFontSize(12);
  //     pdf.setTextColor(99);

  //     //Número do Documento
  //     pdf.text(this.translate.instant('guiaPagamentoListagem.numDocumento') + ': ' + element.numDocumento, 75, 45);

  //     //datas
  //     pdf.text(this.translate.instant('responsavel_legal.emitDate') + ': ' + this.formatDatePT(element.mesAno), 20, 55);
  //     pdf.text(this.translate.instant('conta_corrente.dataLimitePagamento') + ': ' + this.formatDatePT(element.dtValidade), 120, 55);

  //     var body = [[this.formatDatePT(element.mesAno), element.descricao, element.valor, element.juros, element.total, this.formatDatePT(element.dtValidade), this.guiaTipoOptions.find(x => x.value == element.tipo)?.descricao, element.valorPago],
  //     [{
  //         content: `TOTAL: ${this.formatDecimal(element.total)}`, colSpan: 8,
  //         styles: { fillColor: [42, 129, 204] }
  //     }]]

  //     {
  //         (pdf as any).autoTable({
  //             startY: 60,
  //             columnStyles: { europe: { halign: 'center' } },
  //             head: [[this.translate.instant('guiaPagamentoListagem.mesAno'), this.translate.instant('guiaPagamentoListagem.descricao'), this.translate.instant('guiaPagamentoListagem.valor'), this.translate.instant('guiaPagamentoListagem.juros'), this.translate.instant('guiaPagamentoListagem.total'), this.translate.instant('general.dtValidade'), this.translate.instant('guiaPagamentoListagem.type'), this.translate.instant('conta_corrente.valorPago')]],
  //             body: body,
  //             theme: 'grid',
  //             headStyles: {
  //                 fillColor: [42, 129, 204],
  //                 textColor: [0, 0, 0],
  //                 fontSize: 8,
  //                 padding: 0,
  //                 valign: 'middle',
  //                 halign: 'center',
  //             },

  //             bodyStyles: {
  //                 textColor: [0, 0, 0],
  //                 fontSize: 10,
  //                 padding: 0,
  //                 valign: 'middle',
  //                 halign: 'center',
  //             },
  //             didDrawCell: (data: { column: { index: any; }; }) => {
  //             }

  //         })
  //     }

  //     // Download PDF doc
  //     pdf.save('invoice.pdf');
  // }
  public openHandlePopup(guia: GuiaListagem, viewMode: boolean = false): void {
    this.spinner.show();

    let filter: FilterRequest;
    filter = { filterBy: 'indActivo' };

    let request: ReservaCreditoListagemRequest;

    request = { "idEntidade": this.entidadeId, "filter": filter };

    this.reservaCreditoService.getReservaCreditoByIdEntidade(request).subscribe(x => {
      this.credit = x.reservaCredito[0]?.valor;
      this.spinner.hide();
      //open pup with or without valor
      const dialogRef = this.comprovativoDialog.open(PopUpHandleInvoiceComponent, {
        id: 'editarDocumento',
        minHeight: '100px',
        width: '70%',
        height: '50%',
        panelClass: 'modalWithBorder',
        data: {
          adicionar: !viewMode,
          view: viewMode,
          avaliableCredit: viewMode ? undefined : this.credit,
          data: {
            guiaId: guia.idGuia,
            entidadeId: this.entidadeId,
            valor: guia.valorPago,
            data: guia.dtValorPago,
            file: guia.comprovativoPagamento
          },
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result)
          this.getTableGuiaPagamento();
      });
    },
      err => {
        this.credit = undefined;
        this.spinner.hide();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }


  clearPesquisarInv() {
    this.paymentRef = '';
    this.getTableGuiaPagamento();
  }

  clearPesquisarNiss() {
    this.niss = '';
    this.getTableGuiaPagamento();
  }
}
