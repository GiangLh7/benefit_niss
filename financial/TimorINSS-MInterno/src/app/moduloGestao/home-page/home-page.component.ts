import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { TranslateService } from "@ngx-translate/core";
import { NgxSpinnerService } from "ngx-spinner";
import { forkJoin } from "rxjs";
import { Funcionalidades, SelectDescription } from "src/app/models/utils";
import { SwitchTarefaAtivoRequest, TarefaListagemRequest } from "src/app/request-models/tarefa-request";
import { FilterRequest, OrderDirectionEnum } from "src/app/request-models/utils-request";
import { TarefaAtivoListagem } from "src/app/response-models/tarefa-response";
import { SelectDescriptionResponse } from "src/app/response-models/utils-response";
import { ProcessoService } from "src/app/services/processos.service";
import { TarefaService } from "src/app/services/tarefa.service";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { formatDate, formatDatePT, openErrorsDialog, openSnackBar, showExpiredError } from "src/app/utils";
import { PopUpIniciarProcessoComponent } from "../pop-up-iniciar-processo/pop-up-iniciar-processo.component";

@Component({
  standalone: false,
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  public orderDirectionOptions: any[] = [
    {
      id: OrderDirectionEnum.ascending,
      descricao: 'general.asc'
    },
    {
      id: OrderDirectionEnum.descending,
      descricao: 'general.desc'
    }
  ]

  public orderByOptions: any[] = [
    {
      id: 'numeroProcesso',
      descricao: 'processo.numero'
    },
    {
      id: 'nomeProcesso',
      descricao: 'processo.nome'
    },
    {
      id: 'nome',
      descricao: 'tarefa.nome'
    },
    // {
    //   id: 'estadoDays',
    //   descricao: 'guiaPagamentoListagem.estadoPagamento'
    // },
    {
      id: 'ultimaAtualizacao',
      descricao: 'tarefa.lastUpdate'
    }
  ]

  public isLoggedIn = false;
  public errors: string[] = [];
  public faTimesCircle = faTimesCircle;
  public filterBy = '';
  public orderBy = 'ultimaAtualizacao';
  public orderDirection = OrderDirectionEnum.ascending;
  public errorMessage = "";

  //user permissions
  public create: boolean = false;
  public read: boolean = false;
  public update: boolean = false;
  public delete: boolean = false;

  //Region tarefa table
  public tarefasList: TarefaAtivoListagem[] = [];
  public displayedColumns: string[] = ['numeroProcesso', 'processo', 'tarefas', 'estado', 'lastUpdate', 'acoes'];
  public totalRowsTable: number = 0;
  public pageSizeTable = 20;
  public pageIndexTable = 0;

  //Region processes
  public allowedProcessesList: SelectDescription[] = [];
  public cannotStartProcess = true;

  constructor(
    private router: Router,
    private tokenStorage: TokenStorageService,
    private spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    public warningDialog: MatDialog,
    public inciarProcessoDialog: MatDialog,
    public translate: TranslateService,
    public tarefaService: TarefaService,
    public processoService: ProcessoService,
    public _snackBar: MatSnackBar,
    private datepipe: DatePipe
  ) { }

  ngOnInit(): void {

    if (!this.tokenStorage.getToken()) {
      this.router.navigate(['/login'],)
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired()) {
      this.isLoggedIn = true;
      if (this.tokenStorage.getUser() && this.tokenStorage.getUser()?.permissions) {
        this.tokenStorage.getUser()?.permissions.forEach(permission => {

          if (permission.idFuncionalidade == Funcionalidades.ProcessosConfig) {
            this.create = permission.create;
            this.read = permission.read;
            this.delete = permission.delete;
          }
          if (permission.idFuncionalidade == Funcionalidades.PreenchimentoTarefa) {
            this.update = permission.update;
          }
        });
      }
      this.showLoader();
      this.getTarefasAtivasTable();
    }
    else
      showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
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

  public getTarefasAtivasTable() {
    let filter: FilterRequest;
    filter = {};
    filter.index = this.pageIndexTable;
    filter.rows = this.pageSizeTable;

    filter.filterBy = this.filterBy;
    filter.orderBy = this.orderBy;
    filter.orderDirection = this.orderDirection;

    let request: TarefaListagemRequest;

    request = { "filter": filter };

    var tarefas = this.tarefaService.GetAllTarefasAtivas(request);
    var processos = this.processoService.ListIniciarProcessos({});

    forkJoin([tarefas, processos]).subscribe(([tarefas, processos]) => {
      tarefas.rows == null ? this.totalRowsTable = 0 : this.totalRowsTable = tarefas.rows;
      tarefas.tarefas == null ? this.tarefasList = [] : this.tarefasList = tarefas.tarefas;

      if (processos.selects) {
        this.allowedProcessesList = processos.selects;
        this.cannotStartProcess = false;
      }

      this.hideLoader();
    },
      err => {
        this.tarefasList = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }

  public pesquisarTarefa() {
    this.getTarefasAtivasTable();
  }

  public clearPesquisarTarefa() {
    this.filterBy = '';
    this.getTarefasAtivasTable();
  }

  public updateTarefaTable(event: any) {
    this.pageIndexTable = event.pageIndex;
    this.pageSizeTable = event.pageSize;
    this.showLoader();
    this.getTarefasAtivasTable();
  }

  public formatDate(date: Date): string {
    return formatDate(this.datepipe, date);
  }


  public formatDatePT(date: Date): string {
    return formatDatePT(this.datepipe, date);
  }

  public iniciarProcesso() {
    const dialogRef = this.inciarProcessoDialog.open(PopUpIniciarProcessoComponent, {
      id: 'gravarCampo',
      minHeight: '300px',
      width: '50%',
      height: '30%',
      panelClass: 'modalWithBorder',
      data: this.allowedProcessesList
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showLoader();
        this.getTarefasAtivasTable();
        openSnackBar(this.translate.instant('snackBar.processoIniciado'), this._snackBar);
      }
    });
  }

  public consultarProcessosArquivados() {
    this.router.navigate(['../processosArquivados'],);
  }

  public updateTarefa(id: number) {
    this.router.navigate(['../preencherTarefa', id],);
  }
}
