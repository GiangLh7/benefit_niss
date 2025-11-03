import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin, Observable } from 'rxjs';
import { MyErrorStateMatcher } from 'src/app/matcher';
import { SelectDescription } from 'src/app/models/utils';
import { ProcessoConfigRequest } from 'src/app/request-models/processo-request';
import { PerfisListagem } from 'src/app/response-models/perfis-response';
import { ProcessosListagemResponse } from 'src/app/response-models/processo-response';
import { TarefaConfigListagem } from 'src/app/response-models/tarefa-response';
import { PerfilService } from 'src/app/services/perfil.service';
import { ProcessoService } from 'src/app/services/processos.service';
import { TarefaService } from 'src/app/services/tarefa.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { openErrorsDialog, openSnackBar, showExpiredError } from 'src/app/utils';

@Component({
  selector: 'app-create-edit-configurar-processos',
  templateUrl: './create-edit-configurar-processos.component.html',
  styleUrls: ['./create-edit-configurar-processos.component.css']
})
export class NovoConfigurarProcessosComponent implements OnInit {

  public isLoggedIn = false;
  public faTimesCircle = faTimesCircle;
  public errors: string[] = [];
  public errorMessage = "";
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public submittedTry: boolean = false;
  public isUpdate = false;
  public tarefaError = false;
  public perfilError = false;

  //Logic objects
  public request = <ProcessoConfigRequest>{};
  public tarefasList: SelectDescription[] = []
  public filteredTarefasList: SelectDescription[] = []
  public perfisList: SelectDescription[] = []
  public filteredPerfisList: SelectDescription[] = []
  public selectedTarefaId = <number>{};
  public selectedPerfilId = <number>{};
  @ViewChild('tableTarefa') table!: MatTable<TarefaConfigListagem>;

  //Tarefas Table
  public dataSourceTarefa: TarefaConfigListagem[] = [];
  public displayedColumnsTarefa: string[] = ['nome', 'tarefaInicial', 'eliminar'];

  //Perfis Table
  public dataSourcePerfil: PerfisListagem[] = [];
  public displayedColumnsPerfil: string[] = ['descricao', 'eliminar'];

  constructor(
    private router: Router,
    private spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    public _snackBar: MatSnackBar,
    public translate: TranslateService,
    private tokenStorage: TokenStorageService,
    private actRoute: ActivatedRoute,
    private tarefaService: TarefaService,
    private perfilService: PerfilService,
    private processoService: ProcessoService, 
  ) { }

  ngOnInit(): void {
    if (!this.tokenStorage.getToken()) {
      this.router.navigate([''])
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired())
    {
      this.isLoggedIn = true;
      let id = this.actRoute.snapshot.params.id;
      //Get Tarefas and Perfis List
      this.spinner.show();
      var tarefas = this.tarefaService.getAllTarefaAtivo();
      var perfis = this.perfilService.getAllPerfisAtivo();
      forkJoin([tarefas,perfis]).subscribe(([tarefas,perfis]) => {
        this.tarefasList = tarefas.selects;
        this.filteredTarefasList = JSON.parse(JSON.stringify(this.tarefasList));
        this.perfisList = perfis.selects;
        this.filteredPerfisList = JSON.parse(JSON.stringify(this.perfisList));
        if (!id)
          this.spinner.hide();
        else {
          this.isUpdate = true;
          //Get the data from that id
          this.GetConfigData(id);
        }
      },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
        this.spinner.hide();
      });    
    }
    else{
      showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
    }
  }

  public showError() {
    const dialogRef = openErrorsDialog(this.errors, this.errorDialog);
    this.spinner.hide();

    dialogRef.afterClosed().subscribe(() => {
      this.errors = [];
    });
  }

  public GetConfigData(idConfig: number) {
    this.processoService.GetProcessoConfig({id: idConfig}).subscribe(response => {
      this.spinner.show();
      this.request.nome = response.nome;
      this.request.id = response.id;
      response.tarefas.forEach(tarefa => {
        this.addTarefa(tarefa.id);
      });
      response.perfis.forEach(perfil => {
        this.addPerfil(perfil);
      });
      this.spinner.hide();
    },
    err => {
      err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
      this.spinner.hide();
    });
  }

  public filterMyTarefaOptions(event: any)
  {
    this.filteredTarefasList = this.tarefasList.filter(p => p.nome.toLowerCase().includes(event.toLowerCase()));
  }
  public filterMyPerfilOptions(event: any)
  {
    this.filteredPerfisList = this.perfisList.filter(p => p.nome.toLowerCase().includes(event.toLowerCase()));
  }

  public addTarefa(selectedTarefaId: number)
  {
    var tarefa: SelectDescription = this.tarefasList.filter((c: { id: number; }) => c.id === selectedTarefaId)[0]

    var tarefaAdicionar: TarefaConfigListagem;
    tarefaAdicionar = { id: selectedTarefaId, nome: tarefa.nome, tarefaInicial: false};

    var index = this.dataSourceTarefa.findIndex(x => x.id === selectedTarefaId);

    if (index == null || index == -1) {
      if (!this.dataSourceTarefa[0])
        tarefaAdicionar.tarefaInicial = true;
      this.dataSourceTarefa.push(tarefaAdicionar);
      this.dataSourceTarefa = [...this.dataSourceTarefa];
    }
  }

  public addPerfil(selectedPerfilId: number)
  {
    var tarefa: SelectDescription = this.perfisList.filter((c: { id: number; }) => c.id === selectedPerfilId)[0]

    var perfilAdicionar: PerfisListagem;
    perfilAdicionar = { id: selectedPerfilId, descricao: tarefa.nome, indActivo: tarefa.indActivo, dataCriacao: new Date};

    var index = this.dataSourcePerfil.findIndex(x => x.id === selectedPerfilId);

    if (index == null || index == -1) {
      this.dataSourcePerfil.push(perfilAdicionar);
      this.dataSourcePerfil = [...this.dataSourcePerfil];
    }
  }

  public adicionarEditarConfigProcesso() 
  {
    this.submittedTry = true;
    if (this.dataSourceTarefa.length == 0) {
      this.tarefaError = true;
    }
    else
      this.tarefaError = false;
    if (this.dataSourcePerfil.length == 0) {
      this.perfilError = true;
    } else
      this.perfilError = false;
    if (!this.request.nome && this.request.nome.length < 0) {
      return;
    }

    if (this.perfilError || this.tarefaError)
      return;

    this.request.tarefas = [];
    this.request.perfis = [];
    this.dataSourceTarefa.forEach(element => {
      this.request.tarefas.push({
        id: element.id,
        tarefaInicial: element.tarefaInicial
      })
    });
    this.dataSourcePerfil.forEach(element => {
      this.request.perfis.push(element.id)
    });

    this.spinner.show();
    if (this.request.id){
      this.processoService.UpdateProcessoConfig(this.request).subscribe(() => {
        this.spinner.hide();
        openSnackBar(this.translate.instant('snackBar.editProcessoConfig'), this._snackBar);
        this.router.navigate(['/processos'], { skipLocationChange: true });
  
      },
        err => {
          this.spinner.hide();
          err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.showError();
        });
    } else {
      this.processoService.CreateProcessoConfig(this.request).subscribe(() => {
        this.spinner.hide();
        openSnackBar(this.translate.instant('snackBar.createProcessoConfig'), this._snackBar);
        this.router.navigate(['/processos'], { skipLocationChange: true });
  
      },
        err => {
          this.spinner.hide();
          err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.showError();
        });
    }
  }

  public cancelar()
  {
    this.router.navigate(['/processos'], { skipLocationChange: true });
  }

  public deleteTarefa(id: number)
  {
    var index = this.dataSourceTarefa.findIndex(x => x.id == id);
    if (this.dataSourceTarefa[index].tarefaInicial) {
      this.dataSourceTarefa.splice(index, 1);
      if (this.dataSourceTarefa[0])
        this.dataSourceTarefa[0].tarefaInicial = true;
    } else {
      this.dataSourceTarefa.splice(index, 1)
    }      
    this.dataSourceTarefa = [...this.dataSourceTarefa];
  }

  public deletePerfil(id: number)
  {
    var index = this.dataSourcePerfil.findIndex(x => x.id == id);
    this.dataSourcePerfil.splice(index, 1)
    this.dataSourcePerfil = [...this.dataSourcePerfil];
  }

  public dropTable(event: CdkDragDrop<TarefaConfigListagem[]>) {
    const prevIndex = this.dataSourceTarefa.findIndex((d) => d === event.item.data);
    moveItemInArray(this.dataSourceTarefa, prevIndex, event.currentIndex);
    this.dataSourceTarefa.map(x => x.tarefaInicial = false);
    this.dataSourceTarefa[0].tarefaInicial = true;    
    this.table.renderRows();
  }

  public dropPerfilTable(event: CdkDragDrop<PerfisListagem[]>) {
    const prevIndex = this.dataSourcePerfil.findIndex((d) => d === event.item.data);
    moveItemInArray(this.dataSourcePerfil, prevIndex, event.currentIndex);
    this.table.renderRows();
  }
}
