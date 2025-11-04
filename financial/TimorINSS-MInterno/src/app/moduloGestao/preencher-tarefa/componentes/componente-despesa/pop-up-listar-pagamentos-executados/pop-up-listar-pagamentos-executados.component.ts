import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from "@ngx-translate/core";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { blobExcelSaveAs, customCurrencyMaskConfig, formatDatePT, JsPdf_centerText, openErrorsDialog, openSnackBar, showExpiredError } from "src/app/utils";
import { PagamentoExecutadoService } from "src/app/services/pagamentoExecutado.service";
import jsPDF from "jspdf";
import { environment } from "src/environments/environment";
import { Router } from "@angular/router";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { ListaPagamentosDoProcesso } from "src/app/models/pagamentos_executados";
import { NgxSpinnerService } from "ngx-spinner";
import { GetDestinatarioPagamentoRequest, ListagemPagamentosProcessoRequest } from "src/app/request-models/pagamentoExecutado-request";

export interface PopUpListagemPagamentosData {
  processoAtivoId: number;
}

@Component({
  standalone: false,
  selector: 'app-pop-up-listar-pagamentos-executados',
  templateUrl: './pop-up-listar-pagamentos-executados.component.html',
  styleUrls: ['./pop-up-listar-pagamentos-executados.component.css']
})


export class PopUpListarPagamentosExecutadosComponent implements OnInit {
  public errors: string[] = [];
  public faFilePdf = faFilePdf;
  public listaPagamentos: ListaPagamentosDoProcesso[]=[];
  public displayedColumnsPagamentosExecutados: string[] = ['numPagamento', 'valor', 'pdf'];
  public listaPagamentosDetails: ListaPagamentosDoProcesso[]=[];


  constructor(
    private tokenStorage: TokenStorageService,
    private router: Router,
    public errorDialog: MatDialog,
    public translate: TranslateService,
    public pagamentoExecutadoService: PagamentoExecutadoService,
    private spinner: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data: PopUpListagemPagamentosData

  ) {
  }

  ngOnInit(): void {

    if (!this.tokenStorage.getToken()) {
      this.router.navigate([''])
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired()) {
      this.getListaPagamentosProcesso();

    }
    else {
      showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
    }

  }

  public getListaPagamentosProcesso() {
    this.showLoader();
    let request = <ListagemPagamentosProcessoRequest>{
      processoAtivo: this.data.processoAtivoId,
    };

    this.pagamentoExecutadoService.GetListaPagamentosProcesso(request).subscribe(x => {
      this.listaPagamentos = x.pagamentos;
      this.hideLoader();
    },
      err => {

        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }


  public getPagamentoDetails(numPagamento: string): void {

    this.showLoader();
    let request = <GetDestinatarioPagamentoRequest>{
      numPagamento: numPagamento,
    };

    this.pagamentoExecutadoService.GetPagamentoDetails(request).subscribe(x => {
      this.listaPagamentosDetails = x.pagamentos;
      if(this.listaPagamentosDetails != null && this.listaPagamentosDetails.length > 0){
        this.gerarPDF(this.listaPagamentosDetails, numPagamento);

      }
      this.hideLoader();
    },
      err => {

        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }

  public gerarPDF(pdfList: ListaPagamentosDoProcesso[], numPagamento: string){

    var pdf = new jsPDF();
    // INSS logo
    pdf.addImage(environment.ssIcon, 'JPEG', 90, 5, 25, 20);


    //title
    JsPdf_centerText(pdf, this.translate.instant('general.ordemPagamento'), 35);
    // pdf.text('Ordem de Pagamento', 83, 35);
    pdf.setFontSize(12);
    pdf.setTextColor(99);

    //Número do Documento
    JsPdf_centerText(pdf, this.translate.instant('pagamentosExecutados.numeroOrdemPagamento') + ': ' + numPagamento, 45);


    var rows: string[][] = [];
    pdfList.forEach(row => {
      var temp = [row.contaOGE, row.destinatario.nome, row.destinatario.niss ?? '- ' + '/' + row.destinatario.tin ?? ' -',
      row.iban ?? row.numeroConta ?? '', '$' + row.valor];

      rows.push(temp);

    });


      (pdf as any).autoTable({
        startY: 55,
        columnStyles: { europe: { halign: 'center' } },
        head: [[this.translate.instant('pagamentosExecutados.contaOGE'), this.translate.instant('pagamentosExecutados.destinatario'), "NISS/TIN", this.translate.instant('pagamentosExecutados.iban') + '/' + this.translate.instant('general.NConta'), this.translate.instant('pagamentosExecutados.valor')]],
        body: rows,
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

      const img = new Image();

      img.onload = function(){
        const widthCap = 70;
        const height = img.height;
        const width = img.width;

        const { width: pdfWidth, height: pdfHeight } = pdf.internal.pageSize;

        const resolvedHeight = height * widthCap / width;

        // Stamp and Signature
        pdf.addImage(environment.stampImage, 'JPEG', pdfWidth / 2 - widthCap / 2, pdfHeight - resolvedHeight - 30, widthCap, resolvedHeight);

        // Open PDF document in browser's new tab
        window.open(URL.createObjectURL(pdf.output("blob")));
      }

      img.src = environment.stampImage;

    //pdf.output('dataurlnewwindow');

    // Download PDF doc
    //pdf.save('GuiaPagamento.pdf');
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
}
