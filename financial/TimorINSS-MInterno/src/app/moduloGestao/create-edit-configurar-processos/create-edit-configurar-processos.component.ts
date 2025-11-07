import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, computed, OnInit, signal, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin } from 'rxjs';
import { MyErrorStateMatcher } from 'src/app/matcher';
import { SelectDescription } from 'src/app/models/utils';
import { ProcessoConfigRequest } from 'src/app/request-models/processo-request';
import { PerfisListagem } from 'src/app/response-models/perfis-response';
import { TarefaConfigListagem } from 'src/app/response-models/tarefa-response';
import { PerfilService } from 'src/app/services/perfil.service';
import { ProcessoService } from 'src/app/services/processos.service';
import { TarefaService } from 'src/app/services/tarefa.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { openErrorsDialog, openSnackBar, showExpiredError } from 'src/app/utils';

@Component({
  standalone: false,
  selector: 'app-create-edit-configurar-processos',
  templateUrl: './create-edit-configurar-processos.component.html',
  styleUrls: ['./create-edit-configurar-processos.component.scss']
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
  private taskList: SelectDescription[] = []
  public filteredTarefasList: SelectDescription[] = []
  public perfisList: SelectDescription[] = []
  public filteredPerfisList: SelectDescription[] = []
  public selectedTarefaId = 0;
  public selectedPerfilId = 0;
  @ViewChild('tableTarefa') table!: MatTable<TarefaConfigListagem>;

  //Tarefas Table
  readonly dataSourceTasks = signal<TarefaConfigListagem[]>([]);
  readonly addedTasks = computed(() => {
    const tasks = this.dataSourceTasks();
    return new Map(tasks.map(task => [task.id, task]));
  });
  public displayedColumnsTarefa: string[] = ['nome', 'tarefaInicial', 'eliminar'];

  //Perfis Table
  readonly dataSourceProfile = signal<PerfisListagem[]>([]);
  readonly addedProfiles = computed(() => {
    const profiles = this.dataSourceProfile();
    return new Map(profiles.map(profile => [profile.id, profile]));
  });
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
      let id = this.actRoute.snapshot.params["id"];
      //Get Tarefas and Perfis List
      this.spinner.show();
      var tarefas = this.tarefaService.getAllTarefaAtivo();
      var perfis = this.perfilService.getAllPerfisAtivo();
      forkJoin([tarefas,perfis]).subscribe(([tarefas,perfis]) => {
        this.taskList = tarefas.selects;
        this.filteredTarefasList = JSON.parse(JSON.stringify(this.taskList));
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
        this.addTask(tarefa.id);
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
    this.filteredTarefasList = this.taskList.filter(p => p.nome.toLowerCase().includes(event.toLowerCase()));
  }
  public filterMyPerfilOptions(event: any)
  {
    this.filteredPerfisList = this.perfisList.filter(p => p.nome.toLowerCase().includes(event.toLowerCase()));
  }

  public addTask(selectedTaskId: number)
  {
    const task = this.taskList.find(c => c.id === selectedTaskId);
    if (!task) {
      return;
    }

    const tasks = [...this.dataSourceTasks()];
    const newTask = { id: selectedTaskId, nome: task.nome, tarefaInicial: !tasks.length };
    const isAdded = this.addedTasks().has(selectedTaskId);

    if (isAdded) {
      return;
    }

   this.dataSourceTasks.set([
      ...tasks,
      newTask
    ]);
    this.selectedTarefaId = 0;
  }

  public addPerfil(selectedPerfilId: number)
  {
    const profile = this.perfisList.find(c => c.id === selectedPerfilId);

    if (!profile) {
      return;
    }

    const perfilAdicionar: PerfisListagem = { id: selectedPerfilId, descricao: profile.nome, indActivo: profile.indActivo, dataCriacao: new Date};

    if (!this.addedProfiles().has(selectedPerfilId)) {
      this.dataSourceProfile.set([
        ...this.dataSourceProfile(),
        perfilAdicionar,
      ]);

      this.selectedPerfilId = 0;
    }
  }

  public adicionarEditarConfigProcesso() 
  {
    const tasks = this.dataSourceTasks();
    this.submittedTry = true;
    if (tasks.length == 0) {
      this.tarefaError = true;
    }
    else
      this.tarefaError = false;
    if (this.dataSourceProfile().length == 0) {
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
    tasks.forEach(element => {
      this.request.tarefas.push({
        id: element.id,
        tarefaInicial: element.tarefaInicial
      })
    });
    this.dataSourceProfile().forEach(element => {
      this.request.perfis.push(element.id)
    });

    this.spinner.show();
    if (this.request.id){
      this.processoService.UpdateProcessoConfig(this.request).subscribe(() => {
        this.spinner.hide();
        openSnackBar(this.translate.instant('snackBar.editProcessoConfig'), this._snackBar);
        this.router.navigate(['/processos'],);
  
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
        this.router.navigate(['/processos'],);
  
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
    this.router.navigate(['/processos'],);
  }

  public deleteTask(id: number)
  {
    const tasks = [...this.dataSourceTasks()];
    const index = tasks.findIndex(task => task.id == id);
    tasks.splice(index, 1);
    this.dataSourceTasks.set(tasks);
  }

  deleteProfile(id: number)
  {
    const profiles = [...this.dataSourceProfile()];
    const index = profiles.findIndex(x => x.id == id);
    profiles.splice(index, 1);
    this.dataSourceProfile.set(profiles);
  }

  dropTable(event: CdkDragDrop<TarefaConfigListagem[]>) {
    const tasks = [...this.dataSourceTasks()];
    const prevIndex = tasks.findIndex(task => task === event.item.data);
    moveItemInArray(tasks, prevIndex, event.currentIndex);
    this.dataSourceTasks.set(tasks);
  }

  dropPerfilTable(event: CdkDragDrop<PerfisListagem[]>) {
    const profiles = [...this.dataSourceProfile()];
    const prevIndex = profiles.findIndex((d) => d === event.item.data);
    moveItemInArray(profiles, prevIndex, event.currentIndex);
    this.dataSourceProfile.set(profiles);
  }
}
