import { SelectionModel } from "@angular/cdk/collections";
import { Component, Inject, OnInit } from "@angular/core";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { faFilePdf, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { TranslateService } from "@ngx-translate/core";
import { NgxSpinnerService } from "ngx-spinner";
import { ComponenteReceitaConfig } from "src/app/models/componenteReceitaConfig";
import { MovimentosConciliados, MovimentosPorConciliar } from "src/app/models/movimentosBancarios";
import { GetValoresDespesaByIdCodigoOrcamentoRequest } from "src/app/request-models/componenteDespesaRegisto-request";
import { FilterRequest } from "src/app/request-models/utils-request";
import { movimentosBancariosService } from "src/app/services/movimentosBancarios.service";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { base64ToArrayBuffer, openErrorsDialog, showExpiredError } from "src/app/utils";



export interface PopUpExecutarPagamentosData {
    componenteReceitaConfig: ComponenteReceitaConfig;
    listaMovimentosSelecionados: MovimentosConciliados[];
    editar: boolean;
}

@Component({
  standalone: false,
    selector: 'pop-up-selecionar_valores',
    templateUrl: './pop-up-selecionar_valores.component.html',
    styleUrls: ['./pop-up-selecionar_valores.component.css']
})
export class PopUpSelecionarValoresParaRegistoComponent {
    public errors: string[] = [];
    public filterBy = '';
    public faTimesCircle = faTimesCircle;
    public faFilePdf = faFilePdf;

    public dataSourceMovimentos: MovimentosConciliados[] = [];
    public displayedColumnsMovimentos: string[] = ['descricao', 'documentoAssociado', 'comprovativo', 'valor', 'selecao'];
    public totalRows: number = 0;
    public pageSize = 20;
    public pageIndex = 0;

    public selection = new SelectionModel<MovimentosConciliados>(true, []);
    public totalMovimentosSeleccionados: number = 0;

    constructor(
        private router: Router,
        public spinner: NgxSpinnerService,
        public errorDialog: MatDialog,
        public translate: TranslateService,
        private tokenStorage: TokenStorageService,
        public _snackBar: MatSnackBar,
        public movimentosService: movimentosBancariosService,
        public dialogRef: MatDialogRef<PopUpSelecionarValoresParaRegistoComponent>,
        @Inject(MAT_DIALOG_DATA) public data: PopUpExecutarPagamentosData
    ) {
    }

    ngOnInit(): void {

        if (!this.tokenStorage.getToken()) {
            this.router.navigate([''])
        }
        else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired()) {

            //obter movimentos conciliados
            this.getMovimentosConciliados();

        }
        else {
            showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
        }

    }


    public getMovimentosConciliados() {
        if (!this.data.editar) {
            this.showLoader();
            this.dataSourceMovimentos = [];
            this.totalMovimentosSeleccionados = 0;

            let filterRequest: FilterRequest;
            filterRequest = {};
            filterRequest.index = this.pageIndex;
            filterRequest.rows = this.pageSize;
            filterRequest.filterBy = this.filterBy;

            let request = {
                filter: filterRequest
            }

            this.movimentosService.GetMovimentosConciliados(request).subscribe(x => {
                x.rows == null ? this.totalRows = 0 : this.totalRows = x.rows;
                x.movimentos == null ? this.dataSourceMovimentos = [] : this.dataSourceMovimentos = x.movimentos;
                this.dataSourceMovimentos.sort;

                if (this.data.listaMovimentosSelecionados != null && this.data.listaMovimentosSelecionados.length > 0) {

                    this.data.listaMovimentosSelecionados.forEach(row => {
                        this.dataSourceMovimentos.forEach(element => {
                            if (element.id === row.id) {
                                this.selection.select(row);
                                element.checked = true;
                                this.totalMovimentosSeleccionados = this.totalMovimentosSeleccionados + element.valor;
                            }
                        });
                    });

                }
                else if (this.selection.selected != null && this.selection.selected.length > 0) {
                    this.selection.selected.forEach(row => {
                        this.dataSourceMovimentos.forEach(element => {
                            if (element.id === row.id) {
                                element.checked = true;
                                this.totalMovimentosSeleccionados = this.totalMovimentosSeleccionados + element.valor;
                            }
                        });
                    });

                }

                this.hideLoader();
            },
                err => {
                    this.hideLoader();
                    err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
                    this.showError();
                });
        }
        else {
            this.dataSourceMovimentos = [];
            this.dataSourceMovimentos = [...this.data.listaMovimentosSelecionados];
            this.dataSourceMovimentos[0].checked = true;
            this.totalMovimentosSeleccionados = this.dataSourceMovimentos[0].valor;
            this.selection.toggle(this.data.listaMovimentosSelecionados[0]);
        }
    }

    public pesquisarMovimentos() {
        this.getMovimentosConciliados();

    }

    public clearPesquisarMovimentos() {
        this.filterBy = '';
        this.getMovimentosConciliados();
    }


    public updateTable(event: any) {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.showLoader();
        this.getMovimentosConciliados();
    }

    public openPdf(element: MovimentosConciliados) {
        // Open PDF document in browser's new tab
        const arrayBuffer = base64ToArrayBuffer(element.comprovativo);
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        window.open(URL.createObjectURL(blob));
    }

    public selectHandler(row: MovimentosConciliados) {

        if (row.checked) {
            this.totalMovimentosSeleccionados = this.totalMovimentosSeleccionados - row.valor;
            var index = this.selection.selected.findIndex(x => x.id == row.id);
            if (index >= 0) {
                this.selection.selected.splice(index, 1);
              }
            row.checked = false;
        }
        else {
            this.totalMovimentosSeleccionados = this.totalMovimentosSeleccionados + row.valor;
            row.checked = true;
            this.selection.selected.push(row);
        }
    }

    /** Whether the number of selected elements matches the total number of rows. */
    public isAllSelected() {
        const numSelected = this.selection.selected.filter(x => this.dataSourceMovimentos.find(y => y.id == x.id)).length;
        const numRows = this.dataSourceMovimentos.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    public masterToggle() {
        this.totalMovimentosSeleccionados = 0;

        if (this.isAllSelected()) {
            this.selection.clear();
            this.dataSourceMovimentos.forEach(row => {
                row.checked = false;
            });

        }
        else {
            this.dataSourceMovimentos.forEach(row => {
                this.selection.select(row);
                row.checked = true;
                this.totalMovimentosSeleccionados = this.totalMovimentosSeleccionados + row.valor;
            });
        }


    }

    // Show all selected
    public mostrarSelecionados() {
        let selected = [...this.selection.selected];
        let dataSourceMovimentosOrdernado: MovimentosConciliados[] = selected;

        if (dataSourceMovimentosOrdernado != null && dataSourceMovimentosOrdernado.length > 0) {
            this.dataSourceMovimentos.forEach(row => {
                if (dataSourceMovimentosOrdernado.findIndex(x => x.id == row.id) == -1) {
                    dataSourceMovimentosOrdernado.push(row);
                }
            });
            this.dataSourceMovimentos = [...dataSourceMovimentosOrdernado]
        }
    }

    public closePopUp(): void {
        this.dialogRef.close(this.selection.selected);
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