import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material/dialog';
import { openErrorsDialog, showExpiredError, formatDate, formatDatePT } from 'src/app/utils';
import { TranslateService } from '@ngx-translate/core';
import { GetProcessoDataRequest } from 'src/app/request-models/processo-request';
import { ProcessoService } from 'src/app/services/processos.service';
import { ProcessoDataResponse } from 'src/app/response-models/processo-response';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-processo-detalhe',
  templateUrl: './processo-detalhe.component.html',
  styleUrls: ['./processo-detalhe.component.css'],
})
export class ProcessoDetalheComponent implements OnInit {
  public errors: string[] = [];
  public processoId: number = 0;
  public processoData: ProcessoDataResponse | null = null;
  public refreshDocTable = false;
  private from?: string;

  constructor(
    private router: Router,
    private tokenStorage: TokenStorageService,
    private spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    public translate: TranslateService,
    private actRoute: ActivatedRoute,
    private processoService: ProcessoService,
    private datepipe: DatePipe,
  ) {
    this.from = this.router.getCurrentNavigation()?.extras.state?.from;
  }

  ngOnInit(): void {
    if (!this.tokenStorage.getToken()) {
      this.router.navigate(['']);
    } else if (
      this.tokenStorage.getToken() &&
      !this.tokenStorage.tokenExpired()
    ) {
      let id = this.actRoute.snapshot.params.id;
      this.processoId = id;

      this.showLoader();

      //serviço para ir buscar todos os dados necessários para as componentes
      let getDataRequest = <GetProcessoDataRequest> {processoId: this.processoId};
      let getTarefaDataService = this.processoService.GetProcessoData(getDataRequest);

      getTarefaDataService.subscribe((response: any) => {
        this.processoData = response.data;
        this.hideLoader();
      },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
        this.router.navigate([''])
      });

    } else {
      showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
    }
  }

  public showLoader() {
    this.spinner.show();
  }

  public hideLoader() {
    this.spinner.hide();
  }

  public showError() {
    const dialogRef = openErrorsDialog(this.errors, this.errorDialog);
    this.hideLoader();

    dialogRef.afterClosed().subscribe((result) => {
      this.errors = [];
    });
  }

  public voltar() {    
    this.router.navigate([this.from || './processosArquivados'], { skipLocationChange: true });
  }

  public refreshDocTableEvent(event: any) {
    if (event == true) {
      this.refreshDocTable = true;
    }
  }
  public tableRefreshed(event: any) {
    if (event == true) {
      this.refreshDocTable = false;
    }
  }

  public formatDate(date: Date): string {
    return formatDate(this.datepipe, date);
  }


  public formatDatePT(date: Date): string {
    return formatDatePT(this.datepipe, date);
  }
}
