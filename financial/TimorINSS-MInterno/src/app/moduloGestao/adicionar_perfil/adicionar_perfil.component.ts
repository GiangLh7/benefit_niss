import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { NgxSpinnerService } from "ngx-spinner";
import { openErrorsDialog, openSnackBar, showExpiredError } from "../../utils";
import { MatDialog } from "@angular/material/dialog";
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from "@angular/material/snack-bar";
import { CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FuncionalidadesListagem } from "../../response-models/funcionalidade-response";
import { FuncionalidadeService } from "../../services/funcionalidade.service";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { MyErrorStateMatcher } from "../../matcher";
import { PerfilService } from "../../services/perfil.service";
import { RelPerfilFuncionalidadeService } from "../../services/relPerfilFuncionalidade.service";
import { TokenStorageService } from "../../services/token-storage.service";
import { timeStamp } from "console";


@Component({
  selector: 'app-adicionar_perfil',
  templateUrl: './adicionar_perfil.component.html',
  styleUrls: ['./adicionar_perfil.component.css']
})
export class AdicionarPerfilComponent implements OnInit {
  public isLoggedIn = false;
  public faTimesCircle = faTimesCircle;
  public errors: string[] = [];
  public errorMessage = "";
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public submittedTry: boolean = false;
  public addPerfil: boolean = false;
  public editPerfil: boolean = false;
  public idPerfil: number = 0;



  @ViewChild('table1') table1: MatTable<any> | undefined;
  @ViewChild('table2') table2: MatTable<any> | undefined;
  @ViewChild('list1') list1: CdkDropList | undefined;

  //region funcionalidades table
  public nomePerfil = '';
  public ELEMENT_DATA: FuncionalidadesListagem[] = [];
  public displayedColumnsFuncionalidades: string[] = ['descricao', 'create', 'read', 'update', 'delete'];
  public dataSource: any = [];

  //region funcionalidades do perfil table
  public ELEMENT_DATA2: FuncionalidadesListagem[] = [];
  public dataSource2: any = [];



  constructor(
    private router: Router,
    private perfilService: PerfilService,
    private spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    public _snackBar: MatSnackBar,
    public translate: TranslateService,
    private funcionalidesService: FuncionalidadeService,
    private relPerfilFuncionalidadeService: RelPerfilFuncionalidadeService,
    private tokenStorage: TokenStorageService,
    private actRoute: ActivatedRoute
  ) {
  }

  ngOnInit(): void {

    if (!this.tokenStorage.getToken()) {
      this.router.navigate([''])
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired()) {
      this.isLoggedIn = true;
      this.showLoader();
      this.addPerfil = true;

      //editar perfil
      let idPerfil = this.actRoute.snapshot.paramMap.get('idPerfil');
      let nomePerfil = this.actRoute.snapshot.paramMap.get('nomePerfil');

      if (nomePerfil != null)
        this.nomePerfil = nomePerfil;

      if (idPerfil != null && +idPerfil > 0) {
        this.idPerfil = +idPerfil;
        this.addPerfil = false;
        this.editPerfil = true;
      }

      this.getTableRelPerfilFuncionalidade(this.idPerfil);
    }
    else {
      showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
    }

  }

  public getTableRelPerfilFuncionalidade(idPerfil: number) {

    this.relPerfilFuncionalidadeService.getRelPerfilFuncionalidadeByIdPerfil(idPerfil).subscribe(x => {
      x.perfilFuncionalidade == null ? this.ELEMENT_DATA2 = [] : this.ELEMENT_DATA2 = x.perfilFuncionalidade;
      x.funcionalidade == null ? this.ELEMENT_DATA = [] : this.ELEMENT_DATA = x.funcionalidade;

      var element_data_aux: any[] = [];
      if (this.ELEMENT_DATA2.length > 0) {
        for (var i = 0; i < this.ELEMENT_DATA2.length; i++) {

          element_data_aux.push(this.ELEMENT_DATA.find(x => x.descricao === this.ELEMENT_DATA2[i].descricao));

        }
        this.ELEMENT_DATA = this.ELEMENT_DATA.filter(e => element_data_aux.indexOf(e) === -1);

      }
      this.dataSource2 = new MatTableDataSource(this.ELEMENT_DATA2);
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);

      this.hideLoader();
    },
      err => {
        this.ELEMENT_DATA2 = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }


  public drop(event: CdkDragDrop<FuncionalidadesListagem[]>) {

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }

    this.dataSource.data = JSON.parse(JSON.stringify(this.dataSource.data));
    this.dataSource2.data = JSON.parse(JSON.stringify(this.dataSource2.data));
  }

  public updateCreate(event: any, element: FuncionalidadesListagem) {
    if (element.create) {
      element.create = false;
    }
    else {
      element.create = true;
    }
  }

  public updateRead(event: any, element: FuncionalidadesListagem) {
    if (element.read) {
      element.read = false;
    }
    else {
      element.read = true;
    }
  }

  public updateUpdate(event: any, element: FuncionalidadesListagem) {
    if (element.update) {
      element.update = false;
    }
    else {
      element.update = true;
    }
  }

  public updateDelete(event: any, element: FuncionalidadesListagem) {
    if (element.delete) {
      element.delete = false;
    }
    else {
      element.delete = true;
    }
  }

  public adicionarEditarPerfil() {

    if (this.idPerfil != null && this.idPerfil != 0) {

      this.editarPerfil();
    }

    else {
      this.showLoader();

      let request = {
        descricao: this.nomePerfil,
        funcionalidade: this.dataSource2.data
      }

      this.perfilService.addPerfil(request).subscribe(x => {
        this.hideLoader();
        openSnackBar(this.translate.instant('snackBar.addPerfil'), this._snackBar);
        this.dataSource2 = [];
        this.router.navigate(['/perfil/'], { skipLocationChange: true });

      },
        err => {
          this.hideLoader();
          err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.showError();
        });
    }
  }

  public editarPerfil() {
    this.showLoader();

    let request = {
      descricao: this.nomePerfil,
      funcionalidade: this.dataSource2.data,
      idPerfil: this.idPerfil
    }

    this.perfilService.editPerfil(request).subscribe(x => {
      this.hideLoader();
      openSnackBar(this.translate.instant('snackBar.editPerfil'), this._snackBar);
      this.dataSource2 = [];
      this.router.navigate(['/perfil/'], { skipLocationChange: true });

    },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public submitPerfil() {
    this.submittedTry = true;
  }

  public cancelar() {
    this.router.navigate(['/perfil/'], { skipLocationChange: true });
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
