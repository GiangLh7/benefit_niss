import { BrowserModule } from '@angular/platform-browser';
import { ChartsModule } from 'ng2-charts';
import { DEFAULT_CURRENCY_CODE, LOCALE_ID, NgModule} from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { LoginService } from './services/login.service';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import { TrabalhadoresComponent } from './trabalhadores/trabalhadores.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TrabalhadoresService } from './services/trabalhadores.service';
import { UtilizadoresServices } from './services/utilizadores.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EntidadeEmpregadoraComponent } from './entidadeEmpregadora/entidadeEmpregadora.component';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxSpinnerModule } from "ngx-spinner";
import { VincularTrabalhadorComponent } from './vincular-trabalhador/vincular-trabalhador.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from "@angular/common";
import { DialogComponent } from './componentes/dialog/dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatSnackBarModule } from '@angular/material/snack-bar';
import { PopUpVincularTrabalhadorComponent } from './pop-up-vincular-trabalhador/pop-up-vincular-trabalhador.component';
import { PopUpAdicionarEditarMoradaComponent } from './pop-up-adicionar-editar-morada/pop-up-adicionar-editar-morada.component';
import { PopUpAdicionarEditarContatoComponent } from './pop-up-adicionar-editar-contato/pop-up-adicionar-editar-contato.component';
import { NgxMatFileInputModule } from '@angular-material-components/file-input';
import { DatePickerComponent } from './componentes/date-picker/date-picker.component';
import { HttpInterceptorService } from './services/httpInterceptor.service';
import { NovoTrabalhadorComponent } from './novo-trabalhador/novo-trabalhador.component';
import { MatRadioModule } from '@angular/material/radio';
import { NovoResponsavelLegalComponent } from './novo-responsavelLegal/novo-responsavelLegal.component';
import { PopUpDesvincularTrabalhadorComponent } from './pop-up-desvincular-trabalhador/pop-up-desvincular-trabalhador.component';
import { EditarResponsavelLegalComponent } from './editar-responsavelLegal/editar-responsavelLegal.component';
import { PopUpWarningComponent } from './componentes/pop-up-warning/pop-up-warning.component';
import { RegistoSuspensaoComponent } from './registoSuspensao/registoSuspensao.component';
import { ContaCorrenteComponent } from './conta_corrente/conta_corrente.component';
import { PopUpNissFacultativoComponent } from './pop-up-NISSFacultativo/pop-up-NISSFacultativo.component';
import { PopUpAdicionarEditarDocumentoComponent } from './pop-up-adicionar-editar-documento/pop-up-adicionar-editar-documento.component';
import { DeclaracaoRemuneracaoComponent } from './declaracao-remuneracao/declaracao-remuneracao.component';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { NgxCurrencyModule } from "ngx-currency";
import '@angular/common/locales/global/pt';
import { PopUpResumoDeclaracaoComponent } from './pop-up-resumo-declaracao/pop-up-resumo-declaracao.component';
import 'chartjs-plugin-labels';
import { GuiaPagamentoComponent } from './guia-pagamento/guia-pagamento.component';
import { PopUpComprovativoPagamentoComponent } from './pop-up-comprovativo-pagamento/pop-up-comprovativo-pagamento.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PopUpInfoLegalRemuneracaoComponent } from './pop-up-info-legal-remuneracao/pop-up-info-legal-remuneracao.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
  }

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    TrabalhadoresComponent,
    EntidadeEmpregadoraComponent,
    VincularTrabalhadorComponent,
    DialogComponent,
    PopUpVincularTrabalhadorComponent,
    PopUpDesvincularTrabalhadorComponent,
    PopUpAdicionarEditarMoradaComponent,
    PopUpAdicionarEditarContatoComponent,
    PopUpAdicionarEditarDocumentoComponent,
    DatePickerComponent,
    NovoTrabalhadorComponent,
    NovoResponsavelLegalComponent,
    EditarResponsavelLegalComponent,
    PopUpWarningComponent,
    RegistoSuspensaoComponent,
    ContaCorrenteComponent,
    PopUpNissFacultativoComponent,
    DeclaracaoRemuneracaoComponent,
    RecoverPasswordComponent,
    PopUpResumoDeclaracaoComponent,
    GuiaPagamentoComponent,
    PopUpComprovativoPagamentoComponent,
    PopUpInfoLegalRemuneracaoComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MatNativeDateModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatInputModule,
    FontAwesomeModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    NgxSpinnerModule,
    MatDialogModule,
    MatCheckboxModule,
    NgxMatFileInputModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatMomentDateModule,
    NgxCurrencyModule,
    ChartsModule,
    PdfViewerModule,
    TranslateModule.forRoot({
      loader: {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpClient]
      }
      }),
  ],
  providers: [
    LoginService,
    TrabalhadoresService,
    UtilizadoresServices,
    DatePipe,
    DecimalPipe,
    CurrencyPipe,
    { provide: LOCALE_ID, useValue: 'pt-TL'},
    { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {useUtc: true} }
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    DialogComponent
  ]
})
export class AppModule { }
