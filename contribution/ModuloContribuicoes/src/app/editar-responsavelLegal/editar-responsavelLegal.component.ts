import { MaxSizeValidator } from "@angular-material-components/file-input";
import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Router, ActivatedRoute } from "@angular/router";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { TranslateService } from "@ngx-translate/core";
import { NgxSpinnerService } from "ngx-spinner";
import { forkJoin } from "rxjs";
import { MyErrorDataSuperiorStateMatcher, MyErrorDateStateMatcher, MyErrorStateMatcher } from "../matcher";
import { Documento } from "../models/documento";
import { ResponsavelLegal } from "../models/responsavelLegal";
import { PopUpWarningComponent } from "../componentes/pop-up-warning/pop-up-warning.component";
import { ResponsavelLegalRequest, ListResponsavelLegal } from "../request-models/responsavel-legal-request";
import { DominioDescricaoString } from "../response-models/dominios-response";
import { DominiosService } from "../services/dominios.service";
import { ResponsavelLegalService } from "../services/responsavelLegal.service";
import { TokenStorageService } from "../services/token-storage.service";
import { base64ArrayBuffer, openErrorsDialog, showExpiredError, base64ToArrayBuffer, blobToSaveAs } from "../utils";

@Component({
    selector: 'app-editar-responsavelLegal',
    templateUrl: './editar-responsavelLegal.component.html',
    styleUrls: ['./editar-responsavelLegal.component.css']
  })

  export class EditarResponsavelLegalComponent implements OnInit {

    public responsavelLegalrequest: ResponsavelLegalRequest = <ResponsavelLegalRequest>{documentoIdentificacao: [<Documento>{}], responsavelLegal: <ResponsavelLegal>{}};
    public sexoOptions: DominioDescricaoString[] = [];
    public nacionalidadeOptions: DominioDescricaoString[] = [];
    public documentoOptions: DominioDescricaoString[] = [];
    public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
    public matcherDate: MyErrorDateStateMatcher = new MyErrorDateStateMatcher();
    public matcherDataSuperior: MyErrorDataSuperiorStateMatcher = new MyErrorDataSuperiorStateMatcher(undefined);
    public submittedFormError = false;
    public isForeign = false;
    public faTimesCircle = faTimesCircle;
    public showNissTextInput = false;
    public panelOpenState = true;
    public passportId? = <number>{};
    public disabledDocumentDropdown = false;
    public IndFacultivaSS = false;
    public fileControl: FormControl = new FormControl;
    public accept = ".pdf";
    public errors: string[] = [];
    private responsavelLegalId = <number>{};
    public isLinked = false;
    private domains: any = [];
    private listResponsavelLegalRequest = <ListResponsavelLegal>{};
    public submittedEndDate = false;
    public pdfSrc: any;
    public wrongFormat = false;
    public isOtherOption = false;
    private otherOptionId?: number;
    public funcaoOptions: DominioDescricaoString[] = [];


    constructor(
        private responsavelLegalService: ResponsavelLegalService,
        private tokenStorage: TokenStorageService,
        private router: Router,
        public translate: TranslateService,
        private spinner: NgxSpinnerService,
        private dominiosService: DominiosService,
        public errorDialog: MatDialog,
        private actRoute: ActivatedRoute,
    )   {
            this.responsavelLegalId = this.actRoute.snapshot.params.id;
        }

    public ngOnInit(): void {
        if(!this.tokenStorage.getToken()){
            this.router.navigate(['']);
        }
        else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired())
        {
            this.spinner.show();

            this.listResponsavelLegalRequest.id = this.responsavelLegalId;

            this.domains.push(this.dominiosService.getAllSexos());
            this.domains.push(this.dominiosService.getAllNacionalidades());
            this.domains.push(this.dominiosService.getAllTiposDeDocumento());
            this.domains.push(this.dominiosService.getAllFuncoes());
            this.domains.push(this.responsavelLegalService.listResponsavelLegal(this.listResponsavelLegalRequest));

            forkJoin(this.domains)
            .subscribe((domains : any) => {
                this.sexoOptions = domains[0].dominios;
                this.nacionalidadeOptions = domains[1].dominios;
                this.otherOptionId = this.nacionalidadeOptions.find(x => x.descricao == 'Estrangeiro (não desconta em TL)')?.id;
                this.documentoOptions = domains[2].dominios;
                this.passportId = this.documentoOptions.find(x => x.descricao == 'Passaporte' || x.descricao == 'Passport')?.id;
                this.funcaoOptions = domains[3].dominios;
                this.otherOptionId = this.funcaoOptions.find(x => x.descricao == 'Outro' || x.descricao == 'Other')?.id;
                if(domains[4].responsavelLegal.respLegalTabalhadorFk){
                    this.isLinked = true;
                    this.IndFacultivaSS = true;
                }

                this.responsavelLegalrequest = domains[4];
                this.responsavelLegalrequest.idEntidade = this.tokenStorage.getUser()?.idEntidade ?? 0;

                if (this.responsavelLegalrequest.responsavelLegal.funcao == this.otherOptionId)
                    this.isOtherOption = true;

                if (domains[4].documentoIdentificacao.length == 0)
                    this.responsavelLegalrequest.documentoIdentificacao = [<Documento>{}];
                this.spinner.hide();
                },
                err => {
                    this.spinner.hide();
                    this.errors.push('-1');
                    this.showError();
              });

            this.fileControl.valueChanges.subscribe((file: any) => {
                if (file.type != 'application/pdf'){
                    this.wrongFormat = true;
                    this.fileControl.setValue(undefined);
                }
                else {
                    var reader = new FileReader();
                    reader.readAsArrayBuffer(file);
                    this.responsavelLegalrequest.documentoIdentificacao[0].nomeDocumento = file.name;
                    reader.onloadend = (evt) => {
                      if (evt.target)
                        if (evt.target.readyState == FileReader.DONE) {
                          var arrayBuffer = evt.target.result;
                          if(arrayBuffer instanceof ArrayBuffer)
                          this.responsavelLegalrequest.documentoIdentificacao[0].documento = base64ArrayBuffer(arrayBuffer);
                        }
                    }
                }
              })

        }else{
          showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
        }

    }

    public changeDocument(): void{
        this.isForeign == !this.isForeign;
        this.disabledDocumentDropdown = !this.disabledDocumentDropdown;
        if (this.isForeign){
            this.responsavelLegalrequest.documentoIdentificacao[0].tpDocIdentificacao = this.passportId ?? <number>{};
        }
        else {
            this.responsavelLegalrequest.documentoIdentificacao[0].tpDocIdentificacao = <number>{};
        }
    }

    public save(): void{

        if (this.validatedAllFields()){
            if (this.responsavelLegalrequest.niss && !this.isLinked){
                this.translate.get('responsavel_legal.warningVincular').subscribe((translated: string) => {
                    const dialogRef = this.errorDialog.open(PopUpWarningComponent, {
                        id: 'desvincularDialog',
                        minHeight: '300px',
                        width: '40%',
                        height: '30%',
                        panelClass: 'warningModal',
                        data: {function: this.responsavelLegalService.saveResponsavelLegal(this.responsavelLegalrequest), msg: translated}
                    });
                    dialogRef.afterClosed().subscribe(result => {
                        if (result){
                            this.responsavelLegalService.savedSuccessfully = true;
                            this.router.navigate(['/entidadeEmpregadora'], { skipLocationChange: true });
                        }
                    });
                })
            }else{
                this.spinner.show();

                this.responsavelLegalService.updateResponsavelLegalRequest(this.responsavelLegalrequest).subscribe(x => {
                    this.spinner.hide();
                    this.responsavelLegalService.savedSuccessfully = true;
                    this.router.navigate(['/entidadeEmpregadora'], { skipLocationChange: true });
                  },
                  err => {
                    this.spinner.hide();
                    err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
                    this.showError();
                  });
            }
        }
        else{
            this.submittedFormError = true;
            this.panelOpenState = true;
        }
    }

    public cancel(): void{
        this.responsavelLegalService.traceBack = true;
        this.router.navigate(['/entidadeEmpregadora'], { skipLocationChange: true });
    }

    private validatedAllFields(): boolean{
        if (this.responsavelLegalrequest.responsavelLegal.nome.length <= 0
            || this.responsavelLegalrequest.responsavelLegal.dataNascimento == null
            || this.responsavelLegalrequest.responsavelLegal.sexo == null
            || this.responsavelLegalrequest.responsavelLegal.nacionalidade == null
            || this.responsavelLegalrequest.responsavelLegal.naturalidade.length < 0
            || this.responsavelLegalrequest.responsavelLegal.tin.length <= 0
            || this.responsavelLegalrequest.dataInicioFuncao == null
            || this.responsavelLegalrequest.responsavelLegal.funcao == null
            || this.responsavelLegalrequest.responsavelLegal.naturalidade.length <= 0){
                return false;
        }

        if (this.isOtherOption && !this.responsavelLegalrequest.responsavelLegal.funcaoOutro?.length)
            return false;

        if (!this.isLinked && (
            this.responsavelLegalrequest.documentoIdentificacao[0].tpDocIdentificacao == null
            || this.responsavelLegalrequest.documentoIdentificacao[0].numero.length < 0
            || this.responsavelLegalrequest.documentoIdentificacao[0].dataValidade == null
            || this.responsavelLegalrequest.documentoIdentificacao[0].documento.length < 0
        )){
            return false;
        }

        if (this.responsavelLegalrequest.dataFimFuncao
            && Date.parse(this.responsavelLegalrequest.dataInicioFuncao.toString()) > Date.parse(this.responsavelLegalrequest.dataFimFuncao.toString())){

                this.matcherDataSuperior = new MyErrorDataSuperiorStateMatcher(this.responsavelLegalrequest.dataInicioFuncao);
                this.submittedEndDate = true;
                return false;
        }

        return true;
    }

    private showError()
    {
        const dialogRef = openErrorsDialog(this.errors, this.errorDialog);

        dialogRef.afterClosed().subscribe(result => {
            this.errors = [];
        });
    }

    public resetNiss() : void {
        this.responsavelLegalrequest.niss = undefined;
    }

    public updateDataInicioFuncao(): void {
        if (this.responsavelLegalrequest.dataFimFuncao != undefined)
            this.matcherDataSuperior = new MyErrorDataSuperiorStateMatcher(new Date(this.responsavelLegalrequest.dataInicioFuncao ?? ''));
        if (this.responsavelLegalrequest.dataFimFuncao == null)
        {
            this.responsavelLegalrequest.dataFimFuncao = undefined;
            this.submittedEndDate = false;
            this.matcherDataSuperior = new MyErrorDataSuperiorStateMatcher(undefined);
        }
    }

    public resetDataFimFuncao(): void {
        this.responsavelLegalrequest.dataFimFuncao = undefined;
        this.submittedEndDate = false;
        this.matcherDataSuperior = new MyErrorDataSuperiorStateMatcher(undefined);
    }

    public downloadDocument(): void {
        blobToSaveAs(this.responsavelLegalrequest.documentoIdentificacao[0].documento, this.responsavelLegalrequest.documentoIdentificacao[0].nomeDocumento);
      }

      public changedValue(option: any): void {
        this.isOtherOption = option.value == this.otherOptionId;
        if (!this.isOtherOption)
            this.responsavelLegalrequest.responsavelLegal.funcaoOutro = '';
    }
}
