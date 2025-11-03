import { FilterRequest } from './../request-models/utils-request';
import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';
import { TrabalhadoresService } from '../services/trabalhadores.service';
import { TrabalhadorListagemRequest } from '../request-models/trabalhadores-request';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { NgxSpinnerService } from "ngx-spinner";
import { TrabalhadorListagem } from '../response-models/trabalhadores-response';
import { formatDate, openErrorsDialog, openSnackBar, showExpiredError } from '../utils';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PopUpDesvincularTrabalhadorComponent } from '../pop-up-desvincular-trabalhador/pop-up-desvincular-trabalhador.component';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-trabalhadores',
  templateUrl: './trabalhadores.component.html',
  styleUrls: ['./trabalhadores.component.css']
})
export class TrabalhadoresComponent implements OnInit {
  public isLoggedIn = false;
  public errors: string[] = [];
  public displayedColumns: string[] = ['nome','regime','incricaoINSS','dtInicioDeVinculo','dtFimDeVinculo','verEditar'];
  public dataSource: TrabalhadorListagem[] = [];
  public date?: Date;
  private entidadeId: number = 0;
  public totalRows : number = 0;
  public filterBy = '';
  public pageSize = 10;
  public pageIndex = 0;
  public faTimesCircle = faTimesCircle;

  constructor(
    private trabalhadoresService: TrabalhadoresService,
    private tokenStorage: TokenStorageService,
    private spinner: NgxSpinnerService,
    private datepipe: DatePipe,
    public errorDialog: MatDialog,
    public desvincularDialog: MatDialog,
    private router: Router,
    public translate: TranslateService,
    public snackBar: MatSnackBar) {
      this.isLoggedIn = true;
  }

  ngOnInit() {
    if (!this.tokenStorage.getToken()) {
      this.router.navigate([''])
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired())
    {
      let idEntidade = this.tokenStorage.getUser()?.idEntidade;
      if(idEntidade != null)
      {
        this.entidadeId = idEntidade;
        this.getTable();
      }
    }else{
      showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
    }
  }

  public showError()
  {
    const dialogRef = openErrorsDialog(this.errors, this.errorDialog);
    this.hideLoader();

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }

  public dateUpdated() {
    this.filterBy = '';
    this.pageIndex = 0;
    this.pageSize = 5;
    this.getTable();
  }

  public getTable()
  {
    this.showLoader();
    let request: TrabalhadorListagemRequest;
    let filter: FilterRequest;
    filter = {};
    if(this.date != null)
    {
      filter.dateFilterBegin = this.date;
      filter.dateFilterEnd = new Date(moment(this.date).year(), moment(this.date).month() + 1, 0);
    }
    filter.filterBy = this.filterBy;
    filter.index = this.pageIndex;
    filter.rows = this.pageSize
    this.dataSource = [];
    request = {"id": this.entidadeId,"filter": filter};
    this.trabalhadoresService.getTrabalhadoresByEntidadeEmpregadora(request).subscribe(x => {
      x.rows == null ? this.totalRows = 0 : this.totalRows = x.rows;
      x.trabalhadores == null ? this.dataSource = [] : this.dataSource = x.trabalhadores;
      this.hideLoader();
    },
    err => {
      this.dataSource = [];
      err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
    });
  }

  public updateTable(event: any)
  {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getTable();
  }

  public pesquisarPessoa()
  {
    this.date=undefined;
    this.pageIndex = 0;
    this.pageSize = 5;
    this.getTable();
  }

  public clearPesquisarPessoa()
  {
    this.filterBy='';
    this.getTable();
  }

  public showLoader()
  {
    this.spinner.show();
  }

  public hideLoader()
  {
    this.spinner.hide();
  }

  public formatDate(date: Date) : string
  {
    return formatDate(this.datepipe, date);
  }

  public desvincularTrabalhador(Id: number)
  {
    const dialogRef = this.desvincularDialog.open(PopUpDesvincularTrabalhadorComponent, {
         id: 'desvincularDialog',
         minHeight: '300px',
         width: '40%',
         height: '30%',
         panelClass: 'modalWithBorder',
         data: {IdRel: Id}
     });

    dialogRef.afterClosed().subscribe(result => {
      if(result)
      {
        this.getTable();
        openSnackBar(this.translate.instant('snackBar.desvincularTrabalhador'), this.snackBar);
      }
    });
  }

  public adicionarSuspensao() {
    this.router.navigate(['/registoSuspensao/',{suspensao:'trabalhador'}], { skipLocationChange: true })
  }
}
