import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MyErrorStateMatcher } from 'src/app/matcher';
import { TextosComponent } from 'src/app/models/preencherTarefa';

@Component({
  selector: 'app-componente-texto',
  templateUrl: './componente-texto.component.html',
  styleUrls: ['./componente-texto.component.css']
})

export class ComponenteTextoComponent implements OnInit {

  constructor(
    public translate: TranslateService,
  ) { }

  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();

  //Two way binding example
  @Input() request = <TextosComponent>{};
  @Output() requestChange: EventEmitter<TextosComponent> = new EventEmitter<TextosComponent>();

  ngOnInit(): void {
    if (this.request.obrigatorioAoArquivar && this.request.hasArquivar)
      this.request.obrigatorio = true;
    if (this.request.obrigatorioAoArquivar2 && this.request.hasArquivar)
      this.request.obrigatorio2 = true;
  }

  changeValue() {
    //Emit for the output value 
    this.requestChange.emit(this.request);
  }

  public scroll(e: any)
  {
    e._body.nativeElement.scrollIntoView({behavior: "smooth", block: "start"});
  }
}
