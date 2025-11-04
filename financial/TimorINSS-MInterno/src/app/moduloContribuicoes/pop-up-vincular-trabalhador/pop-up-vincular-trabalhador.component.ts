import { SelectDescription } from './../../models/utils';
import { Component, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from "@ngx-translate/core";
import { NgxSpinnerService } from "ngx-spinner";
import { MyErrorDataSuperiorStateMatcher, MyErrorStateDependentMatcher, MyErrorStateMatcher, NotRequiredErrorStateMatcher } from "../../matcher";
import { RelEntidadeTrabalhador } from "../../models/relEntidadeTrabalhador";
import { DominioDescricaoString } from "../../response-models/dominios-response";
import { RelEntidadeTrabalhadorService } from "../../services/relEntidadeTrabalhador.service";
import { openErrorsDialog, RegexPatterns } from "../../utils";

export interface PopUpVincularTrabalhadorData {
  entidade: number,
  trabalhador: number,
  regimes: DominioDescricaoString[];
  tiposContratos: DominioDescricaoString[];
  naturezaContratos: DominioDescricaoString[];
  leisLabAplicavel: DominioDescricaoString[];
  escaloes: SelectDescription[];
  profissoes: DominioDescricaoString[];

}

@Component({
  standalone: false,
  selector: 'app-popUp-vincular-trabalhador',
  templateUrl: 'pop-up-vincular-trabalhador.component.html',
  styleUrls: ['./pop-up-vincular-trabalhador.component.css']
})
export class PopUpVincularTrabalhadorComponent {
  public availableRegex = RegexPatterns;
  public faTimesCircle = faTimesCircle;
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public matcherFuncpublico: MyErrorStateDependentMatcher = new MyErrorStateDependentMatcher(false);
  public notRequiredMatcher: NotRequiredErrorStateMatcher = new NotRequiredErrorStateMatcher();
  public escalaoMatcher: MyErrorStateDependentMatcher = new MyErrorStateDependentMatcher(false);
  public matcherDataSuperior: MyErrorDataSuperiorStateMatcher = new MyErrorDataSuperiorStateMatcher(undefined);
  public submittedTry: boolean = false;
  public errors: string[] = [];
  public rel: RelEntidadeTrabalhador = <RelEntidadeTrabalhador>{funcPublico: false};
  public escaloesFiltrados: SelectDescription[] = [];

  public isProfissaoOutro = false;
  public profissaoOutroId: number = 0;

  constructor(
    public dialogRef: MatDialogRef<PopUpVincularTrabalhadorComponent>,
    private spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    private relEntidadeTrabalhadorService: RelEntidadeTrabalhadorService,
    public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: PopUpVincularTrabalhadorData) {
      this.rel.idRelEntidadeTrabalhador = 0;
      this.rel.entidadeFk = data.entidade;
      this.rel.trabalhadorFk = data.trabalhador;
    }

  public onNoClick(): void {
    this.dialogRef.close();
  }

  public submit(): void {
    this.submittedTry = true;
  }

  public onSaveClick(): void {
    this.showLoader();

    let request = {
      relEntidadeTrabalhador: this.rel
    }

    this.relEntidadeTrabalhadorService.saveRelEntidadeTrabalhador(request).subscribe(x => {
      this.hideLoader();
      this.dialogRef.close(true);
    },
    err => {
      err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
    });
  }

  public changeRegime()
  {
    this.rel.escalaoFk = undefined;
    this.escaloesFiltrados = this.data.escaloes.filter(e => e.parentId == this.rel.regimeFk);
    var temEscaloes = this.escaloesFiltrados.length > 0;
    this.escalaoMatcher = new MyErrorStateDependentMatcher(temEscaloes);
  }

  public showError()
  {
    const dialogRef = openErrorsDialog(this.errors, this.errorDialog);
    this.hideLoader();

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }

  public showLoader()
  {
    this.spinner.show();
  }


  public hideLoader()
  {
    this.spinner.hide();
  }

  public updateDependentErroState()
  {
    this.matcherFuncpublico = new MyErrorStateDependentMatcher(this.rel.funcPublico);
  }

  public clearHorasSemana()
  {
    this.rel.horasSemana = 0;
  }

  public clearDiasSemana()
  {
    this.rel.diasSemana = 0;
  }

  public clearNumFuncPublico()
  {
    this.rel.numFuncPublico = "";
  }

  public clearDtIniFimTrabalhador()
  {
    this.rel.dtIniFimTrabalhador = undefined;
  }

  public updateDataInicioVinculo()
  {
    this.matcherDataSuperior = new MyErrorDataSuperiorStateMatcher(this.rel.dtIniVincTrabalhador);
  }

  public updateIsProfissaoOutro() {

    let profissaoOutro = this.data.profissoes.filter((c: { descricao: string; }) => c.descricao === 'Outro');
    if (profissaoOutro.length){
      this.profissaoOutroId = profissaoOutro[0].id;

      if(this.rel.profissao == this.profissaoOutroId){
          this.isProfissaoOutro = true;
      }
      else{
        this.isProfissaoOutro = false;
      }
    }
  }

  public clearProfissaoOutro() {
    this.rel.profissaoOutro = "";
  }
}
