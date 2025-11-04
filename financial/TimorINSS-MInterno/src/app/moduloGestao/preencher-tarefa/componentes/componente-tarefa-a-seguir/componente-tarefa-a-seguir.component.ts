import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { SelectDescription } from 'src/app/models/utils';
import { GetAllTarefasASeguirRequest } from 'src/app/request-models/tarefa-request';
import { TarefaService } from 'src/app/services/tarefa.service';
import { openErrorsDialog } from 'src/app/utils';

@Component({
  standalone: false,
  selector: 'app-componente-tarefa-a-seguir',
  templateUrl: './componente-tarefa-a-seguir.component.html',
  styleUrls: ['./componente-tarefa-a-seguir.component.css']
})
export class ComponenteTarefaASeguirComponent implements OnInit {

  @Input() isExpanded: boolean = false;
  @Input() tarefaActivoId: number = 0;
  @Input() nextTarefaId?: number;
  @Output() nextTarefaIdChange: EventEmitter<number> = new EventEmitter<number>();

  public tarefasList: SelectDescription[] = [];
  public errors: string[] = [];
  
  constructor(
    public translate: TranslateService,
    public tarefaService: TarefaService,
    public errorDialog: MatDialog,
  ) { }

  ngOnInit(): void {
    let listRequest: GetAllTarefasASeguirRequest = {tarefaAtivoId: this.tarefaActivoId};
    this.tarefaService.GetAllTarefasASeguir(listRequest).subscribe(x => {
      this.tarefasList = x.selects;
    },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      }
    );
  }

  public selectNextTarefa(): void {
    this.nextTarefaIdChange.emit(this.nextTarefaId);
  }

  public showError() {
    const dialogRef = openErrorsDialog(this.errors, this.errorDialog);

    dialogRef.afterClosed().subscribe(() => {
      this.errors = [];
    });
  }

  public scroll(e: any)
  {
    e._body.nativeElement.scrollIntoView({behavior: "smooth", block: "start"});
  }
}
