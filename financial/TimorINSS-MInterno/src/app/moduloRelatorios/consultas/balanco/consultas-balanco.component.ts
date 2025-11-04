import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatDatepicker } from "@angular/material/datepicker";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { TranslateService } from "@ngx-translate/core";
import { Moment } from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import { MyErrorStateMatcher } from "src/app/matcher";
import { ReceitaRelatorio } from "src/app/models/componenteReceitaRegisto";
import { ContaBancaria } from "src/app/models/contaBancaria";
import { MovimentosBancariosData } from "src/app/models/movimentosBancarios";
import { BalancoRelatorio } from "src/app/models/pagamentos_executados";
import { MovimentosListagemRequest } from "src/app/request-models/movimentosBancarios-request";
import { BalancoRelatoriosRequest } from "src/app/request-models/pagamentoExecutado-request";
import { FilterRequest, OrderDirectionEnum } from "src/app/request-models/utils-request";
import { ComponenteReceitaRegistoService } from "src/app/services/componenteReceitaRegisto.service";
import { movimentosBancariosService } from "src/app/services/movimentosBancarios.service";
import { PagamentoExecutadoService } from "src/app/services/pagamentoExecutado.service";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { blobExcelSaveAs, formataCurrency, formatDate, formatDatePT, openErrorsDialog, showExpiredError } from "src/app/utils";

@Component({
  standalone: false,
  selector: 'app-consultas-balanco',
  templateUrl: './consultas-balanco.component.html',
  styleUrls: ['./consultas-balanco.component.css']
})
export class ConsultasBalancoComponent implements OnInit {

  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public errors: string[] = [];
  public faTimesCircle = faTimesCircle;
  public totais: any = {};

  public nivel?: number;
  public nivelOptions: number[] = [1, 2, 3, 4, 5, 6, 7, 8];
  public comparar?: boolean;
  public compararOptions: any[] = [
    {
      id: true,
      key: 'balanco.sim'
    },
    {
      id: false,
      key: 'balanco.nao'
    }
  ]

  public filter: FilterRequest = {};
  public submittedTry: boolean = false;
  public resultsShown: boolean = false;
  public beginDate?: Moment;
  public endDate?: Moment;

  //Region tarefa table
  public groupsExpanded: { [id: number]: { expandido: boolean, pai?: number }} = {};
  public contasAllItems: BalancoRelatorio[] = [];
  public contasList: BalancoRelatorio[] = [];

  constructor(
    private router: Router,
    private tokenStorage: TokenStorageService,
    private spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    public warningDialog: MatDialog,
    public translate: TranslateService,
    public pagamentosExecutadosService: PagamentoExecutadoService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {

    if (!this.tokenStorage.getToken()) {
      this.router.navigate(['/login'],)
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired()) {

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

  public getReceitasTable() {

    if (!this.submittedTry) this.submittedTry = true;

    if (!this.nivel || this.comparar == null || !this.beginDate || !this.endDate) return;

    this.showLoader();

    this.filter.dateFilterBegin = this.beginDate?.toDate();
    this.filter.dateFilterEnd = this.endDate?.toDate();

    const request: BalancoRelatoriosRequest = {
      filter: this.filter,
      nivel: this.nivel,
      compararAnoAnterior: this.comparar
    };

    if (!this.resultsShown) this.resultsShown = true;

    this.pagamentosExecutadosService.BalancoRelatorio(request).subscribe((contas) => {

      this.contasAllItems = [];
      this.groupsExpanded = {};
      this.resolve(contas.lista || []);
      this.contasList = this.contasAllItems.filter(e => !e.parentId);

      this.totais.credito = contas.lista.filter(e => !e.parentId).reduce((inc: number, item: BalancoRelatorio) => inc + item.credito, 0);
      this.totais.debito = contas.lista.filter(e => !e.parentId).reduce((inc: number, item: BalancoRelatorio) => inc + item.debito, 0);
      this.totais.credito2 = contas.lista.filter(e => !e.parentId).reduce((inc: number, item: BalancoRelatorio) => inc + item.creditoAntes, 0);
      this.totais.debito2 = contas.lista.filter(e => !e.parentId).reduce((inc: number, item: BalancoRelatorio) => inc + item.debitoAntes, 0);

      this.hideLoader();
    },
      err => {
        this.contasList = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public resolve(lista: BalancoRelatorio[]) {
    lista.forEach(itm => {
      const temFilhos = lista.some(e => e.parentId == itm.id);
      this.contasAllItems.push({
        ...itm,
        temFilhos
      })
      if (temFilhos) {
        this.groupsExpanded[itm.id] = { expandido: false, pai: itm.parentId };
      }
    });
  }

  public toggleExpand(id: any) {

    if (!this.groupsExpanded[id]) return;

    this.recursiveToggleGroup(id);

    const itms = this.contasAllItems.filter(e => !e.parentId || this.groupsExpanded[e.parentId].expandido);
    this.contasList = itms;
  }

  public recursiveToggleGroup(id: number) {

    this.groupsExpanded[id].expandido = !this.groupsExpanded[id].expandido;

    Object.keys(this.groupsExpanded).forEach(e => {
      const id = parseInt(e);

      if (this.groupsExpanded[id].pai && this.groupsExpanded[id].expandido && !this.groupsExpanded[this.groupsExpanded[id].pai!].expandido) {
        this.groupsExpanded[id].expandido = false;
      }

    });
  }



  // chosenMonthHandler(date: Date, datepicker: MatDatepicker<Moment>, isBeginDate: boolean) {
  //   if (isBeginDate) {
  //     this.beginDate = formatDate(this.datePipe, date);
  //     this.filter.dateFilterBegin = date;
  //   }
  //   else {
  //     this.endDate = formatDate(this.datePipe, date);
  //     this.filter.dateFilterEnd = date;
  //   }
  //   datepicker.close();
  // }

  public clearFilter() {
    this.filter = {};
    this.nivel = undefined;
    this.comparar = undefined;
    this.beginDate = undefined;
    this.endDate = undefined;
    this.submittedTry = false;
  }

  public updateReceitasTable(event: any) {
    this.showLoader();
    this.getReceitasTable();
  }

  public formatDate(date?: Moment) {
    if (!date) return '';
    return formatDatePT(this.datePipe, date.toDate());
  }

  public formatDateLastYear(date?: Moment ) {
    if (!date) return '';
    const dt = date.toDate();
    dt.setFullYear(dt.getFullYear() - 1);
    return formatDatePT(this.datePipe, dt);
  }

  public formataCurrency(amount: number) {
    return formataCurrency(amount);
  }

  public exportExcelRelatorio() {

    this.showLoader();

    const request: BalancoRelatoriosRequest = {
      filter: this.filter,
      nivel: this.nivel,
      compararAnoAnterior: this.comparar
    };

    this.pagamentosExecutadosService.BalancoRelatorioExcel(request).subscribe((response) => {
      this.hideLoader();
      const date = this.filter.dateFilterBegin && this.filter.dateFilterEnd ? `_${this.datePipe.transform(this.filter.dateFilterBegin, 'dd-MM-yyyy')}_${this.datePipe.transform(this.filter.dateFilterEnd, 'dd-MM-yyyy')}` : this.filter.dateFilterBegin ? `_${this.datePipe.transform(this.filter.dateFilterBegin, 'dd-MM-yyyy')}` : "";
      blobExcelSaveAs(response.file, `consultation-balance${date}`);
    },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }

}
