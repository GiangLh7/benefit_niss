import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BenefitHomeComponent } from './benefit-home/benefit-home.component';

const routes: Routes = [
  {
    path: '',
    component: BenefitHomeComponent,
    children: [
      {
        path: '',
        redirectTo: 'citizen-record',
        pathMatch: 'full'
      },
      {
        path: 'citizen-record',
        component: BenefitHomeComponent
      },
      {
        path: 'non-contribution',
        component: BenefitHomeComponent
      },
      {
        path: 'contribution-scheme',
        component: BenefitHomeComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BenefitRoutingModule { }

