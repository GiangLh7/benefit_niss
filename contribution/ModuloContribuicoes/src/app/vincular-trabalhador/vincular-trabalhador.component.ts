import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { PopUpVincularTrabalhadorComponent } from '../pop-up-vincular-trabalhador/pop-up-vincular-trabalhador.component';
import { FilterRequest } from '../request-models/utils-request';
import { DominioDescricaoString } from '../response-models/dominios-response';
import { VincularTrabalhadorListagem } from '../response-models/trabalhadores-response';
import { SelectDescription } from '../response-models/utils-response';
import { DominiosService } from '../services/dominios.service';
import { EscaloesService } from '../services/escaloes.service';
import { TokenStorageService } from '../services/token-storage.service';
import { TrabalhadoresService } from '../services/trabalhadores.service';
import { openErrorsDialog, openSnackBar, showExpiredError } from '../utils';

@Component({
  selector: 'app-vincular-trabalhador',
  templateUrl: './vincular-trabalhador.component.html',
  styleUrls: ['./vincular-trabalhador.component.css']
})
export class VincularTrabalhadorComponent implements OnInit {
  public searchOptions: any[] = [{
    id: 'Nome',
    text: 'general.nome',
  },
  {
    id: 'NISS',
    text: 'general.niss',
  },
  {
    id: 'NISS Provisório',
    text: 'vinculo.nissProv',
  },
  {
    id: 'Documento Identificação',
    text: 'vinculo.documentoIdentificacao',
  }];
  public errors: string[] = [];
  public displayedColumns: string[] = ['select','nome','niss','nissProvisorio'];
  public dataSource: VincularTrabalhadorListagem[] = [];
  public faTimesCircle = faTimesCircle;
  public totalRows : number = 0;
  public selected: number = 0;
  public tiposDocumento: DominioDescricaoString[] = [];
  public documentType: number = 0;
  private regimes: DominioDescricaoString[] = [];
  private tiposContracto: DominioDescricaoString[] = [];
  private naturezasContracto: DominioDescricaoString[] = [];
  private leiLaboraisAplicaveis: DominioDescricaoString[] = [];
  private entidadeId: number = 0;
  public searched: boolean = false;
  public showSearchButton: boolean = false;
  public isSearchByDocument: boolean = false;
  public isSearchByString: boolean = true;
  public escaloes: SelectDescription[] = [];
  private profissoes: DominioDescricaoString[] = [];
  public filter: FilterRequest = {rows: 5, filterField: '', filterBy: '', index: 0};

  constructor(
      private trabalhadoresService: TrabalhadoresService,
      private dominiosService: DominiosService,
      private escaloesService: EscaloesService,
      private tokenStorage: TokenStorageService,
      private router: Router,
      private spinner: NgxSpinnerService,
      public errorDialog: MatDialog,
      public novoVinculoDialog: MatDialog,
      public translate: TranslateService,
      public snackBar: MatSnackBar
    ) { }

  ngOnInit(): void {
    if(!this.tokenStorage.getToken()){
        this.router.navigate(['']);
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired())
    {
      let idEntidade = this.tokenStorage.getUser()?.idEntidade;
      if(idEntidade != null)
      {
        this.entidadeId = idEntidade;
        this.showLoader();
        let tiposContracto = this.dominiosService.getAllTiposDeContracto();
        let naturezas = this.dominiosService.getAllNaturezasDeContracto();
        let leis = this.dominiosService.getAllLeisLaboraisAplicaveis();
        let tiposDocumento = this.dominiosService.getAllTiposDeDocumento();
        let regimes = this.dominiosService.GetAllRegimes();
        let escaloes = this.escaloesService.GetAllEscaloes();
        let profissoes = this.dominiosService.getAllProfissoes();

        forkJoin([tiposContracto,naturezas,leis,tiposDocumento,regimes,escaloes,profissoes])
          .subscribe(([tiposContracto,naturezas,leis,tiposDocumento,regimes,escaloes, profissoes]) => {
            this.tiposContracto = tiposContracto.dominios.filter(d => d.indActivo);
            this.naturezasContracto = naturezas.dominios.filter(d => d.indActivo);
            this.leiLaboraisAplicaveis = leis.dominios.filter(d => d.indActivo);
            this.tiposDocumento = tiposDocumento.dominios;
            this.regimes = regimes.regimes.filter(d => d.indActivo);
            this.escaloes = escaloes.selects.filter(d => d.indActivo);
            this.profissoes  = profissoes.dominios.filter(d => d.indActivo);
            this.hideLoader();
        },
        err => {
          this.dataSource = [];
          err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.showError();
        });
      }
    }
    else{
      showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
    }
  }

  pesquisarPessoa() {
    this.filter.index = 0;
    this.filter.rows = 5;
    this.getTable();
  }

  clearPesquisarPessoa()
  {
    this.filter.filterBy ='';
  }

  updateSearchType()
  {
    this.clearPesquisarPessoa()
    if(this.filter.filterField)
      this.isSearchByString = this.filter.filterField === 'Nome';
    else
      this.isSearchByString = false;
    this.updateShowSearchButton();
  }

  updateIsSearchByDocument(){
    if(this.filter.filterField)
      this.isSearchByDocument = (this.filter.filterField === 'Documento Identificação');
    else
      this.isSearchByDocument = false;
  }

  updateTable(event: any)
  {
    this.filter.index = event.pageIndex;
    this.filter.rows = event.pageSize;
    this.getTable();
  }

  getTable()
  {
    this.showLoader();
    this.selected = 0;
    let innerFilter = undefined;

    if(this.documentType > 0)
      innerFilter = {
        filterField: this.documentType.toString()
      };

    this.filter.filter = innerFilter;
    let request = {
      filter: this.filter,
    };
    this.trabalhadoresService.getTrabalhadoresByFilter(request).subscribe(x => {
      x.trabalhadores == null ? this.dataSource = [] : this.dataSource = x.trabalhadores;
      this.totalRows = x.rows;
      this.hideLoader();
      this.searched = true;
    },
    err => {
      this.dataSource = [];
      err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
    });
  }

  showLoader()
  {
    this.spinner.show();
  }


  hideLoader()
  {
    this.spinner.hide();
  }

  showError()
  {
    const dialogRef = openErrorsDialog(this.errors, this.errorDialog);
    this.hideLoader();

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }

  novoVinculo()
  {
    const dialogRef = this.novoVinculoDialog.open(PopUpVincularTrabalhadorComponent, {
      id: 'novoVinculo',
      minHeight: '300px',
      width: '80%',
      height: '85%',
      panelClass: 'modalWithBorder',
      data: {
        entidade: this.entidadeId,
        trabalhador: this.selected,
        tiposContratos: this.tiposContracto,
        naturezaContratos: this.naturezasContracto,
        leisLabAplicavel: this.leiLaboraisAplicaveis,
        regimes: this.regimes,
        escaloes: this.escaloes,
        profissoes: this.profissoes
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result)
      {
        this.getTable();
        openSnackBar(this.translate.instant('snackBar.vincularTrabalhador'), this.snackBar);
      }
    });
  }

  updateShowSearchButton() {
    if(!this.isSearchByDocument && this.filter.filterField)
      this.showSearchButton = true;
    else
      this.showSearchButton = (this.isSearchByDocument && this.documentType > 0);
  }

  updateSelect(event : any, id : number) {
    if(this.selected === id)
      this.selected = 0;
    else
      this.selected = id;
  }

  updateView() {
    this.updateIsSearchByDocument();
    this.updateSearchType();
  }
}
