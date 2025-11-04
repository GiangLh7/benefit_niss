import { ParametrosAdicionais } from './../../models/camposEditaveis';
import { DominiosService } from '../../services/dominios.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin } from 'rxjs';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { DominioDescricaoString } from '../../response-models/dominios-response';
import { CamposEditaveisService } from '../../services/camposEditaveis.service';
import { openErrorsDialog, openSnackBar, showExpiredError } from '../../utils';
import { FilterRequest } from '../../request-models/utils-request';
import { PopUpGravarCampoComponent } from '../pop-up-gravar-campo/pop-up-gravar-campo.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Funcionalidades, SelectDescription } from '../../models/utils';
import { CamposEditaveisListagem } from '../../response-models/camposEditaveis-response';
import { PopUpWarningComponent } from '../../componentes/pop-up-warning/pop-up-warning.component';
import { CamposEditaveisParents,  ValorCamposEditaveis } from '../../models/camposEditaveis';
import { PopUpGravarRegimeComponent } from '../pop-up-gravar-regime/pop-up-gravar-regime.component';
import { TokenStorageService } from 'src/app/services/token-storage.service';

@Component({
  standalone: false,
  selector: 'app-gerir-campos-editaveis',
  templateUrl: './gerir-campos-editaveis.component.html',
  styleUrls: ['./gerir-campos-editaveis.component.css']
})
export class GerirCamposEditaveisComponent implements OnInit {

  public errors: string[] = [];
  public faTimesCircle = faTimesCircle;

  public gruposCampos: DominioDescricaoString[] = [];
  public camposEditaveis: CamposEditaveisListagem[] = [];
  public camposEditaveisSelected: CamposEditaveisListagem[] = [];
  public valoresCamposEditaveis: ValorCamposEditaveis[] = [];
  public valoresCamposEditavelParent: CamposEditaveisParents = <CamposEditaveisParents>{};

  public selectedGroup: DominioDescricaoString = <DominioDescricaoString>{};
  public selectedCampo: CamposEditaveisListagem = <CamposEditaveisListagem>{};

  public campoParametros: ParametrosAdicionais[] = [];

  public displayedColumns: string[] = []

  public totalRows: number = 0;
  public pageSize: number = 20;
  public pageIndex: number = 0;
  public filterByTemp: string = '';
  public filterBy: string = '';

  public create: boolean = false;
  public read: boolean = false;
  public update: boolean = false;
  public delete: boolean = false;

  public kids: CamposEditaveisListagem[] = [];
  public selectedParents: string[] = [];
  //stack with selected values from the hierarchy tree
  public selectedValues: number[] = [];

  public selectedTable: number = 0;

  public parentHasInitialValue: boolean = false;

  constructor(
    private router: Router,
    private tokenStorage: TokenStorageService,
    private spinner: NgxSpinnerService,
    private dominiosService: DominiosService,
    private camposEditaveisService: CamposEditaveisService,
    public errorDialog: MatDialog,
    public gravarCampoDialog: MatDialog,
    public translate: TranslateService,
    public snackBar: MatSnackBar) { }

  ngOnInit(): void {
    if (!this.tokenStorage.getToken()) {
      this.router.navigate([''])
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired())
    {

      if (this.tokenStorage.getUser() && this.tokenStorage.getUser()?.permissions) {

        this.tokenStorage.getUser()?.permissions.forEach(permission => {

          if (permission.idFuncionalidade == Funcionalidades.CamposEditaveis) {
            this.create = permission.create;
            this.read = permission.read;
            this.update = permission.update;
            this.delete = permission.delete;
          }
        });
      }

      if(this.create)
      {
        this.showLoader();
        var grupos = this.dominiosService.GetAllGruposCamposEditaveis();
        var campos = this.camposEditaveisService.GetAllCamposEditaveis();
        forkJoin([grupos,campos]).subscribe(([grupos,campos]) => {
          this.gruposCampos = grupos.dominios;
          this.camposEditaveis = campos.campos;
          this.hideLoader();
        },
        err => {
          err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.showError();
          this.hideLoader();
        });
      }
    }
    else{
      showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
    }
  }

  public updateCamposEditaveis()
  {
    this.camposEditaveisSelected = this.camposEditaveis.filter(c => c.dominioFk == this.selectedGroup.id && !c.campoPaiFk);
    this.selectedCampo = <CamposEditaveisListagem>{};
  }

  public updateValorCampoEditavel()
  {
    this.resetTable();
    this.clearSearch();
    this.selectedValues = [];
    this.updateTable();
  }

  public updateTableWithStack()
  {
    if(this.selectedValues.length > 0)
    {
      let stackId = this.selectedValues[this.selectedValues.length-1];
      this.updateTable(stackId);
    }
    else
      this.updateTable();
  }

  public searchCampo()
  {
    this.filterBy = this.filterByTemp;
    this.resetTable();
    this.updateTableWithStack();
  }

  public updateTable(parentId?: number)
  {
    this.showLoader();

    this.selectedTable = 0;
    if(this.selectedCampo.nome == 'Regime')
      this.selectedTable = 1;
    else if(this.selectedCampo.nome == 'Dados Regime')
      this.selectedTable = 2;
    else if(this.selectedCampo.nome == 'Período de vigência da estrutura do orçamento' || this.selectedCampo.nome == 'Período de vigência')
      this.selectedTable = 3;
    else if(this.selectedCampo.nome == 'Tipo de conta (1.º nível)' || this.selectedCampo.nome == 'Agrupamento' ||
            this.selectedCampo.nome == 'SubAgrupamento' || this.selectedCampo.nome == 'Rúbrica' ||
            this.selectedCampo.nome == 'Alínea' || this.selectedCampo.nome == 'SubAlínea' || this.selectedCampo.nome.startsWith('Código de conta ('))
        this.selectedTable = 4;

    this.valoresCamposEditaveis = [];
    this.valoresCamposEditavelParent = <CamposEditaveisParents>{};
    this.totalRows = 0;

    let filter = <FilterRequest>{
      filterField: parentId,
      filterBy: this.filterBy,
      index: this.pageIndex,
      rows: this.pageSize
    };

    this.kids = this.camposEditaveis.filter(c => c.campoPaiFk == this.selectedCampo.idCampoEditavel);

    var request = {
      campoEditavelId: this.selectedCampo.idCampoEditavel,
      filter: filter
    };

    this.displayedColumns = [];

    this.camposEditaveisService.GetValorCampoEditavel(request)
    .subscribe(res => {
      this.valoresCamposEditaveis = res.valuesCampo;
      this.parentHasInitialValue = res.valuesCampo.filter(x => x.parentHasInitialValue == true).length > 0
      this.valoresCamposEditavelParent = res.valuesCampoParents;
      this.totalRows = res.countValuesCampo;
      this.campoParametros = res.parametros;

      this.prepareTableNames();
    },
    err => {
      err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
      this.hideLoader();
    });
  }

  public prepareTableNames()
  {
    this.selectedParents = [];
    if(this.selectedCampo.campoPaiFk && this.valoresCamposEditavelParent && this.valoresCamposEditaveis)
    {
      var parent;
      this.valoresCamposEditaveis.forEach(element => {
        parent = this.valoresCamposEditavelParent.valores.find(e => e.id == element.parentId);
        if(parent)
          this.selectedParents.push(parent.nome);
      });
    }

    this.displayedColumns = [];

    if(this.selectedTable == 4)
      this.displayedColumns.push('codigo');

    if(this.selectedTable != 3)
      this.displayedColumns.push('nome');

    if(this.selectedTable == 2 || this.selectedTable == 3)
    {
      this.displayedColumns.push('dataInicio','dataFim');
    }

    if(this.valoresCamposEditavelParent)
      this.displayedColumns.push(this.valoresCamposEditavelParent.nome);

    this.displayedColumns.push('editarEliminar');

    this.hideLoader();
  }

  public clearSearchHtml()
  {
    this.clearSearch();
    this.updateTableWithStack();
  }

  public clearSearch()
  {
    this.filterByTemp = '';
    this.filterBy = '';
    this.resetTable();
  }

  public goToChild(valorCampo: ValorCamposEditaveis, kid: CamposEditaveisListagem)
  {
    this.selectedCampo = kid;
    this.clearSearch();
    this.resetTable();
    this.selectedValues.push(valorCampo.id);
    this.updateTable(valorCampo.id);
  }

  public goToParent()
  {
    let parentId = this.selectedCampo.campoPaiFk;
    let parent = this.camposEditaveis.find(c => c.idCampoEditavel == parentId)
    if(parent)
    {
      this.selectedCampo = parent;
      this.clearSearch();
      this.resetTable();
      this.selectedValues.pop();
      let stackId = this.selectedValues[this.selectedValues.length-1];
      this.updateTable(stackId);
    }
  }

  public resetTable()
  {
    this.pageIndex = 0;
  }

  public updateTablePaginator(event: any)
  {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateTableWithStack();
  }

  public gravarCampo(edicao: boolean, element?: ValorCamposEditaveis)
  {
    let popUpValue = <ValorCamposEditaveis>{parametros: this.selectedCampo.parametros};
    if(element)
    {
      popUpValue = element;
    }

    var parent;
    if(this.selectedValues.length > 0)
    {
      parent = this.selectedValues[this.selectedValues.length-1];
      popUpValue.parentId = parent;
    }

    if(this.campoParametros)
      this.campoParametros.forEach(e => {
        var parameter = popUpValue.parametros.find(p => p.nome == e.nome);
        if(parameter)
        {
          parameter.valuesList = e.valuesList;
        }
      });

    const dialogRef = this.gravarCampoDialog.open(PopUpGravarCampoComponent, {
      id: 'gravarCampo',
      minHeight: '300px',
      width: '70%',
      height: '60%',
      panelClass: 'modalWithBorder',
      data: {
        edicao: edicao,
        valorCampo:  JSON.parse(JSON.stringify(popUpValue)),
        valoresCamposEditavelParent:  JSON.parse(JSON.stringify(this.valoresCamposEditavelParent)),
        idSelectedCampo: this.selectedCampo.idCampoEditavel,
        parentId: parent,
        campo: this.selectedCampo
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result)
      {
        this.updateTableWithStack();
        openSnackBar(this.translate.instant('snackBar.campoGravadoSucesso'), this.snackBar);
      }
    });
  }

  public confirmDeleteCampo(element: SelectDescription)
  {
    const dialogRef = this.errorDialog.open(PopUpWarningComponent, {
      id: 'warnDeleteCampo',
      minHeight: '300px',
      width: '40%',
      height: '35%',
      panelClass: 'warningModal',
      data: { msg: 'gerirCampos.confirmDelete' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteCampo(element);
      }
    });
  }

  public deleteCampo(element: SelectDescription)
  {
    this.showLoader();

    var request = {
      idValorCampo: element.id,
      idCampo: this.selectedCampo.idCampoEditavel
    };

    this.camposEditaveisService.DeleteValorCampoEditavel(request)
    .subscribe(res => {
      this.updateTableWithStack();
      openSnackBar(this.translate.instant('snackBar.campoEliminadoSucesso'), this.snackBar);
    },
    err => {
      err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
      this.hideLoader();
    });
  }

  public goToEscalao(valorCampo: ValorCamposEditaveis)
  {
    var escalao = this.camposEditaveis.find(c => c.nome == 'Escalão');
    if(escalao)
    {
      this.selectedCampo = escalao;
      this.clearSearch();
      this.resetTable();
      this.selectedValues.push(valorCampo.id);
      this.updateTable(valorCampo.id);
    }
  }

  public goToDadosRegime(valorCampo: ValorCamposEditaveis)
  {
    var dadosRegimes = this.camposEditaveis.find(c => c.nome == 'Dados Regime');
    if(dadosRegimes)
    {
      this.selectedCampo = dadosRegimes;
      this.clearSearch();
      this.resetTable();
      this.selectedValues.push(valorCampo.id);
      this.updateTable(valorCampo.id);
    }
  }

  public gravarRegime(edicao: boolean, element?: ValorCamposEditaveis)
  {
    let popUpValue = <ValorCamposEditaveis>{parametros: this.selectedCampo.parametros};
    if(element)
      popUpValue = element;

    const dialogRef = this.gravarCampoDialog.open(PopUpGravarRegimeComponent, {
      id: 'gravarRegime',
      minHeight: '300px',
      width: '70%',
      height: '60%',
      panelClass: 'modalWithBorder',
      data: {
        edicao: edicao,
        valorCampo:  JSON.parse(JSON.stringify(popUpValue))
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result)
      {
        this.updateTableWithStack();
        openSnackBar(this.translate.instant('snackBar.campoGravadoSucesso'), this.snackBar);
      }
    });
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

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }

}
