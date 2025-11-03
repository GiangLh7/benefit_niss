import { Component } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from "@angular/router";
import { Suspensao } from "../../models/suspensao";
import { TokenStorageService } from '../../services/token-storage.service';
import { FilterRequest } from '../../request-models/utils-request';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { formatDatePT, openSnackBar } from "../../utils";
import { NgxSpinnerService } from 'ngx-spinner';
import { TrabalhadoresService } from '../../services/trabalhadores.service';
import { TrabalhadorListagem } from "../../response-models/trabalhadores-response";
import { TrabalhadorListagemRequest } from "../../request-models/trabalhadores-request";
import { DatePipe } from "@angular/common";
import { SuspensaoRequest } from "../../request-models/suspensao-request";
import { SuspensaoService } from "../../services/suspensao.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DialogComponent } from "../../componentes/dialog/dialog.component";
import { TranslateService } from '@ngx-translate/core';
import { MyErrorDataSuperiorStateMatcher, MyErrorDateStateMatcher, MyErrorStateMatcher } from "../../matcher";


@Component({
  selector: 'registoSuspensao',
  templateUrl: 'registoSuspensao.component.html',
  styleUrls: ['./registoSuspensao.component.css']
})
export class RegistoSuspensaoComponent {
  public faTimesCircle = faTimesCircle;
  public isLoggedIn = false;
  public isLoginFailed = false;
  public errorMessage = "";
  public submittedTry: boolean = false;
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public matcherDate: MyErrorDateStateMatcher = new MyErrorDateStateMatcher();
  public matcherDataSusperior: MyErrorDataSuperiorStateMatcher = new MyErrorDataSuperiorStateMatcher(undefined);
  public totalRows: number = 0;
  public pageSize = 20;
  public pageIndex = 0;
  public selected: number = 0;
  public searchField: string = '';
  public disabled: boolean = true;


  public entidadeId: number = 0;
  public idRel: number = 0;
  public searchInput: string = '';
  public searched: boolean = false;
  public errors: string[] = [];


  public displayedColumns: string[] = ['select', 'nome', 'regime', 'incricaoINSS', 'dtInicioDeVinculo', 'dtFimDeVinculo'];
  public dataSource: TrabalhadorListagem[] = [];
  public suspensao: Suspensao = <Suspensao>{};
  public entidadeTrabalhador: string = '';
  public documentType: number = 0;
  public isEdicao: boolean = false;


  constructor(
    private suspensaoService: SuspensaoService,
    private trabalhadoresService: TrabalhadoresService,
    private tokenStorage: TokenStorageService,
    private router: Router,
    private spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    public datepipe: DatePipe,
    public _snackBar: MatSnackBar,
    private actRoute: ActivatedRoute,
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
        this.entidadeId = idEntidade;
      }

      let suspensao = this.actRoute.snapshot.paramMap.get('suspensao');
      let nissTrabalhador = this.actRoute.snapshot.paramMap.get('niss');
      let idTrabalhador = this.actRoute.snapshot.paramMap.get('idTrabalhador');
      let idRel = this.actRoute.snapshot.paramMap.get('idRel');

      if (idRel != null) {
        this.idRel = +idRel;
      }
      if (suspensao && suspensao == 'entidade') {
        this.entidadeTrabalhador = '1';
      }
      else if (suspensao && suspensao == 'trabalhador') {
        this.entidadeTrabalhador = '2';
        if (nissTrabalhador != null) {
          this.searchInput = nissTrabalhador;
          this.getTable();
        }
        if (idTrabalhador != null) {
          this.suspensao.idTrabalhador = +idTrabalhador;
        }
      }
      this.hideLoader();
    }
  }

  public pesquisarPessoa() {
    this.getTable();
  }

  public getTable() {
    this.showLoader();

    this.selected = 0;
    let filter: FilterRequest;
    filter = {};
    filter.filterField = this.searchField;
    filter.filterBy = this.searchInput;
    filter.index = this.pageIndex;
    filter.rows = this.pageSize

    let request: TrabalhadorListagemRequest;

    request = { "id": this.entidadeId, "filter": filter };

    this.trabalhadoresService.getTrabalhadorByNiss(request).subscribe(x => {
      x.trabalhadores == null ? this.dataSource = [] : this.dataSource = x.trabalhadores;
      this.totalRows = x.rows;
      this.hideLoader();
      this.searched = true;
    },
      err => {
        this.dataSource = [];
        this.hideLoader();
        if (err.statusText == 'Unknown Error') {
          this.showError(['-1']);
        }
        else {
          this.errorMessage = this.translate.instant('error.-1');
        }
      });
  }


  public showLoader() {
    this.spinner.show();
  }


  public hideLoader() {
    this.spinner.hide();
  }

  public showError(error: string[]) {
    error.map(x => this.errors.push(x));
    this.errorDialog.closeAll();
    const dialogRef = this.errorDialog.open(DialogComponent, {
      id: 'dialog',
      minHeight: '300px',
      width: '50%',
      height: '50%',
      data: { errors: this.errors }
    });


    dialogRef.afterClosed().subscribe((result) => {
      if (result)
        this.errors = [];
    });
  }

  public updateSelect(event: any, id: number) {
    if (this.selected === id)
      this.selected = 0;
    else
      this.selected = id;
  }

  public updateTable(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getTable();
  }

  public formatDate(date: Date | undefined): string {
    return formatDatePT(this.datepipe, date);
  }

  public clearPesquisarPessoa() {
    this.searchInput = '';
    this.dataSource = [];
    this.disabled = false;
    this.selected = 0;
    this.searchField = '';
    this.suspensao = <Suspensao>{};
  }

  public cancelar(): void {
    if (this.entidadeTrabalhador == '1') {
      this.suspensaoService.savedSuccessfully = true;
      this.router.navigate(['/entidadeEmpregadora/'], { skipLocationChange: true })
    }
    else {
      if (this.idRel > 0) {
        this.suspensaoService.savedSuccessfully = true;
        this.router.navigate(['/novoTrabalhador', this.idRel], { skipLocationChange: true });
      }
      else {
        this.router.navigate(['/trabalhadores/'], { skipLocationChange: true });
      }
    }

  }

  public updateDataInicioSuspensao() {
    this.matcherDataSusperior = new MyErrorDataSuperiorStateMatcher(this.suspensao.dataInicioSuspensao);
  }

  public gravar(): void {
    this.submittedTry = true;

    let valid = true;

    if (this.entidadeTrabalhador == '') {
      valid = false;
    }

    if (this.entidadeTrabalhador == '1' && this.suspensao.dataInicioSuspensao == null) {
      valid = false;
    }
    if (this.entidadeTrabalhador == '2' && (this.searchInput == '' || this.suspensao.dataInicioSuspensao == null ||
      this.selected == 0)) {
      valid = false;
    }

    if (this.suspensao.dataFimSuspensao != null && this.suspensao.dataFimSuspensao < this.suspensao.dataInicioSuspensao
    ) {
      valid = false;
    }

    if (valid) {
      this.showLoader();
      this.suspensao.idEntidade = this.entidadeId;

      //Entidade Empregadora
      if (this.entidadeTrabalhador == '1') {
        this.suspensao.idTrabalhador = 0;
        let request: SuspensaoRequest = {
          suspensao: this.suspensao
        };
        this.suspensaoService.saveSuspensao(request).subscribe(x => {
          this.hideLoader();
          this.suspensaoService.savedSuccessfully = true;
          openSnackBar(this.translate.instant('snackBar.registoSuspensao'), this._snackBar);
          this.router.navigate(['/entidadeEmpregadora/'], { skipLocationChange: true })
        },
          err => {
            this.hideLoader();
            if (err.statusText == 'Unknown Error') {
              this.showError(['-1']);
            }
            else {
              this.showError(['-11']);
            }

            this.router.navigate(['/entidadeEmpregadora/'], { skipLocationChange: true })
          });
      }

      // Trabalhador
      if (this.entidadeTrabalhador == '2') {
        this.suspensao.idTrabalhador = this.selected;
        let request: SuspensaoRequest = {
          suspensao: this.suspensao
        };

        this.suspensaoService.saveSuspensao(request).subscribe(x => {
          this.hideLoader()
          openSnackBar(this.translate.instant('snackBar.registoSuspensao'), this._snackBar);

          if (this.idRel > 0) {
            this.suspensaoService.savedSuccessfully = true;
            this.router.navigate(['/novoTrabalhador', this.idRel], { skipLocationChange: true });
          }
          else {
            this.router.navigate(['/trabalhadores/']), { skipLocationChange: true };
          }
        },
          err => {
            this.hideLoader();
            if (err.statusText == 'Unknown Error') {
              this.showError(['-1']);
            }
            else {
              this.showError(['-11']);
            }
            this.router.navigate(['/trabalhadores/'], { skipLocationChange: true });
          });
      }

    }
  }

  public return(): void {
    this.router.navigate(['/contribHomePage/'], { skipLocationChange: true });
  }
}
