import { MaxSizeValidator } from '@angular-material-components/file-input';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { faFilePdf, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin, Observable } from 'rxjs';
import { MyErrorDataSuperiorStateMatcher, MyErrorStateDependentMatcher, MyErrorStateMatcher, NotRequiredErrorStateMatcher } from '../../matcher';
import { Documento } from '../../models/documento';
import { INSSEstrangeiro } from '../../models/inssEstrangeiro';
import { Morada } from '../../models/morada';
import { RelEntidadeTrabalhador, RelEntidadeTrabalhadorRegime } from '../../models/relEntidadeTrabalhador';
import { PopUpAdicionarEditarContatoComponent } from '../pop-up-adicionar-editar-contato/pop-up-adicionar-editar-contato.component';
import { PopUpAdicionarEditarDocumentoComponent } from '../pop-up-adicionar-editar-documento/pop-up-adicionar-editar-documento.component';
import { PopUpAdicionarEditarMoradaComponent } from '../pop-up-adicionar-editar-morada/pop-up-adicionar-editar-morada.component';
import { PopUpWarningComponent } from '../../componentes/pop-up-warning/pop-up-warning.component';
import { ContatoListagemRequest } from '../../request-models/entidadeEmpregadora-request';
import { MoradaListagemRequest } from '../../request-models/morada-request';
import { SuspensaoListagemRequest } from '../../request-models/suspensao-request';
import { TrabalhadorListagemRequest } from '../../request-models/trabalhadores-request';
import { FilterRequest } from '../../request-models/utils-request';
import { DocumentoListagem } from '../../response-models/documentos-response';
import { DominioDescricaoString } from '../../response-models/dominios-response';
import { MoradaListagem } from '../../response-models/morada-response';
import { SuspensaoListagem } from '../../response-models/suspensao-response';
import { SelectDescription } from '../../models/utils';
import { AldeiaService } from '../../services/aldeia.service';
import { DocumentoService } from '../../services/documento.service';
import { DominiosService } from '../../services/dominios.service';
import { EscaloesService } from '../../services/escaloes.service';
import { MunicipioService } from '../../services/municipio.service';
import { PaisService } from '../../services/pais.service';
import { PostoAdministrativoService } from '../../services/postoAdministrativo.service';
import { RelEntidadeTrabalhadorService } from '../../services/relEntidadeTrabalhador.service';
import { SucoService } from '../../services/suco.service';
import { SuspensaoService } from '../../services/suspensao.service';
import { TokenStorageService } from '../../services/token-storage.service';
import { base64ArrayBuffer, base64ToArrayBuffer, buildSelectOptionsWithDisabled, formatDatePT, getSelectFilter, openErrorsDialog, openErrorSnackBar, openSnackBar, RegexPatterns, SelectsWDisable, showExpiredError } from '../../utils';
import { Contacto } from './../../models/contacto';
import { Trabalhador } from './../../models/trabalhador';
import { DocumentosListagemRequest } from './../../request-models/documentos-request';
import { ContatoListagem } from './../../response-models/contato-response';
import { ContatoService } from './../../services/contato.service';
import { InssEstrangeiroService } from './../../services/inssEstrangeiro.service';
import { MoradaService } from './../../services/morada.service';
import { TrabalhadoresService } from './../../services/trabalhadores.service';

@Component({
  selector: 'app-novo-trabalhador',
  templateUrl: './novo-trabalhador.component.html',
  styleUrls: ['./novo-trabalhador.component.css']
})
export class NovoTrabalhadorComponent implements OnInit {
  public faFilePdf = faFilePdf;
  public passPortId: number = 0;
  public cartaoEleitoral: number = 0;
  public profissaoOutroId: number = 0;
  public availableRegex = RegexPatterns;
  public fileControlDocumento: FormControl;
  public fileControlDocumentoINSSEstrangeiro: FormControl;
  public faTimesCircle = faTimesCircle;
  public regimes: SelectsWDisable[] = [];
  public escaloes: SelectDescription[] = [];
  public escaloesFilter: SelectsWDisable[] = [];
  public accept = ".pdf";
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public errors: string[] = [];
  private maxSize: number = 52428800;
  public documentINESSPlaceholder: string = "general.document";
  private idTimor: number = 0;
  public wrongFormat: boolean = false;

  //matchers
  public notRequiredMatcher: NotRequiredErrorStateMatcher = new NotRequiredErrorStateMatcher();
  public matcherFuncpublico: MyErrorStateDependentMatcher = new MyErrorStateDependentMatcher(false);
  public matcherPaiDesc: MyErrorStateDependentMatcher = new MyErrorStateDependentMatcher(true);
  public matcherMaeDesc: MyErrorStateDependentMatcher = new MyErrorStateDependentMatcher(true);
  public matcherPaisTimor: MyErrorStateDependentMatcher = new MyErrorStateDependentMatcher(false);
  public matcherDataSuperior: MyErrorDataSuperiorStateMatcher = new MyErrorDataSuperiorStateMatcher(undefined);
  public escalaoMatcher: MyErrorStateDependentMatcher = new MyErrorStateDependentMatcher(false);

  //selections
  public listaMunicipios: SelectDescription[] = [];
  public listaPostosAdministrativos: SelectDescription[] = [];
  public listaSucos: SelectDescription[] = [];
  public listaAldeias: SelectDescription[] = [];
  public listaPaises: SelectsWDisable[] = [];
  public listaPaisesPopUp: SelectDescription[] = [];
  public listaMunicipiosPopUp: SelectDescription[] = [];

  //filtered selections
  public listaPostosAdministrativosFilter: SelectDescription[] = [];
  public listaSucosFilter: SelectDescription[] = [];
  public listaAldeiasFilter: SelectDescription[] = [];

  //dominios
  public estadosCivis: SelectsWDisable[] = [];
  public sexos: SelectsWDisable[] = [];
  public nacionalidades: SelectsWDisable[] = [];
  public tiposContratos: SelectsWDisable[] = [];
  public naturezasContrato: SelectsWDisable[] = [];
  public leisLabAplicaveis: SelectsWDisable[] = [];
  public tiposDocumentoShow: DominioDescricaoString[] = [];
  public tiposDocumento: DominioDescricaoString[] = [];
  public profissoes: SelectsWDisable[] = [];


  //booleans
  public isPassaporte: boolean = false;
  public isEdicao: boolean = false;
  public editContrato: boolean = false;
  public editContratoRegime: boolean = false;
  public editINSSEstrangeiro: boolean = false;
  public editDadosPrincipais: boolean = false;
  public estrangeiro: boolean = false;
  public esteveInscritoINSSEstrangeiro = false;
  public submittedTryDadosPrincipais: boolean = false;
  public submittedTryContrato: boolean = false;
  public submittedTryContratoRegime: boolean = false;
  public submittedTryINSSEstrangeiro: boolean = false;
  public submittedTry: boolean = false;
  public isProfissaoOutro = false;
  public isCartaoEleitoral: boolean = false;


  //modelos
  public documento: Documento = <Documento>{};
  public trabalhador: Trabalhador = <Trabalhador>{ indDescNomeMae: false, indDescNomePai: false };
  public contrato: RelEntidadeTrabalhador = <RelEntidadeTrabalhador>{ funcPublico: false };
  public morada: Morada = <Morada>{};
  public contacto: Contacto = <Contacto>{};
  public contratoRegime: RelEntidadeTrabalhadorRegime = <RelEntidadeTrabalhadorRegime>{};
  public inssEstrangeiro: INSSEstrangeiro = <INSSEstrangeiro><unknown>{ indDecontAtualmente: false, indBenfAtualmente: false };
  public documentos: DocumentoListagem[] = [];
  public contactos: ContatoListagem[] = [];
  public moradas: MoradaListagem[] = [];
  public suspensoes: SuspensaoListagem[] = [];


  //modelosOriginais
  public trabalhadorOriginal: Trabalhador = <Trabalhador>{};
  public contratoOriginal: RelEntidadeTrabalhador = <RelEntidadeTrabalhador>{};
  public inssEstrangeiroOriginal: INSSEstrangeiro = <INSSEstrangeiro>{};
  public contratoRegimeOriginal: RelEntidadeTrabalhadorRegime = <RelEntidadeTrabalhadorRegime>{};

  //listagem de tabelas
  public pageSizeDocumentosTable: number = 20;
  public totalRowsDocumentosTable: number = 0;
  public pageIndexDocumentosTable: number = 0;
  public pageSizeMoradasTable: number = 20;
  public totalRowsMoradasTable: number = 0;
  public pageIndexMoradasTable: number = 0;
  public pageSizeContactosTable: number = 20;
  public totalRowsContactosTable: number = 0;
  public pageIndexContactosTable: number = 0;
  public pageSizeSuspensoesTable: number = 20;
  public totalRowsSuspensoesTable: number = 0;
  public pageIndexSuspensoesTable: number = 0;
  public displayedColumnsDocumento: string[] = ['tipo', 'numero', 'dataValidade', 'verDocumento','verEditar'];
  public displayedColumnsMorada: string[] = ['rua', 'municipio', 'postoAdministrativo', 'suco', 'aldeia', 'pais', 'moradaPrincipal', 'verEditar'];
  public displayedColumnsContacto: string[] = ['telemovel', 'email', 'verEditar'];
  public displayedColumnsSuspensao: string[] = ['dataInicioSuspensao', 'dataFimSuspensao', 'verEditar'];

  //filtragem moradas
  public idMunicipio?: number;
  public idPostoAdministrativo?: number;
  public idSuco?: number;

  //id entidade
  public idEntidade: number = 0;

  private moradaWarningMsg = 'warnings.warningDeleteMorada';
  private contatoWarningMsg = 'warnings.warningDeleteContato';
  private documentoWarningMsg = 'warnings.warningDeleteDocument';
  private suspensaoWarningMsg = 'warnings.warningDeleteSuspensao';

  //Region Suspensao
  public suspensaoOpenState = false;

  //Region Open States of each expand
  public expandDocument: boolean = false;
  public expandMorada: boolean = false;
  public expandContato: boolean = false;
  public expandContratoTrab: boolean = false;
  public expandRegime: boolean = false;
  public expandSocialEstrang: boolean = false;

  constructor(private tokenStorage: TokenStorageService,
    private router: Router,
    private spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    public translate: TranslateService,
    public editarMoradaDialog: MatDialog,
    public editarContatoDialog: MatDialog,
    public editarDocumentoDialog: MatDialog,
    public warningDialog: MatDialog,
    private actRoute: ActivatedRoute,
    private datepipe: DatePipe,
    private trabalhadoresService: TrabalhadoresService,
    private relEntidadeTrabalhadorService: RelEntidadeTrabalhadorService,
    private dominiosService: DominiosService,
    private municipioService: MunicipioService,
    private inssEstrangeiroService: InssEstrangeiroService,
    private postoAdministrativoService: PostoAdministrativoService,
    private sucoService: SucoService,
    private aldeiaService: AldeiaService,
    private paisService: PaisService,
    private moradaService: MoradaService,
    private contatoService: ContatoService,
    private documentoService: DocumentoService,
    private suspensaoService: SuspensaoService,
    private escaloesService: EscaloesService,
    public snackBar: MatSnackBar) {
    this.fileControlDocumento = new FormControl(this.documento.documento, []);
    this.fileControlDocumentoINSSEstrangeiro = new FormControl(this.inssEstrangeiro.documento, []);
  }

  ngOnInit(): void {
    if (!this.tokenStorage.getToken()) {
      this.router.navigate(['']);
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired()) {
      this.showLoader();
      let idEntidade = this.tokenStorage.getUser()?.idEntidade;
      if (idEntidade != null) {
        this.contrato.entidadeFk = idEntidade;
        this.idEntidade = idEntidade;
        let requests: Observable<any>[] = [];
        requests.push(this.dominiosService.getAllDominiosForNovoTrabalhador());
        requests.push(this.municipioService.getAllMunicipio());
        requests.push(this.postoAdministrativoService.getAllPostoAdministrativo());
        requests.push(this.sucoService.getAllSuco());
        requests.push(this.aldeiaService.getAllAldeia());
        requests.push(this.paisService.getAllPais());
        requests.push(this.dominiosService.GetAllRegimes());
        requests.push(this.escaloesService.GetAllEscaloes());

        let id = this.actRoute.snapshot.params.id;
        if (id) {
          this.isEdicao = true;
          this.contrato.idRelEntidadeTrabalhador = id;
          let trabalhadorRequest = <TrabalhadorListagemRequest>{ id: id };
          this.relEntidadeTrabalhadorService.getTrabalhadorViewById(trabalhadorRequest)
            .subscribe((res) => {
              this.trabalhador = res.trabalhador;
              this.trabalhadorOriginal = JSON.parse(JSON.stringify(res.trabalhador));
              this.contrato = res.relEntidadeTrabalhador;
              this.contratoOriginal = JSON.parse(JSON.stringify(res.relEntidadeTrabalhador));

              //regime and escalao was split from the RelEntidadeEmpregadora, but since the information
              //comes together, we get it here
              this.contratoRegime.escalaoFk = this.contrato.escalaoFk;
              this.contratoRegime.regimeFk = this.contrato.regimeFk;
              this.contratoRegime.idRel = this.contrato.idRelEntidadeTrabalhador;
              this.contratoRegimeOriginal = JSON.parse(JSON.stringify(this.contratoRegime));

              this.updateDataInicioVinculo();
              if (res.inssEstrangeiro)
                if (res.inssEstrangeiro.length > 0) {
                  this.esteveInscritoINSSEstrangeiro = true;
                  this.inssEstrangeiroOriginal = res.inssEstrangeiro[0];
                  this.inssEstrangeiro = JSON.parse(JSON.stringify(this.inssEstrangeiroOriginal));

                  if (this.inssEstrangeiro?.nomeDocumento) {
                    this.documentINESSPlaceholder = this.inssEstrangeiro.nomeDocumento;
                  }
                }

              requests.push(this.getTableMoradas());
              requests.push(this.getTableContactos());
              requests.push(this.getTableDocumentos());
              requests.push(this.getTableSuspensoes());

              this.getInitialInfo(requests);
            },
              err => {
                err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
                this.showError();
              });
        }
        else {
          this.editDadosPrincipais = true;
          this.editContrato = true;
          this.editContratoRegime = true;
          this.editINSSEstrangeiro = true;
          this.getInitialInfo(requests);
        }

        this.fileControlDocumento.valueChanges.subscribe((file: any) => {
          if (this.maxSize >= file?.size && file.type == 'application/pdf') {
            var reader = new FileReader();
            reader.readAsArrayBuffer(file);
            this.documento.nomeDocumento = file.name;
            reader.onloadend = (evt) => {
              this.addDocumentoRequired();
              if (evt.target)
                if (evt.target.readyState == FileReader.DONE) {
                  var arrayBuffer = evt.target.result;
                  if (arrayBuffer instanceof ArrayBuffer)
                    this.documento.documento = base64ArrayBuffer(arrayBuffer);
                }
            }
            this.wrongFormat = false;
          }
          else if (file) {
            this.wrongFormat = true;
            this.documento.nomeDocumento = <string>{};
            this.fileControlDocumento.setValue(undefined);
          }
        });

        this.fileControlDocumentoINSSEstrangeiro.valueChanges.subscribe((file: any) => {
          if (this.maxSize >= file?.size && file.type == 'application/pdf') {
            var reader = new FileReader();
            reader.readAsArrayBuffer(file);
            this.inssEstrangeiro.nomeDocumento = file.name;
            reader.onloadend = (evt) => {
              this.addDocumentoINSSRequired();
              if (evt.target)
                if (evt.target.readyState == FileReader.DONE) {
                  var arrayBuffer = evt.target.result;
                  if (arrayBuffer instanceof ArrayBuffer)
                    this.inssEstrangeiro.documento = base64ArrayBuffer(arrayBuffer);
                }
            }
            this.wrongFormat = false;
          }
          else if (file) {
            this.wrongFormat = true;
            this.inssEstrangeiro.documento = "";
            this.inssEstrangeiro.nomeDocumento = "";
            this.documentINESSPlaceholder = "general.document";
            this.fileControlDocumentoINSSEstrangeiro.setValue(undefined);
          }
        });

        if (this.suspensaoService.savedSuccessfully) {
          this.suspensaoOpenState = true;
          this.suspensaoService.savedSuccessfully = false;
          setTimeout(() => {
            document.getElementById("suspensaoGrid")?.scrollIntoView({ behavior: "smooth" });
          }, 300);
        }
      }
    }
    else {
      showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
    }
  }

  public getInitialInfo(requests: Observable<any>[]) {
    forkJoin(requests).subscribe((requests) => {
      //selects
      this.listaMunicipios = requests[1].selects.filter((x: { indActivo: boolean; }) => x.indActivo);
      this.listaPostosAdministrativos = requests[2].selects;
      this.listaSucos = requests[3].selects;
      this.listaAldeias = requests[4].selects;

      //trabalhador (modo edição)
      let passports = requests[0][0].dominios.filter((c: { descricao: string; }) => c.descricao === 'Passaporte' || c.descricao === 'Passport');
      if (passports.length)
        this.passPortId = passports[0].id;
      
      let cartaoEleitoral = requests[0][0].dominios.filter((c: { descricao: string; }) => c.descricao === 'Cartão eleitoral' || c.descricao === 'Eletroral Card');
      if (cartaoEleitoral.length)
        this.cartaoEleitoral = cartaoEleitoral[0].id;

      //profissao "Outro" (modo edição)
      let profissaoOutro = requests[0][7].dominios.filter((c: { descricao: string; }) => c.descricao === 'Outro' || c.descricao === 'Other');
      if (profissaoOutro.length){
        this.profissaoOutroId = profissaoOutro[0].id;

        if(this.contrato.profissao == this.profissaoOutroId){
            this.isProfissaoOutro = true;
        }
      }
      this.tiposDocumentoShow = requests[0][0].dominios.filter((x: { indActivo: boolean; }) => x.indActivo);

      let timors = requests[5].selects.filter((c: { nome: string; }) => c.nome === 'Timor-Leste');
      if (timors.length)
        this.idTimor = timors[0].id;

      if (this.isEdicao) {
        this.listaMunicipiosPopUp = requests[1].selects;
        this.tiposDocumento = requests[0][0].dominios;
        this.listaPaisesPopUp = requests[5].selects;
        this.listaPaises = buildSelectOptionsWithDisabled(requests[5].selects, [this.inssEstrangeiro.estrangeiroPaisFk]);
        this.estadosCivis = buildSelectOptionsWithDisabled(requests[0][1].dominios, [this.trabalhador.estadoCivil]);
        this.sexos = buildSelectOptionsWithDisabled(requests[0][2].dominios, [this.trabalhador.sexo]);
        this.nacionalidades = buildSelectOptionsWithDisabled(requests[0][3].dominios, [this.trabalhador.nacionalidade]);
        this.tiposContratos = buildSelectOptionsWithDisabled(requests[0][4].dominios, [this.contrato.tipoContrato]);
        this.naturezasContrato = buildSelectOptionsWithDisabled(requests[0][5].dominios, [this.contrato.naturezaContrato]);
        this.leisLabAplicaveis = buildSelectOptionsWithDisabled(requests[0][6].dominios, [this.contrato.leiLabAplicavel]);
        this.regimes = buildSelectOptionsWithDisabled(requests[6].regimes, [this.contrato.regimeFk]);
        this.profissoes = buildSelectOptionsWithDisabled(requests[0][7].dominios, [this.contrato.profissao]);

        this.escaloes = requests[7].selects;

        //moradas
        requests[8].rows == null ? this.totalRowsMoradasTable = 0 : this.totalRowsMoradasTable = requests[8].rows;
        requests[8].morada == null ? this.moradas = [] : this.moradas = requests[8].morada;
        //contactos
        requests[9].rows == null ? this.totalRowsMoradasTable = 0 : this.totalRowsMoradasTable = requests[9].rows;
        requests[9].contato == null ? this.contactos = [] : this.contactos = requests[9].contato;
        //documentos
        requests[10].rows == null ? this.totalRowsDocumentosTable = 0 : this.totalRowsDocumentosTable = requests[10].rows;
        requests[10].documentos == null ? this.documentos = [] : this.documentos = requests[10].documentos;
        //suspensoes
        requests[11].rows == null ? this.totalRowsSuspensoesTable = 0 : this.totalRowsSuspensoesTable = requests[11].rows;
        requests[11].suspensao == null ? this.suspensoes = [] : this.suspensoes = requests[11].suspensao;
      }
      else {
        this.listaPaises = buildSelectOptionsWithDisabled(requests[5].selects.filter((x: { indActivo: boolean; }) => x.indActivo));
        this.estadosCivis = buildSelectOptionsWithDisabled(requests[0][1].dominios.filter((x: { indActivo: boolean; }) => x.indActivo));
        this.sexos = buildSelectOptionsWithDisabled(requests[0][2].dominios.filter((x: { indActivo: boolean; }) => x.indActivo));
        this.nacionalidades = buildSelectOptionsWithDisabled(requests[0][3].dominios.filter((x: { indActivo: boolean; }) => x.indActivo));
        this.tiposContratos = buildSelectOptionsWithDisabled(requests[0][4].dominios.filter((x: { indActivo: boolean; }) => x.indActivo));
        this.naturezasContrato = buildSelectOptionsWithDisabled(requests[0][5].dominios.filter((x: { indActivo: boolean; }) => x.indActivo));
        this.leisLabAplicaveis = buildSelectOptionsWithDisabled(requests[0][6].dominios);
        this.profissoes = buildSelectOptionsWithDisabled(requests[0][7].dominios);
        this.regimes = buildSelectOptionsWithDisabled(requests[6].regimes.filter((x: { indActivo: boolean; }) => x.indActivo));
        this.escaloes = requests[7].selects.filter((x: { indActivo: boolean; }) => x.indActivo);
        this.morada.MoradaPaisFk = this.idTimor;
      }
      if (this.contratoRegime.escalaoFk)
        this.escaloesFilter = buildSelectOptionsWithDisabled(this.escaloes.filter(e => e.parentId == this.contratoRegime.regimeFk), [this.contratoRegime.escalaoFk]);
      else
        this.escaloesFilter = buildSelectOptionsWithDisabled(this.escaloes.filter(e => e.parentId == this.contratoRegime.regimeFk));
      var temEscaloes = this.escaloesFilter.length > 0;
      this.escalaoMatcher = new MyErrorStateDependentMatcher(temEscaloes);
      this.updatePaisTimorErroState();
      this.hideLoader();
    },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public validadeDocumento(): Boolean {
    let valid = true;
    if (!this.documento.documento || !!this.documento.nomeDocumento)
      valid = false;
    return valid;
  }

  public validadeInssEstrangeiro(): Boolean {
    let valid = true;
    if (this.esteveInscritoINSSEstrangeiro)
      if (this.inssEstrangeiro.documento && !this.inssEstrangeiro.nomeDocumento)
        valid = false;
    return valid;
  }

  public adicionaTrabalhador(): void {
    if (this.anyError())
      return;

    this.showLoader();

    let estrangeiro = undefined;
    if (this.esteveInscritoINSSEstrangeiro)
      estrangeiro = this.inssEstrangeiro;

    this.trabalhador.idTrabalhador = 0;


    //regime and escalao belongs in RelEntidadeEmpregadore but it was split on the screen, here we put them together
    this.contrato.regimeFk = this.contratoRegime.regimeFk;
    this.contrato.escalaoFk = this.contratoRegime.escalaoFk;

    let request = {
      trabalhador: this.trabalhador,
      morada: this.morada,
      contacto: this.contacto,
      relEntidadeTrabalhador: this.contrato,
      documentoIdentificacao: this.documento,
      iNSSEstrangeiro: estrangeiro
    }

    this.trabalhadoresService.saveTrabalhador(request).subscribe(x => {
      this.clearDocumentoINSSRequired();
      this.clearDocumentoRequired();
      this.hideLoader();
      this.submittedTry = false;
      openSnackBar(this.translate.instant('snackBar.saveTrabalhador'), this.snackBar);
      this.router.navigate(['/trabalhadores'], { skipLocationChange: true });
    },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public submitTrabalhador() {
    this.addDocumentoRequired();
    this.addDocumentoINSSRequired();
    this.submittedTry = true;
    this.wrongFormat = false;
    if (this.anyError()) {
      if (!this.validDocumentData())
        this.expandDocument = true;
      if (!this.validMoradaData())
        this.expandMorada = true;
      if (!this.validContatoData())
        this.expandContato = true;
      if (!this.validContratoTrabData())
        this.expandContratoTrab = true;
      if (!this.validRegimeData())
        this.expandRegime = true;
      if (this.esteveInscritoINSSEstrangeiro && !this.validSocialEstrangeiroData())
        this.expandSocialEstrang = true;
      openErrorSnackBar(this.translate.instant('general.requiredFields'), this.snackBar);
    }
  }

  private anyError(): boolean {
    if (!this.validMainData())
      return true;
    if (!this.validDocumentData())
      return true;
    if (!this.validMoradaData())
      return true;
    if (!this.validContatoData())
      return true;
    if (!this.validContratoTrabData())
      return true;
    if (!this.validRegimeData())
      return true;
    if (this.esteveInscritoINSSEstrangeiro && !this.validSocialEstrangeiroData())
      return true;

    return false;
  }

  private validMainData(): boolean {
    // if (!this.trabalhador.tin || this.trabalhador.tin.length == 0)
    //   return false;
    if (!this.trabalhador.nome || this.trabalhador.nome.length == 0)
      return false;
    if (!this.trabalhador.dataNasc)
      return false;
    if (!this.trabalhador.indDescNomePai && (!this.trabalhador.nomeMae || this.trabalhador.nomeMae.length == 0))
      return false;
    if (!this.trabalhador.indDescNomeMae && (!this.trabalhador.nomePai || this.trabalhador.nomePai.length == 0))
      return false;
    if (!this.trabalhador.sexo)
      return false;
    if (!this.trabalhador.nacionalidade)
      return false;
    if (!this.trabalhador.naturalidade || this.trabalhador.naturalidade.length == 0)
      return false;

    return true;
  }

  private validDocumentData(): boolean {
    if (!this.documento.documento || this.documento.documento.length == 0)
      return false;
    if (this.isPassaporte && (!this.documento.localEmissao || this.documento.localEmissao.length == 0))
      return false;
    if (!this.documento.dataValidade && !this.isCartaoEleitoral)
      return false;
    if (!this.documento.numero || this.documento.numero.length == 0)
      return false;

    return true;
  }

  private validMoradaData(): boolean {
    if (!this.morada.Rua || this.morada.Rua.length == 0)
      return false;
    // if (!this.morada.NumPorta || this.morada.NumPorta.length == 0)
    //   return false;
    if (!this.morada.MoradaAldeiaFk)
      return false;
    if (!this.morada.MoradaPaisFk)
      return false;

    return true;
  }

  private validContatoData(): boolean {
    if (!this.contacto.email || this.contacto.email.length == 0)
      return false;
    if (!this.contacto.telemovel || this.contacto.telemovel.length == 0)
      return false;

    return true;
  }

  private validContratoTrabData(): boolean {
    if (!this.contrato.dtIniVincTrabalhador)
      return false;
    if (!this.contrato.tipoContrato)
      return false;
    if (!this.contrato.naturezaContrato)
      return false;
    if (!this.contrato.leiLabAplicavel)
      return false;
    if (!this.contrato.profissao)
      return false;
    if (this.isProfissaoOutro && (!this.contrato.profissaoOutro || this.contrato.profissaoOutro.length == 0))
      return false;
    if (this.contrato.funcPublico && (!this.contrato.numFuncPublico || this.contrato.numFuncPublico.length == 0))
      return false;

    return true;
  }

  private validRegimeData(): boolean {
    if (!this.contratoRegime.regimeFk)
      return false;
    if (this.escaloesFilter.length > 0 && !this.contratoRegime.escalaoFk)
      return false;

    return true;
  }

  private validSocialEstrangeiroData(): boolean {
    if (!this.inssEstrangeiro.nomeSSEstrangeiro || this.inssEstrangeiro.nomeSSEstrangeiro.length == 0)
      return false;
    if (!this.inssEstrangeiro.estrangeiroPaisFk)
      return false;
    if (!this.inssEstrangeiro.nissestrangeiro || this.inssEstrangeiro.nissestrangeiro.length == 0)
      return false;

    return true;
  }

  public submitINSSEstrangeiro() {
    this.submittedTryINSSEstrangeiro = true;
    this.wrongFormat = false;
    this.addDocumentoINSSRequired();
  }

  public submitContracto() {
    this.submittedTryContrato = true;
  }

  public submitContractoRegime() {
    this.submittedTryContratoRegime = true;
  }

  public submitDadosPrincipais() {
    this.submittedTryDadosPrincipais = true;
  }

  public changeEstrangeiro() {
    if (this.estrangeiro) {
      this.documento.tpDocIdentificacao = this.passPortId;
    }
    this.updateIsPassaporte();
  }

  public updateIsPassaporte() {
    this.isPassaporte = this.documento.tpDocIdentificacao == this.passPortId;
    this.isCartaoEleitoral = this.documento.tpDocIdentificacao == this.cartaoEleitoral;
  }

  public updateIsProfissaoOutro() {
    this.isProfissaoOutro = this.contrato.profissao == this.profissaoOutroId;
  }

  public showError() {
    const dialogRef = openErrorsDialog(this.errors, this.errorDialog);
    this.hideLoader();

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }

  public getTableMoradas(): Observable<any> {
    let request: MoradaListagemRequest;
    let filter: FilterRequest;
    filter = {};
    filter.index = this.pageIndexMoradasTable;
    filter.rows = this.pageSizeMoradasTable
    request = { "id": this.trabalhador.idTrabalhador, "filter": filter };
    this.moradas = [];
    this.showLoader();

    return this.moradaService.getMoradaByIdTrabalhador(request);
  }

  public getTableContactos(): Observable<any> {
    let request: ContatoListagemRequest;
    let filter: FilterRequest;
    filter = {};
    filter.index = this.pageIndexContactosTable;
    filter.rows = this.pageSizeContactosTable;
    request = { "Id": this.trabalhador.idTrabalhador, "filter": filter };
    this.moradas = [];
    this.showLoader();

    return this.contatoService.getContatoByIdTrabalhador(request);
  }

  public getTableDocumentos(): Observable<any> {
    let request: DocumentosListagemRequest;
    let filter: FilterRequest;
    filter = {};
    filter.index = this.pageIndexDocumentosTable;
    filter.rows = this.pageSizeDocumentosTable;
    request = { "id": this.trabalhador.idTrabalhador, "filter": filter };
    this.moradas = [];
    this.showLoader();

    return this.documentoService.getDocumentosByIdTrabalhador(request);
  }

  public getTableSuspensoes(): Observable<any> {
    let request: SuspensaoListagemRequest;
    let filter: FilterRequest;
    filter = {};
    filter.index = this.pageIndexSuspensoesTable;
    filter.rows = this.pageSizeSuspensoesTable
    request = { "IdEntidade": this.idEntidade, "IdTrabalhador": this.trabalhador.idTrabalhador, "filter": filter };
    this.suspensoes = [];
    this.showLoader();

    return this.suspensaoService.getSuspensaoByIdTrabalhador(request);
  }

  public editarDocumento(doc: DocumentoListagem) {
    this.showLoader();
    this.documentoService.getDocumentoById({ id: doc.idDocumento })
      .subscribe(res => {
        this.hideLoader();
        const dialogRef = this.editarDocumentoDialog.open(PopUpAdicionarEditarDocumentoComponent, {
          id: 'editarDocumento',
          minHeight: '100px',
          width: '70%',
          height: '40%',
          panelClass: 'modalWithBorder',
          data: {
            editar: true,
            documento: res.documento,
            tiposDocumento: buildSelectOptionsWithDisabled(this.tiposDocumento, [res.documento.tpDocIdentificacao]),
            passPortId: this.passPortId,
            cartaoEleitoral: this.cartaoEleitoral
          }
        });


        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.getTableDocumentos().subscribe(x => {
              x.rows == null ? this.totalRowsDocumentosTable = 0 : this.totalRowsDocumentosTable = x.rows;
              x.documentos == null ? this.documentos = [] : this.documentos = x.documentos;
              this.hideLoader();
              openSnackBar(this.translate.instant('snackBar.editDocumento'), this.snackBar);
            },
              err => {
                err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
                this.showError();
              });
          }
        });
      },
        err => {
          err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.showError();
        });
  }

  public deleteDocumento(doc: Documento) {
    const dialogRef = this.warningDialog.open(PopUpWarningComponent, {
      id: 'deleteDocumentoDialog',
      minHeight: '300px',
      width: '40%',
      height: '30%',
      panelClass: 'warningModal',
      data: { function: this.documentoService.deleteDocumento({ id: doc.idDocumento }), msg: this.translate.instant(this.documentoWarningMsg) }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTableDocumentos().subscribe(x => {
          x.rows == null ? this.totalRowsDocumentosTable = 0 : this.totalRowsDocumentosTable = x.rows;
          x.documentos == null ? this.documentos = [] : this.documentos = x.documentos;
          this.hideLoader();
          openSnackBar(this.translate.instant('snackBar.deleteDocumento'), this.snackBar);
        },
          err => {
            err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
            this.showError();
          }
        );
      }
    });
  }

  public adicionarDocumento() {
    const dialogRef = this.editarDocumentoDialog.open(PopUpAdicionarEditarDocumentoComponent,
      {
        id: 'editarDocumento',
        minHeight: '100px',
        width: '70%',
        height: '40%',
        panelClass: 'modalWithBorder',
        data: {
          adicionar: true,
          documento: <Documento>{ idTrabalhador: this.trabalhador.idTrabalhador },
          tiposDocumento: buildSelectOptionsWithDisabled(this.tiposDocumento),
          passPortId: this.passPortId,
          cartaoEleitoral: this.cartaoEleitoral
        }
      });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTableDocumentos().subscribe(x => {
          x.rows == null ? this.totalRowsDocumentosTable = 0 : this.totalRowsDocumentosTable = x.rows;
          x.documentos == null ? this.documentos = [] : this.documentos = x.documentos;
          openSnackBar(this.translate.instant('snackBar.saveDocumento'), this.snackBar);
          this.hideLoader();
        },
          err => {
            err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
            this.showError();
          });
      }
    });
  }

  public updateDocumentosTable(event: any) {
    this.pageIndexDocumentosTable = event.pageIndex;
    this.pageSizeDocumentosTable = event.pageSize;
    this.getTableDocumentos().subscribe(x => {
      x.rows == null ? this.totalRowsDocumentosTable = 0 : this.totalRowsDocumentosTable = x.rows;
      x.documentos == null ? this.documentos = [] : this.documentos = x.documentos;
      this.hideLoader();
    },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      }
    );
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
        idTrabalhador: this.trabalhador.idTrabalhador,
        idMorada: morada.idMorada,
        rua: morada.rua,
        numPorta: morada.numPorta,
        moradaPrincipal: morada.moradaPrincipal,

        //municipio
        listaMunicipio: buildSelectOptionsWithDisabled(this.listaMunicipiosPopUp, [morada.idMunicipio]),
        idMunicipio: morada.idMunicipio,

        //posto
        listaPosto: this.listaPostosAdministrativos,
        listaPostoFilter: buildSelectOptionsWithDisabled(getSelectFilter(morada.idMunicipio, this.listaPostosAdministrativos), [morada.idPostoAdministrativo]),
        idPostoAdministrativo: morada.idPostoAdministrativo,

        //suco
        listaSuco: this.listaSucos,
        listaSucoFilter: buildSelectOptionsWithDisabled(getSelectFilter(morada.idPostoAdministrativo, this.listaSucos), [morada.idSuco]),
        idSuco: morada.idSuco,

        //aldeia
        listaAldeia: this.listaAldeias,
        listaAldeiaFilter: buildSelectOptionsWithDisabled(getSelectFilter(morada.idSuco, this.listaAldeias), [morada.idAldeia]),
        idAldeia: morada.idAldeia,

        //pais
        listaPais: buildSelectOptionsWithDisabled(this.listaPaisesPopUp, [morada.idPais]),
        idPais: morada.idPais,

        moradaListagem: this.moradas,
        idTimor: this.idTimor
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTableMoradas().subscribe(x => {
          x.rows == null ? this.totalRowsMoradasTable = 0 : this.totalRowsMoradasTable = x.rows;
          x.morada == null ? this.moradas = [] : this.moradas = x.morada;
          openSnackBar(this.translate.instant('snackBar.editMorada'), this.snackBar);
          this.hideLoader();
        },
          err => {
            err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
            this.showError();
          }
        );
      }
    });

  }

  public adicionarMorada() {
    const dialogRef = this.editarMoradaDialog.open(PopUpAdicionarEditarMoradaComponent,
      {
        id: 'editarMorada',
        minHeight: '200px',
        width: '60%',
        height: '50%',
        panelClass: 'modalWithBorder',
        data: {
          adicionar: true,
          idTrabalhador: this.trabalhador.idTrabalhador,
          rua: '',
          moradaPrincipal: false,
          listaMunicipio: buildSelectOptionsWithDisabled(this.listaMunicipiosPopUp),
          listaPosto: this.listaPostosAdministrativos,
          listaSuco: this.listaSucos,
          listaAldeia: this.listaAldeias,
          listaPais: buildSelectOptionsWithDisabled(this.listaPaisesPopUp),
          moradaListagem: this.moradas,
          idTimor: this.idTimor,
          idPais: this.idTimor
        }
      });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTableMoradas().subscribe(x => {
          x.rows == null ? this.totalRowsMoradasTable = 0 : this.totalRowsMoradasTable = x.rows;
          x.morada == null ? this.moradas = [] : this.moradas = x.morada;
          openSnackBar(this.translate.instant('snackBar.editMorada'), this.snackBar);
          this.hideLoader();
        },
          err => {
            err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
            this.showError();
          });
      }
    });
  }

  public deleteMorada(morada: MoradaListagem) {
    const dialogRef = this.warningDialog.open(PopUpWarningComponent, {
      id: 'deleteMoradaDialog',
      minHeight: '300px',
      width: '40%',
      height: '30%',
      panelClass: 'warningModal',
      data: { function: this.moradaService.deleteMorada({ id: morada.idMorada }), msg: this.translate.instant(this.moradaWarningMsg) }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTableMoradas().subscribe(x => {
          x.rows == null ? this.totalRowsMoradasTable = 0 : this.totalRowsMoradasTable = x.rows;
          x.morada == null ? this.moradas = [] : this.moradas = x.morada;
          this.hideLoader();
          openSnackBar(this.translate.instant('snackBar.deleteMorada'), this.snackBar);
        },
          err => {
            err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
            this.showError();
          }
        );
      }
    });
  }

  public updateMoradasTable(event: any) {
    this.pageIndexMoradasTable = event.pageIndex;
    this.pageSizeMoradasTable = event.pageSize;
    this.showLoader();
    this.getTableMoradas().subscribe(x => {
      x.rows == null ? this.totalRowsMoradasTable = 0 : this.totalRowsMoradasTable = x.rows;
      x.morada == null ? this.moradas = [] : this.moradas = x.morada;
      this.hideLoader();
    },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      }
    );
  }

  public adicionarContacto() {
    const dialogRef = this.editarContatoDialog.open(PopUpAdicionarEditarContatoComponent, {
      id: 'editarContato',
      minHeight: '100px',
      width: '50%',
      height: '40%',
      panelClass: 'modalWithBorder',
      data: {
        idTrabalhador: this.trabalhador.idTrabalhador,
        adicionar: true,
        telefone: '',
        email: '',
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTableContactos().subscribe(x => {
          x.rows == null ? this.totalRowsMoradasTable = 0 : this.totalRowsMoradasTable = x.rows;
          x.contato == null ? this.contactos = [] : this.contactos = x.contato;
          openSnackBar(this.translate.instant('snackBar.saveContato'), this.snackBar);
          this.hideLoader();
        },
          err => {
            err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
            this.showError();
          });
      }
    });
  }

  public editarContacto(contato: ContatoListagem) {
    const dialogRef = this.editarContatoDialog.open(PopUpAdicionarEditarContatoComponent, {
      id: 'editarContato',
      minHeight: '100px',
      width: '50%',
      height: '40%',
      panelClass: 'modalWithBorder',
      data: {
        editar: true,
        idTrabalhador: this.trabalhador.idTrabalhador,
        idContato: contato.idContato,
        telemovel: contato.telemovel,
        email: contato.email,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTableContactos().subscribe(x => {
          x.rows == null ? this.totalRowsMoradasTable = 0 : this.totalRowsMoradasTable = x.rows;
          x.contato == null ? this.contactos = [] : this.contactos = x.contato;
          openSnackBar(this.translate.instant('snackBar.editContato'), this.snackBar);
          this.hideLoader();
        },
          err => {
            err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
            this.showError();
          });
      }
    });
  }

  public deleteContacto(contacto: ContatoListagem) {
    const dialogRef = this.warningDialog.open(PopUpWarningComponent, {
      id: 'deleteContatoDialog',
      minHeight: '300px',
      width: '40%',
      height: '30%',
      panelClass: 'warningModal',
      data: { function: this.contatoService.deleteContato({ id: contacto.idContato }), msg: this.translate.instant(this.contatoWarningMsg) }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTableContactos().subscribe(x => {
          x.rows == null ? this.totalRowsMoradasTable = 0 : this.totalRowsMoradasTable = x.rows;
          x.contato == null ? this.contactos = [] : this.contactos = x.contato;
          this.hideLoader();
          openSnackBar(this.translate.instant('snackBar.deleteContato'), this.snackBar);
        },
          err => {
            err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
            this.showError();
          });
      }
    });
  }


  public deleteSuspensao(suspensao: SuspensaoListagem) {
    const dialogRef = this.warningDialog.open(PopUpWarningComponent, {
      id: 'deleteSuspensaoDialog',
      minHeight: '300px',
      width: '40%',
      height: '30%',
      panelClass: 'warningModal',
      data: { function: this.suspensaoService.deleteSuspensao({ id: suspensao.idSuspensao }), msg: this.translate.instant(this.suspensaoWarningMsg) }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTableSuspensoes().subscribe(x => {
          x.rows == null ? this.totalRowsSuspensoesTable = 0 : this.totalRowsSuspensoesTable = x.rows;
          x.suspensao == null ? this.suspensoes = [] : this.suspensoes = x.suspensao;
          this.hideLoader();
          openSnackBar(this.translate.instant('snackBar.deleteSuspensao'), this.snackBar);
        },
          err => {
            err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
            this.showError();
          });
      }
    });
  }

  public updateContactosTable(event: any) {
    this.pageIndexContactosTable = event.pageIndex;
    this.pageSizeContactosTable = event.pageSize;
    this.showLoader();
    this.getTableContactos().subscribe(x => {
      x.rows == null ? this.totalRowsMoradasTable = 0 : this.totalRowsMoradasTable = x.rows;
      x.contato == null ? this.contactos = [] : this.contactos = x.contato;
      this.hideLoader();
    },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      }
    );
  }

  public updateSuspensoesTable(event: any) {
    this.pageIndexSuspensoesTable = event.pageIndex;
    this.pageSizeSuspensoesTable = event.pageSize;
    this.showLoader();
    this.getTableSuspensoes().subscribe(x => {
      x.rows == null ? this.totalRowsSuspensoesTable = 0 : this.totalRowsSuspensoesTable = x.rows;
      x.suspensao == null ? this.suspensoes = [] : this.suspensoes = x.suspensao;
      this.hideLoader();
    },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      }
    );
  }

  public enableEditDadosPrincipais(): void {
    this.editDadosPrincipais = true;
  }

  public updateDadosPrincipais(): void {
    this.showLoader();

    let request = {
      trabalhador: this.trabalhador
    }

    this.trabalhadoresService.editDadosPrincipaisTrabalhador(request).subscribe(x => {
      this.trabalhadorOriginal = JSON.parse(JSON.stringify(this.trabalhador));
      this.editDadosPrincipais = false;
      this.submittedTryDadosPrincipais = false;
      this.hideLoader();
      openSnackBar(this.translate.instant('snackBar.editTrabalhador'), this.snackBar);
    },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public disableDadosPrincipais(): void {
    this.trabalhador = JSON.parse(JSON.stringify(this.trabalhadorOriginal));
    this.editDadosPrincipais = false;
    if (this.inssEstrangeiroOriginal.idInssestrang)
      this.esteveInscritoINSSEstrangeiro = true;
    else
      this.esteveInscritoINSSEstrangeiro = false;
  }

  public changePosto() {
    this.showLoader();
    this.listaPostosAdministrativosFilter = [];
    this.listaSucosFilter = [];
    this.listaAldeiasFilter = [];
    this.idPostoAdministrativo = 0;
    this.idSuco = 0;
    this.morada.MoradaAldeiaFk = 0;

    this.listaPostosAdministrativosFilter = getSelectFilter(this.idMunicipio, this.listaPostosAdministrativos);
    this.hideLoader();
  }

  public changeSuco() {
    this.showLoader();
    this.listaSucosFilter = [];
    this.listaAldeiasFilter = [];
    this.idSuco = 0;
    this.morada.MoradaAldeiaFk = 0;

    this.listaSucosFilter = getSelectFilter(this.idPostoAdministrativo, this.listaSucos)
    this.hideLoader();
  }

  public changeAldeia() {
    this.showLoader();
    this.listaAldeiasFilter = [];
    this.morada.MoradaAldeiaFk = 0;

    this.listaAldeiasFilter = getSelectFilter(this.idSuco, this.listaAldeias);
    this.hideLoader();
  }

  public enableEditContrato(): void {
    this.editContrato = true;
  }

  public enableEditContratoRegime(): void {
    this.editContratoRegime = true;
  }

  public updateContrato(): void {
    this.showLoader();

    let request = {
      relEntidadeTrabalhador: this.contrato
    }

    this.relEntidadeTrabalhadorService.editRelEntidadeTrabalhador(request).subscribe(x => {
      this.contratoOriginal = JSON.parse(JSON.stringify(this.contrato));
      this.editContrato = false;
      this.submittedTryContrato = false;
      this.hideLoader();
      openSnackBar(this.translate.instant('snackBar.editContrato'), this.snackBar);
    },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public updateContratoRegime(): void {
    this.showLoader();

    let request = {
      relEntidadeTrabalhadorRegime: this.contratoRegime
    }

    this.relEntidadeTrabalhadorService.editRelEntidadeTrabalhadorRegime(request).subscribe(x => {
      this.contratoRegimeOriginal = JSON.parse(JSON.stringify(this.contratoRegime));
      this.contratoOriginal.regimeFk = this.contratoRegimeOriginal.regimeFk;
      this.contratoOriginal.escalaoFk = this.contratoRegimeOriginal.escalaoFk;
      this.contrato.regimeFk = this.contratoRegimeOriginal.regimeFk;
      this.contrato.escalaoFk = this.contratoRegimeOriginal.escalaoFk;
      this.editContratoRegime = false;
      this.submittedTryContratoRegime = false;
      this.hideLoader();
      openSnackBar(this.translate.instant('snackBar.editContratoRegime'), this.snackBar);
    },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public disableContrato(): void {
    this.contrato = JSON.parse(JSON.stringify(this.contratoOriginal));
    this.editContrato = false;

    if (this.contrato.profissao != this.profissaoOutroId) {
      this.isProfissaoOutro = false;
    }
    else {
      this.isProfissaoOutro = true;
    }
  }

  public disableContratoRegime(): void {
    this.contratoRegime = JSON.parse(JSON.stringify(this.contratoRegimeOriginal));
    this.editContratoRegime = false;
  }

  public enableEditINSSEstrangeiro(): void {
    this.editINSSEstrangeiro = true;
  }

  public updateINSSEstrangeiro(): void {
    let valid = this.validadeInssEstrangeiro();
    if (valid) {
      this.showLoader();
      let request = {
        inssEstrangeiro: this.inssEstrangeiro
      }
      let call;
      if (this.inssEstrangeiroOriginal.idInssestrang)
        call = this.inssEstrangeiroService.editINSSEstrangeiro(request);
      else {
        this.inssEstrangeiro.idTrabalhador = this.trabalhador.idTrabalhador;
        call = this.inssEstrangeiroService.saveINSSEstrangeiro(request);
      }

      call.subscribe(x => {
        this.inssEstrangeiroOriginal = JSON.parse(JSON.stringify(this.inssEstrangeiro));
        this.editINSSEstrangeiro = false;
        this.submittedTryINSSEstrangeiro = false;
        this.clearDocumentoINSSRequired();
        this.hideLoader();
        openSnackBar(this.translate.instant('snackBar.editINSSEstangeiro'), this.snackBar);
      },
        err => {
          err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.showError();
        });
    }

  }

  public disableINSSEstrangeiro(): void {
    this.inssEstrangeiro = JSON.parse(JSON.stringify(this.inssEstrangeiroOriginal));
    this.editINSSEstrangeiro = false;
    this.clearDocumentoINSSRequired();
  }

  public clearDocumentNumber(): void {
    this.documento.numero = '';
  }

  public clearNomeDoPai(): void {
    this.trabalhador.nomePai = '';
  }

  public clearNomeDaMae(): void {
    this.trabalhador.nomeMae = '';
  }

  public clearNomeCompleto(): void {
    this.trabalhador.nome = '';
  }

  public clearLocalEmissao(): void {
    this.documento.localEmissao = '';
  }

  public clearNomeEstrangeiro(): void {
    this.inssEstrangeiro.nomeSSEstrangeiro = '';
  }

  public clearNaturalidade(): void {
    this.trabalhador.naturalidade = "";
  }

  public clearNISSEstrangeiro(): void {
    this.inssEstrangeiro.nissestrangeiro = "";
  }

  public showLoader() {
    this.spinner.show();
  }

  public hideLoader() {
    this.spinner.hide();
  }

  public changePaiDesconhecido() {
    this.updatePaiDescErrorState();
    if (this.trabalhador.indDescNomePai)
      this.trabalhador.nomePai = '';
  }

  public changeMaeDesconhecida() {
    this.updateMaeDescErrorState();
    if (this.trabalhador.indDescNomeMae)
      this.trabalhador.nomeMae = '';
  }

  public changePais() {
    this.idMunicipio = undefined;
    this.idPostoAdministrativo = undefined;
    this.idSuco = undefined;
    this.morada.MoradaAldeiaFk = undefined;
    this.updatePaisTimorErroState();
  }

  public changeRegime() {
    this.contratoRegime.escalaoFk = undefined;
    this.escaloesFilter = buildSelectOptionsWithDisabled(this.escaloes.filter(e => e.parentId == this.contratoRegime.regimeFk));
    var temEscaloes = this.escaloesFilter.length > 0;
    this.escalaoMatcher = new MyErrorStateDependentMatcher(temEscaloes);
  }

  public clearRua() {
    this.morada.Rua = '';
  }

  public clearNumPorta() {
    this.morada.NumPorta = '';
  }

  public clearEmail() {
    this.contacto.email = '';
  }

  public clearTelemovel() {
    this.contacto.telemovel = '';
  }

  public clearNISS() {
    this.trabalhador.niss = '';
  }

  public clearTIN() {
    this.trabalhador.tin = '';
  }

  public clearHorasSemana() {
    this.contrato.horasSemana = 0;
  }

  public clearDiasSemana() {
    this.contrato.diasSemana = 0;
  }

  public clearNumFuncPublico() {
    this.contrato.numFuncPublico = "";
  }

  public clearProfissaoOutro() {
    this.contrato.profissaoOutro = "";
  }

  private updateDependentErroState() {
    this.matcherFuncpublico = new MyErrorStateDependentMatcher(this.contrato.funcPublico);
  }

  private updatePaisTimorErroState() {
    this.matcherPaisTimor = new MyErrorStateDependentMatcher(this.morada.MoradaPaisFk == this.idTimor);
  }

  private updateMaeDescErrorState() {
    this.matcherMaeDesc = new MyErrorStateDependentMatcher(!this.trabalhador.indDescNomeMae);
  }

  private updatePaiDescErrorState() {
    this.matcherPaiDesc = new MyErrorStateDependentMatcher(!this.trabalhador.indDescNomePai);
  }

  public formatDate(date: Date): string {
    return formatDatePT(this.datepipe, date);
  }

  public addDocumentoRequired() {
    this.fileControlDocumento.get('Documento')?.setValidators([Validators.required, MaxSizeValidator(this.maxSize)]);
  }

  public clearDocumentoRequired() {
    this.fileControlDocumento.get('Documento')?.setValidators([]);
  }

  public addDocumentoINSSRequired() {
    this.fileControlDocumento.get('Documento')?.setValidators([MaxSizeValidator(this.maxSize)]);
  }

  public clearDocumentoINSSRequired() {
    this.fileControlDocumento.get('Documento')?.setValidators([]);
  }

  public changeFuncPublico() {
    this.updateDependentErroState();
    this.clearNumFuncPublico();
  }

  public clearInssEstrangeiroDocumento() {
    this.wrongFormat = false;
    this.inssEstrangeiro.documento = "";
    this.inssEstrangeiro.nomeDocumento = "";
    this.documentINESSPlaceholder = "general.document";
    this.fileControlDocumentoINSSEstrangeiro.setValue(undefined);
  }

  public clearDocumento() {
    this.documento.documento = "";
    this.documento.nomeDocumento = "";
    this.fileControlDocumento.setValue(undefined);
  }

  public adicionarSuspensao() {
    this.router.navigate(['/registoSuspensao/', { suspensao: 'trabalhador', niss: this.trabalhador.niss, idTrabalhador: this.trabalhador.idTrabalhador, idRel: this.contrato.idRelEntidadeTrabalhador }, { skipLocationChange: true }])
  }

  public clearDtIniFimTrabalhador() {
    this.contrato.dtIniFimTrabalhador = undefined;
  }

  public updateDataInicioVinculo() {
    this.matcherDataSuperior = new MyErrorDataSuperiorStateMatcher(this.contrato.dtIniVincTrabalhador);
  }

  public scroll(e: any) {
    e._body.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  public onFileControlChange(): void {
    this.fileControlDocumento.valueChanges.subscribe((file: any) => {
      if (this.maxSize >= file?.size && file.type == 'application/pdf') {
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);
        this.documento.nomeDocumento = file.name;
        reader.onloadend = (evt) => {
          this.addDocumentoRequired();
          if (evt.target)
            if (evt.target.readyState == FileReader.DONE) {
              var arrayBuffer = evt.target.result;
              if (arrayBuffer instanceof ArrayBuffer)
                this.documento.documento = base64ArrayBuffer(arrayBuffer);
            }
        }
        this.wrongFormat = false;
      }
      else if (file) {
        this.wrongFormat = true;
        this.fileControlDocumento.setValue(undefined);
      }
    });
  }

  public return(): void {
    this.router.navigate(['/contribHomePage/'], { skipLocationChange: true });
  }

  public openPdf(element: DocumentoListagem) {
    // Open PDF document in browser's new tab
    const arrayBuffer = base64ToArrayBuffer(element.documento);
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    window.open(URL.createObjectURL(blob));
  }
}
