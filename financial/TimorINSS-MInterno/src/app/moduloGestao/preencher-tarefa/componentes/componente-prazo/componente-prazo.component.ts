import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MyErrorStateMatcher } from 'src/app/matcher';
import { formatDatePT } from 'src/app/utils';

@Component({
  standalone: false,
  selector: 'app-componente-prazo',
  templateUrl: './componente-prazo.component.html',
  styleUrls: ['./componente-prazo.component.css'],
})
export class ComponentePrazoComponent implements OnInit {
  constructor(
    public translate: TranslateService,
    private datepipe: DatePipe,
    ) {}

  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();

  @Input() limit?: number;
  @Input() expireDate: Date = new Date();

  ngOnInit(): void {}

  public formatDate(date: Date): string {
    return formatDatePT(this.datepipe, date);
  }

  public scroll(e: any)
  {
    e._body.nativeElement.scrollIntoView({behavior: "smooth", block: "start"});
  }
}
