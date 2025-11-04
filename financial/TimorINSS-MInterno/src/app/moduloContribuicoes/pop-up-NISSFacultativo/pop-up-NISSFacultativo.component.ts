import { Component } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from "ngx-spinner";
import { TrabalhadorListagemNissRequest} from "../../request-models/trabalhadores-request";
import { TrabalhadoresService } from "../../services/trabalhadores.service";
import { openErrorsDialog } from "../../utils";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { MyErrorStateMatcher } from "../../matcher";


@Component({
  standalone: false,
  selector: 'app-pop-up-NISSFacultativo.component',
  templateUrl: 'pop-up-NISSFacultativo.component.html',
  styleUrls: ['./pop-up-NISSFacultativo.component.css']
})
export class PopUpNissFacultativoComponent {
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public errors: string[] = [];
  public request = <TrabalhadorListagemNissRequest>{};
  private trabalhadorId = <number>{};
  public IndFacultivaSS = false;
  public faTimesCircle = faTimesCircle;
  public submittedFormError = false;
  constructor(
    public dialogRef: MatDialogRef<PopUpNissFacultativoComponent>,
    private spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    public translate: TranslateService,
    private trabalhadoresService: TrabalhadoresService,
    private router: Router,
    ) {
    }

  public cancel(): void {
        this.dialogRef.close();
      }

  public onProceed(): void {
      this.showLoader();

      if (this.IndFacultivaSS){
        if (!this.request.niss){
          this.submittedFormError = true;
          this.hideLoader();
          return;
        }
        else {
          this.trabalhadoresService.GetSingleByNiss(this.request).subscribe(x => {
            this.hideLoader();
            if (x.trabalhadores){
                this.trabalhadorId = x.trabalhadores[0].id;
                this.router.navigate(['/novoResponsavelLegal/' + this.trabalhadorId],);
            }
            else{
                this.errors.push('-3');
                this.showError();
            }
            this.dialogRef.close(true);
          },
          (err: any) => {
            this.hideLoader();
            err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
            this.showError();
            //this.dialogRef.close(true);
          });
        }
      }else
      {
        this.hideLoader();
        this.router.navigate(['/novoResponsavelLegal'],);
        this.dialogRef.close();
      }
  }

  private showLoader()
  {
    this.spinner.show();
  }


  private hideLoader()
  {
    this.spinner.hide();
  }

  private showError()
  {
    const dialogRef = openErrorsDialog(this.errors, this.errorDialog);

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }

  public resetNiss() : void{
      this.request.niss = <string>{};
  }
}
