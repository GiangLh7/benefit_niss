import { Component, Inject } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TokenStorageService } from '../../services/token-storage.service';
import { DialogComponent } from '../../componentes/dialog/dialog.component';
import { base64ArrayBuffer, buildSelectOptionsWithDisabled, openSnackBar, RegexPatterns, SelectsWDisable } from "../../utils";
import { DocumentoService } from "../../services/documento.service";
import { Documento } from "../../models/documento";
import { FormControl, Validators } from "@angular/forms";
import { MaxSizeValidator } from '../../utils/file-validators';
import { MyErrorDateSuperiorDataAtualStateMatcher, MyErrorStateMatcher } from "../../matcher";
import { TranslateService } from "@ngx-translate/core";
import { EntidadeEmpregadoraService } from "src/app/services/entidadeEmpregadora.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NaturezaJuridicaService } from "src/app/services/naturezaJuridica.service";
import { ActividadeEconomicaService } from "src/app/services/actividadeEconomica.service";
import { SectorActividadeService } from "src/app/services/sectorActividade.service";
import { forkJoin } from "rxjs";
import { Moment } from "moment";
import moment from "moment";

@Component({
  standalone: false,
  selector: 'app-popUp-adicionar-editar-entidade',
  templateUrl: 'pop-up-adicionar-editar-entidade.component.html',
  styleUrls: ['./pop-up-adicionar-editar-entidade.component.css']
})
export class PopUpAdicionarEditarEntidadeComponent {
  public availableRegex = RegexPatterns;
  public faTimesCircle = faTimesCircle;
  public errors: string[] = [];
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public submittedTry: boolean = false;
  public search: string = '';
  private entidadeId?: number;
  public name: string = '';
  public tin?: string = '';
  public niss?: string = '';
  public active?: string;
  public email?: string = '';
  public telemovel?: string = '';
  public idNaturezaJuridica?: number;
  public idActividadeEconomica?: number;
  public idSectorActividade?: number;
  public numTrabalhador?: number;
  public dataInicioActiv?: Moment;
  public dataInicioTrabServico?: Moment;
  public dataInscricao?: Moment;

  public today = new Date();

  public isNew: boolean = false;
  public isEdit: boolean = false;

  public matcherDateInicioAtividade: MyErrorDateSuperiorDataAtualStateMatcher = new MyErrorDateSuperiorDataAtualStateMatcher();
  public matcherDateInicioTrabServ: MyErrorDateSuperiorDataAtualStateMatcher = new MyErrorDateSuperiorDataAtualStateMatcher();

  // options

  public naturezaJuridica: SelectsWDisable[] = [];
  public actividadeEconomica: SelectsWDisable[] = [];
  public sectorActividade: SelectsWDisable[] = [];

  public situacaoInscricaoOptions = [
    {
      text: 'general.select_enabled',
      value: 'A',
    },
    {
      text: 'general.select_disabled',
      value: 'I',
    },
    {
      text: 'general.select_suspended',
      value: 'S',
    }
  ]


  constructor(
    public entidadeEmpregadoraService: EntidadeEmpregadoraService,
    public spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    public translate: TranslateService,
    public dialogRef: MatDialogRef<PopUpAdicionarEditarEntidadeComponent>,
    public _snackBar: MatSnackBar,
    private naturezaJuridicaService: NaturezaJuridicaService,
    private actividadeEconomiciaService: ActividadeEconomicaService,
    private sectorActividadeService: SectorActividadeService,
  ) {
  }

  ngOnInit(): void {
    let naturezaJuridica = this.naturezaJuridicaService.getAllNaturezaJuridica();
    let actividadeEconomica = this.actividadeEconomiciaService.getAllActividadeEconomica();
    let sectorActividade = this.sectorActividadeService.getAllSectorActividade();


    forkJoin([naturezaJuridica, actividadeEconomica, sectorActividade]).subscribe(([naturezaJuridica, actividadeEconomica, sectorActividade]) => {
      this.naturezaJuridica = buildSelectOptionsWithDisabled(naturezaJuridica.selects);
      this.actividadeEconomica = buildSelectOptionsWithDisabled(actividadeEconomica.selects);
      this.sectorActividade = buildSelectOptionsWithDisabled(sectorActividade.selects);
      this.hideLoader();
    },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public closePopUp(): void {
    this.dialogRef.close();
  }

  public submit(): void {
    this.submittedTry = true;
  }

  // public saveDocumento() {
  //   this.showLoader();

  //   if(!(this.data.documento.nomeDocumento.length > 0) && this.data.documento.documento)
  //     this.data.documento.nomeDocumento = this.documentPlaceholder;

  //   let request = {
  //     documento: this.data.documento
  //   }
  //   if (!request.documento.idDocumento) {
  //     this.documentoService.saveDocumento(request).subscribe(x => {
  //       this.dialogRef.close(true);
  //     },
  //       err => {
  //         err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
  //         this.showError();
  //       });
  //   }
  // }

  public saveEntidade() {
    this.showLoader();

    const request = {
      EntidadeEmpregadora: {
        Id: this.entidadeId,
        Telemovel: this.telemovel,
        Email: this.email,
        Nome: this.name,
        Niss: this.niss,
        Tin: this.tin,
        SituacInscricao: this.active,
        IdNaturezaJuridica: this.idNaturezaJuridica,
        IdActividadeEconomica: this.idActividadeEconomica,
        IdSectorActividade: this.idSectorActividade,
        NumTrabalhador: this.numTrabalhador,
        DataInicioActiv: this.dataInicioActiv,
        DataInicioTrabServico: this.dataInicioTrabServico,
        DataInscricao: this.dataInscricao,
      }
    }

    this.entidadeEmpregadoraService.upsertEntidadeEmpregadora(request).subscribe(x => {
      this.dialogRef.close(true);
      this.hideLoader();
      openSnackBar(this.translate.instant('snackBar.entidadeAtualizada'), this._snackBar);
    },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public showLoader() {
    this.spinner.show();
  }


  public hideLoader() {
    this.spinner.hide();
  }

  public pesquisarEntidade() {

    if (!this.search) return;

    this.entidadeEmpregadoraService.GetEntidadeByNiss({ niss: this.search }).subscribe(
      response => {
        const { nome, situacInscricao, idEntidadeEmpreg } = response as any;
        this.isEdit = true;
        this.isNew = false;
        this.clearForm();
        this.name = nome;
        this.active = situacInscricao;
        this.entidadeId = idEntidadeEmpreg;
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
        if (err.status === 400) {
          this.isEdit = false;
          this.isNew = true;
          this.clearForm();
          this.niss = this.search;
        }
        else {
          err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.showError();
        }
      });

  }

  private clearForm() {
    this.name = '';
    this.active = undefined;
    this.tin = '';
    this.niss = '';
    this.email = '';
    this.telemovel = '';
    this.entidadeId = undefined;
    this.idNaturezaJuridica = undefined;
    this.idActividadeEconomica = undefined;
    this.idSectorActividade = undefined;
    this.numTrabalhador = undefined;
    this.dataInicioActiv = undefined;
    this.dataInicioTrabServico = undefined;
    this.dataInscricao = undefined;
  }

  public canSubmit() {
    const now = new Date().getTime();

    return (this.isNew &&
            this.name &&
            this.active &&
            this.tin &&
            this.niss &&
            this.email &&
            this.telemovel &&
            this.telemovel.match(this.availableRegex.phonelPattern) &&
            this.idNaturezaJuridica &&
            this.idActividadeEconomica &&
            this.idSectorActividade &&
            this.numTrabalhador &&
            this.dataInicioActiv &&
            this.dataInicioActiv.isBefore(moment()) &&
            this.dataInicioTrabServico &&
            this.dataInicioTrabServico.isBefore(moment()) &&
            this.dataInscricao &&
            this.dataInicioActiv.isBefore(moment())) ||
      (this.isEdit && this.name && this.active);
  }

  public clearPesquisarEntidade() {
    this.search = "";
  }

  public showError() {
    this.hideLoader();
    const dialogRef = this.errorDialog.open(DialogComponent, {
      id: 'dialog',
      minHeight: '300px',
      width: '80%',
      height: '60%',
      data: { errors: this.errors }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }
}
