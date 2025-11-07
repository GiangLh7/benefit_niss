import { RelTarefaComponenteService } from 'src/app/services/relTarefaComponente.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material/dialog';
import { openErrorsDialog, openSnackBar } from 'src/app/utils';
import { TranslateService } from '@ngx-translate/core';
import { TarefaService } from 'src/app/services/tarefa.service';
import { GetTarefaDataRequest, SwitchTarefaAtivoRequest, TarefaDataRequest } from 'src/app/request-models/tarefa-request';
import { HostListener } from '@angular/core';
import { GetAllRelTarefaComponenteByIdTarefaActivoRequest } from 'src/app/request-models/relTarefaComponente-request';
import { ComponenteListagem, ComponenteListagemResponse } from 'src/app/response-models/componente-response';
import { forkJoin } from 'rxjs';
import { PreencherTarefa } from 'src/app/models/preencherTarefa';
import { TarefaDataResponse } from 'src/app/response-models/tarefa-response';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-preencher-tarefa',
  templateUrl: './preencher-tarefa.component.html',
  styleUrls: ['./preencher-tarefa.component.css'],
})
export class PreencherTarefaComponent implements OnInit {
  public rels: ComponenteListagem[] = [];
  public errors: string[] = [];
  public tarefaActivoId: number = 0;
  public tarefaObject: PreencherTarefa = <PreencherTarefa>{};
  public hasPermission = false;
  public refreshDocTable = false;
  public lockUnlockRequest: SwitchTarefaAtivoRequest = <SwitchTarefaAtivoRequest>{};

  // Unlocks task on closing the browser/refresh on browser
  @HostListener('window:beforeunload', ['$event'])
    onWindowClose(): void {
      this.tarefaService.UnlockTarefa(this.lockUnlockRequest).subscribe();
    }

  constructor(
    private router: Router,
    private tokenStorage: TokenStorageService,
    private spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    public translate: TranslateService,
    private actRoute: ActivatedRoute,
    private relTarefaComponenteService: RelTarefaComponenteService,
    private tarefaService: TarefaService,
    public _snackBar: MatSnackBar,
  ) {
    this.lockUnlockRequest.id = this.actRoute.snapshot.params["id"];
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) { 
        if (!ev.urlAfterRedirects.includes('preencherTarefa'))
          this.tarefaService.UnlockTarefa(this.lockUnlockRequest).subscribe();
      }
    });
  }

  ngOnInit(): void {
    if (!this.tokenStorage.getToken()) {
      this.router.navigate(['']);
    } else if (
      this.tokenStorage.getToken() &&
      !this.tokenStorage.tokenExpired()
    ) {
      let id = this.actRoute.snapshot.params["id"];
      this.tarefaActivoId = id;

      this.showLoader();

      let lockService = this.tarefaService.LockTarefa(this.lockUnlockRequest);

      // serviço para ir buscar as relações de componentes
      let request = <GetAllRelTarefaComponenteByIdTarefaActivoRequest>{
        idTarefaActivo: this.tarefaActivoId
      };
      let getAllService = this.relTarefaComponenteService.getAllRelTarefaComponenteByIdTarefaActivo(request);

      //serviço para ir buscar todos os dados necessários para as componentes
      let getDataRequest = <GetTarefaDataRequest> {tarefaAtivoId: this.tarefaActivoId};
      let getTarefaDataService = this.tarefaService.GetTarefaData(getDataRequest);

      forkJoin([lockService, getAllService, getTarefaDataService]).subscribe((response: [any, ComponenteListagemResponse, TarefaDataResponse]) => {
        this.rels = response[1].componentes;
        this.tarefaObject = response[2].data;
        this.hasPermission = true;
        this.hideLoader();
      },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
        this.router.navigate([''])
      });

    } else {
      this.tarefaService.UnlockTarefa(this.lockUnlockRequest).subscribe();
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

    dialogRef.afterClosed().subscribe((result) => {
      this.errors = [];
    });
  }

  public gravarTarefa() {
    let saveRequest = <TarefaDataRequest>{tarefaAtivoId: this.tarefaActivoId, data: this.tarefaObject};
    this.showLoader();
    this.tarefaService.SaveTarefaData(saveRequest).subscribe(() => {
      this.hideLoader();
      openSnackBar(this.translate.instant('snackBar.saveTask'), this._snackBar);
      this.tarefaService.UnlockTarefa(this.lockUnlockRequest).subscribe();
      this.router.navigate(['']);
    },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public cancelar() {
    this.tarefaService.UnlockTarefa(this.lockUnlockRequest).subscribe();
    this.router.navigate(['']);
  }

  public arquivarTarefa() {
    let saveRequest = <TarefaDataRequest>{tarefaAtivoId: this.tarefaActivoId, data: this.tarefaObject};
    this.showLoader();
    this.tarefaService.ArquivarTarefa(saveRequest).subscribe(() => {
      this.hideLoader();
      openSnackBar(this.translate.instant('snackBar.archiveProcess'), this._snackBar);
      this.tarefaService.UnlockTarefa(this.lockUnlockRequest).subscribe();
      this.router.navigate(['']);
    },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public refreshDocTableEvent(event: any) {
    if (event == true) {
      this.refreshDocTable = true;
    }
  }
  public tableRefreshed(event: any) {
    if (event == true) {
      this.refreshDocTable = false;
    }
  }
}
