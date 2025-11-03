import { Component, EventEmitter, Inject, Output } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from "ngx-spinner";

export interface ExcelImporterPopupDestinatarioData {
  Total: number;
  Success: number;
  Fail: number;
  Existing: number;
  TotalAmount: number;
  MissingFields: string[];
  InvalidIBAN: string[];
  InvalidAccountNumber: string[];
  DiffNissAndTinEntities: string[];
  DiffNissAndTinWorkers: string[];
  AmountHigherThanZero: string[];
}

@Component({
  selector: 'app-excel-importer-popup-destinatarios',
  templateUrl: 'excel-importer-popup-destinatarios.component.html',
  styleUrls: ['./excel-importer-popup-destinatarios.component.css']
})
export class ExcelImporterPopupDestinatarioComponent {
  @Output() click = new EventEmitter();
  constructor(
    public dialogRef: MatDialogRef<ExcelImporterPopupDestinatarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExcelImporterPopupDestinatarioData,
    public translate: TranslateService,
  ) {
  }
}
