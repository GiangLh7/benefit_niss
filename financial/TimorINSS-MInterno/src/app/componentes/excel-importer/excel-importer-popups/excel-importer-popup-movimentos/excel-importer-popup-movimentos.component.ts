import { Component, EventEmitter, Inject, Output } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from "ngx-spinner";

export interface ExcelImporterPopupMovimentosData {
  Total: number;
  Success: number;
  Fail: number;
  MissingFields: number[];
}

@Component({
  selector: 'app-excel-importer-popup-movimentos',
  templateUrl: 'excel-importer-popup-movimentos.component.html',
  styleUrls: ['./excel-importer-popup-movimentos.component.css']
})
export class ExcelImporterPopupMovimentosComponent {
  @Output() click = new EventEmitter();
  constructor(
    public dialogRef: MatDialogRef<ExcelImporterPopupMovimentosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExcelImporterPopupMovimentosData,
    public translate: TranslateService,
  ) {

  }
}
