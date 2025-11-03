import { Component, Inject } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TokenStorageService } from '../../services/token-storage.service';
import { buildSelectOptionsWithDisabled, getSelectFilter, openErrorsDialog, SelectsWDisable } from "../../utils";
import { MoradaService } from '../../services/morada.service';
import { PostoAdministrativoService } from '../../services/postoAdministrativo.service';
import { SucoService } from '../../services/suco.service';
import { AldeiaService } from '../../services/aldeia.service';
import { MoradaDataContract } from "../../request-models/morada-request";
import { MoradaListagem } from "../../response-models/morada-response";
import { MyErrorStateDependentMatcher, MyErrorStateMatcher } from "../../matcher";
import { TranslateService } from "@ngx-translate/core";
import { SelectDescription } from "../../models/utils";




export interface PopUpAdicionarEditarMoradaData {
  idMorada: number;
  idEntidadeEmpreg?: number;
  idTrabalhador?: number;
  rua: string;
  numPorta: string;
  moradaPrincipal: boolean;
  moradaListagem: MoradaListagem[];

  //municipio
  listaMunicipio: SelectsWDisable[];
  idMunicipio?: number;

  //posto
  listaPosto: SelectDescription[];
  listaPostoFilter: SelectsWDisable[];
  idPostoAdministrativo?: number;

  //suco
  listaSuco: SelectDescription[];
  listaSucoFilter: SelectsWDisable[];
  idSuco?: number;

  //aldeia
  listaAldeia: SelectDescription[];
  listaAldeiaFilter: SelectsWDisable[];
  idAldeia?: number;

  //pais
  listaPais: SelectsWDisable[];
  idPais: number;

  editar: boolean;
  adicionar: boolean;

  idTimor: number;
}

@Component({
  selector: 'app-popUp-adicionar-editar-morada',
  templateUrl: 'pop-up-adicionar-editar-morada.component.html',
  styleUrls: ['./pop-up-adicionar-editar-morada.component.css']
})
export class PopUpAdicionarEditarMoradaComponent {
  public faTimesCircle = faTimesCircle;
  public errors: string[] = [];
  public user = 0;
  public listaPosto: SelectDescription[] = [];
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public matcherPais: MyErrorStateDependentMatcher = new MyErrorStateDependentMatcher(true);
  public submittedTry: boolean = false;


  constructor(
    public moradaService: MoradaService,
    public postoAdministrativo: PostoAdministrativoService,
    public suco: SucoService,
    public aldeia: AldeiaService,
    public spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    private tokenStorage: TokenStorageService,
    public translate: TranslateService,
    public dialogRef: MatDialogRef<PopUpAdicionarEditarMoradaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PopUpAdicionarEditarMoradaData
  ) {
    if (!data.editar) {
      data.listaSucoFilter = [];
      data.listaAldeiaFilter = [];
      data.listaPostoFilter = [];
    }

    if(data.idPais != data.idTimor){
      this.matcherPais = new MyErrorStateDependentMatcher(false);
      data.idMunicipio = 0;
      data.idPostoAdministrativo = 0;
      data.idSuco = 0;
      data.idAldeia = 0;
    }
  }

  public closePopUp(): void {
    this.dialogRef.close();
  }

  //gravar edição e registo de nova morada
  public gravar($event: any, data: PopUpAdicionarEditarMoradaData): void {
    this.submittedTry = true;
    let valid = true;
    if (!this.data.rua || !this.data.idPais) {
      valid = false;
    }

    if (data.idPais && data.idPais == data.idTimor && (!this.data.idMunicipio || !this.data.idPostoAdministrativo ||
      !this.data.idSuco || !this.data.idAldeia)) {
      valid = false;
    }

    if (valid) {
      this.showLoader();

      if (this.tokenStorage.getToken()) {
        let userId = this.tokenStorage.getUser()?.id;
        if (userId != null) {
          this.user = userId;
        }
      }
      let morada = {
        idMorada: data.idMorada != null ? data.idMorada : 0,
        moradaAldeiaFk: data.idAldeia,
        rua: data.rua,
        numPorta: data.numPorta,
        moradaPaisFk: data.idPais,
        moradaPrincipal: data.moradaPrincipal,
        idEntidadeEmpreg: data.idEntidadeEmpreg,
        idTrabalhador: data.idTrabalhador,
      };


      this.saveMorada(morada);
    }
  }

  public saveMorada(morada: MoradaDataContract) {
    let request = {
      morada: morada
    }
    if (morada.idMorada == 0) {
      this.moradaService.saveMorada(request).subscribe(x => {
        this.dialogRef.close(true);
        this.hideLoader();
      },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
    }
    else {
      this.moradaService.updateMorada(request).subscribe(x => {
        this.dialogRef.close(true);
        this.hideLoader();
      },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
    }

  }

  public changePosto(id?: number, data?: PopUpAdicionarEditarMoradaData) {
    this.showLoader();

    if (data) {
      data.listaPostoFilter = [];
      data.listaSucoFilter = [];
      data.listaAldeiaFilter = [];
      data.idPostoAdministrativo = 0;
      data.idSuco = 0;
      data.idAldeia = 0;

      data.listaPostoFilter = buildSelectOptionsWithDisabled(getSelectFilter(id, data.listaPosto));
    }
    this.hideLoader();
  }

  public changeSuco(id?: number, data?: PopUpAdicionarEditarMoradaData) {
    this.showLoader();
    if (data) {

      data.listaSucoFilter = [];
      data.listaAldeiaFilter = [];
      data.idSuco = 0;
      data.idAldeia = 0;

      data.listaSucoFilter = buildSelectOptionsWithDisabled(getSelectFilter(id, data.listaSuco));
    }
    this.hideLoader();
  }

  public changeAldeia(id?: number, data?: PopUpAdicionarEditarMoradaData) {
    this.showLoader();
    if (data) {
      data.listaAldeiaFilter = [];
      data.idAldeia = 0;

      data.listaAldeiaFilter = buildSelectOptionsWithDisabled(getSelectFilter(id, data.listaAldeia));
    }
    this.hideLoader();
  }


  public showLoader() {
    this.spinner.show();
  }


  public hideLoader() {
    this.spinner.hide();
  }

  public submitMorada() {
    this.submittedTry = true;
  }

  public showError()
  {
    const dialogRef = openErrorsDialog(this.errors, this.errorDialog);
    this.hideLoader();

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }

  public updateDependentErroState(data: PopUpAdicionarEditarMoradaData) {
    this.showLoader();
    this.matcherPais = new MyErrorStateDependentMatcher(data.idPais == data.idTimor);
    if (data.idPais == data.idTimor) {
      data.idMunicipio = undefined;
      data.idPostoAdministrativo = undefined;
      data.idSuco = undefined;
      data.idAldeia = undefined;
    }
    else{
      data.idMunicipio = 0;
      data.idPostoAdministrativo = 0;
      data.idSuco = 0;
      data.idAldeia = 0;
    }
    this.hideLoader();
  }


}
