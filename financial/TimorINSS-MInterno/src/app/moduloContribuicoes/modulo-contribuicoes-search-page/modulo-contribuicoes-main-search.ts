import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { TranslateService } from "@ngx-translate/core";
import { NgxSpinnerService } from "ngx-spinner";
import { MyErrorStateMatcher } from "../../matcher";
import { EntidadeEmpregadoraNissRequest } from "../../request-models/entidadeEmpregadora-request";
import { EntidadeEmpregadoraConsultaResponse } from "../../response-models/entidadeEmpregadora-response";
import { EntidadeEmpregadoraService } from "../../services/entidadeEmpregadora.service";
import { TokenStorageService } from "../../services/token-storage.service";
import { openErrorsDialog } from "../../utils";
import { PopUpAdicionarEditarEntidadeComponent } from "../pop-up-adicionar-editar-entidade/pop-up-adicionar-editar-entidade.component";

@Component({
    selector: 'app-modulo-contrib',
    templateUrl: './modulo-contribuicoes-main-search.html',
    styleUrls: ['./modulo-contribuicoes-main-search.css']
})

export class ContribHomeSearchComponent implements OnInit {
    public isLoggedIn = false;
    public errors: string[] = [];
    public faTimesCircle = faTimesCircle;
    public errorMessage = "";
    public submittedTry = false;
    public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
    public presentEntidade = false;
    public nissRequest?: number;
    public request = <EntidadeEmpregadoraNissRequest>{};
    public entidadeEmpregadoraConsulta = <EntidadeEmpregadoraConsultaResponse>{};
    public sitInscricao: string = '';
    public entidadeId? : number;
    public nissIsNegative = false;

    constructor(
        private tokenStorage: TokenStorageService,
        public translate: TranslateService,
        private router: Router,
        public errorDialog: MatDialog,
        private entidadeEmpregadoraService: EntidadeEmpregadoraService,
        private spinner: NgxSpinnerService,
        private addEditEntidadeDialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
        if (this.tokenStorage.getToken()) {
            this.entidadeId = this.tokenStorage.getUser()?.idEntidade;
            if (this.entidadeId) {
              this.entidadeEmpregadoraService.getEntidadeEmpregadoraByIdEntidade(this.entidadeId).subscribe(
                response => {
                    this.entidadeEmpregadoraConsulta = response;
                    this.entidadeId = response.idEntidadeEmpreg;
                    this.situacaoInscricao(this.entidadeEmpregadoraConsulta);
                    this.presentEntidade = true;
                    this.spinner.hide();
                    this.isLoggedIn = true;
                },
                err => {
                    this.spinner.hide();
                    err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
                    this.showError();
                  });
            } else {
              this.isLoggedIn = true;
            }
        }
        else
            this.router.navigate(['']);
    }

    public pesquisarEntidade(): void {
        this.submittedTry = true;
        if (this.nissRequest == undefined)
            return;
        if (this.nissRequest < 0){
          this.nissIsNegative = true;
          return;
        }
        else
          this.nissIsNegative = false;

        this.spinner.show();
        this.request.niss = this.nissRequest.toString();
        this.entidadeEmpregadoraService.GetEntidadeByNiss(this.request).subscribe(
            response => {
                this.entidadeEmpregadoraConsulta = response;
                this.entidadeId = response.idEntidadeEmpreg;
                let user = this.tokenStorage.getUser();
                if(user)
                {
                  user.idEntidade = this.entidadeId;
                  this.tokenStorage.saveUser(user);
                }
                this.situacaoInscricao(this.entidadeEmpregadoraConsulta);
                this.presentEntidade = true;
                this.spinner.hide();
            },
            err => {
                this.spinner.hide();
                err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
                this.showError();
              });
    }

    public clearPesquisarEntidade(): void {
        this.nissRequest = undefined;
        this.nissIsNegative = false;
    }

    public openAddEditPopup(): void {
      this.addEditEntidadeDialog.open(PopUpAdicionarEditarEntidadeComponent, {
        id: 'addEditEntidade',
        minHeight: '100px',
        width: '70%',
        height: '87%',
        panelClass: 'modalWithBorder',
      });
    }

    public situacaoInscricao(entidadeEmpregadoraConsulta: EntidadeEmpregadoraConsultaResponse) {
        if (entidadeEmpregadoraConsulta.situacInscricao == 'A') {
          this.sitInscricao = this.translate.instant('general.select_enabled');
        }
        if (entidadeEmpregadoraConsulta.situacInscricao == 'I') {
          this.sitInscricao = this.translate.instant('general.select_disabled');
        }

        if (entidadeEmpregadoraConsulta.situacInscricao == 'S') {
          this.sitInscricao = this.translate.instant('general.select_suspended');
        }
      }

      public showError() {
        const dialogRef = openErrorsDialog(this.errors, this.errorDialog);
        this.spinner.hide();
        dialogRef.afterClosed().subscribe(result => {
          this.errors = [];

        });
      }

    public return(): void {
      this.nissRequest = undefined;
      this.presentEntidade = false;
      this.submittedTry = false;
      this.entidadeId = undefined;
    }
}
