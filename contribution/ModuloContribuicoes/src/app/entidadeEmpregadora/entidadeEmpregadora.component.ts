import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../componentes/dialog/dialog.component';
import { NgxSpinnerService } from "ngx-spinner";
import { MatSort } from '@angular/material/sort';
import { buildSelectOptionsWithDisabled, getSelectFilter, openErrorsDialog, SelectsWDisable } from "../utils";
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { DatePipe } from '@angular/common'
import { formatDatePT, openSnackBar } from '../utils';
import { Router } from "@angular/router";
import { FilterRequest } from '../request-models/utils-request';
import { TokenStorageService } from '../services/token-storage.service';
import { EntidadeEmpregadoraService } from '../services/entidadeEmpregadora.service';
import { PopUpAdicionarEditarMoradaComponent } from '../pop-up-adicionar-editar-morada/pop-up-adicionar-editar-morada.component';
import { PopUpAdicionarEditarContatoComponent } from '../pop-up-adicionar-editar-contato/pop-up-adicionar-editar-contato.component';
import { MoradaService } from '../services/morada.service';
import { ContatoService } from '../services/contato.service';
import { MoradaListagem } from '../response-models/morada-response';
import { ContatoListagem } from '../response-models/contato-response';
import { MoradaListagemRequest } from '../request-models/morada-request';
import { ContatoListagemRequest } from '../request-models/contato-request';
import { SelectDescription } from '../response-models/utils-response';
import { MunicipioService } from '../services/municipio.service';
import { PostoAdministrativoService } from '../services/postoAdministrativo.service';
import { SucoService } from '../services/suco.service';
import { AldeiaService } from '../services/aldeia.service';
import { PaisService } from '../services/pais.service';
import { NaturezaJuridicaService } from '../services/naturezaJuridica.service';
import { ActividadeEconomicaService } from '../services/actividadeEconomica.service';
import { SectorActividadeService } from '../services/sectorActividade.service';
import { EntidadeEmpregadoraConsultaResponse } from '../response-models/entidadeEmpregadora-response';
import { EntidadeEmpregadoraDataContract } from '../request-models/entidadeEmpregadora-request';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PopUpNissFacultativoComponent } from '../pop-up-NISSFacultativo/pop-up-NISSFacultativo.component';
import { PopUpWarningComponent } from '../componentes/pop-up-warning/pop-up-warning.component';
import { ListResponsavelLegal } from '../request-models/responsavel-legal-request';
import { ResponsavelLegalService } from '../services/responsavelLegal.service';
import { ResponsavelLegal } from '../models/responsavelLegal';
import { SuspensaoListagem } from '../response-models/suspensao-response';
import { SuspensaoListagemRequest } from '../request-models/suspensao-request';
import { SuspensaoService } from '../services/suspensao.service';
import {MyErrorStateMatcher,MyErrorDataInferiorStateMatcher, MyErrorDataSuperiorStateMatcher, MyErrorDateStateMatcher, MyErrorDateSuperiorDataAtualStateMatcher} from '../matcher';
import { TranslateService } from "@ngx-translate/core";


@Component({
  selector: 'app-entidadeEmpregadora',
  templateUrl: './entidadeEmpregadora.component.html',
  styleUrls: ['./entidadeEmpregadora.component.css']
})

export class EntidadeEmpregadoraComponent implements OnInit {
  public isLoggedIn = false;
  public isLoginFailed = false;
  public errorMessage = "";
  public errors: string[] = [];

  public entidadeEmpregadoraConsulta: EntidadeEmpregadoraConsultaResponse = {
  };
  public entidadeEmpregadoraOriginal: EntidadeEmpregadoraConsultaResponse = <EntidadeEmpregadoraConsultaResponse>{ };

  @ViewChild(MatSort)
  sort: MatSort = new MatSort;

  //region PageIndex
  public pageIndexMoradaTable = 0;
  public pageIndexContatoTable = 0;
  public pageIndexSuspensaoTable = 0;
  public pageIndexRespLegalTable = 0;

  //region TotalRows
  public totalRowsMoradaTable: number = 0;
  public totalRowsContatoTable: number = 0;
  public totalRowsSuspensaoTable: number = 0;
  public totalRowsRespLegalTable: number = 0;

  //region Page Size
  public pageSizeMoradaTable = 5;
  public pageSizeContatoTable = 5;
  public pageSizeSuspensaoTable = 5;
  public pageSizeRespLegalTable = 5;


  //region Display Columns
  public displayedColumnsMorada: string[] = ['rua', 'municipio', 'postoAdministrativo', 'suco', 'aldeia', 'pais', 'moradaPrincipal', 'verEditar'];
  public displayedColumnsContacto: string[] = ['telemovel', 'email', 'verEditar'];
  public displayedColumnsSuspensao: string[] = ['dataInicioSuspensao', 'dataFimSuspensao', 'verEditar'];
  public displayedColumnsResponsavelLegal: string[] = ['nome', 'tin', 'funcao', 'verEditar']

  //Region DataSources
  public dataSourceMorada: MoradaListagem[] = [];
  public dataSourceContacto: ContatoListagem[] = [];
  public dataSourceSuspensao: SuspensaoListagem[] = [];
  public dataSourceResponsavelLegal: ResponsavelLegal[] = [];

  public entidadeId: number = 0;
  public disable = true;
  public disableEdit = false;
  public submittedTry: boolean = false;
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public matcherDateInicioAtividade: MyErrorDateSuperiorDataAtualStateMatcher = new MyErrorDateSuperiorDataAtualStateMatcher();
  public matcherDateInicioTrabServ: MyErrorDateSuperiorDataAtualStateMatcher = new MyErrorDateSuperiorDataAtualStateMatcher();


  //Region Morada
  public municipios: SelectDescription[] = [];
  public postoAdministrativos: SelectDescription[] = [];
  public sucos: SelectDescription[] = [];
  public sucosFilter: SelectDescription[] = [];
  public aldeias: SelectDescription[] = [];
  public aldeiasFilter: SelectDescription[] = [];
  public paises: SelectDescription[] = [];
  public existMoradaPrincipal: boolean = false;
  public naturezaJuridica: SelectsWDisable[] = [];
  public actividadeEconomica: SelectsWDisable[] = [];
  public sectorActividade: SelectsWDisable[] = [];
  public sitInscricao: string = '';

  //Region Resposável Legal
  public respLegalOpenState = false;

  //Region Suspensao
  public suspensaoOpenState = false;


  constructor(
    private entidadeEmpregadoraService: EntidadeEmpregadoraService,
    private tokenStorage: TokenStorageService,
    public datepipe: DatePipe,
    private spinner: NgxSpinnerService,
    private morasdaService: MoradaService,
    private contatoService: ContatoService,
    private suspensaoService: SuspensaoService,
    private responsavelLegalService: ResponsavelLegalService,
    private router: Router,
    public editarMoradaDialog: MatDialog,
    public editarContatoDialog: MatDialog,
    public criarNovoResponsavelLegalDialog: MatDialog,
    public warningDialog: MatDialog,
    private municipioService: MunicipioService,
    private postoAdministrativoService: PostoAdministrativoService,
    private sucoService: SucoService,
    private aldeiaService: AldeiaService,
    private paisService: PaisService,
    private naturezaJuridicaServie: NaturezaJuridicaService,
    private actividadeEconomiciaService: ActividadeEconomicaService,
    private sectorActividadeService: SectorActividadeService,
    public _snackBar: MatSnackBar,
    public errorDialog: MatDialog,
    public translate: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.showLoader();

    if (!this.tokenStorage.getToken()) {
      this.router.navigate([''])
    }

    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      let idEntidade = this.tokenStorage.getUser()?.idEntidade;
      if (idEntidade != null) {
        this.getDadosEntidadeEmpregadora(idEntidade);

        if (this.suspensaoService.savedSuccessfully) {
          this.getDadosEntidadeEmpregadora(idEntidade);
          this.suspensaoOpenState = true;
          this.suspensaoService.savedSuccessfully = false;
          setTimeout(() => {
            document.getElementById("suspensaoGrid")?.scrollIntoView({ behavior: "smooth" });
          }, 300);
        }
      }
    }
  }

  public getDadosEntidadeEmpregadora(idEntidade: number) {

    this.entidadeEmpregadoraService.getEntidadeEmpregadoraByIdEntidade(idEntidade).subscribe(
      response => {
        this.entidadeEmpregadoraConsulta = response;
        this.entidadeEmpregadoraOriginal = JSON.parse(JSON.stringify(response));
        this.situacaoInscricao(this.entidadeEmpregadoraConsulta);

        if (this.entidadeEmpregadoraConsulta.idEntidadeEmpreg != null) {
          this.entidadeId = this.entidadeEmpregadoraConsulta.idEntidadeEmpreg;
          this.getTableMorada();
          this.getListDropDown();
          this.getTableContato();
          this.getTableSuspensao();
          this.getTableResponsavelLegal();
        }
        this.hideLoader();
        if (this.responsavelLegalService.savedSuccessfully || this.responsavelLegalService.traceBack) {
          if (this.responsavelLegalService.savedSuccessfully) {
            openSnackBar(this.translate.instant('snackBar.responsavelGravado'), this._snackBar);
            this.responsavelLegalService.savedSuccessfully = false;
          }
          this.respLegalOpenState = true;
          setTimeout(() => {
            document.getElementById("respLegalGrid")?.scrollIntoView({ behavior: "smooth" });
          }, 300);
          this.responsavelLegalService.traceBack = false;
        }

      },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }

  public getTableMorada() {
    this.showLoader();
    this.dataSourceMorada = [];
    let request: MoradaListagemRequest;
    let filter: FilterRequest;
    filter = {};
    filter.index = this.pageIndexMoradaTable;
    filter.rows = this.pageSizeMoradaTable;
    request = { "id": this.entidadeId, "filter": filter };
    this.dataSourceMorada = [];

    this.morasdaService.getMoradaByIdEntidadeEmpregadora(request).subscribe(x => {
      x.rows == null ? this.totalRowsMoradaTable = 0 : this.totalRowsMoradaTable = x.rows;
      x.morada == null ? this.dataSourceMorada = [] : this.dataSourceMorada = x.morada;
      this.dataSourceMorada.sort;
      this.hideLoader();
    },
    err => {
      this.hideLoader();
      err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
    });
  }

  public getTableContato() {
    this.showLoader();
    this.dataSourceContacto = [];
    let request: ContatoListagemRequest;
    let filter: FilterRequest;
    filter = {};
    filter.index = this.pageIndexContatoTable;
    filter.rows = this.pageSizeContatoTable
    request = { "Id": this.entidadeId, "filter": filter };
    this.dataSourceContacto = [];

    this.contatoService.getContatoByIdEntidadeEmpregadora(request).subscribe(x => {
      x.rows == null ? this.totalRowsContatoTable = 0 : this.totalRowsContatoTable = x.rows;
      x.contato == null ? this.dataSourceContacto = [] : this.dataSourceContacto = x.contato;
      this.dataSourceContacto.sort;
      this.hideLoader();
    },
    err => {
      this.hideLoader();
      err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
    });
  }


  public getTableSuspensao() {
    this.showLoader();
    this.dataSourceSuspensao = [];
    let request: SuspensaoListagemRequest;
    let filter: FilterRequest;
    filter = {};
    filter.index = this.pageIndexSuspensaoTable;
    filter.rows = this.pageSizeSuspensaoTable
    request = { "IdEntidade": this.entidadeId, "IdTrabalhador": 0, "filter": filter };
    this.dataSourceSuspensao = [];

    this.suspensaoService.getSuspensaoByIdEntidadeEmpregadora(request).subscribe(x => {
      x.rows == null ? this.totalRowsSuspensaoTable = 0 : this.totalRowsSuspensaoTable = x.rows;
      x.suspensao == null ? this.dataSourceSuspensao = [] : this.dataSourceSuspensao = x.suspensao;
      this.dataSourceSuspensao.sort;
      this.hideLoader();
    },
    err => {
      this.hideLoader();
      err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
    });
  }


  public getTableResponsavelLegal() {
    this.showLoader();
    this.dataSourceResponsavelLegal = [];
    let request: ListResponsavelLegal;
    let filter: FilterRequest;
    filter = {};
    filter.index = this.pageIndexRespLegalTable;
    filter.rows = this.pageSizeRespLegalTable;
    request = { "id": this.entidadeId, "filter": filter };

    this.responsavelLegalService.getByIdEntidadeEmpregadora(request).subscribe(x => {
      x.rows == null ? this.totalRowsRespLegalTable = 0 : this.totalRowsRespLegalTable = x.rows;
      x.responsavelLegal == null ? this.dataSourceResponsavelLegal = [] : this.dataSourceResponsavelLegal = x.responsavelLegal;
      this.dataSourceResponsavelLegal.sort;
      this.hideLoader();
    },
    err => {
      this.hideLoader();
      err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
    });
  }

  public getListDropDown() {
    this.showLoader();
    let municipios = this.municipioService.getAllMunicipio();
    let postoAdministrativos = this.postoAdministrativoService.getAllPostoAdministrativo();
    let sucos = this.sucoService.getAllSuco();
    let aldeias = this.aldeiaService.getAllAldeia();
    let paises = this.paisService.getAllPais();
    let naturezaJuridica = this.naturezaJuridicaServie.getAllNaturezaJuridica();
    let actividadeEconomica = this.actividadeEconomiciaService.getAllActividadeEconomica();
    let sectorActividade = this.sectorActividadeService.getAllSectorActividade();


    forkJoin([municipios, postoAdministrativos, sucos, aldeias, paises, naturezaJuridica, actividadeEconomica, sectorActividade]).subscribe(([municipios, postoAdministrativos, sucos, aldeias, paises, naturezaJuridica, actividadeEconomica, sectorActividade]) => {
      this.municipios = municipios.selects;
      this.postoAdministrativos = postoAdministrativos.selects;
      this.sucos = sucos.selects;
      this.aldeias = aldeias.selects;
      this.paises = paises.selects;
      this.naturezaJuridica = buildSelectOptionsWithDisabled(naturezaJuridica.selects);
      this.actividadeEconomica = buildSelectOptionsWithDisabled(actividadeEconomica.selects);
      this.sectorActividade = buildSelectOptionsWithDisabled(sectorActividade.selects);
      this.hideLoader();
    },
    err => {
      this.hideLoader();
      err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
    });
  }


  public editarMorada(morada: MoradaListagem) {
    const dialogRef = this.editarMoradaDialog.open(PopUpAdicionarEditarMoradaComponent, {
      id: 'editarMorada',
      minHeight: '200px',
      width: '60%',
      height: '50%',
      panelClass: 'modalWithBorder',
      data: {
        editar: true,
        idEntidadeEmpreg: this.tokenStorage.getUser()?.idEntidade ?? 0,
        idMorada: morada.idMorada,
        rua: morada.rua,
        numPorta: morada.numPorta,
        moradaPrincipal: morada.moradaPrincipal,

        //municipio
        listaMunicipio: buildSelectOptionsWithDisabled(this.municipios, [morada.idMunicipio]),
        idMunicipio: morada.idMunicipio,

        //posto
        listaPosto: this.postoAdministrativos,
        listaPostoFilter:buildSelectOptionsWithDisabled(getSelectFilter(morada.idMunicipio, this.postoAdministrativos), [morada.idPostoAdministrativo]),
        idPostoAdministrativo: morada.idPostoAdministrativo,

        //suco
        listaSuco: this.sucos,
        listaSucoFilter: buildSelectOptionsWithDisabled(getSelectFilter(morada.idPostoAdministrativo, this.sucos), [morada.idSuco]),
        idSuco: morada.idSuco,

        //aldeia
        listaAldeia: this.aldeias,
        listaAldeiaFilter: buildSelectOptionsWithDisabled(getSelectFilter(morada.idSuco, this.aldeias), [morada.idAldeia]),
        idAldeia: morada.idAldeia,

        //pais
        listaPais: buildSelectOptionsWithDisabled(this.paises, [morada.idPais]),
        idPais: morada.idPais,

        moradaListagem: this.dataSourceMorada,

        idTimor: this.paises.filter((c: { nome: string; }) => c.nome === 'Timor-Leste')[0].id

      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTableMorada();
        openSnackBar(this.translate.instant('snackBar.editMorada'), this._snackBar);
      }
    });
  }


  public adicionarMorada() {

    const dialogRef = this.editarMoradaDialog.open(PopUpAdicionarEditarMoradaComponent, {
      id: 'editarMorada',
      minHeight: '200px',
      width: '60%',
      height: '50%',
      panelClass: 'modalWithBorder',
      data: {
        adicionar: true,
        idEntidadeEmpreg: this.tokenStorage.getUser()?.idEntidade ?? 0,
        rua: '',
        moradaPrincipal: false,
        listaMunicipio: buildSelectOptionsWithDisabled(this.municipios),
        listaPosto: this.postoAdministrativos,
        listaSuco: this.sucos,
        listaAldeia: this.aldeias,
        listaPais: buildSelectOptionsWithDisabled(this.paises),
        moradaListagem: this.dataSourceMorada,
        idTimor: this.paises.filter((c: { nome: string; }) => c.nome === 'Timor-Leste')[0].id,
        idPais:  this.paises.filter((c: { nome: string; }) => c.nome === 'Timor-Leste')[0].id
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTableMorada();
        openSnackBar(this.translate.instant('snackBar.saveMorada'), this._snackBar);
      }
    });

  }


  public editarContato(contato: ContatoListagem) {
    const dialogRef = this.editarContatoDialog.open(PopUpAdicionarEditarContatoComponent, {
      id: 'editarContato',
      minHeight: '100px',
      width: '50%',
      height: '40%',
      panelClass: 'modalWithBorder',
      data: {
        editar: true,
        idEntidade: this.tokenStorage.getUser()?.idEntidade ?? 0,
        idContato: contato.idContato,
        telemovel: contato.telemovel,
        email: contato.email,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTableContato();
        openSnackBar(this.translate.instant('snackBar.editContato'), this._snackBar);
      }

    });
  }


  public adicionarContato() {
    const dialogRef = this.editarContatoDialog.open(PopUpAdicionarEditarContatoComponent, {
      id: 'editarContato',
      minHeight: '100px',
      width: '50%',
      height: '40%',
      panelClass: 'modalWithBorder',
      data: {
        adicionar: true,
        idEntidade: this.tokenStorage.getUser()?.idEntidade ?? 0,
        telefone: '',
        email: '',
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTableContato();
        openSnackBar(this.translate.instant('snackBar.saveContato'), this._snackBar);
      }
    });

  }

  public updateMoradaTable(event: any) {
    this.pageIndexMoradaTable = event.pageIndex;
    this.pageSizeMoradaTable = event.pageSize;
    this.getTableMorada();
  }

  public updateContatoTable(event: any) {
    this.pageIndexContatoTable = event.pageIndex;
    this.pageSizeContatoTable = event.pageSize;
    this.getTableContato();
  }

  public updateResponsavelLegalTable(event: any) {
    this.pageIndexRespLegalTable = event.pageIndex;
    this.pageSizeRespLegalTable = event.pageSize;
    this.getTableResponsavelLegal();
  }

  public updateSuspensaoTable(event: any) {
    this.pageIndexSuspensaoTable = event.pageIndex;
    this.pageSizeSuspensaoTable = event.pageSize;
    this.getTableSuspensao();
  }

  public enableSelect() {
    this.disable = false;
    this.disableEdit = true;
  }

  public disableSelect() {
    this.entidadeEmpregadoraConsulta = JSON.parse(JSON.stringify(this.entidadeEmpregadoraOriginal));
    this.disable = true;
    this.disableEdit = false;
    this.submittedTry = false;
  }

  public updateEntidade() {
    this.submittedTry = true;
    let valid = true;
    if (this.entidadeEmpregadoraConsulta.idNaturezaJuridica == 0 || this.entidadeEmpregadoraConsulta.idActividadeEconomica == 0
      || this.entidadeEmpregadoraConsulta.idSectorActividade == 0 ||
      this.entidadeEmpregadoraConsulta.dataInicioActiv == null ||
      this.entidadeEmpregadoraConsulta.dataInicioTrabServico == null) {
      valid = false;
    }


    if (valid) {
      this.showLoader();

      let entidadeEmpregadora = {
        IdEntidadeEmpreg: this.entidadeEmpregadoraConsulta.idEntidadeEmpreg,
        Nome: this.entidadeEmpregadoraConsulta.nome,
        Niss: this.entidadeEmpregadoraConsulta.niss,
        Tin: this.entidadeEmpregadoraConsulta.tin,
        NumTrabalhador: this.entidadeEmpregadoraConsulta.numTrabalhador,
        DataInicioActiv: this.entidadeEmpregadoraConsulta.dataInicioActiv,
        IdNaturezaJuridica: this.entidadeEmpregadoraConsulta.idNaturezaJuridica,
        IdActividadeEconomica: this.entidadeEmpregadoraConsulta.idActividadeEconomica,
        IdSectorActividade: this.entidadeEmpregadoraConsulta.idSectorActividade,
        DataInicioTrabServico: this.entidadeEmpregadoraConsulta.dataInicioTrabServico,
        DtInscricao: this.entidadeEmpregadoraConsulta.dtInscricao,
        DataFimActiv: this.entidadeEmpregadoraConsulta.dataFimActiv,
        DtHoraUltimoAcesso: this.entidadeEmpregadoraConsulta.dtHoraUltimoAcesso
      };
      this.saveEntidade(entidadeEmpregadora);
    }
  }

  public saveEntidade(entidade: EntidadeEmpregadoraDataContract) {
    let request = {
      EntidadeEmpregadora: entidade
    }

    this.entidadeEmpregadoraService.updateEntidadeEmpregadora(request).subscribe(x => {
      this.hideLoader();
      this.disableSelect();
      this.getDadosEntidadeEmpregadora(this.entidadeId);
      openSnackBar(this.translate.instant('snackBar.dadosAtualizados'), this._snackBar);
    },
    err => {
      this.hideLoader();
      this.disableSelect();
      err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
    });
  }

  public showLoader() {
    this.spinner.show();
  }


  public hideLoader() {
    this.spinner.hide();
  }
  public showError()
  {
    const dialogRef = openErrorsDialog(this.errors, this.errorDialog);
    this.hideLoader();

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }


  public formatDate(date: Date | undefined): string {
    return formatDatePT(this.datepipe, date);
  }

  public situacaoInscricao(entidadeEmpregadoraConsulta: EntidadeEmpregadoraConsultaResponse) {
    if (entidadeEmpregadoraConsulta.situacInscricao == 'A') {
      this.sitInscricao = this.translate.instant('general.select_enabled');
    }
    if (entidadeEmpregadoraConsulta.situacInscricao == 'I') {
      this.sitInscricao= this.translate.instant('general.select_disabled');
    }

    if (entidadeEmpregadoraConsulta.situacInscricao == 'S') {
      this.sitInscricao = this.translate.instant('general.select_suspended');
    }
  }

  public adicionarResponsavelLegal(): void {
    const dialogRef = this.criarNovoResponsavelLegalDialog.open(PopUpNissFacultativoComponent, {
      id: 'desvincularDialog',
      minHeight: '300px',
      width: '40%',
      height: '35%',
      panelClass: 'modalWithBorder',
    });
    dialogRef.afterClosed().subscribe(() => { });
  }

  public deleteMorada(data: any) {
    const dialogRef = this.warningDialog.open(PopUpWarningComponent, {
      id: 'deleteMoradaDialog',
      minHeight: '300px',
      width: '40%',
      height: '30%',
      panelClass: 'warningModal',
      data: { function: this.morasdaService.deleteMorada({ id: data.idMorada }), msg: this.translate.instant('warnings.warningDeleteMorada') }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTableMorada();
        openSnackBar(this.translate.instant('snackBar.addressRemoved'), this._snackBar);
      }
    });
  }

  public deleteContato(data: any) {
    const dialogRef = this.warningDialog.open(PopUpWarningComponent, {
      id: 'deleteContatoDialog',
      minHeight: '300px',
      width: '40%',
      height: '30%',
      panelClass: 'warningModal',
      data: { function: this.contatoService.deleteContato({ id: data.idContato }), msg: this.translate.instant('warnings.warningDeleteContato') }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTableContato();
        openSnackBar(this.translate.instant('snackBar.contactRemoved'), this._snackBar);
      }
    });
  }

  public deleteResponsavelLegal(data: any) {
    const dialogRef = this.warningDialog.open(PopUpWarningComponent, {
      id: 'deleteContatoDialog',
      minHeight: '300px',
      width: '40%',
      height: '30%',
      panelClass: 'warningModal',
      data: { function: this.responsavelLegalService.deleteResponsavelLegal({ id: data.idResponsavelLegal }), msg: this.translate.instant('warnings.deleteResponsavel') }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTableResponsavelLegal();
        openSnackBar(this.translate.instant('snackBar.responsavelRemoved'), this._snackBar);
      }
    });
  }

  public editarResponsavelLegal(data: any) {
    this.router.navigate(['/editarResponsavelLegal/' + data.idResponsavelLegal],);
  }

  public adicionarSuspensao() {
    this.router.navigate(['/registoSuspensao/', { suspensao: 'entidade' }],)
  }

  deleteSuspensao(data: any) {
    const dialogRef = this.warningDialog.open(PopUpWarningComponent, {
      id: 'deleteSuspensaoDialog',
      minHeight: '300px',
      width: '40%',
      height: '30%',
      panelClass: 'warningModal',
      data: { function: this.suspensaoService.deleteSuspensao({ id: data.idSuspensao }), msg: this.translate.instant('warnings.warningDeleteSuspensao') }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTableSuspensao();
        this.getDadosEntidadeEmpregadora(this.entidadeId);
        openSnackBar(this.translate.instant('snackBar.removeSuspensao'), this._snackBar);
      }
    });
  }


  public submitEntidade(){
    this.submittedTry = true;
  }

  public scroll(e: any)
  {
    e._body.nativeElement.scrollIntoView({behavior: "smooth", block: "center"});
  }
}
