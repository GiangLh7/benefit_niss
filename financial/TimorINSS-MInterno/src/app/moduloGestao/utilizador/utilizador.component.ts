import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { NgxSpinnerService } from "ngx-spinner";
import { openErrorsDialog, showExpiredError } from "../../utils";
import { MatDialog } from "@angular/material/dialog";
import { FilterRequest } from "../../request-models/utils-request";
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from "@angular/common";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UtilizadoresListagem } from "../../response-models/utilizadores-response";
import { UtilizadorListagemRequest } from "../../request-models/utilizador-request";
import { UtilizadorService } from "../../services/utilizador.service";
import { TokenStorageService } from "../../services/token-storage.service";
import { Funcionalidades } from "../../models/utils";


@Component({
  selector: 'app-utilizador',
  templateUrl: './utilizador.component.html',
  styleUrls: ['./utilizador.component.css']
})
export class UtilizadorComponent implements OnInit {
  public isLoggedIn = false;
  public faTimesCircle = faTimesCircle;
  public filterBy = '';
  public errors: string[] = [];
  public errorMessage = "";

  //Region Utilizadores table
  public dataSourceUtilizadores: UtilizadoresListagem[] = [];
  public displayedColumnsUtilizadores: string[] = ['utilizador', 'departamento', 'perfil', 'acoes'];
  public totalRowsUtilizadoresTable: number = 0;
  public pageSizeUtilizadoresTable = 20;
  public pageIndexUtilizadoresTable = 0;

  //user permissions
  public create: boolean = false;
  public read: boolean = false;
  public update: boolean = false;
  public delete: boolean = false;



  constructor(
    private router: Router,
    private utilizadorService: UtilizadorService,
    private spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    public warningDialog: MatDialog,
    public _snackBar: MatSnackBar,
    public translate: TranslateService,
    private tokenStorage: TokenStorageService,
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

          if (permission.idFuncionalidade == Funcionalidades.GestaoUtilizador) {
            this.create = permission.create;
            this.read = permission.read;
            this.update = permission.update;
            this.delete = permission.delete;
          }
        });
      }
      this.showLoader();
      this.getTableUtilizadores();
    }
    else {
      showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
    }
  }


  public getTableUtilizadores() {

    this.dataSourceUtilizadores = [];
    let filter: FilterRequest;
    filter = {};
    filter.index = this.pageIndexUtilizadoresTable;
    filter.rows = this.pageSizeUtilizadoresTable;

    filter.filterBy = this.filterBy;

    let request: UtilizadorListagemRequest;

    request = { "filter": filter };

    this.utilizadorService.GetAllUtilizadoresInterno(request).subscribe(x => {
      x.rows == null ? this.totalRowsUtilizadoresTable = 0 : this.totalRowsUtilizadoresTable = x.rows;
      x.utilizador == null ? this.dataSourceUtilizadores = [] : this.dataSourceUtilizadores = x.utilizador;

      this.hideLoader();
    },
      err => {
        this.dataSourceUtilizadores = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public updateUtilizadoresTable(event: any) {
    this.pageIndexUtilizadoresTable = event.pageIndex;
    this.pageSizeUtilizadoresTable = event.pageSize;
    this.getTableUtilizadores();
  }

  public clearPesquisarUtilizador() {
    this.filterBy = '';
    this.getTableUtilizadores();
  }

  public pesquisarUtilizador() {
    this.getTableUtilizadores();
  }

  public editarUtilizador(idUtilizador: number, idTrabalhador: number) {
    this.showLoader();
    this.router.navigate(['/novoUtilizador/', { idUtilizador: idUtilizador, idTrabalhador: idTrabalhador }], { skipLocationChange: true });
    this.hideLoader();
  }

  public consultarUtilizador(id: number, idTrabalhador: number) {
    this.router.navigate(['/novoUtilizador/', { idUtilizador: id, idTrabalhador:idTrabalhador, isConsultar: true }], { skipLocationChange: true });
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
