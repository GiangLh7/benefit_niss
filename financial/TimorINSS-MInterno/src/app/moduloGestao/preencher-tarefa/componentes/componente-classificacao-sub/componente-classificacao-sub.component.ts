import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { MyErrorStateMatcher } from 'src/app/matcher';
import { SelectDescription } from 'src/app/models/utils';
import { GetAllSubClassificacaoByTarefaAtivaIdRequest } from 'src/app/request-models/tarefa-request';
import { SubClassificacaoService } from 'src/app/services/subClassificacao.service';
import { openErrorsDialog } from 'src/app/utils';

@Component({
  standalone: false,
  selector: 'app-componente-classificacao-sub',
  templateUrl: './componente-classificacao-sub.component.html',
  styleUrls: ['./componente-classificacao-sub.component.css']
})
export class ComponenteClassificacaoSubComponent implements OnInit {

  @Input() isExpanded: boolean = false;
  @Input() tarefaActivoId: number = 0;
  @Input() subClassificacaoId?: number;
  @Output() subClassificacaoIdChange: EventEmitter<number> = new EventEmitter<number>();

  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public classificacaoSubList: SelectDescription[] = [];
  public errors: string[] = [];
  
  constructor(
    public translate: TranslateService,
    public subClassService: SubClassificacaoService,
    public errorDialog: MatDialog,
  ) { }

  ngOnInit(): void {
    let listRequest: GetAllSubClassificacaoByTarefaAtivaIdRequest = {tarefaAtivoId: this.tarefaActivoId};
    this.subClassService.GetAllSubClassificacaoByTarefaAtivaId(listRequest).subscribe(x => {
      this.classificacaoSubList = x.selects;
    },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      }
    );
  }

  public selectSubClass(): void {
    this.subClassificacaoIdChange.emit(this.subClassificacaoId);
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
