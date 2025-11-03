import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { TranslateService } from "@ngx-translate/core";
import { NgxSpinnerService } from "ngx-spinner";
import { forkJoin } from "rxjs";
import { Funcionalidades } from "src/app/models/utils";
import { PopUpWarningComponent } from "src/app/componentes/pop-up-warning/pop-up-warning.component";
import { ProcessosListagemRequest } from "src/app/request-models/processo-request";
import { FilterRequest } from "src/app/request-models/utils-request";
import { ProcessoListagem } from "src/app/response-models/processo-response";
import { ProcessoService } from "src/app/services/processos.service";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { formatDate, formatDatePT, openErrorsDialog, openSnackBar, showExpiredError } from "src/app/utils";

@Component({
    selector: 'configurar-processos',
    templateUrl: './configurar-processos.component.html',
    styleUrls: ['./configurar-processos.component.css']
  })
  export class ConfigurarProcessosComponent implements OnInit {

    public isLoggedIn = false;
    public errors: string[] = [];
    public faTimesCircle = faTimesCircle;
    public filterBy = '';
    public errorMessage = "";
    private processoConfigWarningMsgInativar = this.translate.instant('warnings.processoConfigWarningMsgInativar');
    private processoConfigWarningMsgAtivar = this.translate.instant('warnings.processoConfigWarningMsgAtivar');

    //user permissions
    public create: boolean = false;
    public read: boolean = false;
    public update: boolean = false;
    public delete: boolean = false;
    
    //Region tarefa table
    public processosList: ProcessoListagem[] = [];
    public displayedColumnsProcesso: string[] = ['data', 'nome', 'acoes'];
    public totalRowsProcessoTable: number = 0;
    public pageSizeProcessoTable = 20;
    public pageIndexProcessoTable = 0;

    constructor(
        private router: Router,
        private tokenStorage: TokenStorageService,
        private spinner: NgxSpinnerService,
        public errorDialog: MatDialog,
        public warningDialog: MatDialog,
        public translate: TranslateService,
        public processoService: ProcessoService,
        public _snackBar: MatSnackBar,
        private datepipe: DatePipe,
        ) { }

    ngOnInit(): void {
        if (!this.tokenStorage.getToken()) {
          this.router.navigate([''])
        }
        else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired())
        {
          this.isLoggedIn = true;
          if (this.tokenStorage.getUser() && this.tokenStorage.getUser()?.permissions) {
            this.tokenStorage.getUser()?.permissions.forEach(permission => {
    
              if (permission.idFuncionalidade == Funcionalidades.ProcessosConfig) {
                this.create = permission.create;
                this.read = permission.read;
                this.update = permission.update;
                this.delete = permission.delete;
              }
            });
          }
          this.showLoader();
          this.getProcessosTable();
        }
        else{
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

      public getProcessosTable() {
        let filter: FilterRequest;
        filter = {};
        filter.index = this.pageIndexProcessoTable;
        filter.rows = this.pageSizeProcessoTable;
    
        filter.filterBy = this.filterBy;
    
        let request: ProcessosListagemRequest;
    
        request = { "filter": filter };
    
        this.processoService.GetAllProcessos(request).subscribe(x => {
          x.rows == null ? this.totalRowsProcessoTable = 0 : this.totalRowsProcessoTable = x.rows;
          x.processos == null ? this.processosList = [] : this.processosList = x.processos;
    
          this.hideLoader();
        },
          err => {
            this.processosList = [];
            this.hideLoader();
            err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
            this.showError();
          });
    
      }

      public pesquisarProcesso() {
        this.getProcessosTable();
      }
    
      public clearPesquisarProcesso() {
        this.filterBy = '';
        this.getProcessosTable();
      }
    
      public configurarProcesso() {
        this.router.navigate(['/novoConfigurarProcesso/'], { skipLocationChange: true })
      }
    
      public editarProcesso(id: number) {
        this.router.navigate(['/novoConfigurarProcesso/', { id: id }], { skipLocationChange: true });
      }
    
      public updateProcessoTable(event: any) {
        this.pageIndexProcessoTable = event.pageIndex;
        this.pageSizeProcessoTable = event.pageSize;
        this.showLoader();
        this.getProcessosTable();
      }

      public formatDate(date: Date): string {
        return formatDate(this.datepipe, date);
      }
    
    
      public formatDatePT(date: Date): string {
        return formatDatePT(this.datepipe, date);
      }

      public updateProcesso(data: any) {
        const dialogRef = this.warningDialog.open(PopUpWarningComponent, {
          id: 'deleteMoradaDialog',
          minHeight: '300px',
          width: '40%',
          height: '30%',
          panelClass: 'warningModal',
          data: { function: this.processoService.SwitchProcessoState({ id: data.id }), msg: data.indAtivo ? this.processoConfigWarningMsgInativar : this.processoConfigWarningMsgAtivar }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.getProcessosTable();
            openSnackBar(this.translate.instant('snackBar.editProcessoConfig'), this._snackBar);
          }
        });
      }
  }