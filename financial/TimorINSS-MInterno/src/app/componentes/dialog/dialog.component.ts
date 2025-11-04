import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from '@ngx-translate/core';

export interface DialogData {
  errors: string[];
}

@Component({
  standalone: false,
  selector: 'app-dialog',
  templateUrl: 'dialog.component.html',
  styleUrls: ['./dialog.component.css'],
})
export class DialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public translate: TranslateService,
    ) {
        let newErrors: string[] = [];
        data.errors.forEach(element => {
          var erro = element;
          if(erro.includes('ÿ'))
          {
            let splitted: string[] = erro.split('ÿ');
            erro = splitted[0];
            splitted.shift();
            newErrors.push(this.stringFormat(this.translate.instant('error.' + erro), splitted));
          }
          else
            newErrors.push(this.translate.instant('error.' + erro));
        });
        data.errors = newErrors;
    }

  public stringFormat(a: any, array: any[]): string {
    for (var k in array) {
      a = a.replace("{" + k + "}", array[k])
    }
    return a;
  }

  public errorTitle = this.translate.instant('error.title');
}
