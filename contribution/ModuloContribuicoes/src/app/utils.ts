import { DatePipe, DecimalPipe } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from "@ngx-translate/core";
import { ChartOptions } from "chart.js";
import { DialogComponent } from "./componentes/dialog/dialog.component";
import { PopUpWarningComponent } from "./componentes/pop-up-warning/pop-up-warning.component";
import { SelectDescription } from "./response-models/utils-response";
import { TokenStorageService } from "./services/token-storage.service";


//format Dates
export function formatDate(pipe: DatePipe, date?: Date): string {
  let transformed = pipe.transform(date, 'MM/yyyy');
  if (transformed)
    return transformed;
  return '';
}

export function formatDatePT(pipe: DatePipe, date?: Date): string {
  let transformed = pipe.transform(date, 'dd/MM/yyyy');
  if (transformed)
    return transformed;
  return '';
}


//format decimal
export function formatDecimal(pipe: DecimalPipe, number?: number): string {
  let transformed = pipe.transform(number, '1.2-2');
  if (transformed)
    return transformed;
  return '';
}

export function openErrorsDialog(errors: string[], dialog: MatDialog) {
  return dialog.open(DialogComponent, {
    id: 'dialog',
    minHeight: '300px',
    width: '50%',
    height: '30%',
    panelClass: 'modalWithBorder',
    data: { errors: errors }
  });
}


//file comverter
export function base64ArrayBuffer(arrayBuffer: ArrayBuffer) {
  var base64 = ''
  var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

  var bytes = new Uint8Array(arrayBuffer)
  var byteLength = bytes.byteLength
  var byteRemainder = byteLength % 3
  var mainLength = byteLength - byteRemainder

  var a, b, c, d
  var chunk

  // Main loop deals with bytes in chunks of 3
  for (var i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048) >> 12 // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032) >> 6 // 4032     = (2^6 - 1) << 6
    d = chunk & 63               // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength]

    a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3) << 4 // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + '=='
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

    a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008) >> 4 // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15) << 2 // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + '='
  }

  return base64
}

//select com disabled
export interface SelectsWDisable {
  array: any[];
  disabled: boolean;
  name: string;
}

export function buildSelectOptionsWithDisabled(input: any[], ids: number[] = []) : SelectsWDisable[] | any[]
{
  let output: SelectsWDisable[] = [];
  if(input.length)
  {
    let enable = input.filter(x => x.indActivo);

    if(enable.length)
      output.push({array: enable, disabled: false, name: 'general.select_enabled'});

    let disabled = input.filter(x => x.indActivo === false && ids.includes(x.id));

    if(disabled.length)
      output.push({array: disabled, disabled: true, name: 'general.select_disabled'});
  }
  return output;
}

//miscs
export function openSnackBar(message: string, _snackBar: MatSnackBar) {
  _snackBar.open(message, '', {
    duration: 3000,
    panelClass: ['green-snackbar'],
    verticalPosition: 'top'
  });
}

export function openErrorSnackBar(message: string, _snackBar: MatSnackBar) {
  _snackBar.open(message, '', {
    duration: 5000,
    panelClass: ['red-snackbar'],
    verticalPosition: 'top',
  });
}

export function getSelectFilter(id: number = 0, lista: SelectDescription[]) {
  return lista.filter(function (e) {
    return e.parentId == id;
  });
}

export function showExpiredError(errorDialog: MatDialog, tokenStorage: TokenStorageService, translate: TranslateService) {
  translate.get('error.expired').subscribe((translated: string) => {
    const dialogRef = errorDialog.open(PopUpWarningComponent, {
        id: 'desvincularDialog',
        minHeight: '300px',
        width: '40%',
        height: '30%',
        panelClass: 'warningModal',
        data: { msg: translated, noGenericMsg: true }
    });
    dialogRef.afterClosed().subscribe(() => {
        tokenStorage.signOut();
        window.location.reload();
    });
  });
}

export enum RegexPatterns {
  emailPattern = "(?:[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])",
  phonelPattern = "^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$",
  intPattern = "[0-9]*",
  idNoPattern = "^[A-Za-z0-9]+$",
  intAndHalfPattern = "[0-9]*(,5|,0)?",
  decimal2Cases = "[0-9]*(.[0-9][0-9]?)?",
  passwordPattern = "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@#!%*?&])[A-Za-z\\d$@#!%*?&].{8,}"
}


export function focusCurrency(event: any)
{
  var el = event.target;
  el.selectionStart = el.selectionEnd = el.value.length;
}

export const customCurrencyMaskConfig = { prefix: '$', thousands: '.', decimal: ',' };

export function  getContrast(rgb: number[]){
	// Get YIQ ratio
	var yiq = ((rgb[0] * 299) + (rgb[1] * 587) + (rgb[2] * 114)) / 1000;

	// Check contrast
	return (yiq >= 128) ? 'black' : 'white';

};

export function populateChartColors(chartColors: any[], chartOptionsArray: ChartOptions[], numberColors: number)
{
  chartColors[0].backgroundColor = [];
  chartOptionsArray.forEach(chartOptions => {
    if(chartOptions.plugins)
      chartOptions.plugins.labels.fontColor = [];
  });
  for(let i = 0; i < numberColors; i++)
  {
    var randomColor = require('random-color');
    let color = randomColor(0.7, 0.99);
    let colorString = 'rgba(' + color.values.rgb + ',' + color.values.alpha + ')';
    chartColors[0].backgroundColor.push(colorString);
    chartOptionsArray.forEach(chartOptions => {
      chartOptions.plugins?.labels.fontColor.push(getContrast(color.values.rgb));
    });
  }
}

export function formataCurrency(value: any): string
{
  let result = '';

  var formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'USD',
    useGrouping: true,
  });

  if(value !== undefined)
    result = formatter.formatToParts(value).map(({type, value}) => {
    switch (type) {
      case 'currency': return '$';
      default : return value;
    }
  }).reduce((string, part) => string + part);

  return result;
}

export function base64ToArrayBuffer(str: string) {
  var binary_string = window.atob(str);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

export function blobToSaveAs(documentStr: string, documentName: string) {
  const arrayBuffer = base64ToArrayBuffer(documentStr);
  const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  if (link.download !== undefined) { // feature detection
    link.setAttribute('href', url);
    link.setAttribute('download', documentName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function getCurrentDateUTC(): Date
{
  var date = new Date();
  var utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  return utcDate;
}
