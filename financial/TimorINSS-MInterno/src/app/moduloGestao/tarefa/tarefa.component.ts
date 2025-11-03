import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { NgxSpinnerService } from "ngx-spinner";
import { openErrorsDialog, showExpiredError } from "../../utils";
import { MatDialog } from "@angular/material/dialog";
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from "@angular/material/snack-bar";
import { TokenStorageService } from "../../services/token-storage.service";
import { TarefaListagem } from "src/app/response-models/tarefa-response";
import { FilterRequest } from "src/app/request-models/utils-request";
import { TarefaService } from "src/app/services/tarefa.service";
import { TarefaListagemRequest } from "src/app/request-models/tarefa-request";
import { Funcionalidades } from "src/app/models/utils";


@Component({
  selector: 'app-tarwfa',
  templateUrl: './tarefa.component.html',
  styleUrls: ['./tarefa.component.css']
})
export class TarefaComponent implements OnInit {
  public isLoggedIn = false;
  public faTimesCircle = faTimesCircle;
  public filterBy = '';
  public errors: string[] = [];
  public errorMessage = "";

  //Region tarefa table
  public dataSourceTarefa: TarefaListagem[] = [];
  public displayedColumnsTarefa: string[] = ['numero', 'nome', 'acoes'];
  public totalRowsTarefaTable: number = 0;
  public pageSizeTarefaTable = 20;
  public pageIndexTarefaTable = 0;


  //user permissions
  public create: boolean = false;
  public read: boolean = false;
  public update: boolean = false;
  public delete: boolean = false;

  constructor(
    private router: Router,
    public errorDialog: MatDialog,
    public warningDialog: MatDialog,
    public _snackBar: MatSnackBar,
    private spinner: NgxSpinnerService,
    public translate: TranslateService,
    private tokenStorage: TokenStorageService,
    private tarefaService: TarefaService

  ) {
  }

  ngOnInit(): void {
   
    if (!this.tokenStorage.getToken()) {
      this.router.navigate([''])
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired()) {
      this.isLoggedIn = true;
      if (this.tokenStorage.getUser() && this.tokenStorage.getUser()?.permissions) {
        this.tokenStorage.getUser()?.permissions.forEach(permission => {

          if (permission.idFuncionalidade == Funcionalidades.Tarefa) {
            this.create = permission.create;
            this.read = permission.read;
            this.update = permission.update;
            this.delete = permission.delete;
          }
        });
      }
      this.showLoader();
      this.getTarefaTable();
    }
    else {
      showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
    }

  }

  public getTarefaTable() {
    this.dataSourceTarefa = [];
    let filter: FilterRequest;
    filter = {};
    filter.index = this.pageIndexTarefaTable;
    filter.rows = this.pageSizeTarefaTable;

    filter.filterBy = this.filterBy;

    let request: TarefaListagemRequest;

    request = { "filter": filter };

    this.tarefaService.getAllTarefas(request).subscribe(x => {
      x.rows == null ? this.totalRowsTarefaTable = 0 : this.totalRowsTarefaTable = x.rows;
      x.tarefa == null ? this.dataSourceTarefa = [] : this.dataSourceTarefa = x.tarefa;

      this.hideLoader();
    },
      err => {
        this.dataSourceTarefa = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }


  public pesquisarTarefa() {
    this.getTarefaTable();
  }

  public clearPesquisarTarefa() {
    this.filterBy = '';
    this.getTarefaTable();
  }

  public configurarTarefa() {
    this.router.navigate(['/configurarTarefas/'], { skipLocationChange: true })
  }

  public editarTarefa(id: number, nome: string) {
    this.router.navigate(['/configurarTarefas/', { idTarefa: id }], { skipLocationChange: true });
  }

  public updateTarefaTable(event: any) {
    this.pageIndexTarefaTable = event.pageIndex;
    this.pageSizeTarefaTable = event.pageSize;
    this.showLoader();
    this.getTarefaTable();
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
