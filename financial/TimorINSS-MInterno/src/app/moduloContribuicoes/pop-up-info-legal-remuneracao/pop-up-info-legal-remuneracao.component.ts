import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  standalone: false,
  selector: 'app-pop-up-info-legal-remuneracao',
  templateUrl: './pop-up-info-legal-remuneracao.component.html',
  styleUrls: ['./pop-up-info-legal-remuneracao.component.css']
})
export class PopUpInfoLegalRemuneracaoComponent {

  constructor(
    public dialogRef: MatDialogRef<PopUpInfoLegalRemuneracaoComponent>,
    public translate: TranslateService) { }

}
