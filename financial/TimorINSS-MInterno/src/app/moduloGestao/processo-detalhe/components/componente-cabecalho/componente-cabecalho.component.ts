import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  standalone: false,
  selector: 'componente-cabecalho-processo',
  templateUrl: './componente-cabecalho.component.html',
  styleUrls: ['./componente-cabecalho.component.css']
})
export class ComponenteCabecalhoProcessoComponent implements OnInit {

  @Input() isExpanded: boolean = false;
  @Input() nome: string = '';
  @Input() data: string = '';
  @Input() user: string = '';
  @Input() tarefas: number | null = null;
  @Input() arquivado: boolean = false;

  constructor(
    public translate: TranslateService,
  ) { }

  ngOnInit(): void {
  }

  public scroll(e: any)
  {
    e._body.nativeElement.scrollIntoView({behavior: "smooth", block: "start"});
  }
}
