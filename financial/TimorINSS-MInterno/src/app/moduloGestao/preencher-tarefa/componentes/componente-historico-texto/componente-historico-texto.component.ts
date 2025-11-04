import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GetHistoricoTextoRequest } from 'src/app/request-models/tarefa-request';
import { GetHistoricoTextoRequest as GetHistoricoTextoProcessoRequest } from 'src/app/request-models/processo-request';
import { HistoryText } from 'src/app/response-models/componenteTextoRegisto-response';
import { ProcessoService } from 'src/app/services/processos.service';
import { TarefaService } from 'src/app/services/tarefa.service';
import { formatDatePT, openErrorsDialog } from 'src/app/utils';

@Component({
  standalone: false,
  selector: 'app-componente-historico-texto',
  templateUrl: './componente-historico-texto.component.html',
  styleUrls: ['./componente-historico-texto.component.css']
})
export class ComponenteHistoricoTextoComponent implements OnInit {

  @Input() isExpanded: boolean = false;
  @Input() tarefaActivoId: number = 0;
  @Input() processoId: number = 0;
  public textos: HistoryText[] = [];
  public errors: string[] = [];
  public noRecords = false;

  constructor(
    private datepipe: DatePipe,
    private tarefaService: TarefaService,
    private processoService: ProcessoService,
    public errorDialog: MatDialog,
  ) { }

  ngOnInit(): void {

    let request: GetHistoricoTextoRequest = { tarefaAtivoId: this.tarefaActivoId };
    let requestProcesso: GetHistoricoTextoProcessoRequest = { processoId: this.processoId };

    (
      this.tarefaActivoId ? this.tarefaService.GetHistoricoTexto(request) :
                            this.processoService.GetHistoricoTexto(requestProcesso)
    ).subscribe(x => {
      this.textos = x.historicoTextos;
      if (x.historicoTextos.length <= 0)
        this.noRecords = true;
    },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.noRecords = true;
        this.showError();
      }
    );
  }


  public formatDate(date: Date): string {
    return formatDatePT(this.datepipe, date);
  }

  public showError() {
    const dialogRef = openErrorsDialog(this.errors, this.errorDialog);

    dialogRef.afterClosed().subscribe(() => {
      this.errors = [];
    });
  }

  public scroll(e: any) {
    e._body.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
