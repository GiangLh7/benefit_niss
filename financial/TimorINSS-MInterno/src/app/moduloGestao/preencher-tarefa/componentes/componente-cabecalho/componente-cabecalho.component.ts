import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { TrabalhadoresService } from 'src/app/services/trabalhadores.service';

@Component({
  standalone: false,
  selector: 'componente-cabecalho',
  templateUrl: './componente-cabecalho.component.html',
  styleUrls: ['./componente-cabecalho.component.css']
})
export class ComponenteCabecalhoComponent implements OnInit {

  @Input() isExpanded: boolean = false;
  @Input() numProcesso: string = '';
  @Input() nomeProcesso: string = '';
  @Input() nomeTarefa: string = '';

  public username? = '';

  constructor(
    public translate: TranslateService,
    private tokenStorageService: TokenStorageService,
  ) { }

  ngOnInit(): void {
    const user = this.tokenStorageService.getUser();
    this.username = user?.username;
  }

  public scroll(e: any)
  {
    e._body.nativeElement.scrollIntoView({behavior: "smooth", block: "start"});
  }
}
