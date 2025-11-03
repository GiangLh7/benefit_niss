import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import {TranslateService} from '@ngx-translate/core';
import {NgxSpinnerService} from 'ngx-spinner';
import {Funcionalidades} from 'src/app/models/utils';
import {PopUpWarningComponent} from 'src/app/componentes/pop-up-warning/pop-up-warning.component';
import {UtilizadorListagemRequest} from 'src/app/request-models/utilizador-request';
import {FilterRequest} from 'src/app/request-models/utils-request';
import {DominioDescricaoString} from 'src/app/response-models/dominios-response';
import {UtilizadoresAcessoListagem} from 'src/app/response-models/utilizadores-response';
import {TokenStorageService} from 'src/app/services/token-storage.service';
import {UtilizadorService} from 'src/app/services/utilizador.service';
import {openErrorsDialog, openSnackBar, showExpiredError} from 'src/app/utils';
import {PopUpAddUserComponent} from "../pop-up-add-user/pop-up-add-user.component";

@Component({
  selector: 'app-controlo-de-acesso',
  templateUrl: './controlo-de-acesso.component.html',
  styleUrls: ['./controlo-de-acesso.component.css']
})
export class ControloDeAcessoComponent implements OnInit {

  public errors: string[] = [];
  public faTimesCircle = faTimesCircle;
  public filterBy = '';
  public filterField?: string = undefined;
  public errorMessage = "";
  private configWarningMsgDesbloquear = this.translate.instant('warnings.userConfigWarningMsgUnblock');
  private configWarningMsgBloquear = this.translate.instant('warnings.userConfigWarningMsgBlock');

  //user permissions
  public read: boolean = false;
  public update: boolean = false;

  //Region tarefa table
  public utilizadoresList: UtilizadoresAcessoListagem[] = [];
  public displayedColumns: string[] = ['username', 'nome', 'interno', 'acoes'];
  public totalRowsTable: number = 0;
  public pageSizeTable = 20;
  public pageIndexTable = 0;
  public filterInternoOptions: DominioDescricaoString[] = [
    {
      id: 1,
      value: 0,
      descricao: 'utilizador.externo',
    },
    {
      id: 1,
      value: 1,
      descricao: 'utilizador.interno',
    }
  ];
  public selectedInternoOption?: number = undefined;
  public filterLockOptions: DominioDescricaoString[] = [
    {
      id: 1,
      value: 0,
      descricao: 'utilizador.desbloqueado',
    },
    {
      id: 1,
      value: 1,
      descricao: 'utilizador.bloqueado',
    }
  ];
  public selectedLockOption?: number = undefined;
  public filter: FilterRequest = {};

  constructor(
    private router: Router,
    private tokenStorage: TokenStorageService,
    private spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    public warningDialog: MatDialog,
    public translate: TranslateService,
    public _snackBar: MatSnackBar,
    private utilizadorService: UtilizadorService,
    public addUserDialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    if (!this.tokenStorage.getToken()) {
      this.router.navigate([''])
    } else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired()) {
      if (this.tokenStorage.getUser() && this.tokenStorage.getUser()?.permissions) {
        this.tokenStorage.getUser()?.permissions.forEach(permission => {

          if (permission.idFuncionalidade == Funcionalidades.ControlodeAcessodeUtilizadores) {
            this.read = permission.read;
            this.update = permission.update;
          }
        });
      }
      this.getUsersTable();
    } else {
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

    dialogRef.afterClosed().subscribe(() => {
      this.errors = [];
    });
  }

  public getUsersTable() {
    this.showLoader();
    this.filter.index = this.pageIndexTable;
    this.filter.rows = this.pageSizeTable;

    this.filter.filterBy = this.filterBy;
    this.filter.filterField = this.filterField;

    let request: UtilizadorListagemRequest;

    request = {"filter": this.filter};

    this.utilizadorService.GetAllAcessoUtilizadores(request).subscribe(x => {
        x.rows == null ? this.totalRowsTable = 0 : this.totalRowsTable = x.rows;
        x.utilizador == null ? this.utilizadoresList = [] : this.utilizadoresList = x.utilizador;

        this.hideLoader();
      },
      err => {
        this.utilizadoresList = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }

  public pesquisar() {
    this.getUsersTable();
  }

  public updateTable(event: any) {
    this.pageIndexTable = event.pageIndex;
    this.pageSizeTable = event.pageSize;
    this.showLoader();
    this.getUsersTable();
  }

  public lockUnlockUser(data: any) {
    const dialogRef = this.warningDialog.open(PopUpWarningComponent, {
      id: 'deleteMoradaDialog',
      minHeight: '300px',
      width: '40%',
      height: '30%',
      panelClass: 'warningModal',
      data: {
        function: this.utilizadorService.SwitchUserBlockState({id: data.id}),
        msg: data.locked ? this.configWarningMsgDesbloquear : this.configWarningMsgBloquear
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getUsersTable();
        openSnackBar(this.translate.instant('snackBar.userBlockConfig'), this._snackBar);
      }
    });
  }

  public applyInternoFilter(filter: string) {
    if (!this.filter.filter || this.filter.filter?.filterField == 'Interno') {
      this.filter.filter = {
        filterField: "Interno",
        filterBy: filter,
        filter: this.filter.filter?.filter
      };
    } else {
      this.filter.filter.filter = {
        filterField: "Interno",
        filterBy: filter
      };
    }

    this.pageSizeTable = 20;
    this.pageIndexTable = 0;
    this.getUsersTable();
  }

  public applyLockFilter(filter: string) {
    if (!this.filter.filter || this.filter.filter?.filterField == 'Lock') {
      this.filter.filter = {
        filterField: "Lock",
        filterBy: filter,
        filter: this.filter.filter?.filter
      };
    } else {
      this.filter.filter.filter = {
        filterField: "Lock",
        filterBy: filter
      };
    }
    this.pageSizeTable = 20;
    this.pageIndexTable = 0;
    this.getUsersTable();
  }

  public clearFilter(): void {
    this.filterBy = '';
    this.filterField = undefined;
    this.selectedInternoOption = undefined;
    this.selectedLockOption = undefined;
    this.pageSizeTable = 20;
    this.pageIndexTable = 0;
    this.filter = {};
    this.getUsersTable();
  }

  public openAddUserPopup(viewMode: boolean = false): void {

    const dialogRef = this.addUserDialog.open(PopUpAddUserComponent, {
      id: 'editarDocumento',
      minHeight: '100px',
      width: '70%',
      height: '50%',
      panelClass: 'modalWithBorder',
      data: {}
    });


  }
}
