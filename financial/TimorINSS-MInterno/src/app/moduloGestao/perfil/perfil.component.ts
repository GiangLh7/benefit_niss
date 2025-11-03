import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { NgxSpinnerService } from "ngx-spinner";
import { formatDatePT, openErrorsDialog, openSnackBar, showExpiredError } from "../../utils";
import { MatDialog } from "@angular/material/dialog";
import { FilterRequest } from "../../request-models/utils-request";
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from "@angular/common";
import { PopUpWarningComponent } from '../../componentes/pop-up-warning/pop-up-warning.component';
import { MatSnackBar } from "@angular/material/snack-bar";
import { PerfisListagem } from "../../response-models/perfis-response";
import { PerfilService } from "../../services/perfil.service";
import { PerfilListagemRequest } from "../../request-models/perfil-request";
import { TokenStorageService } from "../../services/token-storage.service";
import { Funcionalidades } from "../../models/utils";


@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  public isLoggedIn = false;
  public faTimesCircle = faTimesCircle;
  public filterBy = '';
  public errors: string[] = [];
  public errorMessage = "";

  //Region perfil table
  public dataSourcePerfis: PerfisListagem[] = [];
  public displayedColumnsPerfis: string[] = ['dataCriacao', 'descricao', 'acoes'];
  public totalRowsPerfisTable: number = 0;
  public pageSizePerfisTable = 20;
  public pageIndexPerfisTable = 0;

  private perfilWarningMsgInativar = this.translate.instant('warnings.perfilWarningMsgInativar');
  private perfilWarningMsgAtivar = this.translate.instant('warnings.perfilWarningMsgAtivar');

  //user permissions
  public create: boolean = false;
  public read: boolean = false;
  public update: boolean = false;
  public delete: boolean = false;

  constructor(
    private router: Router,
    private perfilService: PerfilService,
    private datepipe: DatePipe,
    private spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    public warningDialog: MatDialog,
    public _snackBar: MatSnackBar,
    public translate: TranslateService,
    private tokenStorage: TokenStorageService

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

          if (permission.idFuncionalidade == Funcionalidades.GestaoPerfil) {
            this.create = permission.create;
            this.read = permission.read;
            this.update = permission.update;
            this.delete = permission.delete;
          }
        });
      }

      this.showLoader();
      this.getTablePerfis();
    }
    else {
      showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
    }

  }


  public getTablePerfis() {

    this.dataSourcePerfis = [];
    let filter: FilterRequest;
    filter = {};
    filter.index = this.pageIndexPerfisTable;
    filter.rows = this.pageSizePerfisTable;

    filter.filterBy = this.filterBy;

    let request: PerfilListagemRequest;

    request = { "filter": filter };

    this.perfilService.getAllPerfis(request).subscribe(x => {
      x.rows == null ? this.totalRowsPerfisTable = 0 : this.totalRowsPerfisTable = x.rows;
      x.perfil == null ? this.dataSourcePerfis = [] : this.dataSourcePerfis = x.perfil;

      this.hideLoader();
    },
      err => {
        this.dataSourcePerfis = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public editPerfil(id: number, nomePerfil: string) {
    this.router.navigate(['/adicionarPerfil/', { idPerfil: id, nomePerfil: nomePerfil }], { skipLocationChange: true });
  }

  public updatePerfisTable(event: any) {
    this.pageIndexPerfisTable = event.pageIndex;
    this.pageSizePerfisTable = event.pageSize;
    this.showLoader();
    this.getTablePerfis();
  }

  public formatDatePT(date: Date): string {
    return formatDatePT(this.datepipe, date);
  }

  public clearPesquisarPerfil() {
    this.filterBy = '';
    this.getTablePerfis();
  }

  public pesquisarPerfil() {
    this.getTablePerfis();
  }

  public updatePerfil(data: any) {
    const dialogRef = this.warningDialog.open(PopUpWarningComponent, {
      id: 'deleteMoradaDialog',
      minHeight: '300px',
      width: '40%',
      height: '30%',
      panelClass: 'warningModal',
      data: { function: this.perfilService.updatePerfil({ id: data.id }), msg: data.indActivo ? this.perfilWarningMsgInativar : this.perfilWarningMsgAtivar }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTablePerfis();
        openSnackBar(this.translate.instant('snackBar.editPerfil'), this._snackBar);

      }
    });
  }

  public adicionarPerfil() {
    this.router.navigate(['/adicionarPerfil/'], { skipLocationChange: true })
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
