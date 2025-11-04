import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, Output, EventEmitter, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ImporterToastsService } from 'src/app/services/importerToasts.service';
import { environment } from 'src/environments/environment';
import { ExcelImporterPopupDestinatarioComponent } from '../excel-importer/excel-importer-popups/excel-importer-popup-destinatarios/excel-importer-popup-destinatarios.component';
import { ExcelImporterPopupMovimentosComponent } from '../excel-importer/excel-importer-popups/excel-importer-popup-movimentos/excel-importer-popup-movimentos.component';

@Component({
  standalone: false,
  selector: 'importer-toast',
  templateUrl: './importer-toast.component.html',
  styleUrls: ['./importer-toast.component.css'],
  encapsulation : ViewEncapsulation.None,
})
export class ImporterToastComponent implements OnInit {

  public _id: string = '';
  @Input()
  set id(val: string) {
    this._id = val;
  }
  get id() {
    return this._id;
  }

  @ViewChild('fill') fill:ElementRef | undefined;

  private onCompleteEvent: EventEmitter<any> = new EventEmitter<any>();
  public isFinished: boolean = false;
  public type: string = '';
  public title: string = '';
  public data: any = {};
  private tries: number = 0;

  constructor(public translate: TranslateService,
    public importerToastsService: ImporterToastsService,
    private spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    private http: HttpClient) {

  }

  ngOnInit(): void {
    this.importerToastsService.onCompleteEvent$.subscribe(data => {
      this.onCompleteEvent = data[this.id];
    });
    this.importerToastsService.types$.subscribe(data => {
      this.type = data[this.id];
      switch (this.type) {
        case "1":
          this.title = 'excelImports.movimentosTitle'
          break;
        case "2":
          this.title = 'excelImports.destinatariosTitle'
          break;

        default:
          break;
      }
    });
    this.getStatus();
  }

  private getStatus() {
    this.http.get<any>(`${environment.apiImportsUrl}/${this.id}.json?t=${new Date().getTime()}`)
    .toPromise()
    .then(data => {
      (this.fill?.nativeElement).style.width = `${(data.Success + data.Fail + (data.Existing || 0)) * 100 / data.Total}%`;
      this.isFinished = data.Success + data.Fail + (data.Existing || 0) === data.Total;

      this.data = data;

      if (this.tries) this.tries = 0;

      if (this.isFinished && this.onCompleteEvent) {
        this.spinner.hide();
        this.onCompleteEvent.emit({
          id: this.id,
          data: this.data,
        });
      }
    })
    .catch(() => {
      this.tries++;
      if (this.tries == 8) {
        this.close();
      }
    })
    .finally(() => {
      if (this.tries == 8 || this.isFinished) return;
      setTimeout(() => {
        this.getStatus();
      }, 1500);
    });
  }

  public importerViewDetailsType1(data: any) {
    this.errorDialog.open(ExcelImporterPopupMovimentosComponent, {
      id: 'desvincularDialog',
      minHeight: '300px',
      width: '70%',
      height: '80%',
      panelClass: 'warningModal',
      data: data
    });
  }

  public importerViewDetailsType2(data: any) {
    const dialogRef = this.errorDialog.open(ExcelImporterPopupDestinatarioComponent, {
      id: 'desvincularDialog',
      minHeight: '300px',
      width: '70%',
      height: '80%',
      panelClass: 'warningModal',
      data: data
      });
      dialogRef.afterClosed().subscribe(() => {});
  }

  public viewDetails() {
    switch (this.type) {
      case "1":
        this.importerViewDetailsType1(this.data);
        break;
      case "2":
        this.importerViewDetailsType2(this.data);
        break;

      default:
        break;
    }
  }

  public close() {
    this.importerToastsService.remove(this.id);
  }

}
