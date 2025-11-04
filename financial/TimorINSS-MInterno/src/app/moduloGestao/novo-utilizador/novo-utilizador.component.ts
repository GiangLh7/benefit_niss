import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { NgxSpinnerService } from "ngx-spinner";
import { formatDatePT, openErrorsDialog, openSnackBar, showExpiredError } from "../../utils";
import { MatDialog } from "@angular/material/dialog";
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from "@angular/material/snack-bar";
import { MyErrorStateMatcher } from "../../matcher";
import { DadosUtilizadorResponse } from "../../response-models/utilizador-response";
import { PerfisListagem } from "../../response-models/perfis-response";
import { DepartamentoListagem, DepartamentoListagemResponse } from "../../response-models/departamento-response";
import { UtilizadorService } from "../../services/utilizador.service";
import { DatePipe } from "@angular/common";
import { PerfilService } from "../../services/perfil.service";
import { DepartamentoService } from "../../services/departamento.service";
import { forkJoin } from "rxjs";
import { SelectDescription } from "../../models/utils";
import { TokenStorageService } from "../../services/token-storage.service";


@Component({
  standalone: false,
  selector: 'app-novo-utilizador',
  templateUrl: './novo-utilizador.component.html',
  styleUrls: ['./novo-utilizador.component.scss']
})
export class NovoUtilizadorComponent implements OnInit {
  public isLoggedIn = false;
  private token: string = <string>{};
  public faTimesCircle = faTimesCircle;
  public errors: string[] = [];
  public errorMessage = "";
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public submittedTry: boolean = false;
  public editUtilizador: boolean = false;
  public consultarUtilizador: boolean = false;

  public dadosUtilizador: DadosUtilizadorResponse = <DadosUtilizadorResponse>{};
  public idUtilizador: number = 0;

  //user department
  public departamento: SelectDescription[] = [];
  public idDepartamento: number = 0;
  public dataSourceDepartamento: DepartamentoListagem[] = [];
  public displayedColumnsDepartamento: string[] = ['nome', 'eliminar'];

  //user perfil
  public perfil: SelectDescription[] = [];
  public idPerfil: number = 0;
  public dataSourcePerfil: PerfisListagem[] = [];
  public displayedColumnsPerfil: string[] = ['descricao', 'eliminar'];

  constructor(
    private router: Router,
    private spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    public _snackBar: MatSnackBar,
    public translate: TranslateService,
    private actRoute: ActivatedRoute,
    private utilizadorService: UtilizadorService,
    private datepipe: DatePipe,
    private perfilService: PerfilService,
    private departamentoService: DepartamentoService,
    private tokenStorage: TokenStorageService
  ) {
  }

  ngOnInit(): void {

    if (!this.tokenStorage.getToken()) {
      this.router.navigate([''])
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired()) {
      this.isLoggedIn = true;

      this.editUtilizador = true;

      let idUtilizador = this.actRoute.snapshot.paramMap.get('idUtilizador');
      let idTrabalhador = this.actRoute.snapshot.paramMap.get('idTrabalhador');
      let consultar = this.actRoute.snapshot.paramMap.get('isConsultar');


      
      if (idUtilizador != null && +idUtilizador > 0 && idTrabalhador != null && +idTrabalhador > 0) {
        this.idUtilizador = +idUtilizador;
        this.getDadosTrabalhador(+idUtilizador,+idTrabalhador);
        this.getDepartamentosUtilizador(+idUtilizador);
        this.getPerfisUtilizador(+idUtilizador);
      }

      if (consultar != null && consultar) {
        this.editUtilizador = false;
        this.consultarUtilizador = true;
      }
    }
    else {
      showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
    }

  }

  public getDadosTrabalhador(idUtilizador: number,idTrabalhador: number) {
    this.showLoader();
    this.dadosUtilizador = <DadosUtilizadorResponse>{};

    let request = {
      idUtilizador: idUtilizador,
      idTrabalhador: idTrabalhador

    }
    this.utilizadorService.GetAllDadosUtilizador(request).subscribe(
      response => {

        this.dadosUtilizador = response;
        this.getListDropDown();
        this.hideLoader();
      },
      err => {
        this.dadosUtilizador = <DadosUtilizadorResponse>{};
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public getDepartamentosUtilizador(idUtilizador: number) {
    this.showLoader();

    this.departamentoService.getDepartamentosByUserId(idUtilizador).subscribe(
      x => {

        x.departamento == null ? this.dataSourceDepartamento = [] : this.dataSourceDepartamento = x.departamento;

        this.hideLoader();
      },
      err => {
        this.dadosUtilizador = <DadosUtilizadorResponse>{};
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public getPerfisUtilizador(idUtilizador: number) {
    this.showLoader();

    this.perfilService.getPerfisByUserId(idUtilizador).subscribe(
      x => {

        x.perfil == null ? this.dataSourcePerfil = [] : this.dataSourcePerfil = x.perfil;

        this.hideLoader();
      },
      err => {
        this.dadosUtilizador = <DadosUtilizadorResponse>{};
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }


  public getListDropDown() {
    this.showLoader();
    let departamentos = this.departamentoService.getAllDepartamentosAtivo();
    let perfis = this.perfilService.getAllPerfisAtivo();


    forkJoin([departamentos, perfis]).subscribe(([departamentos, perfis]) => {
      this.departamento = departamentos.selects;
      this.perfil = perfis.selects;
      this.hideLoader();
    },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public adicionarEditarUtilizador() {
    if (this.dataSourceDepartamento.length > 0 && this.dataSourcePerfil.length > 0) {

      this.showLoader();

      let request = {
        id: this.idUtilizador,
        departamento: this.dataSourceDepartamento,
        perfil: this.dataSourcePerfil
      }

      this.utilizadorService.AddUtilizador(request).subscribe(x => {
        this.hideLoader();
        openSnackBar(this.translate.instant('snackBar.addPerfil'), this._snackBar);
        this.router.navigate(['/utilizador/'],);

      },
        err => {
          this.hideLoader();
          err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.showError();
        });


    }

  }

  public addDepartamento(id: number) {
    var departamento: SelectDescription = this.departamento.filter((c: { id: number; }) => c.id === id)[0]

    var departamentoAdicionar: DepartamentoListagem;
    departamentoAdicionar = { "id": id, "nome": departamento.nome };

    var index = this.dataSourceDepartamento.findIndex(x => x.id === id);

    if (index == null || index == -1) {
      this.dataSourceDepartamento.push(departamentoAdicionar);
      this.dataSourceDepartamento = [...this.dataSourceDepartamento];
    }
  }

  public addPerfil(id: number) {
    var perfil: SelectDescription = this.perfil.filter((c: { id: number; }) => c.id === id)[0]

    var perfilAdicionar: PerfisListagem;
    perfilAdicionar = { "id": id, "descricao": perfil.nome, "dataCriacao": new Date(), "indActivo": true };

    var index = this.dataSourcePerfil.findIndex(x => x.id === id);

    if (index == null || index == -1) {
      this.dataSourcePerfil.push(perfilAdicionar);
      this.dataSourcePerfil = [...this.dataSourcePerfil];
    }
  }

  public deleteDepartamento(nome: string) {
    var index = this.dataSourceDepartamento.findIndex(x => x.nome === nome);
    this.dataSourceDepartamento.splice(index, 1)
    this.dataSourceDepartamento = [...this.dataSourceDepartamento];
  }


  public deletePerfil(nome: string) {
    var index = this.dataSourcePerfil.findIndex(x => x.descricao === nome);
    this.dataSourcePerfil.splice(index, 1)
    this.dataSourcePerfil = [...this.dataSourcePerfil];
  }

  public submitUtilizador() {
    this.submittedTry = true;
  }

  public redirectToGestaoCamposEditaveis() {
    this.router.navigate(['/camposEditaveis'],);

  }

  public redirectToPerfil() {
    this.router.navigate(['/perfil'],);

  }

  public cancelar() {
    this.router.navigate(['/utilizador/'],);
  }
  public formatDatePT(date: Date): string {
    return formatDatePT(this.datepipe, date);
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
