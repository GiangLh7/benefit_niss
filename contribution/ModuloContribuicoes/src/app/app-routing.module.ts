import { VincularTrabalhadorComponent } from './vincular-trabalhador/vincular-trabalhador.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { TrabalhadoresComponent } from './trabalhadores/trabalhadores.component';
import { EntidadeEmpregadoraComponent } from './entidadeEmpregadora/entidadeEmpregadora.component';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { NovoTrabalhadorComponent } from './novo-trabalhador/novo-trabalhador.component';
import { NovoResponsavelLegalComponent } from './novo-responsavelLegal/novo-responsavelLegal.component';
import { EditarResponsavelLegalComponent } from './editar-responsavelLegal/editar-responsavelLegal.component';
import { RegistoSuspensaoComponent } from './registoSuspensao/registoSuspensao.component';
import { ContaCorrenteComponent } from './conta_corrente/conta_corrente.component';
import { DeclaracaoRemuneracaoComponent } from './declaracao-remuneracao/declaracao-remuneracao.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { GuiaPagamentoComponent } from './guia-pagamento/guia-pagamento.component';



const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent   },
  { path: 'trabalhadores', component: TrabalhadoresComponent   },
  { path: 'entidadeEmpregadora', component: EntidadeEmpregadoraComponent},
  { path: 'vincularTrabalhador', component: VincularTrabalhadorComponent},
  { path: 'novoTrabalhador', component: NovoTrabalhadorComponent},
  { path: 'novoTrabalhador/:id', component: NovoTrabalhadorComponent},
  { path: 'novoResponsavelLegal', component: NovoResponsavelLegalComponent},
  { path: 'novoResponsavelLegal/:id', component: NovoResponsavelLegalComponent},
  { path: 'editarResponsavelLegal/:id', component: EditarResponsavelLegalComponent},
  { path: 'registoSuspensao', component: RegistoSuspensaoComponent},
  { path: 'registoSuspensao/:id', component: RegistoSuspensaoComponent},
  { path: 'contaCorrente', component: ContaCorrenteComponent},
  { path: 'declaracaoRemuneracao', component: DeclaracaoRemuneracaoComponent},
  { path: 'recover/:token/:username', component: RecoverPasswordComponent},
  { path: 'firstAcess/:token', component: RecoverPasswordComponent},
  { path: 'guiaPagamento', component: GuiaPagamentoComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    bindToComponentInputs: true
  }),MatFormFieldModule,MatInputModule],
  exports: [RouterModule,MatTabsModule,MatToolbarModule,MatIconModule,MatFormFieldModule,
  MatSelectModule,MatExpansionModule,MatInputModule]
})
export class AppRoutingModule { }
