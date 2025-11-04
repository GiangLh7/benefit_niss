import { Component, Input, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { DatePipe } from '@angular/common'
import { formatDate } from '../../utils';
import { MatDatepicker } from '@angular/material/datepicker';
import { TranslateService } from '@ngx-translate/core';

@Component({
  standalone: false,
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css'],
  encapsulation : ViewEncapsulation.None,
})
export class DatePickerComponent implements OnInit {
  public faTimesCircle = faTimesCircle;
  @Output() dateChange: EventEmitter<Date | undefined> = new EventEmitter<Date | undefined>();
  public _date?: Date;
  public _max?: Date;
  public _min?: Date;
  public _clear?: boolean = true;
  @Input()
  set date(val: Date | undefined) {
    this.dateFormated = formatDate(this.datepipe, val);
    this._date = val;
    this.dateChange.emit(val);
  }
  get date() {
    return this._date;
  }

  @Input()
  set clear(val: boolean | undefined) {
    if(val === undefined)
      this._clear = true;
    else
      this._clear = val;
  }
  get clear() {
    return this._clear;
  }

  @Input()
  set max(val: Date | undefined) {
      this._max = val;
  }
  get max() {
    return this._max;
  }

  @Input()
  set min(val: Date | undefined) {
      this._min = val;
  }
  get min() {
    return this._min;
  }

  @Output() dateSetEvent = new EventEmitter();

  public dateFormated?: string;


  constructor(private datepipe: DatePipe,
              public translate: TranslateService) {
   }

  ngOnInit(): void {
    this.dateFormated = formatDate(this.datepipe, this.date);
  }

  clearDate()
  {
    this.date=undefined;
    this.dateFormated=undefined;
    this.dateSetEvent.emit();
  }

  chosenYearHandler(normalizedYear: any) {
    this.date = normalizedYear;
    this.dateFormated = formatDate(this.datepipe, this.date);
  }

  chosenMonthHandler(normalizedMonth: any, datepicker: MatDatepicker<any>) {
    this.date = normalizedMonth;
    this.dateFormated = formatDate(this.datepipe, this.date);
    this.dateSetEvent.emit();
    datepicker.close();
  }

  formatDate(date: Date) : string
  {
    return formatDate(this.datepipe, date);
  }
}
