import { Component, Input, OnInit, Output, EventEmitter, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
// import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ImporterToastsService } from 'src/app/services/importerToasts.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'importer-toasts',
  templateUrl: './importer-toasts.component.html',
  styleUrls: ['./importer-toasts.component.css'],
  encapsulation : ViewEncapsulation.None,
})
export class ImporterToastsComponent implements OnInit {

  constructor(public translate: TranslateService,
    public importerToastsService: ImporterToastsService) {
  }

  ngOnInit(): void {

  }

}
